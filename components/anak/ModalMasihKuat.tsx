"use client";

// Cek "Masih kuat?" selama sesi (PANDUAN 7.1). Kapan muncul dan apa akibat tiap pilihan diputuskan
// SERVER dengan aturan tetap (bukan LLM); layar ini hanya menampilkan pilihan dan mengirim jawabannya.
// Wajib dijawab (tidak bisa ditutup), tetapi semua pilihan aman: berhenti tidak dihitung gagal.

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "cn";
import { MascotPijar, type EkspresiPijar } from "@/components/anak/MascotPijar";
import type { PilihanMasihKuat } from "@/lib/kontrak/sesi";

const PILIHAN: { nilai: PilihanMasihKuat; ekspresi: EkspresiPijar; judul: string; keterangan: string }[] = [
  { nilai: "masih_kuat", ekspresi: "semangat", judul: "Masih kuat!", keterangan: "Lanjut belajar" },
  { nilai: "agak_capek", ekspresi: "tenang", judul: "Agak capek", keterangan: "Lanjut pelan-pelan" },
  { nilai: "istirahat", ekspresi: "istirahat", judul: "Mau istirahat", keterangan: "Berhenti dulu" },
  { nilai: "pusing", ekspresi: "empati", judul: "Kepalaku pusing", keterangan: "Berhenti, kabari pendamping" },
];

const PEMBUKA = {
  durasi_tercapai: "Kamu sudah belajar cukup lama hari ini.",
  salah_beruntun: "Soalnya agak sulit, ya? Tidak apa-apa.",
  tengah_sesi_penuh: "Wah, sudah setengah jalan!",
} as const;

export function ModalMasihKuat({
  alasan,
  sibuk,
  onPilih,
}: {
  alasan: keyof typeof PEMBUKA | null;
  sibuk: boolean;
  onPilih: (pilihan: PilihanMasihKuat) => void;
}) {
  const pertama = useRef<HTMLButtonElement>(null);
  useEffect(() => pertama.current?.focus(), []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-teks/40 p-3 sm:items-center sm:p-6">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-masih-kuat"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[28px] bg-krem p-5 text-center shadow-2xl sm:p-8"
      >
        <p className="text-[16px] font-semibold text-teks-2">{alasan ? PEMBUKA[alasan] : "Kamu sudah belajar dengan rajin."}</p>
        <h2 id="judul-masih-kuat" className="mt-1 text-[30px] font-extrabold">
          Masih kuat?
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          {PILIHAN.map((p, i) => (
            <motion.button
              key={p.nilai}
              ref={i === 0 ? pertama : undefined}
              type="button"
              disabled={sibuk}
              onClick={() => onPilih(p.nilai)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "flex min-h-14 cursor-pointer touch-manipulation flex-col items-center gap-1 rounded-[22px] border-2 border-garis bg-white px-3 pt-3 pb-4 shadow-[0_6px_0_var(--color-garis)] transition-[border-color,background-color] hover:border-jingga hover:bg-pasir-muda focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none disabled:opacity-50",
              )}
            >
              <MascotPijar ekspresi={p.ekspresi} ukuran={84} gerak={p.nilai === "masih_kuat" ? "senang" : "idle"} />
              <span className="font-heading text-[19px] font-extrabold">{p.judul}</span>
              <span className="text-[13px] text-teks-2">{p.keterangan}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
