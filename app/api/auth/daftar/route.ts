// POST /api/auth/daftar: pendaftaran orang tua/wali + satu anak (halaman /daftar). Kontrak: lib/kontrak/auth.ts.
//   1. Validasi isian (zod) + nomor WhatsApp Indonesia; email belum terdaftar.
//   2. Satu transaksi: USERS (pendamping) + ANAK + PENDAMPINGAN. Password dan PIN disimpan sebagai hash bcrypt.
//   3. PIN pendamping DIBUAT SISTEM (6 angka acak kriptografis) lalu dikirim ke WhatsApp lewat Fonnte (lib/wa).
//      Jika WhatsApp gagal, PIN dikembalikan sekali di respons supaya akun tetap bisa dipakai.
//   4. Langsung masuk (sesi), lalu layar pilih profil.
// Tidak menyimpan diagnosis/obat (PANDUAN 12). Fase pengobatan awal "pemeliharaan", diubah di dashboard pendamping.
// Kelas terakhir sementara = kelas seharusnya - 1, lalu diganti pilihan kelas saat asesmen pertama.

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { normalisasiNoWa, samarkanNoWa } from "@/lib/auth/daftar";
import { masuk } from "@/lib/auth/sesi";
import { denganTransaksi, query } from "@/lib/db";
import { PermintaanDaftar, type ResponsDaftar } from "@/lib/kontrak/auth";
import { catatAktivitas } from "@/lib/log";
import { kirimWhatsApp } from "@/lib/wa/kirim";

const BCRYPT_ROUNDS = 10; // biaya hash bcrypt (keamanan), sama dengan seed
const FASE_AWAL = "pemeliharaan"; // keputusan tim: tidak ditanya saat daftar, diubah orang tua di pengaturan kesehatan

export const POST = tanganiApi(async (req: Request) => {
  const d = await bacaBody(req, PermintaanDaftar);
  const noWa = normalisasiNoWa(d.no_wa);
  if (!noWa) throw new GalatApi("INPUT_TIDAK_VALID", "Nomor WhatsApp belum benar. Contoh: 0812 3456 7890.");
  const ada = await query<{ id: number }[]>("SELECT id FROM users WHERE email = ?", [d.email]);
  if (ada[0]) throw new GalatApi("BENTROK", "Email ini sudah terdaftar. Silakan masuk.");

  const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const [hashPassword, hashPin] = await Promise.all([bcrypt.hash(d.password, BCRYPT_ROUNDS), bcrypt.hash(pin, BCRYPT_ROUNDS)]);

  const userId = await denganTransaksi(async (kueri) => {
    const user = await kueri<{ insertId: number }>(
      "INSERT INTO users (nama, email, no_hp, password_hash, pin_pendamping_hash, role) VALUES (?, ?, ?, ?, ?, 'pendamping')",
      [d.nama, d.email, noWa, hashPassword, hashPin],
    );
    const anak = await kueri<{ insertId: number }>(
      `INSERT INTO anak (nama_panggilan, tgl_lahir, kelas_terakhir, kelas_seharusnya, tgl_berhenti_sekolah, asal_sekolah, fase_pengobatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        d.anak.nama_panggilan,
        d.anak.tgl_lahir,
        Math.max(1, d.anak.kelas_seharusnya - 1),
        d.anak.kelas_seharusnya,
        d.anak.tgl_berhenti_sekolah ?? null,
        d.anak.asal_sekolah || null,
        FASE_AWAL,
      ],
    );
    await kueri("INSERT INTO pendampingan (pendamping_id, anak_id, hubungan) VALUES (?, ?, ?)", [user.insertId, anak.insertId, d.hubungan]);
    return user.insertId;
  });

  const wa = await kirimWhatsApp(
    noWa,
    [
      `Halo ${d.nama}, selamat datang di PELITA!`,
      ``,
      `PIN pendamping kamu: *${pin}*`,
      ``,
      `PIN ini dipakai untuk masuk ke mode pendamping dari mode anak. Simpan baik-baik dan jangan bagikan ke anak.`,
    ].join("\n"),
  );
  if (!wa.terkirim) console.error("PIN pendaftaran tidak terkirim lewat WhatsApp:", wa.alasan);

  await masuk({ id: userId, role: "pendamping" });
  await catatAktivitas({ user_id: userId, jenis_tindakan: "daftar", entitas: "users", entitas_id: userId, detail: { pin_terkirim_wa: wa.terkirim } });

  const respons: ResponsDaftar = { nama: d.nama, no_wa_tersamar: samarkanNoWa(noWa), pin_terkirim_wa: wa.terkirim, pin: wa.terkirim ? null : pin };
  return Response.json(respons);
});
