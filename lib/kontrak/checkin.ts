// Kontrak API check-in harian: POST /api/checkin
// Anak (atau pendamping yang membantu) mengisi kondisi hari ini, server menentukan level sesi
// dengan tentukanLevel() (PANDUAN 7.1) lalu membalas isi sesi yang harus ditampilkan.
// anak_id TIDAK dikirim: server mengambilnya dari sesi login (anak yang sedang aktif).

import { z } from "zod";
import { LevelSesi } from "./umum";

// Nilai sama dengan kolom CHECKIN.energi dan CHECKIN.cuaca_hati.
export const Energi = z.enum(["lemas", "lumayan", "semangat"]);
export const CuacaHati = z.enum(["cerah", "berawan", "hujan", "badai"]);
// Keluhan yang bisa dipilih anak. Hanya gejala yang dirasakan, BUKAN diagnosis atau obat (PANDUAN 6.1, 12).
// Aturan khusus di tentukanLevel (PANDUAN 7.1): sakit_sekali -> istirahat, mata_lelah -> mode audio,
// keluhan lain -> level maksimal ringan. Menambah pilihan cukup di sini dan di LABEL_KELUHAN.
export const Keluhan = z.enum([
  "mata_lelah",
  "pusing",
  "sakit_kepala",
  "mual",
  "sakit_perut",
  "sariawan", // mulut perih
  "pegal",
  "mengantuk",
  "badan_panas",
  "sakit_sekali",
]);

// Teks dan emoji untuk tombol keluhan di layar anak (usulan; tim UI boleh menyesuaikan teksnya).
// Bahasa anak, tanpa kata rumah sakit, obat, atau jarum (PANDUAN 8).
export const LABEL_KELUHAN: Record<z.infer<typeof Keluhan>, { teks: string; emoji: string }> = {
  mata_lelah: { teks: "Mataku lelah", emoji: "😵" },
  pusing: { teks: "Kepalaku pusing", emoji: "😵‍💫" },
  sakit_kepala: { teks: "Kepalaku sakit", emoji: "🤕" },
  mual: { teks: "Perutku mual", emoji: "🤢" },
  sakit_perut: { teks: "Perutku sakit", emoji: "😣" },
  sariawan: { teks: "Mulutku perih", emoji: "👄" },
  pegal: { teks: "Badanku pegal", emoji: "🥱" },
  mengantuk: { teks: "Aku mengantuk", emoji: "😴" },
  badan_panas: { teks: "Badanku panas", emoji: "🤒" },
  sakit_sekali: { teks: "Sakit sekali", emoji: "😖" },
};

export const PermintaanCheckin = z.object({
  energi: Energi,
  cuaca_hati: CuacaHati,
  // Boleh lebih dari satu; [] = tidak ada keluhan. Di database disimpan sebagai teks dipisah koma
  // pada kolom CHECKIN.keluhan (VARCHAR 100, cukup untuk semua pilihan sekaligus).
  keluhan: z.array(Keluhan).refine((daftar) => new Set(daftar).size === daftar.length, {
    message: "Keluhan tidak boleh dipilih dua kali",
  }),
});

// Jenis isi sesi, sama dengan KONTEN.jenis:
//   santai -> hanya cerita/musik (level istirahat)
//   ulang  -> mengulang TP yang sudah tercapai (level ringan, atau cuaca hati hujan/badai)
//   baru   -> materi baru atau modul jembatan (level normal/penuh)
export const JenisIsiSesi = z.enum(["santai", "ulang", "baru"]);

export const ResponsCheckin = z.object({
  checkin_id: z.number().int(),
  level: LevelSesi,
  jenis_isi: JenisIsiSesi,
  durasi_menit: z.number().int(), // sudah dibatasi batas_layar_menit anak
  mode_audio: z.boolean(), // true jika keluhan mata_lelah
  tawarkan_teman_cerita: z.boolean(), // cuaca hati hujan/badai
  teman_cerita_menyapa: z.boolean(), // cuaca hati turun beberapa hari berturut-turut (dari PENGATURAN_SISTEM)
  tawarkan_beri_tahu_pendamping: z.boolean(), // keluhan sakit_sekali
  alasan: z.array(z.string()), // jejak aturan tentukanLevel yang terpakai (untuk pendamping/juri)
});

// GET /api/checkin: check-in hari ini (null jika belum), supaya UI tahu perlu check-in atau langsung belajar.
// Check-in kedua di hari yang sama MENGGANTI check-in pagi (kondisi anak bisa berubah).
export const ResponsCheckinHariIni = z.object({ checkin: ResponsCheckin.nullable() });
export type ResponsCheckinHariIni = z.infer<typeof ResponsCheckinHariIni>;

export type Energi = z.infer<typeof Energi>;
export type CuacaHati = z.infer<typeof CuacaHati>;
export type Keluhan = z.infer<typeof Keluhan>;
export type PermintaanCheckin = z.infer<typeof PermintaanCheckin>;
export type JenisIsiSesi = z.infer<typeof JenisIsiSesi>;
export type ResponsCheckin = z.infer<typeof ResponsCheckin>;

// ---------- Contoh (skenario demo PANDUAN 14: Raka "lemas + mata lelah") ----------
// Catatan: cuaca hati "berawan". Jika "hujan", aturan tentukanLevel menurunkan ringan menjadi istirahat.

export const contohPermintaanCheckin: PermintaanCheckin = {
  energi: "lemas",
  cuaca_hati: "berawan",
  keluhan: ["mata_lelah"],
};

export const contohResponsCheckin: ResponsCheckin = {
  checkin_id: 1,
  level: "ringan",
  jenis_isi: "ulang",
  durasi_menit: 10,
  mode_audio: true,
  tawarkan_teman_cerita: false,
  teman_cerita_menyapa: false,
  tawarkan_beri_tahu_pendamping: false,
  alasan: ["energi lemas", "ada keluhan: paling tinggi ringan"],
};
