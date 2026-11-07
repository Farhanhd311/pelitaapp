// Tiga kartu di sisi peta: target mingguan, tips, dan ajakan istirahat.
// Target dihitung per minggu dan tidak bisa "putus" (PANDUAN 7.1 dan 13).

import Link from "next/link";
import { Check, Heart, Leaf, Lightbulb, Sprout } from "lucide-react";
import { cn } from "cn";
import { DialogIstirahat } from "./DialogAnak";
import type { DataBeranda } from "./jenis";

export function KartuSamping({ mekarMingguIni }: Pick<DataBeranda, "mekarMingguIni">) {
  return (
    <>
      <KartuMekar {...mekarMingguIni} />
      <KartuTahukahKamu />
      <KartuJeda />
    </>
  );
}

function KartuMekar({ selesai, target }: DataBeranda["mekarMingguIni"]) {
  return (
    <section className="rounded-[20px] border border-garis bg-white p-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-teks">
        <Sprout className="size-5 text-bata" aria-hidden /> Mekar minggu ini
      </h2>
      <ul className="mt-4 flex justify-center gap-3" aria-label={`${selesai} dari ${target} sudah mekar`}>
        {Array.from({ length: target }, (_, i) => {
          const mekar = i < selesai;
          return (
            <li
              key={i}
              className={cn(
                "flex size-12 items-center justify-center rounded-[14px]",
                mekar ? "bg-emas text-teks" : "bg-pasir-muda text-jingga",
              )}
            >
              {mekar ? <Check className="size-6" strokeWidth={3} aria-hidden /> : <Leaf className="size-6" aria-hidden />}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 font-heading text-[15px] font-bold text-bata">
        {selesai} dari {target} sudah mekar! 🌱
      </p>
      <p className="mt-2 text-[13px] text-teks-2">Boleh kapan kamu siap. Santai saja!</p>
    </section>
  );
}

function KartuTahukahKamu() {
  return (
    <section className="rounded-[20px] border border-garis bg-white p-5 pb-2">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-teks">
        <Lightbulb className="size-5 text-bata" aria-hidden /> Tahukah kamu?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-teks-2">Keliru itu normal! Pijar selalu menemanimu mencoba lagi. 😊</p>
      <Link href="/anak/peta" className="flex min-h-14 items-center font-heading text-sm font-bold text-bata hover:underline">
        Lihat Peta Kelasku →
      </Link>
    </section>
  );
}

function KartuJeda() {
  return (
    <section className="rounded-[20px] bg-merah-muda/30 p-5">
      <h2 className="text-base font-extrabold text-teks">Butuh jeda? 😌</h2>
      <p className="mt-2 text-sm leading-relaxed text-teks-2">Tarik napas, minum air. Petualanganmu tetap menunggu di sini.</p>
      <DialogIstirahat
        className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-full bg-bata px-5 font-heading text-[15px] font-bold text-white transition hover:bg-bata-tua"
        pemicu={
          <>
            <Heart className="size-5" aria-hidden /> Mau istirahat
          </>
        }
      />
    </section>
  );
}
