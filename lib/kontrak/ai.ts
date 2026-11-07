// Kontrak API fitur AI generatif (PANDUAN 8). Semua dipanggil dari server; hasil selalu ada cadangan.
//   POST /api/ai/tutor        (mode anak)       -> penjelasan miskonsepsi + satu petunjuk
//   POST /api/ai/laporan      (mode pendamping) -> draf laporan sekolah (label "Draf dibuat AI — periksa sebelum dikirim")
//   POST /api/ai/buat-soal    (admin)           -> variasi soal AI, masuk antrean tinjauan berstatus draf
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

// ---------- Generator soal (admin) ----------

export const PermintaanBuatSoal = z.object({
  tp_kode: z.string(),
  penggunaan: z.enum(["diagnostik", "formatif", "santai"]),
  tingkat_kesulitan: z.number().int().min(1).max(3),
});
export type PermintaanBuatSoal = z.infer<typeof PermintaanBuatSoal>;
export type ResponsBuatSoal = InfoAI & {
  diterima: boolean; // true -> masuk antrean tinjauan (status draf)
  soal_id: string | null;
  galat_validasi: string[]; // alasan ditolak validasi otomatis (jika diterima = false)
  kunci_dicek_program: boolean;
};

// ---------- Umpan balik ----------

export const PermintaanUmpanBalik = z.object({
  log_ai_id: z.number().int(),
  nilai: z.enum(["membantu", "tidak_membantu"]),
  komentar: z.string().max(500).optional(),
});
export type PermintaanUmpanBalik = z.infer<typeof PermintaanUmpanBalik>;
