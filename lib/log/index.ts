// Pencatatan LOG_AKTIVITAS (PANDUAN 8.7) dan LOG_AI (PANDUAN 8).
// Aturan: log hanya bisa DITAMBAH (tidak ada fungsi ubah/hapus di sini), dan tidak boleh berisi
// data sensitif: password, PIN, atau isi cerita anak. Cukup ID dan jenis tindakan.

import { query } from "@/lib/db";

// Jenis tindakan yang dicatat. Tambah di sini jika ada tindakan baru, supaya nama konsisten
// (dipakai juga untuk filter di halaman admin Log Aktivitas).
export type JenisTindakan =
  | "login"
  | "logout"
  | "gagal_login"
  | "masuk_mode_pendamping"
  | "gagal_pin"
  | "akses_data_anak" // akses guru/admin ke data anak
  | "ubah_profil_anak" // mode jeda, batas layar, fase pengobatan (orang tua/wali)
  | "ubah_pengaturan"
  | "setujui_rujukan"
  | "tolak_rujukan"
  | "tangani_eskalasi"
  | "buat_soal"
  | "sunting_soal"
  | "terbitkan_soal"
  | "tolak_soal"
  | "unduh_laporan"
  | "reset_demo";

export async function catatAktivitas(catatan: {
  user_id: number | null;
  jenis_tindakan: JenisTindakan;
  entitas?: string;
  entitas_id?: string | number;
  detail?: Record<string, unknown>;
}): Promise<void> {
  await query(
    `INSERT INTO log_aktivitas (user_id, jenis_tindakan, entitas, entitas_id, detail_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      catatan.user_id,
      catatan.jenis_tindakan,
      catatan.entitas ?? null,
      catatan.entitas_id === undefined ? null : String(catatan.entitas_id),
      catatan.detail === undefined ? null : JSON.stringify(catatan.detail),
    ],
  );
}

// Dipakai oleh lib/ai/client.ts untuk setiap panggilan LLM. Mengembalikan id log
// (untuk tombol penilaian "membantu / tidak membantu" di UMPAN_BALIK_AI).
export async function catatLogAI(catatan: {
  fitur: "tutor" | "chatbot" | "laporan" | "generator_soal";
  anak_id?: number | null;
  ringkasan_input: string; // untuk chatbot: kategori saja, bukan isi cerita
  output: unknown;
  valid: boolean;
  pakai_fallback: boolean;
  waktu_respons_ms: number;
  versi_prompt: string;
}): Promise<number> {
  const hasil = await query<{ insertId: number }>(
    `INSERT INTO log_ai
       (fitur, anak_id, ringkasan_input, output_json, valid, pakai_fallback, waktu_respons_ms, versi_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      catatan.fitur,
      catatan.anak_id ?? null,
      catatan.ringkasan_input,
      JSON.stringify(catatan.output ?? null),
      catatan.valid ? 1 : 0,
      catatan.pakai_fallback ? 1 : 0,
      Math.round(catatan.waktu_respons_ms),
      catatan.versi_prompt,
    ],
  );
  return hasil.insertId;
}
