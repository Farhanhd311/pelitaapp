// Tes unit /lib/sesi: tentukanLevel, pola check-in, dan cek "Masih kuat?" (PANDUAN 7.1).
// Durasi diambil dari data/seed_pengaturan_sistem.json (nilai yang sama yang di-seed ke PENGATURAN_SISTEM).

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  cuacaTurunBeruntun,
  evaluasiCekMasihKuat,
  hitungBeruntun,
  jumlahSoalKuis,
  perluPerhatian,
  tentukanLevel,
  tindakanMasihKuat,
  type DataAnak,
  type DataCheckin,
  type KeadaanCekKuat,
  type RingkasCheckin,
} from "./aturan";

const seed = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, "../../data/seed_pengaturan_sistem.json"), "utf8"),
).pengaturan;
const durasi = {
  durasi_ringan: seed["sesi.durasi_ringan"],
  durasi_normal: seed["sesi.durasi_normal"],
  durasi_penuh: seed["sesi.durasi_penuh"],
};

const raka: DataAnak = { mode_jeda: false, fase_pengobatan: "pemeliharaan", batas_layar_menit: null };
const cek = (c: Partial<DataCheckin>, a: Partial<DataAnak> = {}) =>
  tentukanLevel({ energi: "lumayan", cuaca_hati: "cerah", keluhan: [], ...c }, { ...raka, ...a }, durasi);

describe("tentukanLevel", () => {
  it("energi menentukan level dasar", () => {
    expect(cek({ energi: "lemas" }).level).toBe("ringan");
    expect(cek({ energi: "lumayan" }).level).toBe("normal");
    expect(cek({ energi: "semangat" }).level).toBe("penuh");
  });

  it("demo Raka: lemas + mata lelah (cuaca berawan) -> ringan, mode audio, mengulang materi", () => {
    const h = cek({ energi: "lemas", cuaca_hati: "berawan", keluhan: ["mata_lelah"] });
    expect(h).toMatchObject({ level: "ringan", mode_audio: true, jenis_isi: "ulang", durasi_menit: durasi.durasi_ringan });
  });

  it("semangat -> penuh dengan materi baru", () => {
    expect(cek({ energi: "semangat" })).toMatchObject({ level: "penuh", jenis_isi: "baru" });
  });

  it("mode jeda menang atas semuanya", () => {
    expect(cek({ energi: "semangat" }, { mode_jeda: true })).toMatchObject({ level: "istirahat", durasi_menit: 0 });
  });

  it("sakit sekali -> istirahat + tawarkan memberi tahu pendamping", () => {
    const h = cek({ energi: "semangat", keluhan: ["sakit_sekali", "mual"] });
    expect(h).toMatchObject({ level: "istirahat", tawarkan_beri_tahu_pendamping: true, jenis_isi: "santai" });
  });

  it("keluhan apa pun membatasi paling tinggi ringan", () => {
    expect(cek({ energi: "semangat", keluhan: ["mual"] }).level).toBe("ringan");
  });

  it("fase intensif turun satu tingkat", () => {
    expect(cek({ energi: "semangat" }, { fase_pengobatan: "intensif" }).level).toBe("normal");
  });

  it("cuaca hujan/badai turun satu tingkat, isi mengulang, tawarkan Teman Cerita", () => {
    expect(cek({ energi: "semangat", cuaca_hati: "hujan" })).toMatchObject({
      level: "normal",
      jenis_isi: "ulang",
      tawarkan_teman_cerita: true,
    });
    expect(cek({ energi: "lemas", cuaca_hati: "badai" }).level).toBe("istirahat");
  });

  it("durasi dibatasi batas layar dari orang tua", () => {
    expect(cek({ energi: "semangat" }, { batas_layar_menit: 15 }).durasi_menit).toBe(15);
    expect(cek({ energi: "lemas" }, { batas_layar_menit: 60 }).durasi_menit).toBe(durasi.durasi_ringan);
  });

  it("mode audio tidak berlaku saat istirahat", () => {
    expect(cek({ energi: "lemas", cuaca_hati: "hujan", keluhan: ["mata_lelah"] })).toMatchObject({
      level: "istirahat",
      mode_audio: false,
    });
  });
});

describe("pola check-in", () => {
  const hari = (tanggal: string, energi: RingkasCheckin["energi"], ubah: Partial<RingkasCheckin> = {}): RingkasCheckin => ({
    tanggal,
    energi,
    cuaca_hati: "cerah",
    keluhan: [],
    ...ubah,
  });
  const batas = seed["sesi.hari_lemas_pemicu_perhatian"];

  it("3 check-in terakhir lemas/berkeluhan -> perlu perhatian", () => {
    const riwayat = [
      hari("2026-11-01", "semangat"),
      hari("2026-11-02", "lemas"),
      hari("2026-11-03", "lumayan", { keluhan: ["mual"] }),
      hari("2026-11-04", "lemas"),
    ];
    expect(perluPerhatian(riwayat, batas)).toBe(true);
  });

  it("rangkaian putus oleh hari yang baik", () => {
    const riwayat = [hari("2026-11-02", "lemas"), hari("2026-11-03", "lemas"), hari("2026-11-04", "semangat")];
    expect(hitungBeruntun(riwayat, (c) => c.energi === "lemas")).toBe(0);
    expect(perluPerhatian(riwayat, batas)).toBe(false);
  });

  it("urutan masukan tidak berpengaruh (diurutkan menurut tanggal)", () => {
    const riwayat = [hari("2026-11-04", "lemas"), hari("2026-11-02", "lemas"), hari("2026-11-03", "lemas")];
    expect(perluPerhatian(riwayat, batas)).toBe(true);
  });

  it("cuaca hati turun beberapa hari -> Teman Cerita menyapa", () => {
    const riwayat = ["2026-11-02", "2026-11-03", "2026-11-04"].map((t) => hari(t, "lumayan", { cuaca_hati: "hujan" }));
    expect(cuacaTurunBeruntun(riwayat, seed["sesi.hari_mood_turun_pemicu_chatbot"])).toBe(true);
  });
});

describe('cek "Masih kuat?"', () => {
  const dasar: KeadaanCekKuat = {
    level: "normal",
    menit_berjalan: 5,
    durasi_menit: 20,
    salah_beruntun: 0,
    batas_salah_beruntun: seed["sesi.salah_beruntun_pemicu_cek"],
    sudah_cek_durasi: false,
    sudah_cek_tengah: false,
  };

  it("tidak muncul di awal sesi", () => {
    expect(evaluasiCekMasihKuat(dasar)).toBeNull();
  });

  it("muncul setelah 3 salah berturut-turut", () => {
    expect(evaluasiCekMasihKuat({ ...dasar, salah_beruntun: 3 })).toBe("salah_beruntun");
  });

  it("muncul saat durasi level tercapai, sekali saja", () => {
    expect(evaluasiCekMasihKuat({ ...dasar, menit_berjalan: 20 })).toBe("durasi_tercapai");
    expect(evaluasiCekMasihKuat({ ...dasar, menit_berjalan: 25, sudah_cek_durasi: true })).toBeNull();
  });

  it("muncul di tengah sesi penuh", () => {
    expect(evaluasiCekMasihKuat({ ...dasar, level: "penuh", durasi_menit: 30, menit_berjalan: 15 })).toBe(
      "tengah_sesi_penuh",
    );
    expect(evaluasiCekMasihKuat({ ...dasar, level: "normal", menit_berjalan: 10 })).toBeNull();
  });

  it("tindakan tiap pilihan", () => {
    expect(tindakanMasihKuat("masih_kuat", true).tawarkan_selesai).toBe(true);
    expect(tindakanMasihKuat("agak_capek", false)).toMatchObject({ pakai_ceroboh_lelah: true, tanpa_materi_baru: true });
    expect(tindakanMasihKuat("istirahat", false)).toMatchObject({ berhenti: true, kabari_pendamping: false });
    expect(tindakanMasihKuat("pusing", false)).toMatchObject({ berhenti: true, kabari_pendamping: true });
  });
});

describe("jumlahSoalKuis", () => {
  const atur = { jumlah_soal_ringan: 2, jumlah_soal_normal: 5, jumlah_soal_penuh: 8 };
  it("istirahat tanpa kuis, level lain sesuai pengaturan", () => {
    expect(jumlahSoalKuis("istirahat", atur)).toBe(0);
    expect(jumlahSoalKuis("normal", atur)).toBe(5);
  });
});
