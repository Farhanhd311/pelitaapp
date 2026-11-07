"use client";

// Panel hangat di sisi kiri halaman masuk (layar lebar): Pijar, slogan, dan tiga keunggulan PELITA.
// Kilau kecil mengambang pelan; berhenti jika perangkat meminta "kurangi gerak".

import { motion, useReducedMotion } from "motion/react";
import { HeartPulse, Map, School, Star } from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";

const KEUNGGULAN = [
  { ikon: HeartPulse, teks: "Belajar menyesuaikan kondisi anak hari ini" },
  { ikon: Map, teks: "Peta belajar sesuai Kurikulum Merdeka" },
  { ikon: School, teks: "Laporan capaian untuk sekolah asal" },
];

const KILAU = [
  { kiri: "12%", atas: "16%", ukuran: 22, jeda: 0 },
  { kiri: "80%", atas: "12%", ukuran: 16, jeda: 0.8 },
  { kiri: "86%", atas: "52%", ukuran: 20, jeda: 1.6 },
  { kiri: "8%", atas: "62%", ukuran: 14, jeda: 2.2 },
];

export function PanelSambut() {
  const kurangiGerak = useReducedMotion();
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[32px] bg-pasir px-10 py-12">
      <span aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-emas/35" />
      <span aria-hidden className="absolute -bottom-28 -left-20 size-96 rounded-full bg-merah-muda/30" />
      <span aria-hidden className="absolute top-1/3 right-12 size-24 rounded-full bg-krem/60" />
      {KILAU.map((k, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute text-bata/70"
          style={{ left: k.kiri, top: k.atas }}
          animate={kurangiGerak ? undefined : { y: [0, -10, 0], opacity: [0.5, 1, 0.5], rotate: [0, 20, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: k.jeda, ease: "easeInOut" }}
        >
          <Star style={{ width: k.ukuran, height: k.ukuran }} className="fill-emas text-emas" />
        </motion.span>
      ))}

      <div className="relative flex flex-col items-center text-center">
        <MascotPijar ekspresi="sambut" ukuran={210} />
        <h2 className="mt-4 max-w-sm text-[30px] leading-tight font-black text-balance text-teks">Belajar tetap menyala, walau sedang berobat.</h2>
        <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-teks-2">
          Pelita, agar sakit tidak memadamkan cahaya belajar mereka.
        </p>
      </div>

      <ul className="relative mx-auto mt-8 flex w-full max-w-sm flex-col gap-3">
        {KEUNGGULAN.map(({ ikon: Ikon, teks }, i) => (
          <motion.li
            key={teks}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 240, damping: 24 }}
            className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 text-left text-[15px] font-bold text-teks"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bata text-white">
              <Ikon className="size-5" aria-hidden />
            </span>
            {teks}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
