// Menyusun peta petualangan di Beranda Anak dari data materi per kelas
// (data/data_materi_per_kelas_SD.json) dan hasil penempatan asesmen (PROGRES_TP). Fungsi MURNI.
// Peta TETAP seperti peta saga: semua pos tampil di tempatnya, yang tuntas bercentang, tombol play pindah
// ke pos berikutnya setiap pos tuntas. Supaya play selalu maju, urutan mengikuti urutan rekomendasi susunPeta
// (PANDUAN 7.3):
//   1. Pos Dasar  = materi kelas bawah yang memuat TP prasyarat Kelasku (tp_wajib). Yang dihitung hanya TP wajibnya.
//   2. Kelasku    = materi kelas seharusnya yang punya TP adaptif.
//   3. Pos tambahan = materi kelas bawah dengan TP bukan-prasyarat (opsional, dikerjakan setelah Kelasku).
//   4. Segera hadir = materi Kelasku tanpa TP adaptif (status bacaan): belum punya soal, jadi tidak pernah bisa
//      dibuka sesi. Diletakkan di akhir supaya play tidak terlihat melompatinya.
// Di dalam tiap bagian, materi ber-TP diurutkan menurut urutan belajar TP (urutan_tp, sesuai graf prasyarat),
// bukan urutan file materi. Contoh: Membandingkan pecahan (B6) sebelum Pecahan senilai (B7) karena B6 > B7.
// Materi berurutan yang menghitung TP yang sama persis digabung jadi satu pos (satu pos = satu sesi), misalnya
// "Mengenal bilangan desimal & Desimal dan persen" (keduanya B8).
// Fase intensif -> hanya materi esensial_transisi (null = belum diketahui, tetap ditampilkan).
// Satu pos tuntas jika semua TP yang dihitung di pos itu tercapai.

import type { StatusPeta } from "@/lib/bkt/peta";

export type MateriKelas = {
  kode: string;
  kelas: number;
  elemen: string;
  judul: string;
  tp_terkait: string[];
  esensial_transisi: boolean | null;
  urutan: number;
};

// tercapai = semua TP yang dihitung tercapai; sedang = ada TP yang sedang dikejar (jembatan);
// bacaan = materi tanpa TP adaptif (tidak memengaruhi status TP).
export type StatusPos = "tercapai" | "sedang" | "belum" | "bacaan";

export type BagianPos = "pos_dasar" | "kelasku" | "tambahan";

export type PosJalur = {
  id: string; // unik di peta: kode materi (+ "#tambahan" untuk bagian Pos tambahan)
  kode: string;
  judul: string;
  kelas: number;
  elemen: string;
  bagian: BagianPos;
  status: StatusPos;
  tp_total: number; // banyak TP yang dihitung di pos ini (0 = bacaan)
  tp_tercapai: number; // pos tuntas jika tp_tercapai = tp_total
};

export type JalurMateri = {
  pos: PosJalur[]; // seluruh peta, urut dari awal sampai akhir
  indeks_sekarang: number | null; // pos bertombol play; null = semua pos tuntas (atau peta kosong)
};

export function susunJalurMateri(m: {
  materi: MateriKelas[]; // materi satu mapel
  progres: Map<string, { status: StatusPeta }>;
  kelas_seharusnya: number;
  fase_intensif: boolean;
  rekomendasi_tp: string | null;
  tp_wajib: Set<string>; // TP kelas bawah yang menjadi prasyarat (langsung/tidak langsung) Kelasku
  urutan_tp: Map<string, number>; // urutan belajar TP dari data TP (sesuai graf prasyarat)
  tp_dilatih: Set<string>; // TP yang pernah dijawab di sesi belajar
}): JalurMateri {
  const statusTp = (kode: string): StatusPeta => m.progres.get(kode)?.status ?? "belum_diketahui";
  const tercapai = (tp: string) => statusTp(tp) === "tercapai";
  const belumAtauJembatan = (tp: string) => statusTp(tp) === "belum" || statusTp(tp) === "jembatan";

  // tp = TP yang dihitung di pos ini; judul bisa gabungan beberapa materi (lihat gabungKembar).
  type Calon = { mat: MateriKelas; bagian: BagianPos; tp: string[]; judul: string };
  const calon = (mat: MateriKelas, bagian: BagianPos, tp: string[]): Calon => ({ mat, bagian, tp, judul: mat.judul });
  const tuntas = (c: Calon) => c.tp.length > 0 && c.tp.every(tercapai);
  const memuatRekomendasi = (c: Calon) => m.rekomendasi_tp !== null && c.tp.includes(m.rekomendasi_tp);
  const dilatih = (c: Calon) => c.tp.some((tp) => m.tp_dilatih.has(tp));

  const statusPos = (c: Calon): StatusPos => {
    if (c.tp.length === 0) return "bacaan";
    if (tuntas(c)) return "tercapai";
    return c.tp.some((tp) => statusTp(tp) === "jembatan") ? "sedang" : "belum";
  };

  const kePos = (c: Calon): PosJalur => ({
    id: c.bagian === "tambahan" ? `${c.mat.kode}#tambahan` : c.mat.kode,
    kode: c.mat.kode,
    judul: c.judul,
    kelas: c.mat.kelas,
    elemen: c.mat.elemen,
    bagian: c.bagian,
    status: statusPos(c),
    tp_total: c.tp.length,
    tp_tercapai: c.tp.filter(tercapai).length,
  });

  // Urutan belajar: menurut urutan TP terkecil yang dihitung (sort stabil: kunci sama -> urutan file tetap),
  // lalu materi berurutan dengan himpunan TP yang sama persis digabung jadi satu pos.
  const urutanBelajar = (c: Calon) => Math.min(...c.tp.map((tp) => m.urutan_tp.get(tp) ?? Infinity));
  const kunciTp = (c: Calon) => [...c.tp].sort().join(",");
  const gabungKembar = (daftar: Calon[]): Calon[] =>
    daftar.reduce<Calon[]>((hasil, c) => {
      const akhir = hasil.at(-1);
      if (akhir && kunciTp(akhir) === kunciTp(c)) hasil[hasil.length - 1] = { ...akhir, judul: `${akhir.judul} & ${c.judul}` };
      else hasil.push(c);
      return hasil;
    }, []);
  const urutkanMenurutTp = (daftar: Calon[]): Calon[] =>
    gabungKembar([...daftar].sort((a, b) => urutanBelajar(a) - urutanBelajar(b)));

  const tampil = m.materi
    .filter((mat) => !m.fase_intensif || mat.esensial_transisi !== false)
    .sort((a, b) => a.kelas - b.kelas || a.urutan - b.urutan);
  const kelasBawah = tampil.filter((mat) => mat.kelas < m.kelas_seharusnya);

  // Pos Dasar: yang belum tuntas, pernah dilatih, atau direkomendasikan (supaya pos yang dituntaskan lewat latihan
  // tetap tampil bercentang). Pos tuntas dari asesmen yang tidak pernah dilatih disembunyikan, kecuali yang
  // terakhir: tampil sebagai pos pertama ("bekal").
  const semuaPosDasar = urutkanMenurutTp(
    kelasBawah
      .map((mat) => calon(mat, "pos_dasar", mat.tp_terkait.filter((tp) => m.tp_wajib.has(tp))))
      .filter((c) => c.tp.length > 0),
  );
  const tampilDiPosDasar = (c: Calon) => !tuntas(c) || dilatih(c) || memuatRekomendasi(c);
  // Bekal = pos tuntas tersembunyi terakhir SEBELUM pos pertama yang belum tuntas, supaya bercentang di depan play
  // (bukan TP tuntas yang urutannya sesudah pos play).
  const pertamaBelum = semuaPosDasar.findIndex((c) => !tuntas(c));
  const bekal = semuaPosDasar
    .slice(0, pertamaBelum === -1 ? semuaPosDasar.length : pertamaBelum)
    .filter((c) => !tampilDiPosDasar(c))
    .at(-1);
  const posDasar = semuaPosDasar.filter((c) => c === bekal || tampilDiPosDasar(c)); // tetap urut belajar

  const semuaKelasku = tampil.filter((mat) => mat.kelas === m.kelas_seharusnya).map((mat) => calon(mat, "kelasku", mat.tp_terkait));
  const kelasku = urutkanMenurutTp(semuaKelasku.filter((c) => c.tp.length > 0));
  const segeraHadir = semuaKelasku.filter((c) => c.tp.length === 0); // urutan file

  // Pos tambahan mengikuti aturan file data (TP belum/jembatan), ditambah materi yang direkomendasikan atau pernah dilatih.
  const tambahan = urutkanMenurutTp(
    kelasBawah
      .map((mat) => calon(mat, "tambahan", mat.tp_terkait.filter((tp) => !m.tp_wajib.has(tp))))
      .filter((c) => c.tp.length > 0 && (memuatRekomendasi(c) || dilatih(c) || c.tp.some(belumAtauJembatan))),
  );

  const jalur = [...posDasar, ...kelasku, ...tambahan, ...segeraHadir];

  let i = jalur.findIndex(memuatRekomendasi);
  if (i === -1) i = jalur.findIndex((c) => c.tp.length > 0 && !tuntas(c));

  return { pos: jalur.map(kePos), indeks_sekarang: i === -1 ? null : i };
}
