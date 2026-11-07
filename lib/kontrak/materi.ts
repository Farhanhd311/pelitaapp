// Kontrak materi per kelas dan narasi kartu belajar (tabel materi + narasi_materi, migrasi 0001).
//   GET  /api/admin/materi -> semua mapel dan TP untuk ditinjau (halaman admin Materi)
//   POST /api/admin/materi -> import TP dari file JSON: pratinjau | terapkan (lalu AI membuat soal untuk TP baru/berubah)
// Mode anak memuat materi lewat GET /api/beranda dan narasi lewat POST /api/sesi (status kartu_belajar).
// Skema narasi di sini dipakai saat narasi dibaca untuk anak (narasi rusak tidak ditampilkan) DAN tes data.

import { z } from "zod";

// Ekspresi Pijar yang boleh dipakai di narasi (gambar ekspresi di /public/pijar, lihat MascotPijar).
export const EKSPRESI_NARASI = [
  "sambut",
  "senang",
  "tenang",
  "penasaran",
  "semangat",
  "terkejut",
  "empati",
  "tekad",
  "istirahat",
  "mengintip",
  "peduli",
] as const;

const Teks = (maks: number) => z.string().trim().min(1, "tidak boleh kosong").max(maks, `maksimal ${maks} huruf`);

// Tebakan di tengah cerita: tidak dinilai dan tidak memengaruhi status TP.
export const SkemaTebak = z
  .object({
    pertanyaan: Teks(300),
    pilihan: z.array(Teks(100)).min(2, "minimal 2 pilihan").max(4, "maksimal 4 pilihan"),
    jawaban: Teks(100),
    penjelasan: Teks(500),
  })
  .refine((t) => t.pilihan.includes(t.jawaban), { message: "jawaban harus sama persis dengan salah satu pilihan", path: ["jawaban"] })
  .refine((t) => new Set(t.pilihan).size === t.pilihan.length, { message: "pilihan tidak boleh kembar", path: ["pilihan"] });

export const SkemaAdegan = z.object({
  ekspresi: z.enum(EKSPRESI_NARASI),
  teks: Teks(600),
  visual: z.string().trim().max(300).optional(), // format sama dengan kolom visual soal (emoji)
  tebak: SkemaTebak.optional(),
  kunci: z.boolean().optional(), // adegan inti materi (biasanya terakhir)
});

export const SkemaIsiNarasi = z.object({
  judul: Teks(200),
  adegan: z.array(SkemaAdegan).min(1, "minimal 1 adegan").max(15, "maksimal 15 adegan"),
});

export type AdeganNarasi = z.infer<typeof SkemaAdegan>;
export type Narasi = { tp_kode: string; judul: string; adegan: AdeganNarasi[] };

// ---------- Admin: tinjau TP + import ----------

export type TpReview = {
  kode: string;
  mapel_id: number;
  kelas: number;
  urutan: number;
  elemen: string;
  deskripsi: string;
  esensial_transisi: boolean;
  prasyarat: string[];
  soal_asesmen: number; // soal diagnostik terbit
  soal_latihan: number; // soal formatif/santai terbit
  ada_kartu_belajar: boolean; // punya narasi di narasi_materi
  materi: string[]; // judul materi (peta anak) yang memakai TP ini
};

export type ResponsMateriAdmin = {
  mapel: { mapel_id: number; nama: string; jenis: "adaptif" | "pustaka" }[];
  tp: TpReview[];
};

export const PermintaanImporTp = z.object({
  aksi: z.enum(["pratinjau", "terapkan"]),
  data: z.unknown(), // isi file JSON; divalidasi lib/kurikulum/impor-tp.ts (SkemaFileTp)
});
export type PermintaanImporTp = z.infer<typeof PermintaanImporTp>;

export type ResponsImporTp = {
  mapel_baru: string[];
  tp_baru: { kode: string; deskripsi: string }[];
  tp_berubah: { kode: string; kolom: string[] }[];
  prasyarat_baru: number;
  galat: string[];
  diterapkan: boolean;
  generator: { terbit: number; gagal: number; dilewati: string | null } | null; // soal AI untuk TP baru/berubah
};

// POST /api/admin/materi/pdf: AI membaca PDF kurikulum -> isi file import (lalu masuk pratinjau import di atas).
export type ResponsBacaPdf = { data: import("@/lib/kurikulum/impor-tp").FileTp; jumlah_tp: number };
