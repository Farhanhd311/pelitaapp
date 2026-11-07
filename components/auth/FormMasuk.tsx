"use client";

// Formulir masuk pendamping/admin (PRD F-AUTH-1): email + password -> POST /api/auth/login.
// Admin -> halaman admin; pendamping -> pilih profil (avatar anak atau mode Pendamping dengan PIN).
// Anak bukan akun: anak masuk dengan mengetuk avatarnya setelah pendamping masuk (PANDUAN 4).

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoPelita } from "@/components/LogoPelita";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsLogin, ResponsProfil } from "@/lib/kontrak/auth";

// DATA CONTOH: akun demo dari seed (lihat docs/api.http). Mengetuk chip hanya mengisi email; password tetap diketik.
const AKUN_DEMO = [
  { label: "Ibu Sari", peran: "Orang tua", email: "sari@pelita.demo" },
  { label: "Kak Dina", peran: "Guru", email: "dina@pelita.demo" },
  { label: "Admin", peran: "Admin", email: "admin@pelita.demo" },
];

const tujuanSetelahMasuk = (mode: ResponsLogin["mode"]) => (mode === "admin" ? "/admin/aturan-ai" : "/pilih-profil");

export function FormMasuk() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lihatPassword, setLihatPassword] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Sudah masuk? Langsung lanjut, tidak perlu mengisi formulir lagi.
  useEffect(() => {
    panggilApi<ResponsProfil>("/api/auth/profil")
      .then((p) => router.replace(p.role === "admin" ? "/admin/aturan-ai" : "/pilih-profil"))
      .catch(() => undefined);
  }, [router]);

  async function masuk(e: FormEvent) {
    e.preventDefault();
    setMengirim(true);
    setGalat(null);
    try {
      const hasil = await panggilApi<ResponsLogin>("/api/auth/login", { email, password });
      router.push(tujuanSetelahMasuk(hasil.mode));
    } catch (err) {
      setGalat(pesanGalat(err));
      setMengirim(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center justify-between gap-3">
        <LogoPelita ukuran={48} />
        {/* di layar kecil panel sambutan disembunyikan, jadi Pijar tampil di sini */}
        <MascotPijar ekspresi="sambut" ukuran={72} className="lg:hidden" />
      </div>

      <h1 className="mt-6 text-[30px] sm:text-[32px] leading-tight font-black">Selamat datang!</h1>
      <p className="mt-1.5 text-[15px] sm:text-[16px] text-teks-2">
        Masuk sebagai pendamping atau admin untuk melanjutkan.
      </p>

      <form onSubmit={masuk} className="mt-6 flex flex-col gap-4" noValidate>
        <Isian
          id="email"
          label="Email"
          ikon={<Mail className="size-5" aria-hidden />}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="nama@contoh.id"
          galat={Boolean(galat)}
        />
        <Isian
          id="password"
          label="Password"
          ikon={<Lock className="size-5" aria-hidden />}
          type={lihatPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Password akun"
          galat={Boolean(galat)}
          tambahan={
            <button
              type="button"
              onClick={() => setLihatPassword((x) => !x)}
              aria-label={lihatPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-teks-2 transition hover:bg-pasir hover:text-teks focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
            >
              {lihatPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
        />

        {galat && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -5, 5, -3, 0] }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl bg-emas/25 px-4 py-3 text-[15px] font-semibold text-teks"
          >
            {galat}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={mengirim || !email || !password}
          className="mt-1 inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-bata px-7 font-heading text-[16px] font-extrabold text-white shadow-[0_5px_0_var(--color-bata-tua)] transition-[transform,box-shadow,filter] duration-150 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-[3px] active:shadow-[0_2px_0_var(--color-bata-tua)] disabled:pointer-events-none disabled:opacity-50"
        >
          {mengirim ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden /> Memeriksa…
            </>
          ) : (
            <>
              Masuk <ArrowRight className="size-5" aria-hidden />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-[20px] border-2 border-dashed border-garis bg-[#FCECD7]/45 p-3.5">
        <p className="text-xs font-extrabold tracking-wide text-teks-2 uppercase">Akun demo · data contoh</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {AKUN_DEMO.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => {
                setEmail(a.email);
                setGalat(null);
                document.getElementById("password")?.focus();
              }}
              className={cn(
                "flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 text-left text-xs sm:text-sm font-bold transition hover:border-jingga hover:bg-pasir-muda focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none",
                email === a.email ? "border-bata bg-pasir-muda" : "border-garis bg-white",
              )}
            >
              <UserRound className="size-4 text-bata" aria-hidden />
              {a.label}
              <span className="font-semibold text-teks-2">· {a.peran}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[13px] sm:text-[14px] leading-relaxed text-teks-2">
        Anak tidak perlu akun. Setelah pendamping masuk, anak cukup mengetuk avatarnya.
      </p>
    </motion.div>
  );
}

function Isian({
  id,
  label,
  ikon,
  type,
  autoComplete,
  value,
  onChange,
  placeholder,
  galat,
  tambahan,
}: {
  id: string;
  label: string;
  ikon: ReactNode;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  galat: boolean;
  tambahan?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-bold text-teks">
        {label}
      </label>
      <div
        className={cn(
          "flex min-h-13 items-center gap-2.5 rounded-full border-2 bg-[#FCECD7]/65 pr-2 pl-4 transition-[border-color,box-shadow,background-color] focus-within:border-jingga focus-within:bg-white focus-within:ring-4 focus-within:ring-emas/35",
          galat ? "border-emas" : "border-[#E5B97F]/80",
        )}
      >
        <span className="text-bata/85">{ikon}</span>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={galat}
          required
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-semibold text-teks outline-none placeholder:font-normal placeholder:text-teks-2/60"
        />
        {tambahan}
      </div>
    </div>
  );
}
