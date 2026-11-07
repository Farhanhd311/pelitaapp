"use client";

// Tombol speaker: membacakan teks dengan Web Speech API bawaan browser (bahasa id-ID).
// Dipasang di setiap instruksi untuk anak (PANDUAN bagian 13).
// Mendukung mode bulat 56px (default tanpa label di Mode Anak) dan mode kapsul berlabel (di Landing Page).

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export interface TombolSpeakerProps {
  teks: string;
  label?: string;
  ukuran?: "sm" | "md";
  className?: string;
}

export function TombolSpeaker({
  teks,
  label,
  ukuran = "sm",
  className,
}: TombolSpeakerProps) {
  const [bicara, setBicara] = useState(false);

  // Hentikan suara saat komponen hilang dari layar.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function bacakan() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const suara = window.speechSynthesis;
    if (!suara) return;

    if (bicara) {
      suara.cancel();
      setBicara(false);
      return;
    }

    suara.cancel();
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = "id-ID";
    ucapan.rate = 0.9;

    const daftarSuara = suara.getVoices();
    const suaraIndo = daftarSuara.find((v) =>
      v.lang.toLowerCase().includes("id"),
    );
    if (suaraIndo) {
      ucapan.voice = suaraIndo;
    }

    ucapan.onstart = () => setBicara(true);
    ucapan.onend = () => setBicara(false);
    ucapan.onerror = () => setBicara(false);
    setBicara(true);
    suara.speak(ucapan);
  }

  // Jika label diberikan (mis. di Landing Page), tampilkan tombol kapsul dengan teks label
  if (label) {
    return (
      <button
        type="button"
        onClick={bacakan}
        title="Bacakan dengan suara Bahasa Indonesia"
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer ${
          ukuran === "md"
            ? "min-h-[44px] px-4 py-2 text-sm"
            : "px-3 py-1.5 text-xs"
        } ${
          bicara
            ? "bg-[#F4813A] text-[#FFFBF4] shadow-sm"
            : "bg-[#FFF4DF] text-[#7F1D2B] border border-[#EDB664]/70 hover:bg-[#FBD9B5]/70"
        } ${className ?? ""}`}
      >
        {bicara ? (
          <VolumeX className="h-3.5 w-3.5 shrink-0 animate-pulse" aria-hidden />
        ) : (
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#D93A45]" aria-hidden />
        )}
        <span>{bicara ? "Berhenti" : label}</span>
      </button>
    );
  }

  // Default Mode Anak: tombol bulat target sentuh 56px (size-14)
  return (
    <button
      type="button"
      onClick={bacakan}
      aria-label="Dengarkan"
      className={`inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-garis bg-pasir text-bata transition hover:bg-bata hover:text-white focus-visible:ring-3 focus-visible:ring-emas/60 focus-visible:outline-none cursor-pointer ${
        bicara ? "bg-bata text-white" : ""
      } ${className ?? ""}`}
    >
      <Volume2 className="size-6" aria-hidden />
      {label}
    </button>
  );
}
