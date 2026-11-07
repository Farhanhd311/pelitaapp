// Cek kesehatan: database bisa dihubungi dan utf8mb4 benar-benar bekerja.
// Menulis lalu membaca teks berisi emoji lewat tabel TEMPORARY (hilang sendiri, tidak menambah tabel ke-21).
// Jika emoji kembali sebagai "????", berarti charset database/tabel/koneksi belum utf8mb4.

import { connection } from "next/server";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { ambilPool } from "@/lib/db";

const TEKS_UJI = "🐟📘";

export async function GET() {
  await connection(); // selalu dijalankan saat request, tidak pernah di-prerender saat build

  let koneksi: PoolConnection | undefined;
  try {
    koneksi = await ambilPool().getConnection();
    await koneksi.query("DROP TEMPORARY TABLE IF EXISTS cek_utf8mb4");
    await koneksi.query(
      "CREATE TEMPORARY TABLE cek_utf8mb4 (teks VARCHAR(20)) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    );
    await koneksi.query("INSERT INTO cek_utf8mb4 (teks) VALUES (?)", [TEKS_UJI]);
    const [baris] = await koneksi.query<RowDataPacket[]>("SELECT teks FROM cek_utf8mb4");
    await koneksi.query("DROP TEMPORARY TABLE cek_utf8mb4");

    const teksDibaca = baris[0]?.teks as string | undefined;
    const utf8mb4Benar = teksDibaca === TEKS_UJI;

    return Response.json(
      { ok: utf8mb4Benar, database: "terhubung", utf8mb4: utf8mb4Benar, teks: teksDibaca ?? null },
      { status: utf8mb4Benar ? 200 : 500 },
    );
  } catch (galat) {
    // Detail galat hanya di log server, tidak dikirim ke browser.
    console.error("Health check database gagal:", galat);
    return Response.json({ ok: false, database: "tidak terhubung" }, { status: 503 });
  } finally {
    koneksi?.release();
  }
}
