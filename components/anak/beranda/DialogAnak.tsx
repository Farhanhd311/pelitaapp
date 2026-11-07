"use client";

// Dua dialog kecil di Beranda Anak: panduan cara bermain dan ajakan istirahat.
// Teks pendek dan tombol tutup besar (>= 56px).

import type { ReactNode } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MascotPijar, type EkspresiPijar, type GerakPijar } from "@/components/anak/MascotPijar";

type Props = { pemicu: ReactNode; className?: string };

const LANGKAH_PANDUAN = [
  "Ketuk tombol Mulai Belajar.",
  "Ceritakan dulu kondisimu hari ini.",
  "Belajar dan jawab soal pelan-pelan. Boleh istirahat kapan saja.",
];

export function DialogPanduan({ pemicu, className }: Props) {
  return (
    <DialogDasar
      pemicu={pemicu}
      className={className}
      ekspresi="tenang"
      gerak="idle"
      judul="Cara bermain"
      deskripsi="Kalau bingung, panggil ayah, ibu, atau kakak pendampingmu ya."
      tombolTutup="Aku mengerti!"
    >
      <ol className="flex flex-col gap-2 text-left">
        {LANGKAH_PANDUAN.map((teks, i) => (
          <li key={teks} className="flex items-center gap-3 rounded-[14px] bg-pasir px-3 py-2.5 text-[15px] text-teks">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bata font-heading font-bold text-white">
              {i + 1}
            </span>
            {teks}
          </li>
        ))}
      </ol>
    </DialogDasar>
  );
}

export function DialogIstirahat({ pemicu, className }: Props) {
  return (
    <DialogDasar
      pemicu={pemicu}
      className={className}
      ekspresi="istirahat"
      gerak="lelah"
      judul="Istirahat dulu, ya"
      deskripsi="Tarik napas pelan-pelan, minum air, lalu rebahan sebentar. Petualanganmu aman dan tetap menunggu di sini."
      tombolTutup="Oke, Pijar!"
    />
  );
}

function DialogDasar(props: {
  pemicu: ReactNode;
  className?: string;
  ekspresi: EkspresiPijar;
  gerak: GerakPijar;
  judul: string;
  deskripsi: string;
  tombolTutup: string;
  children?: ReactNode;
}) {
  const { pemicu, className, ekspresi, gerak, judul, deskripsi, tombolTutup, children } = props;

  return (
    <Dialog>
      <DialogTrigger className={className}>{pemicu}</DialogTrigger>
      <DialogContent showCloseButton={false} className="gap-4 rounded-3xl bg-krem p-6 text-center sm:max-w-md">
        <div className="mx-auto">
          <MascotPijar ekspresi={ekspresi} gerak={gerak} ukuran={130} />
        </div>
        <div className="flex items-center justify-center gap-3">
          <DialogTitle className="font-heading text-2xl font-extrabold text-teks">{judul}</DialogTitle>
        </div>
        {children}
        <DialogDescription className="text-[15px] leading-relaxed text-teks-2">{deskripsi}</DialogDescription>
        <DialogClose className="min-h-14 rounded-full bg-bata font-heading text-[17px] font-extrabold text-white shadow-[0_4px_0_var(--color-bata-tua)] transition hover:bg-bata-tua">
          {tombolTutup}
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
