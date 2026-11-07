// Simpul (pos) di jalur petualangan: tercapai, sekarang, atau terkunci.

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "cn";

type LabelDi = "bawah" | "kiri" | "kanan";

// Lingkaran pos + labelnya. labelDi "bawah" (ponsel) atau di samping ("kiri"/"kanan") agar jalur
// yang lewat tegak di tengah pos tidak menimpa tulisan. Untuk kiri/kanan, hanya lingkaran yang
// mengisi kotak (label melayang di sampingnya), jadi pusat kotak = pusat lingkaran = tepat di jalur.
function BingkaiSimpul({ lingkaran, label, labelDi }: { lingkaran: ReactNode; label: ReactNode; labelDi: LabelDi }) {
  const samping = labelDi !== "bawah";
  return (
    <div className="relative flex flex-col items-center">
      {lingkaran}
      <div className={cn("flex flex-col", !samping && "mt-3 items-center")} style={labelDi !== "bawah" ? gayaLabelSamping(labelDi) : undefined}>
        {label}
      </div>
    </div>
  );
}

// Posisi label samping ditulis sebagai style langsung (bukan class Tailwind) supaya tetap benar
// walau CSS server dev belum diperbarui. Lebar max-content: chip tidak terlipat.
function gayaLabelSamping(labelDi: "kiri" | "kanan"): CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "max-content",
    alignItems: labelDi === "kiri" ? "flex-end" : "flex-start",
    ...(labelDi === "kiri" ? { right: "calc(100% + 12px)" } : { left: "calc(100% + 12px)" }),
  };
}

export function SimpulTercapai({ judul, labelDi = "bawah" }: { judul: string; labelDi?: LabelDi }) {
  return (
    <BingkaiSimpul
      labelDi={labelDi}
      lingkaran={
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-emas text-teks shadow-[0_6px_0_#c98a35]">
          <Check className="size-8" strokeWidth={3} aria-hidden />
        </span>
      }
      label={
        <>
          <p className="font-heading text-[15px] font-extrabold whitespace-nowrap text-teks">{judul}</p>
          <span className="mt-2 rounded-full bg-emas/35 px-3 py-1 text-[13px] font-bold text-teks">Tercapai</span>
        </>
      }
    />
  );
}

/** Tombol bulat pos yang sedang dikerjakan (tanpa label). */
export function LingkaranSekarang({ judul, href }: { judul: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`Mulai ${judul}`}
      className="flex size-[104px] items-center justify-center rounded-full border-[6px] border-emas bg-bata text-white shadow-[0_8px_0_var(--color-bata-tua)] transition hover:brightness-110 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-1 active:shadow-[0_4px_0_var(--color-bata-tua)]"
    >
      <Play className="ml-1 size-10" strokeWidth={2} aria-hidden />
    </Link>
  );
}

export function SimpulSekarang({ judul, keterangan, href }: { judul: string; keterangan: string; href: string }) {
  return (
    <div className="flex flex-col items-center">
      <LingkaranSekarang judul={judul} href={href} />
      <p className="mt-4 font-heading text-[19px] font-extrabold text-teks">{judul}</p>
      <p className="mt-1 text-[13px] text-teks-2">{keterangan}</p>
    </div>
  );
}

export function SimpulTerkunci({ judul, labelDi = "bawah" }: { judul: string; labelDi?: LabelDi }) {
  return (
    <BingkaiSimpul
      labelDi={labelDi}
      lingkaran={
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-pasir-muda text-teks-2 shadow-[0_5px_0_var(--color-garis)]">
          <Lock className="size-6" strokeWidth={1.75} aria-hidden />
        </span>
      }
      label={
        <>
          <p className="font-heading text-[15px] font-bold whitespace-nowrap text-teks-2">{judul}</p>
          <span className="mt-2 rounded-full bg-pasir px-3 py-1 text-[13px] font-semibold text-teks-2">Segera Hadir</span>
        </>
      }
    />
  );
}
