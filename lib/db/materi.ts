// Akses database materi per kelas dan narasi kartu belajar (tabel materi + narasi_materi, migrasi 0001).
// Mode anak: peta petualangan (ambilMateriMapel) dan kartu belajar (ambilNarasi).
// Admin: tinjau TP dan import TP. Isi awal dari file data dimasukkan oleh lengkapiMateriAwal (Reset demo) dan seed.

import dataMateri from "@/data/data_materi_per_kelas_SD.json";
import narasiBahasaIndonesia from "@/data/narasi_materi_bahasa_indonesia.json";
import narasiIpas from "@/data/narasi_materi_ipas.json";
import narasiMatematika from "@/data/narasi_materi_matematika.json";
import narasiPendidikanPancasila from "@/data/narasi_materi_pendidikan_pancasila.json";
import { bacaJson, denganTransaksi, query, type JalankanKueri } from "@/lib/db";
import type { RencanaImporTp, TpAda } from "@/lib/kurikulum/impor-tp";
import { SkemaIsiNarasi, type Narasi, type TpReview } from "@/lib/kontrak/materi";
import type { MateriKelas } from "@/lib/peta/jalur-materi";

// File narasi awal. Menambah mapel = menambah file data di sini (sama dengan FILE_NARASI di scripts/seed.mts).
const DATA_NARASI: { narasi: { tp_kode: string; judul: string; adegan: unknown[] }[] }[] = [
  narasiMatematika,
  narasiBahasaIndonesia,
  narasiIpas,
  narasiPendidikanPancasila,
];

// ---------- Mode anak ----------

/** Materi satu mapel untuk peta petualangan (lib/peta/jalur-materi.ts). */
export async function ambilMateriMapel(mapelId: number): Promise<MateriKelas[]> {
  const baris = await query<{ kode: string; kelas: number; elemen: string; judul: string; tp_terkait: string; esensial_transisi: number | null; urutan: number }[]>(
    "SELECT kode, kelas, elemen, judul, tp_terkait, esensial_transisi, urutan FROM materi WHERE mapel_id = ? ORDER BY urutan",
    [mapelId],
  );
  return baris.map((b) => ({
    ...b,
    tp_terkait: bacaJson<string[]>(b.tp_terkait) ?? [],
    esensial_transisi: b.esensial_transisi === null ? null : b.esensial_transisi === 1,
  }));
}

/**
 * Narasi kartu belajar satu TP, atau null (kartu cadangan berisi deskripsi TP).
 * Isi divalidasi lagi saat dibaca: narasi rusak tidak pernah sampai ke anak.
 */
export async function ambilNarasi(tpKode: string): Promise<Narasi | null> {
  const b = (await query<{ judul: string; adegan_json: string }[]>("SELECT judul, adegan_json FROM narasi_materi WHERE tp_kode = ?", [tpKode]))[0];
  if (!b) return null;
  const hasil = SkemaIsiNarasi.safeParse({ judul: b.judul, adegan: bacaJson(b.adegan_json) });
  return hasil.success ? { tp_kode: tpKode, ...hasil.data } : null;
}

// ---------- Admin: tinjau TP + import ----------

/** Semua TP dengan prasyarat, jumlah soal terbit, kartu belajar, dan materi yang memakainya. */
export async function daftarTpReview(): Promise<TpReview[]> {
  const [tp, prasyarat, soal, narasi, materi] = await Promise.all([
    query<{ kode: string; mapel_id: number; kelas: number; urutan: number; elemen: string; deskripsi: string; esensial_transisi: number }[]>(
      "SELECT kode, mapel_id, kelas, urutan, elemen, deskripsi, esensial_transisi FROM tujuan_pembelajaran ORDER BY mapel_id, urutan",
    ),
    query<{ tp_kode: string; prasyarat_kode: string }[]>("SELECT tp_kode, prasyarat_kode FROM prasyarat_tp"),
    query<{ tp_kode: string; penggunaan: string; n: number }[]>(
      "SELECT tp_kode, penggunaan, COUNT(*) AS n FROM soal WHERE status = 'terbit' GROUP BY tp_kode, penggunaan",
    ),
    query<{ tp_kode: string }[]>("SELECT tp_kode FROM narasi_materi"),
    query<{ judul: string; tp_terkait: string }[]>("SELECT judul, tp_terkait FROM materi ORDER BY urutan"),
  ]);
  const adaNarasi = new Set(narasi.map((n) => n.tp_kode));
  const materiTp = materi.map((m) => ({ judul: m.judul, tp: bacaJson<string[]>(m.tp_terkait) ?? [] }));
  const hitung = (kode: string, diagnostik: boolean) =>
    soal.filter((s) => s.tp_kode === kode && (s.penggunaan === "diagnostik") === diagnostik).reduce((n, s) => n + Number(s.n), 0);
  return tp.map((t) => ({
    ...t,
    esensial_transisi: t.esensial_transisi === 1,
    prasyarat: prasyarat.filter((p) => p.tp_kode === t.kode).map((p) => p.prasyarat_kode),
    soal_asesmen: hitung(t.kode, true),
    soal_latihan: hitung(t.kode, false),
    ada_kartu_belajar: adaNarasi.has(t.kode),
    materi: materiTp.filter((m) => m.tp.includes(t.kode)).map((m) => m.judul),
  }));
}

/** Keadaan database untuk dibandingkan dengan file import (lib/kurikulum/impor-tp.ts). */
export async function keadaanTpUntukImpor(): Promise<{ mapel: Set<number>; tp: Map<string, TpAda>; prasyarat: Set<string> }> {
  const [mapel, tp, prasyarat] = await Promise.all([
    query<{ id: number }[]>("SELECT id FROM mapel"),
    query<(TpAda & { kode: string; esensial_transisi: number | boolean })[]>(
      "SELECT kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi FROM tujuan_pembelajaran",
    ),
    query<{ tp_kode: string; prasyarat_kode: string }[]>("SELECT tp_kode, prasyarat_kode FROM prasyarat_tp"),
  ]);
  return {
    mapel: new Set(mapel.map((m) => m.id)),
    tp: new Map(tp.map(({ kode, ...t }) => [kode, { ...t, esensial_transisi: Boolean(t.esensial_transisi) }])),
    prasyarat: new Set(prasyarat.map((p) => `${p.tp_kode}>${p.prasyarat_kode}`)),
  };
}

/** Terapkan rencana import (sudah dicek tanpa galat) dalam satu transaksi. */
export async function terapkanImporTp(r: RencanaImporTp): Promise<void> {
  await denganTransaksi(async (kueri) => {
    for (const m of r.mapel_baru) await kueri("INSERT INTO mapel (id, nama) VALUES (?, ?)", [m.id, m.nama]);
    for (const t of r.tp_baru) {
      await kueri(
        `INSERT INTO tujuan_pembelajaran (kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.kode, t.mapel_id, t.elemen, t.fase, t.kelas, t.urutan, t.deskripsi, t.esensial_transisi ? 1 : 0],
      );
    }
    for (const { tp: t } of r.tp_berubah) {
      await kueri(
        "UPDATE tujuan_pembelajaran SET mapel_id = ?, elemen = ?, fase = ?, kelas = ?, urutan = ?, deskripsi = ?, esensial_transisi = ? WHERE kode = ?",
        [t.mapel_id, t.elemen, t.fase, t.kelas, t.urutan, t.deskripsi, t.esensial_transisi ? 1 : 0, t.kode],
      );
    }
    for (const p of r.prasyarat_baru) await kueri("INSERT INTO prasyarat_tp (tp_kode, prasyarat_kode) VALUES (?, ?)", [p.tp_kode, p.prasyarat_kode]);
  });
}

// ---------- Data awal ----------

/**
 * Masukkan materi dan narasi dari file data yang BELUM ada di database (dipanggil Reset demo).
 * Yang sudah ada, termasuk suntingan admin, tidak diubah. Narasi untuk TP yang belum ada di database dilewati.
 */
export async function lengkapiMateriAwal(kueri: JalankanKueri): Promise<{ materi: number; narasi: number }> {
  let materi = 0;
  for (const m of dataMateri.materi) {
    const hasil = await kueri<{ affectedRows: number }>(
      `INSERT IGNORE INTO materi
         (kode, mapel_id, fase, kelas, elemen, judul, deskripsi, tp_terkait, esensial_transisi, dasar_pembagian_kelas, urutan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.kode, m.mapel_id, m.fase, m.kelas, m.elemen, m.judul, m.deskripsi, JSON.stringify(m.tp_terkait),
        m.esensial_transisi === null ? null : m.esensial_transisi ? 1 : 0, m.dasar_pembagian_kelas ?? null, m.urutan,
      ],
    );
    materi += hasil.affectedRows;
  }
  let narasi = 0;
  for (const file of DATA_NARASI) {
    for (const n of file.narasi) {
      const tp = await kueri<{ kode: string }[]>("SELECT kode FROM tujuan_pembelajaran WHERE kode = ?", [n.tp_kode]);
      if (!tp[0]) continue;
      const hasil = await kueri<{ affectedRows: number }>("INSERT IGNORE INTO narasi_materi (tp_kode, judul, adegan_json) VALUES (?, ?, ?)", [
        n.tp_kode,
        n.judul,
        JSON.stringify(n.adegan),
      ]);
      narasi += hasil.affectedRows;
    }
  }
  return { materi, narasi };
}
