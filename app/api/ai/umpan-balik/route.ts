// POST /api/ai/umpan-balik: penilaian jempol (membantu / tidak membantu) atas keluaran AI (PANDUAN 8.6, PRD F-TUTOR-4).
// Boleh: pendamping (mode pendamping, anak di log harus anak dampingannya) dan admin.
// Kontrak: lib/kontrak/ai.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { modeSesi } from "@/lib/auth/sesi";
import { query } from "@/lib/db";
import { wajibAksesAnak, wajibLogin } from "@/lib/db/rbac";
import { PermintaanUmpanBalik } from "@/lib/kontrak/ai";

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibLogin();
  const mode = modeSesi(sesi);
  if (mode !== "admin" && mode !== "pendamping") throw new GalatApi("TIDAK_BERHAK", "Penilaian hanya untuk pendamping atau admin.");
  const minta = await bacaBody(req, PermintaanUmpanBalik);

  const log = await query<{ anak_id: number | null }[]>("SELECT anak_id FROM log_ai WHERE id = ?", [minta.log_ai_id]);
  if (!log[0]) throw new GalatApi("TIDAK_DITEMUKAN", "Keluaran AI tidak ditemukan.");
  if (mode === "pendamping") {
    if (log[0].anak_id === null) throw new GalatApi("TIDAK_BERHAK", "Tidak berhak menilai keluaran ini.");
    await wajibAksesAnak(sesi, log[0].anak_id, "penilaian_ai");
  }

  // Satu penilaian per orang per keluaran: penilaian baru menggantikan yang lama.
  await query("DELETE FROM umpan_balik_ai WHERE log_ai_id = ? AND user_id = ?", [minta.log_ai_id, sesi.user_id]);
  await query("INSERT INTO umpan_balik_ai (log_ai_id, user_id, nilai, komentar) VALUES (?, ?, ?, ?)", [
    minta.log_ai_id,
    sesi.user_id,
    minta.nilai,
    minta.komentar ?? null,
  ]);
  return Response.json({ tersimpan: true });
});
