// Tes unit /lib/krisis. Daftar kata kunci di bawah HANYA contoh untuk tes (bukan daftar resmi);
// daftar resmi ada di PENGATURAN_SISTEM krisis.daftar_kata_kunci (disiapkan tim, ditinjau psikolog).

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cekKataKunciKrisis, normalisasiTeks, tentukanLevelRujukan, type AturanLevel } from "./detektor";

const DAFTAR_CONTOH = ["ingin mati", "sakiti diri", "tidak mau hidup"];

const seed = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, "../../data/seed_pengaturan_sistem.json"), "utf8"),
).pengaturan;
const atur = {
  kode_kebutuhan: seed["rujukan.kode_kebutuhan"] as Record<string, number>,
  aturan_level: seed["rujukan.aturan_level"] as AturanLevel[],
};

describe("cekKataKunciKrisis", () => {
  it("menangkap kata kunci walau huruf besar dan bertanda baca", () => {
    expect(cekKataKunciKrisis("Aku INGIN MATI saja!!", DAFTAR_CONTOH).terdeteksi).toBe(true);
    // Tanda baca di tengah frasa tetap tertangkap (tanda baca menjadi spasi).
    expect(cekKataKunciKrisis("Aku ingin... mati saja", DAFTAR_CONTOH).terdeteksi).toBe(true);
  });

  it("menangkap penulisan yang dipisah-pisah (ambang sensitif)", () => {
    expect(cekKataKunciKrisis("aku mau s-a-k-i-t-i d i r i", DAFTAR_CONTOH).terdeteksi).toBe(true);
  });

  it("cerita biasa tidak terdeteksi", () => {
    expect(cekKataKunciKrisis("hari ini aku bosan, mau main sama teman", DAFTAR_CONTOH)).toEqual({
      terdeteksi: false,
      jumlah_cocok: 0,
    });
  });

  it("daftar kosong adalah galat, bukan lolos diam-diam", () => {
    expect(() => cekKataKunciKrisis("apa saja", [])).toThrow(/kosong/);
    expect(() => cekKataKunciKrisis("apa saja", ["  ", "!!"])).toThrow(/kosong/);
  });

  it("normalisasi membuang aksen dan tanda baca", () => {
    expect(normalisasiTeks("  Sédih, BANGET!! ")).toBe("sedih banget");
  });
});

describe("tentukanLevelRujukan", () => {
  it("chip kebutuhan -> level 1 dan 2", () => {
    expect(tentukanLevelRujukan({ kebutuhan: "teman", sinyal_krisis: false, distres_berulang: false }, atur).aturan?.level).toBe(1);
    expect(tentukanLevelRujukan({ kebutuhan: "cerita", sinyal_krisis: false, distres_berulang: false }, atur).aturan?.level).toBe(2);
  });

  it("tidak butuh apa-apa -> tanpa rujukan", () => {
    expect(tentukanLevelRujukan({ kebutuhan: "tidak_ada", sinyal_krisis: false, distres_berulang: false }, atur)).toEqual({
      darurat: false,
      aturan: null,
    });
  });

  it("distres berulang -> level 3 walau anak memilih chip lain", () => {
    expect(tentukanLevelRujukan({ kebutuhan: "teman", sinyal_krisis: false, distres_berulang: true }, atur).aturan?.level).toBe(3);
  });

  it("sinyal krisis -> darurat, tidak menunggu izin", () => {
    const h = tentukanLevelRujukan({ kebutuhan: "tidak_ada", sinyal_krisis: true, distres_berulang: false }, atur);
    expect(h.darurat).toBe(true);
  });

  it("level 1-3 butuh persetujuan orang tua (dari tabel aturan)", () => {
    expect(atur.aturan_level.every((a) => a.butuh_persetujuan_orang_tua)).toBe(true);
  });
});
