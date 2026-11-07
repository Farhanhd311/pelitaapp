// GET  /api/pendamping/keputusan?anak_id=1: semua rujukan anak (Keputusan Menunggu + riwayat).
// POST /api/pendamping/keputusan: setujui / tolak rujukan. HANYA orang tua/wali (PANDUAN 4, 8.2).
// RUJUKAN.disetujui_oleh hanya sah untuk pendamping berhubungan orang_tua/wali (dicek di sini).
// Kontrak: lib/kontrak/pendamping.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { ambilKeputusan, bacaAnakId, wajibPendampingAnak } from "@/lib/db/pendamping";
import { wajibModePendamping, wajibOrangTuaAtauWali } from "@/lib/db/rbac";
import { PermintaanKeputusan, type ResponsKeputusan } from "@/lib/kontrak/pendamping";
import { catatAktivitas } from "@/lib/log";

export const GET = tanganiApi(async (req: Request) => {
  const anakId = bacaAnakId(req);
  const { hubungan } = await wajibPendampingAnak(anakId, "keputusan");
  const respons: ResponsKeputusan = { keputusan: await ambilKeputusan(anakId, hubungan, false) };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibModePendamping();
  const minta = await bacaBody(req, PermintaanKeputusan);

  const baris = await query<{ anak_id: number; status: string }[]>(
    "SELECT s.anak_id, r.status FROM rujukan r JOIN skrining s ON s.id = r.skrining_id WHERE r.id = ?",
    [minta.rujukan_id],
  );
  if (!baris[0]) throw new GalatApi("TIDAK_DITEMUKAN", "Rujukan tidak ditemukan.");
  await wajibOrangTuaAtauWali(sesi, baris[0].anak_id, "keputusan_rujukan"); // guru ditolak di sini
  if (baris[0].status !== "menunggu_persetujuan") throw new GalatApi("BENTROK", "Rujukan ini sudah diputuskan.");

  const disetujui = minta.keputusan === "setujui";
  await query(
    "UPDATE rujukan SET status = ?, disetujui_oleh = ?, disetujui_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'menunggu_persetujuan'",
    [disetujui ? "disetujui" : "ditolak", sesi.user_id, minta.rujukan_id],
  );
  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: disetujui ? "setujui_rujukan" : "tolak_rujukan",
    entitas: "rujukan",
    entitas_id: minta.rujukan_id,
  });

  const respons: ResponsKeputusan = { keputusan: await ambilKeputusan(baris[0].anak_id, "orang_tua", false) };
  return Response.json(respons);
});
