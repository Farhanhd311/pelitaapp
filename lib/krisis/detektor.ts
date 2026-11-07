// Deteksi sinyal krisis dan penentuan level rujukan Teman Cerita (PANDUAN 8.2). Fungsi MURNI, aturan tetap.
// - Dijalankan SEBELUM teks apa pun dikirim ke LLM.
// - Daftar kata kunci TIDAK ditulis di sini: dikirim dari PENGATURAN_SISTEM `krisis.daftar_kata_kunci`
//   (draf dari tim, perlu tinjauan psikolog). Daftar kosong = galat, tidak boleh diam-diam lolos.
// - Ambang sengaja SENSITIF: alarm palsu lebih dapat diterima daripada kasus terlewat (PANDUAN 8.6).

// Huruf kecil, tanpa aksen, tanda baca jadi spasi, spasi berlebih dirapikan.
export function normalisasiTeks(teks: string): string {
  return teks
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Versi tanpa spasi, untuk menangkap penulisan terpisah seperti "bu nuh" atau "b-u-n-u-h".
function rapatkan(teks: string): string {
  return teks.replace(/ /g, "");
}

export type HasilCekKrisis = { terdeteksi: boolean; jumlah_cocok: number };

// Cocok jika kata kunci muncul di teks (biasa ATAU dirapatkan). Isi teks dan kata yang cocok tidak dikembalikan,
// supaya tidak ada yang tergoda menyimpannya (transkrip tidak disimpan, PANDUAN 8.2).
export function cekKataKunciKrisis(teks: string, daftarKataKunci: string[]): HasilCekKrisis {
  const kunci = daftarKataKunci.map(normalisasiTeks).filter((k) => k.length > 0);
  if (kunci.length === 0) {
    throw new Error("krisis.daftar_kata_kunci kosong: deteksi krisis tidak boleh berjalan tanpa daftar");
  }
  const biasa = normalisasiTeks(teks);
  const rapat = rapatkan(biasa);
  const jumlah = kunci.filter((k) => biasa.includes(k) || rapat.includes(rapatkan(k))).length;
  return { terdeteksi: jumlah > 0, jumlah_cocok: jumlah };
}

// ---------- Level rujukan (tabel aturan, bukan LLM) ----------

export type AturanLevel = {
  level: number;
  kebutuhan: string;
  rujukan: string;
  butuh_persetujuan_orang_tua: boolean;
};

export type MasukanRujukan = {
  kebutuhan: string; // kode chip, misalnya "teman" / "cerita" / "tidak_ada"
  sinyal_krisis: boolean;
  distres_berulang: boolean; // cuaca hati turun beberapa hari berturut-turut
};

export type HasilRujukan = {
  darurat: boolean; // langsung eskalasi + kabari orang tua, TIDAK menunggu izin
  aturan: AturanLevel | null; // rujukan level 1-3 (butuh persetujuan orang tua/wali), null = tidak perlu rujukan
};

export function tentukanLevelRujukan(
  masukan: MasukanRujukan,
  atur: { kode_kebutuhan: Record<string, number>; aturan_level: AturanLevel[] },
): HasilRujukan {
  const cariLevel = (level: number) => atur.aturan_level.find((a) => a.level === level) ?? null;
  const tertinggi = Math.max(...atur.aturan_level.map((a) => a.level));

  if (masukan.sinyal_krisis) {
    // Darurat didahulukan; rujukan level tertinggi tetap disiapkan untuk tindak lanjut.
    return { darurat: true, aturan: cariLevel(tertinggi) };
  }
  if (masukan.distres_berulang) {
    return { darurat: false, aturan: cariLevel(tertinggi) };
  }
  const level = atur.kode_kebutuhan[masukan.kebutuhan];
  return { darurat: false, aturan: level === undefined ? null : cariLevel(level) };
}
