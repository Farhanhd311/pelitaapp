"use client";

// Kartu pilihan besar untuk check-in. `peran`: "radio" (pilih satu) atau "toggle" (boleh banyak).

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "cn";

export function KartuPilihan({
  dipilih,
  onPilih,
  gambar,
  judul,
  keterangan,
  peran = "radio",
  tataLetak = "tegak",
}: {
  dipilih: boolean;
  onPilih: () => void;
  gambar: ReactNode;
  judul: string;
  keterangan?: string;
  peran?: "radio" | "toggle";
  /** tegak: gambar di atas teks. datar: gambar di kiri. datar-hp: datar di ponsel, tegak di layar lebar. */
  tataLetak?: "tegak" | "datar" | "datar-hp";
}) {
  const ringkas = tataLetak === "datar";
  return (
    <motion.button
      type="button"
      role={peran === "radio" ? "radio" : undefined}
      aria-checked={peran === "radio" ? dipilih : undefined}
      aria-pressed={peran === "toggle" ? dipilih : undefined}
      onClick={onPilih}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative flex cursor-pointer touch-manipulation items-center rounded-[24px] border-2 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none",
        tataLetak === "datar" && "min-h-16 gap-3 px-4 py-3",
        tataLetak === "tegak" && "min-h-14 flex-col gap-2 px-4 pt-5 pb-5 text-center",
        tataLetak === "datar-hp" && "min-h-16 gap-4 px-4 py-3 sm:flex-col sm:gap-2 sm:pt-5 sm:pb-5 sm:text-center",
        dipilih
          ? "border-bata bg-pasir-muda shadow-[0_6px_0_var(--color-jingga)]"
          : "border-garis bg-white/85 shadow-[0_6px_0_var(--color-garis)] hover:border-jingga",
      )}
    >
      {dipilih && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2.5 -right-2.5 flex size-8 items-center justify-center rounded-full bg-bata text-white shadow-md"
          aria-hidden
        >
          <Check className="size-4.5" strokeWidth={3} />
        </motion.span>
      )}
      {gambar}
      <span className={cn("min-w-0", tataLetak === "tegak" && "flex flex-col items-center", tataLetak === "datar-hp" && "sm:flex sm:flex-col sm:items-center")}>
        <span className={cn("block font-heading font-extrabold text-teks", ringkas ? "text-[17px]" : "text-xl")}>{judul}</span>
        {keterangan && <span className="mt-0.5 block text-sm text-teks-2">{keterangan}</span>}
      </span>
    </motion.button>
  );
}
