"use client";

// Layar pilih profil adaptif & responsif (1 anak, 2 anak, atau lebih):
// Setiap profil anak dan pendamping menjadi panel sejajar yang adaptif.
// Animasi perpindahan kursor profesional bertenaga Motion (spring physics, cursor glow follower, shared layout).
// Saat kursor mengarah ke profil, nama profil berubah menjadi glowing tanpa tombol aksi statis.
// Kalimat badge di atas avatar dihilangkan agar tampilan bersih & elegan.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  ArrowLeft,
  HeartHandshake,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  MascotPijar,
  type EkspresiGambarPijar,
} from "@/components/anak/MascotPijar";
import { BintangKilau } from "@/components/landing/InteraktifLanding";
import { GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ProfilAnak, ResponsPilihAnak, ResponsPin, ResponsProfil } from "@/lib/kontrak/auth";
import { PadPin } from "./PadPin";

// Variasi tema visual & ekspresi untuk setiap profil anak agar tampil hidup dan variatif
const TEMA_ANAK: Array<{
  ekspresi: EkspresiGambarPijar;
  radialBg: string;
  awanAtas: string;
  awanBawah: string;
  bintangVarian: [1 | 2 | 3 | 4 | 5, 1 | 2 | 3 | 4 | 5];
  bayanganHover: string;
}> = [
  {
    ekspresi: "semangat",
    radialBg:
      "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,250,240,0.88) 0%, rgba(252,231,198,0.7) 55%, rgba(243,180,72,0.32) 100%)",
    awanAtas: "/dekorasi/awan-1.webp",
    awanBawah: "/dekorasi/awan-13.webp",
    bintangVarian: [2, 3],
    bayanganHover: "rgba(234,123,48,0.38)",
  },
  {
    ekspresi: "senang",
    radialBg:
      "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,248,245,0.88) 0%, rgba(254,228,214,0.7) 55%, rgba(236,172,84,0.32) 100%)",
    awanAtas: "/dekorasi/awan-2.webp",
    awanBawah: "/dekorasi/awan-11.webp",
    bintangVarian: [1, 4],
    bayanganHover: "rgba(220,137,91,0.38)",
  },
  {
    ekspresi: "penasaran",
    radialBg:
      "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(254,250,242,0.88) 0%, rgba(250,237,215,0.7) 55%, rgba(244,129,58,0.3) 100%)",
    awanAtas: "/dekorasi/awan-4.webp",
    awanBawah: "/dekorasi/awan-12.webp",
    bintangVarian: [3, 5],
    bayanganHover: "rgba(237,182,100,0.38)",
  },
  {
    ekspresi: "sambut",
    radialBg:
      "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,252,245,0.88) 0%, rgba(253,235,210,0.7) 55%, rgba(191,67,56,0.25) 100%)",
    awanAtas: "/dekorasi/awan-3.webp",
    awanBawah: "/dekorasi/awan-13.webp",
    bintangVarian: [2, 1],
    bayanganHover: "rgba(191,67,56,0.38)",
  },
];

export function PilihProfil() {
  const router = useRouter();
  const [profil, setProfil] = useState<ResponsProfil | null>(null);
  const [modePin, setModePin] = useState(false);
  const [memilih, setMemilih] = useState<number | null>(null);
  const [panelHover, setPanelHover] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [pointerAktif, setPointerAktif] = useState(false);

  // Motion physics spring untuk animasi pergerakan kursor yang mulus & berbobot
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const springX = useSpring(mouseX, { stiffness: 340, damping: 28, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 340, damping: 28, mass: 0.6 });

  useEffect(() => {
    panggilApi<ResponsProfil>("/api/auth/profil")
      .then((p) =>
        p.role === "admin" ? router.replace("/admin/aturan-ai") : setProfil(p),
      )
      .catch((e) =>
        e instanceof GalatKlien && e.kode === "BELUM_LOGIN"
          ? router.replace("/login")
          : setGalat(pesanGalat(e)),
      );
  }, [router]);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (!pointerAktif) setPointerAktif(true);
  }

  function handlePointerLeave() {
    setPointerAktif(false);
    setPanelHover(null);
  }

  async function pilihAnak(anak: ProfilAnak) {
    if (memilih !== null) return;
    setMemilih(anak.anak_id);
    try {
      const hasil = await panggilApi<ResponsPilihAnak>("/api/auth/profil", { anak_id: anak.anak_id });
      router.push(hasil.tujuan ?? (hasil.perlu_asesmen ? "/anak/asesmen" : "/anak"));
    } catch (e) {
      setGalat(pesanGalat(e));
      setMemilih(null);
    }
  }

  async function kirimPin(pin: string): Promise<string | null> {
    try {
      await panggilApi<ResponsPin>("/api/auth/pin", { pin });
      router.push("/pendamping/dashboard");
      return null;
    } catch (e) {
      return pesanGalat(e);
    }
  }

  async function keluar() {
    await panggilApi("/api/auth/logout", {}).catch(() => undefined);
    router.replace("/login");
  }

  const daftarAnak = profil?.daftar_anak ?? [];
  const totalPanel = Math.max(1, daftarAnak.length + 1); // Anak-anak + Pendamping

  // Perhitungan rasio flex kolom yang responsif saat di-hover berdasarkan jumlah anak
  function getFlex(panelId: string): number {
    if (totalPanel <= 1) return 1;
    if (!panelHover) return 1;
    if (panelHover === panelId) {
      if (totalPanel === 2) return 1.18;
      if (totalPanel === 3) return 1.28;
      return 1.34;
    }
    // Panel yang tidak di-hover menyusut halus seimbang
    if (totalPanel === 2) return 0.82;
    if (totalPanel === 3) return 0.86;
    return 0.88;
  }

  // Ukuran maskot responsif terhadap banyaknya jumlah anak
  const ukuranMascot = totalPanel >= 4 ? 116 : totalPanel === 3 ? 134 : 152;

  return (
    <main
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[#FCEBD4] text-teks select-none"
    >
      {/* ==================== KURSOR FOLLOWER & SPOTLIGHT GLOW (MOTION) ==================== */}
      {/* Ethereal Glow yang mengikuti kursor dengan spring physics */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-20 hidden lg:block -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl mix-blend-screen transition-opacity duration-300"
        style={{
          x: springX,
          y: springY,
          width: 420,
          height: 420,
          background:
            panelHover === "pendamping"
              ? "radial-gradient(circle, rgba(243,180,72,0.36) 0%, rgba(220,137,91,0.18) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(234,123,48,0.32) 0%, rgba(243,180,72,0.18) 50%, transparent 70%)",
          opacity: pointerAktif ? (panelHover ? 0.9 : 0.3) : 0,
        }}
      />

      {/* Cincin Kursor Magnetik yang beranimasi saat melayang di atas profil */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden lg:block -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
        style={{
          x: springX,
          y: springY,
          backgroundColor: "rgba(0, 0, 0, 0)",
        }}
        animate={{
          width: panelHover ? 54 : 20,
          height: panelHover ? 54 : 20,
          borderColor:
            panelHover === "pendamping"
              ? "rgba(243, 180, 72, 0.9)"
              : panelHover !== null
                ? "rgba(234, 123, 48, 0.85)"
                : "rgba(234, 123, 48, 0.35)",
          backgroundColor:
            panelHover === "pendamping"
              ? "rgba(243, 180, 72, 0.12)"
              : panelHover !== null
                ? "rgba(234, 123, 48, 0.12)"
                : "rgba(0, 0, 0, 0)",
          scale: panelHover ? 1.15 : 1,
          opacity: pointerAktif ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
      />

      {/* ==================== HEADER MELAYANG MINIMALIS ==================== */}
      <header className="pointer-events-none fixed top-0 inset-x-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
        {/* Kiri: Tulisan PELITA */}
        <span className="pointer-events-auto rounded-full bg-[#FFFDF9]/85 backdrop-blur-md border border-[#E5B97F]/70 px-5 py-2 font-heading text-lg sm:text-xl font-black tracking-widest text-teks shadow-sm">
          PELITA
        </span>

        {/* Tengah: Sapaan Lembut di Layar Lebar */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-[#FFFDF9]/88 backdrop-blur-md border border-[#E5B97F]/75 px-5 py-2 shadow-sm">
          <span className="font-heading text-sm font-extrabold text-teks">
            Siapa yang mau belajar hari ini?
          </span>
          {profil && (
            <span className="text-xs font-bold text-teks-2 border-l border-[#E5B97F] pl-2.5">
              Akun {profil.nama}
            </span>
          )}
        </div>

        {/* Kanan: Tombol Keluar */}
        <button
          type="button"
          onClick={keluar}
          className="pointer-events-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#FFFDF9]/88 backdrop-blur-md border border-[#E5B97F]/75 px-4 py-2 text-sm font-extrabold text-teks transition hover:bg-emas focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none shadow-sm"
        >
          <LogOut className="size-4 text-bata" aria-hidden />
          <span>Keluar</span>
        </button>
      </header>

      {/* ==================== KONTEN PILIH PROFIL (RESPONSIF TERHADAP JUMLAH ANAK) ==================== */}
      <div className="relative flex-1 flex flex-col lg:flex-row min-h-dvh w-full">
        {/* SKELETON / PLACEHOLDER SAAT MEMUAT */}
        {!profil && (
          <>
            <div className="relative flex min-h-[50dvh] lg:min-h-dvh flex-1 flex-col items-center justify-center px-6 pt-20 pb-12 border-b-2 lg:border-b-0 lg:border-r-2 border-[#E5B97F]/70">
              <div className="size-40 sm:size-48 rounded-full bg-white/60 animate-pulse mb-6" />
              <div className="h-10 w-48 rounded-2xl bg-white/70 animate-pulse mb-3" />
              <div className="h-4 w-64 rounded-xl bg-white/50 animate-pulse" />
            </div>
            <div className="relative flex min-h-[50dvh] lg:min-h-dvh flex-1 flex-col items-center justify-center px-6 pt-12 pb-12 lg:pt-20 bg-[#5E1F27]">
              <div className="size-40 sm:size-48 rounded-full bg-white/10 animate-pulse mb-6" />
              <div className="h-10 w-48 rounded-2xl bg-white/15 animate-pulse mb-3" />
              <div className="h-4 w-64 rounded-xl bg-white/10 animate-pulse" />
            </div>
          </>
        )}

        {/* ================= DAFTAR PROFIL ANAK (RESPONSIF BISA 1, 2, ATAU LEBIH) ================= */}
        {daftarAnak.map((anak, index) => {
          const tema = TEMA_ANAK[index % TEMA_ANAK.length];
          const panelId = `anak-${anak.anak_id}`;
          const isHovered = panelHover === panelId;
          const isSelecting = memilih === anak.anak_id;

          return (
            <motion.div
              key={anak.anak_id}
              role="button"
              tabIndex={0}
              aria-label={`Pilih profil ${anak.nama_panggilan}`}
              onMouseEnter={() => setPanelHover(panelId)}
              onMouseLeave={() => setPanelHover(null)}
              onFocus={() => setPanelHover(panelId)}
              onBlur={() => setPanelHover(null)}
              onClick={() => pilihAnak(anak)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pilihAnak(anak);
                }
              }}
              animate={{
                flex: getFlex(panelId),
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex min-h-[46dvh] lg:min-h-dvh flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-12 sm:px-10 border-b-2 lg:border-b-0 lg:border-r-2 border-[#E5B97F]/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emas/70"
            >
              {/* Latar Ilustrasi Lembut dengan Efek Zoom Halus Saat Hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
              >
                <img
                  src="/dekorasi/bg-langit-pelita.webp"
                  alt=""
                  className="h-full w-full object-cover object-center opacity-75"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: tema.radialBg }}
                />
                <img
                  src={tema.awanAtas}
                  alt=""
                  className="absolute top-14 -left-6 w-40 sm:w-56 opacity-60 transition-transform duration-700 group-hover:translate-x-3"
                />
                <img
                  src={tema.awanBawah}
                  alt=""
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[620px] max-w-none opacity-50"
                />
                <BintangKilau
                  varian={tema.bintangVarian[0]}
                  ukuran={32}
                  delay={0.2 + index * 0.15}
                  className="absolute top-24 right-[16%]"
                />
                <BintangKilau
                  varian={tema.bintangVarian[1]}
                  ukuran={26}
                  delay={0.8 + index * 0.2}
                  className="absolute bottom-24 left-[14%]"
                />
              </div>

              {/* Konten Tengah Profil Anak (Tanpa badge "Ruang Belajar Anak") */}
              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                {/* Maskot Pijar Sebagai Avatar Anak */}
                <motion.div
                  animate={{
                    scale: isHovered ? 1.08 : 1,
                    y: isHovered ? -8 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="relative my-4 flex items-center justify-center"
                >
                  <div
                    aria-hidden
                    className="absolute size-44 sm:size-52 rounded-full bg-[#FFFDF9]/85 blur-2xl transition-transform duration-500 group-hover:scale-115"
                  />
                  <div
                    className="relative flex size-36 sm:size-44 xl:size-48 items-center justify-center rounded-full bg-gradient-to-b from-[#FFFDF9] to-[#FCECD7] border-4 border-white transition-all duration-300"
                    style={{
                      boxShadow: isHovered
                        ? `0 22px 55px ${tema.bayanganHover}`
                        : "0 16px 40px rgba(234,123,48,0.22)",
                    }}
                  >
                    <MascotPijar
                      ekspresi={tema.ekspresi}
                      gerak="idle"
                      ukuran={ukuranMascot}
                      className="drop-shadow-[0_10px_20px_rgba(234,123,48,0.2)]"
                    />
                  </div>
                </motion.div>

                {/* Nama Anak Berubah Glowing Saat Kursor Mengarah ke Profil (Motion Glow) */}
                <div className="relative my-2 inline-flex flex-col items-center">
                  {/* Layer Aura Cahaya di Balik Teks */}
                  <motion.span
                    aria-hidden
                    animate={{
                      opacity: isHovered ? 0.9 : 0,
                      scale: isHovered ? 1.08 : 0.95,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 select-none font-heading text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight blur-md text-[#E26B1E]"
                    style={{
                      textShadow:
                        "0 0 24px rgba(226,107,30,0.95), 0 0 45px rgba(243,180,72,0.85)",
                    }}
                  >
                    {anak.nama_panggilan}
                  </motion.span>

                  {/* Teks Utama yang Memancar Saat Hover */}
                  <motion.h2
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                      y: isHovered ? -3 : 0,
                      textShadow: isHovered
                        ? "0 0 16px #F3B448, 0 0 30px #EA7B30, 0 0 45px #FFFDF9, 0 2px 4px rgba(46,11,7,0.15)"
                        : "none",
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="relative z-10 font-heading text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight text-teks leading-tight"
                  >
                    {anak.nama_panggilan}
                  </motion.h2>

                  {/* Garis Aksen Glowing Bawah yang Melebar Halus Saat Hover */}
                  <motion.div
                    animate={{
                      width: isHovered ? "75%" : "0%",
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    className="h-1 rounded-full mt-2"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #EA7B30, transparent)",
                      boxShadow: "0 0 12px rgba(234,123,48,0.8)",
                    }}
                  />
                </div>

                {/* Deskripsi Halus (Tanpa Tombol Statis "Belajar Sebagai...") */}
                <p className="mt-2 text-xs sm:text-sm font-medium text-teks-2 leading-relaxed max-w-xs transition-opacity duration-300">
                  {isSelecting
                    ? "Membuka ruang belajar…"
                    : "Mulai petualangan cerita dan kuis hari ini bersama Pijar."}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* ================= PANEL KANAN: PROFIL ORANG TUA / PENDAMPING ================= */}
        {profil && (
          <motion.div
            role="button"
            tabIndex={0}
            aria-label="Pilih profil pendamping (area terlindungi PIN)"
            onMouseEnter={() => setPanelHover("pendamping")}
            onMouseLeave={() => setPanelHover(null)}
            onFocus={() => setPanelHover("pendamping")}
            onBlur={() => setPanelHover(null)}
            onClick={() => setModePin(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModePin(true);
              }
            }}
            animate={{
              flex: getFlex("pendamping"),
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex min-h-[46dvh] lg:min-h-dvh flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden px-6 pt-12 pb-12 lg:pt-20 sm:px-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emas/70"
          >
            {/* Latar Hangat Elegan untuk Orang Tua / Pendamping */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(145deg, #521922 0%, #6E2429 48%, #8E362C 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-20 bg-[url(/ilustrasi/peta-pola.webp)] bg-[length:460px_auto]" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 75% 65% at 50% 45%, rgba(243,180,72,0.22) 0%, rgba(74,21,32,0.45) 100%)",
                }}
              />
              <img
                src="/dekorasi/awan-3.webp"
                alt=""
                className="absolute top-14 -right-6 w-44 sm:w-60 opacity-35 transition-transform duration-700 group-hover:-translate-x-3"
              />
              <img
                src="/dekorasi/awan-12.webp"
                alt=""
                className="absolute -bottom-6 -right-6 w-52 sm:w-68 opacity-35"
              />
            </div>

            {/* Konten Tengah Panel Orang Tua / Pendamping (Tanpa badge "Area Terlindungi PIN") */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm text-[#FFFDF9]">
              {/* Ikon Medali Elegan Orang Tua / Pendamping */}
              <motion.div
                animate={{
                  scale: panelHover === "pendamping" ? 1.08 : 1,
                  y: panelHover === "pendamping" ? -8 : 0,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="relative my-4 flex items-center justify-center"
              >
                <div
                  aria-hidden
                  className="absolute size-44 sm:size-52 rounded-full bg-[#F3B448]/22 blur-2xl transition-transform duration-500 group-hover:scale-115"
                />
                <div className="relative flex size-36 sm:size-44 xl:size-48 flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#FFFDF9]/18 to-[#FFFDF9]/8 backdrop-blur-md border-4 border-[#F3B448]/65 shadow-[0_18px_45px_rgba(26,6,10,0.42)] transition-all duration-300 group-hover:border-[#F3B448] group-hover:bg-[#FFFDF9]/22">
                  <HeartHandshake
                    className="size-16 sm:size-18 xl:size-20 text-[#F3B448] drop-shadow-[0_6px_16px_rgba(243,180,72,0.35)]"
                    strokeWidth={1.6}
                    aria-hidden
                  />
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#F3B448] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-wider text-teks">
                    <ShieldCheck className="size-3 text-bata" aria-hidden />
                    <span>Orang Tua / Guru</span>
                  </span>
                </div>
              </motion.div>

              {/* Nama "Pendamping" Berubah Glowing Saat Kursor Mengarah ke Profil */}
              <div className="relative my-2 inline-flex flex-col items-center">
                {/* Layer Aura Cahaya Keemasan di Balik Teks */}
                <motion.span
                  aria-hidden
                  animate={{
                    opacity: panelHover === "pendamping" ? 0.95 : 0,
                    scale: panelHover === "pendamping" ? 1.08 : 0.95,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="pointer-events-none absolute inset-0 select-none font-heading text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight blur-md text-[#F3B448]"
                  style={{
                    textShadow:
                      "0 0 24px rgba(243,180,72,1), 0 0 45px rgba(251,227,181,0.85)",
                  }}
                >
                  Pendamping
                </motion.span>

                {/* Teks Utama yang Memancar Keemasan */}
                <motion.h2
                  animate={{
                    scale: panelHover === "pendamping" ? 1.08 : 1,
                    y: panelHover === "pendamping" ? -3 : 0,
                    textShadow:
                      panelHover === "pendamping"
                        ? "0 0 16px #F3B448, 0 0 32px #FBE3B5, 0 0 48px #EA7B30, 0 2px 4px rgba(0,0,0,0.4)"
                        : "none",
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="relative z-10 font-heading text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight text-[#FFFDF9] leading-tight"
                >
                  Pendamping
                </motion.h2>

                {/* Garis Aksen Glowing Bawah yang Melebar Halus Saat Hover */}
                <motion.div
                  animate={{
                    width: panelHover === "pendamping" ? "75%" : "0%",
                    opacity: panelHover === "pendamping" ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  className="h-1 rounded-full mt-2"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #F3B448, transparent)",
                    boxShadow: "0 0 12px rgba(243,180,72,0.8)",
                  }}
                />
              </div>

              {/* Deskripsi Halus (Tanpa Tombol Statis "Masuk Dashboard Pendamping") */}
              <p className="mt-2 text-xs sm:text-sm font-medium text-[#FCEBD4]/85 leading-relaxed max-w-xs transition-opacity duration-300">
                Pantau ringkasan belajar anak, kelola jeda istirahat, dan siapkan
                laporan.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pesan Galat Jika Ada */}
      {galat && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <p
            role="alert"
            className="rounded-2xl bg-[#FFFDF9] border-2 border-emas px-5 py-3 font-bold text-teks shadow-lg"
          >
            {galat}
          </p>
        </div>
      )}

      {/* ==================== MODAL PIN PENDAMPING ==================== */}
      <AnimatePresence>
        {modePin && (
          <motion.div
            key="modal-pin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModePin(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-teks/55 backdrop-blur-sm p-4"
          >
            <motion.section
              key="pin"
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 12,
                transition: { duration: 0.15 },
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-sm flex-col items-center rounded-[32px] bg-[#FFFDF9] border-2 border-[#E5B97F] p-6 text-center shadow-[0_24px_70px_rgba(42,10,16,0.38)] sm:p-8"
            >
              <div className="flex w-full justify-start">
                <button
                  type="button"
                  onClick={() => setModePin(false)}
                  className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-bold text-teks-2 hover:bg-pasir hover:text-teks focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
                >
                  <ArrowLeft className="size-4" aria-hidden /> Kembali
                </button>
              </div>
              <span className="mt-1 flex size-16 items-center justify-center rounded-2xl bg-pasir text-bata">
                <ShieldCheck className="size-9" aria-hidden />
              </span>
              <h2 className="mt-3 text-[26px] font-black text-teks">
                PIN pendamping
              </h2>
              <p className="mt-1 mb-5 text-[15px] text-teks-2">
                Masukkan PIN untuk membuka dashboard pendamping.
              </p>
              <PadPin onKirim={kirimPin} />
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
