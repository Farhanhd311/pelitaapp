"use client";

// Logo PELITA: lampu minyak kecil (pelita) dengan nyala api yang berkedip pelan.
// Dipakai di halaman masuk, pilih profil, dan sidebar anak. Gerak dimatikan jika perangkat meminta "kurangi gerak".

import { motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

export function TandaPelita({ ukuran = 44, className }: { ukuran?: number; className?: string }) {
  const kurangiGerak = useReducedMotion();
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="14" fill="var(--color-pasir)" />
      {/* nyala api */}
      <motion.g
        style={{ originX: "24px", originY: "26px" }}
        animate={kurangiGerak ? undefined : { scaleY: [1, 1.07, 0.96, 1.03, 1], rotate: [0, -2, 1.5, -1, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M24 6c5 6.5 7.5 10.5 5.6 15.2C28.4 24.4 26.3 26 24 26s-4.4-1.6-5.6-4.8C16.5 16.5 19 12.5 24 6Z" fill="var(--color-emas)" />
        <path d="M24 13c2.6 3.6 3.6 5.8 2.6 8.3-.6 1.6-1.6 2.4-2.6 2.4s-2-.8-2.6-2.4c-1-2.5 0-4.7 2.6-8.3Z" fill="var(--color-bata)" />
      </motion.g>
      {/* badan pelita */}
      <rect x="9" y="26" width="30" height="4" rx="2" fill="var(--color-bata-tua)" />
      <path d="M11 30h26c0 6.6-5.8 10-13 10s-13-3.4-13-10Z" fill="var(--color-bata)" />
      <rect x="18" y="39" width="12" height="3.5" rx="1.75" fill="var(--color-bata-tua)" />
    </svg>
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
