// Import TP dari file JSON berformat data/data_awal_*.json (mapel, tujuan_pembelajaran, prasyarat_tp).
// Fungsi MURNI: membandingkan isi file dengan yang sudah ada di database, lalu menyusun rencana perubahan.
// Aturan:
//   - TP baru ditambah; TP lama diperbarui jika kolomnya berbeda. TP yang tidak ada di file TIDAK dihapus
//     (progres dan jawaban anak masih merujuk ke TP itu).
//   - Prasyarat baru ditambah; prasyarat lama tidak dihapus.
//   - Ditolak jika: kode TP kembar di file, mapel/TP yang dirujuk tidak ada, atau prasyarat membentuk lingkaran
//     (mesin BKT butuh graf prasyarat tanpa lingkaran).
// Kolom lain di file (meta, soal) diabaikan; soal baru dibuat generator AI setelah import.

import { z } from "zod";

export const SkemaFileTp = z.object({
  mapel: z.array(z.object({ id: z.number().int().positive(), nama: z.string().trim().min(1).max(100) })).default([]),
  tujuan_pembelajaran: z
    .array(
      z.object({
        kode: z.string().trim().min(1).max(20),
        mapel_id: z.number().int().positive(),
        elemen: z.string().trim().min(1).max(100),
        fase: z.string().trim().min(1).max(2),
        kelas: z.number().int().min(1).max(12),
        urutan: z.number().int().min(1),
        deskripsi: z.string().trim().min(1).max(2000),
        esensial_transisi: z.boolean().default(false),
      }),
    )
    .min(1, "file tidak berisi tujuan_pembelajaran"),
  prasyarat_tp: z.array(z.object({ tp_kode: z.string(), prasyarat_kode: z.string() })).default([]),
});
export type FileTp = z.infer<typeof SkemaFileTp>;
type TpFile = FileTp["tujuan_pembelajaran"][number];

export type TpAda = Omit<TpFile, "kode">;

export type RencanaImporTp = {
  mapel_baru: { id: number; nama: string }[];
  tp_baru: TpFile[];
  tp_berubah: { tp: TpFile; kolom: string[] }[];
  prasyarat_baru: { tp_kode: string; prasyarat_kode: string }[];
  galat: string[]; // tidak kosong = rencana tidak boleh diterapkan
};

const KOLOM: (keyof TpAda)[] = ["mapel_id", "elemen", "fase", "kelas", "urutan", "deskripsi", "esensial_transisi"];

export function rencanakanImporTp(file: FileTp, ada: { mapel: Set<number>; tp: Map<string, TpAda>; prasyarat: Set<string> }): RencanaImporTp {
  const galat: string[] = [];
  const kunci = (tp: string, pr: string) => `${tp}>${pr}`;

  const kodeFile = file.tujuan_pembelajaran.map((t) => t.kode);
  const kembar = kodeFile.filter((k, i) => kodeFile.indexOf(k) !== i);
  if (kembar.length) galat.push(`Kode TP kembar di file: ${[...new Set(kembar)].join(", ")}`);

  const mapelBaru = file.mapel.filter((m) => !ada.mapel.has(m.id));
  const mapelSemua = new Set([...ada.mapel, ...file.mapel.map((m) => m.id)]);
  for (const tp of file.tujuan_pembelajaran) {
    if (!mapelSemua.has(tp.mapel_id)) galat.push(`TP ${tp.kode} merujuk mapel_id ${tp.mapel_id} yang tidak ada`);
  }

  const tpBaru = file.tujuan_pembelajaran.filter((t) => !ada.tp.has(t.kode));
  const tpBerubah = file.tujuan_pembelajaran
    .filter((t) => ada.tp.has(t.kode))
    .map((t) => ({ tp: t, kolom: KOLOM.filter((k) => ada.tp.get(t.kode)![k] !== t[k]) }))
    .filter((x) => x.kolom.length > 0);

  const tpSemua = new Set([...ada.tp.keys(), ...kodeFile]);
  const prasyaratBaru = file.prasyarat_tp.filter((p) => !ada.prasyarat.has(kunci(p.tp_kode, p.prasyarat_kode)));
  for (const p of prasyaratBaru) {
    if (!tpSemua.has(p.tp_kode) || !tpSemua.has(p.prasyarat_kode)) galat.push(`Prasyarat ${p.prasyarat_kode} → ${p.tp_kode} merujuk TP yang tidak ada`);
    if (p.tp_kode === p.prasyarat_kode) galat.push(`TP ${p.tp_kode} tidak boleh menjadi prasyarat dirinya sendiri`);
  }

  // Graf gabungan (lama + baru) harus tanpa lingkaran.
  const tetangga = new Map<string, string[]>();
  for (const k of [...ada.prasyarat].map((x) => x.split(">")).concat(prasyaratBaru.map((p) => [p.tp_kode, p.prasyarat_kode]))) {
    tetangga.set(k[0], [...(tetangga.get(k[0]) ?? []), k[1]]);
  }
  const keadaan = new Map<string, 1 | 2>(); // 1 = sedang ditelusuri, 2 = selesai
  const adaLingkaran = (v: string): boolean => {
    if (keadaan.get(v) === 1) return true;
    if (keadaan.get(v) === 2) return false;
    keadaan.set(v, 1);
    const hasil = (tetangga.get(v) ?? []).some(adaLingkaran);
    keadaan.set(v, 2);
    return hasil;
  };
  if ([...tetangga.keys()].some(adaLingkaran)) galat.push("Prasyarat membentuk lingkaran (A butuh B, B butuh A)");

  return { mapel_baru: mapelBaru, tp_baru: tpBaru, tp_berubah: tpBerubah, prasyarat_baru: prasyaratBaru, galat };
}
