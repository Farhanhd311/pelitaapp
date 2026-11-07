"use client";

// Visualisasi Tren Check-in Kesehatan 28 Hari (PRD 9.8 F-DASH-1).
// Menampilkan riwayat energi, cuaca hati (emosi), dan keluhan fisik harian.
// Membantu orang tua dan dokter melihat pola kelelahan pasca pengobatan.

import { useState } from "react";
import { Activity, CloudRain, CloudSun, Heart, Sparkles, Sun, Zap } from "lucide-react";

type ItemCheckin = {
  tanggal: string;
  energi: string;
  cuaca_hati: string;
  keluhan: string[];
};

const LABEL_CUACA: Record<string, { ikon: string; label: string }> = {
  cerah: { ikon: "☀️", label: "Cerah" },
  berawan: { ikon: "⛅", label: "Berawan" },
  hujan: { ikon: "🌧️", label: "Hujan" },
  badai: { ikon: "⛈️", label: "Badai" },
};

const LABEL_ENERGI: Record<string, { label: string; warna: string; barTinggi: string }> = {
  semangat: { label: "Semangat", warna: "bg-emerald-400 text-emerald-950", barTinggi: "h-20" },
  lumayan: { label: "Lumayan", warna: "bg-amber-400 text-amber-950", barTinggi: "h-14" },
  lemas: { label: "Lemas", warna: "bg-[#E79CA2] text-[#5A1C22]", barTinggi: "h-8" },
};

export function GrafikTrenCheckin({ riwayat }: { riwayat: ItemCheckin[] }) {
  const [hariTerpilih, setHariTerpilih] = useState<ItemCheckin | null>(
    riwayat.length > 0 ? riwayat[riwayat.length - 1] : null,
  );

  if (riwayat.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5B97F]/60 bg-white p-6 text-center shadow-xs">
        <p className="text-sm font-bold text-teks-2">
          Belum ada riwayat check-in kesehatan yang tercatat.
        </p>
      </div>
    );
  }

  // Hitung ringkasan statistik 28 hari
  const totalLemas = riwayat.filter((r) => r.energi === "lemas").length;
  const totalSemangat = riwayat.filter((r) => r.energi === "semangat").length;
  const totalLumayan = riwayat.filter((r) => r.energi === "lumayan").length;

  return (
    <section aria-labelledby="judul-tren-checkin" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-bata" />
            <h2 id="judul-tren-checkin" className="font-heading text-base font-black text-teks">
              Tren Kesehatan & Emosi (28 Hari Terakhir)
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-teks-2">
            Pola kelelahan dan kondisi emosional anak dari check-in harian.
          </p>
        </div>

        {/* Badge Distribusi Energi */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="rounded-lg bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-emerald-800">
            {totalSemangat} Semangat
          </span>
          <span className="rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-amber-800">
            {totalLumayan} Lumayan
          </span>
          <span className="rounded-lg bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-rose-800">
            {totalLemas} Lemas
          </span>
        </div>
      </div>

      {/* Kontainer Grafik Bar Visual */}
      <div className="rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-4 sm:p-5 shadow-xs">
        {/* Visualisasi Bar Chart Tanggal & Level Energi */}
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[560px] items-end justify-between gap-1.5 h-32 pt-4 px-2 border-b border-[#F2D7B3]">
            {riwayat.map((item, idx) => {
              const cfg = LABEL_ENERGI[item.energi] ?? LABEL_ENERGI.lumayan;
              const cuaca = LABEL_CUACA[item.cuaca_hati] ?? { ikon: "☀️", label: item.cuaca_hati };
              const isSelected = hariTerpilih?.tanggal === item.tanggal;
              const tglObj = new Date(item.tanggal);
              const tglFormat = tglObj.getDate();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHariTerpilih(item)}
                  title={`${item.tanggal}: ${cfg.label}, Cuaca ${cuaca.label}`}
                  className="group flex flex-1 flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  {/* Emoji Cuaca Hati di Atas Bar */}
                  <span className="text-xs transition group-hover:scale-125">
                    {cuaca.ikon}
                  </span>

                  {/* Batang Energi */}
                  <div
                    className={`w-full max-w-[18px] rounded-t-lg transition-all duration-300 ${
                      cfg.barTinggi
                    } ${
                      isSelected
                        ? "ring-2 ring-bata scale-105 " + (item.energi === "lemas" ? "bg-bata" : cfg.warna)
                        : cfg.warna + " opacity-85 group-hover:opacity-100"
                    }`}
                  />

                  {/* Label Tanggal */}
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? "text-bata font-black" : "text-teks-2"
                    }`}
                  >
                    {tglFormat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Hari yang Dipilih */}
        {hariTerpilih && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FFF4E4] border border-[#E5B97F]/60 p-3.5 text-xs text-teks">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {LABEL_CUACA[hariTerpilih.cuaca_hati]?.ikon ?? "☀️"}
              </span>
              <div>
                <span className="font-extrabold text-sm block">
                  {new Date(hariTerpilih.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-teks-2">
                  Energi: <strong>{LABEL_ENERGI[hariTerpilih.energi]?.label}</strong> · Cuaca Hati: <strong>{LABEL_CUACA[hariTerpilih.cuaca_hati]?.label}</strong>
                </span>
              </div>
            </div>

            {/* Keluhan jika ada */}
            <div className="flex items-center gap-1.5">
              <span className="text-teks-2 font-bold">Keluhan:</span>
              {hariTerpilih.keluhan && hariTerpilih.keluhan.length > 0 ? (
                hariTerpilih.keluhan.map((k, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[11px] font-bold text-rose-800 capitalize"
                  >
                    {k.replace("_", " ")}
                  </span>
                ))
              ) : (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tidak ada keluhan
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
