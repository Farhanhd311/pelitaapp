// Tes fungsi murni /lib/pengaturan: memilih versi pengaturan yang berlaku pada waktu tertentu.

import { describe, expect, it } from "vitest";
import { keParameterAsesmen, pilihNilaiPada, type BarisPengaturan } from "./index";
import { validasiPengaturan } from "./rentang";

const v1 = new Date("2026-11-07T01:00:00Z");
const v2 = new Date("2026-11-07T05:00:00Z");
const riwayat: BarisPengaturan[] = [
  { kunci: "bkt.ambang_tercapai", nilai: 0.85, versi: 1, diubah_at: v1 },
  { kunci: "bkt.ambang_tercapai", nilai: 0.9, versi: 2, diubah_at: v2 },
  { kunci: "bkt.tebakan", nilai: 0.25, versi: 1, diubah_at: v1 },
];

describe("pilihNilaiPada", () => {
  it("asesmen yang dimulai sebelum perubahan tetap memakai versi lama", () => {
    expect(pilihNilaiPada(riwayat, new Date("2026-11-07T03:00:00Z"))["bkt.ambang_tercapai"]).toBe(0.85);
  });

  it("asesmen baru setelah perubahan memakai versi baru", () => {
    expect(pilihNilaiPada(riwayat, new Date("2026-11-07T06:00:00Z"))["bkt.ambang_tercapai"]).toBe(0.9);
  });

  it("waktu sebelum semua versi memakai versi pertama", () => {
    expect(pilihNilaiPada(riwayat, new Date("2026-01-01T00:00:00Z"))["bkt.ambang_tercapai"]).toBe(0.85);
  });

  it("kunci lain tidak terpengaruh", () => {
    expect(pilihNilaiPada(riwayat, v2)["bkt.tebakan"]).toBe(0.25);
  });
});

describe("validasiPengaturan (rentang aman PANDUAN 8.4)", () => {
  const aktif = {
    "bkt.ambang_tercapai": 0.85,
    "bkt.ambang_belum": 0.3,
    "bkt.ceroboh": 0.1,
    "bkt.ceroboh_lelah": 0.3,
    "bkt.min_soal_tercapai": 3,
    "bkt.min_soal_per_tp": 2,
    "bkt.maks_soal_per_tp": 4,
    "sesi.durasi_ringan": 10,
    "sesi.durasi_normal": 20,
    "sesi.durasi_penuh": 30,
  };

  it("nilai dalam rentang diterima", () => {
    expect(validasiPengaturan("bkt.ambang_tercapai", 0.9, aktif)).toBeNull();
  });
  it("nilai di luar rentang ditolak", () => {
    expect(validasiPengaturan("bkt.ambang_tercapai", 0.5, aktif)).toMatch(/0.7 dan 0.99/);
    expect(validasiPengaturan("bkt.min_soal_tercapai", 2.5, aktif)).toMatch(/bulat/);
  });
  it("kombinasi tidak logis ditolak", () => {
    // (ambang tercapai <= ambang belum tidak mungkin terjadi: rentangnya 0,7-0,99 vs 0,05-0,5)
    expect(validasiPengaturan("bkt.min_soal_tercapai", 5, aktif)).toMatch(/melebihi maksimal/);
    expect(validasiPengaturan("bkt.ceroboh_lelah", 0.05, aktif)).toMatch(/ceroboh/);
    expect(validasiPengaturan("sesi.durasi_ringan", 15, { ...aktif, "sesi.durasi_normal": 12 })).toMatch(/durasi harus naik/);
  });
  it("daftar kata kunci krisis tidak boleh dikosongkan", () => {
    expect(validasiPengaturan("krisis.daftar_kata_kunci", [], aktif)).toMatch(/tidak boleh kosong/);
    expect(validasiPengaturan("krisis.daftar_kata_kunci", ["contoh"], aktif)).toBeNull();
  });
  it("kunci di luar daftar tidak bisa diubah", () => {
    expect(validasiPengaturan("bkt.belajar_saat_asesmen", 0.1, aktif)).toMatch(/tidak bisa diubah/);
  });
});

describe("keParameterAsesmen", () => {
  it("menolak pengaturan yang tidak lengkap", () => {
    expect(() => keParameterAsesmen({ "bkt.tebakan": 0.25 })).toThrow(/tidak lengkap/);
  });
});
