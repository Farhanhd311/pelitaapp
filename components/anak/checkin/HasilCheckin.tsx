"use client";

// Layar hasil check-in: level sesi hari ini dari server (tentukanLevel, aturan tetap PANDUAN 7.1).
// Tidak ada timer: durasi hanya ditulis kira-kira.

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Headphones, HeartHandshake, RotateCcw } from "lucide-react";
import { MascotPijar, type EkspresiPijar, type GerakPijar } from "@/components/anak/MascotPijar";
import { TautanAnak, TombolAnak } from "@/components/anak/fokus/TombolAnak";
import { denganMapel, HREF_PETA, HREF_SESI_HARI_INI } from "@/components/anak/sesi/jalur";
import type { ResponsCheckin } from "@/lib/kontrak/checkin";
import type { LevelSesi } from "@/lib/kontrak/umum";

const TEMA: Record<LevelSesi, { ekspresi: EkspresiPijar; gerak: GerakPijar; judul: string; isi: string }> = {
  istirahat: {
    ekspresi: "istirahat",
    gerak: "lelah",
    judul: "Hari ini istirahat dulu, ya",
    isi: "Tubuhmu sedang butuh istirahat. Belajarnya bisa lain kali. Petualanganmu tetap menunggu.",
  },
  ringan: {
    ekspresi: "tenang",
    gerak: "idle",
    judul: "Kita santai dulu, ya",
    isi: "Hari ini kita mengulang hal yang sudah kamu kuasai. Sebentar saja, pelan-pelan.",
  },
  normal: {
    ekspresi: "senang",
    gerak: "idle",
    judul: "Siap belajar hal baru!",
    isi: "Kita kenalan dengan materi baru, lalu jawab beberapa soal.",
  },
  penuh: {
    ekspresi: "semangat",
    gerak: "senang",
    judul: "Wah, kamu semangat sekali!",
    isi: "Hari ini ada materi baru, latihan, dan tantangan. Jangan lupa jeda, ya.",
  },
};

export function HasilCheckin({
  hasil,
  sudahSebelumnya,
  mapelId,
  onUbah,
}: {
  hasil: ResponsCheckin;
  sudahSebelumnya: boolean;
  mapelId: number | null; // mapel yang dipilih di Beranda (dibawa ke sesi)
  onUbah: () => void;
}) {
  const tema = TEMA[hasil.level];
  // Hati mendung menurunkan isi menjadi mengulang walau levelnya normal/penuh.
  const isi = hasil.jenis_isi === "ulang" && hasil.level !== "ringan" ? "Hari ini kita mengulang yang sudah kamu kuasai dulu, supaya hatimu lebih ringan." : tema.isi;
  const istirahat = hasil.level === "istirahat";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center pt-4 text-center"
    >
      {sudahSebelumnya && <p className="mb-2 rounded-full bg-pasir px-4 py-1.5 text-sm font-bold text-teks-2">Kamu sudah check-in hari ini</p>}
      <MascotPijar ekspresi={tema.ekspresi} gerak={tema.gerak} ukuran={170} />
      <h1 className="mt-2 text-[28px] leading-tight font-extrabold text-balance sm:text-[32px]">{tema.judul}</h1>
      <p className="mt-2 max-w-md text-[17px] leading-relaxed text-teks-2">{isi}</p>

      {!istirahat && hasil.mode_audio && (
        <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Rencana sesi hari ini">
          <Info ikon={<Headphones className="size-4.5" aria-hidden />}>Lebih banyak mendengar, matamu istirahat</Info>
        </ul>
      )}

      {hasil.tawarkan_beri_tahu_pendamping && (
        <KartuAjakan warna="emas" ikon={<HeartHandshake className="size-6 text-bata" aria-hidden />}>
          Panggil Ayah, Ibu, atau kakak pendampingmu, ya. Bilang badanmu sedang sakit sekali.
        </KartuAjakan>
      )}

      <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <TombolAnak varian="lembut" onClick={onUbah}>
          <RotateCcw className="size-5" aria-hidden /> Ubah kondisiku
        </TombolAnak>
        {istirahat ? (
          <TautanAnak href={denganMapel(HREF_PETA, mapelId)} className="sm:min-w-56">
            Kembali ke Beranda
          </TautanAnak>
        ) : (
          <TautanAnak href={denganMapel(HREF_SESI_HARI_INI, mapelId)} className="sm:min-w-56">
            Mulai belajar
          </TautanAnak>
        )}
      </div>

      {/* Jejak aturan tentukanLevel: untuk pendamping (dan juri) yang ingin tahu alasannya. */}
      <details className="mt-6 w-full max-w-md rounded-2xl text-left text-sm text-teks-2 open:bg-white/70 open:p-4">
        <summary className="flex min-h-12 cursor-pointer items-center justify-center font-bold">Kenapa sesinya begini?</summary>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {hasil.alasan.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>
    </motion.div>
  );
}

function Info({ ikon, children }: { ikon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5 rounded-full border border-garis bg-white/85 px-3.5 py-2 text-sm font-bold text-teks">
      <span className="text-bata">{ikon}</span>
      {children}
    </li>
  );
}

function KartuAjakan({ warna, ikon, aksi, children }: { warna: "emas" | "merah-muda"; ikon: ReactNode; aksi?: ReactNode; children: ReactNode }) {
  return (
    <div className={`mt-5 w-full rounded-[20px] p-4 text-left ${warna === "emas" ? "bg-emas/25" : "bg-merah-muda/25"}`}>
      <div className="flex items-start gap-3">
        {ikon}
        <p className="text-[15px] leading-relaxed font-semibold text-teks">{children}</p>
      </div>
      {aksi}
    </div>
  );
}
