"use client";

// Layar pilih profil (PANDUAN 4): satu perangkat dipakai bersama. Anak mengetuk avatarnya -> mode anak.
// Tombol "Pendamping" membuka papan PIN -> mode pendamping. Belum masuk -> ke /login; admin -> halaman admin.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { LogoPelita } from "@/components/LogoPelita";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ProfilAnak, ResponsPin, ResponsProfil } from "@/lib/kontrak/auth";
import { PadPin } from "./PadPin";

// Warna avatar bergantian dari palet (bukan warna yang berarti apa-apa).
const WARNA_AVATAR = ["bg-emas", "bg-merah-muda", "bg-jingga", "bg-pasir"];

export function PilihProfil() {
  const router = useRouter();
  const [profil, setProfil] = useState<ResponsProfil | null>(null);
  const [modePin, setModePin] = useState(false);
  const [memilih, setMemilih] = useState<number | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    panggilApi<ResponsProfil>("/api/auth/profil")
      .then((p) => (p.role === "admin" ? router.replace("/admin/aturan-ai") : setProfil(p)))
      .catch((e) => (e instanceof GalatKlien && e.kode === "BELUM_LOGIN" ? router.replace("/login") : setGalat(pesanGalat(e))));
  }, [router]);

  async function pilihAnak(anak: ProfilAnak) {
    setMemilih(anak.anak_id);
    try {
      await panggilApi("/api/auth/profil", { anak_id: anak.anak_id });
      router.push("/anak");
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

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-krem px-4 py-5 text-teks sm:px-8">
      <span aria-hidden className="pointer-events-none absolute -top-28 -left-24 size-80 rounded-full bg-pasir/70" />
      <span aria-hidden className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-merah-muda/25" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <LogoPelita ukuran={44} />
        <button
          type="button"
          onClick={keluar}
          className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-4 font-bold text-teks-2 transition hover:bg-pasir hover:text-teks focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
        >
          <LogOut className="size-5" aria-hidden /> Keluar
        </button>
      </header>

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {!modePin ? (
            <motion.section
              key="profil"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
              className="flex w-full flex-col items-center text-center"
            >
              <MascotPijar ekspresi="sambut" ukuran={120} />
              <h1 className="mt-2 text-[30px] leading-tight font-black text-balance sm:text-[38px]">Siapa yang mau belajar hari ini?</h1>
              {profil && <p className="mt-1 text-[16px] text-teks-2">Masuk sebagai {profil.nama}</p>}

              <ul className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
                {profil?.daftar_anak.map((anak, i) => (
                  <li key={anak.anak_id}>
                    <motion.button
                      type="button"
                      onClick={() => pilihAnak(anak)}
                      disabled={memilih !== null}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex cursor-pointer flex-col items-center gap-3 rounded-[28px] p-2 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none disabled:opacity-60"
                    >
                      <span
                        className={`flex size-32 items-center justify-center rounded-[36px] border-4 border-white font-heading text-[56px] font-black text-teks shadow-[0_8px_0_var(--color-garis)] transition-shadow group-hover:shadow-[0_10px_0_var(--color-jingga)] sm:size-36 ${WARNA_AVATAR[i % WARNA_AVATAR.length]}`}
                      >
                        {anak.nama_panggilan.charAt(0)}
                      </span>
                      <span className="font-heading text-[22px] font-extrabold">{memilih === anak.anak_id ? "Masuk…" : anak.nama_panggilan}</span>
                    </motion.button>
                  </li>
                ))}

                {profil && (
                  <li>
                    <motion.button
                      type="button"
                      onClick={() => setModePin(true)}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08 * profil.daftar_anak.length, type: "spring", stiffness: 260, damping: 20 }}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex cursor-pointer flex-col items-center gap-3 rounded-[28px] p-2 focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
                    >
                      <span className="flex size-32 items-center justify-center rounded-[36px] border-4 border-dashed border-jingga/60 bg-white text-bata transition-colors group-hover:bg-pasir-muda sm:size-36">
                        <ShieldCheck className="size-14" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="font-heading text-[22px] font-extrabold">Pendamping</span>
                    </motion.button>
                  </li>
                )}
              </ul>

              {!profil && !galat && <p className="mt-10 font-bold text-teks-2">Sebentar, ya…</p>}
              {galat && (
                <p role="alert" className="mt-8 rounded-2xl bg-emas/25 px-4 py-3 font-semibold">
                  {galat}
                </p>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="pin"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
              className="flex w-full max-w-sm flex-col items-center rounded-[32px] bg-white/85 p-6 text-center shadow-[0_10px_0_var(--color-garis)] sm:p-8"
            >
              <div className="flex w-full justify-start">
                <button
                  type="button"
                  onClick={() => setModePin(false)}
                  className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-bold text-teks-2 hover:bg-pasir hover:text-teks focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
                >
                  <ArrowLeft className="size-4" aria-hidden /> Kembali
                </button>
              </div>
              <span className="mt-1 flex size-16 items-center justify-center rounded-2xl bg-pasir text-bata">
                <ShieldCheck className="size-9" aria-hidden />
              </span>
              <h1 className="mt-3 text-[26px] font-black">PIN pendamping</h1>
              <p className="mt-1 mb-5 text-[15px] text-teks-2">Masukkan PIN untuk membuka dashboard pendamping.</p>
              <PadPin onKirim={kirimPin} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
