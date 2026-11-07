// GET  /api/admin/soal?tp_kode=&penggunaan=&tingkat_kesulitan=&sumber=&status=: bank soal + statistik (PANDUAN 8.5).
// POST /api/admin/soal: tinjauan soal -> terbitkan / sunting lalu terbitkan / tolak dengan alasan.
//   Soal AI TIDAK PERNAH tampil ke anak sebelum berstatus 'terbit'. Semua tindakan tercatat di LOG_AKTIVITAS.
// Kontrak: lib/kontrak/admin.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { periksaSoalAI } from "@/lib/ai/validasi";
import { denganTransaksi, query } from "@/lib/db";
import { wajibAdmin } from "@/lib/db/rbac";
import { daftarSoalAdmin } from "@/lib/db/soal";
import { FilterSoal, PermintaanSoal, type ResponsSoal } from "@/lib/kontrak/admin";
import { catatAktivitas } from "@/lib/log";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

export const GET = tanganiApi(async (req: Request) => {
  await wajibAdmin();
  const filter = FilterSoal.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!filter.success) throw new GalatApi("INPUT_TIDAK_VALID", "Filter tidak valid.");
  const respons: ResponsSoal = { soal: await daftarSoalAdmin(filter.data) };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibAdmin();
  const minta = await bacaBody(req, PermintaanSoal);

  const soal = (await query<{ status: string; tp_kode: string }[]>("SELECT status, tp_kode FROM soal WHERE id = ?", [minta.soal_id]))[0];
  if (!soal) throw new GalatApi("TIDAK_DITEMUKAN", "Soal tidak ditemukan.");

  if (minta.aksi === "tolak") {
    if (soal.status === "terbit") throw new GalatApi("BENTROK", "Soal yang sudah terbit tidak bisa ditolak dari antrean.");
    await query("UPDATE soal SET status = 'ditolak', alasan_penolakan = ?, ditinjau_oleh = ? WHERE id = ?", [minta.alasan, sesi.user_id, minta.soal_id]);
    // Alasan penolakan dicatat untuk memperbaiki prompt generator (PANDUAN 8.5) dan Evaluasi AI.
    await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "tolak_soal", entitas: "soal", entitas_id: minta.soal_id, detail: { alasan: minta.alasan } });
  } else {
    if (soal.status === "terbit" && minta.aksi === "terbitkan") throw new GalatApi("BENTROK", "Soal ini sudah terbit.");
    if (soal.status === "ditolak") throw new GalatApi("BENTROK", "Soal yang sudah ditolak tidak bisa diterbitkan.");

    if (minta.aksi === "sunting_terbitkan") {
      // Hasil suntingan manusia tetap dicek strukturnya (tepat 4 pilihan, 1 kunci, kunci hitungan benar, ...).
      const nilai = await ambilPengaturanAktif();
      const cek = periksaSoalAI(minta.data, {
        soal_ada: [],
        maks_kata_per_kalimat: Number(nilai["generator_soal.maks_kata_per_kalimat"]),
        ambang_kemiripan: Number(nilai["generator_soal.ambang_kemiripan"]),
      });
      if (cek.galat.length > 0) throw new GalatApi("INPUT_TIDAK_VALID", `Suntingan belum valid: ${cek.galat.join("; ")}`);

      await denganTransaksi(async (kueri) => {
        await kueri("UPDATE soal SET pertanyaan = ?, visual = ?, pembahasan = ? WHERE id = ?", [
          minta.data.pertanyaan, minta.data.visual, minta.data.pembahasan, minta.soal_id,
        ]);
        // Pilihan diperbarui di tempat (urut id) supaya jawaban lama yang merujuk pilihan tetap sah.
        const lama = await kueri<{ id: number }[]>("SELECT id FROM pilihan WHERE soal_id = ? ORDER BY id", [minta.soal_id]);
        if (lama.length !== minta.data.pilihan.length) throw new GalatApi("BENTROK", "Jumlah pilihan soal ini tidak bisa diubah.");
        for (const [i, p] of minta.data.pilihan.entries()) {
          await kueri("UPDATE pilihan SET teks = ?, benar = ?, miskonsepsi = ? WHERE id = ?", [p.teks, p.benar ? 1 : 0, p.benar ? null : p.miskonsepsi, lama[i].id]);
        }
      });
      await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "sunting_soal", entitas: "soal", entitas_id: minta.soal_id });
    }

    await query("UPDATE soal SET status = 'terbit', alasan_penolakan = NULL, ditinjau_oleh = ? WHERE id = ?", [sesi.user_id, minta.soal_id]);
    await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "terbitkan_soal", entitas: "soal", entitas_id: minta.soal_id });
  }

  const respons: ResponsSoal = { soal: await daftarSoalAdmin({ tp_kode: soal.tp_kode }) };
  return Response.json(respons);
});
