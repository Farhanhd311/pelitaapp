// Login buatan sendiri (PANDUAN 11): password & PIN di-hash bcryptjs, sesi di cookie terenkripsi
// iron-session (httpOnly). Cookie hanya berisi data di bawah ini, tidak pernah password atau PIN.
//
// Alur di satu perangkat (PANDUAN 4):
//   1. Pendamping login (email + password)         -> mode "pilih_profil"
//   2a. Ketuk avatar anak                           -> mode "anak" (anak_aktif diisi)
//   2b. Ketuk "Pendamping" + PIN benar              -> mode "pendamping"
//   Dari mode anak ke mode pendamping SELALU lewat PIN. Admin langsung ke mode "admin".

import bcrypt from "bcryptjs";
import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export type Peran = "admin" | "pendamping";

export type DataSesi = {
  user_id: number;
  role: Peran;
  anak_aktif: number | null; // anak yang sedang memakai aplikasi (mode anak)
  mode_pendamping: boolean; // true hanya setelah PIN pendamping benar
  pin_salah: number; // jumlah PIN salah berturut-turut
  pin_terkunci_sampai: number | null; // waktu (ms) sampai PIN boleh dicoba lagi
  sesi_belajar: KeadaanSesiBelajar | null; // sesi belajar yang sedang berjalan di perangkat ini
};

// Keadaan sesi belajar yang tidak punya kolom di tabel SESI (skema tidak diubah), disimpan di cookie terenkripsi.
export type KeadaanSesiBelajar = {
  sesi_id: number;
  mapel_id: number;
  tp_kode: string | null;
  ulang: boolean; // mengulang TP tercapai: kuis tidak memengaruhi status TP
  soal_sekarang: string | null; // soal yang sedang tampil (hanya soal ini yang boleh dijawab)
  menunggu_cek_kuat: boolean;
  ceroboh_lelah: boolean; // anak memilih "Agak capek"
  tanpa_materi_baru: boolean;
  sudah_cek_durasi: boolean;
  sudah_cek_tengah: boolean;
  salah_dihitung_sejak: number; // salah beruntun dihitung setelah soal ke-N (direset setiap cek "Masih kuat?")
};

export type ModeSesi = "admin" | "pendamping" | "anak" | "pilih_profil";

// Batas percobaan PIN (PRD 9.1: "kunci 5 menit setelah 5 kali salah"). Ini pengaman keamanan,
// bukan aturan perilaku AI, jadi tidak ada di PENGATURAN_SISTEM. Penghitungnya disimpan di cookie
// sesi: menghapus cookie berarti logout, dan login ulang tetap butuh password.
const BATAS_PIN_SALAH = 5;
const LAMA_KUNCI_PIN_MS = 5 * 60 * 1000;
const DURASI_SESI_DETIK = 24 * 60 * 60; // 1 hari (86.400 detik)

function opsiSesi() {
  const rahasia = process.env.SESSION_SECRET;
  if (!rahasia || rahasia.length < 32) {
    throw new Error("SESSION_SECRET di .env belum diisi atau kurang dari 32 karakter");
  }
  return {
    password: rahasia,
    cookieName: "pelita_sesi",
    ttl: DURASI_SESI_DETIK,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // localhost memakai http
      sameSite: "lax" as const,
      maxAge: DURASI_SESI_DETIK,
    },
  };
}

async function bukaSesi(): Promise<IronSession<DataSesi>> {
  return getIronSession<DataSesi>(await cookies(), opsiSesi());
}

// Data sesi yang sedang login, atau null jika belum login.
export async function ambilSesi(): Promise<DataSesi | null> {
  const sesi = await bukaSesi();
  if (sesi.user_id === undefined || sesi.role === undefined) return null;
  return {
    user_id: sesi.user_id,
    role: sesi.role,
    anak_aktif: sesi.anak_aktif ?? null,
    mode_pendamping: sesi.mode_pendamping ?? false,
    pin_salah: sesi.pin_salah ?? 0,
    pin_terkunci_sampai: sesi.pin_terkunci_sampai ?? null,
    sesi_belajar: sesi.sesi_belajar ?? null,
  };
}

export function modeSesi(sesi: DataSesi): ModeSesi {
  if (sesi.role === "admin") return "admin";
  if (sesi.mode_pendamping) return "pendamping";
  if (sesi.anak_aktif !== null) return "anak";
  return "pilih_profil";
}

// Simpan perubahan sebagian data sesi ke cookie.
export async function perbaruiSesi(ubah: Partial<DataSesi>): Promise<void> {
  const sesi = await bukaSesi();
  Object.assign(sesi, ubah);
  await sesi.save();
}

export async function masuk(user: { id: number; role: Peran }): Promise<void> {
  const sesi = await bukaSesi();
  sesi.user_id = user.id;
  sesi.role = user.role;
  sesi.anak_aktif = null;
  sesi.mode_pendamping = false;
  sesi.pin_salah = 0;
  sesi.pin_terkunci_sampai = null;
  sesi.sesi_belajar = null;
  await sesi.save();
}

export async function keluar(): Promise<void> {
  const sesi = await bukaSesi();
  sesi.destroy();
}

// ---------- Password dan PIN ----------

// Hash pembanding untuk email yang tidak terdaftar, supaya waktu respons sama
// dan penyerang tidak bisa menebak email mana yang terdaftar dari lamanya respons.
const HASH_PEMBANDING = bcrypt.hashSync("tidak-dipakai", 10);

export async function cocokkanPassword(password: string, hash: string | null): Promise<boolean> {
  const cocok = await bcrypt.compare(password, hash ?? HASH_PEMBANDING);
  return hash !== null && cocok;
}

export type HasilCekPin = { hasil: "benar" } | { hasil: "salah"; sisa: number } | { hasil: "terkunci"; sampai: number };

// Cek PIN pendamping sekaligus menegakkan batas percobaan. Hasilnya sudah tersimpan di cookie.
export async function cekPin(pin: string, hash: string | null, sekarang = Date.now()): Promise<HasilCekPin> {
  const sesi = await bukaSesi();
  if (sesi.pin_terkunci_sampai && sesi.pin_terkunci_sampai > sekarang) {
    return { hasil: "terkunci", sampai: sesi.pin_terkunci_sampai };
  }

  const benar = hash !== null && (await bcrypt.compare(pin, hash));
  if (benar) {
    sesi.mode_pendamping = true;
    sesi.pin_salah = 0;
    sesi.pin_terkunci_sampai = null;
    await sesi.save();
    return { hasil: "benar" };
  }

  sesi.pin_salah = (sesi.pin_salah ?? 0) + 1;
  if (sesi.pin_salah >= BATAS_PIN_SALAH) {
    sesi.pin_salah = 0;
    sesi.pin_terkunci_sampai = sekarang + LAMA_KUNCI_PIN_MS;
    await sesi.save();
    return { hasil: "terkunci", sampai: sesi.pin_terkunci_sampai };
  }
  await sesi.save();
  return { hasil: "salah", sisa: BATAS_PIN_SALAH - sesi.pin_salah };
}
