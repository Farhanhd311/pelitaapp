// Simpul (pos) di jalur petualangan: tercapai, sekarang, atau terkunci.

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Check, Hourglass, Lock, Play } from "lucide-react";
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

// Judul materi ditulis satu baris (lebar max-content). Hanya jika lebih panjang dari ruang di samping pos
// (maksLebar), judul dilipat dan rata ke sisi pos. Lipatan "pretty" (baris pertama penuh), jadi kotak latarnya
// tetap pas dengan tulisan. Ditulis sebagai style langsung dengan alasan yang sama seperti di atas.
// Latar krem tipis di belakang judul supaya tetap terbaca di atas ilustrasi peta (bagian bawahnya gelap).
const MAKS_LEBAR_JUDUL = 420; // px, batas atas walau ruangnya lebih lebar

function gayaJudul(labelDi: LabelDi, maksLebar?: number): CSSProperties {
  return {
    width: "max-content",
    maxWidth: Math.min(maksLebar ?? MAKS_LEBAR_JUDUL, MAKS_LEBAR_JUDUL),
    textWrap: "pretty",
    textAlign: labelDi === "kiri" ? "right" : labelDi === "kanan" ? "left" : "center",
    background: "rgb(255 244 228 / 0.88)",
    borderRadius: 12,
    padding: "4px 12px",
  };
}

// maksLebar: ruang untuk judul di samping pos (px panggung); tanpa nilai = MAKS_LEBAR_JUDUL.
export function SimpulTercapai({
  judul,
  chip = "Tercapai",
  labelDi = "bawah",
  maksLebar,
}: {
  judul: string;
  chip?: string;
  labelDi?: LabelDi;
  maksLebar?: number;
}) {
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
          <p className="font-heading text-[15px] leading-snug font-extrabold text-teks" style={gayaJudul(labelDi, maksLebar)}>
            {judul}
          </p>
          <span className="mt-2 rounded-full bg-emas/35 px-3 py-1 text-[13px] font-bold text-teks">{chip}</span>
        </>
      }
    />
  );
}

/** Tombol bulat pos yang sedang dikerjakan (tanpa label). Tanpa href = materinya belum tersedia ("segera hadir"). */
export function LingkaranSekarang({ judul, href }: { judul: string; href?: string }) {
  if (!href) {
    return (
      <span
        role="img"
        aria-label={`${judul}, segera hadir`}
        className="flex size-[104px] items-center justify-center rounded-full border-[6px] border-emas bg-pasir text-jingga shadow-[0_8px_0_var(--color-garis)]"
      >
        <Hourglass className="size-10" strokeWidth={2} aria-hidden />
      </span>
    );
  }
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

// Kemajuan di dalam pos: satu ruas per bagian (TP), yang tuntas berwarna emas. Tanpa angka peluang (PANDUAN 7.2).
export function KemajuanPos({ tuntas, total, tengah = false }: { tuntas: number; total: number; tengah?: boolean }) {
  return (
    <div className={cn("mt-2 flex flex-col gap-1", tengah && "items-center")}>
      <div
        role="progressbar"
        aria-label="Bagian pos yang sudah tuntas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={tuntas}
        className="flex w-36 gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-2.5 flex-1 rounded-full", i < tuntas ? "bg-emas" : "bg-pasir")} />
        ))}
      </div>
      <p className="text-[12px] font-bold text-teks-2">
        {tuntas} dari {total} bagian tuntas
      </p>
    </div>
  );
}

export function SimpulSekarang({ judul, keterangan, href }: { judul: string; keterangan: string; href?: string }) {
  return (
    <div className="flex flex-col items-center">
      <LingkaranSekarang judul={judul} href={href} />
      <p className="mt-4 text-center font-heading text-[19px] leading-snug font-extrabold text-teks" style={{ textWrap: "balance" }}>
        {judul}
      </p>
      <p className="mt-1 text-center text-[13px] text-teks-2">{keterangan}</p>
    </div>
  );
}

// Pos terkunci (gembok) atau "segera hadir" (jam pasir, materinya belum punya soal). Bentuknya sama, hanya ikonnya beda.
export function SimpulTerkunci({
  judul,
  chip,
  labelDi = "bawah",
  segera = false,
  maksLebar,
}: {
  judul: string;
  chip: string;
  labelDi?: LabelDi;
  segera?: boolean;
  maksLebar?: number;
}) {
  const Ikon = segera ? Hourglass : Lock;
  return (
    <BingkaiSimpul
      labelDi={labelDi}
      lingkaran={
        <span
          className={cn(
            "flex size-[72px] shrink-0 items-center justify-center rounded-full border-4 border-white shadow-[0_5px_0_var(--color-garis)]",
            segera ? "bg-pasir text-jingga" : "bg-pasir-muda text-teks-2",
          )}
        >
          <Ikon className="size-6" strokeWidth={1.75} aria-hidden />
        </span>
      }
      label={
        <>
          <p className="font-heading text-[15px] leading-snug font-bold text-teks-2" style={gayaJudul(labelDi, maksLebar)}>
            {judul}
          </p>
          <span className="mt-2 rounded-full bg-pasir px-3 py-1 text-[13px] font-semibold text-teks-2">{chip}</span>
        </>
      }
    />
  );
}
