"use client";

// Tombol speaker: membacakan teks dengan Web Speech API bawaan browser (bahasa id-ID).
// Dipasang di setiap instruksi untuk anak (PANDUAN bagian 13). Target sentuh 56px.

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "cn";

// `label` opsional: jika diisi, tombol tampil sebagai pil berteks (misalnya "Dengarkan soal").
export function TombolSpeaker({ teks, label, className }: { teks: string; label?: string; className?: string }) {
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
      aria-label={label ?? "Dengarkan"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-garis bg-pasir text-bata transition hover:bg-bata hover:text-white focus-visible:ring-3 focus-visible:ring-emas/60 focus-visible:outline-none",
        label ? "min-h-14 gap-2 border-jingga px-6 font-heading text-[17px] font-bold" : "size-14",
        bicara && "bg-bata text-white",
        className,
      )}
    >
      <Volume2 className="size-6" aria-hidden />
      {label}
    </button>
  );
}
