"use client";

// Maskot Pijar: 12 ekspresi (gambar di /public/pijar/<ekspresi>V2.webp) + 4 gerak dari PANDUAN bagian 13.
// Gerak dibuat lewat `motion`: idle (mengambang), senang (melompat), coba_lagi (miring lembut,
// BUKAN menggeleng), lelah (turun pelan). Ekspresi "tekad" (wajah marah) jangan dipakai saat
// anak keliru menjawab atau sedang sedih.

import Image from "next/image";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { cn } from "cn";

export type EkspresiPijar =
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

const GERAK: Record<GerakPijar, TargetAndTransition> = {
  idle: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  senang: { y: [0, -18, 0, -8, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 1.4 } },
  coba_lagi: { rotate: [0, -6, 0], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  lelah: { y: [0, 6, 0], scale: [1, 0.98, 1], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
};

export function MascotPijar({
  ekspresi = "sambut",
  gerak = "idle",
  ukuran = 160,
  className,
}: {
  ekspresi?: EkspresiPijar;
  gerak?: GerakPijar;
  ukuran?: number;
  className?: string;
}) {
  const kurangiGerak = useReducedMotion();

  return (
    <motion.div
      className={cn("relative shrink-0", className)}
      style={{ width: ukuran, height: ukuran }}
      animate={kurangiGerak ? undefined : GERAK[gerak]}
    >
      <Image
        src={`/pijar/${ekspresi}V2.webp`}
        alt="Pijar, teman belajarmu"
        fill
        sizes={`${ukuran}px`}
        className="object-contain"
        priority
      />
    </motion.div>
  );
}
