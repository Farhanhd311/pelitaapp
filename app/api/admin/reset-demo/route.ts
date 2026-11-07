// POST /api/admin/reset-demo: kembalikan data demo Raka sebelum naik panggung (PANDUAN 5 A9, ARSITEKTUR 8 no. 3).
//   Tetap ada : profil Raka, Ibu Sari, Kak Dina; riwayat check-in 3-4 minggu (3 hari terakhir lemas);
//               satu skrining + satu rujukan menunggu persetujuan.
//   Dikosongkan: progres TP Raka, sesi & jawaban (asesmen bisa diputar ulang), LOG_AI Raka + penilaiannya.
//   LOG_AKTIVITAS TIDAK dihapus: log hanya bisa ditambah (PANDUAN 8.7). Reset ini sendiri ikut dicatat.
//   Juga melengkapi data awal yang belum ada di database (kunci pengaturan baru, layanan dukungan, konten contoh)
//   tanpa mengubah data yang sudah ada dan tanpa menjalankan seed.
// Kontrak: lib/kontrak/admin.ts

import demo from "@/data/seed_demo_raka.json";
import seedLayanan from "@/data/seed_layanan_dukungan.json";
import { GalatApi, tanganiApi } from "@/lib/api/respons";
import { denganTransaksi, query } from "@/lib/db";
import { geserTanggal, tanggalLokal } from "@/lib/db/anak";
import { wajibAdmin } from "@/lib/db/rbac";
import type { ResponsResetDemo } from "@/lib/kontrak/admin";
import { catatAktivitas } from "@/lib/log";
import { ambilPengaturanAktif, lengkapiPengaturanAwal } from "@/lib/pengaturan";

export const POST = tanganiApi(async () => {
  const sesi = await wajibAdmin();
  const pengaturanDitambah = await lengkapiPengaturanAwal();
  const atur = await ambilPengaturanAktif();
  const kodeKebutuhan = atur["rujukan.kode_kebutuhan"] as Record<string, number>;
  const aturanLevel = atur["rujukan.aturan_level"] as { level: number; rujukan: string }[];

  const anak = await query<{ id: number }[]>("SELECT id FROM anak WHERE nama_panggilan = ? ORDER BY id LIMIT 1", [demo.nama_panggilan]);
  if (!anak[0]) throw new GalatApi("TIDAK_DITEMUKAN", `Profil demo ${demo.nama_panggilan} tidak ditemukan. Jalankan seed awal dulu.`);
  const anakId = anak[0].id;
  const hariIni = tanggalLokal();

  const ringkasan = await denganTransaksi(async (kueri) => {
    // ---- Lengkapi data awal yang belum ada (tidak mengubah yang sudah ada).
    for (const l of seedLayanan.layanan) {
      const ada = await kueri<{ id: number }[]>("SELECT id FROM layanan_dukungan WHERE LOWER(nama) = LOWER(?)", [l.nama]);
      if (!ada[0]) await kueri("INSERT INTO layanan_dukungan (nama, jenis, kontak) VALUES (?, ?, ?)", [l.nama, l.jenis, l.kontak]);
    }
    for (const k of demo.konten_contoh) {
      const ada = await kueri<{ id: number }[]>("SELECT id FROM konten WHERE tp_kode = ? AND jenis = ?", [k.tp_kode, k.jenis]);
      if (!ada[0]) {
        await kueri("INSERT INTO konten (tp_kode, jenis, format, durasi_menit, butuh_layar, url) VALUES (?, ?, ?, ?, ?, ?)", [
          k.tp_kode, k.jenis, k.format, k.durasi_menit, k.butuh_layar ? 1 : 0, k.url,
        ]);
      }
    }

    // ---- Kosongkan data proses Raka (urutan mengikuti foreign key).
    await kueri("DELETE j FROM jawaban j JOIN sesi s ON s.id = j.sesi_id WHERE s.anak_id = ?", [anakId]);
    await kueri("DELETE FROM sesi WHERE anak_id = ?", [anakId]);
    await kueri("DELETE FROM progres_tp WHERE anak_id = ?", [anakId]);
    await kueri("DELETE r FROM rujukan r JOIN skrining s ON s.id = r.skrining_id WHERE s.anak_id = ?", [anakId]);
    await kueri("DELETE FROM skrining WHERE anak_id = ?", [anakId]);
    await kueri("DELETE FROM checkin WHERE anak_id = ?", [anakId]);
    await kueri("DELETE FROM log_ai WHERE anak_id = ?", [anakId]); // umpan_balik_ai ikut terhapus (ON DELETE CASCADE)

    // ---- Kembalikan profil dan isi ulang data demo.
    await kueri("UPDATE anak SET fase_pengobatan = ?, mode_jeda = ?, batas_layar_menit = ? WHERE id = ?", [
      demo.profil.fase_pengobatan, demo.profil.mode_jeda ? 1 : 0, demo.profil.batas_layar_menit, anakId,
    ]);
    for (const c of demo.riwayat_checkin) {
      await kueri("INSERT INTO checkin (anak_id, tanggal, energi, cuaca_hati, keluhan) VALUES (?, ?, ?, ?, ?)", [
        anakId, geserTanggal(hariIni, -c.hari_lalu), c.energi, c.cuaca_hati, c.keluhan.length > 0 ? c.keluhan.join(",") : null,
      ]);
    }
    for (const s of demo.skrining) {
      const level = kodeKebutuhan[s.kebutuhan] ?? null;
      const waktu = new Date(Date.now() - s.hari_lalu * 24 * 60 * 60 * 1000);
      const hasil = await kueri<{ insertId: number }>(
        "INSERT INTO skrining (anak_id, waktu, perasaan, sumber, kebutuhan, level, sinyal_krisis) VALUES (?, ?, ?, ?, ?, ?, 0)",
        [anakId, waktu, s.perasaan, s.sumber, s.kebutuhan, level],
      );
      const namaLayanan = aturanLevel.find((a) => a.level === level)?.rujukan;
      if (s.rujukan_menunggu && namaLayanan) {
        const layanan = await kueri<{ id: number }[]>("SELECT id FROM layanan_dukungan WHERE LOWER(nama) = LOWER(?)", [namaLayanan]);
        await kueri("INSERT INTO rujukan (skrining_id, layanan_id, status) VALUES (?, ?, 'menunggu_persetujuan')", [
          hasil.insertId, layanan[0]?.id ?? null,
        ]);
      }
    }
    return { checkin: demo.riwayat_checkin.length, skrining: demo.skrining.length, konten_contoh: demo.konten_contoh.length };
  });

  await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "reset_demo", entitas: "anak", entitas_id: anakId, detail: { pengaturan_ditambah: pengaturanDitambah } });
  const respons: ResponsResetDemo = { berhasil: true, pengaturan_ditambah: pengaturanDitambah, ringkasan };
  return Response.json(respons);
});
