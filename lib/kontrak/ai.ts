// Kontrak API fitur AI generatif (PANDUAN 8). Semua dipanggil dari server; hasil selalu ada cadangan.
//   POST /api/ai/tutor        (mode anak)       -> penjelasan miskonsepsi + satu petunjuk
//   POST /api/ai/laporan      (mode pendamping) -> draf laporan sekolah (label "Draf dibuat AI — periksa sebelum dikirim")
//   POST /api/ai/umpan-balik  (pendamping/admin)-> jempol membantu / tidak membantu (UMPAN_BALIK_AI)

import { z } from "zod";

// Info yang sama untuk semua fitur AI: untuk label "dibuat AI", tombol penilaian, dan Evaluasi AI.
export type InfoAI = {
  log_ai_id: number; // dipakai untuk POST /api/ai/umpan-balik
  pakai_cadangan: boolean; // true jika memakai jawaban cadangan (LLM lambat/gagal/sakelar demo)
};

// ---------- Tutor ----------

export const PermintaanTutor = z.object({
  sesi_id: z.number().int(),
  soal_id: z.string(),
  pilihan_id: z.number().int(), // pilihan yang dijawab anak di sesi ini
});
export type PermintaanTutor = z.infer<typeof PermintaanTutor>;
export type ResponsTutor = InfoAI & { penjelasan: string; petunjuk: string };

// ---------- Draf laporan sekolah ----------

export const PermintaanLaporan = z.object({ anak_id: z.number().int(), mapel_id: z.number().int() });
export type PermintaanLaporan = z.infer<typeof PermintaanLaporan>;
export type ResponsDrafLaporan = InfoAI & {
  label: string; // "Draf dibuat AI — periksa sebelum dikirim"
  pengantar: string;
  capaian: { tp_kode: string; deskripsi_tp: string; status: string; deskripsi: string }[];
  saran: string;
};

// ---------- Umpan balik ----------

export const PermintaanUmpanBalik = z.object({
  log_ai_id: z.number().int(),
  nilai: z.enum(["membantu", "tidak_membantu"]),
  komentar: z.string().max(500).optional(),
});
export type PermintaanUmpanBalik = z.infer<typeof PermintaanUmpanBalik>;
