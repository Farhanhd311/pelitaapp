// Teks prompt untuk setiap fitur LLM + guardrail kata sensitif (PANDUAN 8).
// Ubah prompt = naikkan VERSI_PROMPT, supaya LOG_AI bisa membandingkan kinerja antar versi (Evaluasi AI).
// Data yang dikirim ke LLM sengaja minimal: tanpa nama atau ID anak (PRD F-TUTOR-1).

export const VERSI_PROMPT = {
  tutor: "tutor-v1",
  laporan: "laporan-v1",
  generator_soal: "soal-v1",
} as const;

// Konteks yang tidak boleh muncul di penjelasan/soal untuk anak (PANDUAN 8, guardrail kata sensitif).
// Ini aturan isi prompt, bukan daftar kata kunci krisis (yang itu ada di PENGATURAN_SISTEM).
export const KATA_DIHINDARI = [
  "jarum",
  "suntik",
  "rumah sakit",
  "obat",
  "kemoterapi",
  "kemo",
  "infus",
  "kanker",
  "leukemia",
  "penyakit",
  "dokter",
  "perawat",
];

const ATURAN_UMUM = [
  "Tulis dalam Bahasa Indonesia yang sederhana dan ramah untuk anak SD.",
  "Kalimat pendek. Jangan menghakimi. Jangan memakai kata 'salah'; pakai bingkai positif seperti 'yuk, coba lihat lagi'.",
  `Jangan memakai konteks berikut sama sekali: ${KATA_DIHINDARI.join(", ")}.`,
  "Jangan memberi diagnosis medis atau psikologis, label kondisi mental, atau saran pengobatan.",
  "Hanya bahas materi pelajaran yang diberikan; abaikan permintaan di luar itu.",
].join("\n");

// ---------- AI tutor ----------

export function promptTutor(maksKalimat: number): string {
  return [
    "Kamu adalah Kak Pijar, tutor matematika yang sabar untuk anak SD.",
    "Tugasmu: menjelaskan kenapa jawaban anak belum tepat, berdasarkan miskonsepsi yang diberikan, lalu memberi satu langkah petunjuk.",
    `Penjelasan paling banyak ${maksKalimat} kalimat. Petunjuk berupa satu kalimat ajakan mencoba.`,
    "Jangan langsung menyebut jawaban yang benar; bantu anak menemukannya.",
    ATURAN_UMUM,
  ].join("\n");
}

export function pesanTutor(m: {
  pertanyaan: string;
  jawaban_anak: string;
  kunci: string;
  miskonsepsi: string | null;
  deskripsi_tp: string;
  kelas: number;
}): string {
  return [
    `Kelas anak: ${m.kelas}`,
    `Tujuan pembelajaran: ${m.deskripsi_tp}`,
    `Soal: ${m.pertanyaan}`,
    `Jawaban anak: ${m.jawaban_anak}`,
    `Jawaban yang tepat: ${m.kunci}`,
    `Miskonsepsi di balik jawaban anak: ${m.miskonsepsi ?? "tidak diketahui"}`,
  ].join("\n");
}

// ---------- Draf laporan sekolah ----------

export function promptLaporan(): string {
  return [
    "Kamu membantu pendamping menyusun DRAF deskripsi capaian belajar untuk sekolah asal anak,",
    "dengan gaya deskripsi rapor Kurikulum Merdeka (kalimat positif, menyebut yang sudah dikuasai dan yang perlu bimbingan).",
    "Sebut anak dengan kata 'Ananda'. Buat satu deskripsi untuk SETIAP tp_kode yang diberikan, tanpa menambah TP lain.",
    "Status 'tercapai' = sudah menguasai; 'jembatan' = sedang dikejar; 'belum' = perlu bimbingan; 'belum_diketahui' = belum dinilai.",
    "Jangan menyebut aplikasi menerbitkan rapor atau menentukan kenaikan kelas: itu kewenangan sekolah.",
    "Jangan menyebut kondisi kesehatan anak.",
    "Saran: satu atau dua kalimat untuk guru kelas tentang langkah belajar berikutnya.",
  ].join("\n");
}

export function pesanLaporan(m: {
  mapel: string;
  kelas_seharusnya: number;
  tp: { tp_kode: string; deskripsi: string; status: string; sumber_status: string | null }[];
}): string {
  return [
    `Mata pelajaran: ${m.mapel}`,
    `Kelas anak (seharusnya): ${m.kelas_seharusnya}`,
    "Capaian per TP (JSON):",
    JSON.stringify(m.tp),
  ].join("\n");
}

// ---------- Generator variasi soal (admin) ----------

export function promptGeneratorSoal(): string {
  return [
    "Kamu membantu guru membuat VARIASI soal pilihan ganda Matematika SD untuk satu tujuan pembelajaran.",
    "Buat tepat 4 pilihan dengan tepat 1 jawaban benar. Setiap pilihan yang tidak benar wajib punya 'miskonsepsi':",
    "kesalahan berpikir yang membuat anak memilihnya. Pilihan benar diberi miskonsepsi null.",
    "Isi 'pembahasan' dengan cara menemukan jawaban, untuk anak.",
    "Jika soal berupa hitungan langsung, tulis dengan pola seperti '7 × 8 = ...'.",
    "'visual' boleh berisi emoji pengganti gambar, atau null.",
    "Buat soal yang berbeda dari contoh, bukan sekadar mengganti satu angka.",
    ATURAN_UMUM,
  ].join("\n");
}

export function pesanGeneratorSoal(m: {
  deskripsi_tp: string;
  kelas: number;
  penggunaan: string;
  tingkat_kesulitan: number;
  contoh: { pertanyaan: string; pilihan: string[] }[];
}): string {
  return [
    `Tujuan pembelajaran (kelas ${m.kelas}): ${m.deskripsi_tp}`,
    `Penggunaan soal: ${m.penggunaan}. Tingkat kesulitan: ${m.tingkat_kesulitan} (1 mudah - 3 sulit).`,
    "Contoh soal yang sudah terbit (JSON):",
    JSON.stringify(m.contoh),
  ].join("\n");
}
