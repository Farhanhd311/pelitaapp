// Kontrak API Beranda Anak. Mode anak.
//   GET /api/beranda             -> peta mapel utama (mapel pertama yang punya TP di database)
//   GET /api/beranda?mapel_id=3  -> peta mapel lain dari data/data_materi_per_kelas_SD.json
// Satu peta = satu mapel, dari materi awal sampai akhir kelasnya (lib/peta/jalur-materi.ts).
// Tanpa angka peluang dan tanpa label "tertinggal" (PANDUAN 13).

import type { JalurMateri } from "@/lib/peta/jalur-materi";

// bisa_belajar: mapel punya TP dan soal di database, jadi sesi belajarnya bisa dimulai. Lainnya "segera hadir".
// jenis (dari file data materi): adaptif = ada asesmen penempatan (Pos Dasar); pustaka = langsung materi kelasnya
// tanpa asesmen (PANDUAN 10).
export type MapelBeranda = { mapel_id: number; nama: string; jenis: "adaptif" | "pustaka"; bisa_belajar: boolean };

export type ResponsBeranda = {
  anak_id: number;
  nama_anak: string;
  kelas_seharusnya: number;
  daftar_mapel: MapelBeranda[]; // urut seperti di file data, untuk pemilih mapel
  mapel: MapelBeranda; // mapel yang petanya dikirim
  asesmen_selesai: boolean; // asesmen penempatan mapel utama; false -> "Petualangan Pertama" dulu
  mapel_asesmen_selesai: boolean; // asesmen mapel yang dipilih (penempatan per mapel); mapel pustaka selalu true
  sekarang_dilatih: boolean; // TP pos "Kamu di sini" sudah pernah dilatih di sesi belajar tetapi belum dikuasai
  benar_lagi: number | null; // jika sudah dilatih: sisa jawaban benar sampai TP itu tercapai (bukan angka peluang)
  hari_aktif_minggu_ini: number; // hari berbeda dengan check-in sejak Senin (termasuk hari istirahat), PANDUAN 7.1
  jalur: JalurMateri;
};
