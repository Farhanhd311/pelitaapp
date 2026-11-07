// Bentuk data yang dibutuhkan Beranda Anak. Semua teks datang dari data, bukan ditulis di komponen.

export type DataBeranda = {
  namaAnak: string;
  judulPetualangan: string;
  /** Pos yang sudah tercapai sebelum pos sekarang (boleh tidak ada untuk anak baru). */
  sebelumnya?: { judul: string };
  /** Pos yang sedang dikerjakan ("Kamu di sini"). */
  sekarang: { judul: string; keterangan: string; ajakan: string };
  /** Pos-pos berikutnya yang belum terbuka, urut dari yang terdekat (boleh kosong). */
  berikutnya: { judul: string }[];
  /** Target dihitung per minggu, bukan per hari (PANDUAN 7.1). */
  mekarMingguIni: { selesai: number; target: number };
};
