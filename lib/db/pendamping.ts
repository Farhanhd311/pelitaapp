// Akses database untuk mode pendamping: dashboard, Keputusan Menunggu, dan laporan. Semua query berparameter.
// Hak akses (rbac) dicek di route SEBELUM fungsi-fungsi ini dipanggil.

import { GalatApi } from "@/lib/api/respons";
import { bacaJson, query } from "@/lib/db";
import { wajibAksesAnak, wajibModePendamping, type Hubungan } from "@/lib/db/rbac";
import type { ItemKeputusan } from "@/lib/kontrak/pendamping";
import type { DataSesi } from "@/lib/auth/sesi";
import { jumlahSoalKuis, type Level } from "@/lib/sesi/aturan";

// Pola semua route pendamping: wajib mode pendamping (PIN) + anak ini memang didampingi akun ini.
export async function wajibPendampingAnak(anakId: number, data: string): Promise<{ sesi: DataSesi; hubungan: Hubungan }> {
  const sesi = await wajibModePendamping();
  const hubungan = await wajibAksesAnak(sesi, anakId, data);
  return { sesi, hubungan };
}

export function bacaAnakId(req: Request): number {
  const nilai = Number(new URL(req.url).searchParams.get("anak_id"));
  if (!Number.isInteger(nilai) || nilai <= 0) throw new GalatApi("INPUT_TIDAK_VALID", "anak_id wajib diisi.");
  return nilai;
}

// ---------- Keputusan Menunggu (rujukan) ----------

export async function ambilKeputusan(anakId: number, hubungan: Hubungan, hanyaMenunggu: boolean): Promise<ItemKeputusan[]> {
  const baris = await query<
    { id: number; waktu: Date; perasaan: string | null; sumber: string | null; kebutuhan: string | null; level: number | null; layanan: string | null; status: string }[]
  >(
    `SELECT r.id, s.waktu, s.perasaan, s.sumber, s.kebutuhan, s.level, l.nama AS layanan, r.status
     FROM rujukan r JOIN skrining s ON s.id = r.skrining_id LEFT JOIN layanan_dukungan l ON l.id = r.layanan_id
     WHERE s.anak_id = ? ${hanyaMenunggu ? "AND r.status IN ('menunggu_persetujuan', 'eskalasi')" : ""}
     ORDER BY s.waktu DESC, r.id DESC`,
    [anakId],
  );
  const bolehMemutuskan = hubungan === "orang_tua" || hubungan === "wali";
  return baris.map((b) => ({
    rujukan_id: b.id,
    waktu: b.waktu.toISOString(),
    // Orang tua hanya melihat ringkasan kategori, bukan isi percakapan (PANDUAN 8.2).
    ringkasan_kategori: { perasaan: b.perasaan, sumber: b.sumber, kebutuhan: b.kebutuhan },
    level: b.level,
    layanan: b.layanan,
    status: b.status,
    bisa_memutuskan: bolehMemutuskan && b.status === "menunggu_persetujuan",
  }));
}

// ---------- Kuis gagal -> TP perlu ditinjau guru (PRD F-SESI-5) ----------

// Kuis dianggap GAGAL jika sesi belajar ditutup setelah semua soal sesuai level dijawab, tetapi TP belum tercapai.
// Sesi yang dihentikan di tengah (jawaban lebih sedikit dari rencana) tidak dihitung gagal (PANDUAN 7.1).
export async function hitungKuisGagal(
  anakId: number,
  jumlahSoal: { jumlah_soal_ringan: number; jumlah_soal_normal: number; jumlah_soal_penuh: number },
): Promise<Map<string, number>> {
  const baris = await query<{ tp_kode: string; level: Level; jumlah: number }[]>(
    `SELECT s.tp_kode, se.level, COUNT(*) AS jumlah
     FROM sesi se
     JOIN jawaban j ON j.sesi_id = se.id JOIN pilihan p ON p.id = j.pilihan_id JOIN soal s ON s.id = p.soal_id
     LEFT JOIN progres_tp pr ON pr.anak_id = se.anak_id AND pr.tp_kode = s.tp_kode
     WHERE se.anak_id = ? AND se.jenis = 'belajar' AND se.selesai IS NOT NULL
       AND (pr.status IS NULL OR pr.status <> 'tercapai')
     GROUP BY se.id, s.tp_kode, se.level`,
    [anakId],
  );
  const gagal = new Map<string, number>();
  for (const b of baris) {
    if (Number(b.jumlah) >= jumlahSoalKuis(b.level, jumlahSoal)) gagal.set(b.tp_kode, (gagal.get(b.tp_kode) ?? 0) + 1);
  }
  return gagal;
}

// ---------- Penjelasan AI terbaru (untuk penilaian jempol) ----------

export async function ambilPenjelasanAiTerbaru(anakId: number, userId: number, batas: number) {
  const baris = await query<{ id: number; created_at: Date; output_json: string; dinilai: number }[]>(
    `SELECT l.id, l.created_at, l.output_json,
            EXISTS (SELECT 1 FROM umpan_balik_ai u WHERE u.log_ai_id = l.id AND u.user_id = ?) AS dinilai
     FROM log_ai l WHERE l.anak_id = ? AND l.fitur = 'tutor' ORDER BY l.id DESC LIMIT ?`,
    [userId, anakId, batas],
  );
  return baris.map((b) => {
    const out = bacaJson<{ penjelasan?: string; cadangan?: { penjelasan?: string } }>(b.output_json);
    return {
      log_ai_id: b.id,
      waktu: b.created_at.toISOString(),
      penjelasan: out?.penjelasan ?? out?.cadangan?.penjelasan ?? "",
      sudah_dinilai: Number(b.dinilai) === 1,
    };
  });
}
