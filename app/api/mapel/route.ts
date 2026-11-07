// GET /api/mapel: daftar mata pelajaran yang punya TP (untuk memilih mapel_id). Wajib login.
// mapel_id tidak ditulis langsung di kode frontend: diambil dari sini (PANDUAN 9, "menambah mapel cukup menambah data").

import { tanganiApi } from "@/lib/api/respons";
import { ambilDaftarMapel } from "@/lib/db/anak";
import { wajibLogin } from "@/lib/db/rbac";
import dataMateri from "@/data/data_materi_per_kelas_SD.json";
import type { ResponsMapel } from "@/lib/kontrak/peta";

export const GET = tanganiApi(async () => {
  await wajibLogin();
  // Jenis mapel dari file data (bukan ditulis di kode); mapel yang tidak tercantum dianggap adaptif.
  const jenis = (id: number) => (dataMateri.mapel.find((m) => m.id === id)?.jenis === "pustaka" ? "pustaka" : "adaptif");
  const respons: ResponsMapel = { mapel: (await ambilDaftarMapel()).map((m) => ({ ...m, jenis: jenis(m.mapel_id) })) };
  return Response.json(respons);
});
