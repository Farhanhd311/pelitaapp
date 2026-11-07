"use client";

// Kartu soal pilihan ganda untuk anak. Dipakai bersama oleh sesi belajar DAN asesmen supaya tampilannya sama.
// - Urutan pilihan sudah diacak di server; kunci jawaban tidak pernah dikirim ke browser.
// - Pilih dulu, lalu tekan "Kirim jawaban" (dua langkah supaya anak tidak salah ketuk).
// - Tidak ada timer. Setelah dikirim, pilihan dikunci; warnanya tetap netral (tidak ada merah/"Salah").

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "cn";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";
import type { SoalTampil } from "@/lib/kontrak/umum";

const HURUF = ["A", "B", "C", "D"];

// Visual soal (emoji pengganti gambar). Pemisah " | " di data berarti kelompok, misalnya 4 piring
// berisi 3 jeruk: tiap kelompok jadi kotak sendiri yang tidak pernah terbelah saat layar sempit.
function VisualSoal({ visual }: { visual: string }) {
  const kelompok = visual.includes(" | ") ? visual.split(" | ").map((k) => k.trim()) : null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-5 w-full max-w-2xl rounded-[24px] bg-pasir-muda px-4 py-5 text-center text-[28px] leading-snug sm:px-6 sm:text-[40px]"
      role="img"
      aria-label={`Gambar soal: ${visual}`}
    >
      {kelompok ? (
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {kelompok.map((isi, i) => (
            <span key={i} className="rounded-2xl border-2 border-jingga/35 bg-white/80 px-3 py-1.5 whitespace-nowrap">
              {isi}
            </span>
          ))}
        </div>
      ) : (
        <p className="tracking-wider wrap-break-word whitespace-pre-line">{visual}</p>
      )}
    </motion.div>
  );
}

export function KartuSoal({
  soal,
  label,
  terkunci = false,
  pilihanAwal = null,
  sibuk = false,
  onKirim,
}: {
  soal: SoalTampil;
  /** Chip kecil di atas pertanyaan, misalnya deskripsi singkat TP. */
  label?: string;
  /** true setelah jawaban dikirim: pilihan tidak bisa diubah. */
  terkunci?: boolean;
  /** Pilihan yang sudah dikirim (ditampilkan tersorot saat terkunci). */
  pilihanAwal?: number | null;
  sibuk?: boolean;
  onKirim: (pilihanId: number) => void;
}) {
  const [dipilih, setDipilih] = useState<number | null>(pilihanAwal);

  return (
    <div className="flex w-full flex-col items-center">
      {label && <p className="mb-3 max-w-full truncate rounded-full bg-emas px-4 py-1.5 text-sm font-extrabold text-teks">{label}</p>}

      {soal.bacaan && (
        <p className="mb-4 w-full max-w-2xl rounded-[20px] border border-garis bg-white/85 p-5 text-left text-[17px] leading-relaxed">{soal.bacaan}</p>
      )}

      <h2 id={`soal-${soal.soal_id}`} className="max-w-2xl text-center text-[24px] leading-snug font-extrabold text-balance sm:text-[30px]">
        {soal.pertanyaan}
      </h2>

      {soal.visual && <VisualSoal visual={soal.visual} />}

      <div role="radiogroup" aria-labelledby={`soal-${soal.soal_id}`} className="mt-7 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {soal.pilihan.map((p, i) => {
          const aktif = dipilih === p.pilihan_id;
          return (
            <motion.button
              key={p.pilihan_id}
              type="button"
              role="radio"
              aria-checked={aktif}
              disabled={terkunci || sibuk}
              onClick={() => setDipilih(p.pilihan_id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, type: "spring", stiffness: 320, damping: 26 }}
              whileTap={terkunci ? undefined : { scale: 0.97 }}
              className={cn(
                "flex min-h-[72px] cursor-pointer touch-manipulation items-center gap-4 rounded-[20px] border-2 px-4 py-3 text-left transition-[border-color,background-color,box-shadow,opacity] duration-200 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none disabled:cursor-default",
                aktif
                  ? "border-bata bg-white shadow-[0_5px_0_var(--color-bata)]"
                  : "border-jingga/35 bg-pasir shadow-[0_5px_0_#e2b783] hover:border-jingga",
                terkunci && !aktif && "opacity-55",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-extrabold transition-colors",
                  aktif ? "bg-bata text-white" : "bg-emas text-teks",
                )}
                aria-hidden
              >
                {HURUF[i]}
              </span>
              <span className="min-w-0 flex-1 text-center font-heading text-[22px] font-extrabold break-words sm:text-[24px]">{p.teks}</span>
              <span className="w-10 shrink-0" aria-hidden />
            </motion.button>
          );
        })}
      </div>

      {!terkunci && (
        <TombolAnak className="mt-8 w-full sm:w-auto sm:min-w-64" disabled={dipilih === null || sibuk} onClick={() => dipilih !== null && onKirim(dipilih)}>
          {sibuk ? "Mengirim…" : "Kirim jawaban"}
        </TombolAnak>
      )}
    </div>
  );
}
