// Kontrak API sesi belajar: POST /api/sesi (PANDUAN 7.1-7.4, PRD 9.5-9.6). Mode anak.
// Aksi (field `aksi`):
//   mulai      -> buka sesi sesuai level check-in hari ini (wajib check-in dulu)
//   kuis       -> setelah kartu belajar dibaca, minta soal pertama
//   jawab      -> jawab soal kuis; server memperbarui BKT (belajar_saat_sesi) dan memilih langkah berikutnya
//   masih_kuat -> jawaban cek "Masih kuat?" (aturan tetap, bukan LLM)
//   selesai    -> anak menutup sesi (progres tersimpan, tidak dihitung gagal)
// Status di respons memberi tahu UI layar apa yang ditampilkan.

import { z } from "zod";
import type { Narasi } from "./materi";
import type { LevelSesi, SoalTampil } from "./umum";

export const PilihanMasihKuat = z.enum(["masih_kuat", "agak_capek", "istirahat", "pusing"]);

export const PermintaanSesi = z.discriminatedUnion("aksi", [
  // tp_kode opsional: jika kosong, server memilih (rekomendasi peta, atau TP tercapai untuk sesi mengulang).
  z.object({ aksi: z.literal("mulai"), mapel_id: z.number().int(), tp_kode: z.string().optional() }),
  z.object({ aksi: z.literal("kuis"), sesi_id: z.number().int() }),
  z.object({
    aksi: z.literal("jawab"),
    sesi_id: z.number().int(),
    soal_id: z.string(),
    pilihan_id: z.number().int(),
    waktu_respons_ms: z.number().int().nonnegative(),
  }),
  z.object({ aksi: z.literal("masih_kuat"), sesi_id: z.number().int(), pilihan: PilihanMasihKuat }),
  z.object({ aksi: z.literal("selesai"), sesi_id: z.number().int() }),
]);

export type PermintaanSesi = z.infer<typeof PermintaanSesi>;
export type PilihanMasihKuat = z.infer<typeof PilihanMasihKuat>;

export type Konten = {
  konten_id: number;
  tp_kode: string;
  jenis: "baru" | "ulang" | "jembatan" | "santai";
  format: "video" | "audio" | "interaktif";
  durasi_menit: number | null;
  butuh_layar: boolean;
  url: string | null;
};

// santai        -> level istirahat: hanya konten santai opsional, tanpa kuis
// kartu_belajar -> tampilkan kartu belajar (TP baru atau p < 0,40), lalu kirim aksi "kuis"
// kuis          -> tampilkan `soal`
// cek_kuat      -> tampilkan tiga ikon "Masih kuat?", lalu kirim aksi "masih_kuat"
// selesai       -> sesi selesai dengan pujian (kuis tuntas atau TP tercapai)
// berhenti      -> sesi dihentikan anak (istirahat/pusing); progres tersimpan, pesan istirahat dari Pijar
export type StatusSesi = "santai" | "kartu_belajar" | "kuis" | "cek_kuat" | "selesai" | "berhenti";

export type UmpanBalikJawaban = {
  benar: boolean; // untuk pose maskot (senang / coba_lagi); UI tidak boleh menulis "Salah" atau tanda X merah
  pesan: string; // kalimat lembut, misalnya "Yuk, coba lihat lagi"
  pembahasan: string | null; // dari bank soal, ditampilkan setelah menjawab
  bisa_tanya_tutor: boolean; // true jika belum tepat -> tombol AI tutor (POST /api/ai/tutor)
};

export type ResponsSesi = {
  sesi_id: number;
  status: StatusSesi;
  level: LevelSesi;
  jenis_isi: "santai" | "ulang" | "baru";
  mode_audio: boolean; // keluhan mata lelah: utamakan konten yang tidak butuh layar
  durasi_menit: number;
  tp: { tp_kode: string; deskripsi: string } | null;
  kartu_belajar: Konten | null; // terisi saat status kartu_belajar (null jika konten belum disiapkan tim)
  narasi: Narasi | null; // cerita kartu belajar dari tabel narasi_materi (status kartu_belajar); null -> kartu cadangan
  konten: Konten[]; // konten santai / ulang yang bisa diputar
  soal: SoalTampil | null;
  nomor_soal: number; // soal ke berapa di sesi ini (mulai 1)
  jumlah_soal: number; // jatah soal sesuai level. Sesi materi baru lanjut dengan soal tambahan sampai TP tercapai
  umpan_balik: UmpanBalikJawaban | null; // hasil jawaban sebelumnya
  alasan_cek_kuat: "durasi_tercapai" | "salah_beruntun" | "tengah_sesi_penuh" | null;
  tawarkan_selesai: boolean; // "Masih kuat" setelah durasi tercapai -> tawarkan selesai dengan pujian
  tp_tercapai: boolean; // TP baru saja tercapai -> rayakan
  benar_lagi_untuk_tercapai: number | null; // TP belum tercapai (respons kuis & selesai): sisa jawaban benar (bukan angka peluang)
  pesan: string; // kalimat Pijar untuk layar ini
};
