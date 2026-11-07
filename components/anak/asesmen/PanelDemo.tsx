"use client";

// Panel mode demo "putar otomatis" (PANDUAN 5 A3): batang peluang BKT bergerak setiap jawaban dan peta TP
// berubah warna. Angka peluang HANYA tampil di mode demo (PANDUAN 7.2), tidak di asesmen biasa.
// Dibuat ringkas untuk panggung: satu baris kepala, TP yang baru dijawab + peluangnya, lalu peta mini per kelas.

import { motion } from "motion/react";
import { Flag, Pause, Play } from "lucide-react";
import { cn } from "cn";
import type { InfoDemo } from "@/lib/kontrak/asesmen";
import type { KotakPetaTp } from "@/lib/kontrak/umum";
import { LABEL_STATUS_ANAK, LegendaStatus, WARNA_STATUS } from "./BilahTp";

const persen = (p: number) => `${Math.round(p * 100)}%`;

// Keputusan mesin untuk TP yang baru dijawab, dengan warna yang sama dengan peta mini.
function ChipKeputusan({ keputusan }: { keputusan: InfoDemo["keputusan"] }) {
  const [teks, warna] =
    keputusan === "tercapai"
      ? [LABEL_STATUS_ANAK.tercapai, WARNA_STATUS.tercapai]
      : keputusan === "belum"
        ? [LABEL_STATUS_ANAK.belum, WARNA_STATUS.belum]
        : ["Mengumpulkan bukti…", "bg-pasir-muda"];
  return <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-extrabold text-teks", warna)}>{teks}</span>;
}

// Peta mini: satu segmen = satu TP (urut `urutan`), dikelompokkan per kelas dengan label "Kelas N".
function PetaMini({ peta, tpSekarang, titikMulai }: { peta: KotakPetaTp[]; tpSekarang: string | null; titikMulai: string | null }) {
  const urut = [...peta].sort((a, b) => a.urutan - b.urutan);
  const kelas = [...new Set(urut.map((t) => t.kelas))];
  return (
    <div className="flex w-full gap-3" aria-label="Peta tujuan pembelajaran">
      {kelas.map((k) => {
        const tp = urut.filter((t) => t.kelas === k);
        return (
          // Lebar kelompok sebanding banyak TP-nya, jadi semua segmen sama lebar.
          <div key={k} className="flex min-w-0 flex-col gap-1.5" style={{ flex: `${tp.length} 1 0` }}>
            <ol className="flex gap-1">
              {tp.map((t) => (
                <li
                  key={t.tp_kode}
                  title={`${t.tp_kode}: ${LABEL_STATUS_ANAK[t.status]}`}
                  className={cn(
                    "h-3.5 flex-1 rounded-full transition-colors duration-500",
                    t.tp_kode === titikMulai ? "bg-bata ring-2 ring-emas ring-offset-1" : t.tp_kode === tpSekarang ? "bg-bata" : WARNA_STATUS[t.status],
                  )}
                />
              ))}
            </ol>
            <span className="text-[11px] font-bold text-teks-2">Kelas {k}</span>
          </div>
        );
      })}
    </div>
  );
}

export function PanelDemo({
  demo,
  peta,
  tpSekarang,
  titikMulai,
  deskripsiTp,
  jumlahSoal,
  berjalan,
  onJedaLanjut,
}: {
  demo: InfoDemo | null; // jawaban terakhir (null sebelum jawaban pertama mapel ini)
  peta: KotakPetaTp[];
  tpSekarang: string | null; // TP soal yang sedang tampil
  titikMulai: string | null; // terisi saat mapel ini selesai
  deskripsiTp: Record<string, string>;
  jumlahSoal: number;
  berjalan: boolean;
  onJedaLanjut: () => void;
}) {
  const tp = titikMulai ?? demo?.tp_kode ?? tpSekarang;
  const deskripsi = tp ? deskripsiTp[tp] : undefined;

  return (
    <section className="w-full rounded-[24px] border-2 border-jingga/35 bg-white/90 p-4 sm:px-5" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emas px-3 py-1 text-xs font-extrabold text-teks">Demo</span>
        <span className="min-w-0 flex-1 truncate text-sm text-teks-2">Jawaban Raka diputar otomatis · mesin BKT sungguhan</span>
        <span className="shrink-0 text-sm font-bold text-teks-2 tabular-nums">{jumlahSoal} soal</span>
        <button
          type="button"
          onClick={onJedaLanjut}
          aria-label={berjalan ? "Jeda demo" : "Lanjutkan demo"}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-garis bg-pasir-muda text-bata transition hover:bg-pasir focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none"
        >
          {berjalan ? <Pause className="size-4" fill="currentColor" aria-hidden /> : <Play className="size-4" fill="currentColor" aria-hidden />}
        </button>
      </div>

      {/* TP yang baru dijawab: peluang menguasainya dan keputusan mesin. Saat mapel selesai: titik mulainya. */}
      <div className="mt-4 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-teks-2">{titikMulai ? "Titik mulai ditemukan" : demo ? "Peluang menguasai" : "Menunggu jawaban pertama…"}</p>
          <p className="mt-0.5 truncate font-heading text-[17px] font-extrabold" title={deskripsi}>
            {tp && <span className="text-bata">{tp}</span>}
            {deskripsi && <span className="text-teks"> · {deskripsi}</span>}
          </p>
        </div>
        {titikMulai ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-bata px-3 py-1 text-xs font-extrabold text-white">
            <Flag className="size-3.5" aria-hidden /> Mulai di sini
          </span>
        ) : (
          demo && (
            <>
              <ChipKeputusan keputusan={demo.keputusan} />
              <span className="w-16 shrink-0 text-right font-heading text-[28px] leading-none font-extrabold tabular-nums">{persen(demo.p_sesudah)}</span>
            </>
          )
        )}
      </div>
      {!titikMulai && (
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-pasir">
          {demo && (
            <motion.div
              key={`${demo.tp_kode}-${jumlahSoal}`}
              className="h-full rounded-full bg-bata"
              initial={{ width: persen(demo.p_sebelum) }}
              animate={{ width: persen(demo.p_sesudah) }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </div>
      )}

      <div className="mt-4">
        <PetaMini peta={peta} tpSekarang={titikMulai ? null : tpSekarang} titikMulai={titikMulai} />
      </div>
      <div className="mt-2">
        <LegendaStatus />
      </div>
    </section>
  );
}
