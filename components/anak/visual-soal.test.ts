// Tes pembaca `visual` soal: semua format di data soal Matematika harus terbaca.

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { teksDibacakan, uraiVisual } from "./visual-soal";
import type { SoalTampil } from "@/lib/kontrak/umum";

describe("uraiVisual", () => {
  it("kelompok dipisah garis tegak (jeruk di 4 piring)", () => {
    expect(uraiVisual("🍊🍊🍊 | 🍊🍊🍊 | 🍊🍊🍊 | 🍊🍊🍊")).toEqual([{ jenis: "kelompok", isi: ["🍊🍊🍊", "🍊🍊🍊", "🍊🍊🍊", "🍊🍊🍊"] }]);
  });

  it("beberapa baris", () => {
    expect(uraiVisual("🍎🍎🍎🍎🍎\n🍌🍌🍌")).toHaveLength(2);
  });

  it("ikatan lidi dan lidi lepas", () => {
    expect(uraiVisual("[ikat 10 lidi] | | | | | |")).toEqual([{ jenis: "lidi", ikat: 1, isi_ikat: 10, lepas: 6 }]);
    expect(uraiVisual("[ikat 10] [ikat 10] [ikat 10] [ikat 10] | | | | | | | | |")).toEqual([
      { jenis: "lidi", ikat: 4, isi_ikat: 10, lepas: 9 },
    ]);
  });

  it("keterangan di dalam kurung dipisah", () => {
    expect(uraiVisual("🍪🍪🍪 (4 kue dimakan)")).toEqual([{ jenis: "teks", isi: "🍪🍪🍪", keterangan: "4 kue dimakan" }]);
  });

  it("kosong -> tanpa visual", () => {
    expect(uraiVisual(null)).toEqual([]);
  });

  it("semua visual di data Matematika terbaca tanpa baris kosong", () => {
    const data = JSON.parse(
      fs.readFileSync(path.resolve(import.meta.dirname, "../../data/data_awal_matematika_fase_A_B.json"), "utf8"),
    ) as { soal: { visual?: string }[] };
    for (const s of data.soal.filter((x) => x.visual)) {
      const baris = uraiVisual(s.visual!);
      expect(baris.length, s.visual).toBeGreaterThan(0);
      for (const b of baris) if (b.jenis === "teks") expect(b.isi.length, s.visual).toBeGreaterThan(0);
    }
  });
});

describe("teksDibacakan", () => {
  it("memuat soal dan semua pilihan", () => {
    const soal: SoalTampil = {
      soal_id: "X",
      tp_kode: "B3",
      pertanyaan: "6 × 7 = ...",
      bacaan: null,
      visual: null,
      pilihan: [13, 36, 48, 42].map((n, i) => ({ pilihan_id: i + 1, teks: String(n) })),
    };
    expect(teksDibacakan(soal)).toBe("6 × 7 = .... A, 13. B, 36. C, 48. D, 42");
  });
});
