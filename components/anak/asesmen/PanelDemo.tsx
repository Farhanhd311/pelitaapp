"use client";

// Panel mode demo "putar otomatis" (PANDUAN 5 A3): batang peluang BKT bergerak setiap jawaban.
// Angka peluang HANYA tampil di mode demo (PANDUAN 7.2), tidak di asesmen biasa.

import { motion } from "motion/react";
import type { InfoDemo } from "@/lib/kontrak/asesmen";
import type { KotakPetaTp } from "@/lib/kontrak/umum";
import { BilahTp, LegendaStatus } from "./BilahTp";

const persen = (p: number) => `${Math.round(p * 100)}%`;

export function PanelDemo({
  demo,
  peta,
  tpSekarang,
  jumlahSoal,
  berjalan,
  onJedaLanjut,
}: {
  demo: InfoDemo | null;
  peta: KotakPetaTp[];
  tpSekarang: string | null;
  jumlahSoal: number;
  berjalan: boolean;
  onJedaLanjut: () => void;
}) {
  const keputusan =
    demo?.keputusan === "tercapai" ? "diputuskan TERCAPAI" : demo?.keputusan === "belum" ? "diputuskan BELUM" : "belum cukup bukti";

  return (
    <section className="w-full rounded-[20px] border-2 border-jingga/35 bg-white/85 p-4" aria-live="polite">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emas px-3 py-1 text-xs font-bold text-teks">Mode demo · putar otomatis</span>
        <span className="text-xs text-teks-2">Jawaban Raka diputar otomatis; pilihan TP & peluang dihitung mesin BKT sungguhan.</span>
        <button
          type="button"
          onClick={onJedaLanjut}
          className="ml-auto min-h-10 rounded-full border border-jingga bg-pasir px-4 text-sm font-bold text-bata hover:bg-pasir-muda"
        >
          {berjalan ? "Jeda demo" : "Lanjutkan demo"}
        </button>
      </div>

      {demo ? (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-sm font-bold text-teks">
            <span>Peluang menguasai {demo.tp_kode}</span>
            <span>
              {persen(demo.p_sebelum)} → {persen(demo.p_sesudah)} · {keputusan}
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-pasir">
            <motion.div
              className="h-full rounded-full bg-bata"
              initial={{ width: persen(demo.p_sebelum) }}
              animate={{ width: persen(demo.p_sesudah) }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              key={`${demo.tp_kode}-${jumlahSoal}`}
            />
          </div>
        </div>
      ) : (
        <p className="mb-3 text-sm text-teks-2">Menunggu jawaban pertama…</p>
      )}

      <BilahTp peta={peta} tpSekarang={tpSekarang} tampilkanKode />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <LegendaStatus />
        <span className="text-xs font-bold text-teks-2">{jumlahSoal} soal dijawab</span>
      </div>
    </section>
  );
}
