// GET  /api/admin/materi: semua mapel dan TP untuk ditinjau (prasyarat, jumlah soal, kartu belajar, materi pemakai).
// POST /api/admin/materi: import TP dari file JSON berformat data/data_awal_*.json.
//   - aksi "pratinjau": hanya menghitung apa yang baru/berubah dan memeriksa galat (tidak menulis apa pun).
//   - aksi "terapkan": menulis perubahan, lalu generator AI membuat soal untuk TP yang baru atau berubah
//     (termasuk soal asesmen untuk TP baru di mapel adaptif, supaya asesmen tidak kehabisan soal).
// Kontrak: lib/kontrak/materi.ts. Logika pembanding: lib/kurikulum/impor-tp.ts (fungsi murni, dites).

import dataMateri from "@/data/data_materi_per_kelas_SD.json";
import { jalankanGenerator } from "@/lib/ai/generator-soal";
import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { ambilDaftarMapel } from "@/lib/db/anak";
import { daftarTpReview, keadaanTpUntukImpor, terapkanImporTp } from "@/lib/db/materi";
import { wajibAdmin } from "@/lib/db/rbac";
import { PermintaanImporTp, type ResponsImporTp, type ResponsMateriAdmin } from "@/lib/kontrak/materi";
import { rencanakanImporTp, SkemaFileTp } from "@/lib/kurikulum/impor-tp";
import { catatAktivitas } from "@/lib/log";

export const GET = tanganiApi(async () => {
  await wajibAdmin();
  const [mapel, tp] = await Promise.all([ambilDaftarMapel(), daftarTpReview()]);
  // Jenis mapel (adaptif/pustaka) dari file data, sama dengan GET /api/mapel.
  const jenis = (id: number) => (dataMateri.mapel.find((m) => m.id === id)?.jenis === "pustaka" ? "pustaka" : "adaptif");
  const respons: ResponsMateriAdmin = { mapel: mapel.map((m) => ({ ...m, jenis: jenis(m.mapel_id) })), tp };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibAdmin();
  const minta = await bacaBody(req, PermintaanImporTp);

  const file = SkemaFileTp.safeParse(minta.data);
  if (!file.success) {
    const i = file.error.issues[0];
    throw new GalatApi("INPUT_TIDAK_VALID", `Format file belum sesuai (${i.path.join(".") || "isi file"}: ${i.message}). Pakai format data/data_awal_*.json.`);
  }
  const rencana = rencanakanImporTp(file.data, await keadaanTpUntukImpor());
  const respons: ResponsImporTp = {
    mapel_baru: rencana.mapel_baru.map((m) => m.nama),
    tp_baru: rencana.tp_baru.map((t) => ({ kode: t.kode, deskripsi: t.deskripsi })),
    tp_berubah: rencana.tp_berubah.map((t) => ({ kode: t.tp.kode, kolom: t.kolom })),
    prasyarat_baru: rencana.prasyarat_baru.length,
    galat: rencana.galat,
    diterapkan: false,
    generator: null,
  };
  if (minta.aksi === "pratinjau" || rencana.galat.length > 0) return Response.json(respons);

  const tpTersentuh = [...rencana.tp_baru.map((t) => t.kode), ...rencana.tp_berubah.map((t) => t.tp.kode)];
  if (tpTersentuh.length === 0 && rencana.prasyarat_baru.length === 0 && rencana.mapel_baru.length === 0) {
    return Response.json(respons); // tidak ada yang berubah
  }
  await terapkanImporTp(rencana);
  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: "impor_tp",
    entitas: "tujuan_pembelajaran",
    detail: { tp_baru: rencana.tp_baru.length, tp_berubah: rencana.tp_berubah.length, prasyarat_baru: rencana.prasyarat_baru.length },
  });
  const gen = tpTersentuh.length > 0 ? await jalankanGenerator({ alasan: "tp_baru", tp_kode: tpTersentuh, user_id: sesi.user_id }) : null;
  return Response.json({
    ...respons,
    diterapkan: true,
    generator: gen && { terbit: gen.terbit, gagal: gen.gagal, dilewati: gen.dilewati },
  } satisfies ResponsImporTp);
});
