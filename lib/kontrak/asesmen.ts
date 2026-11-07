// Kontrak API asesmen adaptif: POST /api/asesmen
// Satu route dengan tiga aksi (field `aksi`):
//   mulai      -> buka sesi asesmen satu mapel (atau lanjutkan yang belum selesai), balas soal pertama
//   jawab      -> anak memilih jawaban; server memperbarui BKT (lib/bkt) dan memilih soal berikutnya
//   jawab_demo -> mode demo "putar otomatis": SERVER yang memilih jawaban Raka (benar jika TP dikuasai),
//                 supaya kunci jawaban tidak perlu dikirim ke browser. Mesin BKT-nya tetap sama.
// Selama asesmen, respons tidak memberi tahu benar/salah (umpan balik netral, PANDUAN 7.2).

import { z } from "zod";
import { KotakPetaTp, SoalTampil, StatusTp, SumberStatus, contohSoalTampil } from "./umum";

// ---------- Permintaan ----------

// Juga dipakai untuk MELANJUTKAN: jika ada asesmen mapel ini yang belum selesai, soal berikutnya yang dibalas.
// Jika asesmen sebelumnya sudah selesai, `mulai` memulai asesmen baru (asesmen ulang / putar ulang demo).
const PermintaanMulai = z.object({
  aksi: z.literal("mulai"),
  mapel_id: z.number().int(), // dipilih dari data mapel, tidak ditulis langsung di kode
});

const PermintaanJawab = z.object({
  aksi: z.literal("jawab"),
  sesi_id: z.number().int(),
  soal_id: z.string(),
  pilihan_id: z.number().int(),
  waktu_respons_ms: z.number().int().nonnegative(),
});

const PermintaanJawabDemo = z.object({
  aksi: z.literal("jawab_demo"),
  sesi_id: z.number().int(),
  soal_id: z.string(),
});

export const PermintaanAsesmen = z.discriminatedUnion("aksi", [
  PermintaanMulai,
  PermintaanJawab,
  PermintaanJawabDemo,
]);

// ---------- Respons ----------

// lanjut      -> tampilkan `soal` berikutnya
// batas_sesi  -> batas soal per sesi tercapai (PENGATURAN_SISTEM asesmen.maks_soal_per_sesi).
//                Progres tersimpan; panggil `mulai` lagi untuk melanjutkan (di mode demo: otomatis).
// selesai     -> penelusuran tuntas, `titik_mulai` terisi
export const StatusAsesmen = z.enum(["lanjut", "batas_sesi", "selesai"]);

// Hanya dikirim sebagai balasan `jawab_demo`: angka peluang untuk batang peluang di layar demo.
// Jawaban biasa (`jawab`) tidak pernah membawa angka ini (angka peluang bukan untuk anak).
export const InfoDemo = z.object({
  tp_kode: z.string(), // TP yang baru dijawab
  p_sebelum: z.number(),
  p_sesudah: z.number(),
  keputusan: z.enum(["tercapai", "belum"]).nullable(), // null = TP ini belum diputuskan
});

export const ResponsAsesmen = z.object({
  sesi_id: z.number().int(),
  status: StatusAsesmen,
  soal: SoalTampil.nullable(), // null jika status bukan "lanjut"
  jumlah_soal_dijawab: z.number().int(), // total sepanjang asesmen mapel ini
  // Garis progres di atas soal (terisi dari kiri ke kanan): soal ke-berapa di SESI ini dari batas soal per sesi.
  // Bukan jumlah soal asesmen (asesmen adaptif, jumlahnya tidak tetap).
  nomor_soal: z.number().int(),
  jumlah_soal: z.number().int(),
  peta: z.array(KotakPetaTp), // semua TP mapel ini, untuk mewarnai peta
  titik_mulai: z.string().nullable(), // tp_kode, terisi saat status "selesai"
  demo: InfoDemo.nullable(), // terisi hanya untuk balasan `jawab_demo`
});

export type PermintaanAsesmen = z.infer<typeof PermintaanAsesmen>;
export type StatusAsesmen = z.infer<typeof StatusAsesmen>;
export type InfoDemo = z.infer<typeof InfoDemo>;
export type ResponsAsesmen = z.infer<typeof ResponsAsesmen>;

// ---------- Contoh ----------

export const contohPermintaanMulai: PermintaanAsesmen = { aksi: "mulai", mapel_id: 1 };

export const contohPermintaanJawab: PermintaanAsesmen = {
  aksi: "jawab",
  sesi_id: 12,
  soal_id: "B3-D1",
  pilihan_id: 41,
  waktu_respons_ms: 4200,
};

// Peta untuk contoh: [tp_kode, kelas, urutan] dari data_awal_matematika_fase_A_B.json.
// Hanya untuk data contoh UI; kode aplikasi membaca TP dari database.
const KODE_TP_CONTOH: [string, number, number][] = [
  ["A1", 1, 1], ["A2", 1, 2], ["A3", 1, 3], ["A4", 1, 4], ["A5", 1, 5], ["A6", 2, 6], ["A7", 2, 7], ["A8", 2, 8],
  ["B1", 3, 9], ["B2", 3, 10], ["B3", 3, 11], ["B4", 3, 12], ["B5", 3, 13], ["B6", 4, 14], ["B7", 4, 15], ["B8", 4, 16],
];

function petaContoh(ubah: Record<string, [StatusTp, SumberStatus]> = {}): KotakPetaTp[] {
  return KODE_TP_CONTOH.map(([tp_kode, kelas, urutan]) => {
    const [status, sumber_status] = ubah[tp_kode] ?? ["belum_diketahui", null];
    return { tp_kode, kelas, urutan, status, sumber_status };
  });
}

// Setelah `mulai`: soal pertama dari TP B3.
export const contohResponsMulai: ResponsAsesmen = {
  sesi_id: 12,
  status: "lanjut",
  soal: contohSoalTampil,
  jumlah_soal_dijawab: 0,
  nomor_soal: 1,
  jumlah_soal: 12,
  peta: petaContoh(),
  titik_mulai: null,
  demo: null,
};

// Setelah jawaban ke-2 Raka di B3 (salah dua kali): B3 belum, B4/B5/B7/B8 ikut disimpulkan belum.
export const contohResponsJawab: ResponsAsesmen = {
  sesi_id: 12,
  status: "lanjut",
  soal: { ...contohSoalTampil, soal_id: "A4-D1", tp_kode: "A4", pertanyaan: "(soal A4)", visual: null },
  jumlah_soal_dijawab: 2,
  nomor_soal: 3,
  jumlah_soal: 12,
  peta: petaContoh({
    B3: ["belum", "diuji"],
    B4: ["belum", "disimpulkan"],
    B5: ["belum", "disimpulkan"],
    B7: ["belum", "disimpulkan"],
    B8: ["belum", "disimpulkan"],
  }),
  titik_mulai: null,
  demo: { tp_kode: "B3", p_sebelum: 0.118, p_sesudah: 0.017, keputusan: "belum" },
};

// Akhir asesmen Raka (data/tes_kasus_bkt.json): 17 soal, titik mulai B3, B6 belum_diketahui.
export const contohResponsSelesai: ResponsAsesmen = {
  sesi_id: 13,
  status: "selesai",
  soal: null,
  jumlah_soal_dijawab: 17,
  nomor_soal: 5,
  jumlah_soal: 12,
  peta: petaContoh({
    A1: ["tercapai", "disimpulkan"], A2: ["tercapai", "disimpulkan"], A3: ["tercapai", "disimpulkan"],
    A4: ["tercapai", "diuji"], A5: ["tercapai", "diuji"], A6: ["tercapai", "disimpulkan"],
    A7: ["tercapai", "diuji"], A8: ["tercapai", "diuji"], B1: ["tercapai", "disimpulkan"],
    B2: ["tercapai", "diuji"], B3: ["belum", "diuji"], B4: ["belum", "disimpulkan"],
    B5: ["belum", "disimpulkan"], B7: ["belum", "disimpulkan"], B8: ["belum", "disimpulkan"],
  }),
  titik_mulai: "B3",
  demo: { tp_kode: "B2", p_sebelum: 0.928, p_sesudah: 0.979, keputusan: "tercapai" },
};
