// Penjaga hak akses di server (PANDUAN 4). MySQL tidak punya Row Level Security, jadi INILAH satu-satunya
// pengaman: setiap API route yang menyentuh data anak WAJIB memanggil salah satu fungsi di bawah.
// Menyembunyikan tombol di UI saja tidak cukup, karena URL API bisa dipanggil langsung.
//
// Setiap fungsi melempar GalatApi (401/403) jika tidak berhak, dan mengembalikan data yang dibutuhkan jika berhak.

import { GalatApi } from "@/lib/api/respons";
import { ambilSesi, modeSesi, type DataSesi } from "@/lib/auth/sesi";
import { query } from "@/lib/db";
import { catatAktivitas } from "@/lib/log";

export type Hubungan = "orang_tua" | "wali" | "guru";

export async function wajibLogin(): Promise<DataSesi> {
  const sesi = await ambilSesi();
  if (!sesi) throw new GalatApi("BELUM_LOGIN", "Silakan masuk dulu.");
  return sesi;
}

export async function wajibAdmin(): Promise<DataSesi> {
  const sesi = await wajibLogin();
  if (sesi.role !== "admin") throw new GalatApi("TIDAK_BERHAK", "Halaman ini khusus admin.");
  return sesi;
}

// Untuk route yang dipakai anak (check-in, asesmen, sesi belajar, Teman Cerita).
// anak_id diambil dari sesi, TIDAK dari body, jadi anak tidak bisa memakai data anak lain.
export async function wajibModeAnak(): Promise<{ sesi: DataSesi; anak_id: number }> {
  const sesi = await wajibLogin();
  if (modeSesi(sesi) !== "anak" || sesi.anak_aktif === null) {
    throw new GalatApi("TIDAK_BERHAK", "Pilih profil anak dulu.");
  }
  return { sesi, anak_id: sesi.anak_aktif };
}

// Untuk route dashboard/keputusan pendamping: harus sudah memasukkan PIN pendamping.
export async function wajibModePendamping(): Promise<DataSesi> {
  const sesi = await wajibLogin();
  if (modeSesi(sesi) !== "pendamping") {
    throw new GalatApi("TIDAK_BERHAK", "Masukkan PIN pendamping dulu.");
  }
  return sesi;
}

// Hubungan pendamping dengan anak dari tabel PENDAMPINGAN, atau null jika tidak terhubung.
export async function ambilHubungan(pendampingId: number, anakId: number): Promise<Hubungan | null> {
  const baris = await query<{ hubungan: Hubungan }[]>(
    "SELECT hubungan FROM pendampingan WHERE pendamping_id = ? AND anak_id = ?",
    [pendampingId, anakId],
  );
  return baris[0]?.hubungan ?? null;
}

// Pendamping hanya boleh mengakses anak yang ia dampingi. Akses guru dicatat di log (PANDUAN 8.7).
// Admin tidak lewat fungsi ini: admin hanya melihat agregat (lihat matriks akses PANDUAN 4).
export async function wajibAksesAnak(sesi: DataSesi, anakId: number, data: string): Promise<Hubungan> {
  if (sesi.role !== "pendamping") throw new GalatApi("TIDAK_BERHAK", "Tidak berhak mengakses data anak ini.");
  const hubungan = await ambilHubungan(sesi.user_id, anakId);
  if (!hubungan) throw new GalatApi("TIDAK_BERHAK", "Tidak berhak mengakses data anak ini.");
  if (hubungan === "guru") {
    await catatAktivitas({
      user_id: sesi.user_id,
      jenis_tindakan: "akses_data_anak",
      entitas: "anak",
      entitas_id: anakId,
      detail: { data },
    });
  }
  return hubungan;
}

// Aksi khusus orang tua/wali: setujui rujukan, hapus data, reset progres, ubah profil (PANDUAN 4).
export async function wajibOrangTuaAtauWali(sesi: DataSesi, anakId: number, data: string): Promise<Hubungan> {
  const hubungan = await wajibAksesAnak(sesi, anakId, data);
  if (hubungan !== "orang_tua" && hubungan !== "wali") {
    throw new GalatApi("TIDAK_BERHAK", "Keputusan ini hanya bisa diambil orang tua atau wali.");
  }
  return hubungan;
}
