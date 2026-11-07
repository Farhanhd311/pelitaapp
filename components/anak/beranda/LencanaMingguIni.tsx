// Penanda kecil "hari aktif minggu ini" di pojok kanan atas Beranda (menempel, tetap terlihat saat peta digulir).
// BUKAN streak harian yang bisa putus (PANDUAN 7.1 dan 13): dihitung per minggu dari check-in, hari istirahat
// yang dilaporkan lewat check-in tetap dihitung aktif, dan hitungan mulai lagi setiap Senin.

import { Flame } from "lucide-react";

export function LencanaMingguIni({ hari }: { hari: number }) {
  return (
    <div
      role="img"
      aria-label={`${hari} hari aktif minggu ini`}
      title="Hari aktif minggu ini"
      className="flex min-h-14 shrink-0 items-center gap-2 rounded-full border border-garis bg-white p-1.5 pr-4"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-emas/30 text-bata">
        <Flame className="size-6" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-[20px] font-extrabold text-teks">{hari}</span>
        {/* ponsel: angka saja supaya judul petualangan tetap lega */}
        <span className="hidden text-[11px] font-semibold text-teks-2 sm:block">hari minggu ini</span>
      </span>
    </div>
  );
}
