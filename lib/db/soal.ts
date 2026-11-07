// Akses database bank soal untuk admin (PANDUAN 8.5). Admin boleh melihat kunci jawaban dan miskonsepsi.

import { query, type JalankanKueri } from "@/lib/db";
import type { ItemSoalAdmin } from "@/lib/kontrak/admin";
import type { KeluaranSoal } from "@/lib/ai/schemas";

type Filter = { tp_kode?: string; penggunaan?: string; tingkat_kesulitan?: number; sumber?: string; status?: string };

export async function daftarSoalAdmin(f: Filter): Promise<ItemSoalAdmin[]> {
  const syarat: string[] = [];
  const nilai: unknown[] = [];
  // Kolom filter dari daftar tetap; nilainya berparameter.
  for (const kolom of ["tp_kode", "penggunaan", "tingkat_kesulitan", "sumber", "status"] as const) {
    if (f[kolom] !== undefined) {
      syarat.push(`s.${kolom} = ?`);
      nilai.push(f[kolom]);
    }
  }
  const soal = await query<(Omit<ItemSoalAdmin, "pilihan" | "statistik" | "soal_id"> & { id: string })[]>(
    `SELECT s.id, s.tp_kode, s.penggunaan, s.tingkat_kesulitan, s.pertanyaan, s.bacaan, s.visual, s.pembahasan,
            s.sumber, s.status, s.alasan_penolakan
     FROM soal s ${syarat.length ? `WHERE ${syarat.join(" AND ")}` : ""}
     ORDER BY FIELD(s.status, 'draf', 'ditinjau', 'terbit', 'ditolak'), s.tp_kode, s.id`,
    nilai,
  );
  if (soal.length === 0) return [];

  const ids = soal.map((s) => s.id);
  // Pilihan + berapa kali tiap pilihan dijawab (statistik per soal, PANDUAN 8.5).
  const pilihan = await query<{ id: number; soal_id: string; teks: string; benar: number; miskonsepsi: string | null; dipilih: number }[]>(
    `SELECT p.id, p.soal_id, p.teks, p.benar, p.miskonsepsi, COUNT(j.id) AS dipilih
     FROM pilihan p LEFT JOIN jawaban j ON j.pilihan_id = p.id
     WHERE p.soal_id IN (?) GROUP BY p.id ORDER BY p.id`,
    [ids],
  );

  return soal.map((s) => {
    const milik = pilihan.filter((p) => p.soal_id === s.id);
    const total = milik.reduce((n, p) => n + Number(p.dipilih), 0);
    const benar = milik.filter((p) => p.benar === 1).reduce((n, p) => n + Number(p.dipilih), 0);
    const pengecoh = milik.filter((p) => p.benar !== 1 && Number(p.dipilih) > 0).sort((a, b) => Number(b.dipilih) - Number(a.dipilih))[0];
    return {
      soal_id: s.id,
      tp_kode: s.tp_kode,
      penggunaan: s.penggunaan,
      tingkat_kesulitan: s.tingkat_kesulitan,
      pertanyaan: s.pertanyaan,
      bacaan: s.bacaan,
      visual: s.visual,
      pembahasan: s.pembahasan,
      sumber: s.sumber,
      status: s.status,
      alasan_penolakan: s.alasan_penolakan,
      pilihan: milik.map((p) => ({ pilihan_id: p.id, teks: p.teks, benar: p.benar === 1, miskonsepsi: p.miskonsepsi })),
      statistik: {
        kali_dijawab: total,
        persen_benar: total > 0 ? Math.round((benar / total) * 100) : null,
        pengecoh_terbanyak: pengecoh?.teks ?? null,
      },
    };
  });
}

// Teks pertanyaan soal lain di TP yang sama (kecuali yang ditolak), untuk cek kemiripan soal AI.
export async function pertanyaanTp(tpKode: string, kecualiId?: string): Promise<string[]> {
  const baris = await query<{ pertanyaan: string }[]>(
    "SELECT pertanyaan FROM soal WHERE tp_kode = ? AND status <> 'ditolak' AND id <> ?",
    [tpKode, kecualiId ?? ""],
  );
  return baris.map((b) => b.pertanyaan);
}

export async function simpanSoalAI(
  kueri: JalankanKueri,
  m: { soal_id: string; tp_kode: string; penggunaan: string; tingkat_kesulitan: number; soal: KeluaranSoal; dibuat_oleh: number },
): Promise<void> {
  await kueri(
    `INSERT INTO soal (id, tp_kode, penggunaan, tingkat_kesulitan, pertanyaan, visual, pembahasan, sumber, status, dibuat_oleh)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ai', 'draf', ?)`,
    [m.soal_id, m.tp_kode, m.penggunaan, m.tingkat_kesulitan, m.soal.pertanyaan, m.soal.visual, m.soal.pembahasan, m.dibuat_oleh],
  );
  for (const p of m.soal.pilihan) {
    await kueri("INSERT INTO pilihan (soal_id, teks, benar, miskonsepsi) VALUES (?, ?, ?, ?)", [
      m.soal_id,
      p.teks,
      p.benar ? 1 : 0,
      p.benar ? null : p.miskonsepsi,
    ]);
  }
}
