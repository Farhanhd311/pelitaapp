// Akses database lewat satu pool mysql2: MariaDB (XAMPP) saat coding, MySQL 8 (Cloud SQL) saat deploy.
// Aturan: SELALU pakai query berparameter (tanda ?), jangan pernah menyambung string SQL.
// Kolom JSON (*_json): saat menyimpan kirim JSON.stringify(...), saat membaca pakai bacaJson(...).

import mysql from "mysql2/promise";
import type { Pool, RowDataPacket } from "mysql2/promise";

// Simpan pool di globalThis supaya hot reload `next dev` tidak membuka pool baru setiap kali.
const globalUntukDb = globalThis as unknown as { pelitaPool?: Pool };

function buatPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi di .env");
  }

  const pool = mysql.createPool({
    uri: url,
    // Di Cloud Run, Cloud SQL dihubungi lewat unix socket /cloudsql/PROJECT:REGION:INSTANCE.
    // Jika kosong (lokal/XAMPP), koneksi memakai host dan port dari DATABASE_URL.
    socketPath: process.env.DB_SOCKET_PATH || undefined,
    charset: "utf8mb4", // wajib: emoji di soal (🐟, ⭐, 📘)
    connectionLimit: 5, // setiap instance Cloud Run punya pool sendiri; Cloud SQL kecil membatasi koneksi
    timezone: "Z", // nilai Date dibaca/ditulis sebagai UTC
    // MariaDB selalu mengembalikan kolom JSON sebagai teks, MySQL 8 sebagai objek.
    // Disamakan menjadi teks di keduanya; ubah ke objek dengan bacaJson().
    jsonStrings: true,
  });

  // Pastikan NOW() dan DEFAULT CURRENT_TIMESTAMP juga bernilai UTC di setiap koneksi baru.
  pool.on("connection", (koneksi) => {
    koneksi.query("SET time_zone = '+00:00'");
  });

  return pool;
}

export function ambilPool(): Pool {
  if (!globalUntukDb.pelitaPool) {
    globalUntukDb.pelitaPool = buatPool();
  }
  return globalUntukDb.pelitaPool;
}

// Jalankan satu query berparameter dan kembalikan hasilnya.
// Contoh: await query<SoalRow[]>("SELECT * FROM soal WHERE tp_kode = ? AND status = ?", [kode, "terbit"])
export async function query<T = RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [hasil] = await ambilPool().query(sql, params);
  return hasil as T;
}

// Ubah isi kolom JSON (teks) menjadi nilai JavaScript. NULL tetap null.
export function bacaJson<T>(nilai: unknown): T | null {
  if (nilai === null || nilai === undefined) return null;
  return JSON.parse(String(nilai)) as T;
}
