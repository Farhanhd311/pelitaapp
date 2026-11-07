// Kontrak API Teman Cerita (PANDUAN 8.2, PRD 9.10). Mode anak.
//   GET  /api/teman-cerita -> sapaan, aturan kerahasiaan, dan pilihan chip
//   POST /api/teman-cerita -> hasil skrining (chip + teks opsional)
// Transkrip TIDAK disimpan: teks bebas hanya dicek kata kunci krisis lalu dibuang. Yang disimpan hanya SKRINING.
// Level rujukan memakai tabel aturan (PENGATURAN_SISTEM), bukan LLM.

import { z } from "zod";

export const Perasaan = z.enum(["cerah", "berawan", "hujan", "badai"]); // cuaca hati
export const SumberPerasaan = z.enum(["badan", "teman", "keluarga", "sekolah", "bosan", "lainnya"]);
// "tidak_aman" = anak merasa dalam bahaya -> diperlakukan sebagai sinyal krisis (tanpa perlu kata kunci).
export const Kebutuhan = z.enum(["teman", "cerita", "tidak_ada", "tidak_aman"]);

export const PermintaanTemanCerita = z.object({
  perasaan: Perasaan,
  sumber: SumberPerasaan,
  kebutuhan: Kebutuhan,
  teks: z.string().max(1000).optional(), // opsional; TIDAK disimpan
});
export type PermintaanTemanCerita = z.infer<typeof PermintaanTemanCerita>;

export type PilihanChip = { kode: string; label: string; emoji: string };

export type ResponsSapaanTemanCerita = {
  sapaan: string;
  aturan_kerahasiaan: string; // kalimat jujur PRD F-TC-1
  pilihan: { perasaan: PilihanChip[]; sumber: PilihanChip[]; kebutuhan: PilihanChip[] };
  teks_bebas_aktif: boolean; // false jika daftar kata kunci krisis belum diisi (teks bebas dimatikan demi aman)
  menyapa_proaktif: boolean; // cuaca hati turun beberapa hari berturut-turut
};

export type ResponsTemanCerita = {
  skrining_id: number;
  balasan: string; // ditampilkan + dibacakan; tenang dan menemani
  rujukan_disiapkan: boolean; // ada rujukan level 1-3 yang menunggu persetujuan orang tua/wali
  darurat: boolean; // sinyal krisis: orang tua dikabari dan kasus masuk antrean eskalasi
};
