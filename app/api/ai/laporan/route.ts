// POST /api/ai/laporan: draf laporan capaian untuk sekolah asal (PANDUAN 8.3, PRD 9.9). Mode pendamping.
// LLM menyusun deskripsi per TP dari PROGRES_TP; hasilnya DRAF yang harus diperiksa pendamping.
// Input ke LLM tanpa nama anak ("Ananda"). Cadangan: templat per status (selalu lengkap).
// Kontrak: lib/kontrak/ai.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { panggilLLM } from "@/lib/ai/client";
import { cadanganLaporan } from "@/lib/ai/fallbacks";
import { pesanLaporan, promptLaporan, VERSI_PROMPT } from "@/lib/ai/prompts";
import { KeluaranLaporan } from "@/lib/ai/schemas";
import { periksaLaporan } from "@/lib/ai/validasi";
import { ambilAnak, ambilDaftarMapel, ambilProgres, ambilTpMapel } from "@/lib/db/anak";
import { wajibPendampingAnak } from "@/lib/db/pendamping";
import { PermintaanLaporan, type ResponsDrafLaporan } from "@/lib/kontrak/ai";

export const POST = tanganiApi(async (req: Request) => {
  const minta = await bacaBody(req, PermintaanLaporan);
  await wajibPendampingAnak(minta.anak_id, "draf_laporan");

  const [anak, daftar, progres, mapel] = await Promise.all([
    ambilAnak(minta.anak_id),
    ambilTpMapel(minta.mapel_id),
    ambilProgres(minta.anak_id, minta.mapel_id),
    ambilDaftarMapel(),
  ]);
  const namaMapel = mapel.find((m) => m.mapel_id === minta.mapel_id)?.nama;
  if (!namaMapel) throw new GalatApi("TIDAK_DITEMUKAN", "Mata pelajaran tidak ditemukan.");

  const tp = daftar.map((t) => ({
    tp_kode: t.kode,
    deskripsi: t.deskripsi,
    status: progres.get(t.kode)?.status ?? "belum_diketahui",
    sumber_status: progres.get(t.kode)?.sumber_status ?? null,
  }));

  const hasil = await panggilLLM({
    fitur: "laporan",
    anak_id: minta.anak_id,
    ringkasan_input: `laporan ${namaMapel}, ${tp.length} TP`,
    versi_prompt: VERSI_PROMPT.laporan,
    system: promptLaporan(),
    pesan: pesanLaporan({ mapel: namaMapel, kelas_seharusnya: anak.kelas_seharusnya, tp }),
    skema: KeluaranLaporan,
    max_tokens: 4096,
    periksa: (k) => periksaLaporan(k, tp.map((t) => t.tp_kode)),
    cadangan: () => cadanganLaporan({ mapel: namaMapel, tp }),
  });

  const draf = hasil.hasil!;
  const deskripsiAi = new Map(draf.capaian.map((c) => [c.tp_kode, c.deskripsi]));
  const respons: ResponsDrafLaporan = {
    label: "Draf dibuat AI — periksa sebelum dikirim",
    pengantar: draf.pengantar,
    capaian: tp.map((t) => ({ tp_kode: t.tp_kode, deskripsi_tp: t.deskripsi, status: t.status, deskripsi: deskripsiAi.get(t.tp_kode) ?? "" })),
    saran: draf.saran,
    log_ai_id: hasil.log_ai_id,
    pakai_cadangan: hasil.pakai_cadangan,
  };
  return Response.json(respons);
});
