// Akses database untuk asesmen adaptif (dipakai app/api/asesmen/route.ts).
// Semua query berparameter. Fungsi yang menulis menerima `kueri` supaya bisa dijalankan di dalam transaksi.

import { GalatApi } from "@/lib/api/respons";
import { buatGraf, type GrafPrasyarat, type TpGraf } from "@/lib/bkt/graph";
import { putarUlangAsesmen, type JawabanTersimpan, type KeadaanAsesmen } from "@/lib/bkt/engine";
import { ambilRiwayatPengaturan, keParameterAsesmen, pilihNilaiPada } from "@/lib/pengaturan";
import { query, type JalankanKueri } from "@/lib/db";
import type { KotakPetaTp, SoalTampil } from "@/lib/kontrak/umum";

// ---------- Kurikulum ----------

export type KurikulumMapel = { mapel_id: number; daftar_tp: TpGraf[]; graf: GrafPrasyarat };

export async function ambilKurikulum(mapelId: number): Promise<KurikulumMapel> {
  const daftarTp = await query<TpGraf[]>(
    "SELECT kode, kelas, urutan FROM tujuan_pembelajaran WHERE mapel_id = ? ORDER BY urutan",
    [mapelId],
  );
  if (daftarTp.length === 0) throw new GalatApi("TIDAK_DITEMUKAN", "Mata pelajaran tidak ditemukan.");

  const relasi = await query<{ tp_kode: string; prasyarat_kode: string }[]>(
    `SELECT p.tp_kode, p.prasyarat_kode
     FROM prasyarat_tp p JOIN tujuan_pembelajaran t ON t.kode = p.tp_kode
     WHERE t.mapel_id = ?`,
    [mapelId],
  );
  return { mapel_id: mapelId, daftar_tp: daftarTp, graf: buatGraf(daftarTp, relasi) };
}

export async function ambilTpSoal(soalId: string): Promise<{ mapel_id: number; tp_kode: string }> {
  const baris = await query<{ mapel_id: number; tp_kode: string }[]>(
    "SELECT t.mapel_id, s.tp_kode FROM soal s JOIN tujuan_pembelajaran t ON t.kode = s.tp_kode WHERE s.id = ?",
    [soalId],
  );
  if (!baris[0]) throw new GalatApi("TIDAK_DITEMUKAN", "Soal tidak ditemukan.");
  return baris[0];
}

// Kelas terakhir anak di sekolah dari profil (ANAK.kelas_terakhir): pilihan awal di layar sebelum asesmen.
export async function ambilKelasTerakhir(anakId: number): Promise<number> {
  const baris = await query<{ kelas_terakhir: number }[]>("SELECT kelas_terakhir FROM anak WHERE id = ?", [anakId]);
  if (!baris[0]) throw new GalatApi("TIDAK_DITEMUKAN", "Profil anak tidak ditemukan.");
  return baris[0].kelas_terakhir;
}

// ---------- Jawaban ----------

// Semua jawaban diagnostik anak untuk satu mapel, urut sesuai waktu menjawab (id naik).
// Benar/salah diambil dari PILIHAN.benar (tidak disimpan ganda, PANDUAN 9).
export async function ambilJawabanAsesmen(anakId: number, mapelId: number): Promise<JawabanTersimpan[]> {
  const baris = await query<{ soal_id: string; tp_kode: string; benar: number; waktu: Date }[]>(
    `SELECT s.id AS soal_id, s.tp_kode, p.benar, se.mulai AS waktu
     FROM jawaban j
     JOIN sesi se ON se.id = j.sesi_id
     JOIN pilihan p ON p.id = j.pilihan_id
     JOIN soal s ON s.id = p.soal_id
     JOIN tujuan_pembelajaran t ON t.kode = s.tp_kode
     WHERE se.anak_id = ? AND se.jenis = 'diagnostik' AND t.mapel_id = ?
     ORDER BY j.id`,
    [anakId, mapelId],
  );
  return baris.map((b) => ({ soal_id: b.soal_id, tp_kode: b.tp_kode, benar: b.benar === 1, waktu: b.waktu }));
}

export async function ambilPilihan(
  pilihanId: number,
): Promise<{ pilihan_id: number; soal_id: string; benar: boolean } | null> {
  const baris = await query<{ id: number; soal_id: string; benar: number }[]>(
    "SELECT id, soal_id, benar FROM pilihan WHERE id = ?",
    [pilihanId],
  );
  return baris[0] ? { pilihan_id: baris[0].id, soal_id: baris[0].soal_id, benar: baris[0].benar === 1 } : null;
}

// Untuk mode demo: id pilihan benar atau salah dari sebuah soal (server yang memilih, bukan browser).
export async function ambilPilihanUntukDemo(soalId: string, benar: boolean): Promise<number> {
  const baris = await query<{ id: number }[]>(
    "SELECT id FROM pilihan WHERE soal_id = ? AND benar = ? ORDER BY id LIMIT 1",
    [soalId, benar ? 1 : 0],
  );
  if (!baris[0]) throw new Error(`Soal ${soalId} tidak punya pilihan ${benar ? "benar" : "salah"}`);
  return baris[0].id;
}

export async function simpanJawaban(
  kueri: JalankanKueri,
  jawaban: { sesi_id: number; pilihan_id: number; waktu_respons_ms: number | null },
): Promise<void> {
  await kueri("INSERT INTO jawaban (sesi_id, pilihan_id, waktu_respons_ms) VALUES (?, ?, ?)", [
    jawaban.sesi_id,
    jawaban.pilihan_id,
    jawaban.waktu_respons_ms,
  ]);
}

// ---------- Sesi asesmen ----------

export type SesiAsesmen = { id: number; mulai: Date; jumlah_jawaban: number };

const SQL_SESI = `SELECT se.id, se.mulai, COUNT(j.id) AS jumlah_jawaban
  FROM sesi se LEFT JOIN jawaban j ON j.sesi_id = se.id`;

// Sesi diagnostik anak yang belum ditutup (selesai IS NULL), jika ada.
export async function ambilSesiTerbuka(anakId: number): Promise<SesiAsesmen | null> {
  const baris = await query<SesiAsesmen[]>(
    `${SQL_SESI} WHERE se.anak_id = ? AND se.jenis = 'diagnostik' AND se.selesai IS NULL
     GROUP BY se.id ORDER BY se.id DESC LIMIT 1`,
    [anakId],
  );
  return baris[0] ? { ...baris[0], jumlah_jawaban: Number(baris[0].jumlah_jawaban) } : null;
}

// Sesi tertentu milik anak ini yang masih terbuka; galat jika bukan.
export async function wajibSesiTerbuka(anakId: number, sesiId: number): Promise<SesiAsesmen> {
  const baris = await query<SesiAsesmen[]>(
    `${SQL_SESI} WHERE se.id = ? AND se.anak_id = ? AND se.jenis = 'diagnostik' AND se.selesai IS NULL
     GROUP BY se.id`,
    [sesiId, anakId],
  );
  if (!baris[0]) throw new GalatApi("BENTROK", "Sesi asesmen ini sudah selesai. Mulai lagi dari awal ya.");
  return { ...baris[0], jumlah_jawaban: Number(baris[0].jumlah_jawaban) };
}

export async function buatSesiAsesmen(anakId: number): Promise<SesiAsesmen> {
  const hasil = await query<{ insertId: number }>("INSERT INTO sesi (anak_id, jenis) VALUES (?, 'diagnostik')", [anakId]);
  const baris = await query<{ mulai: Date }[]>("SELECT mulai FROM sesi WHERE id = ?", [hasil.insertId]);
  return { id: hasil.insertId, mulai: baris[0].mulai, jumlah_jawaban: 0 };
}

export async function tutupSesi(kueri: JalankanKueri, sesiId: number): Promise<void> {
  await kueri("UPDATE sesi SET selesai = CURRENT_TIMESTAMP WHERE id = ? AND selesai IS NULL", [sesiId]);
}

// ---------- Soal ----------

// Acak urutan pilihan (Fisher-Yates). Di data, kunci sering di posisi kedua (PANDUAN 7.2).
function acak<T>(daftar: T[]): T[] {
  const hasil = [...daftar];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

// Soal diagnostik berikutnya untuk satu TP: hanya status 'terbit' (PANDUAN 8.5), belum keluar di asesmen ini,
// dari yang paling mudah. Kunci jawaban dan miskonsepsi TIDAK ikut (lihat SoalTampil).
export async function pilihSoalDiagnostik(tpKode: string, sudahDipakai: string[]): Promise<SoalTampil> {
  const kecuali = sudahDipakai.length > 0 ? sudahDipakai : [""];
  const soal = await query<{ id: string; tp_kode: string; pertanyaan: string; bacaan: string | null; visual: string | null }[]>(
    `SELECT id, tp_kode, pertanyaan, bacaan, visual FROM soal
     WHERE tp_kode = ? AND penggunaan = 'diagnostik' AND status = 'terbit' AND id NOT IN (?)
     ORDER BY tingkat_kesulitan, id LIMIT 1`,
    [tpKode, kecuali],
  );
  if (!soal[0]) throw new Error(`Soal diagnostik terbit untuk TP ${tpKode} habis`);

  const pilihan = await query<{ id: number; teks: string }[]>(
    "SELECT id, teks FROM pilihan WHERE soal_id = ? ORDER BY id",
    [soal[0].id],
  );
  return {
    soal_id: soal[0].id,
    tp_kode: soal[0].tp_kode,
    pertanyaan: soal[0].pertanyaan,
    bacaan: soal[0].bacaan,
    visual: soal[0].visual,
    pilihan: acak(pilihan.map((p) => ({ pilihan_id: p.id, teks: p.teks }))),
  };
}

// ---------- Progres TP ----------

// Simpan status setiap TP dari keadaan asesmen ke PROGRES_TP (satu baris per anak per TP).
export async function simpanProgres(kueri: JalankanKueri, anakId: number, keadaan: KeadaanAsesmen): Promise<void> {
  for (const [kode, s] of Object.entries(keadaan.tp)) {
    await kueri(
      `INSERT INTO progres_tp (anak_id, tp_kode, status, sumber_status, p_menguasai)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), sumber_status = VALUES(sumber_status),
                               p_menguasai = VALUES(p_menguasai)`,
      [anakId, kode, s.status, s.sumber_status, s.p_menguasai],
    );
  }
}

// Peta TP untuk respons API (tanpa p_menguasai).
export function keadaanKePeta(kurikulum: KurikulumMapel, keadaan: KeadaanAsesmen): KotakPetaTp[] {
  return kurikulum.daftar_tp.map((t) => ({
    tp_kode: t.kode,
    kelas: t.kelas,
    urutan: t.urutan,
    status: keadaan.tp[t.kode].status,
    sumber_status: keadaan.tp[t.kode].sumber_status,
  }));
}

// Apakah asesmen penempatan mapel ini sudah pernah selesai (untuk peta: arahkan ke asesmen jika belum).
// Keadaan asesmen mapel ini untuk layar: pernah selesai? sedang berjalan (belum selesai, bisa dilanjutkan)?
export async function statusAsesmen(anakId: number, kurikulum: KurikulumMapel): Promise<{ pernah_selesai: boolean; berjalan: boolean }> {
  const [riwayat, jawaban] = await Promise.all([ambilRiwayatPengaturan(), ambilJawabanAsesmen(anakId, kurikulum.mapel_id)]);
  const putaran = putarUlangAsesmen(kurikulum.graf, jawaban, (w) => keParameterAsesmen(pilihNilaiPada(riwayat, w), kurikulum.mapel_id));
  if (!putaran) return { pernah_selesai: false, berjalan: false };
  return {
    // Selesai jika putaran terakhir selesai, ATAU ada putaran sebelumnya yang selesai (anak sedang asesmen ulang):
    // dalam kasus kedua, jawaban putaran terakhir lebih sedikit dari seluruh jawaban.
    pernah_selesai: putaran.keadaan.selesai || putaran.soal_dipakai.length < jawaban.length,
    berjalan: !putaran.keadaan.selesai,
  };
}

// TP yang punya konten belajar (KONTEN jenis baru/jembatan) -> "tersedia" di peta; lainnya "segera hadir".
export async function ambilTpBerkonten(mapelId: number): Promise<Set<string>> {
  const baris = await query<{ tp_kode: string }[]>(
    `SELECT DISTINCT k.tp_kode FROM konten k JOIN tujuan_pembelajaran t ON t.kode = k.tp_kode
     WHERE t.mapel_id = ? AND k.jenis IN ('baru', 'jembatan')`,
    [mapelId],
  );
  return new Set(baris.map((b) => b.tp_kode));
}
