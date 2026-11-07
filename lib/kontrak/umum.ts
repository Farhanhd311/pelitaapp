// Kontrak API: bagian yang dipakai bersama oleh banyak route.
// Kontrak = bentuk data yang dikirim antara browser dan server. Dipakai di DUA sisi:
//   - server: Skema.safeParse(body) untuk menolak input yang tidak sesuai;
//   - frontend: tipe TypeScript-nya, plus data contoh untuk membangun UI sebelum API jadi.
// Nama field memakai snake_case, sama dengan kolom database, supaya tidak perlu diterjemahkan.

import { z } from "zod";

// ---------- Galat ----------

// Semua route yang gagal membalas dengan bentuk ini. Detail teknis hanya di log server.
export const KodeGalat = z.enum([
  "INPUT_TIDAK_VALID", // 400
  "BELUM_LOGIN", // 401
  "TIDAK_BERHAK", // 403
  "TIDAK_DITEMUKAN", // 404
  "BENTROK", // 409, misalnya soal sudah dijawab
  "GALAT_SERVER", // 500
]);

export const ResponsGalat = z.object({
  galat: z.string(), // pesan ramah dalam Bahasa Indonesia, boleh ditampilkan ke pengguna
  kode: KodeGalat,
});

export type KodeGalat = z.infer<typeof KodeGalat>;
export type ResponsGalat = z.infer<typeof ResponsGalat>;

// ---------- Nilai enum yang sama dengan database ----------

export const LevelSesi = z.enum(["istirahat", "ringan", "normal", "penuh"]); // SESI.level
export const StatusTp = z.enum(["belum_diketahui", "belum", "jembatan", "tercapai"]); // PROGRES_TP.status
export const SumberStatus = z.enum(["diuji", "disimpulkan"]); // PROGRES_TP.sumber_status

export type LevelSesi = z.infer<typeof LevelSesi>;
export type StatusTp = z.infer<typeof StatusTp>;
export type SumberStatus = z.infer<typeof SumberStatus>;

// ---------- Peta TP ----------

// Satu kotak di peta TP. Sengaja TANPA p_menguasai: angka peluang tidak untuk anak atau orang tua
// (PANDUAN 7.2). Angka hanya dikirim di bagian `demo` asesmen dan di API admin.
export const KotakPetaTp = z.object({
  tp_kode: z.string(),
  kelas: z.number().int(),
  urutan: z.number().int(),
  status: StatusTp,
  sumber_status: SumberStatus.nullable(), // null jika belum_diketahui
});

export type KotakPetaTp = z.infer<typeof KotakPetaTp>;

// ---------- Soal yang dikirim ke browser ----------

// Pilihan TANPA `benar` dan TANPA `miskonsepsi`: kunci jawaban tidak pernah dikirim ke browser.
// Server yang mengecek benar/salah dari PILIHAN.benar. Urutan pilihan sudah diacak di server.
export const PilihanTampil = z.object({
  pilihan_id: z.number().int(),
  teks: z.string(),
});

export const SoalTampil = z.object({
  soal_id: z.string(), // misalnya "B3-D1"
  tp_kode: z.string(),
  pertanyaan: z.string(),
  bacaan: z.string().nullable(), // teks bacaan (Bahasa Indonesia); null untuk Matematika
  visual: z.string().nullable(), // emoji pengganti gambar
  pilihan: z.array(PilihanTampil).length(4), // MVP hanya pilihan ganda 4 opsi
});

export type PilihanTampil = z.infer<typeof PilihanTampil>;
export type SoalTampil = z.infer<typeof SoalTampil>;

export const contohSoalTampil: SoalTampil = {
  soal_id: "B3-D1",
  tp_kode: "B3",
  pertanyaan: "Ada 4 piring. Setiap piring berisi 3 jeruk. Kalimat perkalian yang tepat adalah ...",
  bacaan: null,
  visual: "🍊🍊🍊 | 🍊🍊🍊 | 🍊🍊🍊 | 🍊🍊🍊",
  pilihan: [
    { pilihan_id: 43, teks: "4 × 3 = 7" },
    { pilihan_id: 41, teks: "4 + 3 = 7" },
    { pilihan_id: 44, teks: "3 × 3 = 9" },
    { pilihan_id: 42, teks: "4 × 3 = 12" },
  ],
};
