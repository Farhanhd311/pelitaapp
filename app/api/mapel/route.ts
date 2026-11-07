// GET /api/mapel: daftar mata pelajaran yang punya TP (untuk memilih mapel_id). Wajib login.
// mapel_id tidak ditulis langsung di kode frontend: diambil dari sini (PANDUAN 9, "menambah mapel cukup menambah data").

import { tanganiApi } from "@/lib/api/respons";
import { ambilDaftarMapel } from "@/lib/db/anak";
import { wajibLogin } from "@/lib/db/rbac";
import type { ResponsMapel } from "@/lib/kontrak/peta";

export const GET = tanganiApi(async () => {
  await wajibLogin();
  const respons: ResponsMapel = { mapel: await ambilDaftarMapel() };
  return Response.json(respons);
});
