// POST /api/auth/logout: hapus cookie sesi dan catat di log.

import { tanganiApi } from "@/lib/api/respons";
import { ambilSesi, keluar } from "@/lib/auth/sesi";
import { catatAktivitas } from "@/lib/log";

export const POST = tanganiApi(async () => {
  const sesi = await ambilSesi();
  if (sesi) await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "logout" });
  await keluar();
  return Response.json({ keluar: true });
});
