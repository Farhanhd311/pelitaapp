"use client";

// Pengaturan Cepat Konteks Kesehatan Anak (PRD 5.3 & PRD 9.8).
// Hanya orang tua/wali yang dapat mengubah (bisa_mengubah); guru pendamping hanya melihat.
// Tidak menyimpan diagnosis atau data obat medis (PANDUAN 12).

import { useState } from "react";
import { Check, Clock, HeartHandshake, PauseCircle, ShieldAlert, Sparkles } from "lucide-react";
import { panggilApi, pesanGalat } from "@/lib/api/klien";

type DataAnak = {
  anak_id: number;
  nama_panggilan: string;
  fase_pengobatan: string;
  mode_jeda: boolean;
  batas_layar_menit: number | null;
};

export function PengaturanKesehatanAnak({
  anak,
  bisaMengubah,
  onDiperbarui,
}: {
  anak: DataAnak;
  bisaMengubah: boolean;
  onDiperbarui?: () => void;
}) {
  const [modeJeda, setModeJeda] = useState(anak.mode_jeda);
  const [fase, setFase] = useState(anak.fase_pengobatan);
  const [batasLayar, setBatasLayar] = useState<number | null>(anak.batas_layar_menit);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan() {
    if (!bisaMengubah || menyimpan) return;
    setMenyimpan(true);
    setPesan(null);
    setGalat(null);

    try {
      await panggilApi("/api/pendamping/anak", {
        anak_id: anak.anak_id,
        mode_jeda: modeJeda,
        fase_pengobatan: fase,
        batas_layar_menit: batasLayar,
      });
      setPesan("Pengaturan berhasil disimpan.");
      onDiperbarui?.();
      setTimeout(() => setPesan(null), 4000);
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <section aria-labelledby="judul-pengaturan-kesehatan" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="size-5 text-bata" />
          <h2 id="judul-pengaturan-kesehatan" className="font-heading text-base font-black text-teks">
            Konteks Kesehatan & Pendampingan
          </h2>
        </div>
        {!bisaMengubah && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-teks-2">
            <ShieldAlert className="size-3.5 text-emas" />
            <span>Hanya Lihat (Guru)</span>
          </span>
        )}
      </div>

      <div className="rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-4 sm:p-5 shadow-xs space-y-4">
        {pesan && (
          <p role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800">
            {pesan}
          </p>
        )}
        {galat && (
          <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-800">
            {galat}
          </p>
        )}

        {/* 1. Mode Jeda Belajar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2D7B3]/70 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <PauseCircle className="size-4 text-bata" />
              <span className="font-heading text-sm font-extrabold text-teks">
                Mode Jeda Belajar
              </span>
              {modeJeda && (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                  Aktif
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-teks-2 leading-relaxed">
              Menjeda target belajar saat anak menjalani operasi, rawat inap, atau terapi berat.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              disabled={!bisaMengubah}
              checked={modeJeda}
              onChange={(e) => setModeJeda(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bata"></div>
          </label>
        </div>

        {/* 2. Fase Pengobatan Anak */}
        <div className="space-y-1.5 border-b border-[#F2D7B3]/70 pb-3.5">
          <label className="block font-heading text-xs font-extrabold uppercase tracking-wider text-teks">
            Fase Pengobatan Saat Ini
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "intensif", label: "Intensif", ket: "Fokus materi esensial" },
              { id: "pemeliharaan", label: "Pemeliharaan", ket: "Kondisi stabil & rutin" },
              { id: "pemulihan", label: "Pemulihan", ket: "Persiapan sekolah asal" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={!bisaMengubah}
                onClick={() => setFase(f.id)}
                className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                  fase === f.id
                    ? "border-bata bg-[#FFF4E4] text-bata font-black shadow-xs"
                    : "border-garis bg-white text-teks hover:bg-[#FCEBD4]/40"
                } ${!bisaMengubah ? "opacity-75 cursor-default" : ""}`}
              >
                <span className="block text-xs font-extrabold">{f.label}</span>
                <span className="block text-[10px] text-teks-2">{f.ket}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Batas Waktu Layar Harian */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs font-extrabold uppercase tracking-wider text-teks">
              Batas Waktu Layar Belajar
            </label>
            <span className="text-xs font-bold text-bata">
              {batasLayar ? `${batasLayar} Menit / Hari` : "Tidak Dibatasi"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { menit: 15, label: "15 mnt" },
              { menit: 30, label: "30 mnt" },
              { menit: 45, label: "45 mnt" },
              { menit: 60, label: "60 mnt" },
              { menit: null, label: "Bebas" },
            ].map((b, i) => (
              <button
                key={i}
                type="button"
                disabled={!bisaMengubah}
                onClick={() => setBatasLayar(b.menit)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  batasLayar === b.menit
                    ? "border-bata bg-bata text-white"
                    : "border-garis bg-white text-teks hover:bg-[#FCEBD4]/50"
                } ${!bisaMengubah ? "opacity-75 cursor-default" : ""}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Simpan Perubahan */}
        {bisaMengubah && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={menyimpan}
              onClick={simpan}
              className="flex items-center gap-1.5 rounded-xl bg-bata px-5 py-2.5 font-heading text-xs font-extrabold text-white shadow-sm transition hover:bg-bata-tua disabled:opacity-50 cursor-pointer"
            >
              <Check className="size-4" />
              <span>{menyimpan ? "Menyimpan…" : "Simpan Pengaturan"}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
