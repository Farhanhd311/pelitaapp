"use client";

// Potongan UI kecil yang dipakai semua halaman admin. Gaya mengikuti mode anak (judul 28px, kartu
// bersudut 20px dengan judul berikon bata, tombol pil dengan efek tekan), tetapi lebih padat karena
// admin melihat data detail (PANDUAN 13).

import { useCallback, useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "cn";
import { panggilApi, pesanGalat } from "@/lib/api/klien";

export function JudulHalaman({ label, judul, keterangan, aksi }: { label?: string; judul: string; keterangan: string; aksi?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {label && <p className="text-[11px] font-extrabold tracking-[0.12em] text-bata uppercase">{label}</p>}
        <h1 className="mt-0.5 text-[28px] leading-tight font-extrabold text-teks">{judul}</h1>
        <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-teks-2">{keterangan}</p>
      </div>
      {aksi}
    </header>
  );
}

/** Kartu putih bersudut 20px, sama dengan kartu di beranda anak. Judul opsional dengan ikon bata. */
export function Kotak({
  children,
  className,
  judul,
  ikon,
  keterangan,
  aksi,
}: {
  children: ReactNode;
  className?: string;
  judul?: string;
  ikon?: ReactNode;
  keterangan?: string;
  aksi?: ReactNode;
}) {
  return (
    <section className={cn("rounded-[20px] border border-garis bg-white p-5", className)}>
      {judul && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold text-teks">
              {ikon && <span className="text-bata [&_svg]:size-5">{ikon}</span>}
              {judul}
            </h2>
            {keterangan && <p className="mt-0.5 text-[13px] text-teks-2">{keterangan}</p>}
          </div>
          {aksi}
        </div>
      )}
      {children}
    </section>
  );
}

const TOMBOL_DASAR =
  "inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full font-heading font-bold select-none transition-[transform,box-shadow,background-color,filter] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emas/50 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4";
const TOMBOL_VARIAN = {
  utama:
    "bg-bata text-white shadow-[0_3px_0_var(--color-bata-tua)] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-bata-tua)]",
  kedua:
    "border-2 border-jingga/50 bg-white text-teks shadow-[0_3px_0_var(--color-garis)] hover:bg-pasir-muda active:translate-y-[2px] active:shadow-none",
  lembut: "text-teks-2 hover:bg-pasir/60 hover:text-teks",
} as const;
const TOMBOL_UKURAN = { sedang: "h-11 px-5 text-[15px]", kecil: "h-9 px-4 text-sm" } as const;

/** Tombol pil seperti TombolAnak, dalam ukuran yang pas untuk layar admin. */
export function TombolAdmin({
  varian = "utama",
  ukuran = "sedang",
  className,
  ...props
}: ComponentProps<"button"> & { varian?: keyof typeof TOMBOL_VARIAN; ukuran?: keyof typeof TOMBOL_UKURAN }) {
  return <button type="button" className={cn(TOMBOL_DASAR, TOMBOL_VARIAN[varian], TOMBOL_UKURAN[ukuran], className)} {...props} />;
}

/** Kelas DialogContent untuk semua dialog admin (sama dengan dialog di mode anak). */
export const KELAS_DIALOG = "gap-4 rounded-3xl bg-krem p-6";
/** Kelas DialogFooter yang pas dengan padding KELAS_DIALOG. */
export const KELAS_KAKI_DIALOG = "-mx-6 -mb-6 mt-1 rounded-b-3xl border-garis bg-pasir-muda/70 px-6 py-4";

/** Pesan galat dari server. Warna emas, bukan merah (PANDUAN 13). */
export function KotakGalat({ pesan }: { pesan: string | null }) {
  if (!pesan) return null;
  return (
    <p role="alert" className="mb-4 rounded-xl border border-emas bg-emas/15 px-4 py-3 text-sm font-semibold text-teks">
      {pesan}
    </p>
  );
}

export function Memuat() {
  return <p className="py-10 text-center text-sm text-teks-2">Memuat data…</p>;
}

export function Kosong({ teks }: { teks: string }) {
  return <p className="rounded-[20px] border-2 border-dashed border-garis bg-white/50 px-6 py-10 text-center text-sm text-teks-2">{teks}</p>;
}

export function Chip({ children, warna = "pasir" }: { children: ReactNode; warna?: "pasir" | "emas" | "hijau" | "abu" | "merah-muda" }) {
  const kelas = {
    pasir: "bg-pasir text-teks",
    emas: "bg-emas/30 text-teks",
    hijau: "bg-[#dcefd4] text-[#24502a]",
    abu: "bg-[#ece7e1] text-teks-2",
    "merah-muda": "bg-merah-muda/40 text-teks",
  }[warna];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap", kelas)}>{children}</span>;
}

/** Waktu ISO (UTC dari server) -> waktu lokal yang mudah dibaca. */
export function formatWaktu(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function formatPersen(nilai: number | null | undefined, desimal = 0): string {
  return nilai === null || nilai === undefined ? "-" : `${(nilai * 100).toFixed(desimal)}%`;
}

/**
 * Muat data GET dari API admin. `muatUlang()` dipanggil setelah aksi (misalnya terbitkan soal).
 * `url` null = jangan memuat dulu.
 */
export function useDataAdmin<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [putaran, setPutaran] = useState(0);

  useEffect(() => {
    if (!url) return;
    let batal = false;
    (async () => {
      setMemuat(true);
      try {
        const hasil = await panggilApi<T>(url);
        if (!batal) {
          setData(hasil);
          setGalat(null);
        }
      } catch (g) {
        if (!batal) setGalat(pesanGalat(g));
      } finally {
        if (!batal) setMemuat(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, [url, putaran]);

  const muatUlang = useCallback(() => setPutaran((p) => p + 1), []);
  return { data, galat, memuat, muatUlang };
}

export const KELAS_INPUT =
  "min-h-10 w-full rounded-xl border-2 border-garis bg-white px-3 py-2 text-sm text-teks outline-none transition-colors hover:border-jingga/60 focus-visible:border-jingga focus-visible:ring-3 focus-visible:ring-emas/40";
