// Tes kontrak materi: semua narasi awal (data/narasi_materi_*.json) harus lolos skema yang dipakai saat narasi
// dibaca untuk anak (lib/db/materi.ts ambilNarasi). Jika tidak, narasi itu diam-diam diganti kartu cadangan.

import { describe, expect, it } from "vitest";
import dataMateri from "@/data/data_materi_per_kelas_SD.json";
import { DAFTAR_NARASI } from "@/components/anak/sesi/narasi";
import { SkemaIsiNarasi, SkemaTebak } from "./materi";

describe("skema narasi", () => {
  it.each(DAFTAR_NARASI.map((n) => [n.tp_kode, n] as const))("narasi %s lolos skema", (_, n) => {
    const hasil = SkemaIsiNarasi.safeParse({ judul: n.judul, adegan: n.adegan });
    expect(hasil.success, hasil.success ? "" : JSON.stringify(hasil.error.issues)).toBe(true);
  });

  it("tebakan: jawaban harus salah satu pilihan", () => {
    const t = { pertanyaan: "Mana yang lebih banyak?", pilihan: ["3", "5"], jawaban: "4", penjelasan: "Lima lebih banyak." };
    expect(SkemaTebak.safeParse(t).success).toBe(false);
    expect(SkemaTebak.safeParse({ ...t, jawaban: "5" }).success).toBe(true);
  });

  it("menolak narasi tanpa adegan dan ekspresi yang tidak ada", () => {
    expect(SkemaIsiNarasi.safeParse({ judul: "Uji", adegan: [] }).success).toBe(false);
    expect(SkemaIsiNarasi.safeParse({ judul: "Uji", adegan: [{ ekspresi: "marah", teks: "Halo" }] }).success).toBe(false);
  });
});

describe("materi per kelas", () => {
  it("semua materi awal muat di kolom tabel materi", () => {
    for (const m of dataMateri.materi) {
      expect(m.kode.length, m.kode).toBeLessThanOrEqual(30);
      expect(m.judul.length, m.kode).toBeLessThanOrEqual(200);
      expect(m.elemen.length, m.kode).toBeLessThanOrEqual(100);
    }
  });
});
