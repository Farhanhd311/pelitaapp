"use client";

// Logo PELITA: Icon Cheerful Chibi Flame Face ceria dan bersahabat.
// Dipakai di seluruh aplikasi PELITA: login, daftar, admin, dan navigasi.

import { motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

export function TandaPelita({ ukuran = 44, className }: { ukuran?: number; className?: string }) {
  const kurangiGerak = useReducedMotion();
  return (
    <motion.img
      src="/ilustrasi/Cheerful%20Chibi%20Flame%20Face.webp"
      alt="Logo PELITA"
      width={ukuran}
      height={ukuran}
      animate={kurangiGerak ? undefined : { scale: [1, 1.06, 0.97, 1.03, 1], rotate: [0, -1.5, 1.5, -0.5, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className={cn("object-contain select-none shrink-0 drop-shadow-xs", className)}
      style={{ width: ukuran, height: ukuran }}
    />
  );
}

export function LogoPelita({
  ukuran = 44,
  terang = false,
  tagline = true,
  className,
}: {
  ukuran?: number;
  /** true untuk latar gelap (teks putih). */
  terang?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <TandaPelita ukuran={ukuran} />
      <span className="flex flex-col">
        <span className={cn("font-heading leading-none font-black tracking-wide", terang ? "text-white" : "text-teks")} style={{ fontSize: ukuran * 0.5 }}>
          PELITA
        </span>
        {tagline && (
          <span className={cn("mt-1 font-bold tracking-[0.14em] uppercase", terang ? "text-white/75" : "text-teks-2")} style={{ fontSize: Math.max(9, ukuran * 0.22) }}>
            Teman Bertumbuh
          </span>
        )}
      </span>
    </span>
  );
}
