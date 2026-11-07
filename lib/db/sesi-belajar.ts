// Akses database untuk sesi belajar (dipakai app/api/sesi/route.ts). Semua query berparameter.

import { GalatApi } from "@/lib/api/respons";
import { benarLagiUntukTercapai } from "@/lib/bkt/engine";
import { query, type JalankanKueri } from "@/lib/db";
import type { ParameterSesiLengkap } from "@/lib/pengaturan";
import type { Level } from "@/lib/sesi/aturan";
import type { Konten } from "@/lib/kontrak/sesi";
import type { SoalTampil } from "@/lib/kontrak/umum";

// ---------- Sesi ----------

export type SesiBelajar = { id: number; level: Level; mulai: Date; selesai: Date | null };

export async function tutupSesiBelajarTerbuka(kueri: JalankanKueri, anakId: number): Promise<void> {
  await kueri("UPDATE sesi SET selesai = CURRENT_TIMESTAMP WHERE anak_id = ? AND jenis = 'belajar' AND selesai IS NULL", [anakId]);
}

export async function buatSesiBelajar(kueri: JalankanKueri, anakId: number, checkinId: number, level: Level): Promise<number> {
  const hasil = await kueri<{ insertId: number }>(
    "INSERT INTO sesi (anak_id, checkin_id, jenis, level) VALUES (?, ?, 'belajar', ?)",
    [anakId, checkinId, level],
  );
  return hasil.insertId;
}

// Sesi belajar milik anak ini yang masih terbuka; galat jika bukan.
export async function wajibSesiBelajarTerbuka(anakId: number, sesiId: number): Promise<SesiBelajar> {
  const baris = await query<SesiBelajar[]>(
    "SELECT id, level, mulai, selesai FROM sesi WHERE id = ? AND anak_id = ? AND jenis = 'belajar' AND selesai IS NULL",
    [sesiId, anakId],
  );
  if (!baris[0]) throw new GalatApi("BENTROK", "Sesi ini sudah selesai. Yuk, mulai sesi baru.");
  return baris[0];
}

export async function tutupSesi(kueri: JalankanKueri, sesiId: number): Promise<void> {
  await kueri("UPDATE sesi SET selesai = CURRENT_TIMESTAMP WHERE id = ? AND selesai IS NULL", [sesiId]);
}

// ---------- Jawaban ----------

export async function ambilJawabanSesi(sesiId: number): Promise<{ soal_id: string; benar: boolean }[]> {
  const baris = await query<{ soal_id: string; benar: number }[]>(
    "SELECT p.soal_id, p.benar FROM jawaban j JOIN pilihan p ON p.id = j.pilihan_id WHERE j.sesi_id = ? ORDER BY j.id",
    [sesiId],
  );
  return baris.map((b) => ({ soal_id: b.soal_id, benar: b.benar === 1 }));
}

// Jumlah soal kuis formatif yang sudah dijawab untuk TP ini di semua sesi belajar (syarat "minimal 3 soal").
export async function hitungJawabanBelajarTp(anakId: number, tpKode: string): Promise<number> {
  const baris = await query<{ jumlah: number }[]>(
    `SELECT COUNT(*) AS jumlah FROM jawaban j
     JOIN sesi se ON se.id = j.sesi_id JOIN pilihan p ON p.id = j.pilihan_id JOIN soal s ON s.id = p.soal_id
     WHERE se.anak_id = ? AND se.jenis = 'belajar' AND s.tp_kode = ?`,
    [anakId, tpKode],
  );
  return Number(baris[0].jumlah);
}

// Sisa jawaban benar berturut-turut sampai TP ini tercapai, dengan aturan sesi yang sama (benarLagiUntukTercapai
// -> jawabFormatif). Untuk pesan "tinggal N jawaban benar lagi" di sesi dan Beranda; bukan angka peluang (PANDUAN 7.2).
// Memakai ceroboh biasa: perkiraan untuk sesi berikutnya, yang dimulai tanpa status "Agak capek".
export async function hitungSisaBenar(
  anakId: number,
  tpKode: string,
  p: number | null | undefined,
  atur: Pick<ParameterSesiLengkap, "peluang_awal" | "tebakan" | "ceroboh" | "belajar_saat_sesi" | "ambang_tercapai_sesi" | "min_soal_tercapai">,
): Promise<number> {
  return benarLagiUntukTercapai(p ?? atur.peluang_awal, await hitungJawabanBelajarTp(anakId, tpKode), {
    tebakan: atur.tebakan,
    ceroboh: atur.ceroboh,
    belajar_saat_sesi: atur.belajar_saat_sesi,
    ambang_tercapai_sesi: atur.ambang_tercapai_sesi,
    min_soal_tercapai: atur.min_soal_tercapai,
  });
}

// TP yang pernah dilatih sebagai materi baru (untuk peta Beranda: pos yang pernah dilatih tetap tampil).
// Hanya sesi level normal/penuh, karena materi baru hanya muncul di level itu (PANDUAN 7.1); sesi ringan
// mengulang TP yang sudah tercapai dan tidak dihitung.
export async function ambilTpPernahDilatih(anakId: number): Promise<Set<string>> {
  const baris = await query<{ tp_kode: string }[]>(
    `SELECT DISTINCT s.tp_kode FROM jawaban j
     JOIN sesi se ON se.id = j.sesi_id JOIN pilihan p ON p.id = j.pilihan_id JOIN soal s ON s.id = p.soal_id
     WHERE se.anak_id = ? AND se.jenis = 'belajar' AND se.level IN ('normal', 'penuh')`,
    [anakId],
  );
  return new Set(baris.map((b) => b.tp_kode));
}

// ---------- Konten ----------

type BarisKonten = Omit<Konten, "konten_id" | "butuh_layar"> & { id: number; butuh_layar: number };

function keKonten(b: BarisKonten): Konten {
  return {
    konten_id: b.id,
    tp_kode: b.tp_kode,
    jenis: b.jenis,
    format: b.format,
    durasi_menit: b.durasi_menit,
    butuh_layar: b.butuh_layar === 1,
    url: b.url,
  };
}

// Konten satu TP dengan jenis tertentu. Jika mode audio, konten yang tidak butuh layar didahulukan.
export async function ambilKonten(tpKode: string | null, jenis: Konten["jenis"][], utamakanAudio: boolean): Promise<Konten[]> {
  const baris = await query<BarisKonten[]>(
    `SELECT id, tp_kode, jenis, format, durasi_menit, butuh_layar, url FROM konten
     WHERE jenis IN (?) AND (? IS NULL OR tp_kode = ?)
     ORDER BY ${utamakanAudio ? "butuh_layar ASC," : ""} id`,
    [jenis, tpKode, tpKode],
  );
  return baris.map(keKonten);
}

// ---------- Soal ----------

function acak<T>(daftar: T[]): T[] {
  const hasil = [...daftar];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

// Soal berikutnya untuk sesi belajar. Hanya soal 'terbit' (PANDUAN 8.5). Urutan pilihan:
//   1. soal yang BELUM PERNAH keluar di sesi ini mutlak didahulukan (mencegah pengulangan soal yang sama),
//   2. soal yang paling sedikit pernah dijawab anak (variasi bermacam-macam),
//   3. jenis penggunaan sesuai urutan `penggunaan` (formatif dulu, lalu diagnostik),
//   4. tingkat kesulitan dan variasi acak (RAND).
export async function pilihSoalSesi(m: {
  anak_id: number;
  tp_kode: string;
  penggunaan: ("formatif" | "diagnostik" | "santai")[];
  dipakai_di_sesi: string[];
}): Promise<SoalTampil> {
  const soal = await query<{ id: string; tp_kode: string; pertanyaan: string; bacaan: string | null; visual: string | null }[]>(
    `SELECT s.id, s.tp_kode, s.pertanyaan, s.bacaan, s.visual,
            (SELECT COUNT(*) FROM jawaban j JOIN pilihan p ON p.id = j.pilihan_id JOIN sesi se ON se.id = j.sesi_id
             WHERE p.soal_id = s.id AND se.anak_id = ?) AS pernah
     FROM soal s
     WHERE s.tp_kode = ? AND s.status = 'terbit' AND s.penggunaan IN (?)
     ORDER BY (s.id IN (?)) ASC, pernah ASC, FIELD(s.penggunaan, ?), s.tingkat_kesulitan, RAND()
     LIMIT 1`,
    [m.anak_id, m.tp_kode, m.penggunaan, m.dipakai_di_sesi.length > 0 ? m.dipakai_di_sesi : [""], m.penggunaan],
  );
  if (!soal[0]) throw new GalatApi("TIDAK_DITEMUKAN", "Soal untuk materi ini belum tersedia.");

  const pilihan = await query<{ id: number; teks: string }[]>("SELECT id, teks FROM pilihan WHERE soal_id = ? ORDER BY id", [soal[0].id]);
  return {
    soal_id: soal[0].id,
    tp_kode: soal[0].tp_kode,
    pertanyaan: soal[0].pertanyaan,
    bacaan: soal[0].bacaan,
    visual: soal[0].visual,
    pilihan: acak(pilihan.map((p) => ({ pilihan_id: p.id, teks: p.teks }))),
  };
}

export async function ambilPembahasan(soalId: string): Promise<string | null> {
  const baris = await query<{ pembahasan: string | null }[]>("SELECT pembahasan FROM soal WHERE id = ?", [soalId]);
  return baris[0]?.pembahasan ?? null;
}
