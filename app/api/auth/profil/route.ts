// GET  /api/auth/profil: siapa yang login, mode sekarang, dan daftar anak untuk layar pilih profil.
// POST /api/auth/profil: ketuk avatar anak -> masuk mode anak (PRD F-AUTH-2).
// Kontrak: lib/kontrak/auth.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { modeSesi, perbaruiSesi } from "@/lib/auth/sesi";
import { query } from "@/lib/db";
import { wajibAksesAnak, wajibLogin } from "@/lib/db/rbac";
import { PermintaanPilihAnak, type ProfilAnak, type ResponsProfil } from "@/lib/kontrak/auth";

async function daftarAnakDidampingi(pendampingId: number): Promise<ProfilAnak[]> {
  return query<ProfilAnak[]>(
    `SELECT a.id AS anak_id, a.nama_panggilan, p.hubungan
     FROM pendampingan p JOIN anak a ON a.id = p.anak_id
     WHERE p.pendamping_id = ?
     ORDER BY a.nama_panggilan`,
    [pendampingId],
  );
}

export const GET = tanganiApi(async () => {
  const sesi = await wajibLogin();
  const user = (await query<{ nama: string }[]>("SELECT nama FROM users WHERE id = ?", [sesi.user_id]))[0];
  if (!user) throw new GalatApi("BELUM_LOGIN", "Akun tidak ditemukan. Silakan masuk lagi.");

  const daftar = sesi.role === "pendamping" ? await daftarAnakDidampingi(sesi.user_id) : [];
  const respons: ResponsProfil = {
    nama: user.nama,
    role: sesi.role,
    mode: modeSesi(sesi),
    anak_aktif: daftar.find((a) => a.anak_id === sesi.anak_aktif) ?? null,
    daftar_anak: daftar,
  };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibLogin();
  const { anak_id } = await bacaBody(req, PermintaanPilihAnak);
  await wajibAksesAnak(sesi, anak_id, "masuk_mode_anak"); // hanya anak yang didampingi akun ini

  // Masuk mode anak menutup mode pendamping: untuk kembali ke mode pendamping wajib PIN lagi.
  await perbaruiSesi({ anak_aktif: anak_id, mode_pendamping: false });

  // Cek apakah anak sudah pernah menyelesaikan asesmen diagnostik awal ("Petualangan Pertama")
  const progres = await query<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM progres_tp WHERE anak_id = ?",
    [anak_id],
  );
  const perluAsesmen = (progres[0]?.count ?? 0) === 0;

  return Response.json({
    mode: "anak",
    anak_id,
    perlu_asesmen: perluAsesmen,
    tujuan: perluAsesmen ? "/anak/asesmen" : "/anak",
  });
});
