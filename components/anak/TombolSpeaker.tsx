"use client";

<<<<<<< HEAD
import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface TombolSpeakerProps {
  teks: string;
  label?: string;
  className?: string;
  ukuran?: "sm" | "md";
}

export function TombolSpeaker({
  teks,
  label = "Dengarkan",
  className = "",
  ukuran = "sm",
}: TombolSpeakerProps) {
  const [sedangBicara, setSedangBicara] = useState(false);

  const putarSuara = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (sedangBicara) {
      window.speechSynthesis.cancel();
      setSedangBicara(false);
      return;
    }

    window.speechSynthesis.cancel();
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = "id-ID";
    ucapan.rate = 0.92;
    ucapan.pitch = 1.05;

    const daftarSuara = window.speechSynthesis.getVoices();
    const suaraIndo = daftarSuara.find((v) =>
      v.lang.toLowerCase().includes("id")
    );
    if (suaraIndo) {
      ucapan.voice = suaraIndo;
    }

    ucapan.onstart = () => setSedangBicara(true);
    ucapan.onend = () => setSedangBicara(false);
    ucapan.onerror = () => setSedangBicara(false);

    window.speechSynthesis.speak(ucapan);
  };
=======
// Tombol speaker: membacakan teks dengan Web Speech API bawaan browser (bahasa id-ID).
// Dipasang di setiap instruksi untuk anak (PANDUAN bagian 13). Target sentuh 56px.

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "cn";

export function TombolSpeaker({ teks, className }: { teks: string; className?: string }) {
  const [bicara, setBicara] = useState(false);

  // Hentikan suara saat komponen hilang dari layar.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function bacakan() {
    const suara = window.speechSynthesis;
    if (!suara) return; // browser tidak mendukung: tombol diam saja
    suara.cancel();
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = "id-ID";
    ucapan.rate = 0.9;
    ucapan.onend = () => setBicara(false);
    ucapan.onerror = () => setBicara(false);
    setBicara(true);
    suara.speak(ucapan);
  }
>>>>>>> f178466816c828d30a3e039f2d29ed7fc8613079

  return (
    <button
      type="button"
<<<<<<< HEAD
      onClick={putarSuara}
      title="Bacakan dengan suara Bahasa Indonesia"
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer ${
        ukuran === "md"
          ? "min-h-[44px] px-4 py-2 text-sm"
          : "px-3 py-1.5 text-xs"
      } ${
        sedangBicara
          ? "bg-[#F4813A] text-[#FFFBF4] shadow-sm"
          : "bg-[#FFF4DF] text-[#7F1D2B] border border-[#EDB664]/70 hover:bg-[#FBD9B5]/70"
      } ${className}`}
    >
      {sedangBicara ? (
        <VolumeX className="h-3.5 w-3.5 shrink-0 animate-pulse" />
      ) : (
        <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#D93A45]" />
      )}
      <span>{sedangBicara ? "Berhenti" : label}</span>
=======
      onClick={bacakan}
      aria-label="Dengarkan"
      className={cn(
        "inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-garis bg-pasir text-bata transition hover:bg-bata hover:text-white focus-visible:ring-3 focus-visible:ring-emas/60 focus-visible:outline-none",
        bicara && "bg-bata text-white",
        className,
      )}
    >
      <Volume2 className="size-6" aria-hidden />
>>>>>>> f178466816c828d30a3e039f2d29ed7fc8613079
    </button>
  );
}
