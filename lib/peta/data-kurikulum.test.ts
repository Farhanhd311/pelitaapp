// Tes integritas data kurikulum semua mapel (file yang diimpor scripts/seed.mts) dan kaitannya dengan peta materi:
//   - kode TP unik di semua mapel, prasyarat menunjuk TP yang ada, setiap TP punya cukup soal;
//   - soal yang ditulis dengan bantuan AI (IPAS, Pendidikan Pancasila) lolos pemeriksaan otomatis yang sama dengan
//     generator soal admin (lib/ai/validasi.ts: 4 pilihan, 1 kunci, miskonsepsi, kalimat pendek, kata dihindari);
//   - setiap mapel punya minimal 5 TP yang bisa dimainkan untuk anak kelas 4 (kebutuhan demo);
//   - tp_terkait di data_materi_per_kelas_SD.json menunjuk TP yang ada.
// Jalankan: npm test

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { periksaSoalAI } from "@/lib/ai/validasi";

const bacaData = <T,>(nama: string) => JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../../data", nama), "utf8")) as T;

type Soal = {
  id: string;
  tp_kode: string;
  penggunaan: string;
  pertanyaan: string;
  visual?: string | null;
  pilihan: { teks: string; benar: boolean; miskonsepsi?: string | null }[];
  pembahasan?: string;
};
type Kurikulum = {
  mapel: { id: number; nama: string }[];
  tujuan_pembelajaran: { kode: string; mapel_id: number; kelas: number }[];
  prasyarat_tp: { tp_kode: string; prasyarat_kode: string }[];
  soal: Soal[];
};

// Sama dengan daftar KURIKULUM di scripts/seed.mts.
const KURIKULUM: { file: string; sumber: "manual" | "ai" }[] = [
  { file: "data_awal_matematika_fase_A_B.json", sumber: "manual" },
  { file: "data_awal_bahasa_indonesia_fase_A_B.json", sumber: "manual" },
  { file: "data_awal_ipas_kelas_4.json", sumber: "ai" },
  { file: "data_awal_pendidikan_pancasila_kelas_4.json", sumber: "ai" },
];
const data = KURIKULUM.map((k) => ({ ...k, isi: bacaData<Kurikulum>(k.file) }));
const semuaTp = data.flatMap((d) => d.isi.tujuan_pembelajaran);
const kodeTp = new Set(semuaTp.map((t) => t.kode));

const pengaturan = bacaData<{ pengaturan: Record<string, number> }>("seed_pengaturan_sistem.json").pengaturan;
const KELAS_DEMO = 4; // kelas seharusnya Raka (PANDUAN 14)

describe("data kurikulum semua mapel", () => {
  it("kode TP unik di semua mapel dan prasyarat menunjuk TP yang ada", () => {
    expect(kodeTp.size).toBe(semuaTp.length);
    for (const d of data) {
      for (const p of d.isi.prasyarat_tp) {
        expect(kodeTp, `${d.file}: ${p.prasyarat_kode} > ${p.tp_kode}`).toContain(p.tp_kode);
        expect(kodeTp, `${d.file}: ${p.prasyarat_kode} > ${p.tp_kode}`).toContain(p.prasyarat_kode);
      }
    }
  });

  it.each(data.map((d) => [d.file, d] as const))("%s: setiap TP punya minimal 4 soal dengan 4 pilihan dan tepat 1 kunci", (_, d) => {
    for (const tp of d.isi.tujuan_pembelajaran) {
      expect(d.isi.soal.filter((s) => s.tp_kode === tp.kode).length, tp.kode).toBeGreaterThanOrEqual(4);
    }
    for (const s of d.isi.soal) {
      expect(kodeTp, s.id).toContain(s.tp_kode);
      expect(s.pilihan, s.id).toHaveLength(4);
      expect(s.pilihan.filter((p) => p.benar), s.id).toHaveLength(1);
    }
  });

  it.each(data.filter((d) => d.sumber === "ai").map((d) => [d.file, d] as const))(
    "%s: soal buatan AI lolos pemeriksaan otomatis generator soal",
    (_, d) => {
      for (const s of d.isi.soal) {
        const lain = d.isi.soal.filter((x) => x.tp_kode === s.tp_kode && x.id !== s.id).map((x) => x.pertanyaan);
        const hasil = periksaSoalAI(
          { pertanyaan: s.pertanyaan, visual: s.visual ?? null, pembahasan: s.pembahasan ?? "", pilihan: s.pilihan.map((p) => ({ ...p, miskonsepsi: p.miskonsepsi ?? null })) },
          {
            soal_ada: lain,
            maks_kata_per_kalimat: pengaturan["generator_soal.maks_kata_per_kalimat"],
            ambang_kemiripan: pengaturan["generator_soal.ambang_kemiripan"],
          },
        );
        expect(hasil.galat, s.id).toEqual([]);
      }
    },
  );

  it("setiap mapel punya minimal 5 TP untuk anak kelas 4 (sampai kelas 4)", () => {
    for (const d of data) {
      for (const m of d.isi.mapel) {
        const tp = d.isi.tujuan_pembelajaran.filter((t) => t.mapel_id === m.id && t.kelas <= KELAS_DEMO);
        expect(tp.length, m.nama).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it("tp_terkait di data materi menunjuk TP yang ada; materi kelas 4 IPAS & Pendidikan Pancasila semuanya punya TP", () => {
    const materi = bacaData<{ materi: { kode: string; mapel_id: number; kelas: number; tp_terkait: string[] }[] }>(
      "data_materi_per_kelas_SD.json",
    ).materi;
    for (const m of materi) for (const tp of m.tp_terkait) expect(kodeTp, m.kode).toContain(tp);
    const mapelAi = new Set(data.filter((d) => d.sumber === "ai").flatMap((d) => d.isi.mapel.map((m) => m.id)));
    for (const m of materi.filter((x) => mapelAi.has(x.mapel_id) && x.kelas === KELAS_DEMO)) {
      expect(m.tp_terkait.length, m.kode).toBeGreaterThan(0);
    }
  });
});
