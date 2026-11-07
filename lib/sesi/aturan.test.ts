// Tes unit /lib/sesi (PANDUAN 7.1). Nilai pengaturan dibaca dari data seed PENGATURAN_SISTEM,
// sama seperti yang dipakai aplikasi, jadi tidak ada angka ambang yang ditulis di tes.

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  perluCekMasihKuat,
  perluPerhatian,
  temanCeritaMenyapa,
  tentukanLevel,
  tindakanMasihKuat,
  type Checkin,
  type PengaturanSesi,
  type ProfilAnak,
} from "./aturan";

const seed = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, "../../data/seed_pengaturan_sistem.json"), "utf8"),
).pengaturan;

const pengaturan: PengaturanSesi = {
  durasi: { ringan: seed["sesi.durasi_ringan"], normal: seed["sesi.durasi_normal"], penuh: seed["sesi.durasi_penuh"] },
  salahBeruntunPemicuCek: seed["sesi.salah_beruntun_pemicu_cek"],
  hariLemasPemicuPerhatian: seed["sesi.hari_lemas_pemicu_perhatian"],
  hariMoodTurunPemicuChatbot: seed["sesi.hari_mood_turun_pemicu_chatbot"],
};

const anakBiasa: ProfilAnak = { mode_jeda: false, fase_pengobatan: "pemeliharaan", batas_layar_menit: null };
const ck = (energi: Checkin["energi"], cuaca_hati: Checkin["cuaca_hati"] = "cerah", keluhan: string | null = null): Checkin => ({
  energi,
  cuaca_hati,
  keluhan,
});

describe("tentukanLevel", () => {
  it("level awal mengikuti energi", () => {
    expect(tentukanLevel(ck("lemas"), anakBiasa, pengaturan).level).toBe("ringan");
    expect(tentukanLevel(ck("lumayan"), anakBiasa, pengaturan).level).toBe("normal");
    expect(tentukanLevel(ck("semangat"), anakBiasa, pengaturan).level).toBe("penuh");
  });

  it("mode jeda selalu istirahat, apa pun check-in-nya", () => {
    const hasil = tentukanLevel(ck("semangat"), { ...anakBiasa, mode_jeda: true }, pengaturan);
    expect(hasil.level).toBe("istirahat");
    expect(hasil.durasiMenit).toBe(0);
    expect(hasil.isi).toBe("santai");
  });

  it("sakit sekali → istirahat dan tawarkan memberi tahu pendamping", () => {
    const hasil = tentukanLevel(ck("semangat", "cerah", "sakit sekali"), anakBiasa, pengaturan);
    expect(hasil.level).toBe("istirahat");
    expect(hasil.tawarkanBeriTahuPendamping).toBe(true);
  });

  it("ada keluhan → paling tinggi ringan; mata lelah → mode audio", () => {
    const pusing = tentukanLevel(ck("semangat", "cerah", "pusing"), anakBiasa, pengaturan);
    expect(pusing.level).toBe("ringan");
    expect(pusing.modeAudio).toBe(false);

    const mataLelah = tentukanLevel(ck("lumayan", "cerah", "mata lelah"), anakBiasa, pengaturan);
    expect(mataLelah.level).toBe("ringan");
    expect(mataLelah.modeAudio).toBe(true);
  });

  it("fase intensif menurunkan satu tingkat", () => {
    const hasil = tentukanLevel(ck("semangat"), { ...anakBiasa, fase_pengobatan: "intensif" }, pengaturan);
    expect(hasil.level).toBe("normal");
  });

  it("hujan/badai menurunkan satu tingkat, mengulang materi, dan menawarkan Teman Cerita", () => {
    const hasil = tentukanLevel(ck("semangat", "badai"), anakBiasa, pengaturan);
    expect(hasil.level).toBe("normal");
    expect(hasil.isi).toBe("ulang_tercapai");
    expect(hasil.tawarkanTemanCerita).toBe(true);
  });

  it("penurunan tidak pernah sampai istirahat (istirahat hanya lewat mode jeda / sakit sekali)", () => {
    const hasil = tentukanLevel(ck("lemas", "hujan"), { ...anakBiasa, fase_pengobatan: "intensif" }, pengaturan);
    expect(hasil.level).toBe("ringan");
  });

  it("skenario demo Raka: lemas + hujan + mata lelah → ringan, mode audio, ulang materi", () => {
    const hasil = tentukanLevel(ck("lemas", "hujan", "mata lelah"), anakBiasa, pengaturan);
    expect(hasil.level).toBe("ringan");
    expect(hasil.modeAudio).toBe(true);
    expect(hasil.isi).toBe("ulang_tercapai");
    expect(hasil.durasiMenit).toBe(pengaturan.durasi.ringan);
  });

  it("materi baru hanya di normal dan penuh", () => {
    expect(tentukanLevel(ck("lemas"), anakBiasa, pengaturan).isi).toBe("ulang_tercapai");
    expect(tentukanLevel(ck("lumayan"), anakBiasa, pengaturan).isi).toBe("materi_baru");
    expect(tentukanLevel(ck("semangat"), anakBiasa, pengaturan).isi).toBe("materi_baru");
  });

  it("durasi dibatasi batas layar dari orang tua", () => {
    const batas = pengaturan.durasi.penuh - 1;
    const hasil = tentukanLevel(ck("semangat"), { ...anakBiasa, batas_layar_menit: batas }, pengaturan);
    expect(hasil.durasiMenit).toBe(batas);
  });
});

describe("cek Masih kuat?", () => {
  const dasar = { level: "normal" as const, menitBerjalan: 1, durasiMenit: 20, salahBeruntun: 0, sudahCekTengah: false };

  it("muncul saat durasi level tercapai", () => {
    expect(perluCekMasihKuat({ ...dasar, menitBerjalan: 20 }, pengaturan)).toBe(true);
  });

  it("muncul setelah salah beruntun mencapai ambang", () => {
    expect(perluCekMasihKuat({ ...dasar, salahBeruntun: pengaturan.salahBeruntunPemicuCek - 1 }, pengaturan)).toBe(false);
    expect(perluCekMasihKuat({ ...dasar, salahBeruntun: pengaturan.salahBeruntunPemicuCek }, pengaturan)).toBe(true);
  });

  it("muncul sekali di tengah sesi penuh", () => {
    const penuh = { ...dasar, level: "penuh" as const, durasiMenit: 30, menitBerjalan: 15 };
    expect(perluCekMasihKuat(penuh, pengaturan)).toBe(true);
    expect(perluCekMasihKuat({ ...penuh, sudahCekTengah: true }, pengaturan)).toBe(false);
  });

  it("tindakan untuk tiap pilihan anak", () => {
    expect(tindakanMasihKuat("masih_kuat", true).tawarkanSelesai).toBe(true);
    expect(tindakanMasihKuat("agak_capek", false)).toMatchObject({ lanjut: true, tanpaMateriBaru: true, pakaiCerobohLelah: true });
    expect(tindakanMasihKuat("mau_istirahat", false)).toMatchObject({ lanjut: false, kartuUntukPendamping: false });
    expect(tindakanMasihKuat("pusing", false)).toMatchObject({ lanjut: false, kartuUntukPendamping: true });
  });
});

describe("pola check-in beberapa hari", () => {
  it("kartu perlu perhatian setelah N check-in berturut-turut lemas atau berkeluhan", () => {
    const n = pengaturan.hariLemasPemicuPerhatian;
    const buruk = Array.from({ length: n }, (_, i) => (i % 2 ? ck("lemas") : ck("lumayan", "cerah", "pusing")));
    expect(perluPerhatian(buruk, pengaturan)).toBe(true);
    expect(perluPerhatian([ck("semangat"), ...buruk].slice(0, n), pengaturan)).toBe(false);
    expect(perluPerhatian(buruk.slice(0, n - 1), pengaturan)).toBe(false);
  });

  it("Teman Cerita menyapa setelah N hari berturut-turut hujan/badai", () => {
    const n = pengaturan.hariMoodTurunPemicuChatbot;
    const mendung = Array.from({ length: n }, (_, i) => ck("lumayan", i % 2 ? "hujan" : "badai"));
    expect(temanCeritaMenyapa(mendung, pengaturan)).toBe(true);
    expect(temanCeritaMenyapa([ck("lumayan", "cerah"), ...mendung].slice(0, n), pengaturan)).toBe(false);
  });
});
