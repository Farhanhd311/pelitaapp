// Menyusun peta TP: Kelasku dan Pos Dasar (PANDUAN 7.3, PRD 9.4). Fungsi MURNI.
//   Kelasku   = TP kelas seharusnya anak.
//   Pos Dasar = TP kelas di bawahnya. "Wajib" = prasyarat (langsung/tidak langsung) TP Kelasku yang belum tercapai;
//               sisanya opsional.
//   Terkunci  = ada prasyarat langsung yang belum tercapai (kerjakan modul jembatan di Pos Dasar dulu).
//   Fase intensif -> hanya TP esensial_transisi (prinsip ATP Transisi).

import { cariLeluhur, type GrafPrasyarat } from "./graph";

export type StatusPeta = "belum_diketahui" | "belum" | "jembatan" | "tercapai";

// Status yang berarti anak jelas belum menguasai TP ini (dari asesmen atau sedang dikejar di Pos Dasar).
function perluDikejar(s: StatusPeta): boolean {
  return s === "belum" || s === "jembatan";
}

export type TpPeta = { kode: string; kelas: number; urutan: number; deskripsi: string; esensial_transisi: boolean };

export type KotakPetaHasil = TpPeta & {
  status: StatusPeta;
  sumber_status: "diuji" | "disimpulkan" | null;
  tersedia: boolean;
  terkunci: boolean;
};

export type HasilPeta = {
  kelas_kelasku: number;
  kelasku: KotakPetaHasil[];
  pos_dasar: (KotakPetaHasil & { wajib: boolean })[];
  rekomendasi_tp: string | null;
  pos_wajib_tersisa: number;
  hanya_esensial: boolean;
};

export function susunPeta(m: {
  daftar_tp: TpPeta[];
  graf: GrafPrasyarat;
  progres: Map<string, { status: StatusPeta; sumber_status: "diuji" | "disimpulkan" | null }>;
  kelas_seharusnya: number;
  fase_intensif: boolean;
  tp_dengan_konten: Set<string>;
}): HasilPeta {
  const status = (kode: string): StatusPeta => m.progres.get(kode)?.status ?? "belum_diketahui";

  // Kelas Kelasku: kelas seharusnya, atau kelas tertinggi yang ada di data jika lebih rendah.
  const kelasAda = [...new Set(m.daftar_tp.map((t) => t.kelas))].sort((a, b) => a - b);
  const kelasKelasku = [...kelasAda].reverse().find((k) => k <= m.kelas_seharusnya) ?? kelasAda[0];

  const kotak = (t: TpPeta): KotakPetaHasil => ({
    ...t,
    status: status(t.kode),
    sumber_status: m.progres.get(t.kode)?.sumber_status ?? null,
    tersedia: m.tp_dengan_konten.has(t.kode),
    // Terkunci hanya jika ada prasyarat langsung yang JELAS belum dikuasai (belum/jembatan).
    // Prasyarat belum_diketahui (TP kelas bawah yang tidak perlu diuji saat asesmen) tidak mengunci.
    terkunci: m.graf.prasyarat.get(t.kode)!.some((pr) => perluDikejar(status(pr))),
  });

  const tampil = m.daftar_tp.filter((t) => !m.fase_intensif || t.esensial_transisi);
  const kelasku = tampil.filter((t) => t.kelas === kelasKelasku).map(kotak);

  // Prasyarat semua TP Kelasku yang jelas belum dikuasai = pos wajib. Yang belum_diketahui = pos opsional.
  const prasyaratKelasku = new Set<string>();
  for (const t of kelasku) for (const k of cariLeluhur(m.graf, t.kode)) prasyaratKelasku.add(k);
  const posDasar = tampil
    .filter((t) => t.kelas < kelasKelasku)
    .map((t) => {
      const k = kotak(t);
      return { ...k, wajib: prasyaratKelasku.has(t.kode) && perluDikejar(k.status) };
    });

  // Rekomendasi: TP yang sedang dikejar (jembatan) dulu, lalu TP belum terendah yang tidak terkunci.
  // Pos wajib didahulukan sebelum Kelasku (sisipkan modul jembatan, lalu kembali ke TP kelasnya).
  const calon = [...posDasar, ...kelasku.map((k) => ({ ...k, wajib: false }))]
    .filter((k) => k.status !== "tercapai" && !k.terkunci)
    .sort(
      (a, b) =>
        Number(b.status === "jembatan") - Number(a.status === "jembatan") ||
        Number(b.wajib) - Number(a.wajib) ||
        Number(b.kelas === kelasKelasku) - Number(a.kelas === kelasKelasku) ||
        a.urutan - b.urutan,
    );

  return {
    kelas_kelasku: kelasKelasku,
    kelasku,
    pos_dasar: posDasar,
    rekomendasi_tp: calon[0]?.kode ?? null,
    pos_wajib_tersisa: posDasar.filter((p) => p.wajib).length,
    hanya_esensial: m.fase_intensif,
  };
}
