// Tes kontrak API: data contoh (yang dipakai tim UI) harus selalu lolos skemanya,
// dan aturan keamanan dasar (kunci jawaban tidak ikut terkirim) terjaga.

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PermintaanAsesmen,
  ResponsAsesmen,
  contohPermintaanJawab,
  contohPermintaanMulai,
  contohResponsJawab,
  contohResponsMulai,
  contohResponsSelesai,
} from "./asesmen";
import {
  Keluhan,
  PermintaanCheckin,
  ResponsCheckin,
  contohPermintaanCheckin,
  contohResponsCheckin,
} from "./checkin";
import { SoalTampil } from "./umum";

describe("kontrak check-in", () => {
  it("data contoh lolos skema", () => {
    expect(PermintaanCheckin.safeParse(contohPermintaanCheckin).success).toBe(true);
    expect(ResponsCheckin.safeParse(contohResponsCheckin).success).toBe(true);
  });

  it("menolak nilai energi yang tidak ada di database", () => {
    const hasil = PermintaanCheckin.safeParse({ energi: "capek", cuaca_hati: "cerah", keluhan: [] });
    expect(hasil.success).toBe(false);
  });

  it("menerima beberapa keluhan, menolak keluhan ganda", () => {
    const dasar = { energi: "lemas", cuaca_hati: "hujan" };
    expect(PermintaanCheckin.safeParse({ ...dasar, keluhan: ["mual", "pusing"] }).success).toBe(true);
    expect(PermintaanCheckin.safeParse({ ...dasar, keluhan: ["mual", "mual"] }).success).toBe(false);
  });

  it("semua keluhan sekaligus muat di kolom CHECKIN.keluhan (VARCHAR 100)", () => {
    expect(Keluhan.options.join(",").length).toBeLessThanOrEqual(100);
  });
});

describe("kontrak asesmen", () => {
  it("data contoh lolos skema", () => {
    for (const p of [contohPermintaanMulai, contohPermintaanJawab]) {
      expect(PermintaanAsesmen.safeParse(p).success).toBe(true);
    }
    for (const r of [contohResponsMulai, contohResponsJawab, contohResponsSelesai]) {
      expect(ResponsAsesmen.safeParse(r).success).toBe(true);
    }
  });

  it("menolak aksi yang tidak dikenal", () => {
    expect(PermintaanAsesmen.safeParse({ aksi: "lewati", sesi_id: 1 }).success).toBe(false);
  });

  it("soal yang dikirim ke browser tidak membawa kunci jawaban", () => {
    // Zod membuang field yang tidak ada di skema, jadi `benar` dan `miskonsepsi` tidak ikut terkirim.
    const dariDatabase = {
      ...contohResponsMulai.soal,
      pilihan: contohResponsMulai.soal!.pilihan.map((p) => ({ ...p, benar: 1, miskonsepsi: "x" })),
    };
    const hasil = SoalTampil.parse(dariDatabase);
    for (const p of hasil.pilihan) {
      expect(p).not.toHaveProperty("benar");
      expect(p).not.toHaveProperty("miskonsepsi");
    }
  });

  it("contoh akhir asesmen sama dengan data/tes_kasus_bkt.json", () => {
    const file = path.resolve(import.meta.dirname, "../../data/tes_kasus_bkt.json");
    const { asesmen_raka } = JSON.parse(fs.readFileSync(file, "utf8"));

    expect(contohResponsSelesai.titik_mulai).toBe(asesmen_raka.titik_mulai);
    expect(contohResponsSelesai.jumlah_soal_dijawab).toBe(asesmen_raka.jumlah_soal);
    for (const kotak of contohResponsSelesai.peta) {
      const [status, sumber] = asesmen_raka.status_akhir[kotak.tp_kode];
      expect(kotak.status).toBe(status);
      expect(kotak.sumber_status).toBe(sumber === "-" ? null : sumber);
    }
  });
});
