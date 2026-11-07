// GET  /api/admin/soal?tp_kode=&penggunaan=: bank soal TERBIT (yang dipakai anak) + statistik + status generator.
// POST /api/admin/soal:
//   - hapus: soal yang tidak relevan ditarik (status 'ditolak' + alasan), tidak pernah dipakai lagi untuk anak.
//     Tidak dihapus dari database karena jawaban anak yang lama masih merujuk ke soal ini (riwayat asesmen/sesi).
//   - buat_sekarang: jalankan generator soal AI untuk semua TP sekarang (tanpa menunggu jadwal mingguan).
// Keputusan tim: tidak ada antrean tinjauan; soal AI terbit otomatis jika lolos pemeriksaan (lib/ai/generator-soal.ts).
// Kontrak: lib/kontrak/admin.ts

import { jalankanGenerator, statusGenerator } from "@/lib/ai/generator-soal";
import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { wajibAdmin } from "@/lib/db/rbac";
import { daftarSoalAdmin, daftarTpAdmin } from "@/lib/db/soal";
import { FilterSoal, PermintaanSoal, type ResponsSoal } from "@/lib/kontrak/admin";
import { catatAktivitas } from "@/lib/log";

async function isiHalaman(filter: { tp_kode?: string; penggunaan?: "diagnostik" | "formatif" | "santai" } = {}): Promise<ResponsSoal> {
  const [soal, daftar_tp, generator] = await Promise.all([daftarSoalAdmin({ ...filter, status: "terbit" }), daftarTpAdmin(), statusGenerator()]);
  return { soal, daftar_tp, generator };
}

export const GET = tanganiApi(async (req: Request) => {
  await wajibAdmin();
  const filter = FilterSoal.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!filter.success) throw new GalatApi("INPUT_TIDAK_VALID", "Filter tidak valid.");
  return Response.json(await isiHalaman({ tp_kode: filter.data.tp_kode, penggunaan: filter.data.penggunaan }));
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibAdmin();
  const minta = await bacaBody(req, PermintaanSoal);

  if (minta.aksi === "buat_sekarang") {
    const hasil = await jalankanGenerator({ alasan: "manual", user_id: sesi.user_id });
    return Response.json({ ...(await isiHalaman()), hasil_generator: hasil } satisfies ResponsSoal);
  }

  const soal = (await query<{ status: string }[]>("SELECT status FROM soal WHERE id = ?", [minta.soal_id]))[0];
  if (!soal || soal.status !== "terbit") throw new GalatApi("TIDAK_DITEMUKAN", "Soal tidak ditemukan atau sudah dihapus.");
  await query("UPDATE soal SET status = 'ditolak', alasan_penolakan = ?, ditinjau_oleh = ? WHERE id = ?", [
    `Dihapus admin: ${minta.alasan}`,
    sesi.user_id,
    minta.soal_id,
  ]);
  await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "hapus_soal", entitas: "soal", entitas_id: minta.soal_id, detail: { alasan: minta.alasan } });
  return Response.json(await isiHalaman());
});
