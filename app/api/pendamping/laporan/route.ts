// GET  /api/pendamping/laporan?anak_id=1&mapel_id=1: data halaman cetak laporan sekolah (PANDUAN 8.3, PRD 9.9).
// POST /api/pendamping/laporan: catat unduhan/cetak laporan di LOG_AKTIVITAS (PRD F-LAP-4), termasuk apakah draf AI disunting
//      (untuk metrik Evaluasi AI "persen draf dikirim tanpa diubah"). Isi laporan tidak disimpan di log.
// Orang tua/wali dan guru pendamping boleh mengunduh (PANDUAN 4). Kontrak: lib/kontrak/pendamping.ts

import { GalatApi, bacaBody, tanganiApi } from "@/lib/api/respons";
import { ambilAnak, ambilDaftarMapel, ambilProgres, ambilTpMapel } from "@/lib/db/anak";
import { bacaAnakId, wajibPendampingAnak } from "@/lib/db/pendamping";
import { PermintaanCatatLaporan, type ResponsDataLaporan } from "@/lib/kontrak/pendamping";
import { catatAktivitas } from "@/lib/log";

const ACUAN = "Capaian Pembelajaran Keputusan Kepala BSKAP No. 046/H/KR/2025; Panduan Pembelajaran dan Asesmen edisi revisi 2025";
const KLAIM =
  "Laporan ini memuat capaian belajar yang dipetakan ke CP dan TP Kurikulum Merdeka, sebagai bahan pertimbangan sekolah asal. Penilaian rapor dan kenaikan kelas tetap kewenangan sekolah.";

export const GET = tanganiApi(async (req: Request) => {
  const anakId = bacaAnakId(req);
  const mapelId = Number(new URL(req.url).searchParams.get("mapel_id"));
  if (!Number.isInteger(mapelId) || mapelId <= 0) throw new GalatApi("INPUT_TIDAK_VALID", "mapel_id wajib diisi.");
  await wajibPendampingAnak(anakId, "laporan");

  const [anak, daftar, progres, mapel] = await Promise.all([
    ambilAnak(anakId),
    ambilTpMapel(mapelId),
    ambilProgres(anakId, mapelId),
    ambilDaftarMapel(),
  ]);
  const namaMapel = mapel.find((m) => m.mapel_id === mapelId)?.nama;
  if (!namaMapel) throw new GalatApi("TIDAK_DITEMUKAN", "Mata pelajaran tidak ditemukan.");

  const respons: ResponsDataLaporan = {
    anak: { nama_panggilan: anak.nama_panggilan, kelas_seharusnya: anak.kelas_seharusnya, kelas_terakhir: anak.kelas_terakhir },
    mapel: namaMapel,
    dicetak_pada: new Date().toISOString(),
    acuan: ACUAN,
    klaim: KLAIM,
    tp: daftar.map((t) => ({ tp_kode: t.kode, kelas: t.kelas, deskripsi: t.deskripsi, status: progres.get(t.kode)?.status ?? "belum_diketahui" })),
  };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const minta = await bacaBody(req, PermintaanCatatLaporan);
  const { sesi } = await wajibPendampingAnak(minta.anak_id, "unduh_laporan");
  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: "unduh_laporan",
    entitas: "anak",
    entitas_id: minta.anak_id,
    detail: { mapel_id: minta.mapel_id, log_ai_id: minta.log_ai_id, diubah: minta.diubah, besar_suntingan: minta.besar_suntingan },
  });
  return Response.json({ tercatat: true });
});
