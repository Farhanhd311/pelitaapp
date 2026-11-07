"use client";

// Kartu "Perlu Perhatian" pendamping (PRD 9.8 F-DASH-2).
// Warna amber/emas hangat (PANDUAN 13: tidak pernah memakai warna merah untuk peringatan).
// Berisi saran bijak berkonsultasi dengan tim medis atau peninjauan materi oleh guru.

import { AlertCircle, BookOpen, HeartPulse, Sparkles, ShieldAlert } from "lucide-react";
import type { KartuPerhatian } from "@/lib/kontrak/pendamping";

export function KartuPerluPerhatian({ daftar }: { daftar: KartuPerhatian[] }) {
  if (daftar.length === 0) return null;

  return (
    <section aria-labelledby="judul-perlu-perhatian" className="space-y-3">
      <h2 id="judul-perlu-perhatian" className="sr-only">
        Pemberitahuan Perlu Perhatian
      </h2>

      {daftar.map((item, idx) => {
        const isDarurat = item.jenis === "eskalasi_darurat";
        const isPelajaran = item.jenis === "tp_perlu_ditinjau";

        return (
          <div
            key={idx}
            role="alert"
            className="flex flex-col sm:flex-row items-start gap-3.5 rounded-2xl border-2 border-[#ECAC54] bg-[#FFFBF2] p-4 sm:p-5 shadow-xs transition-all duration-300"
          >
            {/* Ikon Amber Lembut */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FCEBD4] text-[#C48528] border border-[#ECAC54]/60">
              {isPelajaran ? (
                <BookOpen className="size-5" />
              ) : isDarurat ? (
                <ShieldAlert className="size-5 text-bata" />
              ) : (
                <HeartPulse className="size-5" />
              )}
            </div>

            {/* Konten Saran & Catatan */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emas px-2.5 py-0.5 text-[10px] font-heading font-black uppercase tracking-wider text-teks">
                  Perlu Perhatian
                </span>
                {item.tp_kode && (
                  <span className="rounded-full bg-white border border-[#ECAC54] px-2 py-0.5 text-[10px] font-bold text-bata">
                    Materi {item.tp_kode}
                  </span>
                )}
                <h3 className="font-heading text-base font-extrabold text-teks">
                  {item.judul}
                </h3>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-teks-2">
                {item.isi}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
