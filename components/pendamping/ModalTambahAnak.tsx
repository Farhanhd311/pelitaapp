"use client";

// Modal Tambah Profil Anak Baru untuk Pendamping (Orang Tua / Wali / Guru).
// Bahasa visual khas PELITA: rounded-2xl, palet krem-emas-bata, form terstruktur dan ramah.

import { useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { PermintaanTambahAnak, ResponsTambahAnak } from "@/lib/kontrak/pendamping";

export function ModalTambahAnak({
  buka,
  onTutup,
  onSukses,
}: {
  buka: boolean;
  onTutup: () => void;
  onSukses: (anakId: number, namaPanggilan: string) => void;
}) {
  const [namaPanggilan, setNamaPanggilan] = useState("");
  const [tglLahir, setTglLahir] = useState("2016-06-01");
  const [kelasSeharusnya, setKelasSeharusnya] = useState(3);
  const [fasePengobatan, setFasePengobatan] = useState<"intensif" | "pemeliharaan" | "pemulihan">("pemulihan");
  const [hubungan, setHubungan] = useState<"orang_tua" | "wali" | "guru">("orang_tua");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (!buka) return null;

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!namaPanggilan.trim()) {
      setGalat("Nama panggilan anak wajib diisi.");
      return;
    }

    setMemuat(true);
    setGalat(null);

    try {
      const payload: PermintaanTambahAnak = {
        nama_panggilan: namaPanggilan.trim(),
        tgl_lahir: tglLahir,
        kelas_seharusnya: Number(kelasSeharusnya),
        kelas_terakhir: Number(kelasSeharusnya),
        fase_pengobatan: fasePengobatan,
        hubungan,
      };

      const res = await panggilApi<ResponsTambahAnak>("/api/pendamping/anak", payload);
      onSukses(res.anak_id, res.nama_panggilan);
      onTutup();
    } catch (err) {
      setGalat(pesanGalat(err));
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-tambah-anak"
      className="fixed inset-0 z-50 flex items-center justify-center bg-teks/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-[24px] border-2 border-[#E5B97F] bg-[#FFFDF9] p-6 sm:p-7 shadow-2xl">
        {/* Tombol Tutup Silang */}
        <button
          type="button"
          onClick={onTutup}
          disabled={memuat}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-garis/60 text-teks-2 transition hover:bg-[#FFF4E4] hover:text-teks cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF4E4] border border-[#E5B97F] text-bata">
            <UserPlus className="size-5" />
          </div>
          <div>
            <h2 id="judul-tambah-anak" className="font-heading text-lg font-black text-teks">
              Tambah Profil Anak
            </h2>
            <p className="text-xs text-teks-2">
              Daftarkan anak binaan baru untuk pendampingan belajar.
            </p>
          </div>
        </div>

        {galat && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
            {galat}
          </div>
        )}

        {/* Form Pendaftaran */}
        <form onSubmit={kirim} className="space-y-4 text-xs">
          {/* Nama Panggilan */}
          <div>
            <label htmlFor="input-nama-anak" className="block font-bold text-teks mb-1">
              Nama Panggilan Anak <span className="text-bata">*</span>
            </label>
            <input
              id="input-nama-anak"
              type="text"
              required
              placeholder="Contoh: Raka, Alya, Budi"
              value={namaPanggilan}
              onChange={(e) => setNamaPanggilan(e.target.value)}
              className="w-full rounded-xl border border-[#E5B97F] bg-white px-3.5 py-2.5 text-sm font-semibold text-teks placeholder:text-teks-2/50 focus:border-bata focus:outline-none"
            />
          </div>

          {/* Grid Tanggal Lahir & Kelas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-tgl-lahir" className="block font-bold text-teks mb-1">
                Tanggal Lahir <span className="text-bata">*</span>
              </label>
              <input
                id="input-tgl-lahir"
                type="date"
                required
                value={tglLahir}
                onChange={(e) => setTglLahir(e.target.value)}
                className="w-full rounded-xl border border-[#E5B97F] bg-white px-3 py-2 text-xs font-semibold text-teks focus:border-bata focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="select-kelas" className="block font-bold text-teks mb-1">
                Kelas Sekolah <span className="text-bata">*</span>
              </label>
              <select
                id="select-kelas"
                value={kelasSeharusnya}
                onChange={(e) => setKelasSeharusnya(Number(e.target.value))}
                className="w-full rounded-xl border border-[#E5B97F] bg-white px-3 py-2 text-xs font-semibold text-teks focus:border-bata focus:outline-none cursor-pointer"
              >
                <option value={1}>Kelas 1 SD</option>
                <option value={2}>Kelas 2 SD</option>
                <option value={3}>Kelas 3 SD</option>
                <option value={4}>Kelas 4 SD</option>
                <option value={5}>Kelas 5 SD</option>
                <option value={6}>Kelas 6 SD</option>
              </select>
            </div>
          </div>

          {/* Hubungan Pendamping */}
          <div>
            <label htmlFor="select-hubungan" className="block font-bold text-teks mb-1">
              Hubungan dengan Anak
            </label>
            <select
              id="select-hubungan"
              value={hubungan}
              onChange={(e) => setHubungan(e.target.value as "orang_tua" | "wali" | "guru")}
              className="w-full rounded-xl border border-[#E5B97F] bg-white px-3 py-2 text-xs font-semibold text-teks focus:border-bata focus:outline-none cursor-pointer"
            >
              <option value="orang_tua">Orang Tua Kandung</option>
              <option value="wali">Wali / Keluarga</option>
              <option value="guru">Guru / Pendamping Sekolah</option>
            </select>
          </div>

          {/* Fase Pengobatan */}
          <div>
            <label htmlFor="select-fase" className="block font-bold text-teks mb-1">
              Fase Pengobatan Saat Ini
            </label>
            <select
              id="select-fase"
              value={fasePengobatan}
              onChange={(e) => setFasePengobatan(e.target.value as "intensif" | "pemeliharaan" | "pemulihan")}
              className="w-full rounded-xl border border-[#E5B97F] bg-white px-3 py-2 text-xs font-semibold text-teks focus:border-bata focus:outline-none cursor-pointer"
            >
              <option value="pemulihan">Pemulihan (Jadwal Belajar Fleksibel Normal)</option>
              <option value="pemeliharaan">Pemeliharaan (Rawat Jalan / Sesi Ringan)</option>
              <option value="intensif">Intensif (Rawat Inap / Sesi Minimal Esensial)</option>
            </select>
            <p className="mt-1 text-[11px] text-teks-2">
              Sistem akan otomatis menyesuaikan durasi dan materi sesuai fase kondisi anak.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2D7B3]">
            <button
              type="button"
              onClick={onTutup}
              disabled={memuat}
              className="rounded-xl border border-[#E5B97F] bg-white px-4 py-2 font-bold text-teks-2 transition hover:bg-[#FFF4E4] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={memuat}
              className="flex items-center gap-2 rounded-xl bg-bata px-5 py-2 font-heading font-black text-white shadow-xs transition hover:bg-bata-tua cursor-pointer disabled:opacity-50"
            >
              {memuat && <Loader2 className="size-4 animate-spin" />}
              <span>Simpan Profil Anak</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

