// Narasi materi (kartu belajar bercerita) per TP, dari file data. Menambah mapel = menambah file data di DAFTAR.
// Status isi: draf, wajib ditinjau guru SD (lihat meta di file data). Struktur dicek di narasi.test.ts.

import narasiBahasaIndonesia from "@/data/narasi_materi_bahasa_indonesia.json";
import narasiIpas from "@/data/narasi_materi_ipas.json";
import narasiMatematika from "@/data/narasi_materi_matematika.json";
import narasiPendidikanPancasila from "@/data/narasi_materi_pendidikan_pancasila.json";
import type { EkspresiPijar } from "@/components/anak/MascotPijar";

export type AdeganNarasi = {
  ekspresi: EkspresiPijar;
  teks: string;
  visual?: string; // format sama dengan kolom `visual` soal (lihat components/anak/visual-soal.ts)
  tebak?: { pertanyaan: string; pilihan: string[]; jawaban: string; penjelasan: string };
  kunci?: boolean; // adegan terakhir: inti materi
};

export type Narasi = { tp_kode: string; judul: string; adegan: AdeganNarasi[] };

export const DAFTAR_NARASI = [
  ...narasiMatematika.narasi,
  ...narasiBahasaIndonesia.narasi,
  ...narasiIpas.narasi,
  ...narasiPendidikanPancasila.narasi,
] as Narasi[];

export function cariNarasi(tpKode: string): Narasi | null {
  return DAFTAR_NARASI.find((n) => n.tp_kode === tpKode) ?? null;
}
