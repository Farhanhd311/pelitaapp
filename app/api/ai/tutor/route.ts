// POST /api/ai/tutor: AI tutor berdasarkan miskonsepsi pilihan yang dijawab anak (PANDUAN 8.1, PRD 9.7). Mode anak.
// Kontrak: lib/kontrak/ai.ts. Input ke LLM tanpa nama atau ID anak. Cadangan: jawaban tersimpan -> pembahasan soal.

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { panggilLLM } from "@/lib/ai/client";
import { cadanganTutor } from "@/lib/ai/fallbacks";
import { pesanTutor, promptTutor, VERSI_PROMPT } from "@/lib/ai/prompts";
import { KeluaranTutor } from "@/lib/ai/schemas";
import { periksaTutor } from "@/lib/ai/validasi";
import { query } from "@/lib/db";
import { wajibModeAnak } from "@/lib/db/rbac";
import { PermintaanTutor, type ResponsTutor } from "@/lib/kontrak/ai";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

export const POST = tanganiApi(async (req: Request) => {
  const { anak_id } = await wajibModeAnak();
  const minta = await bacaBody(req, PermintaanTutor);

  // Pastikan pilihan ini memang dijawab anak ini di sesinya sendiri (bukan permintaan asal).
  const baris = await query<
    { pertanyaan: string; pembahasan: string | null; tp_deskripsi: string; jawaban: string; miskonsepsi: string | null; kelas: number; benar: number }[]
  >(
    `SELECT s.pertanyaan, s.pembahasan, t.deskripsi AS tp_deskripsi, p.teks AS jawaban, p.miskonsepsi, p.benar, a.kelas_seharusnya AS kelas
     FROM jawaban j
     JOIN sesi se ON se.id = j.sesi_id
     JOIN pilihan p ON p.id = j.pilihan_id
     JOIN soal s ON s.id = p.soal_id
     JOIN tujuan_pembelajaran t ON t.kode = s.tp_kode
     JOIN anak a ON a.id = se.anak_id
     WHERE j.sesi_id = ? AND se.anak_id = ? AND se.jenis = 'belajar' AND p.id = ? AND s.id = ?
     LIMIT 1`,
    [minta.sesi_id, anak_id, minta.pilihan_id, minta.soal_id],
  );
  const d = baris[0];
  if (!d) throw new GalatApi("TIDAK_DITEMUKAN", "Jawaban ini tidak ditemukan di sesimu.");
  if (d.benar === 1) throw new GalatApi("BENTROK", "Jawabanmu sudah tepat, jadi tidak perlu penjelasan tambahan.");

  const kunci = await query<{ teks: string }[]>("SELECT teks FROM pilihan WHERE soal_id = ? AND benar = 1 LIMIT 1", [minta.soal_id]);
  const maksKalimat = Number((await ambilPengaturanAktif())["llm.maks_kalimat_tutor"]);

  const hasil = await panggilLLM({
    fitur: "tutor",
    anak_id,
    ringkasan_input: `soal ${minta.soal_id}, jawaban "${d.jawaban}"`,
    versi_prompt: VERSI_PROMPT.tutor,
    system: promptTutor(maksKalimat),
    pesan: pesanTutor({
      pertanyaan: d.pertanyaan,
      jawaban_anak: d.jawaban,
      kunci: kunci[0]?.teks ?? "",
      miskonsepsi: d.miskonsepsi,
      deskripsi_tp: d.tp_deskripsi,
      kelas: d.kelas,
    }),
    skema: KeluaranTutor,
    max_tokens: 1024,
    periksa: (k) => periksaTutor(k, maksKalimat),
    cadangan: () => cadanganTutor({ soal_id: minta.soal_id, jawaban_anak: d.jawaban, pembahasan: d.pembahasan }),
  });

  const respons: ResponsTutor = {
    penjelasan: hasil.hasil!.penjelasan,
    petunjuk: hasil.hasil!.petunjuk,
    log_ai_id: hasil.log_ai_id,
    pakai_cadangan: hasil.pakai_cadangan,
  };
  return Response.json(respons);
});
