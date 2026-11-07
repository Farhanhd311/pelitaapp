// GET  /api/admin/eskalasi: antrean rujukan & eskalasi (PANDUAN 8.2, PRD F-ESK-1). Kasus darurat di atas.
// POST /api/admin/eskalasi: tandai ditangani, tandai alarm palsu, catatan tindak lanjut. Admin saja.
// Tidak ada isi percakapan anak (tidak disimpan); hanya kategori skrining. Akses admin ke antrean dicatat.
// Kontrak: lib/kontrak/admin.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { wajibAdmin } from "@/lib/db/rbac";
import { PermintaanEskalasi, type ResponsEskalasi } from "@/lib/kontrak/admin";
import { catatAktivitas } from "@/lib/log";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

async function antrean(): Promise<ResponsEskalasi["antrean"]> {
  const hariTindakLanjut = Number((await ambilPengaturanAktif())["rujukan.hari_tindak_lanjut"]);
  const baris = await query<
    {
      id: number; anak_id: number; nama_panggilan: string; waktu: Date; darurat: number; level: number | null; layanan: string | null;
      status: string; alarm_palsu: number; catatan_tindak_lanjut: string | null; disetujui_at: Date | null;
    }[]
  >(
    `SELECT r.id, s.anak_id, a.nama_panggilan, s.waktu, (l.jenis = 'darurat') AS darurat, s.level, l.nama AS layanan,
            r.status, r.alarm_palsu, r.catatan_tindak_lanjut, r.disetujui_at
     FROM rujukan r JOIN skrining s ON s.id = r.skrining_id JOIN anak a ON a.id = s.anak_id
     LEFT JOIN layanan_dukungan l ON l.id = r.layanan_id
     ORDER BY (r.status = 'eskalasi') DESC, (r.status = 'disetujui') DESC, s.waktu DESC`,
  );
  return baris.map((b) => ({
    rujukan_id: b.id,
    anak_id: b.anak_id,
    nama_panggilan: b.nama_panggilan,
    waktu: b.waktu.toISOString(),
    darurat: Number(b.darurat) === 1,
    level: b.level,
    layanan: b.layanan,
    status: b.status,
    alarm_palsu: b.alarm_palsu === 1,
    catatan_tindak_lanjut: b.catatan_tindak_lanjut,
    // Tindak lanjut seminggu setelah rujukan disetujui orang tua (PANDUAN 8.2 langkah 6).
    tindak_lanjut_pada:
      Number.isFinite(hariTindakLanjut) && b.disetujui_at
        ? new Date(b.disetujui_at.getTime() + hariTindakLanjut * 24 * 60 * 60 * 1000).toISOString()
        : null,
  }));
}

export const GET = tanganiApi(async () => {
  const sesi = await wajibAdmin();
  await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "akses_data_anak", entitas: "antrean_eskalasi" });
  const respons: ResponsEskalasi = { antrean: await antrean() };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibAdmin();
  const minta = await bacaBody(req, PermintaanEskalasi);
  const r = (await query<{ status: string }[]>("SELECT status FROM rujukan WHERE id = ?", [minta.rujukan_id]))[0];
  if (!r) throw new GalatApi("TIDAK_DITEMUKAN", "Rujukan tidak ditemukan.");
  if (r.status === "menunggu_persetujuan" || r.status === "ditolak") {
    throw new GalatApi("BENTROK", "Rujukan ini belum disetujui orang tua/wali, jadi belum bisa ditindaklanjuti.");
  }

  await query("UPDATE rujukan SET status = 'ditangani', alarm_palsu = ?, catatan_tindak_lanjut = ? WHERE id = ?", [
    minta.alarm_palsu ? 1 : 0,
    minta.catatan,
    minta.rujukan_id,
  ]);
  // Catatan tindak lanjut tidak disalin ke log (bisa berisi hal pribadi); cukup id dan penanda alarm palsu.
  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: "tangani_eskalasi",
    entitas: "rujukan",
    entitas_id: minta.rujukan_id,
    detail: { alarm_palsu: minta.alarm_palsu },
  });
  const respons: ResponsEskalasi = { antrean: await antrean() };
  return Response.json(respons);
});
