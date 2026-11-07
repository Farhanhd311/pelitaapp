"use client";

// Pemilih mapel di Beranda, muncul setelah asesmen penempatan. Satu peta = satu mapel (seperti satu buku per mapel).
// Daftar mapel dari GET /api/beranda (file data materi), bukan ditulis di sini.

import { BookOpen, BookOpenText, Calculator, FlaskConical, Handshake, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import type { MapelBeranda } from "@/lib/kontrak/beranda";

// Ikon hanya hiasan; mapel yang belum terdaftar di sini otomatis memakai ikon buku.
const IKON_MAPEL: Record<string, LucideIcon> = {
  Matematika: Calculator,
  "Bahasa Indonesia": BookOpenText,
  IPAS: FlaskConical,
  "Pendidikan Pancasila": Handshake,
};

export function PilihMapel({
  daftar,
  dipilih,
  sibuk,
  onPilih,
}: {
  daftar: MapelBeranda[];
  dipilih: number;
  sibuk: boolean;
  onPilih: (mapelId: number) => void;
}) {
  return (
    // Ponsel: dua kolom supaya tidak memakan empat baris; layar lebih lebar: berjajar.
    <nav aria-label="Pilih mata pelajaran" className="order-last grid w-full min-w-0 grid-cols-2 gap-2 sm:order-none sm:flex sm:w-auto sm:flex-1 sm:flex-wrap">
      {daftar.map((m) => {
        const aktif = m.mapel_id === dipilih;
        const Ikon = IKON_MAPEL[m.nama] ?? BookOpen;
        return (
          <button
            key={m.mapel_id}
            type="button"
            aria-pressed={aktif}
            disabled={sibuk && !aktif}
            onClick={() => !aktif && onPilih(m.mapel_id)}
            className={cn(
              "flex min-h-14 cursor-pointer items-center gap-2 rounded-[20px] border-2 px-3 py-2 text-left font-heading text-[15px] leading-tight font-extrabold transition sm:rounded-full sm:px-4 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60",
              aktif
                ? "border-bata bg-bata text-white shadow-[0_4px_0_var(--color-bata-tua)]"
                : "border-garis bg-white text-teks hover:border-jingga hover:bg-pasir-muda",
            )}
          >
            <Ikon className="size-5 shrink-0" aria-hidden />
            {/* Ponsel: label "Segera" di bawah nama; layar lebih lebar: di sampingnya. */}
            <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
              {m.nama}
              {!m.bisa_belajar && <span className="rounded-full bg-pasir px-2 py-0.5 text-[11px] font-bold text-teks-2">Segera</span>}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
