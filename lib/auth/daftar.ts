// Fungsi MURNI untuk pendaftaran pendamping (halaman /daftar). Dites di daftar.test.ts.

// Kelas SD seharusnya menurut usia. Tahun ajaran Indonesia mulai Juli, dan anak umumnya masuk kelas 1 di usia 7
// (aturan umum PPDB SD). Hasil dibatasi 1-6; orang tua tetap bisa mengubahnya di formulir.
const BULAN_MULAI_TAHUN_AJARAN = 7; // Juli
const USIA_MASUK_KELAS_1 = 7;

export function hitungKelasSeharusnya(tglLahir: string, hariIni: Date): number | null {
  const lahir = new Date(`${tglLahir}T00:00:00Z`);
  if (Number.isNaN(lahir.getTime())) return null;
  const tahunAjaran = hariIni.getUTCMonth() + 1 >= BULAN_MULAI_TAHUN_AJARAN ? hariIni.getUTCFullYear() : hariIni.getUTCFullYear() - 1;
  // Usia pada 1 Juli tahun ajaran berjalan.
  let usia = tahunAjaran - lahir.getUTCFullYear();
  if (lahir.getUTCMonth() + 1 > BULAN_MULAI_TAHUN_AJARAN) usia -= 1;
  return Math.min(6, Math.max(1, usia - USIA_MASUK_KELAS_1 + 1));
}

/**
 * Nomor WhatsApp Indonesia -> bentuk baku "62xxxxxxxxx" (tanpa +, spasi, atau tanda hubung).
 * null jika bukan nomor ponsel Indonesia yang masuk akal (08xx / 628xx / +628xx, 10-15 angka).
 */
export function normalisasiNoWa(masukan: string): string | null {
  let angka = masukan.replace(/[\s\-().]/g, "");
  if (angka.startsWith("+")) angka = angka.slice(1);
  if (!/^\d+$/.test(angka)) return null;
  if (angka.startsWith("0")) angka = `62${angka.slice(1)}`;
  if (!angka.startsWith("628")) return null;
  return angka.length >= 10 && angka.length <= 15 ? angka : null;
}

/** "6281234567890" -> "0812•••••890" untuk ditampilkan tanpa membuka nomor lengkap. */
export function samarkanNoWa(noWa: string): string {
  const lokal = noWa.startsWith("62") ? `0${noWa.slice(2)}` : noWa;
  return lokal.length <= 7 ? lokal : `${lokal.slice(0, 4)}${"•".repeat(lokal.length - 7)}${lokal.slice(-3)}`;
}
