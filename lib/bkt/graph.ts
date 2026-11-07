// Fungsi murni graf prasyarat TP (PANDUAN 7.2 dan 7.3). Tanpa database: data TP dan
// prasyarat dikirim oleh pemanggil (API route membacanya dari TUJUAN_PEMBELAJARAN dan PRASYARAT_TP).
//
// Istilah:
//   prasyarat langsung -> TP yang harus dikuasai tepat sebelum TP ini (B3 butuh A4)
//   leluhur            -> semua prasyarat, langsung maupun tidak langsung (leluhur B3: A4, A3, A1)
//   keturunan          -> semua TP yang (langsung/tidak langsung) membutuhkan TP ini (keturunan B3: B4, B5, B7, B8)

export type TpGraf = {
  kode: string;
  kelas: number;
  urutan: number; // urutan belajar di dalam mapel (dari data)
};

export type RelasiPrasyarat = {
  tp_kode: string; // TP ini ...
  prasyarat_kode: string; // ... membutuhkan TP ini
};

export type GrafPrasyarat = {
  tp: Map<string, TpGraf>;
  prasyarat: Map<string, string[]>; // kode -> prasyarat langsung
  pengguna: Map<string, string[]>; // kode -> TP yang langsung membutuhkannya (arah kebalikan)
};

export function buatGraf(daftarTp: TpGraf[], relasi: RelasiPrasyarat[]): GrafPrasyarat {
  const tp = new Map(daftarTp.map((t) => [t.kode, t]));
  const prasyarat = new Map<string, string[]>(daftarTp.map((t) => [t.kode, []]));
  const pengguna = new Map<string, string[]>(daftarTp.map((t) => [t.kode, []]));

  for (const r of relasi) {
    if (!tp.has(r.tp_kode) || !tp.has(r.prasyarat_kode)) {
      throw new Error(`Relasi prasyarat merujuk TP yang tidak ada: ${r.tp_kode} -> ${r.prasyarat_kode}`);
    }
    prasyarat.get(r.tp_kode)!.push(r.prasyarat_kode);
    pengguna.get(r.prasyarat_kode)!.push(r.tp_kode);
  }
  return { tp, prasyarat, pengguna };
}

// Telusuri graf ke satu arah sampai habis (pencarian melebar). TP awal tidak ikut dihitung.
function telusuri(awal: string, tetangga: Map<string, string[]>): Set<string> {
  const ditemukan = new Set<string>();
  const antrean = [...(tetangga.get(awal) ?? [])];
  while (antrean.length > 0) {
    const kode = antrean.shift()!;
    if (ditemukan.has(kode)) continue;
    ditemukan.add(kode);
    antrean.push(...(tetangga.get(kode) ?? []));
  }
  return ditemukan;
}

export function cariLeluhur(graf: GrafPrasyarat, kode: string): Set<string> {
  return telusuri(kode, graf.prasyarat);
}

export function cariKeturunan(graf: GrafPrasyarat, kode: string): Set<string> {
  return telusuri(kode, graf.pengguna);
}

// TP pertama yang diuji (PANDUAN 7.2): TP di tengah daftar TP kelas (kelas_seharusnya - 1),
// diurutkan menurut `urutan`, indeks floor(jumlah / 2). Untuk Raka (kelas seharusnya 4): B3.
// Jika kelas itu tidak punya TP (misalnya anak kelas 1 -> kelas 0), dipakai kelas terdekat di bawahnya,
// atau kelas terendah yang ada.
export function pilihTpPertama(graf: GrafPrasyarat, kelasSeharusnya: number): string {
  const semua = [...graf.tp.values()];
  if (semua.length === 0) throw new Error("Tidak ada TP untuk diuji");

  const kelasAda = [...new Set(semua.map((t) => t.kelas))].sort((a, b) => a - b);
  const target = kelasSeharusnya - 1;
  const kelasDiBawah = kelasAda.filter((k) => k <= target);
  const kelas = kelasDiBawah.length > 0 ? kelasDiBawah[kelasDiBawah.length - 1] : kelasAda[0];

  const tpKelas = semua.filter((t) => t.kelas === kelas).sort((a, b) => a.urutan - b.urutan);
  return tpKelas[Math.floor(tpKelas.length / 2)].kode;
}
