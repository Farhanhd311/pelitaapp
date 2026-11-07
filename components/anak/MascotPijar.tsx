"use client";

// Maskot Pijar: mendukung 12 ekspresi gambar (/public/pijar/<ekspresi>V2.webp) serta alias ekspresi
// gerak dari PANDUAN bagian 13 (idle, senang, coba_lagi, lelah) agar kompatibel di Landing Page & Mode Anak.

import Image from "next/image";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { cn } from "cn";

export type EkspresiGambarPijar =
  | "sambut"
  | "senang"
  | "tenang"
  | "penasaran"
  | "semangat"
  | "terkejut"
  | "empati"
  | "tekad"
  | "istirahat"
  | "mengintip"
  | "peduli"
  | "transisi";

export type GerakPijar = "idle" | "senang" | "coba_lagi" | "lelah";

export type EkspresiPijar = EkspresiGambarPijar | GerakPijar;

export type UkuranPijar = number | "sm" | "md" | "lg" | "xl";

const DIMENSI_MAP: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 44,
  md: 68,
  lg: 104,
  xl: 148,
};

const GERAK: Record<GerakPijar, TargetAndTransition> = {
  idle: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  senang: { y: [0, -18, 0, -8, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 1.4 } },
  // PENTING sesuai PANDUAN_PROYEK.md: hanya miring lembut, BUKAN menggeleng kiri-kanan
  coba_lagi: { rotate: [0, -6, 0], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  lelah: { y: [0, 6, 0], scale: [1, 0.98, 1], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
};

function petakanGambar(ekspresi: EkspresiPijar): EkspresiGambarPijar {
  switch (ekspresi) {
    case "idle":
      return "sambut";
    case "coba_lagi":
      return "empati";
    case "lelah":
      return "istirahat";
    default:
      return ekspresi;
  }
}

function petakanGerakDefault(ekspresi: EkspresiPijar): GerakPijar {
  switch (ekspresi) {
    case "senang":
    case "semangat":
      return "senang";
    case "coba_lagi":
    case "empati":
      return "coba_lagi";
    case "lelah":
    case "istirahat":
      return "lelah";
    default:
      return "idle";
  }
}

export function MascotPijar({
  ekspresi = "sambut",
  gerak,
  ukuran = 160,
  className,
}: {
  ekspresi?: EkspresiPijar;
  gerak?: GerakPijar;
  ukuran?: UkuranPijar;
  className?: string;
}) {
  const kurangiGerak = useReducedMotion();
  const px = typeof ukuran === "number" ? ukuran : DIMENSI_MAP[ukuran];
  const namaGambar = petakanGambar(ekspresi);
  const gerakAktif = gerak ?? petakanGerakDefault(ekspresi);

  return (
    <motion.div
      className={cn("relative shrink-0 inline-flex items-center justify-center select-none", className)}
      style={{ width: px, height: px }}
      animate={kurangiGerak ? undefined : GERAK[gerakAktif]}
      aria-label={`Maskot Pijar (${ekspresi})`}
    >
      <Image
        src={`/pijar/${namaGambar}V2.webp`}
        alt="Pijar, teman belajarmu"
        fill
        sizes={`${px}px`}
        className="object-contain"
        priority
      />
    </motion.div>
  );
}
