"use client";

// Peta petualangan di Beranda Anak.
// - Tablet & desktop (md ke atas): "panggung" 880x727 px persis seperti desain, lalu diperbesar/diperkecil
//   seluruhnya agar memenuhi sisa layar (maks. SKALA_MAKS). Tombol tetap minimal 56px nyata lewat --s.
// - Ponsel (di bawah md): jalur disusun tegak satu kolom, bukan sekadar diperkecil.

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Lock, MapPin } from "lucide-react";
import { MascotPijar, type EkspresiPijar } from "@/components/anak/MascotPijar";
import { TombolSpeaker } from "@/components/anak/TombolSpeaker";
import { LingkaranSekarang, SimpulSekarang, SimpulTercapai, SimpulTerkunci } from "./SimpulPeta";
import type { DataBeranda } from "./jenis";

const LEBAR = 880;
const TINGGI = 727;

// Latar peta: ubin yang ujung atas & bawahnya menyambung, diulang tegak dan ikut tergulir
// bersama halaman, jadi setinggi apa pun petanya latarnya tidak pernah habis.
// Dipakai versi WebP (diekspor dari peta-pola.svg, 2x): SVG bermask terlalu berat digambar ulang
// saat digulir sehingga gulirannya patah-patah.
const LATAR_PETA = "bg-krem bg-[url(/ilustrasi/peta-pola.webp)] bg-[length:100%_auto] bg-top bg-repeat-y";

type Props = Pick<DataBeranda, "namaAnak" | "sebelumnya" | "sekarang" | "berikutnya"> & { hrefMulai: string };

export function PetaPetualangan(props: Props) {
  return (
    <>
      <PanggungPeta {...props} />
      <JalurPonsel {...props} />
    </>
  );
}

function GelembungPijar({ namaAnak, ajakan, style }: { namaAnak: string; ajakan: string; style?: CSSProperties }) {
  const teks = `Hai, ${namaAnak}! Aku Pijar.`;
  return (
    <div className="relative flex items-center gap-2 rounded-[20px] border border-garis bg-white py-3 pr-2.5 pl-3.5" style={style}>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-extrabold text-teks">{teks}{" "}🔥</p>
        <p className="mt-0.5 text-[13px] text-teks-2">{ajakan}</p>
      </div>
      <TombolSpeaker
        teks={`${teks} ${ajakan} Ketuk tombol Mulai Belajar kalau kamu sudah siap.`}
        className="size-[calc(56px/var(--s,1))] shrink-0"
      />
      {/* ekor gelembung */}
      <span className="absolute -bottom-[9px] left-1/2 size-4 rotate-45 border-r border-b border-garis bg-white" aria-hidden />
    </div>
  );
}

function TombolMulai({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`flex min-h-[calc(56px/var(--s,1))] items-center justify-center rounded-full bg-bata px-6 font-heading text-[17px] font-extrabold text-white shadow-[0_4px_0_var(--color-bata-tua)] transition hover:bg-bata-tua focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-0.5 ${className ?? ""}`}
    >
      Mulai Belajar!
    </Link>
  );
}

function Legenda() {
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 rounded-full border border-garis bg-white px-4 text-xs font-semibold text-teks">
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emas" />Tercapai</span>
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-bata" />Kamu di sini</span>
      <span className="flex items-center gap-1.5"><Lock className="size-3.5" aria-hidden />Segera Hadir</span>
      {/* -my-2: bilah tetap ramping, tapi area ketuk tautan tetap 56px */}
      <Link href="/anak/peta" className="-my-2 ml-auto flex min-h-14 items-center font-bold hover:underline">
        Jelajahi peta lengkap →
      </Link>
    </div>
  );
}

/* ---------- Tablet & desktop ---------- */

// Panggung paling besar 1,5x ukuran desain, supaya di layar lebar tidak terlalu raksasa.
const SKALA_MAKS = 1.5;
// Demi muat satu layar, panggung boleh mengecil sampai 0,8x. Layar yang lebih pendek lagi digulir.
const SKALA_MIN_TINGGI = 0.8;
// Ruang di bawah legenda (px).
const RUANG_BAWAH = 16;

// Semua pos berada di satu jalur ular dengan jarak tegak yang sama.
// Slot 0 = pos tercapai, slot 1 = pos sekarang, slot 2 dst. = pos terkunci.
// Tiga slot pertama mengikuti desain (di samping gelembung Pijar dan blok "Kamu di sini").
// Sesudahnya jalur berkelok ke seluruh lebar peta mengikuti POLA_SLOT yang diulang, dan sisi
// yang tidak dilewati jalur diisi Pijar supaya tidak ada ruang kosong.
// label: sisi tulisan pos, dipilih yang jauh dari tepi peta dan tidak tertimpa garis.
type Slot = { x: number; label: "kiri" | "kanan"; pijar?: { x: number; ekspresi: EkspresiPijar } };
const SLOT_AWAL: Slot[] = [
  { x: 355, label: "kiri" },
  { x: 560, label: "kanan" },
  { x: 355, label: "kiri" },
];
const POLA_SLOT: Slot[] = [
  { x: 760, label: "kiri", pijar: { x: 180, ekspresi: "penasaran" } },
  { x: 120, label: "kanan", pijar: { x: 690, ekspresi: "semangat" } },
  { x: 700, label: "kiri", pijar: { x: 200, ekspresi: "senang" } },
  { x: 170, label: "kanan", pijar: { x: 680, ekspresi: "peduli" } },
  { x: 480, label: "kanan", pijar: { x: 170, ekspresi: "tenang" } },
];
const JARAK_POS = 220;
const Y_SLOT_AWAL = 146;
const UKURAN_PIJAR_HIASAN = 120;

function slotKe(k: number): Slot {
  return k < SLOT_AWAL.length ? SLOT_AWAL[k] : POLA_SLOT[(k - SLOT_AWAL.length) % POLA_SLOT.length];
}
function letakSlot(k: number) {
  return { x: slotKe(k).x, y: Y_SLOT_AWAL + k * JARAK_POS };
}

// Satu garis melewati pusat semua pos. Tiap ruas adalah lengkung S yang tegak di pusat pos,
// jadi sambungannya mulus tanpa siku.
function jalurUlar(slot: number[]) {
  const [awal, ...sisa] = slot.map(letakSlot);
  let d = `M${awal.x} ${awal.y}`;
  let a = awal;
  for (const b of sisa) {
    const h = (b.y - a.y) / 2;
    d += `C${a.x} ${a.y + h} ${b.x} ${b.y - h} ${b.x} ${b.y}`;
    a = b;
  }
  return d;
}

function PanggungPeta({ namaAnak, sebelumnya, sekarang, berikutnya, hrefMulai }: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  // ruang = tinggi layar pertama (bagian panggung setinggi desain), sebelum pos tambahan di bawahnya.
  const [ukuran, setUkuran] = useState({ skala: 1, ruang: TINGGI });

  useLayoutEffect(() => {
    const el = wadah.current;
    if (!el) return;
    const ukur = () => {
      // Sisa tinggi layar di bawah judul. Di bawah lg ada bar navigasi bawah (pb-20 = 80px).
      // scrollTop induk: di layar lebar peta bergulir di dalam induknya sendiri, bukan di window.
      const atas = el.getBoundingClientRect().top + window.scrollY + (el.parentElement?.scrollTop ?? 0);
      const barBawah = window.matchMedia("(min-width: 1024px)").matches ? 0 : 80;
      const sisaTinggi = window.innerHeight - atas - barBawah - RUANG_BAWAH;

      const skalaLebar = el.clientWidth / LEBAR;
      const skalaTinggi = sisaTinggi / TINGGI;
      // Bagian setinggi desain mengisi penuh sisa layar; kalau layar terlalu pendek, berhenti di
      // SKALA_MIN_TINGGI dan halaman digulir. Pos tambahan selalu menyambung ke bawah (digulir).
      const skala = Math.min(skalaLebar, SKALA_MAKS, Math.max(skalaTinggi, SKALA_MIN_TINGGI));
      setUkuran({ skala, ruang: Math.max(sisaTinggi, TINGGI * skala) });
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(el);
    window.addEventListener("resize", ukur);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", ukur);
    };
  }, []);

  const { skala, ruang } = ukuran;
  const tambahan = Math.max(0, berikutnya.length - 1) * JARAK_POS;
  const tinggiPanggung = TINGGI + tambahan;
  const tinggi = ruang + tambahan * skala + RUANG_BAWAH;
  // Bagian setinggi desain diletakkan di tengah (tegak) bila layar pertama lebih tinggi darinya.
  const atasPanggung = Math.max(0, (ruang - TINGGI * skala) / 2);

  const slotSekarang = 1;
  const slotTerkunci = berikutnya.map((_, i) => slotSekarang + 1 + i);
  const slotAda = [...(sebelumnya ? [0] : []), slotSekarang, ...slotTerkunci];
  const posSekarang = letakSlot(slotSekarang);

  return (
    <div ref={wadah} className={`relative hidden overflow-hidden md:block ${LATAR_PETA}`} style={{ height: tinggi }}>
      <div
        className="absolute left-1/2 origin-top"
        style={{ top: atasPanggung, width: LEBAR, height: tinggiPanggung, transform: `translateX(-50%) scale(${skala})`, "--s": skala } as CSSProperties}
      >
        {/* jalur titik-titik antar pos */}
        <svg className="absolute inset-0" width={LEBAR} height={tinggiPanggung} aria-hidden>
          {slotAda.length > 1 && <JalurTitik d={jalurUlar(slotAda)} />}
        </svg>

        {/* Pijar menyapa */}
        <GelembungPijar namaAnak={namaAnak} ajakan={sekarang.ajakan} style={{ position: "absolute", left: 40, top: 218, width: 266 }} />
        <div className="absolute flex items-center justify-center" style={{ left: 52, top: 312, width: 286, height: 232 }}>
          <MascotPijar ekspresi="sambut" gerak="idle" ukuran={190} />
        </div>

        {/* Setiap pos: kotaknya hanya lingkaran, diletakkan dengan pusatnya tepat di titik slot */}
        {sebelumnya && (
          <TitikPos k={0}>
            <SimpulTercapai judul={sebelumnya.judul} labelDi={slotKe(0).label} />
          </TitikPos>
        )}

        <TitikPos k={slotSekarang}>
          <LingkaranSekarang judul={sekarang.judul} href={hrefMulai} />
        </TitikPos>

        {/* Label pos sekarang + tombol mulai, di sisi kanan pos */}
        <div className="absolute -translate-y-1/2" style={{ left: posSekarang.x + 68, top: posSekarang.y, width: 220 }}>
          <p className="flex items-center gap-1.5 font-heading text-[13px] font-bold text-bata">
            <MapPin className="size-4" aria-hidden /> Kamu di sini!
          </p>
          <p className="mt-1 font-heading text-[19px] font-extrabold text-teks">{sekarang.judul}</p>
          <p className="text-[13px] text-teks-2">{sekarang.keterangan}</p>
          <TombolMulai href={hrefMulai} className="mt-3 w-full" />
          <p className="mt-2.5 text-xs text-teks-2">Pelajaran lain menyusul ya! 😊</p>
        </div>

        {berikutnya.map((p, i) => (
          <TitikPos key={p.judul} k={slotTerkunci[i]}>
            <SimpulTerkunci judul={p.judul} labelDi={slotKe(slotTerkunci[i]).label} />
          </TitikPos>
        ))}

        {/* Pijar hiasan di sisi baris yang tidak dilewati jalur (hanya pemanis, disembunyikan dari pembaca layar) */}
        {slotTerkunci.map((k) => {
          const { pijar } = slotKe(k);
          if (!pijar) return null;
          return (
            <div
              key={k}
              aria-hidden
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pijar.x, top: letakSlot(k).y }}
            >
              <MascotPijar ekspresi={pijar.ekspresi} gerak="idle" ukuran={UKURAN_PIJAR_HIASAN} />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-5 bottom-2">
        <Legenda />
      </div>
    </div>
  );
}

function TitikPos({ k, children }: { k: number; children: ReactNode }) {
  const { x, y } = letakSlot(k);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      {children}
    </div>
  );
}

function JalurTitik({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke="#f9daac" strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#dc895b" strokeWidth={7} strokeLinecap="round" strokeDasharray="0 14" fill="none" />
    </>
  );
}

/* ---------- Ponsel ---------- */

function JalurPonsel({ namaAnak, sebelumnya, sekarang, berikutnya, hrefMulai }: Props) {
  return (
    <div className={`flex flex-col gap-6 px-4 py-6 md:hidden ${LATAR_PETA}`}>
      <div className="flex items-end gap-2">
        <MascotPijar ekspresi="sambut" gerak="idle" ukuran={96} className="shrink-0" />
        <GelembungPijar namaAnak={namaAnak} ajakan={sekarang.ajakan} style={{ flex: 1, marginBottom: 24 }} />
      </div>

      {/* garis titik tegak di belakang pos */}
      <div className="relative isolate flex flex-col items-center gap-8 py-2">
        <span className="absolute top-8 bottom-16 left-1/2 -z-10 w-[18px] -translate-x-1/2 rounded-full bg-pasir" aria-hidden />
        {sebelumnya && <SimpulTercapai judul={sebelumnya.judul} />}

        <div className="relative flex w-full flex-col items-center rounded-3xl bg-white/70 p-4">
          <p className="mb-3 flex items-center gap-1.5 font-heading text-[13px] font-bold text-bata">
            <MapPin className="size-4" aria-hidden /> Kamu di sini!
          </p>
          <SimpulSekarang judul={sekarang.judul} keterangan={sekarang.keterangan} href={hrefMulai} />
          <TombolMulai href={hrefMulai} className="mt-4 w-full" />
          <p className="mt-2 text-xs text-teks-2">Pelajaran lain menyusul ya! 😊</p>
        </div>

        {berikutnya.map((p) => (
          <SimpulTerkunci key={p.judul} judul={p.judul} />
        ))}
      </div>

      <Legenda />
    </div>
  );
}
