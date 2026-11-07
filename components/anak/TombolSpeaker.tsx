"use client";

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

  return (
    <button
      type="button"
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
    </button>
  );
}
