"use client";

// Papan PIN pendamping (PANDUAN 4: masuk mode pendamping wajib PIN). PIN dicek di SERVER (POST /api/auth/pin),
// percobaan dibatasi di server. Angka yang diketik tidak pernah ditampilkan, hanya titik.

import { useEffect, useState, type ReactNode } from "react";
import { motion, useAnimationControls } from "motion/react";
import { Delete, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PANJANG_MIN = 4;
const PANJANG_MAKS = 8;

export function PadPin({ onKirim }: { onKirim: (pin: string) => Promise<string | null> }) {
  const [pin, setPin] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const goyang = useAnimationControls();

  const tekan = (angka: string) => {
    setGalat(null);
    setPin((p) => (p.length < PANJANG_MAKS ? p + angka : p));
  };
  const hapus = () => setPin((p) => p.slice(0, -1));

  async function kirim() {
    if (pin.length < PANJANG_MIN || sibuk) return;
    setSibuk(true);
    const pesan = await onKirim(pin); // null = berhasil
    setSibuk(false);
    if (pesan) {
      setGalat(pesan);
      setPin("");
      goyang.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
    }
  }

  // Keyboard juga bisa dipakai (angka, Backspace, Enter).
  useEffect(() => {
    const dengar = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tekan(e.key);
      else if (e.key === "Backspace") hapus();
      else if (e.key === "Enter") void kirim();
    };
    window.addEventListener("keydown", dengar);
    return () => window.removeEventListener("keydown", dengar);
  });

  return (
    <div className="flex flex-col items-center">
      <motion.div animate={goyang} className="flex h-8 items-center gap-3" aria-live="polite" aria-label={`${pin.length} angka diketik`}>
        {Array.from({ length: Math.max(PANJANG_MIN, pin.length) }, (_, i) => (
          <motion.span
            key={i}
            animate={{ scale: i < pin.length ? 1 : 0.8 }}
            className={cn("size-4 rounded-full border-2 transition-colors", i < pin.length ? "border-bata bg-bata" : "border-jingga/50 bg-transparent")}
          />
        ))}
      </motion.div>
      <p role="alert" className="mt-2 min-h-6 text-center text-[14px] font-semibold text-teks">
        {galat}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((a) => (
          <Tombol key={a} onClick={() => tekan(a)}>
            {a}
          </Tombol>
        ))}
        <Tombol onClick={hapus} label="Hapus satu angka">
          <Delete className="size-6" />
        </Tombol>
        <Tombol onClick={() => tekan("0")}>0</Tombol>
        <button
          type="button"
          onClick={kirim}
          disabled={pin.length < PANJANG_MIN || sibuk}
          className="flex size-[72px] cursor-pointer items-center justify-center rounded-full bg-bata font-heading text-[17px] font-extrabold text-white shadow-[0_4px_0_var(--color-bata-tua)] transition active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-bata-tua)] disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
        >
          {sibuk ? <LoaderCircle className="size-6 animate-spin" aria-label="Memeriksa" /> : "OK"}
        </button>
      </div>
    </div>
  );
}

function Tombol({ onClick, label, children }: { onClick: () => void; label?: string; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      className="flex size-[72px] cursor-pointer items-center justify-center rounded-full border-2 border-garis bg-white font-heading text-[26px] font-extrabold text-teks shadow-[0_4px_0_var(--color-garis)] transition-colors hover:bg-pasir-muda focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
    >
      {children}
    </motion.button>
  );
}
