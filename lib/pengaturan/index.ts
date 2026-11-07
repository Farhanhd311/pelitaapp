// Membaca PENGATURAN_SISTEM (PANDUAN 8.4). Semua angka ambang, durasi, dan daftar yang mengendalikan
// sistem diambil dari sini, bukan ditulis di kode.
//
// Pengaturan BERVERSI: satu baris per versi. Perubahan hanya berlaku untuk sesi/asesmen BARU, jadi
// asesmen yang sudah berjalan tetap memakai versi saat ia dimulai (lihat pilihNilaiPada).
// Karena itu "Kembalikan ke versi sebelumnya" harus MEMBUAT BARIS VERSI BARU berisi nilai lama,
// bukan sekadar menyalakan lagi baris lama, supaya urutan waktu versi tetap benar.
// Validasi rentang aman dan penyimpanan versi baru (halaman admin Aturan AI) ditambahkan bersama fitur itu.

import { z } from "zod";
import dataMatematika from "@/data/data_awal_matematika_fase_A_B.json";
import seedPengaturan from "@/data/seed_pengaturan_sistem.json";
import { bacaJson, denganTransaksi, query } from "@/lib/db";
import { catatAktivitas } from "@/lib/log";
import type { ParameterAsesmen } from "@/lib/bkt/engine";

export type BarisPengaturan = {
  kunci: string;
  nilai: unknown;
  versi: number;
  diubah_at: Date;
};

export type NilaiPengaturan = Record<string, unknown>;

// ---------- Fungsi murni ----------

// Nilai setiap kunci yang berlaku pada `waktu`: versi terbaru yang dibuat sebelum/pada waktu itu.
// Jika `waktu` lebih awal dari semua versi sebuah kunci, dipakai versi pertamanya.
export function pilihNilaiPada(riwayat: BarisPengaturan[], waktu: Date): NilaiPengaturan {
  const terpilih = new Map<string, BarisPengaturan>();
  const urut = [...riwayat].sort((a, b) => a.versi - b.versi);
  for (const baris of urut) {
    const sekarang = terpilih.get(baris.kunci);
    const berlaku = baris.diubah_at.getTime() <= waktu.getTime();
    if (!sekarang || berlaku) terpilih.set(baris.kunci, baris);
  }
  return Object.fromEntries([...terpilih].map(([kunci, b]) => [kunci, b.nilai]));
}

const Peluang = z.number().min(0).max(1);
const Jumlah = z.number().int().positive();

// Kunci PENGATURAN_SISTEM -> parameter mesin BKT asesmen. Galat jika ada yang hilang atau salah tipe,
// supaya asesmen tidak pernah berjalan dengan parameter yang tidak lengkap.
const SkemaParameterAsesmen = z.object({
  "bkt.peluang_awal": Peluang,
  "bkt.tebakan": Peluang,
  "bkt.ceroboh": Peluang,
  "bkt.belajar_saat_asesmen": Peluang,
  "bkt.ambang_tercapai": Peluang,
  "bkt.ambang_belum": Peluang,
  "bkt.min_soal_per_tp": Jumlah,
  "bkt.min_soal_tercapai": Jumlah,
  "bkt.maks_soal_per_tp": Jumlah,
  "asesmen.berhenti_dini": z.boolean(),
  "asesmen.maks_soal_per_sesi": Jumlah,
  "asesmen.maks_soal_per_mapel": z.record(z.string(), Jumlah), // { "<mapel_id>": batas soal satu asesmen }
});

// `mapelId`: batas soal asesmen berbeda per mapel (asesmen.maks_soal_per_mapel).
export function keParameterAsesmen(nilai: NilaiPengaturan, mapelId: number): ParameterAsesmen & { maks_soal_per_sesi: number } {
  const hasil = SkemaParameterAsesmen.safeParse(nilai);
  if (!hasil.success) {
    const kunci = hasil.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`PENGATURAN_SISTEM tidak lengkap atau tidak valid: ${kunci}`);
  }
  const n = hasil.data;
  const maksSoalAsesmen = n["asesmen.maks_soal_per_mapel"][String(mapelId)];
  if (maksSoalAsesmen === undefined) {
    throw new Error(`PENGATURAN_SISTEM asesmen.maks_soal_per_mapel belum punya batas untuk mapel ${mapelId}`);
  }
  return {
    peluang_awal: n["bkt.peluang_awal"],
    tebakan: n["bkt.tebakan"],
    ceroboh: n["bkt.ceroboh"],
    belajar_saat_asesmen: n["bkt.belajar_saat_asesmen"],
    ambang_tercapai: n["bkt.ambang_tercapai"],
    ambang_belum: n["bkt.ambang_belum"],
    min_soal_per_tp: n["bkt.min_soal_per_tp"],
    min_soal_tercapai: n["bkt.min_soal_tercapai"],
    maks_soal_per_tp: n["bkt.maks_soal_per_tp"],
    berhenti_dini: n["asesmen.berhenti_dini"],
    maks_soal_per_sesi: n["asesmen.maks_soal_per_sesi"],
    maks_soal_asesmen: maksSoalAsesmen,
  };
}

// Kunci PENGATURAN_SISTEM -> parameter sesi belajar, kuis formatif, dan pemicu (lib/sesi, PANDUAN 7.1).
const SkemaParameterSesi = z.object({
  "bkt.peluang_awal": Peluang,
  "bkt.tebakan": Peluang,
  "bkt.ceroboh": Peluang,
  "bkt.ceroboh_lelah": Peluang,
  "bkt.belajar_saat_sesi": Peluang,
  "bkt.ambang_tercapai_sesi": Peluang,
  "bkt.min_soal_tercapai": Jumlah,
  "sesi.durasi_ringan": Jumlah,
  "sesi.durasi_normal": Jumlah,
  "sesi.durasi_penuh": Jumlah,
  "sesi.hari_mood_turun_pemicu_chatbot": Jumlah,
  "sesi.hari_lemas_pemicu_perhatian": Jumlah,
  "sesi.salah_beruntun_pemicu_cek": Jumlah,
  "kuis.gagal_sebelum_ditinjau_guru": Jumlah,
  "kuis.jumlah_soal_ringan": Jumlah,
  "kuis.jumlah_soal_normal": Jumlah,
  "kuis.jumlah_soal_penuh": Jumlah,
  "sesi.ambang_kartu_belajar": Peluang,
});

export function keParameterSesi(nilai: NilaiPengaturan) {
  const hasil = SkemaParameterSesi.safeParse(nilai);
  if (!hasil.success) {
    const kunci = hasil.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`PENGATURAN_SISTEM tidak lengkap atau tidak valid: ${kunci}. Jalankan Reset demo untuk melengkapi.`);
  }
  const n = hasil.data;
  return {
    peluang_awal: n["bkt.peluang_awal"],
    tebakan: n["bkt.tebakan"],
    ceroboh: n["bkt.ceroboh"],
    ceroboh_lelah: n["bkt.ceroboh_lelah"],
    belajar_saat_sesi: n["bkt.belajar_saat_sesi"],
    ambang_tercapai_sesi: n["bkt.ambang_tercapai_sesi"],
    min_soal_tercapai: n["bkt.min_soal_tercapai"],
    ambang_kartu_belajar: n["sesi.ambang_kartu_belajar"],
    durasi: {
      durasi_ringan: n["sesi.durasi_ringan"],
      durasi_normal: n["sesi.durasi_normal"],
      durasi_penuh: n["sesi.durasi_penuh"],
    },
    hari_mood_turun: n["sesi.hari_mood_turun_pemicu_chatbot"],
    hari_lemas: n["sesi.hari_lemas_pemicu_perhatian"],
    salah_beruntun: n["sesi.salah_beruntun_pemicu_cek"],
    gagal_sebelum_ditinjau: n["kuis.gagal_sebelum_ditinjau_guru"],
    jumlah_soal: {
      jumlah_soal_ringan: n["kuis.jumlah_soal_ringan"],
      jumlah_soal_normal: n["kuis.jumlah_soal_normal"],
      jumlah_soal_penuh: n["kuis.jumlah_soal_penuh"],
    },
  };
}

export type ParameterSesiLengkap = ReturnType<typeof keParameterSesi>;

// ---------- Akses database ----------

// Semua versi semua kunci. Tabelnya kecil (puluhan baris), jadi cukup dibaca sekaligus.
export async function ambilRiwayatPengaturan(): Promise<BarisPengaturan[]> {
  const baris = await query<{ kunci: string; nilai_json: string; versi: number; diubah_at: Date }[]>(
    "SELECT kunci, nilai_json, versi, diubah_at FROM pengaturan_sistem ORDER BY kunci, versi",
  );
  return baris.map((b) => ({ kunci: b.kunci, nilai: bacaJson(b.nilai_json), versi: b.versi, diubah_at: b.diubah_at }));
}

// Nilai yang aktif sekarang (versi dengan aktif = 1).
export async function ambilPengaturanAktif(): Promise<NilaiPengaturan> {
  const baris = await query<{ kunci: string; nilai_json: string }[]>(
    "SELECT kunci, nilai_json FROM pengaturan_sistem WHERE aktif = 1",
  );
  return Object.fromEntries(baris.map((b) => [b.kunci, bacaJson(b.nilai_json)]));
}

// Baris versi aktif sebuah kunci (untuk halaman admin dan riwayat).
export async function ambilPengaturanAktifLengkap(): Promise<
  { kunci: string; nilai: unknown; versi: number; alasan: string | null; diubah_oleh: number | null; diubah_at: Date }[]
> {
  const baris = await query<
    { kunci: string; nilai_json: string; versi: number; alasan: string | null; diubah_oleh: number | null; diubah_at: Date }[]
  >("SELECT kunci, nilai_json, versi, alasan, diubah_oleh, diubah_at FROM pengaturan_sistem WHERE aktif = 1 ORDER BY kunci");
  return baris.map((b) => ({ ...b, nilai: bacaJson(b.nilai_json) }));
}

// Simpan nilai baru sebagai VERSI BARU (versi lama tetap ada untuk riwayat dan asesmen yang sedang berjalan).
// Validasi rentang aman dilakukan pemanggil (lib/pengaturan/rentang.ts) sebelum fungsi ini dipanggil.
export async function simpanVersiBaru(perubahan: {
  kunci: string;
  nilai: unknown;
  alasan: string;
  user_id: number;
}): Promise<{ versi: number; nilai_lama: unknown }> {
  const hasil = await denganTransaksi(async (kueri) => {
    const lama = await kueri<{ versi: number; nilai_json: string; aktif: number }[]>(
      "SELECT versi, nilai_json, aktif FROM pengaturan_sistem WHERE kunci = ? ORDER BY versi DESC FOR UPDATE",
      [perubahan.kunci],
    );
    const versiBaru = (lama[0]?.versi ?? 0) + 1;
    const aktifLama = lama.find((b) => b.aktif === 1);
    await kueri("UPDATE pengaturan_sistem SET aktif = 0 WHERE kunci = ?", [perubahan.kunci]);
    await kueri(
      `INSERT INTO pengaturan_sistem (kunci, nilai_json, versi, aktif, alasan, diubah_oleh)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [perubahan.kunci, JSON.stringify(perubahan.nilai), versiBaru, perubahan.alasan, perubahan.user_id],
    );
    return { versi: versiBaru, nilai_lama: aktifLama ? bacaJson(aktifLama.nilai_json) : null };
  });

  await catatAktivitas({
    user_id: perubahan.user_id,
    jenis_tindakan: "ubah_pengaturan",
    entitas: "pengaturan_sistem",
    entitas_id: perubahan.kunci,
    detail: { versi: hasil.versi, nilai_lama: hasil.nilai_lama, nilai_baru: perubahan.nilai, alasan: perubahan.alasan },
  });
  return hasil;
}

// Nilai versi sebelum versi aktif (untuk tombol "Kembalikan ke versi sebelumnya"), atau null jika tidak ada.
export async function ambilVersiSebelumnya(kunci: string): Promise<{ versi: number; nilai: unknown } | null> {
  const baris = await query<{ versi: number; nilai_json: string }[]>(
    `SELECT versi, nilai_json FROM pengaturan_sistem
     WHERE kunci = ? AND versi < (SELECT versi FROM pengaturan_sistem WHERE kunci = ? AND aktif = 1)
     ORDER BY versi DESC LIMIT 1`,
    [kunci, kunci],
  );
  return baris[0] ? { versi: baris[0].versi, nilai: bacaJson(baris[0].nilai_json) } : null;
}

export async function ambilRiwayatKunci(kunci: string) {
  const baris = await query<
    { versi: number; nilai_json: string; aktif: number; alasan: string | null; diubah_oleh: number | null; nama: string | null; diubah_at: Date }[]
  >(
    `SELECT p.versi, p.nilai_json, p.aktif, p.alasan, p.diubah_oleh, u.nama, p.diubah_at
     FROM pengaturan_sistem p LEFT JOIN users u ON u.id = p.diubah_oleh
     WHERE p.kunci = ? ORDER BY p.versi DESC`,
    [kunci],
  );
  return baris.map((b) => ({
    versi: b.versi,
    nilai: bacaJson(b.nilai_json),
    aktif: b.aktif === 1,
    alasan: b.alasan,
    diubah_oleh: b.nama,
    diubah_at: b.diubah_at,
  }));
}

// Tambahkan kunci yang ada di data awal tetapi belum ada di database (misalnya kunci baru setelah
// database dibuat). Kunci yang sudah ada TIDAK diubah. Dipanggil oleh Reset demo.
export async function lengkapiPengaturanAwal(): Promise<string[]> {
  const { awalan_bawaan, pengecualian } = seedPengaturan.kunci_parameter_bkt as {
    awalan_bawaan: string;
    pengecualian: Record<string, string>;
  };
  const semua: Record<string, unknown> = {};
  for (const [nama, nilai] of Object.entries(dataMatematika.meta.parameter_bkt)) {
    semua[pengecualian[nama] ?? awalan_bawaan + nama] = nilai;
  }
  Object.assign(semua, seedPengaturan.pengaturan);

  const ada = new Set((await query<{ kunci: string }[]>("SELECT DISTINCT kunci FROM pengaturan_sistem")).map((b) => b.kunci));
  const ditambah = Object.keys(semua).filter((k) => !ada.has(k));
  for (const kunci of ditambah) {
    await query(
      `INSERT INTO pengaturan_sistem (kunci, nilai_json, versi, aktif, alasan) VALUES (?, ?, 1, 1, 'Nilai awal dari data awal')`,
      [kunci, JSON.stringify(semua[kunci])],
    );
  }
  return ditambah;
}
