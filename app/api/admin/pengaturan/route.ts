// GET  /api/admin/pengaturan[?kunci=...]: semua pengaturan aktif + rentang aman [+ riwayat versi satu kunci].
// POST /api/admin/pengaturan: ubah nilai (wajib alasan) atau kembalikan ke versi sebelumnya (PANDUAN 8.4, PRD 9.11).
//   - Rentang aman & kombinasi tidak logis divalidasi DI SERVER (lib/pengaturan/rentang.ts).
//   - Setiap perubahan = versi baru + tercatat di LOG_AKTIVITAS (nilai lama, nilai baru, siapa, kapan, alasan).
//   - Berlaku untuk sesi/asesmen BARU; asesmen yang berjalan tetap memakai versi saat ia dimulai.
// Kontrak: lib/kontrak/admin.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { wajibAdmin } from "@/lib/db/rbac";
import { PermintaanPengaturan, type ItemPengaturan, type ResponsPengaturan } from "@/lib/kontrak/admin";
import {
  ambilPengaturanAktif,
  ambilPengaturanAktifLengkap,
  ambilRiwayatKunci,
  ambilVersiSebelumnya,
  simpanVersiBaru,
} from "@/lib/pengaturan";
import { KETERANGAN, RENTANG_AMAN, validasiPengaturan } from "@/lib/pengaturan/rentang";

async function daftarPengaturan(): Promise<ItemPengaturan[]> {
  const aktif = await ambilPengaturanAktifLengkap();
  return aktif.map((p) => {
    const r = RENTANG_AMAN[p.kunci];
    return {
      kunci: p.kunci,
      label: r?.label ?? null,
      keterangan: KETERANGAN[p.kunci] ?? null,
      nilai: p.nilai,
      versi: p.versi,
      alasan: p.alasan,
      diubah_at: p.diubah_at.toISOString(),
      rentang: r ? { jenis: r.jenis, ...(r.jenis === "angka" ? { min: r.min, maks: r.maks } : {}) } : null,
      bisa_dikembalikan: r !== undefined && p.versi > 1,
    };
  });
}

export const GET = tanganiApi(async (req: Request) => {
  await wajibAdmin();
  const kunci = new URL(req.url).searchParams.get("kunci");
  const respons: ResponsPengaturan = { pengaturan: await daftarPengaturan() };
  if (kunci) {
    respons.riwayat = (await ambilRiwayatKunci(kunci)).map((r) => ({ ...r, diubah_at: r.diubah_at.toISOString() }));
  }
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibAdmin();
  const minta = await bacaBody(req, PermintaanPengaturan);

  let nilaiBaru: unknown;
  let alasan = minta.alasan;
  if (minta.aksi === "ubah") {
    nilaiBaru = minta.nilai;
  } else {
    const sebelumnya = await ambilVersiSebelumnya(minta.kunci);
    if (!sebelumnya) throw new GalatApi("BENTROK", "Belum ada versi sebelumnya untuk pengaturan ini.");
    nilaiBaru = sebelumnya.nilai;
    alasan = `Kembalikan ke versi ${sebelumnya.versi}: ${minta.alasan}`;
  }

  const galat = validasiPengaturan(minta.kunci, nilaiBaru, await ambilPengaturanAktif());
  if (galat) throw new GalatApi("INPUT_TIDAK_VALID", galat);

  await simpanVersiBaru({ kunci: minta.kunci, nilai: nilaiBaru, alasan, user_id: sesi.user_id });
  const respons: ResponsPengaturan = { pengaturan: await daftarPengaturan() };
  return Response.json(respons);
});
