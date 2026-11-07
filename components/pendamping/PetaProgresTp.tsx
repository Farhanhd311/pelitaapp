"use client";

// Peta Progres Capaian TP untuk Pendamping (PRD 9.8 F-DASH-3).
// Desain tabular profesional Kurikulum Merdeka: keterbacaan tinggi, kolom terstruktur,
// verifikasi berbasis bukti asesmen/sesi, tanpa elemen counter berlebih.

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, FileText, Search, ShieldCheck } from "lucide-react";
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

const STATUS_CONFIG: Record<
  StatusTp,
  { label: string; badge: string; dot: string; keterangan: string }
> = {
  tercapai: {
    label: "Sudah Kuasai",
    badge: "bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold",
    dot: "bg-emerald-500",
    keterangan: "Tuntas Terverifikasi",
  },
  jembatan: {
    label: "Sedang Dikuatkan",
    badge: "bg-amber-50 text-amber-900 border-amber-300 font-extrabold",
    dot: "bg-amber-500",
    keterangan: "Latihan Bertahap",
  },
  belum: {
    label: "Rencana Belajar",
    badge: "bg-stone-50 text-stone-700 border-stone-200 font-bold",
    dot: "bg-stone-400",
    keterangan: "Akan Dipelajari",
  },
  belum_diketahui: {
    label: "Belum Diuji",
    badge: "bg-white text-teks-2 border border-dashed border-[#E5B97F] font-medium",
    dot: "bg-stone-300",
    keterangan: "Prasyarat Belum Dicoba",
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
  const [kataKunci, setKataKunci] = useState("");

  const mapelSekarang =
    daftarMapel.find((m) => m.mapel_id === mapelAktifId) ?? daftarMapel[0];

  if (!mapelSekarang) return null;

  const semuaTp = mapelSekarang.tp;

  // Filter berdasarkan kata kunci pencarian jika ada
  const tpHasilFilter = semuaTp.filter((t) => {
    return (
      !kataKunci.trim() ||
      t.tp_kode.toLowerCase().includes(kataKunci.toLowerCase()) ||
      t.deskripsi.toLowerCase().includes(kataKunci.toLowerCase())
    );
  });

  return (
    <section aria-labelledby="judul-progres-tp" className="space-y-4">
      {/* Header Bagian & Tombol Buat Laporan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-bata/15 text-bata">
              <BookOpen className="size-4.5" />
            </div>
            <h2 id="judul-progres-tp" className="font-heading text-base font-black text-teks tracking-wide">
              Peta Capaian Kurikulum Merdeka
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-teks-2">
            Pemetaan progres capaian kompetensi dasar sesuai Keputusan Kepala BSKAP No. 046/H/KR/2025.
          </p>
        </div>

        {/* Link Cepat ke Cetak Laporan Sekolah */}
        <Link
          href={`/pendamping/laporan?anak_id=${anakId}&mapel_id=${mapelSekarang.mapel_id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-bata px-4 py-2.5 text-xs font-heading font-black text-white shadow-xs transition hover:bg-bata-tua cursor-pointer"
        >
          <FileText className="size-4" />
          <span>Buka Format Laporan Sekolah (PDF)</span>
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-[#E5B97F]/75 bg-[#FFFDF9] p-4 sm:p-6 shadow-xs space-y-4">
        {/* Tab Pemilih Mata Pelajaran */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2D7B3]/80 pb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {daftarMapel.map((m) => (
              <button
                key={m.mapel_id}
                type="button"
                onClick={() => {
                  setMapelAktifId(m.mapel_id);
                  setKataKunci("");
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-heading font-extrabold transition cursor-pointer ${
                  mapelAktifId === m.mapel_id
                    ? "bg-bata text-white shadow-xs"
                    : "bg-white border border-[#E5B97F] text-teks hover:bg-[#FFF4E4]"
                }`}
              >
                {m.mapel}
              </button>
            ))}
          </div>

          {/* Kotak Pencarian TP Cepat */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-teks-2/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode / kata materi..."
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              className="w-full rounded-xl border border-[#E5B97F]/80 bg-white py-1.5 pl-8 pr-3 text-xs text-teks placeholder:text-teks-2/60 focus:border-bata focus:outline-none"
            />
          </div>
        </div>

        {/* Tabel Data Kurikulum Merdeka (Bersih, Tabular, Non-AI Slop) */}
        <div className="rounded-xl border-2 border-[#E5B97F]/75 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#FFF4E4] border-b-2 border-[#E5B97F]/80 text-teks font-heading font-black">
                  <th className="py-3 px-3.5 w-20 text-center uppercase tracking-wider">Kode</th>
                  <th className="py-3 px-4 min-w-[340px]">Tujuan Pembelajaran (Kurikulum Merdeka)</th>
                  <th className="py-3 px-4 w-40 text-center uppercase tracking-wider">Status Capaian</th>
                  <th className="py-3 px-4 w-44 text-center uppercase tracking-wider">Metode Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2D7B3]/60">
                {tpHasilFilter.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-teks-2 font-bold">
                      Tidak ada Tujuan Pembelajaran yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  tpHasilFilter.map((tp) => {
                    const cfg = STATUS_CONFIG[tp.status] ?? STATUS_CONFIG.belum_diketahui;
                    const verifikasiLabel =
                      tp.sumber_status === "asesmen"
                        ? "Asesmen Awal"
                        : tp.sumber_status === "sesi"
                          ? "Sesi Belajar"
                          : tp.status === "tercapai"
                            ? "Penguasaan Terkonfirmasi"
                            : tp.status === "jembatan"
                              ? "Latihan Adaptif"
                              : "Kurikulum Standar";

                    return (
                      <tr key={tp.tp_kode} className="transition hover:bg-[#FFFBF5]">
                        {/* Kode TP */}
                        <td className="py-3 px-3.5 text-center font-heading font-black text-bata">
                          <span className="inline-block rounded-md bg-[#FFF4E4] border border-[#E5B97F]/60 px-2 py-0.5">
                            {tp.tp_kode}
                          </span>
                        </td>

                        {/* Deskripsi TP Resmi */}
                        <td className="py-3 px-4 font-medium text-teks leading-relaxed">
                          {tp.deskripsi}
                        </td>

                        {/* Status Capaian Formal */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] ${cfg.badge}`}
                          >
                            <span className={`size-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Verifikasi / Sumber Status */}
                        <td className="py-3 px-4 text-center text-[11px] font-semibold text-teks-2">
                          <span className="inline-block rounded-lg bg-pasir/40 border border-[#E5B97F]/40 px-2.5 py-1">
                            {verifikasiLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
