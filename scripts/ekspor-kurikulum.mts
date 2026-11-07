// Skrip untuk mengekspor kurikulum & bank soal dari database MySQL lokal ke berkas JSON di folder data/.
// Berguna saat anggota tim menambahkan atau mengedit soal langsung di database lokal mereka,
// agar perubahannya dapat di-commit ke Git dan diimpor oleh anggota tim lainnya.
//
// Jalankan: npm run ekspor-kurikulum

import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import type { Connection, RowDataPacket } from "mysql2/promise";

const AKAR = path.resolve(import.meta.dirname, "..");

const BERKAS_MAPEL: { mapelId: number; namaDefault: string; berkas: string }[] = [
  { mapelId: 1, namaDefault: "Matematika", berkas: path.join(AKAR, "data", "data_awal_matematika_fase_A_B.json") },
  { mapelId: 2, namaDefault: "Bahasa Indonesia", berkas: path.join(AKAR, "data", "data_awal_bahasa_indonesia_fase_A_B.json") },
  { mapelId: 3, namaDefault: "IPAS", berkas: path.join(AKAR, "data", "data_awal_ipas_kelas_4.json") },
  { mapelId: 4, namaDefault: "Pendidikan Pancasila", berkas: path.join(AKAR, "data", "data_awal_pendidikan_pancasila_kelas_4.json") },
];

function wajibEnv(nama: string): string {
  const nilai = process.env[nama];
  if (!nilai) throw new Error(`${nama} belum diatur di file .env`);
  return nilai;
}

async function main() {
  console.log("=== EKSPOR KURIKULUM & BANK SOAL DARI DATABASE ===");
  const urlDb = wajibEnv("DATABASE_URL");
  const conn: Connection = await mysql.createConnection(urlDb);

  try {
    for (const item of BERKAS_MAPEL) {
      // 1. Cek mapel di database
      const [barisMapel] = await conn.query<RowDataPacket[]>(
        "SELECT id, nama FROM mapel WHERE id = ?",
        [item.mapelId],
      );
      if (barisMapel.length === 0) {
        console.log(`[Lewati] Mapel ID ${item.mapelId} (${item.namaDefault}) belum ada di database.`);
        continue;
      }

      // 2. Baca TP
      const [daftarTp] = await conn.query<RowDataPacket[]>(
        `SELECT kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi
         FROM tujuan_pembelajaran
         WHERE mapel_id = ?
         ORDER BY urutan ASC, kode ASC`,
        [item.mapelId],
      );

      // 3. Baca prasyarat TP
      const [prasyarat] = await conn.query<RowDataPacket[]>(
        `SELECT p.tp_kode, p.prasyarat_kode
         FROM prasyarat_tp p
         JOIN tujuan_pembelajaran t ON t.kode = p.tp_kode
         WHERE t.mapel_id = ?
         ORDER BY p.tp_kode ASC, p.prasyarat_kode ASC`,
        [item.mapelId],
      );

      // 4. Baca soal
      const [daftarSoal] = await conn.query<RowDataPacket[]>(
        `SELECT s.id, s.tp_kode, s.penggunaan, s.tingkat_kesulitan, s.pertanyaan, s.bacaan, s.visual, s.pembahasan
         FROM soal s
         JOIN tujuan_pembelajaran t ON t.kode = s.tp_kode
         WHERE t.mapel_id = ?
         ORDER BY s.tp_kode ASC, s.id ASC`,
        [item.mapelId],
      );

      // 5. Baca pilihan untuk setiap soal
      const soalLengkap = await Promise.all(
        daftarSoal.map(async (s) => {
          const [daftarPilihan] = await conn.query<RowDataPacket[]>(
            `SELECT teks, benar, miskonsepsi
             FROM pilihan
             WHERE soal_id = ?
             ORDER BY id ASC`,
            [s.id],
          );
          return {
            id: s.id,
            tp_kode: s.tp_kode,
            penggunaan: s.penggunaan,
            tingkat_kesulitan: Number(s.tingkat_kesulitan),
            pertanyaan: s.pertanyaan,
            ...(s.bacaan ? { bacaan: s.bacaan } : {}),
            ...(s.visual ? { visual: s.visual } : {}),
            pilihan: daftarPilihan.map((p) => ({
              teks: p.teks,
              benar: Boolean(p.benar),
              ...(p.miskonsepsi ? { miskonsepsi: p.miskonsepsi } : {}),
            })),
            ...(s.pembahasan ? { pembahasan: s.pembahasan } : {}),
          };
        }),
      );

      // 6. Pertahankan meta lama jika file sudah ada
      let meta = {
        judul: `Data kurikulum ${barisMapel[0].nama}`,
        versi: "1.0",
        terakhir_diekspor: new Date().toISOString(),
      };
      if (fs.existsSync(item.berkas)) {
        try {
          const lama = JSON.parse(fs.readFileSync(item.berkas, "utf8"));
          if (lama.meta) meta = { ...lama.meta, terakhir_diekspor: new Date().toISOString() };
        } catch {}
      }

      const hasilJson = {
        meta,
        mapel: [{ id: barisMapel[0].id, nama: barisMapel[0].nama }],
        tujuan_pembelajaran: daftarTp.map((t) => ({
          kode: t.kode,
          mapel_id: t.mapel_id,
          elemen: t.elemen,
          fase: t.fase,
          kelas: Number(t.kelas),
          urutan: Number(t.urutan),
          deskripsi: t.deskripsi,
          esensial_transisi: Boolean(t.esensial_transisi),
        })),
        prasyarat_tp: prasyarat.map((p) => ({
          tp_kode: p.tp_kode,
          prasyarat_kode: p.prasyarat_kode,
        })),
        soal: soalLengkap,
      };

      fs.writeFileSync(item.berkas, JSON.stringify(hasilJson, null, 2) + "\n", "utf8");
      console.log(
        `✓ ${barisMapel[0].nama}: Berhasil diekspor ${daftarTp.length} TP, ${prasyarat.length} prasyarat, ${soalLengkap.length} soal -> ${path.relative(AKAR, item.berkas)}`,
      );
    }

    console.log("\nEkspor selesai! File di folder data/ siap di-commit dan di-push ke Git.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Gagal melakukan ekspor:", err);
  process.exit(1);
});
