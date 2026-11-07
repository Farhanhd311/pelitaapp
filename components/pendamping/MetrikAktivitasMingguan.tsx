"use client";

// 4 Kartu Metrik Aktivitas Belajar & Pemulihan Minggu Ini (PRD 9.8 F-DASH-1).
// Desain dashboard profesional PELITA: fokus pada data penting, tipografi tegas, tanpa micro-copy berlebih.

import { Award, BookOpenCheck, CalendarCheck, Moon } from "lucide-react";

export function MetrikAktivitasMingguan({
  mingguIni,
}: {
  mingguIni: {
    hari_aktif: number;
    hari_istirahat: number;
    sesi_belajar: number;
    tp_tercapai_baru: number;
  };
}) {
  const metrik = [
    {
      kategori: "Presensi",
      label: "Hari Aktif",
      angka: mingguIni.hari_aktif,
      satuan: "Hari",
      ikon: CalendarCheck,
      warnaIkon: "text-[#B87A1E]",
      warnaBgIkon: "bg-emas/25",
      tag: "Belajar Terhubung",
      warnaTag: "bg-amber-50 text-amber-900 border-amber-200/80",
    },
    {
      kategori: "Pemulihan",
      label: "Hari Istirahat",
      angka: mingguIni.hari_istirahat,
      satuan: "Hari",
      ikon: Moon,
      warnaIkon: "text-bata",
      warnaBgIkon: "bg-rose-100/60",
      tag: "Rehat Terencana",
      warnaTag: "bg-rose-50 text-rose-900 border-rose-200/80",
    },
    {
      kategori: "Aktivitas",
      label: "Sesi Belajar",
      angka: mingguIni.sesi_belajar,
      satuan: "Sesi",
      ikon: BookOpenCheck,
      warnaIkon: "text-emerald-700",
      warnaBgIkon: "bg-emerald-100/70",
      tag: "Modul & Kuis",
      warnaTag: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
    },
    {
      kategori: "Penguasaan",
      label: "TP Dikuasai",
      angka: mingguIni.tp_tercapai_baru,
      satuan: "Materi Baru",
      ikon: Award,
      warnaIkon: "text-[#9E6214]",
      warnaBgIkon: "bg-emas/35",
      tag: "Capaian Valid",
      warnaTag: "bg-amber-50 text-amber-900 border-amber-200/80",
    },
  ];

  return (
    <section aria-labelledby="judul-metrik-mingguan" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="judul-metrik-mingguan" className="font-heading text-base font-black text-teks tracking-wide">
          Aktivitas Belajar Minggu Ini
        </h2>
        <span className="rounded-full bg-[#FFF4E4] border border-[#E5B97F]/70 px-3 py-1 text-[11px] font-extrabold text-bata">
          Fleksibel Berbasis Stamina
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        {metrik.map((m, i) => {
          const Ikon = m.ikon;
          return (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-4 sm:p-5 shadow-xs transition hover:shadow-sm"
            >
              {/* Header Kartu: Label & Ikon Elegan */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teks-2">
                  {m.label}
                </span>
                <div className={`flex size-9 items-center justify-center rounded-xl border border-garis/40 ${m.warnaBgIkon} ${m.warnaIkon}`}>
                  <Ikon className="size-4.5" />
                </div>
              </div>

              {/* Angka Utama Menonjol & Satuan Bersih */}
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-heading text-3xl sm:text-4xl font-black text-teks leading-none">
                  {m.angka}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-teks-2">
                  {m.satuan}
                </span>
              </div>

              {/* Tag Status Ringkas & Profesional (Tanpa micro-copy panjang) */}
              <div className="mt-3.5 pt-3 border-t border-[#F2D7B3]/60 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${m.warnaTag}`}>
                  {m.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
