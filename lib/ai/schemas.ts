// Skema Zod untuk keluaran JSON LLM (PANDUAN 8: "keluarannya JSON yang divalidasi").
// Skema dibuat sederhana (tipe saja) supaya bisa dipakai structured outputs Claude; aturan yang lebih ketat
// (jumlah kalimat, kata yang dihindari, tepat 4 pilihan, kunci dihitung ulang) dicek program setelahnya.

import { z } from "zod";

// AI tutor (PANDUAN 8.1): penjelasan <= N kalimat + satu langkah petunjuk.
export const KeluaranTutor = z.object({
  penjelasan: z.string(),
  petunjuk: z.string(),
});

// Draf laporan sekolah (PANDUAN 8.3): deskripsi capaian per TP gaya rapor Kurikulum Merdeka.
export const KeluaranLaporan = z.object({
  pengantar: z.string(),
  capaian: z.array(z.object({ tp_kode: z.string(), deskripsi: z.string() })),
  saran: z.string(),
});

// Variasi soal buatan AI untuk admin (PANDUAN 8.5).
export const KeluaranSoal = z.object({
  pertanyaan: z.string(),
  bacaan: z.string().nullable().optional(), // teks yang dibaca anak sebelum menjawab (Bahasa Indonesia)
  visual: z.string().nullable(),
  pilihan: z.array(z.object({ teks: z.string(), benar: z.boolean(), miskonsepsi: z.string().nullable() })),
  pembahasan: z.string(),
});
// Keluaran LLM generator soal: semua kolom wajib ada (bacaan boleh null) supaya cocok dengan mode keluaran JSON.
export const KeluaranSoalLLM = KeluaranSoal.extend({ bacaan: z.string().nullable() });

export type KeluaranTutor = z.infer<typeof KeluaranTutor>;
export type KeluaranLaporan = z.infer<typeof KeluaranLaporan>;
export type KeluaranSoal = z.infer<typeof KeluaranSoal>;

// Keluaran AI import TP dari PDF. mapel_id tidak diminta dari AI: diisi server dari mapel yang dipilih admin.
// Hasilnya lalu diperiksa SkemaFileTp + rencanakanImporTp (lib/kurikulum/impor-tp.ts) seperti file JSON biasa.
export const KeluaranImporTp = z.object({
  tujuan_pembelajaran: z.array(
    z.object({
      kode: z.string(),
      elemen: z.string(),
      fase: z.string(),
      kelas: z.number().int(),
      urutan: z.number().int(),
      deskripsi: z.string(),
      esensial_transisi: z.boolean(),
    }),
  ),
  prasyarat_tp: z.array(z.object({ tp_kode: z.string(), prasyarat_kode: z.string() })),
});
export type KeluaranImporTp = z.infer<typeof KeluaranImporTp>;
