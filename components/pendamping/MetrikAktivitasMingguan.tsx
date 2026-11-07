"use client";

// 4 Kartu Metrik Aktivitas Belajar & Pemulihan Minggu Ini (PRD 9.8 F-DASH-1).
// Menghargai hari istirahat sebagai bagian penting dari proses pemulihan anak.

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
      label: "Hari Aktif",
      nilai: `${mingguIni.hari_aktif} Hari`,
      keterangan: "Anak masuk & terhubung minggu ini",
      ikon: CalendarCheck,
      warnaBg: "bg-emas/20",
      warnaTeks: "text-[#B87A1E]",
      border: "border-[#E5B97F]/80",
    },
    {
      label: "Hari Istirahat",
      nilai: `${mingguIni.hari_istirahat} Hari`,
      keterangan: "Hari rehat disesuaikan kondisi fisik",
      ikon: Moon,
      warnaBg: "bg-pasir-muda",
      warnaTeks: "text-bata",
      border: "border-[#E5B97F]/80",
    },
    {
      label: "Sesi Belajar",
      nilai: `${mingguIni.sesi_belajar} Sesi`,
      keterangan: "Modul & kuis adaptif diselesaikan",
      ikon: BookOpenCheck,
      warnaBg: "bg-[#FFF4E4]",
      warnaTeks: "text-teks",
      border: "border-[#E5B97F]/80",
    },
    {
      label: "TP Baru Dikuasai",
      nilai: `${mingguIni.tp_tercapai_baru} Materi`,
      keterangan: "Tujuan Pembelajaran tercapai minggu ini",
      ikon: Award,
      warnaBg: "bg-amber-100/60",
      warnaTeks: "text-[#9E6214]",
      border: "border-[#E5B97F]/80",
    },
  ];

  return (
    <section aria-labelledby="judul-metrik-mingguan" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="judul-metrik-mingguan" className="font-heading text-base font-black text-teks">
          Aktivitas Belajar Minggu Ini
        </h2>
        <span className="text-xs font-bold text-teks-2">
          Target Fleksibel
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrik.map((m, i) => {
          const Ikon = m.ikon;
          return (
            <div
              key={i}
              className={`flex flex-col justify-between rounded-2xl border ${m.border} bg-[#FFFDF9] p-4 shadow-xs transition hover:shadow-sm`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-teks-2">{m.label}</span>
                <div className={`flex size-8 items-center justify-center rounded-xl ${m.warnaBg} ${m.warnaTeks}`}>
                  <Ikon className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-heading text-xl sm:text-2xl font-black text-teks">
                  {m.nilai}
                </span>
                <p className="mt-1 text-[11px] font-medium leading-tight text-teks-2">
                  {m.keterangan}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
