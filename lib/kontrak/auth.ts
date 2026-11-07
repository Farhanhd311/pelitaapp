// Kontrak API login dan profil (PANDUAN 4, PRD 9.1):
//   POST /api/auth/login   -> email + password, balas mode berikutnya (admin / pilih_profil)
//   POST /api/auth/logout  -> hapus sesi
//   GET  /api/auth/profil  -> siapa yang login, mode sekarang, dan daftar anak untuk layar pilih profil
//   POST /api/auth/profil  -> ketuk avatar anak: masuk mode anak
//   POST /api/auth/pin     -> PIN pendamping: masuk mode pendamping (dari mode anak atau pilih profil)

import { z } from "zod";

export const ModeSesi = z.enum(["admin", "pendamping", "anak", "pilih_profil"]);
export const Hubungan = z.enum(["orang_tua", "wali", "guru"]);

export const PermintaanLogin = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const ResponsLogin = z.object({
  nama: z.string(),
  role: z.enum(["admin", "pendamping"]),
  mode: ModeSesi,
});

export const ProfilAnak = z.object({
  anak_id: z.number().int(),
  nama_panggilan: z.string(),
  hubungan: Hubungan,
});

export const ResponsProfil = z.object({
  nama: z.string(),
  role: z.enum(["admin", "pendamping"]),
  mode: ModeSesi,
  anak_aktif: ProfilAnak.nullable(),
  daftar_anak: z.array(ProfilAnak), // avatar di layar pilih profil (kosong untuk admin)
});

export const PermintaanPilihAnak = z.object({
  anak_id: z.number().int(),
});

export const ResponsPilihAnak = z.object({
  mode: z.literal("anak"),
  anak_id: z.number().int(),
  perlu_asesmen: z.boolean().optional(),
  tujuan: z.string().optional(),
});

export const PermintaanPin = z.object({
  pin: z.string().regex(/^\d{4,8}$/, "PIN berupa 4–8 angka"),
});

export const ResponsPin = z.object({
  mode: z.literal("pendamping"),
});

export type ModeSesi = z.infer<typeof ModeSesi>;
export type Hubungan = z.infer<typeof Hubungan>;
export type PermintaanLogin = z.infer<typeof PermintaanLogin>;

// ---------- Pendaftaran (POST /api/auth/daftar) ----------
// Hanya orang tua/wali (keputusan tim; guru pendamping butuh verifikasi admin, PANDUAN 12).
// PIN pendamping DIBUAT SISTEM dan dikirim ke WhatsApp. Fase pengobatan awal "pemeliharaan" (diubah di dashboard).
// Kelas terakhir tidak ditanya di sini: diambil dari pilihan kelas saat asesmen pertama.
export const PermintaanDaftar = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 huruf").max(100),
  email: z.string().trim().toLowerCase().email("Format email belum benar"),
  no_wa: z.string().trim().min(8, "Nomor WhatsApp belum benar").max(20),
  password: z.string().min(8, "Password minimal 8 karakter").max(72), // bcrypt membaca maksimal 72 byte
  hubungan: z.enum(["orang_tua", "wali"]),
  anak: z.object({
    nama_panggilan: z.string().trim().min(1, "Nama panggilan wajib diisi").max(50),
    tgl_lahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir belum benar"),
    kelas_seharusnya: z.number().int().min(1).max(6),
    asal_sekolah: z.string().trim().max(150).optional(),
    tgl_berhenti_sekolah: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  setuju_data: z.literal(true, { message: "Persetujuan data wajib dicentang" }),
});
export type PermintaanDaftar = z.infer<typeof PermintaanDaftar>;

export type ResponsDaftar = {
  nama: string;
  no_wa_tersamar: string; // misalnya 0812•••••890
  pin_terkirim_wa: boolean;
  pin: string | null; // HANYA terisi jika WhatsApp gagal terkirim, supaya akun tetap bisa dipakai (tampil sekali)
};
export type ResponsLogin = z.infer<typeof ResponsLogin>;
export type ProfilAnak = z.infer<typeof ProfilAnak>;
export type ResponsProfil = z.infer<typeof ResponsProfil>;
export type PermintaanPilihAnak = z.infer<typeof PermintaanPilihAnak>;
export type PermintaanPin = z.infer<typeof PermintaanPin>;
export type ResponsPin = z.infer<typeof ResponsPin>;
export type ResponsPilihAnak = z.infer<typeof ResponsPilihAnak>;

// ---------- Contoh ----------

export const contohResponsLogin: ResponsLogin = { nama: "Ibu Sari", role: "pendamping", mode: "pilih_profil" };

export const contohResponsProfil: ResponsProfil = {
  nama: "Ibu Sari",
  role: "pendamping",
  mode: "pilih_profil",
  anak_aktif: null,
  daftar_anak: [{ anak_id: 1, nama_panggilan: "Raka", hubungan: "orang_tua" }],
};
