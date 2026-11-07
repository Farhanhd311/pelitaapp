// Kontrak API peta TP (PANDUAN 7.3, PRD 9.4) dan daftar mapel. Mode anak.
//   GET /api/mapel            -> daftar mata pelajaran (untuk memilih mapel_id asesmen/peta)
//   GET /api/peta?mapel_id=1  -> menu Kelasku + Pos Dasar
// Tanpa angka peluang (bukan untuk anak) dan tanpa label "tertinggal" (PANDUAN 13).

import type { StatusTp, SumberStatus } from "./umum";

export type ResponsMapel = { mapel: { mapel_id: number; nama: string }[] };

export type KotakPeta = {
  tp_kode: string;
  kelas: number;
  urutan: number;
  deskripsi: string;
  status: StatusTp;
  sumber_status: SumberStatus | null;
  tersedia: boolean; // punya konten belajar; false -> tampilkan "segera hadir"
  terkunci: boolean; // ada prasyarat langsung yang belum tercapai -> selesaikan Pos Dasar dulu
  esensial_transisi: boolean;
};

export type ResponsPeta = {
  mapel_id: number;
  kelas_seharusnya: number;
  asesmen_selesai: boolean; // false -> arahkan ke "Petualangan Pertama" (asesmen)
  rekomendasi_tp: string | null; // TP berikutnya yang paling pas dipelajari (perbatasan)
  hanya_esensial: boolean; // fase intensif: hanya TP esensial_transisi yang ditampilkan (PANDUAN 7.3)
  kelasku: KotakPeta[]; // TP kelas seharusnya
  pos_dasar: (KotakPeta & { wajib: boolean })[]; // TP kelas di bawahnya; wajib = prasyarat TP Kelasku yang belum tercapai
  pesan_semangat: string; // bingkai positif, misalnya "3 pos lagi menuju Kelasku!"
};
