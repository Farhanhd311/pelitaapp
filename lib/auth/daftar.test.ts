// Tes fungsi pendaftaran (lib/auth/daftar.ts). Jalankan: npm test

import { describe, expect, it } from "vitest";
import { hitungKelasSeharusnya, normalisasiNoWa, samarkanNoWa } from "./daftar";

describe("hitungKelasSeharusnya", () => {
  const nov2026 = new Date("2026-11-08T00:00:00Z");
  it("Raka (lahir Maret 2016) di November 2026 -> kelas 4", () => {
    expect(hitungKelasSeharusnya("2016-03-15", nov2026)).toBe(4);
  });
  it("lahir setelah Juli masuk satu tahun ajaran lebih lambat", () => {
    expect(hitungKelasSeharusnya("2016-09-01", nov2026)).toBe(3);
  });
  it("sebelum Juli masih tahun ajaran sebelumnya", () => {
    expect(hitungKelasSeharusnya("2016-03-15", new Date("2027-05-01T00:00:00Z"))).toBe(4);
    expect(hitungKelasSeharusnya("2016-03-15", new Date("2027-07-15T00:00:00Z"))).toBe(5);
  });
  it("dibatasi kelas 1-6, tanggal rusak -> null", () => {
    expect(hitungKelasSeharusnya("2022-01-01", nov2026)).toBe(1);
    expect(hitungKelasSeharusnya("2005-01-01", nov2026)).toBe(6);
    expect(hitungKelasSeharusnya("bukan-tanggal", nov2026)).toBeNull();
  });
});

describe("normalisasiNoWa", () => {
  it.each([
    ["0812-3456-7890", "6281234567890"],
    ["+62 812 3456 7890", "6281234567890"],
    ["6281234567890", "6281234567890"],
  ])("%s -> %s", (masuk, keluar) => expect(normalisasiNoWa(masuk)).toBe(keluar));
  it.each(["12345", "0212345678", "08abc", "+1 555 123 4567"])("menolak %s", (masuk) => expect(normalisasiNoWa(masuk)).toBeNull());
});

it("samarkanNoWa menyembunyikan bagian tengah", () => {
  expect(samarkanNoWa("6281234567890")).toBe("0812•••••890");
});
