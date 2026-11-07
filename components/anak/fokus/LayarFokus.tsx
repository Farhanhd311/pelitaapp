"use client";

// Layar fokus anak (check-in, sesi belajar, asesmen): menutupi sidebar dan bar bawah supaya anak
// hanya fokus pada satu tugas.
// Latar belakang memakai tema langit & awan khas PELITA (bg-langit-pelita + awan 1–13 + pendaran hangat),
// serasi dengan UI dominan aplikasi (Landing page, Pilih Profil, Panel Sambut).
// Gerak awan halus mengikuti setelan "kurangi gerak" di perangkat (useReducedMotion).

import type { ReactNode } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";

function LatarLangitAwan() {
  const kurangiGerak = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      {/* 1. Gambar Dasar Langit Hangat PELITA */}
      <img
        src="/dekorasi/bg-langit-pelita.webp"
        alt=""
        className="h-full w-full object-cover object-center opacity-65"
      />

      {/* 2. Lapisan Cahaya Hangat di Tengah agar Konten & Kartu Sangat Kontras dan Mudah Dibaca */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 36%, rgba(255,250,242,0.86) 0%, rgba(252,235,212,0.62) 55%, rgba(246,204,148,0.22) 100%)",
        }}
      />

      {/* 3. Awan Dekoratif Organik PELITA (Kiri Atas, Kanan Atas, Tengah, dan Hamparan Bawah) */}
      {/* Awan Kiri Atas */}
      <motion.img
        src="/dekorasi/awan-1.webp"
        alt=""
        animate={kurangiGerak ? undefined : { y: [0, -9, 0], x: [0, 5, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -left-10 w-52 sm:w-72 opacity-60 pointer-events-none"
      />

      {/* Awan Kanan Atas */}
      <motion.img
        src="/dekorasi/awan-3.webp"
        alt=""
        animate={kurangiGerak ? undefined : { y: [0, 8, 0], x: [0, -6, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -top-10 -right-12 w-60 sm:w-80 opacity-55 pointer-events-none"
      />

      {/* Awan Mengambang Tengah Kiri */}
      <motion.img
        src="/dekorasi/awan-4.webp"
        alt=""
        animate={kurangiGerak ? undefined : { y: [0, -6, 0], x: [0, 4, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[42%] -left-12 w-44 sm:w-56 opacity-40 pointer-events-none"
      />

      {/* Awan Mengambang Tengah Kanan */}
      <motion.img
        src="/dekorasi/awan-2.webp"
        alt=""
        animate={kurangiGerak ? undefined : { y: [0, 7, 0], x: [0, -4, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[36%] -right-10 w-48 sm:w-64 opacity-45 pointer-events-none"
      />

      {/* Hamparan Awan Cakrawala Lembut di Bawah */}
      <motion.img
        src="/dekorasi/awan-13.webp"
        alt=""
        animate={kurangiGerak ? undefined : { x: ["-50%", "-49%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1200px] max-w-none opacity-50 pointer-events-none"
      />

      {/* 4. Aksen Bintang Kemilau Lembut */}
      <motion.img
        src="/dekorasi/bintang-2.webp"
        alt=""
        animate={kurangiGerak ? undefined : { scale: [1, 1.15, 1], opacity: [0.65, 0.95, 0.65] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute top-14 right-[16%] size-7 sm:size-9 opacity-80 pointer-events-none"
      />
      <motion.img
        src="/dekorasi/bintang-3.webp"
        alt=""
        animate={kurangiGerak ? undefined : { scale: [1, 1.2, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[28%] left-[10%] size-6 sm:size-8 opacity-75 pointer-events-none"
      />
      <motion.img
        src="/dekorasi/bintang-5.webp"
        alt=""
        animate={kurangiGerak ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
        className="absolute bottom-28 right-[12%] size-5 sm:size-7 opacity-70 pointer-events-none"
      />
    </div>
  );
}

export function LayarFokus({
  kiri,
  tengah,
  kanan,
  children,
  latarAwan = true,
}: {
  kiri?: ReactNode;
  tengah?: ReactNode;
  kanan?: ReactNode;
  children: ReactNode;
  latarAwan?: boolean;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-teks">
        {latarAwan ? (
          <LatarLangitAwan />
        ) : (
          <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
            <span className="absolute -top-28 -left-28 size-80 rounded-full bg-pasir/60" />
            <span className="absolute top-[22%] -right-20 size-56 rounded-full bg-merah-muda/25" />
            <span className="absolute -right-24 -bottom-32 size-96 rounded-full bg-pasir/50" />
            <span className="absolute bottom-28 left-[8%] size-20 rounded-full bg-merah-muda/20" />
          </div>
        )}

        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pt-4 pb-10 sm:px-8 sm:pt-6">
          <header className="flex min-h-14 items-center gap-3 sm:gap-5">
            {kiri}
            <div className="min-w-0 flex-1">{tengah}</div>
            {kanan}
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </MotionConfig>
  );
}
