"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Volume2,
  Plus,
  Minus,
  Sun,
  Compass,
  BookOpen,
  HeartHandshake,
  Award,
} from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";

/**
 * Indikator Progres Scroll Halus di Tepi Atas Layar (Website Profesional)
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-[#F3B448] via-[#EA7B30] to-[#BF4338] shadow-[0_0_12px_rgba(234,123,48,0.65)] z-50"
    />
  );
}

/**
 * Komponen Bintang & Cahaya Berkelip Menggunakan Aset Bintang 1–5 (/dekorasi/bintang-*.webp)
 */
export function BintangKilau({
  ukuran = 28,
  varian = 1,
  delay = 0,
  durasi = 3.4,
  className = "",
}: {
  ukuran?: number;
  warna?: string;
  varian?: 1 | 2 | 3 | 4 | 5;
  delay?: number;
  durasi?: number;
  className?: string;
}) {
  return (
    <motion.img
      src={`/dekorasi/bintang-${varian}.webp`}
      alt=""
      aria-hidden
      width={ukuran}
      height={ukuran}
      initial={{ opacity: 0.5, scale: 0.85, rotate: 0 }}
      animate={{
        opacity: [0.55, 1, 0.55],
        scale: [0.88, 1.14, 0.88],
        rotate: [0, 8, -4, 0],
        y: [0, -4, 0],
      }}
      transition={{
        duration: durasi,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`pointer-events-none select-none object-contain ${className}`}
    />
  );
}

/**
 * Sapuan Cahaya Emas Menggunakan Aset Bintang 6 (/dekorasi/bintang-6.webp)
 */
export function SapuanCahayaEmas({
  lebar = 110,
  delay = 0,
  className = "",
}: {
  lebar?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.img
      src="/dekorasi/bintang-6.webp"
      alt=""
      aria-hidden
      width={lebar}
      height={Math.round(lebar * 0.42)}
      animate={{
        x: [0, 8, 0],
        y: [0, -3, 0],
        opacity: [0.65, 0.95, 0.65],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`pointer-events-none select-none object-contain ${className}`}
    />
  );
}

/**
 * Latar Langit Hero Berlapis dengan Multi-Layer Scroll Parallax & Aset Awan 1–13 + Bintang 1–6
 */
export function HeroLangitParallax() {
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Lapisan parallax dengan kecepatan berbeda saat pengguna menggulir halaman
  const bgY = useTransform(smoothScrollY, [0, 800], [0, 45]);
  const bgScale = useTransform(smoothScrollY, [0, 800], [1.04, 1.1]);
  const awanAtasY = useTransform(smoothScrollY, [0, 800], [0, -55]);
  const awanTengahY = useTransform(smoothScrollY, [0, 800], [0, -30]);
  const awanBawahY = useTransform(smoothScrollY, [0, 800], [0, -18]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none z-0"
    >
      {/* LAYER 0: Gambar Background Langit Hasil Generate dengan Scroll Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-x-0 top-0 bottom-16"
      >
        <img
          src="/dekorasi/bg-langit-pelita.webp"
          alt=""
          className="h-full w-full object-cover object-center opacity-55"
        />
      </motion.div>

      {/* Lapisan Pendaran Cahaya Hangat di Tengah agar Teks & Kartu Sangat Jelas Terbaca */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 40%, rgba(255,248,235,0.88) 0%, rgba(250,225,190,0.72) 55%, rgba(252,235,212,0.95) 100%)",
        }}
      />

      {/* LAYER 1: Awan Atas (Awan 1 di Kiri Atas & Awan 3 di Kanan Atas) */}
      <motion.div style={{ y: awanAtasY }} className="absolute inset-0">
        <motion.img
          src="/dekorasi/awan-1.webp"
          alt=""
          animate={{ x: [0, 18, 0], y: [0, -5, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 -left-8 w-52 sm:w-72 lg:w-88 opacity-80"
        />
        <motion.img
          src="/dekorasi/awan-3.webp"
          alt=""
          animate={{ x: [0, -16, 0], y: [0, 6, 0] }}
          transition={{ duration: 12.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 -right-6 w-52 sm:w-72 lg:w-88 opacity-80"
        />
        <motion.img
          src="/dekorasi/awan-2.webp"
          alt=""
          animate={{ x: [0, 14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block absolute top-8 left-[36%] w-48 lg:w-60 opacity-45"
        />
      </motion.div>

      {/* LAYER 2: Awan Tengah & Taburan Bintang 1–6 */}
      <motion.div style={{ y: awanTengahY }} className="absolute inset-0">
        <motion.img
          src="/dekorasi/awan-6.webp"
          alt=""
          animate={{ x: [0, -14, 0], y: [0, -4, 0] }}
          transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute top-[32%] left-[44%] w-36 opacity-45"
        />
        <motion.img
          src="/dekorasi/awan-9.webp"
          alt=""
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 10.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[22%] right-[32%] w-40 opacity-55"
        />

        {/* Bintang-bintang keemasan di langit Hero */}
        <BintangKilau
          varian={2}
          ukuran={44}
          delay={0.1}
          className="absolute top-14 left-[28%] hidden sm:block"
        />
        <BintangKilau
          varian={3}
          ukuran={36}
          delay={0.8}
          className="absolute top-20 right-[26%] hidden sm:block"
        />
        <BintangKilau
          varian={1}
          ukuran={30}
          delay={1.4}
          className="absolute top-[42%] left-[3%] hidden md:block"
        />
        <BintangKilau
          varian={5}
          ukuran={26}
          delay={0.5}
          className="absolute top-12 left-[52%]"
        />
        <BintangKilau
          varian={4}
          ukuran={26}
          delay={1.9}
          className="absolute bottom-36 right-[46%] hidden lg:block"
        />
        <SapuanCahayaEmas
          lebar={96}
          delay={0.4}
          className="hidden lg:block absolute bottom-28 left-[38%]"
        />
      </motion.div>

      {/* LAYER 3: Bingkai Awan Cakrawala Bawah (Awan 11 Kiri, Awan 12 Kanan, Awan 13 Tengah) */}
      <motion.div
        style={{ y: awanBawahY }}
        className="absolute inset-x-0 bottom-8 sm:bottom-10 h-44 sm:h-56 pointer-events-none"
      >
        {/* Awan 13 (Bawah Full) di sepanjang cakrawala tengah */}
        <motion.img
          src="/dekorasi/awan-13.webp"
          alt=""
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[540px] sm:w-[760px] lg:w-[980px] max-w-none opacity-55"
        />
        {/* Awan 11 (Bawah Kiri) */}
        <motion.img
          src="/dekorasi/awan-11.webp"
          alt=""
          animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -left-6 w-52 sm:w-72 lg:w-92 opacity-75"
        />
        {/* Awan 12 (Bawah Kanan) */}
        <motion.img
          src="/dekorasi/awan-12.webp"
          alt=""
          animate={{ x: [0, -8, 0], y: [0, -4, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -right-6 w-52 sm:w-72 lg:w-92 opacity-75"
        />
      </motion.div>

      {/* LAYER 4: Gradasi Ekstra Tebal (Multi-Stop S-Curve Feather) di Bawah Hero agar 100% Tanpa Garis */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-2 h-64 sm:h-80 lg:h-96"
        style={{
          background:
            "linear-gradient(to bottom, rgba(252,235,212,0) 0%, rgba(252,235,212,0.18) 22%, rgba(252,235,212,0.52) 48%, rgba(252,235,212,0.84) 74%, #FCEBD4 94%, #FCEBD4 100%)",
        }}
      />
    </div>
  );
}

/**
 * Ornamen Awan & Bintang dengan Scroll-Linked Parallax Tanpa Pemotongan (Zero Clipping)
 */
export function DekorasiLangitCerah({
  varian = "satu",
}: {
  varian?: "satu" | "dua" | "tiga";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  const yKiri = useTransform(smoothProgress, [0, 1], [36, -36]);
  const yKanan = useTransform(smoothProgress, [0, 1], [-32, 32]);
  const xDrift = useTransform(smoothProgress, [0, 1], [-18, 18]);

  const awanKiri =
    varian === "satu"
      ? "/dekorasi/awan-4.webp"
      : varian === "dua"
        ? "/dekorasi/awan-5.webp"
        : "/dekorasi/awan-7.webp";
  const awanKanan =
    varian === "satu"
      ? "/dekorasi/awan-5.webp"
      : varian === "dua"
        ? "/dekorasi/awan-8.webp"
        : "/dekorasi/awan-10.webp";
  const awanAksen =
    varian === "satu"
      ? "/dekorasi/awan-9.webp"
      : varian === "dua"
        ? "/dekorasi/awan-6.webp"
        : "/dekorasi/awan-8.webp";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none z-0"
    >
      {/* Kabut Pendaran Hangat di Tengah Section (Tanpa Menyentuh Tepi Atas/Bawah agar Tidak Pernah Membentuk Garis) */}
      <div
        className="absolute inset-x-0 -top-32 -bottom-32"
        style={{
          background:
            varian === "dua"
              ? "radial-gradient(ellipse 75% 42% at 50% 50%, rgba(255,248,236,0.55) 0%, rgba(252,235,212,0) 75%)"
              : "radial-gradient(ellipse 80% 45% at 50% 50%, rgba(243,198,143,0.48) 0%, rgba(245,207,162,0.22) 45%, rgba(252,235,212,0) 78%)",
        }}
      />

      {/* Cahaya pendar matahari hangat di tengah-kanan & tengah-kiri (Tidak terpotong batas section) */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.28, 0.44, 0.28] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,253,248,0.8) 0%, rgba(236,172,84,0.38) 45%, rgba(252,235,212,0) 72%)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.38, 0.22] }}
        transition={{
          duration: 7.5,
          delay: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 -left-24 h-96 w-96 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(249,218,172,0.75) 0%, rgba(234,123,48,0.28) 45%, rgba(252,235,212,0) 72%)",
        }}
      />

      {/* Awan Kiri dengan Scroll Parallax + Floating */}
      <motion.div
        style={{ y: yKiri, x: xDrift }}
        className="hidden sm:block absolute top-6 -left-6 lg:left-2"
      >
        <motion.img
          src={awanKiri}
          alt=""
          animate={{ x: [0, 14, 0], y: [0, -4, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="w-44 md:w-56 lg:w-64 opacity-55"
        />
      </motion.div>

      {/* Awan Kanan dengan Scroll Parallax + Floating */}
      <motion.div
        style={{ y: yKanan }}
        className="hidden sm:block absolute top-10 -right-6 lg:right-2"
      >
        <motion.img
          src={awanKanan}
          alt=""
          animate={{ x: [0, -16, 0], y: [0, 5, 0] }}
          transition={{ duration: 11.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-44 md:w-56 lg:w-64 opacity-55"
        />
      </motion.div>

      {/* Awan Aksen Bawah */}
      <motion.div
        style={{ y: yKiri }}
        className="hidden lg:block absolute bottom-6 right-[12%]"
      >
        <motion.img
          src={awanAksen}
          alt=""
          animate={{ x: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="w-40 opacity-45"
        />
      </motion.div>

      {/* Bintang-bintang keemasan dari aset referensi */}
      <BintangKilau
        varian={2}
        ukuran={38}
        delay={0.2}
        className="hidden md:block absolute top-12 left-[22%]"
      />
      <BintangKilau
        varian={3}
        ukuran={34}
        delay={0.9}
        className="hidden md:block absolute top-16 right-[22%]"
      />
      <BintangKilau
        varian={1}
        ukuran={28}
        delay={1.5}
        className="hidden sm:block absolute bottom-14 left-[8%]"
      />
      <BintangKilau
        varian={5}
        ukuran={24}
        delay={2.0}
        className="hidden sm:block absolute bottom-16 right-[8%]"
      />
      <SapuanCahayaEmas
        lebar={90}
        delay={0.7}
        className="hidden xl:block absolute bottom-10 left-[26%]"
      />
    </div>
  );
}

/**
 * Pembungkus Animasi Scroll-Reveal Halus (Spring-like Easing Website Profesional)
 */
export function RevealSection({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pembungkus Kartu dengan Transisi Angkat Halus
 */
export function HoverCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const langkahRoadmap = [
  {
    no: "01",
    label: "Langkah Pertama",
    judul: "Menyapa Kondisi Hari Ini",
    isi: "Anak memilih bagaimana tenaganya dan suasana hatinya sebelum mulai belajar.",
    ikon: Sun,
    aksen: "#EA7B30",
  },
  {
    no: "02",
    label: "Langkah Kedua",
    judul: "Menemukan Titik Mulai",
    isi: "Materi dimulai dari bagian yang paling dibutuhkan anak agar ia merasa percaya diri.",
    ikon: Compass,
    aksen: "#D96B27",
  },
  {
    no: "03",
    label: "Langkah Ketiga",
    judul: "Belajar Lewat Cerita",
    isi: "Materi pendek bergambar dan bersuara yang ringan diikuti tanpa batas waktu.",
    ikon: BookOpen,
    aksen: "#C85A2E",
  },
  {
    no: "04",
    label: "Langkah Keempat",
    judul: "Ditemani Saat Butuh Bantuan",
    isi: "Saat jawaban belum tepat, Pijar memberi petunjuk langkah demi langkah dengan ramah.",
    ikon: HeartHandshake,
    aksen: "#BF4338",
  },
  {
    no: "05",
    label: "Langkah Kelima",
    judul: "Terhubung ke Sekolah",
    isi: "Perkembangan belajar anak dirangkum menjadi laporan yang siap dibagikan ke guru kelas.",
    ikon: Award,
    aksen: "#8C2B29",
  },
];

/**
 * Roadmap Alur Belajar Harian yang Rapi, Terstruktur, dan Dihiasi Aset Awan & Bintang
 */
export function RoadmapAlurBelajar() {
  return (
    <div className="relative mt-10 sm:mt-12 rounded-[28px] border-2 border-[#E2B378] bg-gradient-to-b from-[#FFF5E4] via-[#FCECD7] to-[#F9E2C3] p-6 sm:p-8 lg:p-10 shadow-[0_18px_45px_rgba(74,21,32,0.07)] overflow-hidden">
      {/* Latar pola peta lembut */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(/ilustrasi/peta-pola.webp)] bg-[length:520px_auto] opacity-20"
      />

      {/* Aset Awan & Bintang di Sudut Bingkai Roadmap */}
      <motion.img
        src="/dekorasi/awan-7.webp"
        alt=""
        aria-hidden
        animate={{ x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none select-none absolute -top-2 -left-4 w-36 sm:w-44 opacity-55"
      />
      <motion.img
        src="/dekorasi/awan-8.webp"
        alt=""
        aria-hidden
        animate={{ x: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none select-none absolute -top-2 -right-4 w-40 sm:w-48 opacity-55"
      />
      <BintangKilau
        varian={2}
        ukuran={34}
        delay={0.2}
        className="absolute top-4 left-[18%] hidden sm:block"
      />
      <BintangKilau
        varian={3}
        ukuran={30}
        delay={1.1}
        className="absolute top-5 right-[18%] hidden sm:block"
      />
      <SapuanCahayaEmas
        lebar={88}
        delay={0.6}
        className="hidden lg:block absolute bottom-5 right-[34%]"
      />

      {/* ================== DESKTOP STEPPER ROADMAP (lg+) ================== */}
      <div className="relative z-10 hidden lg:block">
        {/* Baris Atas: Jalur Garis Terhubung + 5 Simpul Ikon di Tengah Kolom */}
        <div className="relative grid grid-cols-5 items-center mb-7">
          {/* Garis Dasar Abu-Krem dari tengah kolom 1 (10%) ke tengah kolom 5 (90%) */}
          <div className="absolute top-1/2 left-[10%] right-[10%] -translate-y-1/2 h-2 rounded-full bg-[#E5B97F]/55 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-emas via-[#EA7B30] to-bata"
            />
          </div>

          {langkahRoadmap.map((step, i) => {
            const Ikon = step.ikon;
            return (
              <motion.div
                key={step.no}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10 flex flex-col items-center"
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.05 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFFDF9] border-2 border-[#E2B378] shadow-[0_10px_24px_rgba(74,21,32,0.12)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emas text-teks">
                    <Ikon className="h-5 w-5 text-teks" />
                  </span>
                  <span
                    className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-xs border-2 border-[#FFFDF9]"
                    style={{ backgroundColor: step.aksen }}
                  >
                    {step.no}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Baris Bawah: 5 Kartu Seragam & Sejajar */}
        <div className="grid grid-cols-5 gap-4 items-stretch">
          {langkahRoadmap.map((step, i) => (
            <motion.div
              key={step.no}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full"
            >
              <HoverCard className="h-full rounded-[22px] bg-[#FFFDF9]/95 p-5 border border-[#E5B97F]/80 shadow-[0_8px_24px_rgba(74,21,32,0.05)] flex flex-col justify-between text-center">
                <div>
                  <span className="inline-block rounded-full bg-[#FCECD7] border border-[#E5B97F]/70 px-3 py-0.5 text-[11px] font-extrabold text-bata">
                    {step.label}
                  </span>
                  <h3 className="mt-3 font-heading text-base xl:text-[17px] font-extrabold text-teks leading-snug">
                    {step.judul}
                  </h3>
                  <p className="mt-2 text-xs xl:text-[13px] text-teks-2 leading-relaxed">
                    {step.isi}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F2D5B0]/70 flex items-center justify-center">
                  <span
                    className="h-1.5 w-10 rounded-full"
                    style={{ backgroundColor: step.aksen }}
                  />
                </div>
              </HoverCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ================== MOBILE & TABLET TIMELINE (<lg) ================== */}
      <div className="relative z-10 lg:hidden">
        {/* Garis Vertikal Terhubung di Tengah Simpul Kiri */}
        <div className="absolute top-8 bottom-8 left-7 -translate-x-1/2 w-1.5 rounded-full bg-[#E5B97F]/55 overflow-hidden">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full origin-top bg-gradient-to-b from-emas via-[#EA7B30] to-bata"
          />
        </div>

        <div className="space-y-5">
          {langkahRoadmap.map((step, i) => {
            const Ikon = step.ikon;
            return (
              <motion.div
                key={step.no}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex items-start gap-4 sm:gap-5"
              >
                {/* Simpul Kiri */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFFDF9] border-2 border-[#E2B378] shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emas text-teks">
                    <Ikon className="h-5 w-5 text-teks" />
                  </span>
                  <span
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-white border-2 border-[#FFFDF9]"
                    style={{ backgroundColor: step.aksen }}
                  >
                    {step.no}
                  </span>
                </div>

                {/* Kartu Kanan */}
                <div className="flex-1 rounded-[20px] bg-[#FFFDF9]/95 p-4 sm:p-5 border border-[#E5B97F]/80 shadow-2xs">
                  <span className="inline-block rounded-full bg-[#FCECD7] px-2.5 py-0.5 text-[10px] font-extrabold text-bata border border-[#E5B97F]/60">
                    {step.label}
                  </span>
                  <h3 className="mt-1.5 font-heading text-base sm:text-lg font-extrabold text-teks leading-snug">
                    {step.judul}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-teks-2 leading-relaxed">
                    {step.isi}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Baris Bawah Bingkai Roadmap bersama Pijar */}
      <div className="relative z-10 mt-7 pt-5 border-t border-[#E2B378]/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <MascotPijar ekspresi="mengintip" gerak="idle" ukuran={52} />
          <p className="text-xs sm:text-sm font-bold text-teks">
            Setiap langkah dapat dijeda kapan saja ketika anak membutuhkan
            istirahat, lalu dilanjutkan kembali dari posisi terakhir.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emas/85 px-4 py-1.5 text-xs font-extrabold text-teks">
          Perjalanan Belajar yang Mengikuti Ritme Anak
        </span>
      </div>
    </div>
  );
}

/**
 * Showcase Ruang Belajar Ramah Anak
 */
export function ShowcaseBelajarAnak() {
  return (
    <div className="relative">
      {/* Ornamen Bintang Berkelip di Sekitar Kartu Belajar */}
      <BintangKilau
        varian={2}
        ukuran={34}
        delay={0.3}
        className="hidden md:block absolute -top-5 left-6"
      />
      <BintangKilau
        varian={3}
        ukuran={32}
        delay={1.2}
        className="hidden md:block absolute -top-6 right-10"
      />

      {/* Kartu Besar Utama (Latar Krem #FCECD7) */}
      <div className="rounded-[24px] bg-[#FCECD7] p-6 sm:p-8 border border-[#E5B97F]/70 shadow-[0_12px_32px_rgba(74,21,32,0.06)]">
        {/* Baris Header Kartu */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4CFA4] text-sm">
              🍊
            </span>
            <span className="font-heading text-sm sm:text-base font-extrabold text-teks">
              Contoh Materi Belajar Perkalian Dasar
            </span>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-emas px-4 py-1.5 text-xs font-extrabold text-teks">
            <Volume2 className="h-3.5 w-3.5 text-bata" />
            <span>Dilengkapi Pembaca Suara Bahasa Indonesia</span>
          </span>
        </div>

        {/* 3 Panel Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Kiri: Kotak Cerita */}
          <div className="lg:col-span-4 rounded-[18px] bg-[#F7DEC0] p-5 border border-[#E5B97F]/50 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base sm:text-lg font-extrabold text-teks">
                Cerita di Kebun Jeruk
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-teks-2 leading-relaxed">
                Pijar membantu memanen jeruk ke dalam 6 keranjang. Setiap
                keranjang diisi 7 buah jeruk manis yang segar.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 pt-3 border-t border-[#E5B97F]/40">
              <MascotPijar ekspresi="penasaran" gerak="idle" ukuran={48} />
              <span className="text-xs font-bold text-teks-2">
                Cerita hangat tanpa istilah rumah sakit
              </span>
            </div>
          </div>

          {/* Tengah: Kotak Emas Menonjol dengan 3 Kotak Putih di Dalamnya */}
          <div className="lg:col-span-4 rounded-[20px] bg-emas p-5 sm:p-6 text-teks shadow-xs flex flex-col justify-between">
            <div className="font-heading text-sm sm:text-base font-extrabold leading-snug text-center">
              Enam kelompok berisi tujuh benda
            </div>

            <div className="my-4 grid grid-cols-3 gap-2.5">
              {[
                { nama: "Keranjang 1", isi: "7 jeruk" },
                { nama: "Keranjang 2", isi: "7 jeruk" },
                { nama: "Keranjang 3–6", isi: "7 jeruk" },
              ].map((k) => (
                <div key={k.nama} className="text-center">
                  <div className="aspect-square rounded-[14px] bg-[#FFFDF9] border border-[#C98A32]/40 flex flex-col items-center justify-center p-2 shadow-2xs">
                    <div className="flex flex-wrap justify-center gap-1 max-w-[44px]">
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <span
                          key={n}
                          className="h-2 w-2 rounded-full bg-emas"
                        />
                      ))}
                    </div>
                    <span className="mt-1.5 text-[10px] font-extrabold text-teks">
                      {k.isi}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] font-extrabold text-teks">
                    {k.nama}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="font-heading text-xs sm:text-sm font-extrabold text-teks">
                7 + 7 + 7 + 7 + 7 + 7 = 42
              </div>
              <div className="text-[11px] font-semibold text-teks/80 mt-0.5">
                Dipahami lewat gambar benda nyata yang mudah dihitung
              </div>
            </div>
          </div>

          {/* Kanan: Kotak Persamaan Besar */}
          <div className="relative lg:col-span-4 rounded-[18px] bg-[#F7DEC0] p-6 border border-[#E5B97F]/50 flex flex-col items-center justify-center text-center overflow-hidden">
            <BintangKilau
              varian={1}
              ukuran={26}
              delay={0.4}
              className="absolute top-4 right-5"
            />
            <BintangKilau
              varian={5}
              ukuran={22}
              delay={1.3}
              className="absolute bottom-5 left-5"
            />
            <div className="font-heading text-3xl sm:text-4xl font-extrabold text-teks">
              6 × 7 = 42
            </div>
            <p className="mt-2 text-xs sm:text-sm font-bold text-teks-2">
              Enam keranjang berisi tujuh jeruk
            </p>
            <div className="mt-4">
              <MascotPijar ekspresi="senang" gerak="idle" ukuran={64} />
            </div>
          </div>
        </div>
      </div>

      {/* 2 Kartu Krem Sejajar di Bawah */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Kartu Kiri: Bantuan Penjelasan Ramah Anak */}
        <HoverCard className="rounded-[20px] bg-[#FCECD7] p-6 border border-[#E5B97F]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading text-sm sm:text-base font-extrabold text-teks">
                Penjelasan Ramah Saat Anak Keliru
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7DEC0] px-3 py-1 text-[11px] font-bold text-teks-2">
                <Volume2 className="h-3.5 w-3.5 text-bata" />
                <span>Dapat Dibacakan</span>
              </span>
            </div>
            <div className="mt-3.5 flex items-start gap-3.5">
              <MascotPijar ekspresi="empati" gerak="idle" ukuran={56} />
              <p className="text-xs sm:text-sm font-semibold text-teks leading-relaxed">
                &ldquo;Yuk, coba lihat lagi! Sepertinya kamu menjumlahkan 6 dan
                7 jadi 13. Kalau 6 × 7 artinya ada 6 kelompok yang masing-masing
                isinya 7.&rdquo;
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E5B97F] bg-[#FDF3E4] px-3.5 py-1 text-[11px] font-bold text-teks-2">
              Tanpa kata menyalahkan
            </span>
            <span className="rounded-full border border-[#E5B97F] bg-[#FDF3E4] px-3.5 py-1 text-[11px] font-bold text-teks-2">
              Bahasa sederhana maksimal 3 kalimat
            </span>
          </div>
        </HoverCard>

        {/* Kartu Kanan: Jeda Istirahat Tengah Sesi */}
        <HoverCard className="rounded-[20px] bg-[#FCECD7] p-6 border border-[#E5B97F]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading text-sm sm:text-base font-extrabold text-teks">
                Sapaan &ldquo;Masih kuat?&rdquo; di Tengah Belajar
              </span>
              <span className="rounded-full bg-[#F7DEC0] px-3 py-1 text-[11px] font-bold text-teks-2">
                Bebas Berhenti Kapan Saja
              </span>
            </div>
            <div className="mt-3.5 flex items-start gap-3.5">
              <MascotPijar ekspresi="peduli" gerak="idle" ukuran={56} />
              <p className="text-xs sm:text-sm text-teks-2 leading-relaxed">
                Di tengah belajar, Pijar menanyakan apakah anak masih kuat,
                mulai lelah, atau ingin beristirahat. Jika anak memilih
                istirahat, kemajuan belajarnya langsung tersimpan dengan aman.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E5B97F] bg-[#FDF3E4] px-3.5 py-1 text-[11px] font-bold text-teks-2">
              Berhenti istirahat tidak pernah dihitung gagal
            </span>
          </div>
        </HoverCard>
      </div>
    </div>
  );
}

const daftarFaq = [
  {
    tanya: "Kapan anak sebaiknya mulai menggunakan PELITA?",
    jawab:
      "PELITA dapat digunakan baik saat anak sedang menjalani perawatan maupun ketika beristirahat di rumah. Setiap hari kegiatan belajar menyesuaikan tenaga dan kenyamanan anak pada hari itu.",
  },
  {
    tanya: "Apakah PELITA menggantikan sekolah asal anak?",
    jawab:
      "Tidak. PELITA bukan pengganti sekolah dan tidak menerbitkan rapor resmi. PELITA membantu merangkum capaian belajar anak sesuai kurikulum nasional agar wali kelas di sekolah asal lebih mudah memahami perkembangan anak.",
  },
  {
    tanya: "Bagaimana jika hari itu anak sedang sangat lelah atau tidak enak badan?",
    jawab:
      "Anak cukup memilih kondisi istirahat atau sesi ringan. Pada hari tersebut anak dapat mendengarkan cerita pendek tanpa harus mengerjakan soal, atau beristirahat penuh tanpa khawatir kehilangan capaian mingguan.",
  },
  {
    tanya: "Apakah aplikasi ini meminta catatan medis atau nama obat anak?",
    jawab:
      "Tidak. Demi menjaga privasi keluarga, PELITA tidak pernah meminta atau menyimpan diagnosis penyakit, nama rumah sakit, maupun jadwal obat anak.",
  },
  {
    tanya: "Apa peran Orang Tua dan Guru Pendamping di dalam PELITA?",
    jawab:
      "Orang tua memegang kendali penuh atas pengaturan waktu layar, mode jeda istirahat, serta persetujuan pendampingan anak. Guru pendamping membantu memantau perkembangan materi dan menyiapkan jembatan kembali ke sekolah.",
  },
];

export function AccordionFaq() {
  const [terbukaSet, setTerbukaSet] = useState<number[]>([0, 1, 2]);

  const toggleItem = (idx: number) => {
    setTerbukaSet((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  return (
    <div className="divide-y divide-[#E2B77E]">
      {daftarFaq.map((item, idx) => {
        const aktif = terbukaSet.includes(idx);
        return (
          <div key={idx} className="py-4 first:pt-0">
            <button
              type="button"
              onClick={() => toggleItem(idx)}
              className="flex w-full items-center justify-between gap-4 text-left cursor-pointer group"
            >
              <span className="font-heading text-sm sm:text-base font-extrabold text-teks group-hover:text-bata transition-colors">
                {item.tanya}
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7DEC0] text-bata">
                {aktif ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {aktif && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="mt-2.5 pr-8 text-xs sm:text-sm text-teks-2 leading-relaxed">
                    {item.jawab}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
