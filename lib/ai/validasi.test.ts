// Tes pemeriksaan keluaran LLM (lib/ai/validasi.ts).

import { describe, expect, it } from "vitest";
import { hitungKalimat, hitungKunciSoal, kataDihindariDalam, kemiripan, periksaLaporan, periksaSoalAI, periksaTutor } from "./validasi";
import type { KeluaranSoal } from "./schemas";

const atur = { soal_ada: ["6 × 7 = ..."], maks_kata_per_kalimat: 20, ambang_kemiripan: 0.8 };
const soalBaik: KeluaranSoal = {
  pertanyaan: "7 × 8 = ...",
  visual: null,
  pilihan: [
    { teks: "56", benar: true, miskonsepsi: null },
    { teks: "15", benar: false, miskonsepsi: "Menjumlahkan, bukan mengalikan" },
    { teks: "49", benar: false, miskonsepsi: "Kurang satu kelompok (7 × 7)" },
    { teks: "64", benar: false, miskonsepsi: "Lebih satu kelompok (8 × 8)" },
  ],
  pembahasan: "7 × 8 artinya 7 kelompok berisi 8.",
};

describe("periksaTutor", () => {
  it("lolos jika singkat dan ramah", () => {
    expect(periksaTutor({ penjelasan: "Kamu menjumlahkan 6 dan 7. Perkalian itu kelompok.", petunjuk: "Yuk hitung 6 kelompok berisi 7!" }, 3)).toBeNull();
  });
  it("menolak lebih dari batas kalimat", () => {
    expect(periksaTutor({ penjelasan: "Satu. Dua. Tiga. Empat.", petunjuk: "Coba." }, 3)).toMatch(/lebih dari 3/);
  });
  it("menolak kata 'salah' dan kata sensitif", () => {
    expect(periksaTutor({ penjelasan: "Jawabanmu salah.", petunjuk: "Coba lagi." }, 3)).toMatch(/salah/);
    expect(periksaTutor({ penjelasan: "Seperti minum obat.", petunjuk: "Coba lagi." }, 3)).toMatch(/obat/);
  });
  it("kata dihindari dicek per kata utuh (matematika aman)", () => {
    expect(kataDihindariDalam("belajar matematika itu seru")).toEqual([]);
  });
  it("menghitung kalimat", () => {
    expect(hitungKalimat("Halo! Apa kabar? Baik.")).toBe(3);
  });
});

describe("periksaLaporan", () => {
  it("harus mencakup semua TP, tidak lebih", () => {
    const k = { pengantar: "x", saran: "y", capaian: [{ tp_kode: "B3", deskripsi: "Ananda ..." }] };
    expect(periksaLaporan(k, ["B3"])).toBeNull();
    expect(periksaLaporan(k, ["B3", "B4"])).toMatch(/B4/);
    expect(periksaLaporan(k, [])).toMatch(/tidak diminta/);
  });
});

describe("generator soal", () => {
  it("menghitung kunci soal hitungan langsung", () => {
    expect(hitungKunciSoal("6 × 7 = ...")).toBe(42);
    expect(hitungKunciSoal("24 : 6 = ?")).toBe(4);
    expect(hitungKunciSoal("Ani punya 3 apel")).toBeNull();
  });

  it("soal yang baik lolos dan kuncinya dicek program", () => {
    expect(periksaSoalAI(soalBaik, atur)).toEqual({ galat: [], kunci_dicek_program: true });
  });

  it("kunci dari LLM yang keliru ditolak", () => {
    const keliru = { ...soalBaik, pilihan: soalBaik.pilihan.map((p) => ({ ...p, benar: p.teks === "64" })) };
    expect(periksaSoalAI(keliru, atur).galat.join()).toMatch(/perhitungan program \(56\)/);
  });

  it("menolak jumlah pilihan/kunci yang salah, pilihan ganda, dan pengecoh tanpa miskonsepsi", () => {
    const rusak: KeluaranSoal = {
      ...soalBaik,
      pilihan: [
        { teks: "56", benar: true, miskonsepsi: null },
        { teks: "56", benar: true, miskonsepsi: null },
        { teks: "10", benar: false, miskonsepsi: null },
      ],
    };
    const g = periksaSoalAI(rusak, atur).galat.join(" | ");
    expect(g).toMatch(/tepat 4 pilihan/);
    expect(g).toMatch(/tepat 1 kunci/);
    expect(g).toMatch(/pilihan yang sama/);
    expect(g).toMatch(/tanpa miskonsepsi/);
  });

  it("menolak soal yang terlalu mirip dengan soal yang ada", () => {
    expect(periksaSoalAI({ ...soalBaik, pertanyaan: "6 × 7 = ..." }, atur).galat.join()).toMatch(/terlalu mirip/);
    expect(kemiripan("a b c", "a b c")).toBe(1);
  });
});
