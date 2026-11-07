// Tes rencana import TP (lib/kurikulum/impor-tp.ts). Jalankan: npm test

import { describe, expect, it } from "vitest";
import dataMatematika from "@/data/data_awal_matematika_fase_A_B.json";
import { rencanakanImporTp, SkemaFileTp, type TpAda } from "./impor-tp";

const file = SkemaFileTp.parse(dataMatematika);
const adaSemua = () => ({
  mapel: new Set([1]),
  tp: new Map<string, TpAda>(file.tujuan_pembelajaran.map(({ kode, ...t }) => [kode, t])),
  prasyarat: new Set(file.prasyarat_tp.map((p) => `${p.tp_kode}>${p.prasyarat_kode}`)),
});

describe("rencanakanImporTp", () => {
  it("file data awal bisa dibaca skema import", () => {
    expect(file.tujuan_pembelajaran).toHaveLength(16);
  });

  it("file yang sama dengan database: tidak ada perubahan", () => {
    const r = rencanakanImporTp(file, adaSemua());
    expect(r).toMatchObject({ mapel_baru: [], tp_baru: [], tp_berubah: [], prasyarat_baru: [], galat: [] });
  });

  it("database kosong: semua TP dan prasyarat baru", () => {
    const r = rencanakanImporTp(file, { mapel: new Set(), tp: new Map(), prasyarat: new Set() });
    expect(r.tp_baru).toHaveLength(16);
    expect(r.prasyarat_baru).toHaveLength(file.prasyarat_tp.length);
    expect(r.mapel_baru.map((m) => m.nama)).toEqual(["Matematika"]);
    expect(r.galat).toEqual([]);
  });

  it("deskripsi TP berubah terdeteksi per kolom", () => {
    const ubah = structuredClone(file);
    ubah.tujuan_pembelajaran[10].deskripsi = "Deskripsi baru";
    const r = rencanakanImporTp(ubah, adaSemua());
    expect(r.tp_berubah).toEqual([{ tp: ubah.tujuan_pembelajaran[10], kolom: ["deskripsi"] }]);
  });

  it("TP baru dengan prasyarat ke TP lama", () => {
    const tambah = structuredClone(file);
    tambah.tujuan_pembelajaran.push({ ...file.tujuan_pembelajaran[15], kode: "B9", urutan: 17, deskripsi: "TP baru" });
    tambah.prasyarat_tp.push({ tp_kode: "B9", prasyarat_kode: "B8" });
    const r = rencanakanImporTp(tambah, adaSemua());
    expect(r.tp_baru.map((t) => t.kode)).toEqual(["B9"]);
    expect(r.prasyarat_baru).toEqual([{ tp_kode: "B9", prasyarat_kode: "B8" }]);
    expect(r.galat).toEqual([]);
  });

  it("menolak prasyarat melingkar, TP tak dikenal, mapel tak dikenal, dan kode kembar", () => {
    const rusak = structuredClone(file);
    rusak.prasyarat_tp.push({ tp_kode: "A1", prasyarat_kode: "B8" }); // B8 bergantung pada A1 -> lingkaran
    rusak.prasyarat_tp.push({ tp_kode: "B8", prasyarat_kode: "Z1" });
    rusak.tujuan_pembelajaran.push({ ...file.tujuan_pembelajaran[0], mapel_id: 99 });
    const g = rencanakanImporTp(rusak, adaSemua()).galat.join(" | ");
    expect(g).toMatch(/lingkaran/);
    expect(g).toMatch(/Z1/);
    expect(g).toMatch(/mapel_id 99/);
    expect(g).toMatch(/kembar/);
  });
});
