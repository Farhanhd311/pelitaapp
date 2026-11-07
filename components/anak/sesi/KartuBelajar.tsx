"use client";

// Kartu belajar sebelum kuis (PANDUAN 7.2: TP baru atau p < 0,40 -> diajari dulu, baru dikuis).
// Isi kartu dipilih dari KONTEN.url. Konten yang belum dibuat tim memakai tampilan cadangan
// berisi deskripsi TP, supaya alur tetap jalan.

import type { ComponentType } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";
import type { Konten } from "@/lib/kontrak/sesi";
import { KartuB3 } from "./konten/KartuB3";

// Daftar konten kartu belajar yang sudah dibuat. Menambah konten = menambah satu baris di sini.
const KONTEN_KARTU: Record<string, ComponentType> = {
  "/konten/B3-kartu-belajar": KartuB3,
};

export function KartuBelajar({
  tp,
  kartu,
  sibuk,
  onLanjut,
}: {
  tp: { tp_kode: string; deskripsi: string } | null;
  kartu: Konten | null;
  sibuk: boolean;
  onLanjut: () => void;
}) {
  const Isi = kartu?.url ? KONTEN_KARTU[kartu.url] : undefined;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-4 flex w-full max-w-3xl flex-col items-center"
      aria-label="Kartu belajar"
    >
      <p className="flex items-center gap-1.5 rounded-full bg-emas px-4 py-1.5 text-sm font-extrabold">
        <BookOpen className="size-4" aria-hidden /> Kartu belajar
      </p>

      <div className="mt-4 w-full rounded-[28px] border-2 border-garis bg-white/90 p-5 shadow-[0_8px_0_var(--color-garis)] sm:p-8">
        {Isi ? (
          <Isi />
        ) : (
          <div className="flex flex-col items-center text-center">
            <MascotPijar ekspresi="tenang" ukuran={120} />
            <h2 className="mt-2 text-[24px] leading-snug font-extrabold text-balance">{tp?.deskripsi ?? "Materi hari ini"}</h2>
            <p className="mt-2 max-w-md text-[16px] text-teks-2">Kartu bergambar untuk materi ini sedang disiapkan. Ajak pendampingmu membaca materinya bersama, ya.</p>
          </div>
        )}
      </div>

      <TombolAnak className="mt-8 w-full sm:w-auto sm:min-w-64" disabled={sibuk} onClick={onLanjut}>
        {sibuk ? "Sebentar…" : "Aku siap, mulai soal"}
      </TombolAnak>
    </motion.section>
  );
}
