// POST /api/ai/buat-soal: "Buat variasi soal dengan AI" untuk admin (PANDUAN 8.5, PRD 9.12).
//   1. LLM membuat soal (JSON) dari deskripsi TP + contoh soal terbit.
//   2. Server memvalidasi OTOMATIS (lib/ai/validasi.ts): 4 pilihan, 1 kunci, tanpa pilihan ganda, miskonsepsi tiap
//      pengecoh, kunci soal hitungan DIHITUNG ULANG program, kalimat pendek, kata sensitif, tidak terlalu mirip.
//   3. Lolos -> masuk antrean tinjauan berstatus 'draf' (label "Dibuat AI"). TIDAK PERNAH langsung tampil ke anak.
// Kontrak: lib/kontrak/ai.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { panggilLLM } from "@/lib/ai/client";
import { cadanganSoal } from "@/lib/ai/fallbacks";
import { pesanGeneratorSoal, promptGeneratorSoal, VERSI_PROMPT } from "@/lib/ai/prompts";
import { KeluaranSoal } from "@/lib/ai/schemas";
import { periksaSoalAI } from "@/lib/ai/validasi";
import { denganTransaksi, query } from "@/lib/db";
import { wajibAdmin } from "@/lib/db/rbac";
import { pertanyaanTp, simpanSoalAI } from "@/lib/db/soal";
import { PermintaanBuatSoal, type ResponsBuatSoal } from "@/lib/kontrak/ai";
import { catatAktivitas } from "@/lib/log";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

// Banyaknya contoh soal terbit yang dikirim ke LLM (cukup untuk memberi gaya, tetap hemat token).
const JUMLAH_CONTOH = 3;

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibAdmin();
  const minta = await bacaBody(req, PermintaanBuatSoal);

  const tp = (await query<{ deskripsi: string; kelas: number }[]>("SELECT deskripsi, kelas FROM tujuan_pembelajaran WHERE kode = ?", [minta.tp_kode]))[0];
  if (!tp) throw new GalatApi("TIDAK_DITEMUKAN", "TP tidak ditemukan.");

  const contohSoal = await query<{ id: string; pertanyaan: string }[]>(
    "SELECT id, pertanyaan FROM soal WHERE tp_kode = ? AND status = 'terbit' ORDER BY tingkat_kesulitan, id LIMIT ?",
    [minta.tp_kode, JUMLAH_CONTOH],
  );
  const pilihanContoh = contohSoal.length
    ? await query<{ soal_id: string; teks: string }[]>("SELECT soal_id, teks FROM pilihan WHERE soal_id IN (?) ORDER BY id", [contohSoal.map((s) => s.id)])
    : [];

  const hasil = await panggilLLM({
    fitur: "generator_soal",
    ringkasan_input: `TP ${minta.tp_kode}, ${minta.penggunaan}, kesulitan ${minta.tingkat_kesulitan}`,
    versi_prompt: VERSI_PROMPT.generator_soal,
    system: promptGeneratorSoal(),
    pesan: pesanGeneratorSoal({
      deskripsi_tp: tp.deskripsi,
      kelas: tp.kelas,
      penggunaan: minta.penggunaan,
      tingkat_kesulitan: minta.tingkat_kesulitan,
      contoh: contohSoal.map((s) => ({ pertanyaan: s.pertanyaan, pilihan: pilihanContoh.filter((p) => p.soal_id === s.id).map((p) => p.teks) })),
    }),
    skema: KeluaranSoal,
    max_tokens: 2048,
    cadangan: () => cadanganSoal(minta.tp_kode),
  });

  const nilai = await ambilPengaturanAktif();
  let respons: ResponsBuatSoal = {
    diterima: false,
    soal_id: null,
    galat_validasi: [],
    kunci_dicek_program: false,
    log_ai_id: hasil.log_ai_id,
    pakai_cadangan: hasil.pakai_cadangan,
  };

  if (!hasil.hasil) {
    respons.galat_validasi = ["AI sedang tidak tersedia dan belum ada soal cadangan untuk TP ini. Coba lagi nanti."];
    return Response.json(respons);
  }

  const cek = periksaSoalAI(hasil.hasil, {
    soal_ada: await pertanyaanTp(minta.tp_kode),
    maks_kata_per_kalimat: Number(nilai["generator_soal.maks_kata_per_kalimat"]),
    ambang_kemiripan: Number(nilai["generator_soal.ambang_kemiripan"]),
  });
  respons = { ...respons, galat_validasi: cek.galat, kunci_dicek_program: cek.kunci_dicek_program };
  if (cek.galat.length > 0) return Response.json(respons); // tidak masuk antrean

  const soalId = `${minta.tp_kode}-AI${Date.now().toString(36).toUpperCase()}`;
  await denganTransaksi((kueri) =>
    simpanSoalAI(kueri, {
      soal_id: soalId,
      tp_kode: minta.tp_kode,
      penggunaan: minta.penggunaan,
      tingkat_kesulitan: minta.tingkat_kesulitan,
      soal: hasil.hasil!,
      dibuat_oleh: sesi.user_id,
    }),
  );
  await catatAktivitas({
    user_id: sesi.user_id,
    jenis_tindakan: "buat_soal",
    entitas: "soal",
    entitas_id: soalId,
    detail: { log_ai_id: hasil.log_ai_id, pakai_cadangan: hasil.pakai_cadangan, kunci_dicek_program: cek.kunci_dicek_program },
  });
  respons = { ...respons, diterima: true, soal_id: soalId };
  return Response.json(respons);
});
