"use client";

// Panel ilustrasi bersih di sisi kanan kartu masuk (layar lebar):
// Menampilkan maskot Pijar dengan ukuran proporsional seperti semula
// dan 3 daftar keunggulan PELITA di bagian bawah (tanpa teks slogan).

import { motion, useReducedMotion } from "motion/react";
import { HeartPulse, Map, School } from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { BintangKilau } from "@/components/landing/InteraktifLanding";

const KEUNGGULAN = [
  { ikon: HeartPulse, teks: "Belajar menyesuaikan kondisi anak hari ini" },
  { ikon: Map, teks: "Peta belajar sesuai Kurikulum Merdeka" },
  { ikon: School, teks: "Laporan capaian untuk sekolah asal" },
];

export function PanelSambut() {
  const kurangiGerak = useReducedMotion();

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#F7D7AD] pl-14 pr-10 py-10">
      {/* Latar Ilustrasi Langit PELITA yang Bersih & Minimalis */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none z-0">
        <img
          src="/dekorasi/bg-langit-pelita.webp"
          alt=""
          className="h-full w-full object-cover object-center opacity-80"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 52% 42%, rgba(255,248,235,0.68) 0%, rgba(246,204,148,0.45) 60%, rgba(234,123,48,0.18) 100%)",
          }}
        />

        {/* 1 Awan Halus di Kanan Atas & 1 Awan Cakrawala Lembut di Bawah */}
        <motion.img
          src="/dekorasi/awan-3.webp"
          alt=""
          animate={kurangiGerak ? undefined : { x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 -right-6 w-52 opacity-55"
        />
        <img
          src="/dekorasi/awan-13.webp"
          alt=""
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[640px] max-w-none opacity-40"
        />

        {/* 2 Bintang Kecil sebagai Aksen Lembut */}
        <BintangKilau
          varian={2}
          ukuran={30}
          delay={0.2}
          className="absolute top-12 right-[18%]"
        />
        <BintangKilau
          varian={3}
          ukuran={24}
          delay={1.1}
          className="absolute top-[36%] left-[16%]"
        />
      </div>

      {/* Bagian Tengah: Maskot Pijar & 3 Daftar Keunggulan PELITA Dinaikkan Lebih Proporsional */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute size-48 rounded-full bg-[#FFFDF9]/70 blur-2xl"
          />
          <MascotPijar
            ekspresi="sambut"
            gerak="idle"
            ukuran={180}
            className="relative drop-shadow-[0_14px_28px_rgba(74,21,32,0.15)]"
          />
        </div>

        <ul className="mx-auto mt-7 flex w-full max-w-sm flex-col gap-3">
          {KEUNGGULAN.map(({ ikon: Ikon, teks }, i) => (
            <motion.li
              key={teks}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.2 + i * 0.1,
                type: "spring",
                stiffness: 240,
                damping: 24,
              }}
              className="flex items-center gap-3 rounded-2xl bg-[#FFFDF9]/90 backdrop-blur-xs border border-[#E5B97F]/75 px-4 py-3 text-left text-[14px] font-bold text-teks shadow-[0_8px_20px_rgba(74,21,32,0.06)]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bata text-white">
                <Ikon className="size-4" aria-hidden />
              </span>
              {teks}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
