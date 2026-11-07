// GET   /api/pendamping/anak?anak_id=1: profil anak untuk halaman pengaturan pendamping.
// PATCH /api/pendamping/anak: ubah mode jeda, batas layar, fase pengobatan. HANYA orang tua/wali (PANDUAN 4);
//       guru pendamping hanya bisa melihat. Tidak ada diagnosis atau data obat yang disimpan (PANDUAN 12).
// Kontrak: lib/kontrak/pendamping.ts

import { bacaBody, tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { ambilAnak } from "@/lib/db/anak";
import { bacaAnakId, wajibPendampingAnak } from "@/lib/db/pendamping";
import { wajibModePendamping, wajibOrangTuaAtauWali } from "@/lib/db/rbac";
import { PermintaanTambahAnak, PermintaanUbahAnak, type ResponsAnak } from "@/lib/kontrak/pendamping";
import { catatAktivitas } from "@/lib/log";
import type { ResultSetHeader } from "mysql2";

async function profil(anakId: number, bisaMengubah: boolean): Promise<ResponsAnak> {
  const a = await ambilAnak(anakId);
  return {
    anak_id: a.id,
    nama_panggilan: a.nama_panggilan,
    tgl_lahir: a.tgl_lahir,
    kelas_terakhir: a.kelas_terakhir,
    kelas_seharusnya: a.kelas_seharusnya,
    fase_pengobatan: a.fase_pengobatan,
    mode_jeda: a.mode_jeda,
    batas_layar_menit: a.batas_layar_menit,
    bisa_mengubah: bisaMengubah,
  };
}

export const GET = tanganiApi(async (req: Request) => {
  const anakId = bacaAnakId(req);
  const { hubungan } = await wajibPendampingAnak(anakId, "profil_anak");
  return Response.json(await profil(anakId, hubungan === "orang_tua" || hubungan === "wali"));
});

export const PATCH = tanganiApi(async (req: Request) => {
  const sesi = await wajibModePendamping();
  const minta = await bacaBody(req, PermintaanUbahAnak);
  await wajibOrangTuaAtauWali(sesi, minta.anak_id, "ubah_profil_anak");

  const kolom: string[] = [];
  const nilai: unknown[] = [];
  if (minta.mode_jeda !== undefined) {
    kolom.push("mode_jeda = ?");
    nilai.push(minta.mode_jeda ? 1 : 0);
  }
  if (minta.batas_layar_menit !== undefined) {
    kolom.push("batas_layar_menit = ?");
    nilai.push(minta.batas_layar_menit);
  }
  if (minta.fase_pengobatan !== undefined) {
    kolom.push("fase_pengobatan = ?");
    nilai.push(minta.fase_pengobatan);
  }
  // Nama kolom berasal dari daftar tetap di atas, bukan dari masukan pengguna; nilainya tetap berparameter.
  await query(`UPDATE anak SET ${kolom.join(", ")} WHERE id = ?`, [...nilai, minta.anak_id]);

  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: "ubah_profil_anak",
    entitas: "anak",
    entitas_id: minta.anak_id,
    detail: { diubah: kolom.map((k) => k.split(" ")[0]) }, // nama kolom saja, tanpa nilai kesehatan
  });
  return Response.json(await profil(minta.anak_id, true));
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibModePendamping();
  const minta = await bacaBody(req, PermintaanTambahAnak);

  const kelasTerakhir = minta.kelas_terakhir ?? minta.kelas_seharusnya;
  const res = await query<ResultSetHeader>(
    `INSERT INTO anak (nama_panggilan, tgl_lahir, kelas_terakhir, kelas_seharusnya, fase_pengobatan, mode_jeda)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [minta.nama_panggilan, minta.tgl_lahir, kelasTerakhir, minta.kelas_seharusnya, minta.fase_pengobatan],
  );
  const anakId = res.insertId;

  await query(
    `INSERT INTO pendampingan (pendamping_id, anak_id, hubungan) VALUES (?, ?, ?)`,
    [sesi.user_id, anakId, minta.hubungan],
  );

  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: "tambah_anak",
    entitas: "anak",
    entitas_id: anakId,
    detail: { nama_panggilan: minta.nama_panggilan, hubungan: minta.hubungan },
  });

  return Response.json({
    sukses: true,
    anak_id: anakId,
    nama_panggilan: minta.nama_panggilan,
  });
});
