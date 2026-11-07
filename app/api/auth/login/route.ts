// POST /api/auth/login: login pendamping/admin dengan email + password (PRD F-AUTH-1).
// Kontrak: lib/kontrak/auth.ts. Pesan gagal sengaja sama untuk email salah dan password salah,
// supaya tidak membocorkan email mana yang terdaftar.

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { cocokkanPassword, masuk, type Peran } from "@/lib/auth/sesi";
import { query } from "@/lib/db";
import { PermintaanLogin, type ResponsLogin } from "@/lib/kontrak/auth";
import { catatAktivitas } from "@/lib/log";

export const POST = tanganiApi(async (req: Request) => {
  const { email, password } = await bacaBody(req, PermintaanLogin);

  const baris = await query<{ id: number; nama: string; role: Peran; password_hash: string }[]>(
    "SELECT id, nama, role, password_hash FROM users WHERE email = ?",
    [email],
  );
  const user = baris[0];

  if (!(await cocokkanPassword(password, user?.password_hash ?? null))) {
    // Email tidak dicatat di log (data pribadi); cukup id jika akunnya ada.
    await catatAktivitas({ user_id: user?.id ?? null, jenis_tindakan: "gagal_login" });
    throw new GalatApi("BELUM_LOGIN", "Email atau password belum cocok.");
  }

  await masuk({ id: user.id, role: user.role });
  await catatAktivitas({ user_id: user.id, jenis_tindakan: "login" });

  // Admin langsung ke halaman admin; pendamping ke layar pilih profil (avatar anak / "Pendamping").
  const respons: ResponsLogin = {
    nama: user.nama,
    role: user.role,
    mode: user.role === "admin" ? "admin" : "pilih_profil",
  };
  return Response.json(respons);
});
