// Tes unit /lib/bkt. Semua angka harapan diambil dari data/tes_kasus_bkt.json, dan parameter dari
// meta.parameter_bkt di data_awal_matematika_fase_A_B.json (nilai yang sama yang di-seed ke PENGATURAN_SISTEM).
// Toleransi pembanding 0,001 (sesuai keterangan file kasus uji).
// Jalankan: npm test

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  benarLagiUntukTercapai,
  jawabFormatif,
  keputusanTp,
  mulaiAsesmen,
  perbaruiBKT,
  putarUlangAsesmen,
  setelahJawab,
  type KeadaanAsesmen,
  type Keputusan,
  type ParameterAsesmen,
  type ParameterSesi,
} from "./engine";
import { buatGraf, cariKeturunan, cariLeluhur, pilihTpPertama } from "./graph";
import { susunPeta } from "./peta";

const TOLERANSI = 0.001;

function bacaData<T>(nama: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../../data", nama), "utf8")) as T;
}

type DataMatematika = {
  meta: { parameter_bkt: ParameterAsesmen & ParameterSesi & { ceroboh_lelah: number } };
  tujuan_pembelajaran: { kode: string; kelas: number; urutan: number }[];
  prasyarat_tp: { tp_kode: string; prasyarat_kode: string }[];
};

// Bentuk data/tes_kasus_bkt.json
type KasusUji = {
  perbaruiBKT: { p: number; benar: boolean; belajar: number; ceroboh: number; hasil: number }[];
  keputusan_tp: { jawaban: boolean[]; keputusan: Keputusan | null }[];
  asesmen_raka: {
    kelas_seharusnya: number;
    menguasai: string[];
    parameter: Partial<ParameterAsesmen>;
    tp_pertama: string;
    urutan_tp_diuji: string[];
    jejak: { tp: string; soal_ke: number; benar: boolean; p_sebelum: number; p_sesudah: number }[];
    jumlah_soal: number;
    status_akhir: Record<string, [string, string]>;
    titik_mulai: string;
  };
  sesi_formatif_b3: { jawaban: boolean[]; p_setelah_tiap_jawaban: number[]; tercapai_pada_jawaban_ke: number };
};

const data = bacaData<DataMatematika>("data_awal_matematika_fase_A_B.json");
const kasus = bacaData<KasusUji>("tes_kasus_bkt.json");
const graf = buatGraf(data.tujuan_pembelajaran, data.prasyarat_tp);
// Batas soal asesmen Matematika (mapel_id 1) dari nilai awal PENGATURAN_SISTEM.
const pengaturanAwal = bacaData<{ pengaturan: { "asesmen.maks_soal_per_mapel": Record<string, number> } }>("seed_pengaturan_sistem.json");
const param: ParameterAsesmen = { ...data.meta.parameter_bkt, maks_soal_asesmen: pengaturanAwal.pengaturan["asesmen.maks_soal_per_mapel"]["1"] };
const paramSesi: ParameterSesi = data.meta.parameter_bkt;

function dekat(nyata: number, harapan: number) {
  expect(Math.abs(nyata - harapan)).toBeLessThan(TOLERANSI);
}

// Kelas terakhir Raka di sekolah (data anak demo). Dipilih sebelum asesmen; TP pertama ada di kelas ini.
const KELAS_TERAKHIR_RAKA = 3;

// Putar asesmen: anak menjawab benar jika TP-nya ia kuasai, salah jika tidak.
function putarAsesmen(menguasai: string[], kelasTerakhir: number, p: ParameterAsesmen, g = graf) {
  let keadaan: KeadaanAsesmen = mulaiAsesmen(g, kelasTerakhir, p);
  const jejak = [];
  while (!keadaan.selesai) {
    const benar = menguasai.includes(keadaan.tp_sekarang!);
    const hasil = setelahJawab(keadaan, g, benar, p);
    jejak.push({ ...hasil.langkah, benar, soal_ke: hasil.keadaan.tp[hasil.langkah.tp_kode].jumlah_soal });
    keadaan = hasil.keadaan;
    if (jejak.length > 100) throw new Error("Asesmen tidak pernah selesai");
  }
  return { keadaan, jejak };
}

describe("perbaruiBKT", () => {
  it.each(kasus.perbaruiBKT)("p $p, benar $benar, ceroboh $ceroboh, belajar $belajar -> $hasil", (k) => {
    dekat(perbaruiBKT(k.p, k.benar, { tebakan: param.tebakan, ceroboh: k.ceroboh, belajar: k.belajar }), k.hasil);
  });

  it("benar menaikkan peluang, salah menurunkan", () => {
    const opsi = { tebakan: param.tebakan, ceroboh: param.ceroboh, belajar: 0 };
    expect(perbaruiBKT(0.5, true, opsi)).toBeGreaterThan(0.5);
    expect(perbaruiBKT(0.5, false, opsi)).toBeLessThan(0.5);
  });
});

describe("keputusanTp", () => {
  it.each(kasus.keputusan_tp)("jawaban $jawaban -> $keputusan", (k) => {
    let p = param.peluang_awal;
    let keputusan: Keputusan | null = null;
    k.jawaban.forEach((benar, i) => {
      // Sebelum jawaban terakhir, TP belum boleh diputuskan (kalau sudah, soal berikutnya tidak akan diberikan).
      expect(keputusan).toBeNull();
      p = perbaruiBKT(p, benar, { tebakan: param.tebakan, ceroboh: param.ceroboh, belajar: param.belajar_saat_asesmen });
      keputusan = keputusanTp(i + 1, p, param);
    });
    expect(keputusan).toBe(k.keputusan);
  });
});

describe("graf prasyarat", () => {
  it("leluhur dan keturunan B3", () => {
    expect([...cariLeluhur(graf, "B3")].sort()).toEqual(["A1", "A3", "A4"]);
    expect([...cariKeturunan(graf, "B3")].sort()).toEqual(["B4", "B5", "B7", "B8"]);
  });

  it("TP pertama untuk kelas terakhir 3 adalah B3", () => {
    expect(pilihTpPertama(graf, KELAS_TERAKHIR_RAKA)).toBe(kasus.asesmen_raka.tp_pertama);
  });

  it("kelas yang tidak punya TP memakai kelas terdekat", () => {
    expect(graf.tp.get(pilihTpPertama(graf, 0))!.kelas).toBe(1); // kelas 0 tidak ada
    expect(graf.tp.get(pilihTpPertama(graf, 6))!.kelas).toBe(4); // data belum punya kelas 5-6
  });

  it("menolak relasi ke TP yang tidak ada", () => {
    expect(() => buatGraf([{ kode: "X1", kelas: 1, urutan: 1 }], [{ tp_kode: "X1", prasyarat_kode: "Y9" }])).toThrow();
  });
});

describe("asesmen Raka (data/tes_kasus_bkt.json)", () => {
  const harapan = kasus.asesmen_raka;
  const p = { ...param, ...harapan.parameter };
  const { keadaan, jejak } = putarAsesmen(harapan.menguasai, KELAS_TERAKHIR_RAKA, p);

  it(`urutan TP diuji ${harapan.urutan_tp_diuji.join(" → ")}`, () => {
    expect([...new Set(jejak.map((j) => j.tp_kode))]).toEqual(harapan.urutan_tp_diuji);
  });

  it(`${harapan.jumlah_soal} soal, setiap langkah sama dengan jejak`, () => {
    expect(keadaan.jumlah_soal).toBe(harapan.jumlah_soal);
    expect(jejak).toHaveLength(harapan.jejak.length);
    harapan.jejak.forEach((h, i) => {
      expect(jejak[i].tp_kode).toBe(h.tp);
      expect(jejak[i].soal_ke).toBe(h.soal_ke);
      expect(jejak[i].benar).toBe(h.benar);
      dekat(jejak[i].p_sebelum, h.p_sebelum);
      dekat(jejak[i].p_sesudah, h.p_sesudah);
    });
  });

  it(`titik mulai ${harapan.titik_mulai}`, () => {
    expect(keadaan.selesai).toBe(true);
    expect(keadaan.titik_mulai).toBe(harapan.titik_mulai);
    expect(keadaan.tp_sekarang).toBeNull();
  });

  it("status akhir setiap TP (termasuk B6 belum_diketahui)", () => {
    for (const [kode, [status, sumber]] of Object.entries(harapan.status_akhir)) {
      expect(keadaan.tp[kode].status, kode).toBe(status);
      expect(keadaan.tp[kode].sumber_status, kode).toBe(sumber === "-" ? null : sumber);
    }
  });

  it("tidak bisa menjawab setelah asesmen selesai", () => {
    expect(() => setelahJawab(keadaan, graf, true, p)).toThrow();
  });
});

describe("asesmen kasus lain", () => {
  const semua = data.tujuan_pembelajaran.map((t) => t.kode);
  const kelasTp = (kode: string) => data.tujuan_pembelajaran.find((t) => t.kode === kode)!.kelas;

  it("tidak pernah menguji TP di atas kelas terakhir (Raka: kelas 3)", () => {
    const { jejak } = putarAsesmen(kasus.asesmen_raka.menguasai, KELAS_TERAKHIR_RAKA, param);
    expect(jejak.every((j) => kelasTp(j.tp_kode) <= KELAS_TERAKHIR_RAKA)).toBe(true);
  });

  it("menguasai semua TP sampai kelas terakhir -> titik mulai TP pertama kelas berikutnya (Kelasku)", () => {
    const { keadaan, jejak } = putarAsesmen(semua, 2, param);
    expect(jejak.every((j) => kelasTp(j.tp_kode) <= 2)).toBe(true);
    expect(keadaan.titik_mulai).toBe("B1"); // TP kelas 3 pertama yang prasyaratnya (A7) tercapai
    expect(data.tujuan_pembelajaran.filter((t) => t.kelas > 2).every((t) => keadaan.tp[t.kode].status === "belum_diketahui")).toBe(true);
  });

  it("menguasai semua TP sampai kelas tertinggi di data: tanpa titik mulai", () => {
    const { keadaan } = putarAsesmen(semua, 4, param);
    expect(keadaan.titik_mulai).toBeNull();
    expect(data.tujuan_pembelajaran.filter((t) => t.kelas === 4).every((t) => keadaan.tp[t.kode].status === "tercapai")).toBe(true);
    expect(Object.values(keadaan.tp).every((s) => s.status !== "belum")).toBe(true);
  });

  it("tanpa berhenti dini: semua TP kelas terakhir diketahui, titik mulai tetap B3", () => {
    const { keadaan } = putarAsesmen(kasus.asesmen_raka.menguasai, KELAS_TERAKHIR_RAKA, { ...param, berhenti_dini: false });
    expect(data.tujuan_pembelajaran.filter((t) => t.kelas === KELAS_TERAKHIR_RAKA).every((t) => keadaan.tp[t.kode].status !== "belum_diketahui")).toBe(true);
    expect(keadaan.titik_mulai).toBe("B3");
    expect(keadaan.tp["B6"].status).toBe("belum_diketahui"); // kelas 4: belum diajarkan, tidak diuji
  });

  it("lancar di kelas pilihan -> tidak ada soal dari kelas bawah (kelas 3 semua benar: titik mulai B6)", () => {
    const { keadaan, jejak } = putarAsesmen(semua, 3, param);
    expect(jejak.every((j) => kelasTp(j.tp_kode) === 3)).toBe(true);
    expect(keadaan.titik_mulai).toBe("B6"); // prasyarat A8 tidak diuji (belum_diketahui), tidak menghalangi
    expect(keadaan.tp["A8"].status).toBe("belum_diketahui");
  });

  it.each([1, 2, 3, 4])("kelas %i: TP kelas bawah yang diuji selalu prasyarat TP yang diuji dan belum dikuasai", (kelas) => {
    for (const menguasai of [[], semua, kasus.asesmen_raka.menguasai]) {
      const { keadaan, jejak } = putarAsesmen(menguasai, kelas, param);
      const gagal = Object.entries(keadaan.tp).filter(([, s]) => s.status === "belum" && s.sumber_status === "diuji").map(([k]) => k);
      const boleh = new Set(gagal.flatMap((k) => [...cariLeluhur(graf, k)]));
      for (const j of jejak) if (kelasTp(j.tp_kode) < kelas) expect(boleh.has(j.tp_kode), j.tp_kode).toBe(true);
    }
  });

  it("batas soal asesmen tercapai -> asesmen berhenti dengan titik mulai", () => {
    const { keadaan, jejak } = putarAsesmen([], 3, { ...param, maks_soal_asesmen: 5 });
    expect(jejak).toHaveLength(5);
    expect(keadaan.selesai).toBe(true);
    expect(keadaan.titik_mulai).not.toBeNull();
  });

  it("batas soal dari pengaturan tidak pernah terlampaui di semua kasus", () => {
    for (const kelas of [1, 2, 3, 4]) {
      for (const menguasai of [[], semua, kasus.asesmen_raka.menguasai]) {
        expect(putarAsesmen(menguasai, kelas, param).keadaan.jumlah_soal).toBeLessThanOrEqual(param.maks_soal_asesmen);
      }
    }
  });

  it("keadaan lama tidak ikut berubah (fungsi murni)", () => {
    const awal = mulaiAsesmen(graf, KELAS_TERAKHIR_RAKA, param);
    const salinan = JSON.parse(JSON.stringify(awal));
    setelahJawab(awal, graf, false, param);
    expect(awal).toEqual(salinan);
  });
});

describe("putarUlangAsesmen (keadaan dari jawaban tersimpan)", () => {
  const raka = kasus.asesmen_raka;
  const waktu = new Date("2026-11-07T00:00:00Z");
  const jawabanRaka = raka.jejak.map((j, i) => ({ soal_id: `${j.tp}-${i}`, tp_kode: j.tp, benar: j.benar, waktu }));

  it("belum ada jawaban -> null", () => {
    expect(putarUlangAsesmen(graf, [], () => param)).toBeNull();
  });

  it(`${raka.jumlah_soal} jawaban Raka menghasilkan keadaan yang sama dengan memutar mesin langsung`, () => {
    const putaran = putarUlangAsesmen(graf, jawabanRaka, () => param)!;
    const langsung = putarAsesmen(raka.menguasai, KELAS_TERAKHIR_RAKA, param).keadaan;
    expect(putaran.keadaan).toEqual(langsung);
    expect(putaran.soal_dipakai).toHaveLength(raka.jumlah_soal);
  });

  it("separuh jalan: asesmen bisa dilanjutkan dari TP yang benar", () => {
    const separuh = Math.floor(raka.jumlah_soal / 2);
    const putaran = putarUlangAsesmen(graf, jawabanRaka.slice(0, separuh), () => param)!;
    expect(putaran.keadaan.selesai).toBe(false);
    expect(putaran.keadaan.tp_sekarang).toBe(raka.jejak[separuh].tp);
  });

  it("jawaban setelah asesmen selesai memulai putaran baru dengan parameter saat itu", () => {
    const nanti = new Date("2026-12-01T00:00:00Z");
    const paramBaru = { ...param, ambang_tercapai: 0.9 };
    const jawaban = [...jawabanRaka, { soal_id: "B3-baru", tp_kode: "B3", benar: true, waktu: nanti }];
    const putaran = putarUlangAsesmen(graf, jawaban, (w) => (w >= nanti ? paramBaru : param))!;
    expect(putaran.soal_dipakai).toEqual(["B3-baru"]);
    expect(putaran.param.ambang_tercapai).toBe(0.9);
    expect(putaran.mulai_pada).toEqual(nanti);
  });

  it("kelas terakhir dibaca dari jawaban pertama (anak kelas 2), hasil sama dengan memutar langsung", () => {
    const semua = data.tujuan_pembelajaran.map((t) => t.kode);
    const { keadaan, jejak } = putarAsesmen(semua, 2, param);
    const jawaban = jejak.map((j, i) => ({ soal_id: `${j.tp_kode}-${i}`, tp_kode: j.tp_kode, benar: j.benar, waktu }));
    expect(putarUlangAsesmen(graf, jawaban, () => param)!.keadaan).toEqual(keadaan);
  });

  it("menolak jawaban yang tidak cocok dengan urutan mesin", () => {
    const salahUrut = [{ soal_id: "A1-x", tp_kode: "A1", benar: true, waktu }];
    expect(() => putarUlangAsesmen(graf, salahUrut, () => param)).toThrow();
  });
});

// Mesin yang sama untuk Bahasa Indonesia: tidak ada kode TP atau mapel_id di mesin (PANDUAN 9).
describe("asesmen Bahasa Indonesia (mapel kedua, data saja)", () => {
  const bi = bacaData<DataMatematika>("data_awal_bahasa_indonesia_fase_A_B.json");
  const grafBi = buatGraf(bi.tujuan_pembelajaran, bi.prasyarat_tp);
  const paramBi = { ...bi.meta.parameter_bkt, maks_soal_asesmen: pengaturanAwal.pengaturan["asesmen.maks_soal_per_mapel"]["2"] };
  const kelasBi = (kode: string) => grafBi.tp.get(kode)!.kelas;

  it.each([1, 2, 3, 4])("kelas %i: selesai, tidak menguji di atas kelas pilihan, dalam batas soal", (kelas) => {
    for (const menguasai of [[], bi.tujuan_pembelajaran.map((t) => t.kode)]) {
      const { keadaan, jejak } = putarAsesmen(menguasai, kelas, paramBi, grafBi);
      expect(keadaan.selesai).toBe(true);
      expect(jejak.every((j) => kelasBi(j.tp_kode) <= kelas)).toBe(true);
      expect(keadaan.jumlah_soal).toBeLessThanOrEqual(paramBi.maks_soal_asesmen);
    }
  });
});

describe("susunPeta (Kelasku dan Pos Dasar) setelah asesmen Raka", () => {
  const { keadaan } = putarAsesmen(kasus.asesmen_raka.menguasai, KELAS_TERAKHIR_RAKA, param);
  const daftarTp = data.tujuan_pembelajaran.map((t) => ({ ...t, deskripsi: t.kode, esensial_transisi: true }));
  const peta = susunPeta({
    daftar_tp: daftarTp,
    graf,
    progres: new Map(Object.entries(keadaan.tp)),
    kelas_seharusnya: 4,
    fase_intensif: false,
    tp_dengan_konten: new Set(["B3"]),
  });

  it("Kelasku berisi TP kelas 4, Pos Dasar berisi kelas 1-3", () => {
    expect(peta.kelasku.map((k) => k.kode)).toEqual(["B6", "B7", "B8"]);
    expect(peta.pos_dasar.every((p) => p.kelas < 4)).toBe(true);
  });

  it("B3 adalah pos wajib (prasyarat B7 yang belum tercapai) dan direkomendasikan", () => {
    expect(peta.pos_dasar.filter((p) => p.wajib).map((p) => p.kode)).toEqual(["B3"]);
    expect(peta.rekomendasi_tp).toBe("B3");
  });

  it("B7 terkunci karena B3 belum tercapai; B4 terkunci karena B3", () => {
    expect(peta.kelasku.find((k) => k.kode === "B7")!.terkunci).toBe(true);
    expect(peta.pos_dasar.find((p) => p.kode === "B4")!.terkunci).toBe(true);
    expect(peta.pos_dasar.find((p) => p.kode === "B3")!.terkunci).toBe(false);
  });

  it("A8 tidak diuji (belum_diketahui): pos opsional, tidak mengunci B6", () => {
    expect(keadaan.tp["A8"].status).toBe("belum_diketahui");
    expect(peta.pos_dasar.find((p) => p.kode === "A8")!.wajib).toBe(false);
    expect(peta.kelasku.find((k) => k.kode === "B6")!.terkunci).toBe(false);
  });

  it("hanya TP yang punya konten yang tersedia", () => {
    expect(peta.pos_dasar.find((p) => p.kode === "B3")!.tersedia).toBe(true);
    expect(peta.kelasku.find((k) => k.kode === "B6")!.tersedia).toBe(false);
  });
});

describe("kuis formatif B3 (sesi belajar)", () => {
  const harapan = kasus.sesi_formatif_b3;

  it(`tercapai pada jawaban ke-${harapan.tercapai_pada_jawaban_ke}`, () => {
    let p = kasus.asesmen_raka.jejak[1].p_sesudah; // p B3 setelah asesmen (0,017)
    let jumlah = 0;
    harapan.jawaban.forEach((benar, i) => {
      const hasil = jawabFormatif(p, jumlah, benar, paramSesi);
      dekat(hasil.p_menguasai, harapan.p_setelah_tiap_jawaban[i]);
      expect(hasil.tercapai).toBe(i + 1 === harapan.tercapai_pada_jawaban_ke);
      p = hasil.p_menguasai;
      jumlah = hasil.jumlah_soal;
    });
  });

  it("ceroboh_lelah membuat jawaban salah tidak terlalu menurunkan peluang", () => {
    const biasa = jawabFormatif(0.8, 0, false, paramSesi).p_menguasai;
    const lelah = jawabFormatif(0.8, 0, false, { ...paramSesi, ceroboh: data.meta.parameter_bkt.ceroboh_lelah }).p_menguasai;
    expect(lelah).toBeGreaterThan(biasa);
  });
});

describe("benarLagiUntukTercapai (pesan \"tinggal N jawaban benar lagi\")", () => {
  it("cocok dengan simulasi jawabFormatif: TP baru (p 0,5) butuh 3 jawaban benar", () => {
    expect(benarLagiUntukTercapai(0.5, 0, paramSesi)).toBe(3);
  });

  it("kasus nyata B7 Raka: 5 jawaban (benar, salah, salah, benar, benar) -> tinggal 1", () => {
    let p = 0.5;
    let jumlah = 0;
    for (const benar of [true, false, false, true, true]) {
      const hasil = jawabFormatif(p, jumlah, benar, paramSesi);
      p = hasil.p_menguasai;
      jumlah = hasil.jumlah_soal;
    }
    dekat(p, 0.8673);
    expect(benarLagiUntukTercapai(p, jumlah, paramSesi)).toBe(1);
  });

  it("p tinggi tetapi soal belum minimal: tetap menunggu min_soal_tercapai", () => {
    expect(benarLagiUntukTercapai(0.99, 0, paramSesi)).toBe(paramSesi.min_soal_tercapai);
  });
});
