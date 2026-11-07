// POST /api/admin/materi/pdf (multipart: file = PDF kurikulum, mapel_id): AI membaca PDF dan menyusun daftar TP
// berformat import (sama dengan data/data_awal_*.json). TIDAK menulis ke database: hasilnya dikembalikan ke layar,
// lalu masuk ke pratinjau import yang sama (POST /api/admin/materi aksi pratinjau -> terapkan). AI membantu,
// admin yang memutuskan.
//   - PDF dikirim langsung ke model (blok document base64); batas waktu & ukuran dari PENGATURAN_SISTEM.
//   - Daftar TP yang sudah ada ikut dikirim supaya TP yang sama memakai kode lamanya.
//   - Panggilan dicatat di LOG_AI (fitur impor_tp) lewat panggilLLM.

import { panggilLLM } from "@/lib/ai/client";
import { pesanImporTp, promptImporTp, VERSI_PROMPT } from "@/lib/ai/prompts";
import { KeluaranImporTp } from "@/lib/ai/schemas";
import { GalatApi, tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { wajibAdmin } from "@/lib/db/rbac";
import type { FileTp } from "@/lib/kurikulum/impor-tp";
import type { ResponsBacaPdf } from "@/lib/kontrak/materi";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

export const POST = tanganiApi(async (req: Request) => {
  await wajibAdmin();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const mapelId = Number(form?.get("mapel_id"));
  if (!(file instanceof File)) throw new GalatApi("INPUT_TIDAK_VALID", "Pilih file PDF dulu.");

  const atur = await ambilPengaturanAktif();
  const maksMb = Number(atur["impor_tp.maks_mb"] ?? 20);
  if (file.size > maksMb * 1024 * 1024) throw new GalatApi("INPUT_TIDAK_VALID", `Ukuran PDF maksimal ${maksMb} MB.`);
  const isi = Buffer.from(await file.arrayBuffer());
  // Periksa tanda tangan file, bukan hanya nama/ekstensi: PDF selalu diawali "%PDF".
  if (isi.subarray(0, 4).toString("latin1") !== "%PDF") throw new GalatApi("INPUT_TIDAK_VALID", "File ini bukan PDF.");

  const mapel = (await query<{ nama: string }[]>("SELECT nama FROM mapel WHERE id = ?", [mapelId]))[0];
  if (!mapel) throw new GalatApi("INPUT_TIDAK_VALID", "Pilih mata pelajaran tujuan.");
  const tpAda = await query<{ kode: string; kelas: number; urutan: number; deskripsi: string }[]>(
    "SELECT kode, kelas, urutan, deskripsi FROM tujuan_pembelajaran WHERE mapel_id = ? ORDER BY urutan",
    [mapelId],
  );

  const hasil = await panggilLLM({
    fitur: "impor_tp",
    ringkasan_input: `PDF ${Math.round(file.size / 1024)} KB untuk ${mapel.nama}`, // tanpa isi dokumen
    versi_prompt: VERSI_PROMPT.impor_tp,
    system: promptImporTp(),
    pesan: pesanImporTp({ mapel: mapel.nama, tp_ada: tpAda }),
    pdf_base64: isi.toString("base64"),
    batas_detik: Number(atur["impor_tp.batas_waktu_detik"] ?? 120),
    skema: KeluaranImporTp,
    max_tokens: 16000,
    cadangan: () => null, // tidak ada cadangan: admin bisa memakai import JSON
  });
  if (!hasil.hasil) {
    throw new GalatApi(
      "GALAT_SERVER",
      `AI belum bisa membaca PDF ini (${hasil.alasan_cadangan ?? "tidak diketahui"}). Coba lagi, atau pakai import JSON.`,
    );
  }
  if (hasil.hasil.tujuan_pembelajaran.length === 0) {
    throw new GalatApi("INPUT_TIDAK_VALID", `Tidak ditemukan TP ${mapel.nama} di PDF ini.`);
  }

  const data: FileTp = {
    mapel: [],
    tujuan_pembelajaran: hasil.hasil.tujuan_pembelajaran.map((t) => ({ ...t, mapel_id: mapelId })),
    prasyarat_tp: hasil.hasil.prasyarat_tp,
  };
  return Response.json({ data, jumlah_tp: data.tujuan_pembelajaran.length } satisfies ResponsBacaPdf);
});
