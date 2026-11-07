// Pembaca kolom `visual` soal (emoji pengganti gambar).
// Fungsi murni, dites di visual-soal.test.ts. Dipakai KartuSoal (sesi belajar DAN asesmen).
//
// Format `visual` di data soal:
//   "🍊🍊🍊 | 🍊🍊🍊"            -> kelompok (setiap kelompok tampil di kotak "piring" sendiri)
//   "🔵🔵🔵\n🔵🔵"                 -> beberapa baris
//   "[ikat 10 lidi] | | |"       -> ikatan lidi + lidi lepas
//   "🍪🍪🍪 (4 kue dimakan)"      -> teks dengan keterangan di dalam kurung

export type BarisVisual =
  | { jenis: "kelompok"; isi: string[] }
  | { jenis: "lidi"; ikat: number; isi_ikat: number; lepas: number }
  | { jenis: "teks"; isi: string; keterangan: string | null };

const POLA_IKAT = /\[ikat\s*(\d+)?[^\]]*\]/g;

export function uraiVisual(visual: string | null): BarisVisual[] {
  if (!visual?.trim()) return [];
  return visual
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((baris): BarisVisual => {
      const ikat = [...baris.matchAll(POLA_IKAT)];
      if (ikat.length > 0) {
        const sisa = baris.replace(POLA_IKAT, "");
        return {
          jenis: "lidi",
          ikat: ikat.length,
          isi_ikat: Number(ikat[0][1] ?? 10),
          lepas: (sisa.match(/\|/g) ?? []).length,
        };
      }
      if (baris.includes("|")) {
        return { jenis: "kelompok", isi: baris.split("|").map((k) => k.trim()).filter(Boolean) };
      }
      const kurung = baris.match(/\(([^)]*)\)/);
      return {
        jenis: "teks",
        isi: baris.replace(/\([^)]*\)/, "").trim(),
        keterangan: kurung ? kurung[1].trim() : null,
      };
    });
}

// Huruf A-D untuk pilihan. Urutan pilihan sudah diacak server.
export const HURUF_PILIHAN = ["A", "B", "C", "D"];
