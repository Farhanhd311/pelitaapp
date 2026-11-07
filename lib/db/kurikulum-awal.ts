// Melengkapi kurikulum dari file data awal ke database yang SUDAH ADA, tanpa seed ulang
// (data anak tidak hilang). Hanya MENAMBAH yang belum ada; yang sudah ada tidak diubah.
// Dipanggil oleh Reset demo. Database baru tetap dibuat dengan `npm run seed`.

import dataBahasaIndonesia from "@/data/data_awal_bahasa_indonesia_fase_A_B.json";
import dataIpas from "@/data/data_awal_ipas_kelas_4.json";
import dataMatematika from "@/data/data_awal_matematika_fase_A_B.json";
import dataPendidikanPancasila from "@/data/data_awal_pendidikan_pancasila_kelas_4.json";
import type { JalankanKueri } from "@/lib/db";

type DataKurikulum = {
  mapel: { id: number; nama: string }[];
  tujuan_pembelajaran: {
    kode: string;
    mapel_id: number;
    elemen: string;
    fase: string;
    kelas: number;
    urutan: number;
    deskripsi: string;
    esensial_transisi: boolean;
  }[];
  prasyarat_tp: { tp_kode: string; prasyarat_kode: string }[];
  soal: {
    id: string;
    tp_kode: string;
    penggunaan: string;
    tingkat_kesulitan: number;
    pertanyaan: string;
    bacaan?: string | null;
    visual?: string | null;
    pembahasan?: string | null;
    pilihan: { teks: string; benar: boolean; miskonsepsi?: string | null }[];
  }[];
};

// Daftar file kurikulum yang dipakai aplikasi (sama dengan KURIKULUM di scripts/seed.mts). Menambah mapel =
// menambah file data di sini (PANDUAN 10). sumber: 'manual' = data awal tim; 'ai' = ditulis dengan bantuan AI dan
// diterbitkan langsung atas keputusan tim untuk demo (PANDUAN bagian 5), tetap wajib ditinjau guru.
const DATA_KURIKULUM: { data: DataKurikulum; sumber: "manual" | "ai" }[] = [
  { data: dataMatematika, sumber: "manual" },
  { data: dataBahasaIndonesia, sumber: "manual" },
  { data: dataIpas, sumber: "ai" },
  { data: dataPendidikanPancasila, sumber: "ai" },
];

export type HasilLengkapiKurikulum = { mapel: number; tp: number; prasyarat: number; soal: number };

export async function lengkapiKurikulumAwal(kueri: JalankanKueri): Promise<HasilLengkapiKurikulum> {
  const hasil: HasilLengkapiKurikulum = { mapel: 0, tp: 0, prasyarat: 0, soal: 0 };
  for (const { data, sumber } of DATA_KURIKULUM) {
    for (const m of data.mapel) {
      const ada = await kueri<{ id: number }[]>("SELECT id FROM mapel WHERE id = ?", [m.id]);
      if (ada[0]) continue;
      await kueri("INSERT INTO mapel (id, nama) VALUES (?, ?)", [m.id, m.nama]);
      hasil.mapel++;
    }
    for (const tp of data.tujuan_pembelajaran) {
      const ada = await kueri<{ kode: string }[]>("SELECT kode FROM tujuan_pembelajaran WHERE kode = ?", [tp.kode]);
      if (ada[0]) continue;
      await kueri(
        `INSERT INTO tujuan_pembelajaran (kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tp.kode, tp.mapel_id, tp.elemen, tp.fase, tp.kelas, tp.urutan, tp.deskripsi, tp.esensial_transisi ? 1 : 0],
      );
      hasil.tp++;
    }
    for (const p of data.prasyarat_tp) {
      const ada = await kueri<{ tp_kode: string }[]>(
        "SELECT tp_kode FROM prasyarat_tp WHERE tp_kode = ? AND prasyarat_kode = ?",
        [p.tp_kode, p.prasyarat_kode],
      );
      if (ada[0]) continue;
      await kueri("INSERT INTO prasyarat_tp (tp_kode, prasyarat_kode) VALUES (?, ?)", [p.tp_kode, p.prasyarat_kode]);
      hasil.prasyarat++;
    }
    // Soal dari file data awal: status 'terbit', sumber sesuai daftar di atas, sama seperti seed.
    for (const s of data.soal) {
      const ada = await kueri<{ id: string }[]>("SELECT id FROM soal WHERE id = ?", [s.id]);
      if (ada[0]) continue;
      await kueri(
        `INSERT INTO soal (id, tp_kode, penggunaan, tingkat_kesulitan, pertanyaan, bacaan, visual, pembahasan, sumber, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'terbit')`,
        [s.id, s.tp_kode, s.penggunaan, s.tingkat_kesulitan, s.pertanyaan, s.bacaan ?? null, s.visual ?? null, s.pembahasan ?? null, sumber],
      );
      for (const pil of s.pilihan) {
        await kueri("INSERT INTO pilihan (soal_id, teks, benar, miskonsepsi) VALUES (?, ?, ?, ?)", [
          s.id, pil.teks, pil.benar ? 1 : 0, pil.miskonsepsi ?? null,
        ]);
      }
      hasil.soal++;
    }
  }
  return hasil;
}
