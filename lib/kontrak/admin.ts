// Kontrak API admin (PANDUAN 8.4-8.7). Semua wajib login sebagai admin.
//   GET  /api/admin/pengaturan[?kunci=...]  -> semua pengaturan aktif + rentang aman [+ riwayat versi satu kunci]
//   POST /api/admin/pengaturan              -> ubah (dengan alasan) / kembalikan ke versi sebelumnya
//   GET  /api/admin/soal?tp_kode=&penggunaan=&tingkat_kesulitan=&sumber=&status= -> bank soal + statistik
//   POST /api/admin/soal                    -> hapus soal yang tidak relevan / buat soal AI sekarang
//   GET  /api/admin/evaluasi                -> metrik Evaluasi AI (+ hasil simulasi berlabel)
//   GET  /api/admin/log-aktivitas?user_id=&jenis=&dari=&sampai=[&format=csv] -> log + ekspor CSV
//   GET  /api/admin/eskalasi                -> antrean rujukan & eskalasi
//   POST /api/admin/eskalasi                -> tandai ditangani / alarm palsu + catatan tindak lanjut
//   POST /api/admin/reset-demo              -> kembalikan data demo Raka

import { z } from "zod";

// ---------- Pengaturan ----------

export type ItemPengaturan = {
  kunci: string;
  label: string | null; // null = tidak bisa diubah lewat admin
  keterangan: string | null; // arti pengaturan, untuk admin
  nilai: unknown;
  versi: number;
  alasan: string | null;
  diubah_at: string;
  rentang: { min?: number; maks?: number; jenis: string } | null;
  bisa_dikembalikan: boolean;
};
export type ResponsPengaturan = {
  pengaturan: ItemPengaturan[];
  riwayat?: { versi: number; nilai: unknown; aktif: boolean; alasan: string | null; diubah_oleh: string | null; diubah_at: string }[];
};

export const PermintaanPengaturan = z.discriminatedUnion("aksi", [
  z.object({ aksi: z.literal("ubah"), kunci: z.string(), nilai: z.unknown(), alasan: z.string().trim().min(5) }),
  z.object({ aksi: z.literal("kembalikan"), kunci: z.string(), alasan: z.string().trim().min(5) }),
]);
export type PermintaanPengaturan = z.infer<typeof PermintaanPengaturan>;

// ---------- Bank soal ----------

export const FilterSoal = z.object({
  tp_kode: z.string().optional(),
  penggunaan: z.enum(["diagnostik", "formatif", "santai"]).optional(),
  tingkat_kesulitan: z.coerce.number().int().optional(),
  sumber: z.enum(["manual", "ai"]).optional(),
  status: z.enum(["draf", "ditinjau", "terbit", "ditolak"]).optional(),
});

export type ItemSoalAdmin = {
  soal_id: string;
  tp_kode: string;
  penggunaan: string;
  tingkat_kesulitan: number;
  pertanyaan: string;
  bacaan: string | null;
  visual: string | null;
  pembahasan: string | null;
  sumber: "manual" | "ai";
  status: "draf" | "ditinjau" | "terbit" | "ditolak";
  alasan_penolakan: string | null;
  pilihan: { pilihan_id: number; teks: string; benar: boolean; miskonsepsi: string | null }[]; // admin boleh melihat kunci
  statistik: { kali_dijawab: number; persen_benar: number | null; pengecoh_terbanyak: string | null };
};
export type TpAdmin = { kode: string; mapel: string; kelas: number; deskripsi: string };

// Generator soal otomatis (lib/ai/generator-soal.ts): kapan terakhir dan berikutnya berjalan.
export type StatusGeneratorSoal = { terakhir: string | null; berikutnya: string | null; interval_hari: number };
export type RingkasanGeneratorSoal = { alasan: string; jumlah_tp: number; terbit: number; gagal: number; dilewati: string | null };

export type ResponsSoal = {
  soal: ItemSoalAdmin[]; // hanya soal berstatus terbit (yang dipakai anak)
  daftar_tp: TpAdmin[];
  generator: StatusGeneratorSoal;
  hasil_generator?: RingkasanGeneratorSoal; // terisi setelah aksi buat_sekarang
};

// Tidak ada lagi antrean tinjauan (keputusan tim): soal AI terbit otomatis jika lolos pemeriksaan.
// Admin bisa menghapus soal yang tidak relevan, dan menjalankan generator sekarang (tanpa menunggu jadwal).
export const PermintaanSoal = z.discriminatedUnion("aksi", [
  z.object({ aksi: z.literal("hapus"), soal_id: z.string(), alasan: z.string().trim().min(3).max(300) }),
  z.object({ aksi: z.literal("buat_sekarang") }),
]);
export type PermintaanSoal = z.infer<typeof PermintaanSoal>;

// ---------- Evaluasi AI ----------

export type ResponsEvaluasi = {
  keandalan: { fitur: string; jumlah_panggilan: number; rata_waktu_ms: number | null; persen_gagal: number | null; persen_cadangan: number | null }[];
  tutor: { jumlah_dinilai: number; persen_membantu: number | null };
  laporan: { jumlah_draf: number; jumlah_dikirim: number; persen_tanpa_diubah: number | null; rata_suntingan: number | null };
  generator_soal: { diterbitkan: number; ditolak: number; menunggu: number; alasan_penolakan: { alasan: string; jumlah: number }[] };
  teman_cerita: { jumlah_skrining: number; jumlah_eskalasi: number; persen_alarm_palsu: number | null };
  agregat_anak: { jumlah_anak: number; perlu_perhatian: number }; // admin hanya melihat agregat
  simulasi_asesmen: { label: string; data: unknown }; // dari hasil_uji_asesmen.json, berlabel "hasil simulasi"
};

// ---------- Log aktivitas ----------

export const FilterLog = z.object({
  user_id: z.coerce.number().int().optional(),
  jenis: z.string().optional(),
  dari: z.string().optional(), // tanggal ISO (UTC)
  sampai: z.string().optional(),
  format: z.enum(["json", "csv"]).optional(),
});
export type ResponsLog = {
  log: { id: number; waktu: string; user_id: number | null; nama: string | null; jenis_tindakan: string; entitas: string | null; entitas_id: string | null; detail: unknown }[];
};

// ---------- Eskalasi ----------

export type ItemEskalasi = {
  rujukan_id: number;
  anak_id: number;
  nama_panggilan: string;
  waktu: string;
  darurat: boolean;
  level: number | null;
  layanan: string | null;
  status: string;
  alarm_palsu: boolean;
  catatan_tindak_lanjut: string | null;
  tindak_lanjut_pada: string | null; // seminggu setelah disetujui (PANDUAN 8.2)
};
export type ResponsEskalasi = { antrean: ItemEskalasi[] };

export const PermintaanEskalasi = z.object({
  rujukan_id: z.number().int(),
  alarm_palsu: z.boolean(),
  catatan: z.string().trim().min(3).max(1000),
});
export type PermintaanEskalasi = z.infer<typeof PermintaanEskalasi>;

export type ResponsResetDemo = { berhasil: true; pengaturan_ditambah: string[]; ringkasan: Record<string, number> };
