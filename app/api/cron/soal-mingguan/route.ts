// GET /api/cron/soal-mingguan: dipanggil penjadwal (Google Cloud Scheduler, misalnya setiap hari pukul 02.00 WIB).
// Generator soal AI hanya berjalan jika sudah lewat generator_soal.interval_hari (7) sejak putaran terakhir,
// jadi aman dipanggil lebih sering. Bukan untuk browser: wajib header "Authorization: Bearer <CRON_SECRET>".
// Langkah pasang penjadwal: docs/ARSITEKTUR_TEKNIS.md bagian 7.3.

import { jalankanJikaJatuhTempo, statusGenerator } from "@/lib/ai/generator-soal";
import { GalatApi, tanganiApi } from "@/lib/api/respons";

export const GET = tanganiApi(async (req: Request) => {
  const rahasia = process.env.CRON_SECRET;
  if (!rahasia) throw new GalatApi("GALAT_SERVER", "CRON_SECRET belum diisi di environment server.");
  if (req.headers.get("authorization") !== `Bearer ${rahasia}`) throw new GalatApi("TIDAK_BERHAK", "Tidak berhak.");

  const hasil = await jalankanJikaJatuhTempo();
  return Response.json({ dijalankan: hasil !== null, hasil, status: await statusGenerator() });
});
