// Tes struktur data narasi materi (data/narasi_materi_*.json), supaya suntingan tim tetap aman:
// setiap TP di semua mapel punya narasi, tebakan valid, adegan kunci di akhir, dan tanpa kata terlarang (PANDUAN 8, 13).
// Jalankan: npm test

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DAFTAR_NARASI } from "./narasi";

const EKSPRESI = ["sambut", "senang", "tenang", "penasaran", "semangat", "terkejut", "empati", "tekad", "istirahat", "mengintip", "peduli", "transisi"];
// "salah" juga menangkap "masalah"; sengaja ketat untuk teks anak.
const KATA_TERLARANG = ["salah", "rumah sakit", "dokter", "obat", "suntik", "jarum", "sakit", "penyakit", "tertinggal"];

// Sama dengan daftar KURIKULUM di scripts/seed.mts.
const FILE_KURIKULUM = [
  "data_awal_matematika_fase_A_B.json",
  "data_awal_bahasa_indonesia_fase_A_B.json",
  "data_awal_ipas_kelas_4.json",
  "data_awal_pendidikan_pancasila_kelas_4.json",
];
const semuaTp = FILE_KURIKULUM.flatMap(
  (f) =>
    (JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../../../data", f), "utf8")) as { tujuan_pembelajaran: { kode: string }[] })
      .tujuan_pembelajaran,
);

describe("narasi materi", () => {
  it("setiap TP di semua mapel punya tepat satu narasi", () => {
    const kode = DAFTAR_NARASI.map((n) => n.tp_kode);
    expect(new Set(kode).size).toBe(kode.length);
    for (const tp of semuaTp) expect(kode).toContain(tp.kode);
  });

  it.each(DAFTAR_NARASI.map((n) => [n.tp_kode, n] as const))("%s: struktur adegan valid", (_, n) => {
    expect(n.adegan.length).toBeGreaterThanOrEqual(3);
    for (const a of n.adegan) {
      expect(EKSPRESI).toContain(a.ekspresi);
      expect(a.teks.trim().length).toBeGreaterThan(0);
      if (a.tebak) {
        expect(a.tebak.pilihan).toContain(a.tebak.jawaban);
        expect(new Set(a.tebak.pilihan).size).toBe(a.tebak.pilihan.length);
      }
    }
    // Tepat satu adegan kunci, dan selalu di akhir.
    expect(n.adegan.filter((a) => a.kunci)).toHaveLength(1);
    expect(n.adegan.at(-1)?.kunci).toBe(true);
  });

  it("tidak memakai kata terlarang untuk anak", () => {
    const teks = JSON.stringify(DAFTAR_NARASI).toLowerCase();
    for (const kata of KATA_TERLARANG) expect(teks, kata).not.toContain(kata);
  });
});
