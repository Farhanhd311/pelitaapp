// Tes unit susunJalurMateri memakai data materi asli (data/data_materi_per_kelas_SD.json), graf prasyarat asli
// (data_awal_matematika_fase_A_B.json), dan hasil asesmen Raka di skenario demo (PANDUAN 14): titik mulai B3,
// kelas seharusnya 4.
// Jalankan: npm test

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buatGraf, cariLeluhur, type RelasiPrasyarat, type TpGraf } from "@/lib/bkt/graph";
import type { StatusPeta } from "@/lib/bkt/peta";
import { susunJalurMateri, type JalurMateri, type MateriKelas } from "./jalur-materi";

const bacaData = <T,>(nama: string) => JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../../data", nama), "utf8")) as T;

const data = bacaData<{ mapel: { id: number; nama: string }[]; materi: (MateriKelas & { mapel_id: number })[] }>(
  "data_materi_per_kelas_SD.json",
);
const matematika = data.mapel.find((m) => m.nama === "Matematika")!;
const materi = data.materi.filter((m) => m.mapel_id === matematika.id);

// TP wajib = leluhur semua TP kelas seharusnya; urutan TP dari data TP (sama seperti route /api/beranda).
const kurikulum = bacaData<{ tujuan_pembelajaran: TpGraf[]; prasyarat_tp: RelasiPrasyarat[] }>("data_awal_matematika_fase_A_B.json");
const graf = buatGraf(kurikulum.tujuan_pembelajaran, kurikulum.prasyarat_tp);
const tpWajib = (kelas: number) =>
  new Set(kurikulum.tujuan_pembelajaran.filter((t) => t.kelas === kelas).flatMap((t) => [...cariLeluhur(graf, t.kode)]));
const URUTAN_TP = new Map(kurikulum.tujuan_pembelajaran.map((t) => [t.kode, t.urutan]));

const progresDari = (status: Record<string, StatusPeta>) => new Map(Object.entries(status).map(([k, s]) => [k, { status: s }]));

// Hasil asesmen Raka: B3 belum (diuji) -> B4, B5, B7, B8 disimpulkan belum; A4, A5, A7, A8, B2 tercapai
// -> leluhurnya disimpulkan tercapai; B6 belum diketahui (berhenti dini).
const STATUS_RAKA: Record<string, StatusPeta> = {
  A1: "tercapai", A2: "tercapai", A3: "tercapai", A4: "tercapai", A5: "tercapai", A6: "tercapai",
  A7: "tercapai", A8: "tercapai", B1: "tercapai", B2: "tercapai",
  B3: "belum", B4: "belum", B5: "belum", B7: "belum", B8: "belum",
};

const jalurRaka = (ubah: Partial<Parameters<typeof susunJalurMateri>[0]> = {}) =>
  susunJalurMateri({
    materi,
    progres: progresDari(STATUS_RAKA),
    kelas_seharusnya: 4,
    fase_intensif: false,
    rekomendasi_tp: "B3",
    tp_wajib: tpWajib(4),
    urutan_tp: URUTAN_TP,
    tp_dilatih: new Set(),
    ...ubah,
  });

const ids = (j: JalurMateri) => j.pos.map((p) => p.id);
const sekarang = (j: JalurMateri) => (j.indeks_sekarang === null ? null : j.pos[j.indeks_sekarang]);

describe("susunJalurMateri", () => {
  it("Raka setelah asesmen: bekal, Pos Dasar B3 (play), Kelasku urut prasyarat, Pos tambahan, lalu Segera hadir", () => {
    const j = jalurRaka();
    expect(ids(j)).toEqual([
      "MAT-1-BIL-06", // bekal: Pos Dasar wajib terakhir yang tuntas dari asesmen (A8, digabung dengan MAT-2-BIL-05)
      "MAT-3-BIL-03", // B3
      "MAT-4-BIL-02", // B6 Membandingkan pecahan (prasyarat B7)
      "MAT-4-BIL-01", // B7 Pecahan senilai
      "MAT-4-BIL-03", // B8, digabung dengan MAT-4-BIL-04
      "MAT-3-BIL-03#tambahan", // B4
      "MAT-3-BIL-04#tambahan", // B5
      "MAT-4-UKR-01", // tanpa TP: segera hadir
      "MAT-4-UKR-02",
      "MAT-4-GEO-01",
      "MAT-4-GEO-02",
      "MAT-4-DAT-01",
      "MAT-4-DAT-02",
    ]);
    expect(j.pos[0]).toMatchObject({ status: "tercapai", judul: "Mengenal setengah dan seperempat & Pecahan setengah dan seperempat" });
    expect(sekarang(j)).toMatchObject({ id: "MAT-3-BIL-03", bagian: "pos_dasar", status: "belum", tp_total: 1 });
  });

  it("keadaan Raka sekarang (B3, B6 tercapai lewat latihan): play di Pecahan senilai, pos sebelumnya bercentang", () => {
    const j = jalurRaka({
      progres: progresDari({ ...STATUS_RAKA, B3: "tercapai", B6: "tercapai" }),
      rekomendasi_tp: "B7",
      tp_dilatih: new Set(["B3", "B6"]),
    });
    expect(j.indeks_sekarang).toBe(3);
    expect(sekarang(j)?.judul).toBe("Pecahan senilai");
    // Semua pos sebelum play sudah tuntas: play selalu maju, tidak pernah tertinggal di belakang pos selesai.
    expect(j.pos.slice(0, 3).map((p) => [p.id, p.status])).toEqual([
      ["MAT-1-BIL-06", "tercapai"],
      ["MAT-3-BIL-03", "tercapai"],
      ["MAT-4-BIL-02", "tercapai"],
    ]);
  });

  it("peta tetap: pos yang dituntaskan lewat latihan tidak hilang, dan urutan pos tidak berubah saat anak maju", () => {
    const sebelum = jalurRaka({ tp_dilatih: new Set(["B3"]) });
    const sesudah = jalurRaka({ progres: progresDari({ ...STATUS_RAKA, B3: "tercapai" }), rekomendasi_tp: "B6", tp_dilatih: new Set(["B3"]) });
    expect(ids(sesudah)).toEqual(ids(sebelum));
    expect(sesudah.indeks_sekarang).toBe(sebelum.indeks_sekarang! + 1);
  });

  it("keadaan Raka setelah Kelasku tuntas: play di Pos tambahan Kelipatan dan faktor, sebelumnya semua bercentang", () => {
    const j = jalurRaka({
      progres: progresDari({ ...STATUS_RAKA, B3: "tercapai", B4: "tercapai", B5: "jembatan", B6: "tercapai", B7: "tercapai", B8: "tercapai" }),
      rekomendasi_tp: "B5",
      tp_dilatih: new Set(["A1", "B3", "B4", "B5", "B6", "B7", "B8"]),
    });
    const k = j.indeks_sekarang!;
    expect(j.pos[k]).toMatchObject({ id: "MAT-3-BIL-04#tambahan", judul: "Kelipatan dan faktor", status: "sedang" });
    // Play tidak pernah melompati pos yang bisa dimainkan: semua di depannya tuntas, di belakangnya hanya segera hadir.
    expect(j.pos.slice(0, k).every((p) => p.status === "tercapai")).toBe(true);
    expect(j.pos.slice(k + 1).every((p) => p.status === "bacaan")).toBe(true);
  });

  it("materi tanpa TP (segera hadir) ada di akhir peta sesuai urutan file dan tidak pernah jadi pos play", () => {
    const j = jalurRaka();
    const bacaanData = materi.filter((m) => m.kelas === 4 && m.tp_terkait.length === 0).map((m) => m.kode);
    expect(j.pos.slice(-bacaanData.length).map((p) => [p.kode, p.status])).toEqual(bacaanData.map((kode) => [kode, "bacaan"]));
    expect(j.pos.slice(0, -bacaanData.length).some((p) => p.status === "bacaan")).toBe(false);
    expect(sekarang(jalurRaka({ rekomendasi_tp: null, progres: progresDari({ ...STATUS_RAKA, B3: "tercapai", B4: "tercapai", B5: "tercapai", B6: "tercapai", B7: "tercapai", B8: "tercapai" }) }))).toBeNull();
  });

  it("materi berurutan yang menghitung TP yang sama digabung jadi satu pos (satu pos = satu sesi)", () => {
    const j = jalurRaka();
    const b8 = j.pos.filter((p) => p.bagian === "kelasku" && p.tp_total === 1 && p.judul.includes("desimal"));
    expect(b8).toHaveLength(1);
    expect(b8[0]).toMatchObject({ kode: "MAT-4-BIL-03", judul: "Mengenal bilangan desimal & Desimal dan persen", tp_total: 1 });
    // Pos Dasar A1 yang pernah dilatih: dua materi kelas 1 (A1) jadi satu pos.
    const a1 = jalurRaka({ tp_dilatih: new Set(["A1"]) }).pos.find((p) => p.kode === "MAT-1-BIL-01");
    expect(a1?.judul).toBe("Membilang dan membandingkan banyak benda & Membaca dan menulis bilangan sampai 20");
  });

  it("bekal selalu di depan play: TP tuntas yang urutannya sesudah pos play tidak dijadikan bekal", () => {
    // A8 belum, tetapi B1 dan B2 (urutan sesudah A8) tuntas dari asesmen.
    const j = jalurRaka({ progres: progresDari({ ...STATUS_RAKA, A8: "belum" }), rekomendasi_tp: "A8" });
    const k = j.indeks_sekarang!;
    expect(j.pos[k].tp_total).toBe(1);
    expect(j.pos.slice(0, k).every((p) => p.status === "tercapai")).toBe(true);
    expect(j.pos.slice(k).filter((p) => p.bagian === "pos_dasar").every((p) => p.status !== "tercapai")).toBe(true);
  });

  it("prasyarat belum_diketahui (tidak diuji asesmen) adalah pos opsional: tidak muncul sebelum pos play", () => {
    // Keadaan Raka setelah asesmen "kelas terakhir": A5, A8, B6 tidak diuji.
    const progres = progresDari({
      A1: "tercapai", A2: "tercapai", A3: "tercapai", A4: "tercapai", A5: "belum_diketahui", A6: "tercapai", A7: "tercapai",
      A8: "belum_diketahui", B1: "tercapai", B2: "tercapai", B3: "belum", B4: "belum", B5: "belum", B6: "belum_diketahui",
      B7: "belum", B8: "belum",
    });
    const j = jalurRaka({ progres, rekomendasi_tp: "B3" });
    const k = j.indeks_sekarang!;
    expect(j.pos[k]).toMatchObject({ kode: "MAT-3-BIL-03", bagian: "pos_dasar" });
    expect(j.pos.slice(0, k).every((p) => p.status === "tercapai")).toBe(true);
    // A8 (pecahan setengah) tidak menjadi Pos Dasar; baru muncul jika direkomendasikan setelah Kelasku.
    expect(j.pos.some((p) => p.bagian === "pos_dasar" && p.kode === "MAT-1-BIL-06")).toBe(false);
    const nanti = jalurRaka({ progres, rekomendasi_tp: "A8" });
    expect(nanti.pos[nanti.indeks_sekarang!]).toMatchObject({ kode: "MAT-1-BIL-06", bagian: "tambahan" });
  });

  it("pos dengan 2 TP yang dihitung: satu tercapai belum tuntas", () => {
    const j = jalurRaka({
      progres: progresDari({ ...STATUS_RAKA, B3: "tercapai" }),
      kelas_seharusnya: 3,
      rekomendasi_tp: "B4",
      tp_wajib: tpWajib(3),
    });
    expect(sekarang(j)).toMatchObject({ kode: "MAT-3-BIL-03", bagian: "kelasku", tp_total: 2, tp_tercapai: 1, status: "belum" });
  });

  it("TP jembatan -> pos berstatus sedang", () => {
    const j = jalurRaka({ progres: progresDari({ ...STATUS_RAKA, B3: "jembatan" }) });
    expect(sekarang(j)).toMatchObject({ kode: "MAT-3-BIL-03", status: "sedang" });
  });

  it("fase intensif: materi esensial_transisi = false disembunyikan, null tetap tampil", () => {
    const j = jalurRaka({ fase_intensif: true });
    expect(j.pos.some((p) => p.kode === "MAT-3-BIL-04")).toBe(false); // esensial false
    expect(j.pos.some((p) => p.kode === "MAT-4-GEO-01")).toBe(false); // esensial false
    expect(j.pos.some((p) => p.kode === "MAT-4-DAT-01")).toBe(true); // esensial true
    const kelas5 = jalurRaka({ kelas_seharusnya: 5, fase_intensif: true, rekomendasi_tp: null, tp_wajib: new Set() });
    expect(kelas5.pos.some((p) => p.kelas === 5)).toBe(true); // esensial null
  });

  it("tanpa rekomendasi: play di pos pertama yang belum tuntas; semua tuntas -> indeks null", () => {
    expect(sekarang(jalurRaka({ rekomendasi_tp: null }))?.kode).toBe("MAT-3-BIL-03");
    const semua = progresDari(Object.fromEntries(materi.flatMap((m) => m.tp_terkait).map((tp) => [tp, "tercapai"])));
    const j = jalurRaka({ progres: semua, rekomendasi_tp: null });
    expect(j.indeks_sekarang).toBeNull();
    expect(new Set(ids(j)).size).toBe(j.pos.length);
  });
});
