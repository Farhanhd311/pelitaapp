// Nama ramah untuk jenis tindakan di LOG_AKTIVITAS (tampilan saja). Kode yang belum ada di sini
// ditampilkan apa adanya, jadi jenis tindakan baru tidak pernah hilang dari layar.

export const LABEL_TINDAKAN: Record<string, string> = {
  login: "Masuk",
  logout: "Keluar",
  gagal_login: "Gagal masuk",
  gagal_pin: "PIN pendamping keliru",
  masuk_mode_pendamping: "Masuk mode pendamping",
  akses_data_anak: "Membuka data anak",
  ubah_profil_anak: "Mengubah profil anak",
  ubah_pengaturan: "Mengubah aturan AI",
  buat_soal: "Membuat soal dengan AI",
  sunting_soal: "Menyunting soal",
  terbitkan_soal: "Menerbitkan soal",
  tolak_soal: "Menolak soal",
  tangani_eskalasi: "Menangani eskalasi",
  unduh_laporan: "Mengunduh laporan sekolah",
  reset_demo: "Reset data demo",
  ubah_materi: "Menyunting materi",
  ubah_narasi: "Menyimpan kartu belajar",
  buat_soal_otomatis: "Membuat soal otomatis (AI)",
  hapus_soal: "Menghapus soal",
  impor_tp: "Mengimpor TP",
  daftar: "Pendaftaran akun baru",
};

export function labelTindakan(kode: string): string {
  return LABEL_TINDAKAN[kode] ?? kode.replaceAll("_", " ");
}

/** Detail log (JSON) -> pasangan "kunci: nilai" yang mudah dibaca. */
export function uraiDetail(detail: unknown): string[] {
  if (detail === null || detail === undefined) return [];
  if (typeof detail !== "object") return [String(detail)];
  return Object.entries(detail as Record<string, unknown>).map(
    ([k, v]) => `${k.replaceAll("_", " ")}: ${typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)}`,
  );
}
