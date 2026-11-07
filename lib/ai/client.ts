// Pembungkus LLM satu pintu: panggilLLM() (PANDUAN 8, ARSITEKTUR 4.3). SEMUA fitur AI lewat sini.
//   1. Hanya di server. API key dari environment variable, tidak pernah ke browser.
//   2. Batas waktu dari PENGATURAN_SISTEM llm.batas_waktu_detik (atau batas_detik dari pemanggil, juga dari
//      PENGATURAN_SISTEM, untuk tugas panjang seperti membaca PDF); sakelar demo.pakai_cadangan dihormati.
//   3. Keluaran JSON lewat structured outputs Claude + skema Zod, lalu diperiksa program (`periksa`).
//   4. Gagal / timeout / ditolak / tidak valid -> jawaban cadangan.
//   5. Setiap panggilan dicatat di LOG_AI (termasuk yang memakai cadangan).
// LLM tidak pernah mengambil keputusan sistem: hasilnya hanya teks untuk ditampilkan atau draf untuk ditinjau.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { catatLogAI } from "@/lib/log";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

type Fitur = "tutor" | "laporan" | "generator_soal" | "impor_tp";

export type OpsiLLM<S extends z.ZodType> = {
  fitur: Fitur;
  anak_id?: number | null;
  ringkasan_input: string; // ringkas dan tanpa data pribadi; disimpan di LOG_AI
  versi_prompt: string;
  system: string;
  pesan: string;
  pdf_base64?: string; // lampiran PDF (dibaca langsung oleh model), dikirim sebelum teks pesan
  batas_detik?: number; // menggantikan llm.batas_waktu_detik; pemanggil membacanya dari PENGATURAN_SISTEM
  skema: S;
  max_tokens: number;
  periksa?: (hasil: z.infer<S>) => string | null; // null = lolos
  cadangan: () => z.infer<S> | null; // null = fitur ini tidak punya cadangan
};

export type HasilLLM<T> = {
  hasil: T | null; // null hanya jika LLM gagal DAN tidak ada cadangan
  pakai_cadangan: boolean;
  alasan_cadangan: string | null;
  log_ai_id: number;
};

type Kredensial = { apiKey: string; model: string };

// API key utama dan cadangan (ARSITEKTUR 6.2). Key cadangan dicoba jika key utama kena batas kuota / gangguan.
function daftarKredensial(): Kredensial[] {
  const utama = { apiKey: process.env.PRIMARY_LLM_API_KEY ?? "", model: process.env.LLM_MODEL ?? "" };
  const cadangan = {
    apiKey: process.env.BACKUP_LLM_API_KEY ?? "",
    model: process.env.BACKUP_LLM_MODEL || process.env.LLM_MODEL || "",
  };
  return [utama, cadangan].filter((k) => k.apiKey && k.model);
}

// Galat yang layak dicoba lagi dengan key cadangan: batas kuota, server sibuk/bermasalah, key ditolak.
function layakCobaKeyLain(galat: unknown): boolean {
  return (
    galat instanceof Anthropic.RateLimitError ||
    galat instanceof Anthropic.InternalServerError ||
    galat instanceof Anthropic.AuthenticationError ||
    galat instanceof Anthropic.PermissionDeniedError
  );
}

export async function panggilLLM<S extends z.ZodType>(opsi: OpsiLLM<S>): Promise<HasilLLM<z.infer<S>>> {
  const mulai = Date.now();
  const atur = await ambilPengaturanAktif();
  const batasMs = (opsi.batas_detik ?? Number(atur["llm.batas_waktu_detik"])) * 1000;
  const isi: Anthropic.ContentBlockParam[] | string = opsi.pdf_base64
    ? [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: opsi.pdf_base64 } },
        { type: "text", text: opsi.pesan },
      ]
    : opsi.pesan;

  let hasil: z.infer<S> | null = null;
  let alasan: string | null = null;

  const kredensial = daftarKredensial();
  if (atur["demo.pakai_cadangan"] === true) alasan = "sakelar demo.pakai_cadangan menyala";
  else if (kredensial.length === 0) alasan = "API key LLM belum diisi";

  for (const k of alasan === null ? kredensial : []) {
    const sisaMs = batasMs - (Date.now() - mulai);
    if (sisaMs <= 0) {
      alasan = "melewati batas waktu";
      break;
    }
    try {
      // maxRetries 0: percobaan ulang otomatis SDK bisa melewati batas waktu llm.batas_waktu_detik.
      const klien = new Anthropic({ apiKey: k.apiKey, timeout: sisaMs, maxRetries: 0 });
      const respons = await klien.messages.parse({
        model: k.model,
        max_tokens: opsi.max_tokens,
        system: opsi.system,
        messages: [{ role: "user", content: isi }],
        output_config: { effort: "low", format: zodOutputFormat(opsi.skema) },
      });

      if (respons.stop_reason === "refusal") alasan = "permintaan ditolak model";
      else if (respons.parsed_output == null) alasan = "keluaran tidak sesuai skema";
      else alasan = opsi.periksa?.(respons.parsed_output) ?? null;

      if (alasan === null) hasil = respons.parsed_output;
      break; // ada jawaban dari model (valid atau tidak): tidak perlu key lain
    } catch (galat) {
      alasan =
        galat instanceof Anthropic.APIConnectionTimeoutError
          ? "melewati batas waktu"
          : galat instanceof Anthropic.APIError
            ? `galat API ${galat.status ?? ""}`.trim()
            : "galat jaringan";
      console.error(`LLM ${opsi.fitur} gagal (${alasan}):`, galat instanceof Error ? galat.message : galat);
      if (!layakCobaKeyLain(galat)) break;
    }
  }

  const valid = hasil !== null;
  if (!valid) hasil = opsi.cadangan();

  const log_ai_id = await catatLogAI({
    fitur: opsi.fitur,
    anak_id: opsi.anak_id ?? null,
    ringkasan_input: opsi.ringkasan_input,
    output: valid ? hasil : { cadangan: hasil, alasan },
    valid,
    pakai_fallback: !valid,
    waktu_respons_ms: Date.now() - mulai,
    versi_prompt: opsi.versi_prompt,
  });

  return { hasil, pakai_cadangan: !valid, alasan_cadangan: valid ? null : alasan, log_ai_id };
}
