"use client";

// Peta petualangan TETAP di Beranda Anak (seperti peta saga): semua pos tampil di tempatnya, yang tuntas
// bercentang, pos aktif bertombol play bersama Pijar, sisanya bergembok. Setiap pos tuntas, play dan Pijar
// pindah ke pos berikutnya; jejak kaki tertinggal di ruas belakang pos aktif.
// - Tablet & desktop (md ke atas): "panggung" selebar 880 px yang diperbesar/diperkecil seluruhnya agar pas di
//   layar (maks. SKALA_MAKS). Tombol tetap minimal 56px nyata lewat --s.
// - Ponsel (di bawah md): jalur disusun tegak satu kolom.
// Jika anak baru maju dari pos lama (dariIndeks), diputar animasi:
//   "awal"  -> Pijar tampil di pos lama, lalu menghilang (pop out)
//   "jalan" -> jejak kaki muncul satu per satu sepanjang ruas menuju pos aktif
//   "diam"  -> Pijar muncul lagi (pop in) di pos aktif. Pengguna "kurangi gerak" langsung ke "diam".
// Peta otomatis bergulir ke pos aktif jika pos itu di luar layar.

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Footprints, MapPin } from "lucide-react";
import { MascotPijar, type EkspresiPijar } from "@/components/anak/MascotPijar";
import { KemajuanPos, LingkaranSekarang, SimpulSekarang, SimpulTercapai, SimpulTerkunci } from "./SimpulPeta";
import type { DataBeranda, PosBeranda } from "./jenis";

const LEBAR = 880;
const TINGGI = 727; // tinggi layar pertama sesuai desain (tiga pos pertama)

// Latar peta: ilustrasi dunia tegak (langit -> daratan -> laut -> gua), menutupi seluruh tinggi peta.
// Lapisan krem tipis menjaga latar tetap terang (PANDUAN 13); label pos punya latar sendiri agar terbaca.
// Ditulis sebagai style langsung karena nama berkasnya mengandung spasi.
const LATAR_PETA: CSSProperties = {
  backgroundColor: "var(--color-krem)",
  backgroundImage:
    'linear-gradient(rgb(255 244 228 / 0.25), rgb(255 244 228 / 0.25)), url("/ilustrasi/Dreamy%20Vertical%20Fantasy%20World%20Map.webp")',
  backgroundSize: "cover",
  backgroundPosition: "top center",
};

type Fase = "awal" | "jalan" | "diam";
type Props = Pick<DataBeranda, "namaAnak" | "pos" | "indeksSekarang" | "sekarang"> & {
  fase: Fase;
  dari: number | null; // indeks pos lama saat animasi maju
};

// Lama tiap tahap animasi maju (ms).
const LAMA_AWAL = 900; // Pijar terlihat dulu di pos lama
const LAMA_POP = 350;
const JEDA_LANGKAH = 260; // antar jejak kaki
const JEJAK_PER_RUAS = 4;
const RUAS_ANIMASI_MAKS = 3; // lompatan jauh tetap singkat: animasi hanya beberapa ruas terakhir

export function PetaPetualangan({ dariIndeks, ...props }: Omit<Props, "fase" | "dari"> & { dariIndeks: number | null }) {
  const kurangiGerak = useReducedMotion();
  const [dari] = useState(
    dariIndeks !== null && !kurangiGerak ? Math.max(dariIndeks, props.indeksSekarang - RUAS_ANIMASI_MAKS) : null,
  );
  const [fase, setFase] = useState<Fase>(dari !== null ? "awal" : "diam");

  useEffect(() => {
    if (dari === null) return;
    const jumlahJejak = (props.indeksSekarang - dari) * JEJAK_PER_RUAS;
    const keJalan = setTimeout(() => setFase("jalan"), LAMA_AWAL);
    const keDiam = setTimeout(() => setFase("diam"), LAMA_AWAL + LAMA_POP + jumlahJejak * JEDA_LANGKAH + 250);
    return () => {
      clearTimeout(keJalan);
      clearTimeout(keDiam);
    };
  }, [dari, props.indeksSekarang]);

  return (
    <>
      <PanggungPeta {...props} fase={fase} dari={dari} />
      <JalurPonsel {...props} fase={fase} dari={dari} />
    </>
  );
}

// Ruas yang diberi jejak kaki (indeks pos awal ruas): saat animasi, semua ruas dari pos lama ke pos aktif;
// selain itu hanya ruas tepat di belakang pos aktif ("bekas langkah").
function ruasJejak(dari: number | null, k: number): number[] {
  if (dari !== null) return Array.from({ length: k - dari }, (_, i) => dari + i);
  return k > 0 ? [k - 1] : [];
}

// Gulir sekali ke pos aktif jika pos itu di luar layar. Tata letak yang tersembunyi (desktop/ponsel) dilewati.
function useGulirKePosAktif(ref: RefObject<HTMLElement | null>, siap: boolean) {
  const sudah = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!siap || sudah.current || !el || el.offsetParent === null) return;
    sudah.current = true;
    const r = el.getBoundingClientRect();
    if (r.top >= 80 && r.bottom <= window.innerHeight - 80) return;
    const kurangi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: kurangi ? "auto" : "smooth" });
  });
}

// Pijar yang muncul/hilang dengan efek "pop" (skala), dipusatkan di titik (x, y) wadahnya.
function PijarPop({ x, y, ukuran, ekspresi }: { x: number | string; y: number | string; ukuran: number; ekspresi: EkspresiPijar }) {
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }} aria-hidden>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0, transition: { duration: LAMA_POP / 1000 } }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
      >
        <MascotPijar ekspresi={ekspresi} gerak="idle" ukuran={ukuran} />
      </motion.div>
    </div>
  );
}

// Satu jejak kaki. sudut: arah jalan (derajat, 0 = ke atas). Saat animasi muncul bergantian sesuai urutan.
function JejakKaki({ x, y, sudut, urutan, fase }: { x: number | string; y: number | string; sudut: number; urutan: number; fase: Fase }) {
  if (fase === "awal") return null;
  const animasi = fase === "jalan";
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y, transform: `translate(-50%, -50%) rotate(${sudut}deg)` }} aria-hidden>
      <motion.div
        initial={animasi ? { scale: 0.3, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 0.9 }}
        transition={{ delay: animasi ? (LAMA_POP + urutan * JEDA_LANGKAH) / 1000 : 0, type: "spring", stiffness: 420, damping: 20 }}
      >
        {/* bayangan putih supaya jejak tetap terlihat di bagian latar yang gelap */}
        <Footprints className="size-[26px] text-bata-tua" strokeWidth={2.25} style={{ filter: "drop-shadow(0 0 2px white)" }} />
      </motion.div>
    </div>
  );
}

// Tanpa tombol speaker (keputusan tim): pendamping yang membacakan.
function GelembungPijar({ namaAnak, sekarang, style }: { namaAnak: string; sekarang: DataBeranda["sekarang"]; style?: CSSProperties }) {
  const { ajakan } = sekarang;
  const teks = `Hai, ${namaAnak}! Aku Pijar.`;
  return (
    <div className="relative flex items-center gap-2 rounded-[20px] border border-garis bg-white py-3 pr-2.5 pl-3.5" style={style}>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-extrabold text-teks">{teks}{" "}🔥</p>
        <p className="mt-0.5 text-[13px] text-teks-2">{ajakan}</p>
      </div>
      {/* ekor gelembung, menunjuk Pijar di kanannya */}
      <span className="absolute top-1/2 -right-[9px] size-4 -translate-y-1/2 rotate-45 border-t border-r border-garis bg-white" aria-hidden />
    </div>
  );
}

// Tanpa href: materi mapel ini belum tersedia, tombol tampil redup dan tidak bisa diketuk.
function TombolMulai({ href, label, className }: { href?: string; label: string; className?: string }) {
  if (!href) {
    return (
      <span
        aria-disabled
        className={`flex min-h-[calc(56px/var(--s,1))] items-center justify-center rounded-full bg-pasir px-6 font-heading text-[17px] font-extrabold text-teks-2 ${className ?? ""}`}
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`flex min-h-[calc(56px/var(--s,1))] items-center justify-center rounded-full bg-bata px-6 font-heading text-[17px] font-extrabold text-white shadow-[0_4px_0_var(--color-bata-tua)] transition hover:bg-bata-tua focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-0.5 ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}

// Pos yang bukan pos aktif: tuntas bercentang, materi tanpa soal berjam pasir ("Segera hadir"), lainnya bergembok.
function SimpulPos({ pos, labelDi, maksLebar }: { pos: PosBeranda; labelDi?: "kiri" | "kanan"; maksLebar?: number }) {
  return pos.tercapai ? (
    <SimpulTercapai judul={pos.judul} chip={pos.chip} labelDi={labelDi} maksLebar={maksLebar} />
  ) : (
    <SimpulTerkunci judul={pos.judul} chip={pos.chip} labelDi={labelDi} segera={pos.segera} maksLebar={maksLebar} />
  );
}

// Ekspresi Pijar saat muncul/menghilang di pos: hanya yang ceria (tanpa "empati" yang menangis dan "istirahat"
// yang mengantuk). Dipilih dari id pos, jadi berganti-ganti antar pos tetapi tetap sama di setiap render
// (tanpa Math.random, supaya tidak berubah saat komponen digambar ulang).
const EKSPRESI_CERIA: EkspresiPijar[] = ["sambut", "senang", "semangat", "tekad", "terkejut", "penasaran", "mengintip", "peduli", "tenang"];

function ekspresiUntuk(kunci: string): EkspresiPijar {
  let h = 0;
  for (const c of kunci) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return EKSPRESI_CERIA[h % EKSPRESI_CERIA.length];
}

/* ---------- Tablet & desktop ---------- */

// Panggung paling besar 1,5x ukuran desain, supaya di layar lebar tidak terlalu raksasa.
const SKALA_MAKS = 1.5;
// Demi muat satu layar, panggung boleh mengecil sampai 0,8x. Layar yang lebih pendek lagi digulir.
const SKALA_MIN_TINGGI = 0.8;
// Ruang di bawah pos terakhir (px).
const RUANG_BAWAH = 16;
// Ruang di atas peta untuk lapisan judul + lencana + tombol menu ☰ dari AlurBeranda (px nyata, tidak diskalakan).
// Ponsel lebih kecil karena kotak judulnya lebih kecil.
const RUANG_ATAS = 124;
const RUANG_ATAS_PONSEL = 96;

// Semua pos berada di satu jalur ular dengan jarak tegak yang sama. Pos ke-k selalu di slot k.
// Tiga slot pertama mengikuti desain; sesudahnya jalur berkelok ke seluruh lebar peta mengikuti POLA_SLOT
// yang diulang. Pijar hanya tampil di pos aktif ("Kamu di sini").
// label: sisi tulisan pos, dipilih yang jauh dari tepi peta dan tidak tertimpa garis.
type Slot = { x: number; label: "kiri" | "kanan" };
const SLOT_AWAL: Slot[] = [
  { x: 355, label: "kiri" },
  { x: 560, label: "kanan" },
  { x: 355, label: "kiri" },
];
const POLA_SLOT: Slot[] = [
  { x: 760, label: "kiri" },
  { x: 120, label: "kanan" },
  { x: 700, label: "kiri" },
  { x: 170, label: "kanan" },
  { x: 480, label: "kanan" },
];
const JARAK_POS = 220;
const Y_SLOT_AWAL = 146;
const UKURAN_PIJAR = 140;
const UKURAN_PIJAR_LAMA = 116;
const LEBAR_INFO = 244; // kartu "Kamu di sini"
// Jarak kartu dari pusat pos. Di sisi kiri lebih lebar, karena ruas jalur dari pos sebelumnya masuk dari kiri atas
// dan jejak kakinya jangan tertutup kartu.
const JARAK_INFO = { kanan: 62, kiri: 96 };

function slotKe(k: number): Slot {
  return k < SLOT_AWAL.length ? SLOT_AWAL[k] : POLA_SLOT[(k - SLOT_AWAL.length) % POLA_SLOT.length];
}
function letakSlot(k: number) {
  return { x: slotKe(k).x, y: Y_SLOT_AWAL + k * JARAK_POS };
}

// Ruang untuk judul pos di sisi labelnya: dari pusat pos ke tepi panggung, ditambah ruang kosong di luar panggung
// pada layar lebar (lebihSisi), dikurangi jari-jari lingkaran (36), celah ke label (12), dan jarak aman dari tepi (16).
function maksLebarLabel(k: number, lebihSisi: number) {
  const { x, label } = slotKe(k);
  return (label === "kiri" ? x : LEBAR - x) + lebihSisi - 64;
}

// Letak Pijar (pusat) di samping pos k pada sisi `sisi`; jika tidak muat di panggung, di atas pos.
function letakPijar(k: number, sisi: "kiri" | "kanan", ukuran: number) {
  const { x, y } = letakSlot(k);
  const jarak = ukuran / 2 + 62; // jari-jari lingkaran pos + celah
  const cx = sisi === "kiri" ? x - jarak : x + jarak;
  if (cx - ukuran / 2 >= 0 && cx + ukuran / 2 <= LEBAR) return { x: cx, y, diAtas: false };
  return { x, y: y - (ukuran / 2 + 56), diAtas: true };
}

// Titik dan arah (derajat, 0 = ke atas) pada ruas lengkung dari slot k ke slot k+1, t = 0..1.
// Ruasnya kurva Bezier kubik yang sama dengan jalurUlar di bawah.
function titikRuas(k: number, t: number) {
  const a = letakSlot(k);
  const b = letakSlot(k + 1);
  const h = (b.y - a.y) / 2;
  const [p0, p1, p2, p3] = [a, { x: a.x, y: a.y + h }, { x: b.x, y: b.y - h }, b];
  const u = 1 - t;
  const x = u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x;
  const y = u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y;
  const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return { x, y, sudut: (Math.atan2(dy, dx) * 180) / Math.PI + 90 };
}

// Satu garis melewati pusat semua pos. Tiap ruas adalah lengkung S yang tegak di pusat pos,
// jadi sambungannya mulus tanpa siku.
function jalurUlar(jumlah: number) {
  const [awal, ...sisa] = Array.from({ length: jumlah }, (_, k) => letakSlot(k));
  let d = `M${awal.x} ${awal.y}`;
  let a = awal;
  for (const b of sisa) {
    const h = (b.y - a.y) / 2;
    d += `C${a.x} ${a.y + h} ${b.x} ${b.y - h} ${b.x} ${b.y}`;
    a = b;
  }
  return d;
}

function PanggungPeta({ namaAnak, pos, indeksSekarang: k, sekarang, fase, dari }: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  const refAktif = useRef<HTMLDivElement>(null);
  // ruang = tinggi layar pertama (bagian panggung setinggi desain), sebelum pos tambahan di bawahnya.
  // lebar = lebar wadah (px nyata), untuk menghitung ruang kosong di kiri-kanan panggung.
  const [ukuran, setUkuran] = useState({ skala: 1, ruang: TINGGI, lebar: LEBAR, siap: false });

  useLayoutEffect(() => {
    const el = wadah.current;
    if (!el) return;
    const ukur = () => {
      // Sisa tinggi layar di bawah judul (mode anak tidak punya bar navigasi bawah).
      // scrollTop induk: di layar lebar peta bergulir di dalam induknya sendiri, bukan di window.
      const atas = el.getBoundingClientRect().top + window.scrollY + (el.parentElement?.scrollTop ?? 0);
      const sisaTinggi = window.innerHeight - atas - RUANG_BAWAH;

      const skalaLebar = el.clientWidth / LEBAR;
      const skalaTinggi = (sisaTinggi - RUANG_ATAS) / TINGGI;
      // Bagian setinggi desain mengisi penuh sisa layar; kalau layar terlalu pendek, berhenti di
      // SKALA_MIN_TINGGI dan halaman digulir. Pos sesudahnya selalu menyambung ke bawah (digulir).
      const skala = Math.min(skalaLebar, SKALA_MAKS, Math.max(skalaTinggi, SKALA_MIN_TINGGI));
      setUkuran({ skala, ruang: Math.max(sisaTinggi, RUANG_ATAS + TINGGI * skala), lebar: el.clientWidth, siap: true });
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

  useGulirKePosAktif(refAktif, ukuran.siap);

  const { skala, ruang } = ukuran;
  // Ruang di luar panggung, dalam px panggung. Di ponsel panggung tersembunyi (lebar 0, skala 0), jadi 0.
  const lebihSisi = skala > 0 ? Math.max(0, (ukuran.lebar / skala - LEBAR) / 2) : 0;
  const tinggiPanggung = Math.max(TINGGI, Y_SLOT_AWAL + (pos.length - 1) * JARAK_POS + 200);
  const tinggi = ruang + (tinggiPanggung - TINGGI) * skala + RUANG_BAWAH;
  // Bagian setinggi desain diletakkan di tengah (tegak) bila layar pertama lebih tinggi darinya.
  const atasPanggung = RUANG_ATAS + Math.max(0, (ruang - RUANG_ATAS - TINGGI * skala) / 2);

  // Kartu "Kamu di sini" di sisi pos aktif yang cukup lebar; Pijar di sisi seberangnya.
  const posAktif = letakSlot(k);
  const infoKanan = LEBAR - posAktif.x >= 300;
  const pijarBaru = letakPijar(k, infoKanan ? "kiri" : "kanan", UKURAN_PIJAR);
  const tampilGelembung = !pijarBaru.diAtas && infoKanan && pijarBaru.x - UKURAN_PIJAR / 2 - 264 >= 0;
  const pijarLama = dari === null ? null : letakPijar(dari, slotKe(dari).label === "kiri" ? "kanan" : "kiri", UKURAN_PIJAR_LAMA);
  const ruas = ruasJejak(dari, k);

  return (
    <div ref={wadah} className="relative hidden overflow-hidden md:block" style={{ ...LATAR_PETA, height: tinggi }}>
      <div
        className="absolute left-1/2 origin-top"
        style={{ top: atasPanggung, width: LEBAR, height: tinggiPanggung, transform: `translateX(-50%) scale(${skala})`, "--s": skala } as CSSProperties}
      >
        {/* jalur titik-titik antar pos */}
        <svg className="absolute inset-0" width={LEBAR} height={tinggiPanggung} aria-hidden>
          {pos.length > 1 && <JalurTitik d={jalurUlar(pos.length)} />}
        </svg>

        {/* Jejak kaki di ruas menuju pos aktif */}
        {ruas.map((r, ke) =>
          Array.from({ length: JEJAK_PER_RUAS }, (_, i) => {
            const t = titikRuas(r, 0.16 + (0.62 * i) / (JEJAK_PER_RUAS - 1));
            return <JejakKaki key={`${r}-${i}`} x={t.x} y={t.y} sudut={t.sudut} urutan={ke * JEJAK_PER_RUAS + i} fase={fase} />;
          }),
        )}

        {/* Semua pos di tempatnya: tuntas bercentang, aktif bertombol play, lainnya bergembok */}
        {pos.map((p, i) => (
          <TitikPos key={p.id} k={i}>
            {i === k ? (
              <div ref={refAktif}>
                <LingkaranSekarang judul={sekarang.judul} href={sekarang.href} />
              </div>
            ) : (
              <SimpulPos pos={p} labelDi={slotKe(i).label} maksLebar={maksLebarLabel(i, lebihSisi)} />
            )}
          </TitikPos>
        ))}

        {/* Pijar: di pos lama saat animasi dimulai, lalu di pos aktif */}
        <AnimatePresence>
          {fase === "awal" && pijarLama && dari !== null && (
            <PijarPop key="lama" x={pijarLama.x} y={pijarLama.y} ukuran={UKURAN_PIJAR_LAMA} ekspresi={ekspresiUntuk(`${pos[dari].id}:pergi`)} />
          )}
          {fase === "diam" && <PijarPop key="baru" x={pijarBaru.x} y={pijarBaru.y} ukuran={UKURAN_PIJAR} ekspresi={ekspresiUntuk(pos[k].id)} />}
        </AnimatePresence>
        <AnimatePresence>
          {fase === "diam" && tampilGelembung && (
            <motion.div
              key="gelembung"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="absolute"
              style={{ left: pijarBaru.x - UKURAN_PIJAR / 2 - 252, top: posAktif.y - 50, width: 240 }}
            >
              <GelembungPijar namaAnak={namaAnak} sekarang={sekarang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kartu pos aktif + tombol mulai */}
        <div
          className={`absolute flex -translate-y-1/2 flex-col rounded-2xl bg-white/90 p-3 shadow-[0_4px_0_var(--color-garis)] ${infoKanan ? "items-start" : "items-end text-right"}`}
          style={{ top: posAktif.y, width: LEBAR_INFO, left: infoKanan ? posAktif.x + JARAK_INFO.kanan : posAktif.x - JARAK_INFO.kiri - LEBAR_INFO }}
        >
          <p className="flex items-center gap-1.5 font-heading text-[13px] font-bold text-bata">
            <MapPin className="size-4" aria-hidden /> Kamu di sini!
          </p>
          <p className="mt-1 font-heading text-[19px] leading-snug font-extrabold text-teks">{sekarang.judul}</p>
          <p className="text-[13px] text-teks-2">{sekarang.keterangan}</p>
          {sekarang.kemajuan && sekarang.kemajuan.total > 1 && <KemajuanPos {...sekarang.kemajuan} />}
          <TombolMulai href={sekarang.href} label={sekarang.labelTombol} className="mt-3 w-full" />
          <p className="mt-2 text-xs text-teks-2">{sekarang.pesan}</p>
        </div>
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

const JEJAK_PER_RUAS_PONSEL = 3;

// Ponsel: Pijar berdiri di kiri lingkaran pos (lingkaran tercapai 72px, lingkaran aktif 104px).
function JalurPonsel({ namaAnak, pos, indeksSekarang: k, sekarang, fase, dari }: Props) {
  const refAktif = useRef<HTMLDivElement>(null);
  useGulirKePosAktif(refAktif, true);
  const ruas = ruasJejak(dari, k);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 md:hidden" style={{ ...LATAR_PETA, paddingTop: RUANG_ATAS_PONSEL + 24 }}>
      {/* garis titik tegak di belakang pos */}
      <div className="relative isolate flex flex-col items-center gap-8 py-2">
        <span className="absolute top-8 bottom-16 left-1/2 -z-10 w-[18px] -translate-x-1/2 rounded-full bg-pasir" aria-hidden />
        {pos.map((p, i) => (
          <Fragment key={p.id}>
            {/* jejak kaki turun dari pos sebelumnya ke pos ini */}
            {ruas.includes(i - 1) && (
              <div className="relative -my-4 h-24 w-full" aria-hidden>
                {Array.from({ length: JEJAK_PER_RUAS_PONSEL }, (_, j) => (
                  <JejakKaki
                    key={j}
                    x="50%"
                    y={14 + j * 34}
                    sudut={180}
                    urutan={ruas.indexOf(i - 1) * JEJAK_PER_RUAS_PONSEL + j}
                    fase={fase}
                  />
                ))}
              </div>
            )}

            {i === k ? (
              <div ref={refAktif} className="relative flex w-full flex-col items-center rounded-3xl bg-white/85 p-4">
                <p className="flex items-center gap-1.5 font-heading text-[13px] font-bold text-bata">
                  <MapPin className="size-4" aria-hidden /> Kamu di sini!
                </p>
                <p className="mt-1 mb-3 text-center text-[14px] text-teks-2">
                  Hai, {namaAnak}! {sekarang.ajakan}
                </p>
                <div className="relative w-full">
                  <SimpulSekarang judul={sekarang.judul} keterangan={sekarang.keterangan} href={sekarang.href} />
                  {sekarang.kemajuan && sekarang.kemajuan.total > 1 && <KemajuanPos {...sekarang.kemajuan} tengah />}
                  <AnimatePresence>
                    {fase === "diam" && <PijarPop key="baru" x="calc(50% - 112px)" y={52} ukuran={96} ekspresi={ekspresiUntuk(p.id)} />}
                  </AnimatePresence>
                </div>
                <TombolMulai href={sekarang.href} label={sekarang.labelTombol} className="mt-4 w-full" />
                <p className="mt-2 text-center text-xs text-teks-2">{sekarang.pesan}</p>
              </div>
            ) : (
              <div className="relative w-full">
                <SimpulPos pos={p} />
                <AnimatePresence>
                  {fase === "awal" && i === dari && <PijarPop key="lama" x="calc(50% - 96px)" y={36} ukuran={84} ekspresi={ekspresiUntuk(`${p.id}:pergi`)} />}
                </AnimatePresence>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
