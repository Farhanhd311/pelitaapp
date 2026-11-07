"use client";

// Konten kartu belajar TP B3 (perkalian sebagai penjumlahan berulang), alamat KONTEN.url "/konten/B3-kartu-belajar".
// Anak menambah kelompok satu per satu dan melihat jumlahnya bertambah: 7, 14, 21, ... sampai 6 × 7 = 42.
// Contoh 6 × 7 sengaja sama dengan soal demo B3-D3, supaya penjelasan AI tutor nanti terasa nyambung.

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, RotateCcw } from "lucide-react";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";

const KELOMPOK = 6;
const ISI = 7;

export function KartuB3() {
  const [jumlahKelompok, setJumlahKelompok] = useState(1);
  const tuntas = jumlahKelompok === KELOMPOK;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-[26px] leading-tight font-extrabold text-balance sm:text-[30px]">Perkalian itu penjumlahan berulang</h2>
      <p className="mt-2 max-w-lg text-[17px] leading-relaxed text-teks-2">
        <b className="text-teks">
          {KELOMPOK} × {ISI}
        </b>{" "}
        artinya ada <b className="text-teks">{KELOMPOK} kelompok</b>, dan setiap kelompok berisi <b className="text-teks">{ISI}</b>.
      </p>

      <div className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3" aria-label={`${jumlahKelompok} kelompok berisi ${ISI}`}>
        <AnimatePresence initial={false}>
          {Array.from({ length: jumlahKelompok }, (_, k) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex flex-wrap justify-center gap-1.5 rounded-[18px] border-2 border-jingga/40 bg-pasir-muda p-3"
            >
              {Array.from({ length: ISI }, (_, i) => (
                <span key={i} className="size-5 rounded-full bg-emas shadow-[inset_0_-3px_0_#c98a35]" />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-6 font-heading text-[22px] font-extrabold break-words text-bata sm:text-[26px]" aria-live="polite">
        {Array.from({ length: jumlahKelompok }, () => ISI).join(" + ")} = {jumlahKelompok * ISI}
      </p>
      {tuntas && (
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-full bg-emas/30 px-5 py-2 text-[18px] font-extrabold">
          Jadi, {KELOMPOK} × {ISI} = {KELOMPOK * ISI}
        </motion.p>
      )}

      <div className="mt-5">
        {tuntas ? (
          <TombolAnak varian="lembut" onClick={() => setJumlahKelompok(1)}>
            <RotateCcw className="size-5" aria-hidden /> Ulangi dari awal
          </TombolAnak>
        ) : (
          <TombolAnak varian="kedua" onClick={() => setJumlahKelompok((n) => n + 1)}>
            <Plus className="size-5 text-bata" aria-hidden /> Tambah satu kelompok
          </TombolAnak>
        )}
      </div>
    </div>
  );
}
