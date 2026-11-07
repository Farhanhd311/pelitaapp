// Akses database bersama: profil anak, check-in, dan progres TP. Semua query berparameter.

import { GalatApi } from "@/lib/api/respons";
import { query, type JalankanKueri } from "@/lib/db";
import type { CuacaHati, Energi, RingkasCheckin } from "@/lib/sesi/aturan";

// "Hari ini" mengikuti waktu anak (WIB), bukan UTC: check-in jam 06.00 WIB tetap tercatat di tanggal yang benar.
// Ini zona waktu tampilan, bukan aturan bisnis. Waktu lain (mulai/selesai sesi, log) tetap disimpan UTC.
const ZONA_WAKTU_ANAK = "Asia/Jakarta";

export function tanggalLokal(waktu: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_WAKTU_ANAK }).format(waktu); // YYYY-MM-DD
}

// Pukul 00.00 waktu anak (WIB, UTC+7, tanpa musim panas) pada tanggal itu, sebagai Date UTC untuk dibandingkan
// dengan kolom DATETIME (disimpan UTC).
export function awalHariLokal(tanggal: string): Date {
  return new Date(`${tanggal}T00:00:00+07:00`);
}

export function geserTanggal(tanggal: string, hari: number): string {
  const d = new Date(`${tanggal}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + hari);
  return d.toISOString().slice(0, 10);
}

// ---------- Profil anak ----------

export type ProfilAnakLengkap = {
  id: number;
  nama_panggilan: string;
  tgl_lahir: string;
  kelas_terakhir: number;
  kelas_seharusnya: number;
  fase_pengobatan: "intensif" | "pemeliharaan" | "pemulihan";
  mode_jeda: boolean;
  batas_layar_menit: number | null;
};

export async function ambilAnak(anakId: number): Promise<ProfilAnakLengkap> {
  const baris = await query<(Omit<ProfilAnakLengkap, "mode_jeda" | "tgl_lahir"> & { mode_jeda: number; tgl_lahir: Date })[]>(
    `SELECT id, nama_panggilan, tgl_lahir, kelas_terakhir, kelas_seharusnya, fase_pengobatan, mode_jeda, batas_layar_menit
     FROM anak WHERE id = ?`,
    [anakId],
  );
  const a = baris[0];
  if (!a) throw new GalatApi("TIDAK_DITEMUKAN", "Profil anak tidak ditemukan.");
  return { ...a, mode_jeda: a.mode_jeda === 1, tgl_lahir: tanggalLokal(a.tgl_lahir) };
}

// ---------- Check-in ----------

// CHECKIN.keluhan disimpan sebagai teks dipisah koma (lihat lib/kontrak/checkin.ts).
export function bacaKeluhan(teks: string | null): string[] {
  return teks ? teks.split(",").filter(Boolean) : [];
}

export type BarisCheckin = RingkasCheckin & { id: number };

type BarisCheckinDb = { id: number; tanggal: Date; energi: Energi; cuaca_hati: CuacaHati; keluhan: string | null };

function keBarisCheckin(b: BarisCheckinDb): BarisCheckin {
  return {
    id: b.id,
    tanggal: b.tanggal.toISOString().slice(0, 10), // kolom DATE dibaca sebagai tengah malam UTC
    energi: b.energi,
    cuaca_hati: b.cuaca_hati,
    keluhan: bacaKeluhan(b.keluhan),
  };
}

// Check-in anak, paling baru dulu. `sejak` = tanggal (YYYY-MM-DD) paling awal yang diambil.
export async function ambilRiwayatCheckin(anakId: number, sejak?: string): Promise<BarisCheckin[]> {
  const baris = await query<BarisCheckinDb[]>(
    `SELECT id, tanggal, energi, cuaca_hati, keluhan FROM checkin
     WHERE anak_id = ? AND (? IS NULL OR tanggal >= ?)
     ORDER BY tanggal DESC, id DESC`,
    [anakId, sejak ?? null, sejak ?? null],
  );
  return baris.map(keBarisCheckin);
}

export async function ambilCheckinHariIni(anakId: number): Promise<BarisCheckin | null> {
  const baris = await query<BarisCheckinDb[]>(
    "SELECT id, tanggal, energi, cuaca_hati, keluhan FROM checkin WHERE anak_id = ? AND tanggal = ? ORDER BY id DESC LIMIT 1",
    [anakId, tanggalLokal()],
  );
  return baris[0] ? keBarisCheckin(baris[0]) : null;
}

// Tambahkan keluhan ke check-in hari ini (misalnya anak memilih "pusing" di tengah sesi, PRD F-KUAT-2),
// supaya muncul di dashboard pendamping dan ikut dihitung pola "perlu perhatian".
export async function tambahKeluhanHariIni(kueri: JalankanKueri, anakId: number, keluhan: string): Promise<void> {
  const hariIni = await ambilCheckinHariIni(anakId);
  if (!hariIni || hariIni.keluhan.includes(keluhan)) return;
  await kueri("UPDATE checkin SET keluhan = ? WHERE id = ?", [[...hariIni.keluhan, keluhan].join(","), hariIni.id]);
}

// ---------- Progres TP ----------

export type ProgresTp = { status: "belum_diketahui" | "belum" | "jembatan" | "tercapai"; sumber_status: "diuji" | "disimpulkan" | null; p_menguasai: number | null };

export async function ambilProgres(anakId: number, mapelId: number): Promise<Map<string, ProgresTp>> {
  const baris = await query<(ProgresTp & { tp_kode: string })[]>(
    `SELECT p.tp_kode, p.status, p.sumber_status, p.p_menguasai
     FROM progres_tp p JOIN tujuan_pembelajaran t ON t.kode = p.tp_kode
     WHERE p.anak_id = ? AND t.mapel_id = ?`,
    [anakId, mapelId],
  );
  return new Map(baris.map((b) => [b.tp_kode, { status: b.status, sumber_status: b.sumber_status, p_menguasai: b.p_menguasai }]));
}

export async function simpanProgresTp(kueri: JalankanKueri, anakId: number, tpKode: string, p: ProgresTp): Promise<void> {
  await kueri(
    `INSERT INTO progres_tp (anak_id, tp_kode, status, sumber_status, p_menguasai) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), sumber_status = VALUES(sumber_status), p_menguasai = VALUES(p_menguasai)`,
    [anakId, tpKode, p.status, p.sumber_status, p.p_menguasai],
  );
}

// Daftar TP satu mapel lengkap dengan deskripsi (untuk peta, dashboard, dan laporan).
export type TpLengkap = { kode: string; mapel_id: number; kelas: number; urutan: number; deskripsi: string; esensial_transisi: boolean };

export async function ambilTpMapel(mapelId: number): Promise<TpLengkap[]> {
  const baris = await query<(Omit<TpLengkap, "esensial_transisi"> & { esensial_transisi: number })[]>(
    "SELECT kode, mapel_id, kelas, urutan, deskripsi, esensial_transisi FROM tujuan_pembelajaran WHERE mapel_id = ? ORDER BY urutan",
    [mapelId],
  );
  return baris.map((b) => ({ ...b, esensial_transisi: b.esensial_transisi === 1 }));
}

export async function ambilDaftarMapel(): Promise<{ mapel_id: number; nama: string }[]> {
  return query<{ mapel_id: number; nama: string }[]>(
    "SELECT m.id AS mapel_id, m.nama FROM mapel m WHERE EXISTS (SELECT 1 FROM tujuan_pembelajaran t WHERE t.mapel_id = m.id) ORDER BY m.id",
  );
}
