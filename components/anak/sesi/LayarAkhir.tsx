"use client";

// Layar penutup sesi: selesai (dengan perayaan jika TP tercapai), berhenti (istirahat), atau santai
// (level istirahat: tanpa kuis). Kalimat utama datang dari server (`pesan`), bingkainya selalu positif.

import { motion } from "motion/react";
import { Headphones, Sparkles, Star } from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { TautanAnak } from "@/components/anak/fokus/TombolAnak";
import type { ResponsSesi } from "@/lib/kontrak/sesi";

export function LayarAkhir({ sesi }: { sesi: ResponsSesi }) {
  const tercapai = sesi.status === "selesai" && sesi.tp_tercapai;
  const istirahat = sesi.status === "berhenti" || sesi.status === "santai";

  const judul = tercapai ? "Yeay, kamu berhasil!" : sesi.status === "selesai" ? "Kerja bagus hari ini!" : "Istirahat dulu, ya";

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center pt-6 text-center"
    >
      <div className="relative">
        {tercapai && <Bintang />}
        <MascotPijar ekspresi={istirahat ? "istirahat" : "senang"} gerak={istirahat ? "lelah" : "senang"} ukuran={190} />
      </div>
      <h1 className="mt-3 text-[30px] leading-tight font-extrabold sm:text-[34px]">{judul}</h1>
      <p className="mt-2 max-w-md text-[17px] leading-relaxed text-teks-2">{sesi.pesan}</p>

      {tercapai && sesi.tp && (
        <p className="mt-4 flex items-start gap-2 rounded-[20px] bg-emas/30 px-5 py-3 text-left text-[15px] font-bold">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-bata" aria-hidden />
          {sesi.tp.deskripsi}
        </p>
      )}
      {sesi.status === "selesai" && sesi.nomor_soal > 0 && !tercapai && (
        <p className="mt-4 rounded-full bg-white/85 px-5 py-2 font-bold">Kamu sudah menjawab {sesi.nomor_soal} soal hari ini 🌱</p>
      )}

      {sesi.status === "santai" && (
        <div className="mt-6 w-full rounded-[20px] border-2 border-garis bg-white/85 p-4 text-left">
          <p className="flex items-center gap-2 font-extrabold">
            <Headphones className="size-5 text-bata" aria-hidden /> Cerita dan musik santai
          </p>
          <p className="mt-1 text-[15px] text-teks-2">Segera hadir. Untuk sekarang, rebahan, tarik napas pelan-pelan, dan minum air, ya.</p>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        {!istirahat && (
          <TautanAnak varian="kedua" href="/anak/peta">
            Lihat peta
          </TautanAnak>
        )}
        <TautanAnak href="/anak" className="sm:min-w-56">
          Kembali ke Beranda
        </TautanAnak>
      </div>
    </motion.section>
  );
}

// Bintang kecil yang memancar sekali saat TP tercapai.
function Bintang() {
  const arah = [
    [-110, -60],
    [110, -70],
    [-130, 40],
    [130, 30],
    [-60, -120],
    [70, -115],
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {arah.map(([x, y], i) => (
        <motion.span
          key={i}
          className="absolute text-emas"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x, y, opacity: [0, 1, 1, 0.85], scale: 1, rotate: 30 }}
          transition={{ duration: 1, delay: 0.15 + i * 0.05, ease: "easeOut" }}
        >
          <Star className="size-7 fill-emas" />
        </motion.span>
      ))}
    </div>
  );
}
