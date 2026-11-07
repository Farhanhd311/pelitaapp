// GET /api/admin/evaluasi: metrik Evaluasi AI (PANDUAN 8.6, PRD 9.13). Admin saja.
// Keandalan teknis, tutor, laporan, generator soal, dan Teman Cerita dihitung dari data NYATA.
// Asesmen BKT memakai hasil uji siswa virtual (berlabel "hasil simulasi"). Tanpa isi percakapan anak.
// Kontrak: lib/kontrak/admin.ts

import { tanganiApi } from "@/lib/api/respons";
import { bacaJson, query } from "@/lib/db";
import { ambilRiwayatCheckin } from "@/lib/db/anak";
import { wajibAdmin } from "@/lib/db/rbac";
import { ambilDataSimulasi, hitungMetrikLaporan, hitungMetrikLogAI, kelompokkanAlasan, persen } from "@/lib/evaluasi";
import type { ResponsEvaluasi } from "@/lib/kontrak/admin";
import { ambilPengaturanAktif, keParameterSesi } from "@/lib/pengaturan";
import { perluPerhatian } from "@/lib/sesi/aturan";

export const GET = tanganiApi(async () => {
  await wajibAdmin();

  const logAi = await query<{ fitur: string; valid: number; pakai_fallback: number; waktu_respons_ms: number | null }[]>(
    "SELECT fitur, valid, pakai_fallback, waktu_respons_ms FROM log_ai",
  );
  const umpan = await query<{ nilai: string }[]>(
    "SELECT u.nilai FROM umpan_balik_ai u JOIN log_ai l ON l.id = u.log_ai_id WHERE l.fitur = 'tutor'",
  );
  const unduhan = await query<{ detail_json: string | null }[]>(
    "SELECT detail_json FROM log_aktivitas WHERE jenis_tindakan = 'unduh_laporan'",
  );
  const soalAi = await query<{ status: string; alasan_penolakan: string | null }[]>(
    "SELECT status, alasan_penolakan FROM soal WHERE sumber = 'ai'",
  );
  const rujukan = await query<{ darurat: number; alarm_palsu: number; status: string }[]>(
    `SELECT (l.jenis = 'darurat') AS darurat, r.alarm_palsu, r.status
     FROM rujukan r LEFT JOIN layanan_dukungan l ON l.id = r.layanan_id`,
  );
  const [skrining] = await query<{ jumlah: number }[]>("SELECT COUNT(*) AS jumlah FROM skrining");

  // Admin hanya melihat AGREGAT kondisi anak (PANDUAN 7.1), tidak per anak.
  const atur = keParameterSesi(await ambilPengaturanAktif());
  const anak = await query<{ id: number }[]>("SELECT id FROM anak");
  let perluDiperhatikan = 0;
  for (const a of anak) if (perluPerhatian(await ambilRiwayatCheckin(a.id), atur.hari_lemas)) perluDiperhatikan++;

  const daftarUnduhan = unduhan
    .map((u) => bacaJson<{ diubah?: boolean; besar_suntingan?: number }>(u.detail_json))
    .map((d) => ({ diubah: d?.diubah ?? false, besar_suntingan: d?.besar_suntingan ?? 0 }));
  const eskalasi = rujukan.filter((r) => Number(r.darurat) === 1);
  const ditangani = eskalasi.filter((r) => r.status === "ditangani");

  const respons: ResponsEvaluasi = {
    keandalan: hitungMetrikLogAI(logAi.map((l) => ({ ...l, valid: l.valid === 1, pakai_fallback: l.pakai_fallback === 1 }))),
    tutor: { jumlah_dinilai: umpan.length, persen_membantu: persen(umpan.filter((u) => u.nilai === "membantu").length, umpan.length) },
    laporan: hitungMetrikLaporan(logAi.filter((l) => l.fitur === "laporan").length, daftarUnduhan),
    generator_soal: {
      diterbitkan: soalAi.filter((s) => s.status === "terbit").length,
      ditolak: soalAi.filter((s) => s.status === "ditolak").length,
      menunggu: soalAi.filter((s) => s.status === "draf" || s.status === "ditinjau").length,
      alasan_penolakan: kelompokkanAlasan(soalAi.filter((s) => s.status === "ditolak" && s.alasan_penolakan).map((s) => s.alasan_penolakan!)),
    },
    teman_cerita: {
      jumlah_skrining: Number(skrining.jumlah),
      jumlah_eskalasi: eskalasi.length,
      // Alarm palsu dihitung dari kasus yang sudah ditangani petugas. Alarm palsu lebih dapat diterima daripada kasus terlewat.
      persen_alarm_palsu: persen(ditangani.filter((r) => r.alarm_palsu === 1).length, ditangani.length),
    },
    agregat_anak: { jumlah_anak: anak.length, perlu_perhatian: perluDiperhatikan },
    simulasi_asesmen: ambilDataSimulasi(),
  };
  return Response.json(respons);
});
