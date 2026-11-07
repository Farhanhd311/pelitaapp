"use client";

// Umpan balik setelah anak menjawab soal kuis (PANDUAN 13): tanpa kata "Salah", tanpa tanda X merah.
// Jawaban tepat -> Pijar senang. Belum tepat -> "Yuk, coba lihat lagi" + tombol "Tanya Pijar" (AI tutor).
// Penjelasan AI tutor dari POST /api/ai/tutor; kalau AI lambat/gagal, server sudah memberi jawaban cadangan.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsTutor } from "@/lib/kontrak/ai";
import type { UmpanBalikJawaban } from "@/lib/kontrak/sesi";

type KeadaanTutor = { jenis: "tutup" } | { jenis: "memuat" } | { jenis: "ada"; tutor: ResponsTutor } | { jenis: "galat"; pesan: string };

export function PanelUmpanBalik({
  umpan,
  sesiId,
  soalId,
  pilihanId,
  onLanjut,
}: {
  umpan: UmpanBalikJawaban;
  sesiId: number;
  soalId: string;
  pilihanId: number;
  onLanjut: () => void;
}) {
  const [tutor, setTutor] = useState<KeadaanTutor>({ jenis: "tutup" });
  const panel = useRef<HTMLElement>(null);

  // Di layar sempit panel ini muncul di bawah pilihan jawaban: gulir supaya langsung terlihat.
  useEffect(() => {
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.current?.scrollIntoView({ behavior: kurangiGerak ? "auto" : "smooth", block: "nearest" });
  }, [tutor.jenis]);

  async function tanyaPijar() {
    setTutor({ jenis: "memuat" });
    try {
      const hasil = await panggilApi<ResponsTutor>("/api/ai/tutor", { sesi_id: sesiId, soal_id: soalId, pilihan_id: pilihanId });
      setTutor({ jenis: "ada", tutor: hasil });
    } catch (e) {
      setTutor({ jenis: "galat", pesan: pesanGalat(e) });
    }
  }

  return (
    <motion.section
      ref={panel}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      aria-live="polite"
      className={`mt-8 w-full max-w-3xl rounded-[24px] border-2 p-5 sm:p-6 ${umpan.benar ? "border-emas bg-white" : "border-jingga/50 bg-pasir-muda"}`}
    >
      <div className="flex items-start gap-4">
        <MascotPijar ekspresi={umpan.benar ? "senang" : "penasaran"} gerak={umpan.benar ? "senang" : "coba_lagi"} ukuran={92} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[22px] leading-tight font-extrabold">{umpan.pesan}</p>
          {umpan.pembahasan && <p className="mt-2 text-[16px] leading-relaxed text-teks-2">{umpan.pembahasan}</p>}
        </div>
      </div>

      <AnimatePresence>
        {tutor.jenis !== "tutup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-[20px] bg-merah-muda/25 p-4">
              {/* Label "dibantu AI" hanya jika teksnya memang dari LLM; jawaban cadangan ditulis manusia. */}
              <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-bata uppercase">
                <Sparkles className="size-4" aria-hidden /> Penjelasan Pijar
                {(tutor.jenis !== "ada" || !tutor.tutor.pakai_cadangan) && " · dibantu AI"}
              </p>
              {tutor.jenis === "memuat" && (
                <p className="mt-2 flex items-center gap-2 font-semibold text-teks-2">
                  Pijar sedang memikirkan penjelasannya
                  <TitikMenunggu />
                </p>
              )}
              {tutor.jenis === "ada" && (
                <>
                  <p className="mt-2 text-[17px] leading-relaxed font-semibold text-teks">{tutor.tutor.penjelasan}</p>
                  <p className="mt-3 flex items-start gap-2 rounded-2xl bg-white/80 p-3 text-[16px] leading-relaxed">
                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-emas" aria-hidden />
                    {tutor.tutor.petunjuk}
                  </p>
                </>
              )}
              {tutor.jenis === "galat" && <p className="mt-2 font-semibold text-teks-2">{tutor.pesan} Baca penjelasan di atas dulu, ya.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {umpan.bisa_tanya_tutor && tutor.jenis === "tutup" && (
          <TombolAnak varian="kedua" onClick={tanyaPijar}>
            <Sparkles className="size-5 text-bata" aria-hidden /> Tanya Pijar
          </TombolAnak>
        )}
        <TombolAnak onClick={onLanjut} disabled={tutor.jenis === "memuat"} className="sm:min-w-48">
          Lanjut <ArrowRight className="size-5" aria-hidden />
        </TombolAnak>
      </div>
    </motion.section>
  );
}

function TitikMenunggu() {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-bata"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
