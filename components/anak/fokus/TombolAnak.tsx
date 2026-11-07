// Tombol mode anak: tinggi minimal 56px, bentuk pil, efek "tertekan" saat diketuk (bayangan turun).
// varian "utama" hanya satu per layar (aksi utama); "kedua" untuk aksi pendamping; "lembut" untuk aksi kecil.

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "cn";

const DASAR =
  "inline-flex min-h-14 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full px-7 font-heading text-[17px] font-extrabold select-none transition-[transform,box-shadow,background-color,filter] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emas/60 disabled:pointer-events-none disabled:opacity-45";

const VARIAN = {
  utama:
    "bg-bata text-white shadow-[0_5px_0_var(--color-bata-tua)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_var(--color-bata-tua)]",
  kedua:
    "border-2 border-jingga/50 bg-white text-teks shadow-[0_4px_0_var(--color-garis)] hover:bg-pasir-muda active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-garis)]",
  lembut: "text-teks-2 hover:bg-pasir/60 hover:text-teks",
} as const;

type Varian = keyof typeof VARIAN;

export function TombolAnak({ varian = "utama", className, ...props }: ComponentProps<"button"> & { varian?: Varian }) {
  return <button type="button" className={cn(DASAR, VARIAN[varian], className)} {...props} />;
}

export function TautanAnak({ varian = "utama", className, href, children }: { varian?: Varian; className?: string; href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(DASAR, VARIAN[varian], className)}>
      {children}
    </Link>
  );
}

/** Tombol bulat 56px di kiri atas layar fokus. */
export function TombolBulat({ label, className, ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-garis bg-white/80 text-teks-2 transition hover:bg-pasir-muda hover:text-teks focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:scale-95",
        className,
      )}
      {...props}
    />
  );
}
