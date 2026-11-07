// Kontrak API mode pendamping (orang tua, wali, guru). Wajib mode pendamping (PIN) dan relasi PENDAMPINGAN.
//   GET   /api/pendamping/dashboard?anak_id=1  -> ringkasan, tren check-in, perlu perhatian, progres per TP, keputusan
//   GET   /api/pendamping/keputusan?anak_id=1  -> daftar Keputusan Menunggu
//   POST  /api/pendamping/keputusan            -> setujui / tolak rujukan (HANYA orang tua/wali)
//   GET   /api/pendamping/anak?anak_id=1       -> profil anak
//   PATCH /api/pendamping/anak                 -> ubah mode jeda, batas layar, fase pengobatan (HANYA orang tua/wali)
//   GET   /api/pendamping/laporan?anak_id=1&mapel_id=1 -> data halaman cetak laporan sekolah
//   POST  /api/pendamping/laporan              -> catat unduhan/cetak laporan (LOG_AKTIVITAS)
// Progres ditampilkan sebagai STATUS, bukan persen (PANDUAN 7.2).

import { z } from "zod";
import type { Hubungan } from "./auth";
import type { StatusTp } from "./umum";

export type KartuPerhatian = {
  jenis: "lemas_beruntun" | "pusing_saat_sesi" | "sakit_sekali" | "tp_perlu_ditinjau" | "eskalasi_darurat";
  judul: string;
  isi: string; // termasuk saran berkonsultasi dengan tim medis untuk kartu kondisi
  tp_kode?: string;
};

export type ItemKeputusan = {
  rujukan_id: number;
  waktu: string; // ISO UTC
  ringkasan_kategori: { perasaan: string | null; sumber: string | null; kebutuhan: string | null }; // BUKAN isi cerita
  level: number | null;
  layanan: string | null;
  status: string; // menunggu_persetujuan | disetujui | ditolak | eskalasi | ditangani
  bisa_memutuskan: boolean; // false untuk guru (lihat saja)
};

export type ResponsDashboard = {
  anak: {
    anak_id: number;
    nama_panggilan: string;
    kelas_seharusnya: number;
    fase_pengobatan: string;
    mode_jeda: boolean;
    batas_layar_menit: number | null;
  };
  hubungan: Hubungan;
  minggu_ini: { hari_aktif: number; hari_istirahat: number; sesi_belajar: number; tp_tercapai_baru: number };
  tren_checkin: { tanggal: string; energi: string; cuaca_hati: string; keluhan: string[] }[]; // 28 hari terakhir
  perlu_perhatian: KartuPerhatian[]; // warna amber, bukan merah
  progres: { mapel_id: number; mapel: string; tp: { tp_kode: string; kelas: number; deskripsi: string; status: StatusTp; sumber_status: string | null }[] }[];
  ringkasan_skrining: { waktu: string; perasaan: string | null; sumber: string | null; kebutuhan: string | null; level: number | null }[];
  keputusan_menunggu: ItemKeputusan[];
  penjelasan_ai_terbaru: { log_ai_id: number; waktu: string; penjelasan: string; sudah_dinilai: boolean }[]; // untuk jempol
};

export const PermintaanKeputusan = z.object({
  rujukan_id: z.number().int(),
  keputusan: z.enum(["setujui", "tolak"]),
});
export type PermintaanKeputusan = z.infer<typeof PermintaanKeputusan>;
export type ResponsKeputusan = { keputusan: ItemKeputusan[] };

export const PermintaanUbahAnak = z
  .object({
    anak_id: z.number().int(),
    mode_jeda: z.boolean().optional(),
    batas_layar_menit: z.number().int().min(1).max(240).nullable().optional(),
    fase_pengobatan: z.enum(["intensif", "pemeliharaan", "pemulihan"]).optional(),
  })
  .refine((u) => u.mode_jeda !== undefined || u.batas_layar_menit !== undefined || u.fase_pengobatan !== undefined, {
    message: "Tidak ada yang diubah",
  });
export type PermintaanUbahAnak = z.infer<typeof PermintaanUbahAnak>;
export type ResponsAnak = ResponsDashboard["anak"] & { tgl_lahir: string; kelas_terakhir: number; bisa_mengubah: boolean };

export type ResponsDataLaporan = {
  anak: { nama_panggilan: string; kelas_seharusnya: number; kelas_terakhir: number };
  mapel: string;
  dicetak_pada: string; // ISO UTC
  acuan: string; // acuan CP/TP Kurikulum Merdeka
  klaim: string; // kalimat klaim yang benar (PANDUAN 8.3)
  tp: { tp_kode: string; kelas: number; deskripsi: string; status: StatusTp }[];
};

export const PermintaanCatatLaporan = z.object({
  anak_id: z.number().int(),
  mapel_id: z.number().int(),
  log_ai_id: z.number().int().nullable(), // draf AI yang dipakai, jika ada
  diubah: z.boolean(), // apakah pendamping menyunting draf
  besar_suntingan: z.number().int().nonnegative(), // jumlah karakter yang berubah (untuk Evaluasi AI)
});
export type PermintaanCatatLaporan = z.infer<typeof PermintaanCatatLaporan>;
