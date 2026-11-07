"use client";

import { motion, type Variants } from "motion/react";

export type EkspresiPijar = "idle" | "senang" | "coba_lagi" | "lelah";

export const pijarVariants: Variants = {
  idle: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
  },
  senang: {
    y: [0, -18, 0],
    scale: [1, 1.08, 1],
    transition: { type: "spring", stiffness: 280, damping: 14 },
  },
  // PENTING sesuai PANDUAN_PROYEK.md: hanya miring lembut, BUKAN menggeleng kiri-kanan
  coba_lagi: {
    rotate: -8,
    y: 2,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
  lelah: {
    y: 6,
    scale: 0.95,
    rotate: -4,
    transition: { duration: 0.6 },
  },
};

interface MascotPijarProps {
  ekspresi?: EkspresiPijar;
  ukuran?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const dimensiMap = {
  sm: 44,
  md: 68,
  lg: 104,
  xl: 148,
};

export function MascotPijar({
  ekspresi = "idle",
  ukuran = "md",
  className = "",
}: MascotPijarProps) {
  const size = dimensiMap[ukuran];

  return (
    <motion.div
      variants={pijarVariants}
      animate={ekspresi}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Maskot Pijar (${ekspresi})`}
    >
      {/* Cahaya pendar keemasan di belakang Pijar */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-75"
        style={{
          background:
            "radial-gradient(circle, #EDB664 0%, #F4813A 45%, rgba(251, 217, 181, 0) 75%)",
        }}
      />

      <svg
        viewBox="0 0 120 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full drop-shadow-[0_8px_16px_rgba(127,29,43,0.18)]"
      >
        <defs>
          <radialGradient id="pijarGlow" cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#FFFBF4" />
            <stop offset="45%" stopColor="#FBD9B5" />
            <stop offset="80%" stopColor="#EDB664" />
            <stop offset="100%" stopColor="#F4813A" />
          </radialGradient>
          <linearGradient id="pijarCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A82535" />
            <stop offset="100%" stopColor="#7F1D2B" />
          </linearGradient>
          <linearGradient id="pijarFlame" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFBF4" />
            <stop offset="45%" stopColor="#EDB664" />
            <stop offset="100%" stopColor="#F4813A" />
          </linearGradient>
        </defs>

        {/* Bintang-bintang kecil keemasan */}
        <circle cx="20" cy="28" r="3" fill="#EDB664" />
        <circle cx="102" cy="34" r="2.5" fill="#F4813A" />
        <path
          d="M96 14L98 19L103 21L98 23L96 28L94 23L89 21L94 19L96 14Z"
          fill="#EDB664"
        />
        <path
          d="M24 12L25.5 15.5L29 17L25.5 18.5L24 22L22.5 18.5L19 17L22.5 15.5L24 12Z"
          fill="#F4813A"
        />

        {/* Gantungan cincin lentera */}
        <circle
          cx="60"
          cy="14"
          r="7"
          stroke="#EDB664"
          strokeWidth="3.5"
          fill="#FFFBF4"
        />

        {/* Topi lentera atas */}
        <path
          d="M34 32C38 22 48 18 60 18C72 18 82 22 86 32L92 37C93 38 92 40 90 40H30C28 40 27 38 28 37L34 32Z"
          fill="url(#pijarCap)"
          stroke="#EDB664"
          strokeWidth="2"
        />

        {/* Badan kaca lentera bercahaya keemasan */}
        <rect
          x="28"
          y="38"
          width="64"
          height="58"
          rx="26"
          fill="url(#pijarGlow)"
          stroke="#EDB664"
          strokeWidth="3"
        />

        {/* Pendaran api kecil di atas kepala dalam lentera */}
        <path
          d="M60 44C60 44 69 52 67 60C65 65 55 65 53 60C51 52 60 44 60 44Z"
          fill="url(#pijarFlame)"
          opacity="0.85"
        />

        {/* Tangan mungil lentera */}
        <ellipse
          cx="23"
          cy="68"
          rx="6"
          ry="4.5"
          transform="rotate(-20 23 68)"
          fill="#F4813A"
          stroke="#7F1D2B"
          strokeWidth="1.8"
        />
        <ellipse
          cx="97"
          cy="66"
          rx="6"
          ry="4.5"
          transform="rotate(20 97 66)"
          fill="#F4813A"
          stroke="#7F1D2B"
          strokeWidth="1.8"
        />

        {/* Pipi merona hangat */}
        <ellipse cx="42" cy="74" rx="5.5" ry="3.2" fill="#EE7A7A" opacity="0.65" />
        <ellipse cx="78" cy="74" rx="5.5" ry="3.2" fill="#EE7A7A" opacity="0.65" />

        {/* Mata sesuai ekspresi */}
        {ekspresi === "lelah" ? (
          <>
            <path
              d="M42 68C44 70 48 70 50 68"
              stroke="#7F1D2B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M70 68C72 70 76 70 78 68"
              stroke="#7F1D2B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="46" cy="67" r="4.2" fill="#7F1D2B" />
            <circle cx="44.5" cy="65.5" r="1.5" fill="#FFFBF4" />
            <circle cx="74" cy="67" r="4.2" fill="#7F1D2B" />
            <circle cx="72.5" cy="65.5" r="1.5" fill="#FFFBF4" />
          </>
        )}

        {/* Mulut ramah */}
        {ekspresi === "coba_lagi" ? (
          <path
            d="M55 77C57 75.5 63 75.5 65 77"
            stroke="#7F1D2B"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M53 75C55.5 79.5 64.5 79.5 67 75"
            stroke="#7F1D2B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Alas lentera bawah */}
        <rect
          x="36"
          y="93"
          width="48"
          height="11"
          rx="5.5"
          fill="url(#pijarCap)"
          stroke="#EDB664"
          strokeWidth="2"
        />

        {/* Kaki mungil */}
        <ellipse cx="48" cy="108" rx="6" ry="4" fill="#7F1D2B" />
        <ellipse cx="72" cy="108" rx="6" ry="4" fill="#7F1D2B" />
      </svg>

      {ekspresi === "lelah" && (
        <span className="absolute -top-1 -right-1 rounded-full bg-[#FFFBF4] px-1.5 py-0.5 text-[10px] font-bold text-[#7F1D2B] shadow-sm border border-[#EDB664]">
          Zzz
        </span>
      )}
    </motion.div>
  );
}
