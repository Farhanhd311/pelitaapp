// Tes unit /lib/bkt. Acuan: data/tes_kasus_bkt.json (nilai hasil hitungan, bukan kode).
// Saat ini baru memastikan file kasus uji terbaca. Tes perbaruiBKT(), setelahJawab(), dan putuskan()
// ditambahkan bersama logika BKT.

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FILE_KASUS = path.resolve(import.meta.dirname, "../../data/tes_kasus_bkt.json");

describe("data kasus uji BKT", () => {
  it("terbaca dan berisi semua kelompok kasus", () => {
    const kasus = JSON.parse(fs.readFileSync(FILE_KASUS, "utf8"));

    expect(kasus).toHaveProperty("perbaruiBKT");
    expect(kasus).toHaveProperty("keputusan_tp");
    expect(kasus).toHaveProperty("asesmen_raka");
    expect(kasus).toHaveProperty("sesi_formatif_b3");
    expect(Array.isArray(kasus.perbaruiBKT)).toBe(true);
    expect(kasus.perbaruiBKT.length).toBeGreaterThan(0);
  });
});
