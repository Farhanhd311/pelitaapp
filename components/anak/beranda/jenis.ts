// Bentuk data yang dibutuhkan Beranda Anak. Semua teks datang dari data, bukan ditulis di komponen.

/** Satu pos di peta. chip: keterangan singkat di bawah judul (misalnya "Tercapai" atau "Level 4").
 *  segera: materi belum punya soal (tanpa TP adaptif), ditampilkan "Segera hadir" dan tidak bisa dibuka. */
export type PosBeranda = { id: string; judul: string; chip: string; tercapai: boolean; segera?: boolean };

export type DataBeranda = {
  namaAnak: string;
  judulPetualangan: string;
  /** Seluruh peta, urut dari awal sampai akhir. Posisi pos tetap; hanya tombol play yang berpindah. */
  pos: PosBeranda[];
  /** Pos bertombol play ("Kamu di sini"). */
  indeksSekarang: number;
  /** Isi pos bertombol play. Tanpa href = materinya belum tersedia.
   *  kemajuan: bagian (TP) yang sudah tuntas di pos ini; pos berikutnya terbuka setelah semuanya tuntas. */
  sekarang: {
    judul: string;
    keterangan: string;
    ajakan: string;
    pesan: string;
    href?: string;
    labelTombol: string;
    kemajuan?: { tuntas: number; total: number };
  };
};
