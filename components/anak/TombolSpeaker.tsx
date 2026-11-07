"use client";

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

  return (
    <button
      type="button"
      onClick={bacakan}
      aria-label="Dengarkan"
      className={cn(
        "inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-garis bg-pasir text-bata transition hover:bg-bata hover:text-white focus-visible:ring-3 focus-visible:ring-emas/60 focus-visible:outline-none",
        bicara && "bg-bata text-white",
        className,
      )}
    >
      <Volume2 className="size-6" aria-hidden />
    </button>
  );
}
