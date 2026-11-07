// Generator soal otomatis untuk SEMUA mapel (keputusan tim, 2026-11-08; menggantikan antrean tinjauan PANDUAN 8.5).
//   - LLM membuat satu soal pilihan ganda per TP, lalu server memeriksa OTOMATIS (lib/ai/validasi.ts periksaSoalAI):
//     4 pilihan, 1 kunci, miskonsepsi tiap pengecoh, kunci soal hitungan dihitung ulang program, kalimat pendek,
//     tanpa kata terlarang/"salah", tidak terlalu mirip soal lama.
//   - Lolos -> langsung 'terbit' (sumber 'ai'). Tidak lolos / LLM tidak tersedia -> dibuang, tidak pernah ke anak.
//   - Setiap putaran: soal LATIHAN (formatif) baru per TP, dipakai sesi belajar sesuai TP-nya.
//   - Soal ASESMEN (diagnostik) hanya dibuat untuk TP yang kekurangan (kurang dari bkt.maks_soal_per_tp), misalnya
//     TP baru hasil import, dan hanya untuk mapel ADAPTIF (punya asesmen; jenis dari file data materi).
//     TP lama sudah lengkap, jadi asesmen penempatan (dan demo Raka) tidak berubah.
// Dipanggil oleh: jadwal mingguan (app/api/cron/soal-mingguan), tombol "Buat soal sekarang" (bank soal),
// dan import TP (halaman Materi) untuk TP yang baru atau berubah.

import dataMateri from "@/data/data_materi_per_kelas_SD.json";
import { daftarKredensial, panggilLLM } from "@/lib/ai/client";
import { pesanGeneratorSoal, promptGeneratorSoal, VERSI_PROMPT } from "@/lib/ai/prompts";
import { KeluaranSoalLLM } from "@/lib/ai/schemas";
import { periksaSoalAI } from "@/lib/ai/validasi";
import { denganTransaksi, query } from "@/lib/db";
import { pertanyaanTp, simpanSoalAI } from "@/lib/db/soal";
import { catatAktivitas } from "@/lib/log";
import { ambilPengaturanAktif } from "@/lib/pengaturan";

const JUMLAH_CONTOH = 3; // contoh soal yang dikirim ke LLM (cukup untuk memberi gaya, tetap hemat token)
const PARALEL = 4; // panggilan LLM bersamaan (tidak membebani API, tetap cepat untuk puluhan TP)

export type AlasanGenerator = "jadwal" | "manual" | "tp_baru";

export type HasilSatuTp = { tp_kode: string; terbit: string[]; gagal: string[] };
export type RingkasanGenerator = { alasan: AlasanGenerator; jumlah_tp: number; terbit: number; gagal: number; dilewati: string | null };

type TpGenerator = { kode: string; deskripsi: string; kelas: number; mapel: string; mapel_id: number };

// Mapel pustaka (IPAS, Pendidikan Pancasila) tidak punya asesmen penempatan, jadi tidak butuh soal diagnostik.
const adaptif = (mapelId: number) => dataMateri.mapel.find((m) => m.id === mapelId)?.jenis !== "pustaka";

type Penggunaan = "formatif" | "diagnostik";

async function buatSatuSoal(tp: TpGenerator, penggunaan: Penggunaan, nilai: Record<string, unknown>): Promise<{ soal_id: string | null; galat: string | null }> {
  const contoh = await query<{ id: string; pertanyaan: string; bacaan: string | null }[]>(
    "SELECT id, pertanyaan, bacaan FROM soal WHERE tp_kode = ? AND status = 'terbit' ORDER BY RAND() LIMIT ?",
    [tp.kode, JUMLAH_CONTOH],
  );
  const pilihanContoh = contoh.length
    ? await query<{ soal_id: string; teks: string }[]>("SELECT soal_id, teks FROM pilihan WHERE soal_id IN (?) ORDER BY id", [contoh.map((s) => s.id)])
    : [];
  // Variasi kesulitan: berputar 1-2-3 sesuai banyaknya soal AI yang sudah ada untuk TP ini.
  const sudah = (await query<{ n: number }[]>("SELECT COUNT(*) AS n FROM soal WHERE tp_kode = ? AND sumber = 'ai'", [tp.kode]))[0]?.n ?? 0;
  const kesulitan = (Number(sudah) % 3) + 1;

  const hasil = await panggilLLM({
    fitur: "generator_soal",
    ringkasan_input: `TP ${tp.kode} (${tp.mapel}), ${penggunaan}, kesulitan ${kesulitan}`,
    versi_prompt: VERSI_PROMPT.generator_soal,
    system: promptGeneratorSoal(),
    pesan: pesanGeneratorSoal({
      mapel: tp.mapel,
      deskripsi_tp: tp.deskripsi,
      kelas: tp.kelas,
      penggunaan,
      tingkat_kesulitan: kesulitan,
      contoh: contoh.map((s) => ({ pertanyaan: s.pertanyaan, bacaan: s.bacaan, pilihan: pilihanContoh.filter((p) => p.soal_id === s.id).map((p) => p.teks) })),
    }),
    skema: KeluaranSoalLLM,
    max_tokens: 2048,
    cadangan: () => null, // soal otomatis tidak pernah memakai soal cadangan
  });
  if (!hasil.hasil || hasil.pakai_cadangan) return { soal_id: null, galat: "LLM tidak tersedia" };

  const cek = periksaSoalAI(hasil.hasil, {
    soal_ada: await pertanyaanTp(tp.kode),
    maks_kata_per_kalimat: Number(nilai["generator_soal.maks_kata_per_kalimat"]),
    ambang_kemiripan: Number(nilai["generator_soal.ambang_kemiripan"]),
  });
  if (cek.galat.length > 0) return { soal_id: null, galat: cek.galat.join("; ") };

  const soalId = `${tp.kode}-AI${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  await denganTransaksi((kueri) =>
    simpanSoalAI(kueri, { soal_id: soalId, tp_kode: tp.kode, penggunaan: penggunaan, tingkat_kesulitan: kesulitan, soal: hasil.hasil!, dibuat_oleh: null }),
  );
  return { soal_id: soalId, galat: null };
}

/**
 * Buat soal baru untuk daftar TP (default: semua TP). Jumlah per TP dari generator_soal.soal_per_tp.
 * Dicatat sebagai satu baris LOG_AKTIVITAS "buat_soal_otomatis" (dipakai juga untuk jadwal mingguan).
 */
export async function jalankanGenerator(opsi: { alasan: AlasanGenerator; tp_kode?: string[]; user_id: number | null }): Promise<RingkasanGenerator> {
  const nilai = await ambilPengaturanAktif();
  const semuaTp = await query<TpGenerator[]>(
    `SELECT t.kode, t.deskripsi, t.kelas, m.nama AS mapel, t.mapel_id FROM tujuan_pembelajaran t JOIN mapel m ON m.id = t.mapel_id
     ORDER BY t.mapel_id, t.urutan`,
  );
  const target = opsi.tp_kode ? semuaTp.filter((t) => opsi.tp_kode!.includes(t.kode)) : semuaTp;

  // Sakelar demo menyala = LLM sengaja tidak dipanggil (sinyal panggung buruk).
  if (nilai["demo.pakai_cadangan"] === true) {
    return { alasan: opsi.alasan, jumlah_tp: target.length, terbit: 0, gagal: 0, dilewati: "Sakelar demo \"pakai jawaban cadangan\" menyala, jadi LLM tidak dipanggil." };
  }

  // Periksa apakah API key LLM sudah disetel di .env
  if (daftarKredensial().length === 0) {
    return {
      alasan: opsi.alasan,
      jumlah_tp: target.length,
      terbit: 0,
      gagal: 0,
      dilewati: "API key LLM belum diisi di .env (PRIMARY_LLM_API_KEY dan LLM_MODEL).",
    };
  }

  const perTp = Math.max(1, Number(nilai["generator_soal.soal_per_tp"] ?? 1));
  const diagnostikMinimal = Number(nilai["bkt.maks_soal_per_tp"] ?? 4); // mesin BKT bisa memberi sampai sebanyak ini per TP
  const diagnostikAda = new Map(
    (await query<{ tp_kode: string; n: number }[]>(
      "SELECT tp_kode, COUNT(*) AS n FROM soal WHERE penggunaan = 'diagnostik' AND status = 'terbit' GROUP BY tp_kode",
    )).map((b) => [b.tp_kode, Number(b.n)]),
  );
  const tugas = target.flatMap((tp) => [
    ...Array.from({ length: perTp }, () => ({ tp, penggunaan: "formatif" as const })),
    ...Array.from({ length: adaptif(tp.mapel_id) ? Math.max(0, diagnostikMinimal - (diagnostikAda.get(tp.kode) ?? 0)) : 0 }, () => ({
      tp,
      penggunaan: "diagnostik" as const,
    })),
  ]);
  const hasil: { tp: string; soal_id: string | null }[] = [];
  for (let i = 0; i < tugas.length; i += PARALEL) {
    const kelompok = tugas.slice(i, i + PARALEL);
    const jadi = await Promise.all(
      kelompok.map((t) => buatSatuSoal(t.tp, t.penggunaan, nilai).catch(() => ({ soal_id: null, galat: "galat tak terduga" }))),
    );
    jadi.forEach((j, k) => hasil.push({ tp: kelompok[k].tp.kode, soal_id: j.soal_id }));
  }

  const ringkasan: RingkasanGenerator = {
    alasan: opsi.alasan,
    jumlah_tp: target.length,
    terbit: hasil.filter((h) => h.soal_id).length,
    gagal: hasil.filter((h) => !h.soal_id).length,
    dilewati: null,
  };
  await catatAktivitas({
    user_id: opsi.user_id,
    jenis_tindakan: "buat_soal_otomatis",
    entitas: "soal",
    detail: { alasan: ringkasan.alasan, jumlah_tp: ringkasan.jumlah_tp, terbit: ringkasan.terbit, gagal: ringkasan.gagal },
  });
  return ringkasan;
}

/** Waktu terakhir generator otomatis dijalankan (dari LOG_AKTIVITAS), dan jadwal berikutnya. */
export async function statusGenerator(): Promise<{ terakhir: string | null; berikutnya: string | null; interval_hari: number }> {
  const nilai = await ambilPengaturanAktif();
  const interval = Math.max(1, Number(nilai["generator_soal.interval_hari"] ?? 7));
  const baris = await query<{ created_at: Date }[]>(
    "SELECT created_at FROM log_aktivitas WHERE jenis_tindakan = 'buat_soal_otomatis' ORDER BY id DESC LIMIT 1",
  );
  const terakhir = baris[0]?.created_at ?? null;
  return {
    terakhir: terakhir ? terakhir.toISOString() : null,
    berikutnya: terakhir ? new Date(terakhir.getTime() + interval * 24 * 60 * 60 * 1000).toISOString() : null,
    interval_hari: interval,
  };
}

/** Jadwal mingguan: jalankan hanya jika sudah lewat generator_soal.interval_hari sejak terakhir (atau belum pernah). */
export async function jalankanJikaJatuhTempo(): Promise<RingkasanGenerator | null> {
  const s = await statusGenerator();
  if (s.berikutnya && new Date(s.berikutnya).getTime() > Date.now()) return null;
  return jalankanGenerator({ alasan: "jadwal", user_id: null });
}
