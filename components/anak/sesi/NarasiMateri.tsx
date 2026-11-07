"use client";

// Kartu belajar bercerita: beberapa adegan petualangan Pijar yang mengajarkan konsep TP secara tidak langsung,
// sebelum soal (PANDUAN 7.2). Isi dari data/narasi_materi_*.json (lihat narasi.ts).
// Adegan "tebak" hanya permainan: tidak dinilai, tidak dikirim ke server, tidak memengaruhi status TP.
// Tanpa kata "Salah" dan tanpa tanda X merah (PANDUAN 13): setelah anak mengetuk, kunci ditandai emas + penjelasan.

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "cn";
import { VisualSoal } from "@/components/anak/KartuSoal";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { ProgresLangkah } from "@/components/anak/fokus/ProgresLangkah";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";
import type { AdeganNarasi, Narasi } from "./narasi";

export function NarasiMateri({
  narasi,
  penutup,
  sibuk,
  onSelesai,
}: {
  narasi: Narasi;
  penutup?: ReactNode; // konten interaktif tambahan (misalnya kartu B3) sebagai halaman terakhir
  sibuk: boolean;
  onSelesai: () => void;
}) {
  const [hal, setHal] = useState(0);
  const [arah, setArah] = useState(1);
  const [tebakan, setTebakan] = useState<Record<number, string>>({});

  const jumlah = narasi.adegan.length + (penutup ? 1 : 0);
  const adegan: AdeganNarasi | undefined = narasi.adegan[hal];
  const terakhir = hal === jumlah - 1;
  // Adegan tebak: ketuk salah satu pilihan dulu (bagian dari permainan), baru boleh lanjut.
  const menungguTebakan = Boolean(adegan?.tebak && !tebakan[hal]);

  const pindah = (ke: number) => {
    setArah(ke > hal ? 1 : -1);
    setHal(ke);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <ProgresLangkah sekarang={hal + 1} jumlah={jumlah} label={`Cerita ${hal + 1} dari ${jumlah}`} />
      <h2 className="mt-4 text-center font-heading text-[22px] leading-tight font-extrabold text-balance">{narasi.judul}</h2>

      <div className="relative mt-4 w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={arah} initial={false}>
          <motion.div
            key={hal}
            custom={arah}
            initial={{ opacity: 0, x: arah * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: arah * -40 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            {adegan ? (
              <Adegan adegan={adegan} tebakan={tebakan[hal]} onTebak={(t) => setTebakan((x) => ({ ...x, [hal]: t }))} />
            ) : (
              <div className="flex w-full flex-col items-center">
                <p className="flex items-center gap-1.5 rounded-full bg-emas/30 px-4 py-1.5 font-heading text-sm font-extrabold">
                  <Sparkles className="size-4 text-bata" aria-hidden /> Coba sendiri, yuk!
                </p>
                <div className="mt-4 w-full">{penutup}</div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-7 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        {hal > 0 && (
          <TombolAnak varian="kedua" onClick={() => pindah(hal - 1)}>
            <ArrowLeft className="size-5" aria-hidden /> Kembali
          </TombolAnak>
        )}
        {terakhir ? (
          <TombolAnak className="sm:min-w-64" disabled={sibuk || menungguTebakan} onClick={onSelesai}>
            {sibuk ? "Sebentar…" : "Aku siap, mulai soal"}
          </TombolAnak>
        ) : (
          <TombolAnak className="sm:min-w-48" disabled={menungguTebakan} onClick={() => pindah(hal + 1)}>
            {menungguTebakan ? "Pilih dulu, ya" : "Lanjut"} <ArrowRight className="size-5" aria-hidden />
          </TombolAnak>
        )}
      </div>
    </div>
  );
}

function Adegan({ adegan, tebakan, onTebak }: { adegan: AdeganNarasi; tebakan: string | undefined; onTebak: (t: string) => void }) {
  return (
    <>
      <div className="flex w-full items-end gap-3">
        <MascotPijar ekspresi={adegan.ekspresi} gerak="idle" ukuran={96} className="shrink-0" />
        <div
          className={cn(
            "relative mb-6 flex-1 rounded-[22px] border-2 px-4 py-3 text-[18px] leading-relaxed font-semibold sm:text-[19px]",
            adegan.kunci ? "border-emas bg-emas/20" : "border-garis bg-white",
          )}
        >
          {adegan.kunci && (
            <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-bata uppercase">
              <Sparkles className="size-4" aria-hidden /> Ingat, ya!
            </p>
          )}
          {adegan.teks}
          {/* ekor gelembung menunjuk Pijar */}
          <span
            className={cn(
              "absolute bottom-4 -left-[9px] size-4 rotate-45 border-b-2 border-l-2",
              adegan.kunci ? "border-emas bg-[color-mix(in_srgb,var(--color-emas)_20%,white)]" : "border-garis bg-white",
            )}
            aria-hidden
          />
        </div>
      </div>

      {adegan.visual && <VisualSoal visual={adegan.visual} />}

      {adegan.tebak && <Tebak tebak={adegan.tebak} tebakan={tebakan} onTebak={onTebak} />}
    </>
  );
}

function Tebak({ tebak, tebakan, onTebak }: { tebak: NonNullable<AdeganNarasi["tebak"]>; tebakan: string | undefined; onTebak: (t: string) => void }) {
  return (
    <div className="mt-5 w-full">
      <p className="text-center font-heading text-[18px] font-extrabold">{tebak.pertanyaan}</p>
      <div role="group" aria-label="Pilihan tebakan" className="mt-3 flex flex-wrap justify-center gap-3">
        {tebak.pilihan.map((p) => {
          const kunci = Boolean(tebakan) && p === tebak.jawaban;
          return (
            <motion.button
              key={p}
              type="button"
              aria-pressed={tebakan === p}
              disabled={Boolean(tebakan)}
              onClick={() => onTebak(p)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex min-h-14 min-w-24 cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 px-5 font-heading text-[20px] font-extrabold transition-colors focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none disabled:cursor-default",
                kunci
                  ? "border-emas bg-emas text-teks"
                  : tebakan === p
                    ? "border-jingga bg-pasir-muda"
                    : "border-jingga/40 bg-pasir shadow-[0_4px_0_#e2b783]",
                tebakan && !kunci && tebakan !== p && "opacity-60",
              )}
            >
              {kunci && <Check className="size-5" strokeWidth={3} aria-hidden />}
              {p}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {tebakan && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="mx-auto mt-4 max-w-xl rounded-2xl bg-merah-muda/25 px-4 py-3 text-center text-[16px] leading-relaxed font-semibold"
          >
            {tebakan === tebak.jawaban ? "Hebat! " : "Yuk, lihat bareng: "}
            {tebak.penjelasan}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
