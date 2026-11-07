// Skrip reset demo PELITA:
// Mengembalikan profil Raka seakan-akan melakukan asesmen ulang atau baru mendaftar (PANDUAN 14).
//
// Jalankan:
//   npm run reset-demo
//   npm run reset-demo -- --baru   (opsional: mengosongkan seluruh riwayat check-in, 100% seperti akun baru)
//
// Catatan: dijalankan langsung oleh Node (--experimental-strip-types), jadi pakai `import type` untuk tipe.

import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import type { Connection, RowDataPacket } from "mysql2/promise";

const AKAR = path.resolve(import.meta.dirname, "..");
const FILE_DEMO_RAKA = path.join(AKAR, "data", "seed_demo_raka.json");
const FILE_LAYANAN = path.join(AKAR, "data", "seed_layanan_dukungan.json");

function wajibEnv(nama: string): string {
  const nilai = process.env[nama];
  if (!nilai) {
    throw new Error(`Variabel lingkungan ${nama} belum diisi di .env`);
  }
  return nilai;
}

function bacaJson<T>(lokasi: string): T {
  return JSON.parse(fs.readFileSync(lokasi, "utf-8")) as T;
}

function tanggalLokal(d = new Date()): string {
  // Waktu Indonesia Barat (UTC+7)
  const offsetMs = 7 * 60 * 60 * 1000;
  const wib = new Date(d.getTime() + offsetMs);
  return wib.toISOString().slice(0, 10);
}

function geserTanggal(tglStr: string, deltaHari: number): string {
  const d = new Date(`${tglStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaHari);
  return d.toISOString().slice(0, 10);
}

type DemoRaka = {
  nama_panggilan: string;
  profil: { fase_pengobatan: string; mode_jeda: boolean; batas_layar_menit: number | null };
  konten_contoh: Array<{
    tp_kode: string;
    jenis: string;
    format: string;
    durasi_menit: number;
    butuh_layar: boolean;
    url: string;
  }>;
  riwayat_checkin: Array<{
    hari_lalu: number;
    energi: string;
    cuaca_hati: string;
    keluhan: string[];
  }>;
  skrining: Array<{
    hari_lalu: number;
    perasaan: string;
    sumber: string;
    kebutuhan: string;
    rujukan_menunggu: boolean;
  }>;
};

type SeedLayanan = {
  layanan: Array<{
    nama: string;
    jenis: string;
    kontak: string;
  }>;
};

async function main(): Promise<void> {
  const url = wajibEnv("DATABASE_URL");
  const demo = bacaJson<DemoRaka>(FILE_DEMO_RAKA);
  const seedLayanan = bacaJson<SeedLayanan>(FILE_LAYANAN);

  const argumen = process.argv.slice(2);
  const modeBaruMurni = argumen.some((a) => a.includes("baru") || a.includes("murni")) || process.env.npm_config_baru === "true";

  const db = await mysql.createConnection({
    uri: url,
    charset: "utf8mb4",
    timezone: "Z",
  });

  try {
    await db.query("SET time_zone = '+00:00'");
    console.log(`\n=== Reset Demo Raka (${demo.nama_panggilan}) ===`);

    const [barisAnak] = await db.query<RowDataPacket[]>(
      "SELECT id FROM anak WHERE nama_panggilan = ? ORDER BY id LIMIT 1",
      [demo.nama_panggilan],
    );

    if (barisAnak.length === 0) {
      throw new Error(`Profil anak ${demo.nama_panggilan} tidak ditemukan. Silakan jalankan 'npm run seed' terlebih dahulu.`);
    }

    const anakId = (barisAnak[0] as { id: number }).id;
    const hariIni = tanggalLokal();

    await db.beginTransaction();

    // 1. Lengkapi layanan dukungan dan konten contoh jika belum ada
    for (const l of seedLayanan.layanan) {
      const [ada] = await db.query<RowDataPacket[]>(
        "SELECT id FROM layanan_dukungan WHERE LOWER(nama) = LOWER(?)",
        [l.nama],
      );
      if (ada.length === 0) {
        await db.query(
          "INSERT INTO layanan_dukungan (nama, jenis, kontak) VALUES (?, ?, ?)",
          [l.nama, l.jenis, l.kontak],
        );
      }
    }

    for (const k of demo.konten_contoh) {
      const [ada] = await db.query<RowDataPacket[]>(
        "SELECT id FROM konten WHERE tp_kode = ? AND jenis = ?",
        [k.tp_kode, k.jenis],
      );
      if (ada.length === 0) {
        await db.query(
          "INSERT INTO konten (tp_kode, jenis, format, durasi_menit, butuh_layar, url) VALUES (?, ?, ?, ?, ?, ?)",
          [k.tp_kode, k.jenis, k.format, k.durasi_menit, k.butuh_layar ? 1 : 0, k.url],
        );
      }
    }

    // 2. Kosongkan semua data proses pembelajaran & asesmen Raka
    await db.query(
      "DELETE j FROM jawaban j JOIN sesi s ON s.id = j.sesi_id WHERE s.anak_id = ?",
      [anakId],
    );
    await db.query("DELETE FROM sesi WHERE anak_id = ?", [anakId]);
    await db.query("DELETE FROM progres_tp WHERE anak_id = ?", [anakId]);
    await db.query(
      "DELETE r FROM rujukan r JOIN skrining s ON s.id = r.skrining_id WHERE s.anak_id = ?",
      [anakId],
    );
    await db.query("DELETE FROM skrining WHERE anak_id = ?", [anakId]);
    await db.query("DELETE FROM checkin WHERE anak_id = ?", [anakId]);
    await db.query("DELETE FROM log_ai WHERE anak_id = ?", [anakId]);

    // 3. Kembalikan status profil Raka ke awal
    await db.query(
      "UPDATE anak SET fase_pengobatan = ?, mode_jeda = ?, batas_layar_menit = ? WHERE id = ?",
      [
        demo.profil.fase_pengobatan,
        demo.profil.mode_jeda ? 1 : 0,
        demo.profil.batas_layar_menit,
        anakId,
      ],
    );

    if (modeBaruMurni) {
      console.log("✓ Mode Baru Murni: Semua check-in dan skrining dikosongkan total.");
    } else {
      // 4. Isi ulang riwayat check-in lampau (3-4 minggu lalu, hari ini sengaja KOSONG)
      for (const c of demo.riwayat_checkin) {
        await db.query(
          "INSERT INTO checkin (anak_id, tanggal, energi, cuaca_hati, keluhan) VALUES (?, ?, ?, ?, ?)",
          [
            anakId,
            geserTanggal(hariIni, -c.hari_lalu),
            c.energi,
            c.cuaca_hati,
            c.keluhan.length > 0 ? c.keluhan.join(",") : null,
          ],
        );
      }

      // 5. Isi ulang skrining demo dengan 1 rujukan menunggu persetujuan
      for (const s of demo.skrining) {
        const waktu = new Date(Date.now() - s.hari_lalu * 24 * 60 * 60 * 1000);
        const [hasilSkrining] = await db.query<mysql.ResultSetHeader>(
          "INSERT INTO skrining (anak_id, waktu, perasaan, sumber, kebutuhan, level, sinyal_krisis) VALUES (?, ?, ?, ?, ?, 1, 0)",
          [anakId, waktu, s.perasaan, s.sumber, s.kebutuhan],
        );

        const [layanan] = await db.query<RowDataPacket[]>(
          "SELECT id FROM layanan_dukungan ORDER BY id LIMIT 1",
        );
        if (s.rujukan_menunggu && layanan.length > 0) {
          await db.query(
            "INSERT INTO rujukan (skrining_id, layanan_id, status) VALUES (?, ?, 'menunggu_persetujuan')",
            [hasilSkrining.insertId, (layanan[0] as { id: number }).id],
          );
        }
      }
      console.log(`✓ Riwayat check-in terisi (${demo.riwayat_checkin.length} hari lalu) untuk grafik dashboard pendamping.`);
      console.log("✓ Hari ini BELUM check-in (siap untuk live demo check-in).");
      console.log("✓ Skrining & rujukan menunggu persetujuan disiapkan di dashboard pendamping.");
    }

    await db.commit();

    console.log("✓ Sesi belajar & asesmen lama: DIKOSONGKAN");
    console.log("✓ Jawaban soal lama: DIKOSONGKAN");
    console.log("✓ Progres capaian TP: DIKOSONGKAN (0 TP dikuasai)");
    console.log("\n-> Raka sekarang siap memulai asesmen adaptif dari awal di /anak/asesmen !");
    console.log("-> Atau check-in hari ini terlebih dahulu di /anak/checkin !\n");
  } catch (galat) {
    await db.rollback().catch(() => {});
    throw galat;
  } finally {
    await db.end();
  }
}

main().catch((galat: unknown) => {
  console.error("Gagal melakukan reset demo:", galat instanceof Error ? galat.message : galat);
  process.exit(1);
});
