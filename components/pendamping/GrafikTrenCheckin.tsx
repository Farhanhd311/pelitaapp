"use client";

// Visualisasi Tren Kesehatan & Emosi (28 Hari Terakhir) - PRD 9.8 F-DASH-1.
// Desain chart analitik klinis & pedagogis profesional berbasis Recharts.
// Bebas icon/emoji: visualisasi garis & area continu, grid presisi, dan pelaporan parameter medis-edukasi.

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Dot,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ItemCheckin = {
  tanggal: string;
  energi: string;
  cuaca_hati: string;
  keluhan: string[];
};

type TitikGrafik = {
  tanggal: string;
  tglLabel: string;
  tglLengkap: string;
  hariNama: string;
  staminaScore: number;
  staminaLabel: string;
  emosiScore: number;
  emosiLabel: string;
  adaKeluhan: boolean;
  keluhanList: string[];
  rekomendasi: string;
};

const LABEL_KELUHAN: Record<string, string> = {
  mual: "Mual",
  pusing: "Pusing",
  mata_lelah: "Kelelahan Mata",
  lemas: "Kelesuan Fisik",
  nyeri: "Nyeri Badan",
  demam: "Peningkatan Suhu Tubuh",
};

function formatItemCheckin(item: ItemCheckin): TitikGrafik {
  const tglObj = new Date(item.tanggal);
  const tglLabel = `${tglObj.getDate()}/${tglObj.getMonth() + 1}`;
  const tglLengkap = tglObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hariNama = tglObj.toLocaleDateString("id-ID", { weekday: "short" });

  // Parameter Stamina (Skala 1 - 3)
  let staminaScore = 2;
  let staminaLabel = "Stamina Cukup";
  let rekomendasi = "Stamina stabil: sesi dianjurkan mengutamakan penguatan materi.";
  if (item.energi === "semangat") {
    staminaScore = 3;
    staminaLabel = "Stamina Prima";
    rekomendasi = "Kondisi fisik optimal: disarankan untuk materi baru dan tantangan belajar.";
  } else if (item.energi === "lemas") {
    staminaScore = 1;
    staminaLabel = "Stamina Rendah";
    rekomendasi = "Kondisi fisik menurun: disarankan istirahat penuh atau audio ringan.";
  }

  // Parameter Kesejahteraan Emosi (Skala 1 - 3)
  let emosiScore = 3;
  let emosiLabel = "Stabil & Kondusif";
  if (item.cuaca_hati === "berawan") {
    emosiScore = 2;
    emosiLabel = "Fluktuatif / Ragu";
  } else if (item.cuaca_hati === "hujan") {
    emosiScore = 1.3;
    emosiLabel = "Gelisah / Kelelahan Mental";
  } else if (item.cuaca_hati === "badai") {
    emosiScore = 0.8;
    emosiLabel = "Sangat Tertekan";
  }

  const keluhanList = (item.keluhan ?? []).map((k) => LABEL_KELUHAN[k] ?? k);

  return {
    tanggal: item.tanggal,
    tglLabel,
    tglLengkap,
    hariNama,
    staminaScore,
    staminaLabel,
    emosiScore,
    emosiLabel,
    adaKeluhan: keluhanList.length > 0,
    keluhanList,
    rekomendasi,
  };
}

// Custom Tooltip Profesional (Tanpa Icon / Emoji)
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TitikGrafik }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-xl border-2 border-[#E5B97F] bg-white p-3.5 shadow-xl text-xs min-w-[240px] space-y-2 pointer-events-none">
      <div className="border-b border-[#F2D7B3] pb-1.5">
        <p className="font-heading font-extrabold text-teks text-[13px]">{d.tglLengkap}</p>
        <span className="text-[10px] uppercase font-bold text-teks-2 tracking-wider">Rekam Observasi Harian</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-teks-2 font-bold flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-bata" />
            Stamina Fisik:
          </span>
          <strong className="text-teks">{d.staminaLabel}</strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-teks-2 font-bold flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-indigo-600" />
            Kondisi Emosional:
          </span>
          <strong className="text-teks">{d.emosiLabel}</strong>
        </div>

        <div className="pt-1 border-t border-stone-100">
          <span className="text-teks-2 font-bold block mb-0.5">Keluhan Fisik:</span>
          {d.adaKeluhan ? (
            <p className="text-rose-800 font-extrabold">{d.keluhanList.join(", ")}</p>
          ) : (
            <p className="text-emerald-800 font-semibold">Tidak ada keluhan dilaporkan</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function GrafikTrenCheckin({ riwayat }: { riwayat: ItemCheckin[] }) {
  const [sudahSiap, setSudahSiap] = useState(false);
  const [titikTerpilih, setTitikTerpilih] = useState<TitikGrafik | null>(null);

  useEffect(() => {
    setSudahSiap(true);
  }, []);

  const dataGrafik: TitikGrafik[] = riwayat.map(formatItemCheckin);

  useEffect(() => {
    if (dataGrafik.length > 0 && !titikTerpilih) {
      setTitikTerpilih(dataGrafik[dataGrafik.length - 1]);
    }
  }, [dataGrafik, titikTerpilih]);

  if (riwayat.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-8 text-center shadow-xs">
        <h3 className="font-heading text-sm font-extrabold text-teks uppercase tracking-wide">
          Data Pemantauan 28 Hari Belum Tersedia
        </h3>
        <p className="mt-1 text-xs text-teks-2">
          Kurva tren stamina dan stabilitas emosional akan terbentuk secara otomatis setelah anak melakukan check-in berkala.
        </p>
      </div>
    );
  }

  // Perhitungan Parameter Agregat Profesional
  const totalHari = riwayat.length;
  const countPrima = riwayat.filter((r) => r.energi === "semangat").length;
  const countCukup = riwayat.filter((r) => r.energi === "lumayan").length;
  const countRendah = riwayat.filter((r) => r.energi === "lemas").length;
  const countKeluhan = riwayat.filter((r) => r.keluhan && r.keluhan.length > 0).length;

  const rasioKesiapan = Math.round(((countPrima * 1 + countCukup * 0.7) / Math.max(1, totalHari)) * 100);
  const countEmosiStabil = riwayat.filter((r) => r.cuaca_hati === "cerah").length;
  const rasioEmosiStabil = Math.round((countEmosiStabil / Math.max(1, totalHari)) * 100);

  return (
    <section aria-labelledby="judul-tren-checkin" className="space-y-4">
      {/* Header Analisis & Ringkasan Metrik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="judul-tren-checkin" className="font-heading text-base font-black text-teks tracking-wide uppercase">
            Tren Kesehatan & Kesejahteraan Emosional (28 Hari)
          </h2>
          <p className="mt-0.5 text-xs text-teks-2">
            Analisis longitudinal parameter kesiapan fisik, stabilitas afektif, dan laporan keluhan klinis anak.
          </p>
        </div>

        {/* Ringkasan Parameter Eksekutif */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded-xl border border-[#E5B97F]/80 bg-[#FFF4E4] px-3 py-1 font-bold text-teks">
            <span className="text-teks-2 mr-1">Indeks Kesiapan:</span>
            <strong className="text-bata font-black">{rasioKesiapan}%</strong>
          </div>
          <div className="rounded-xl border border-[#E5B97F]/80 bg-white px-3 py-1 font-bold text-teks">
            <span className="text-teks-2 mr-1">Stabilitas Emosi:</span>
            <strong className="text-indigo-800 font-black">{rasioEmosiStabil}%</strong>
          </div>
          <div className="rounded-xl border border-garis/60 bg-white px-3 py-1 font-bold text-teks-2">
            <span>{countKeluhan} Hari Berkeluhan</span>
          </div>
        </div>
      </div>

      {/* Kontainer Grafik Utama */}
      <div className="rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-4 sm:p-6 shadow-xs space-y-4">
        {/* Legenda & Status Distribusi (Bebas Icon) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2D7B3]/80 pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-xs bg-bata" />
              <span className="font-extrabold text-teks">Stamina Fisik</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-5 border-t-2 border-dashed border-indigo-600" />
              <span className="font-extrabold text-teks">Kesejahteraan Emosional</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-teks-2 text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Prima: {countPrima}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              Cukup: {countCukup}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              Rendah: {countRendah}
            </span>
          </div>
        </div>

        {/* Visualisasi Kurva Recharts */}
        <div className="w-full h-[280px] pt-2">
          {sudahSiap ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dataGrafik}
                margin={{ top: 12, right: 12, left: -18, bottom: 4 }}
                onClick={(e: unknown) => {
                  const ev = e as { activePayload?: Array<{ payload: TitikGrafik }> } | null;
                  if (ev?.activePayload?.[0]?.payload) {
                    setTitikTerpilih(ev.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  {/* Gradien Halus Kurva Stamina */}
                  <linearGradient id="gradienStamina" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BF4338" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#BF4338" stopOpacity={0.02} />
                  </linearGradient>
                  {/* Gradien Halus Kurva Emosi */}
                  <linearGradient id="gradienEmosi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2D7B3" opacity={0.65} />

                <XAxis
                  dataKey="tglLabel"
                  stroke="#8C7A6B"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: "#E5B97F" }}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />

                <YAxis
                  domain={[0.5, 3.5]}
                  ticks={[1, 2, 3]}
                  stroke="#8C7A6B"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: number) => {
                    if (val === 3) return "Tinggi";
                    if (val === 2) return "Sedang";
                    if (val === 1) return "Rendah";
                    return "";
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Garis Pembatas Level Sedang */}
                <ReferenceLine y={2} stroke="#E5B97F" strokeDasharray="2 2" opacity={0.5} />

                {/* Area Kurva Stamina */}
                <Area
                  type="monotone"
                  dataKey="staminaScore"
                  name="Stamina Fisik"
                  stroke="#BF4338"
                  strokeWidth={2.5}
                  fill="url(#gradienStamina)"
                  activeDot={{ r: 6, fill: "#BF4338", stroke: "#FFFFFF", strokeWidth: 2 }}
                />

                {/* Garis Kurva Emosi */}
                <Line
                  type="monotone"
                  dataKey="emosiScore"
                  name="Kesejahteraan Emosi"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#FFFFFF", stroke: "#4F46E5", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#4F46E5", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-teks-2">
              Memuat visualisasi grafik…
            </div>
          )}
        </div>

        {/* Panel Detail Inspeksi Tanggal (Bebas Icon / Emoji) */}
        {titikTerpilih && (
          <div className="rounded-xl border border-[#E5B97F] bg-[#FFF8EE] p-4 text-xs transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2D7B3]/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-teks-2 tracking-wider">
                  Inspeksi Catatan Harian
                </span>
                <h3 className="font-heading text-sm font-black text-teks mt-0.5">
                  {titikTerpilih.tglLengkap}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-white border border-[#E5B97F] px-3 py-1 font-bold text-teks">
                  Stamina: <strong className="text-bata">{titikTerpilih.staminaLabel}</strong>
                </span>
                <span className="rounded-lg bg-white border border-[#E5B97F] px-3 py-1 font-bold text-teks">
                  Emosi: <strong className="text-indigo-800">{titikTerpilih.emosiLabel}</strong>
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-teks-2 font-bold block mb-1">Status Keluhan Fisik:</span>
                {titikTerpilih.adaKeluhan ? (
                  <div className="flex flex-wrap gap-1.5">
                    {titikTerpilih.keluhanList.map((k, i) => (
                      <span
                        key={i}
                        className="inline-block rounded-md border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-800"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-900 font-bold text-[11px]">
                    Kondisi fisik nyaman, tidak ada gejala atau keluhan fisik yang dicatat.
                  </p>
                )}
              </div>

              <div>
                <span className="text-teks-2 font-bold block mb-1">Rekomendasi Penyelenggaraan Belajar:</span>
                <p className="text-teks-2 leading-relaxed text-[11px]">
                  {titikTerpilih.rekomendasi}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
