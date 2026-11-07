"use client";

// Aturan AI & Panel Kontrol Admin PELITA (PANDUAN 5 B12 & PANDUAN 14).
// Memungkinkan admin mereset data demo Raka sebelum presentasi panggung dan mengelola parameter sistem.

import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { TombolResetDemo } from "@/components/admin/TombolResetDemo";
import { panggilApi } from "@/lib/api/klien";

export default function HalamanAdminAturanAi() {
  const router = useRouter();

  async function keluar() {
    await panggilApi("/api/auth/logout", {}).catch(() => undefined);
    router.replace("/login");
  }

  return (
    <main className="min-h-dvh bg-[#FDF8F0] text-teks p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header Admin */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5B97F]/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-bata/15 px-3 py-1 font-heading text-xs font-black uppercase tracking-wider text-bata">
                Panel Admin
              </span>
              <span className="font-heading text-xs font-bold text-teks-2">
                PELITA 2026
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black font-heading text-teks">
              Pengaturan Sistem & Kontrol Demo
            </h1>
          </div>

          <button
            type="button"
            onClick={keluar}
            className="flex items-center gap-2 rounded-xl bg-white border border-[#E5B97F] px-4 py-2 text-xs font-extrabold text-teks hover:bg-pasir transition cursor-pointer"
          >
            <LogOut className="size-4 text-bata" />
            <span>Keluar</span>
          </button>
        </header>

        {/* Kartu Kontrol Reset Demo Panggung (PANDUAN 14) */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl border-2 border-[#E5B97F] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-bata">
                <Sparkles className="size-5" />
                <h2 className="font-heading text-lg font-black text-teks">
                  Reset Demo Raka (Panggung)
                </h2>
              </div>
              <p className="mt-2 text-sm text-teks-2 leading-relaxed">
                Mengosongkan sesi asesmen, progres capaian TP, dan jawaban Raka agar
                siap melakukan **asesmen ulang ("Petualangan Pertama")**.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-teks-2 border-t border-[#F2D7B3] pt-3">
                <li>✓ <strong>Asesmen Raka:</strong> Kosong (mulai dari soal 1)</li>
                <li>✓ <strong>Check-in Hari Ini:</strong> Kosong (siap live check-in)</li>
                <li>✓ <strong>Riwayat Lampau:</strong> 19 hari terisi untuk grafik tren</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F2D7B3]">
              <TombolResetDemo />
            </div>
          </section>

          {/* Kartu Informasi CLI */}
          <section className="rounded-2xl border border-[#E5B97F]/80 bg-[#FFFDF9] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teks-2">
                <Terminal className="size-5 text-emas" />
                <h2 className="font-heading text-lg font-black text-teks">
                  Reset Lewat Terminal (CLI)
                </h2>
              </div>
              <p className="mt-2 text-sm text-teks-2 leading-relaxed">
                Anda juga dapat mereset data demo langsung dari terminal kapan saja:
              </p>
              <div className="mt-4 space-y-2">
                <div className="rounded-lg bg-[#2E0B07] p-2.5 font-mono text-xs text-[#FBE3B5]">
                  <code>npm run reset-demo</code>
                </div>
                <p className="text-[11px] text-teks-2">
                  Atau mode 100% baru murni (tanpa riwayat lampau):
                </p>
                <div className="rounded-lg bg-[#2E0B07] p-2.5 font-mono text-xs text-[#FBE3B5]">
                  <code>npm run reset-demo -- --baru</code>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-teks-2 border-t border-[#F2D7B3] pt-3">
              <ShieldAlert className="size-4 text-emas" />
              <span>Sesuai PANDUAN Bagian 14 FIRETECH 2026</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
