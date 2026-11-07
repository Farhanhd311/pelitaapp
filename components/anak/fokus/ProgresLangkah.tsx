// Penanda langkah (bukan timer): batang kecil, yang sudah dilewati berwarna bata.

import { cn } from "cn";

export function ProgresLangkah({ sekarang, jumlah, label }: { sekarang: number; jumlah: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={jumlah}
      aria-valuenow={sekarang}
      className="mx-auto flex w-full max-w-md gap-1.5"
    >
      {Array.from({ length: jumlah }, (_, i) => (
        <span key={i} className={cn("h-2.5 flex-1 rounded-full transition-colors duration-300", i < sekarang ? "bg-bata" : "bg-pasir")} />
      ))}
    </div>
  );
}
