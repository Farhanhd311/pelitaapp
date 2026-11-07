// Halaman daftar orang tua/wali (keputusan tim 2026-11-08). Tata letak sama dengan halaman masuk:
// kartu split, formulir di kiri dengan tepi organik, panel ilustrasi Pijar di kanan.

import { FormDaftar } from "@/components/auth/FormDaftar";
import { PanelSambut } from "@/components/auth/PanelSambut";

export const metadata = { title: "Daftar · PELITA" };

export default function HalamanDaftar() {
  return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-[#F7D7AD] px-4 py-8 text-teks sm:px-8 sm:py-12">
      {/* ==================== LATAR LANGIT LUAR YANG BERSIH & TENANG ==================== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none z-0">
        <img
          src="/dekorasi/bg-langit-pelita.webp"
          alt=""
          className="h-full w-full object-cover object-center scale-105 blur-[3px] opacity-75"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 50% 50%, rgba(252,235,212,0.52) 0%, rgba(191,67,56,0.18) 100%)",
          }}
        />
      </div>

      {/* ==================== KARTU UTAMA SPLIT (KIRI: FORM DAFTAR, KANAN: PANEL ILUSTRASI) ==================== */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1120px] overflow-hidden rounded-[28px] bg-[#FFFDF9] shadow-[0_28px_80px_rgba(74,21,32,0.22)] border border-[#E5B97F]/80 lg:min-h-[630px] lg:grid-cols-12">
        {/* Sisi Kiri: Formulir Daftar + Tepi Organik Bergelombang di Kanan */}
        <div className="relative z-20 flex items-center justify-center bg-[#FFFDF9] px-6 py-9 sm:px-10 sm:py-12 lg:col-span-5">
          <FormDaftar />

          {/* Pembatas Tepi Organik Awan/Kertas di Sisi Kanan Panel Putih (Sesuai Referensi Gambar) */}
          <svg
            aria-hidden
            viewBox="0 0 90 800"
            preserveAspectRatio="none"
            className="pointer-events-none hidden lg:block absolute top-0 -right-[54px] h-full w-[56px] text-[#FFFDF9] drop-shadow-[8px_0_12px_rgba(74,21,32,0.08)] z-30"
          >
            <path
              fill="currentColor"
              d="M0,0 L28,0 C48,28 14,58 36,92 C58,126 18,162 44,198 C68,232 22,268 48,306 C74,344 16,382 42,422 C66,460 20,498 50,538 C76,574 22,614 46,654 C70,692 18,732 42,768 C54,784 34,794 28,800 L0,800 Z"
            />
          </svg>
        </div>

        {/* Sisi Kanan: Panel Ilustrasi Langit PELITA + Pijar + 3 Keunggulan */}
        <div className="hidden lg:block lg:col-span-7 relative">
          <PanelSambut />
        </div>
      </div>
    </main>
  );
}
