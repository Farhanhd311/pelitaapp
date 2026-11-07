// Skrip seed PELITA: membuat ulang SEMUA tabel lalu mengisi data awal.
// HANYA untuk database lokal/demo, karena semua data lama dihapus.
//
// Jalankan: npm run seed
// Untuk database demo di internet (misalnya yang dipakai Vercel): npm run seed -- --izinkan-remote
// Hanya menambah kurikulum ke database yang sudah ada (tanpa menghapus apa pun): npm run impor-kurikulum
//
// Isi yang dimasukkan:
//   1. Kurikulum semua mapel dari KURIKULUM di bawah (mapel, TP, prasyarat, soal + pilihan), berstatus 'terbit'.
//      Matematika dan Bahasa Indonesia: data awal tim (sumber 'manual'). IPAS dan Pendidikan Pancasila: ditulis
//      dengan bantuan AI (sumber 'ai'), diterbitkan langsung atas keputusan tim untuk demo; tetap wajib ditinjau guru.
//   2. PENGATURAN_SISTEM versi 1 dari meta.parameter_bkt Matematika + data/seed_pengaturan_sistem.json (PANDUAN 8.4).
//   3. Akun demo (Admin, Ibu Sari, Kak Dina) dan profil anak Raka beserta relasi pendampingannya.
//
// Catatan: dijalankan langsung oleh Node (--experimental-strip-types), jadi pakai `import type`
// untuk impor yang hanya berupa tipe.

import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import type { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

const AKAR = path.resolve(import.meta.dirname, "..");
const FILE_SKEMA = path.join(AKAR, "lib", "db", "schema.sql");
const FILE_MATEMATIKA = path.join(AKAR, "data", "data_awal_matematika_fase_A_B.json");
// Semua kurikulum yang diimpor. Menambah mapel = menambah satu baris di sini (dan file datanya).
const KURIKULUM: { file: string; sumber: "manual" | "ai" }[] = [
  { file: FILE_MATEMATIKA, sumber: "manual" },
  { file: path.join(AKAR, "data", "data_awal_bahasa_indonesia_fase_A_B.json"), sumber: "manual" },
  { file: path.join(AKAR, "data", "data_awal_ipas_kelas_4.json"), sumber: "ai" },
  { file: path.join(AKAR, "data", "data_awal_pendidikan_pancasila_kelas_4.json"), sumber: "ai" },
];
const FILE_PENGATURAN = path.join(AKAR, "data", "seed_pengaturan_sistem.json");

const HOST_LOKAL = ["localhost", "127.0.0.1", "::1", "[::1]"];
const BCRYPT_ROUNDS = 10; // biaya hash bcrypt (keamanan), bukan aturan bisnis

// Data demo sesuai PANDUAN bagian 14 dan PRD 5.1. Nama samaran.
// Riwayat check-in, skrining, dan rujukan Raka menyusul di data/seed_demo_raka.json.
const AKUN_DEMO = [
  { kunci: "admin", nama: "Admin PELITA", email: "admin@pelita.demo", role: "admin", punyaPin: false },
  { kunci: "sari", nama: "Ibu Sari", email: "sari@pelita.demo", role: "pendamping", punyaPin: true },
  { kunci: "dina", nama: "Kak Dina", email: "dina@pelita.demo", role: "pendamping", punyaPin: true },
] as const;

const ANAK_DEMO = {
  nama_panggilan: "Raka",
  tgl_lahir: "2016-03-15", // 10 tahun saat hackathon (November 2026)
  kelas_terakhir: 3,
  kelas_seharusnya: 4,
  tgl_berhenti_sekolah: null,
  fase_pengobatan: "pemeliharaan",
  mode_jeda: 0,
  batas_layar_menit: null,
};

const PENDAMPINGAN_DEMO = [
  { akun: "sari", hubungan: "orang_tua" },
  { akun: "dina", hubungan: "guru" },
] as const;

// ---------- Tipe data file JSON ----------

type PilihanData = { teks: string; benar: boolean; miskonsepsi?: string };
type SoalData = {
  id: string;
  tp_kode: string;
  penggunaan: string;
  tingkat_kesulitan: number;
  pertanyaan: string;
  bacaan?: string;
  visual?: string;
  pilihan: PilihanData[];
  pembahasan?: string;
};
type DataKurikulum = {
  meta: { parameter_bkt?: Record<string, unknown> };
  mapel: { id: number; nama: string }[];
  tujuan_pembelajaran: {
    kode: string;
    mapel_id: number;
    elemen: string;
    fase: string;
    kelas: number;
    urutan: number;
    deskripsi: string;
    esensial_transisi: boolean;
  }[];
  prasyarat_tp: { tp_kode: string; prasyarat_kode: string }[];
  soal: SoalData[];
};
type DataPengaturan = {
  kunci_parameter_bkt: { awalan_bawaan: string; pengecualian: Record<string, string> };
  pengaturan: Record<string, unknown>;
};

// ---------- Pembantu ----------

function bacaJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function wajibEnv(nama: string): string {
  const nilai = process.env[nama];
  if (!nilai) {
    throw new Error(`${nama} belum diisi di .env`);
  }
  return nilai;
}

// Tolak menjalankan seed ke database di internet kecuali diminta eksplisit.
function cekDatabaseAman(url: URL): void {
  const lokal = HOST_LOKAL.includes(url.hostname);
  const izinRemote = process.argv.includes("--izinkan-remote");
  if (!lokal && !izinRemote) {
    throw new Error(
      `Host database "${url.hostname}" bukan lokal. Seed menghapus SEMUA data. ` +
        "Jika ini memang database demo, jalankan: npm run seed -- --izinkan-remote",
    );
  }
}

// Ambil nama tabel dari schema.sql supaya daftar tabel tidak ditulis dua kali.
function namaTabelDariSkema(skema: string): string[] {
  return [...skema.matchAll(/CREATE TABLE\s+`?(\w+)`?/gi)].map((m) => m[1]);
}

// ---------- Langkah seed ----------

async function buatUlangTabel(db: Connection, namaDatabase: string): Promise<void> {
  const skema = fs.readFileSync(FILE_SKEMA, "utf8");
  const tabel = namaTabelDariSkema(skema);

  await db.query(
    `ALTER DATABASE ${mysql.escapeId(namaDatabase)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await db.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const nama of [...tabel].reverse()) {
    await db.query(`DROP TABLE IF EXISTS ${mysql.escapeId(nama)}`);
  }
  await db.query("SET FOREIGN_KEY_CHECKS = 1");
  await db.query(skema);
  console.log(`✓ ${tabel.length} tabel dibuat ulang dari schema.sql`);
}

// INSERT IGNORE + lewati soal yang sudah ada: aman dijalankan berulang di database yang sudah terisi
// (mode --impor-kurikulum). Data yang sudah ada tidak diubah.
async function imporKurikulum(db: Connection, data: DataKurikulum, sumber: "manual" | "ai"): Promise<void> {
  for (const m of data.mapel) {
    await db.query("INSERT IGNORE INTO mapel (id, nama) VALUES (?, ?)", [m.id, m.nama]);
  }

  for (const tp of data.tujuan_pembelajaran) {
    await db.query(
      `INSERT IGNORE INTO tujuan_pembelajaran
         (kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tp.kode, tp.mapel_id, tp.elemen, tp.fase, tp.kelas, tp.urutan, tp.deskripsi, tp.esensial_transisi ? 1 : 0],
    );
  }

  for (const p of data.prasyarat_tp) {
    await db.query("INSERT IGNORE INTO prasyarat_tp (tp_kode, prasyarat_kode) VALUES (?, ?)", [
      p.tp_kode,
      p.prasyarat_kode,
    ]);
  }

  let jumlahPilihan = 0;
  let jumlahSoal = 0;
  for (const s of data.soal) {
    const [ada] = await db.query<RowDataPacket[]>("SELECT id FROM soal WHERE id = ?", [s.id]);
    if (ada.length > 0) continue;
    jumlahSoal++;
    await db.query(
      `INSERT INTO soal
         (id, tp_kode, penggunaan, tingkat_kesulitan, pertanyaan, bacaan, visual, pembahasan, sumber, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'terbit')`,
      [
        s.id,
        s.tp_kode,
        s.penggunaan,
        s.tingkat_kesulitan,
        s.pertanyaan,
        s.bacaan ?? null,
        s.visual ?? null,
        s.pembahasan ?? null,
        sumber,
      ],
    );
    for (const pil of s.pilihan) {
      await db.query("INSERT INTO pilihan (soal_id, teks, benar, miskonsepsi) VALUES (?, ?, ?, ?)", [
        s.id,
        pil.teks,
        pil.benar ? 1 : 0,
        pil.miskonsepsi ?? null,
      ]);
      jumlahPilihan++;
    }
  }

  console.log(
    `✓ Kurikulum ${data.mapel.map((m) => m.nama).join(", ")}: ${data.tujuan_pembelajaran.length} TP, ` +
      `${data.prasyarat_tp.length} prasyarat, ${jumlahSoal} soal baru (${jumlahPilihan} pilihan), sumber '${sumber}'`,
  );
}

async function isiPengaturan(
  db: Connection,
  parameterBkt: Record<string, unknown>,
  dataPengaturan: DataPengaturan,
): Promise<void> {
  const { awalan_bawaan, pengecualian } = dataPengaturan.kunci_parameter_bkt;
  const semua: Record<string, unknown> = {};

  for (const [nama, nilai] of Object.entries(parameterBkt)) {
    semua[pengecualian[nama] ?? awalan_bawaan + nama] = nilai;
  }
  Object.assign(semua, dataPengaturan.pengaturan);

  for (const [kunci, nilai] of Object.entries(semua)) {
    await db.query(
      `INSERT INTO pengaturan_sistem (kunci, nilai_json, versi, aktif, alasan)
       VALUES (?, ?, 1, 1, 'Nilai awal dari seed')`,
      [kunci, JSON.stringify(nilai)],
    );
  }
  console.log(`✓ Pengaturan sistem: ${Object.keys(semua).length} kunci (versi 1, aktif)`);
  console.warn("! krisis.daftar_kata_kunci BELUM di-seed: menunggu daftar dari tim AI (tidak boleh kosong).");
}

async function buatDataDemo(db: Connection, password: string, pin: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

  const idAkun: Record<string, number> = {};
  for (const akun of AKUN_DEMO) {
    const [hasil] = await db.query<ResultSetHeader>(
      `INSERT INTO users (nama, email, password_hash, pin_pendamping_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [akun.nama, akun.email, passwordHash, akun.punyaPin ? pinHash : null, akun.role],
    );
    idAkun[akun.kunci] = hasil.insertId;
  }

  const [hasilAnak] = await db.query<ResultSetHeader>(
    `INSERT INTO anak
       (nama_panggilan, tgl_lahir, kelas_terakhir, kelas_seharusnya, tgl_berhenti_sekolah,
        fase_pengobatan, mode_jeda, batas_layar_menit)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ANAK_DEMO.nama_panggilan,
      ANAK_DEMO.tgl_lahir,
      ANAK_DEMO.kelas_terakhir,
      ANAK_DEMO.kelas_seharusnya,
      ANAK_DEMO.tgl_berhenti_sekolah,
      ANAK_DEMO.fase_pengobatan,
      ANAK_DEMO.mode_jeda,
      ANAK_DEMO.batas_layar_menit,
    ],
  );

  for (const p of PENDAMPINGAN_DEMO) {
    await db.query("INSERT INTO pendampingan (pendamping_id, anak_id, hubungan) VALUES (?, ?, ?)", [
      idAkun[p.akun],
      hasilAnak.insertId,
      p.hubungan,
    ]);
  }

  console.log(`✓ Akun demo: ${AKUN_DEMO.map((a) => a.email).join(", ")}`);
  console.log(`✓ Anak demo: ${ANAK_DEMO.nama_panggilan} + ${PENDAMPINGAN_DEMO.length} relasi pendampingan`);
}

// ---------- Utama ----------

async function main(): Promise<void> {
  const url = new URL(wajibEnv("DATABASE_URL"));
  const password = wajibEnv("DEMO_PASSWORD");
  const pin = wajibEnv("DEMO_PIN");
  if (!/^\d+$/.test(pin)) {
    throw new Error("DEMO_PIN harus berupa angka");
  }
  const hanyaKurikulum = process.argv.includes("--impor-kurikulum");
  if (!hanyaKurikulum) cekDatabaseAman(url); // mode impor tidak menghapus apa pun

  const namaDatabase = decodeURIComponent(url.pathname.replace(/^\//, ""));
  const db = await mysql.createConnection({
    uri: url.toString(),
    charset: "utf8mb4",
    timezone: "Z",
    multipleStatements: true, // hanya di skrip seed, untuk menjalankan schema.sql sekaligus
  });

  try {
    await db.query("SET time_zone = '+00:00'");
    console.log(`Seed ke database "${namaDatabase}" di ${url.hostname}`);

    if (!hanyaKurikulum) await buatUlangTabel(db, namaDatabase);

    const dataMatematika = bacaJson<DataKurikulum>(FILE_MATEMATIKA);
    const dataPengaturan = bacaJson<DataPengaturan>(FILE_PENGATURAN);

    await db.beginTransaction();
    for (const k of KURIKULUM) await imporKurikulum(db, bacaJson<DataKurikulum>(k.file), k.sumber);
    if (!hanyaKurikulum) {
      await isiPengaturan(db, dataMatematika.meta.parameter_bkt ?? {}, dataPengaturan);
      await buatDataDemo(db, password, pin);
    }
    await db.commit();

    console.log("Seed selesai.");
  } catch (galat) {
    await db.rollback().catch(() => {});
    throw galat;
  } finally {
    await db.end();
  }
}

main().catch((galat: unknown) => {
  console.error("Seed gagal:", galat instanceof Error ? galat.message : galat);
  process.exit(1);
});
