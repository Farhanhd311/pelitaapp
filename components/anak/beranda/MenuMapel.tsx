"use client";

// Menu ☰ di kiri atas Beranda (tetap terlihat saat peta digulir). Diketuk -> dropdown berisi:
//   - pilihan mapel (setelah asesmen penempatan; satu peta = satu mapel, seperti satu buku per mapel);
//   - "Ganti profil", satu-satunya jalan keluar dari mode anak (mode pendamping butuh PIN).
// Daftar mapel dari GET /api/beranda (file data materi), bukan ditulis di sini.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, BookOpenText, Calculator, Check, FlaskConical, Handshake, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import type { MapelBeranda } from "@/lib/kontrak/beranda";

// Ikon hanya hiasan; mapel yang belum terdaftar di sini otomatis memakai ikon buku.
const IKON_MAPEL: Record<string, LucideIcon> = {
  Matematika: Calculator,
  "Bahasa Indonesia": BookOpenText,
  IPAS: FlaskConical,
  "Pendidikan Pancasila": Handshake,
};

export function MenuMapel({
  daftar,
  dipilih,
  bisaPilih,
  sibuk,
  namaAnak,
  onPilih,
}: {
  daftar: MapelBeranda[];
  dipilih: number;
  bisaPilih: boolean; // false sebelum asesmen penempatan selesai: menu hanya berisi "Ganti profil"
  sibuk: boolean;
  namaAnak: string;
  onPilih: (mapelId: number) => void;
}) {
  const [buka, setBuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);

  // Tutup saat mengetuk di luar menu atau menekan Escape.
  useEffect(() => {
    if (!buka) return;
    const ketukLuar = (e: PointerEvent) => {
      if (!wadah.current?.contains(e.target as Node)) setBuka(false);
    };
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("pointerdown", ketukLuar);
    document.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("pointerdown", ketukLuar);
      document.removeEventListener("keydown", tombol);
    };
  }, [buka]);

  return (
    <div ref={wadah} className="fixed top-4 left-4 z-40 sm:left-7">
      <button
        type="button"
        aria-expanded={buka}
        aria-controls="menu-beranda"
        aria-label={buka ? "Tutup menu" : "Buka menu: pilih mata pelajaran"}
        onClick={() => setBuka((b) => !b)}
        className="flex size-14 cursor-pointer items-center justify-center rounded-full border-2 border-garis bg-white text-teks shadow-[0_4px_0_var(--color-garis)] transition hover:bg-pasir-muda focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-0.5"
      >
        {buka ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>

      <AnimatePresence>
        {buka && (
          <motion.div
            id="menu-beranda"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top-left rounded-[24px] border-2 border-garis bg-white p-2 shadow-[0_12px_32px_rgb(46_11_7/0.18)]"
          >
            {bisaPilih && (
              <>
                <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-bata uppercase">Mata pelajaran</p>
                <ul className="flex flex-col gap-1">
                  {daftar.map((m) => {
                    const aktif = m.mapel_id === dipilih;
                    const Ikon = IKON_MAPEL[m.nama] ?? BookOpen;
                    return (
                      <li key={m.mapel_id}>
                        <button
                          type="button"
                          aria-pressed={aktif}
                          disabled={sibuk && !aktif}
                          onClick={() => {
                            setBuka(false);
                            if (!aktif) onPilih(m.mapel_id);
                          }}
                          className={cn(
                            "flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-left font-heading text-[15px] font-extrabold transition focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60",
                            aktif ? "bg-bata text-white" : "text-teks hover:bg-pasir-muda",
                          )}
                        >
                          <Ikon className="size-5 shrink-0" aria-hidden />
                          <span className="flex-1">{m.nama}</span>
                          {!m.bisa_belajar && <span className="rounded-full bg-pasir px-2 py-0.5 text-[11px] font-bold text-teks-2">Segera</span>}
                          {aktif && <Check className="size-5 shrink-0" strokeWidth={3} aria-hidden />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mx-2 my-2 h-px bg-garis" aria-hidden />
              </>
            )}
            <Link
              href="/pilih-profil"
              className="flex min-h-14 items-center gap-3 rounded-2xl px-3 font-heading text-[15px] font-bold text-teks transition hover:bg-pasir-muda focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-merah-muda text-base font-extrabold" aria-hidden>
                {namaAnak.charAt(0)}
              </span>
              Ganti profil
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
