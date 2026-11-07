// DATA CONTOH untuk tampilan Beranda Anak (demo Raka).
// Sementara sampai API beranda dibuat: nanti diganti data dari sesi anak + PROGRES_TP.
// Judul ramah anak ("Pulau Perkalian", "Perkalian Seru") belum ada di skema TP; perlu
// keputusan tim (kolom baru atau pemetaan) sebelum diambil dari database.

import type { DataBeranda } from "@/components/anak/beranda/jenis";

export const NAMA_ANAK_CONTOH = "Raka";

export const BERANDA_CONTOH: DataBeranda = {
  namaAnak: NAMA_ANAK_CONTOH,
  judulPetualangan: "Pulau Perkalian",
  sebelumnya: { judul: "Bekal siap!" },
  sekarang: { judul: "Perkalian Seru", keterangan: "Belum dimulai", ajakan: "Yuk, mulai perkalian seru!" },
  berikutnya: [
    { judul: "Pulau berikutnya" },
    { judul: "Pulau Pembagian" },
    { judul: "Pulau Pecahan" },
    { judul: "Pulau Uang" },
    { judul: "Pulau Waktu" },
    { judul: "Pulau Bangun Datar" },
  ],
  mekarMingguIni: { selesai: 1, target: 3 },
};
