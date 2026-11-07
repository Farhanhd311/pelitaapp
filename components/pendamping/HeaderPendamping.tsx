"use client";

// Header mode pendamping: navigasi, identitas pendamping, switcher anak binaan, dan aksi keluar.
// Mengikuti bahasa visual dominan PELITA: floating pill, rounded cards, palet hangat.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  User,
  Users,
  Sparkles,
} from "lucide-react";
import { panggilApi } from "@/lib/api/klien";
import type { ProfilAnak } from "@/lib/kontrak/auth";

export function HeaderPendamping({
  namaPendamping,
  hubungan,
  daftarAnak,
  anakAktifId,
  onGantiAnak,
}: {
  namaPendamping: string;
  hubungan: string;
  daftarAnak: ProfilAnak[];
  anakAktifId: number;
  onGantiAnak: (anakId: number) => void;
}) {
  const router = useRouter();
  const [bukaMenuAnak, setBukaMenuAnak] = useState(false);

  async function keluar() {
    await panggilApi("/api/auth/logout", {}).catch(() => undefined);
    router.replace("/login");
  }

  const anakAktif = daftarAnak.find((a) => a.anak_id === anakAktifId);
  const labelPeran =
    hubungan === "orang_tua"
      ? "Orang Tua"
      : hubungan === "wali"
        ? "Wali"
        : "Guru Pendamping";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E5B97F]/70 bg-[#FFFDF9]/90 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        {/* Kiri: Brand PELITA & Navigasi Cepat */}
        <div className="flex items-center gap-3">
          <Link
            href="/pilih-profil"
            className="rounded-full bg-[#FCEBD4] border border-[#E5B97F] px-4 py-1.5 font-heading text-base sm:text-lg font-black tracking-widest text-teks transition hover:bg-emas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emas"
          >
            PELITA
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-pasir-muda px-3 py-1 text-xs font-bold text-teks-2 border border-[#E5B97F]/60">
            <ShieldCheck className="size-3.5 text-bata" />
            <span>Ruang Pendamping</span>
          </span>
        </div>

        {/* Tengah/Kanan: Switcher Anak Binaan & Profil */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switcher Anak jika ada anak */}
          {daftarAnak.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBukaMenuAnak((b) => !b)}
                className="flex items-center gap-2 rounded-full border border-[#E5B97F] bg-white px-3 py-1.5 text-xs sm:text-sm font-extrabold text-teks shadow-2xs hover:bg-[#FFF4E4] transition cursor-pointer"
              >
                <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-emas/30 text-bata">
                  <User className="size-3.5" />
                </div>
                <span>{anakAktif?.nama_panggilan ?? "Pilih Anak"}</span>
                {daftarAnak.length > 1 && (
                  <ChevronDown className="size-3.5 text-teks-2" />
                )}
              </button>

              {/* Menu Pilihan Anak Binaan */}
              {bukaMenuAnak && daftarAnak.length > 1 && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border-2 border-[#E5B97F] bg-[#FFFDF9] p-1.5 shadow-lg z-40">
                  <p className="px-3 py-1.5 text-[11px] font-bold text-teks-2 uppercase tracking-wider">
                    Pilih Anak
                  </p>
                  {daftarAnak.map((anak) => (
                    <button
                      key={anak.anak_id}
                      type="button"
                      onClick={() => {
                        onGantiAnak(anak.anak_id);
                        setBukaMenuAnak(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition text-left cursor-pointer ${
                        anak.anak_id === anakAktifId
                          ? "bg-emas text-teks"
                          : "text-teks hover:bg-[#FCEBD4]"
                      }`}
                    >
                      <span>{anak.nama_panggilan}</span>
                      {anak.anak_id === anakAktifId && (
                        <span className="size-2 rounded-full bg-bata" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Badge Identitas Pendamping */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-[#FFF4E4] border border-[#E5B97F]/70 px-3.5 py-1.5 text-xs text-teks">
            <span className="font-extrabold">{namaPendamping}</span>
            <span className="text-[10px] rounded-full bg-[#E5B97F]/40 px-2 py-0.5 font-bold text-teks-2">
              {labelPeran}
            </span>
          </div>

          {/* Tombol ke Mode Anak (Pilih Profil) */}
          <Link
            href="/pilih-profil"
            className="flex items-center gap-1.5 rounded-full border border-[#E5B97F] bg-white px-3 py-1.5 text-xs font-bold text-teks transition hover:bg-pasir shadow-2xs"
          >
            <Sparkles className="size-3.5 text-bata" />
            <span className="hidden sm:inline">Ganti Profil</span>
          </Link>

          {/* Tombol Keluar */}
          <button
            type="button"
            onClick={keluar}
            title="Keluar dari akun"
            className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-[#E5B97F] bg-white text-teks transition hover:bg-rose-50 hover:text-bata cursor-pointer shadow-2xs"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
