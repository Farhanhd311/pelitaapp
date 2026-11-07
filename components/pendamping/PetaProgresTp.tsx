"use client";

// Peta Progres Capaian TP untuk Pendamping (PRD 9.8 F-DASH-3).
// Progres ditampilkan sebagai STATUS (belum / jembatan / tercapai), BUKAN persentase.
// Membantu orang tua dan guru melihat posisi belajar anak pada Kurikulum Merdeka.

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, FileText, Sparkles } from "lucide-react";
import type { StatusTp } from "@/lib/kontrak/umum";

type TpItem = {
  tp_kode: string;
  kelas: number;
  deskripsi: string;
  status: StatusTp;
  sumber_status: string | null;
};

type MapelProgres = {
  mapel_id: number;
  mapel: string;
  tp: TpItem[];
};

const CHIP_STATUS: Record<StatusTp, { label: string; badgeClass: string }> = {
  tercapai: {
    label: "Sudah bisa",
    badgeClass: "bg-emas text-teks font-black shadow-2xs",
  },
  jembatan: {
    label: "Sedang dikuatkan",
    badgeClass: "bg-jingga text-white font-extrabold",
  },
  belum: {
    label: "Akan dipelajari",
    badgeClass: "bg-merah-muda/70 text-teks font-bold",
  },
  belum_diketahui: {
    label: "Belum dicoba",
    badgeClass: "border border-dashed border-jingga bg-white text-teks-2 font-medium",
  },
};

export function PetaProgresTp({
  daftarMapel,
  anakId,
}: {
  daftarMapel: MapelProgres[];
  anakId: number;
}) {
  const [mapelAktifId, setMapelAktifId] = useState<number>(
    daftarMapel[0]?.mapel_id ?? 1,
  );
  const [filterKelas, setFilterKelas] = useState<number | null>(null);

  const mapelSekarang =
    daftarMapel.find((m) => m.mapel_id === mapelAktifId) ?? daftarMapel[0];

  if (!mapelSekarang) return null;

  const semuaTp = mapelSekarang.tp;
  const daftarKelas = [...new Set(semuaTp.map((t) => t.kelas))].sort((a, b) => a - b);

  const tpHasilFilter = filterKelas
    ? semuaTp.filter((t) => t.kelas === filterKelas)
    : semuaTp;

  // Hitung jumlah ketercapaian kualitatif
  const tercapaiCount = semuaTp.filter((t) => t.status === "tercapai").length;
  const jembatanCount = semuaTp.filter((t) => t.status === "jembatan").length;
  const belumCount = semuaTp.filter((t) => t.status === "belum").length;

  return (
    <section aria-labelledby="judul-progres-tp" className="space-y-4">
      {/* Header Bagian & Tombol Buat Laporan */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-bata" />
            <h2 id="judul-progres-tp" className="font-heading text-base font-black text-teks">
              Peta Capaian Kurikulum Merdeka
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-teks-2">
            Status perkembangan materi belajar yang dipetakan ke Capaian Pembelajaran resmi.
          </p>
        </div>

        {/* Link Cepat ke Halaman Laporan Sekolah */}
        <Link
          href={`/pendamping/laporan?anak_id=${anakId}&mapel_id=${mapelSekarang.mapel_id}`}
          className="flex items-center gap-2 rounded-xl bg-bata px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-bata-tua"
        >
          <FileText className="size-4" />
          <span>Buat Draf Laporan Sekolah</span>
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-4 sm:p-6 shadow-xs space-y-4">
        {/* Tab Pilihan Mata Pelajaran */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2D7B3]/80 pb-3.5">
          <div className="flex items-center gap-2">
            {daftarMapel.map((m) => (
              <button
                key={m.mapel_id}
                type="button"
                onClick={() => {
                  setMapelAktifId(m.mapel_id);
                  setFilterKelas(null);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-heading font-extrabold transition cursor-pointer ${
                  mapelAktifId === m.mapel_id
                    ? "bg-bata text-white shadow-xs"
                    : "bg-white border border-[#E5B97F] text-teks hover:bg-pasir"
                }`}
              >
                {m.mapel}
              </button>
            ))}
          </div>

          {/* Ringkasan Status Capaian */}
          <div className="flex items-center gap-2 text-xs font-bold text-teks-2">
            <span className="flex items-center gap-1 text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500" />
              {tercapaiCount} Sudah Bisa
            </span>
            {jembatanCount > 0 && (
              <span className="flex items-center gap-1 text-amber-800">
                <span className="size-2 rounded-full bg-amber-500" />
                {jembatanCount} Sedang Dikuatkan
              </span>
            )}
            <span className="flex items-center gap-1 text-rose-800">
              <span className="size-2 rounded-full bg-rose-400" />
              {belumCount} Akan Dipelajari
            </span>
          </div>
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-teks-2 font-bold shrink-0">Filter Kelas:</span>
          <button
            type="button"
            onClick={() => setFilterKelas(null)}
            className={`rounded-lg px-2.5 py-1 font-bold transition cursor-pointer ${
              filterKelas === null
                ? "bg-emas text-teks font-black"
                : "bg-white border border-[#E5B97F]/60 text-teks-2 hover:bg-[#FCEBD4]/40"
            }`}
          >
            Semua Kelas
          </button>
          {daftarKelas.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilterKelas(k)}
              className={`rounded-lg px-2.5 py-1 font-bold transition cursor-pointer ${
                filterKelas === k
                  ? "bg-emas text-teks font-black"
                  : "bg-white border border-[#E5B97F]/60 text-teks-2 hover:bg-[#FCEBD4]/40"
              }`}
            >
              Kelas {k}
            </button>
          ))}
        </div>

        {/* Daftar Materi TP */}
        <div className="divide-y divide-[#F2D7B3]/60 rounded-xl border border-[#E5B97F]/60 bg-white overflow-hidden">
          {tpHasilFilter.map((tp) => {
            const statusInfo = CHIP_STATUS[tp.status] ?? CHIP_STATUS.belum_diketahui;

            return (
              <div
                key={tp.tp_kode}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 hover:bg-[#FFFBF5] transition"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FCEBD4] font-heading text-xs font-black text-bata border border-[#E5B97F]/60">
                    {tp.tp_kode}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-teks-2">
                        Kelas {tp.kelas}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-teks leading-relaxed">
                      {tp.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs text-center min-w-[120px] ${statusInfo.badgeClass}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

