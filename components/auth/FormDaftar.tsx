"use client";

// Formulir daftar orang tua/wali (halaman /daftar), tiga langkah -> POST /api/auth/daftar.
//   1. Akun: nama, email, nomor WhatsApp, password, hubungan dengan anak.
//   2. Anak: nama panggilan, tanggal lahir, kelas seharusnya (otomatis dari usia, bisa diubah), asal sekolah.
//   3. PIN pendamping (dibuat sistem, dikirim ke WhatsApp) + persetujuan data. Tombol Daftar hidup setelah dicentang.
// Kelas terakhir tidak ditanya: diambil dari pilihan kelas saat asesmen pertama (PANDUAN 7.2).

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  MessageCircle,
  School,
  ShieldCheck,
  Smile,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoPelita } from "@/components/LogoPelita";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { Isian } from "@/components/auth/Isian";
import { GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import { hitungKelasSeharusnya, normalisasiNoWa } from "@/lib/auth/daftar";
import type { PermintaanDaftar, ResponsDaftar } from "@/lib/kontrak/auth";

const LANGKAH = ["Akun", "Anak", "PIN & data"] as const;
const KELAS_SD = [1, 2, 3, 4, 5, 6];
const PASSWORD_MIN = 8; // sama dengan PermintaanDaftar (lib/kontrak/auth.ts)

type Hubungan = PermintaanDaftar["hubungan"];

const tanggalLewat = (tgl: string) => Boolean(tgl) && new Date(`${tgl}T00:00:00`) <= new Date();

export function FormDaftar() {
  const router = useRouter();
  const [langkah, setLangkah] = useState(0);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [hasil, setHasil] = useState<ResponsDaftar | null>(null);

  // Langkah 1
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noWa, setNoWa] = useState("");
  const [password, setPassword] = useState("");
  const [ulangPassword, setUlangPassword] = useState("");
  const [lihatPassword, setLihatPassword] = useState(false);
  const [hubungan, setHubungan] = useState<Hubungan | null>(null);
  // Langkah 2
  const [namaAnak, setNamaAnak] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [kelas, setKelas] = useState<number | null>(null);
  const [kelasDiubah, setKelasDiubah] = useState(false); // orang tua memilih sendiri -> jangan ditimpa hitungan usia
  const [asalSekolah, setAsalSekolah] = useState("");
  const [tglBerhenti, setTglBerhenti] = useState("");
  // Langkah 3
  const [setuju, setSetuju] = useState(false);

  function ubahTglLahir(tgl: string) {
    setTglLahir(tgl);
    if (!kelasDiubah) setKelas(hitungKelasSeharusnya(tgl, new Date()));
  }

  // Pemeriksaan per langkah supaya kesalahan terlihat sebelum pindah langkah. Server tetap memeriksa ulang.
  function periksaLangkah(i: number): string | null {
    if (i === 0) {
      if (nama.trim().length < 2) return "Tulis nama lengkap Anda dulu, ya.";
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Format email belum benar.";
      if (!normalisasiNoWa(noWa)) return "Nomor WhatsApp belum benar. Contoh: 0812 3456 7890.";
      if (password.length < PASSWORD_MIN) return `Password minimal ${PASSWORD_MIN} karakter.`;
      if (password !== ulangPassword) return "Ulangi password belum sama.";
      if (!hubungan) return "Pilih hubungan Anda dengan anak.";
    }
    if (i === 1) {
      if (!namaAnak.trim()) return "Tulis nama panggilan anak dulu, ya.";
      if (!tanggalLewat(tglLahir)) return "Tanggal lahir anak belum benar.";
      if (!kelas) return "Pilih kelas anak seharusnya.";
      if (tglBerhenti && !tanggalLewat(tglBerhenti)) return "Tanggal berhenti sekolah belum benar.";
    }
    return null;
  }

  function lanjut() {
    const masalah = periksaLangkah(langkah);
    setGalat(masalah);
    if (!masalah) setLangkah((x) => x + 1);
  }

  async function daftar(e: FormEvent) {
    e.preventDefault();
    if (langkah < 2) return lanjut();
    if (!setuju || !hubungan || !kelas) return;
    setMengirim(true);
    setGalat(null);
    const isian: PermintaanDaftar = {
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      no_wa: noWa,
      password,
      hubungan,
      anak: {
        nama_panggilan: namaAnak.trim(),
        tgl_lahir: tglLahir,
        kelas_seharusnya: kelas,
        ...(asalSekolah.trim() ? { asal_sekolah: asalSekolah.trim() } : {}),
        ...(tglBerhenti ? { tgl_berhenti_sekolah: tglBerhenti } : {}),
      },
      setuju_data: true,
    };
    try {
      setHasil(await panggilApi<ResponsDaftar>("/api/auth/daftar", isian));
    } catch (err) {
      // Email sudah terdaftar -> kembali ke langkah akun supaya bisa diperbaiki.
      if (err instanceof GalatKlien && err.kode === "BENTROK") setLangkah(0);
      setGalat(pesanGalat(err));
    } finally {
      setMengirim(false);
    }
  }

  if (hasil) return <LayarBerhasil hasil={hasil} lanjut={() => router.push("/pilih-profil")} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center justify-between gap-3">
        <LogoPelita ukuran={48} />
        <MascotPijar ekspresi="sambut" ukuran={72} className="lg:hidden" />
      </div>

      <h1 className="mt-6 text-[30px] sm:text-[32px] leading-tight font-black">Buat akun</h1>
      <p className="mt-1.5 text-[15px] sm:text-[16px] text-teks-2">Untuk orang tua atau wali. Cukup tiga langkah singkat.</p>

      <PenandaLangkah aktif={langkah} />

      <form onSubmit={daftar} className="mt-5 flex flex-col gap-4" noValidate>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={langkah}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {langkah === 0 && (
              <>
                <Isian id="nama" label="Nama lengkap" ikon={<UserRound className="size-5" aria-hidden />} type="text" autoComplete="name" value={nama} onChange={setNama} placeholder="Misalnya Sari Lestari" />
                <Isian id="email" label="Email" ikon={<Mail className="size-5" aria-hidden />} type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} placeholder="nama@contoh.id" />
                <Isian id="no_wa" label="Nomor WhatsApp" ikon={<MessageCircle className="size-5" aria-hidden />} type="tel" inputMode="tel" autoComplete="tel" value={noWa} onChange={setNoWa} placeholder="0812 3456 7890" />
                <Isian
                  id="password"
                  label="Password"
                  ikon={<Lock className="size-5" aria-hidden />}
                  type={lihatPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                  placeholder={`Minimal ${PASSWORD_MIN} karakter`}
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
                <Isian id="ulang_password" label="Ulangi password" ikon={<Lock className="size-5" aria-hidden />} type={lihatPassword ? "text" : "password"} autoComplete="new-password" value={ulangPassword} onChange={setUlangPassword} placeholder="Ketik ulang password" />
                <PilihanChip
                  label="Hubungan dengan anak"
                  pilihan={[
                    { nilai: "orang_tua", teks: "Orang tua" },
                    { nilai: "wali", teks: "Wali" },
                  ]}
                  nilai={hubungan}
                  ubah={(v) => setHubungan(v as Hubungan)}
                />
              </>
            )}

            {langkah === 1 && (
              <>
                <Isian id="nama_anak" label="Nama panggilan anak" ikon={<Smile className="size-5" aria-hidden />} type="text" autoComplete="off" value={namaAnak} onChange={setNamaAnak} placeholder="Misalnya Raka" />
                <Isian id="tgl_lahir" label="Tanggal lahir" ikon={<CalendarDays className="size-5" aria-hidden />} type="date" autoComplete="off" value={tglLahir} onChange={ubahTglLahir} />
                <PilihanChip
                  label="Kelas seharusnya"
                  keterangan={kelas && !kelasDiubah ? "Dihitung dari usia. Ketuk kelas lain jika berbeda." : undefined}
                  pilihan={KELAS_SD.map((k) => ({ nilai: String(k), teks: `Kelas ${k}` }))}
                  nilai={kelas ? String(kelas) : null}
                  ubah={(v) => {
                    setKelas(Number(v));
                    setKelasDiubah(true);
                  }}
                  kecil
                />
                <Isian id="asal_sekolah" label="Asal sekolah" opsional ikon={<School className="size-5" aria-hidden />} type="text" autoComplete="off" value={asalSekolah} onChange={setAsalSekolah} placeholder="Misalnya SD Negeri 12 Padang" />
                <Isian id="tgl_berhenti" label="Tanggal berhenti sekolah" opsional ikon={<CalendarDays className="size-5" aria-hidden />} type="date" autoComplete="off" value={tglBerhenti} onChange={setTglBerhenti} />
              </>
            )}

            {langkah === 2 && (
              <>
                <div className="flex gap-3 rounded-[20px] border-2 border-[#E5B97F]/80 bg-[#FCECD7]/55 p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-bata">
                    <KeyRound className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-extrabold">PIN pendamping dibuat otomatis</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-teks-2">
                      Setelah mendaftar, kami mengirim PIN 6 angka ke WhatsApp <b className="text-teks">{noWa}</b>. PIN dipakai untuk masuk ke mode pendamping dari mode anak.
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border-2 border-dashed border-garis bg-white p-4 text-[14px] leading-relaxed text-teks-2">
                  <p className="flex items-center gap-2 font-extrabold text-teks">
                    <ShieldCheck className="size-5 text-bata" aria-hidden /> Data yang kami simpan
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Nama panggilan, tanggal lahir, kelas, dan asal sekolah anak.</li>
                    <li>Hasil belajar per Tujuan Pembelajaran dan check-in harian.</li>
                    <li>Kami <b className="text-teks">tidak</b> menyimpan diagnosis, data obat, atau isi cerita anak di Teman Cerita.</li>
                    <li>Anda bisa melihat progres anak dan menghapus datanya kapan saja.</li>
                  </ul>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-[20px] p-1 text-[15px] font-semibold">
                  <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="peer sr-only" />
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-emas/60",
                      setuju ? "border-bata bg-bata text-white" : "border-[#E5B97F] bg-white",
                    )}
                  >
                    {setuju && <Check className="size-5" strokeWidth={3} />}
                  </span>
                  Saya {hubungan === "wali" ? "wali" : "orang tua"} dari {namaAnak.trim() || "anak ini"} dan setuju datanya disimpan seperti di atas.
                </label>
              </>
            )}
          </motion.div>
        </AnimatePresence>

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

        <div className="mt-1 flex gap-3">
          {langkah > 0 && (
            <button
              type="button"
              onClick={() => {
                setGalat(null);
                setLangkah((x) => x - 1);
              }}
              className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#E5B97F] bg-white px-5 font-heading text-[16px] font-extrabold text-teks transition hover:bg-pasir-muda focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
            >
              <ArrowLeft className="size-5" aria-hidden /> Kembali
            </button>
          )}
          <button
            type="submit"
            disabled={mengirim || (langkah === 2 && !setuju)}
            className="inline-flex min-h-13 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-bata px-7 font-heading text-[16px] font-extrabold text-white shadow-[0_5px_0_var(--color-bata-tua)] transition-[transform,box-shadow,filter] duration-150 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-[3px] active:shadow-[0_2px_0_var(--color-bata-tua)] disabled:pointer-events-none disabled:opacity-50"
          >
            {mengirim ? (
              <>
                <LoaderCircle className="size-5 animate-spin" aria-hidden /> Mendaftarkan…
              </>
            ) : langkah < 2 ? (
              <>
                Lanjut <ArrowRight className="size-5" aria-hidden />
              </>
            ) : (
              <>
                Daftar <ArrowRight className="size-5" aria-hidden />
              </>
            )}
          </button>
        </div>
      </form>

      <p className="mt-5 text-center text-[15px] font-semibold text-teks-2">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-extrabold text-bata underline-offset-4 hover:underline focus-visible:rounded focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none">
          Masuk
        </Link>
      </p>
    </motion.div>
  );
}

function PenandaLangkah({ aktif }: { aktif: number }) {
  return (
    <ol className="mt-5 flex items-center gap-2" aria-label="Langkah pendaftaran">
      {LANGKAH.map((nama, i) => (
        <li key={nama} className="flex flex-1 items-center gap-2" aria-current={i === aktif ? "step" : undefined}>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-[14px] font-black transition",
              i < aktif && "border-bata bg-bata text-white",
              i === aktif && "border-bata bg-white text-bata",
              i > aktif && "border-[#E5B97F] bg-[#FCECD7]/65 text-teks-2",
            )}
          >
            {i < aktif ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
          </span>
          <span className={cn("text-[13px] font-bold", i === aktif ? "text-teks" : "text-teks-2")}>{nama}</span>
          {i < LANGKAH.length - 1 && <span aria-hidden className={cn("h-0.5 flex-1 rounded-full", i < aktif ? "bg-bata" : "bg-[#E5B97F]/60")} />}
        </li>
      ))}
    </ol>
  );
}

function PilihanChip({
  label,
  keterangan,
  pilihan,
  nilai,
  ubah,
  kecil = false,
}: {
  label: string;
  keterangan?: string;
  pilihan: { nilai: string; teks: string }[];
  nilai: string | null;
  ubah: (v: string) => void;
  kecil?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[14px] font-bold text-teks">{label}</legend>
      <div className={cn("grid gap-2", kecil ? "grid-cols-3" : "grid-cols-2")}>
        {pilihan.map((p) => (
          <button
            key={p.nilai}
            type="button"
            onClick={() => ubah(p.nilai)}
            aria-pressed={nilai === p.nilai}
            className={cn(
              "min-h-12 cursor-pointer rounded-full border-2 px-3 text-[15px] font-bold transition focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none",
              nilai === p.nilai ? "border-bata bg-pasir-muda text-teks" : "border-[#E5B97F]/80 bg-white text-teks-2 hover:border-jingga",
            )}
          >
            {p.teks}
          </button>
        ))}
      </div>
      {keterangan && <p className="text-[13px] text-teks-2">{keterangan}</p>}
    </fieldset>
  );
}

function LayarBerhasil({ hasil, lanjut }: { hasil: ResponsDaftar; lanjut: () => void }): ReactNode {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
      <MascotPijar ekspresi="senang" ukuran={110} className="mx-auto" />
      <h1 className="mt-4 text-[28px] leading-tight font-black">Akun siap, {hasil.nama.split(" ")[0]}!</h1>
      {hasil.pin_terkirim_wa ? (
        <p className="mt-2 text-[16px] leading-relaxed text-teks-2">
          PIN pendamping sudah kami kirim ke WhatsApp <b className="text-teks">{hasil.no_wa_tersamar}</b>. Simpan baik-baik, ya.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[16px] leading-relaxed text-teks-2">
            WhatsApp ke <b className="text-teks">{hasil.no_wa_tersamar}</b> belum berhasil terkirim. Ini PIN pendamping Anda, catat sekarang karena hanya tampil sekali:
          </p>
          <p className="mx-auto mt-4 w-fit rounded-[20px] border-2 border-dashed border-bata bg-[#FCECD7]/65 px-6 py-3 font-heading text-[34px] font-black tracking-[0.3em] text-teks">
            {hasil.pin}
          </p>
        </>
      )}
      <button
        type="button"
        onClick={lanjut}
        className="mt-6 inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-bata px-7 font-heading text-[16px] font-extrabold text-white shadow-[0_5px_0_var(--color-bata-tua)] transition-[transform,box-shadow,filter] duration-150 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:translate-y-[3px] active:shadow-[0_2px_0_var(--color-bata-tua)]"
      >
        Lanjut ke pilih profil <ArrowRight className="size-5" aria-hidden />
      </button>
    </motion.div>
  );
}
