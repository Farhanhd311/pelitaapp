// Migrasi skema PELITA: menjalankan file lib/db/migrasi/NNNN_keterangan.sql yang BELUM pernah dijalankan,
// urut nama file, tanpa menghapus data. Pakai ini (bukan seed) setiap kali skema berubah.
//
// Jalankan: npm run migrasi
//
// Aturan:
//   - Setiap file dijalankan sekali; namanya + checksum dicatat di tabel riwayat_migrasi.
//   - File yang SUDAH dijalankan tidak boleh diubah (checksum berbeda -> berhenti dengan pesan).
//     Perubahan berikutnya = file migrasi baru dengan nomor berikutnya.
//   - Checksum dihitung setelah baris dinormalkan ke LF, supaya CRLF di Windows tidak dianggap perubahan.
//   - Database baru dari `npm run seed` sudah memakai schema.sql terbaru dan mencatat semua migrasi sebagai sudah jalan.
//
// Catatan: dijalankan langsung oleh Node (--experimental-strip-types), jadi pakai `import type` untuk tipe.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

const FOLDER_MIGRASI = path.resolve(import.meta.dirname, "..", "lib", "db", "migrasi");

export function checksum(isi: string): string {
  return crypto.createHash("sha256").update(isi.replace(/\r\n/g, "\n")).digest("hex");
}

export function daftarMigrasi(): { nama: string; isi: string }[] {
  return fs
    .readdirSync(FOLDER_MIGRASI)
    .filter((f) => /^\d{4}_[\w-]+\.sql$/.test(f))
    .sort()
    .map((nama) => ({ nama, isi: fs.readFileSync(path.join(FOLDER_MIGRASI, nama), "utf8") }));
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Variabel lingkungan DATABASE_URL belum diisi di .env");

  const db = await mysql.createConnection({ uri: url, charset: "utf8mb4", timezone: "Z", multipleStatements: true });
  try {
    await db.query("SET time_zone = '+00:00'");
    await db.query(`CREATE TABLE IF NOT EXISTS riwayat_migrasi (
      nama VARCHAR(200) NOT NULL, checksum CHAR(64) NOT NULL,
      dijalankan_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (nama)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    const [baris] = await db.query<RowDataPacket[]>("SELECT nama, checksum FROM riwayat_migrasi");
    const sudah = new Map(baris.map((b) => [b.nama as string, b.checksum as string]));

    let dijalankan = 0;
    for (const m of daftarMigrasi()) {
      const cek = checksum(m.isi);
      const lama = sudah.get(m.nama);
      if (lama) {
        if (lama !== cek) {
          throw new Error(`${m.nama} sudah pernah dijalankan tetapi isinya berubah. Jangan ubah migrasi lama; buat file migrasi baru.`);
        }
        continue;
      }
      // DDL MySQL tidak bisa di-rollback, jadi setiap file ditulis aman diulang (IF NOT EXISTS).
      await db.query(m.isi);
      await db.query("INSERT INTO riwayat_migrasi (nama, checksum) VALUES (?, ?)", [m.nama, cek]);
      console.log(`✓ ${m.nama}`);
      dijalankan++;
    }
    console.log(dijalankan === 0 ? "Skema sudah terbaru." : `${dijalankan} migrasi dijalankan. Lanjutkan dengan Reset demo untuk mengisi data awal yang baru.`);
  } finally {
    await db.end();
  }
}

// Dijalankan langsung (npm run migrasi), bukan saat diimpor oleh seed.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  main().catch((galat: unknown) => {
    console.error("Migrasi gagal:", galat instanceof Error ? galat.message : galat);
    process.exit(1);
  });
}
