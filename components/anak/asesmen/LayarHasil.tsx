"use client";

// Hasil asesmen "Peta bekal belajar" (di dalam LayarFokus). Data dari GET /api/peta (status + deskripsi TP).
// Untuk anak: status dengan bingkai positif, TANPA angka peluang atau nilai (PANDUAN 7.2, 13).
// Satu bagian per mapel (Matematika, Bahasa Indonesia), lalu per kelas (kelas disimpan di data TP).

import { cn } from "cn";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { TautanAnak, TombolAnak } from "@/components/anak/fokus/TombolAnak";
import type { KotakPeta, ResponsPeta } from "@/lib/kontrak/peta";
import type { StatusTp } from "@/lib/kontrak/umum";
import { LABEL_STATUS_ANAK } from "./BilahTp";

const CHIP_STATUS: Record<StatusTp, string> = {
  tercapai: "bg-pasir text-teks",
  jembatan: "bg-jingga/30 text-teks",
  belum: "bg-merah-muda/60 text-teks",
  belum_diketahui: "border border-dashed border-jingga bg-white text-teks-2",
};

function BarisTp({ tp, titikMulai }: { tp: KotakPeta; titikMulai: boolean }) {
  return (
    <li className={cn("flex items-center gap-3 rounded-2xl px-2 py-2", titikMulai && "bg-emas/25 ring-2 ring-emas")}>
      <span className="w-8 shrink-0 font-heading text-sm font-extrabold text-bata">{tp.tp_kode}</span>
      <span className="line-clamp-2 flex-1 text-left text-sm" title={tp.deskripsi}>
        {tp.deskripsi}
      </span>
      <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold", titikMulai ? "bg-emas text-teks" : CHIP_STATUS[tp.status])}>
        {titikMulai ? "Mulai di sini" : LABEL_STATUS_ANAK[tp.status]}
      </span>
    </li>
  );
}

export type HasilMapel = { mapel_id: number; nama: string; peta: ResponsPeta; titik_mulai: string | null };

// Satu mapel: titik mulai + TP per kelas.
function HasilSatuMapel({ hasil }: { hasil: HasilMapel }) {
  const { peta } = hasil;
  const semua = [...peta.pos_dasar, ...peta.kelasku].sort((a, b) => a.urutan - b.urutan);
  const kelas = [...new Set(semua.map((t) => t.kelas))].sort((a, b) => a - b);
  const tpMulai = semua.find((t) => t.tp_kode === (hasil.titik_mulai ?? peta.rekomendasi_tp));
  const judul = tpMulai ? `Titik mulaimu: ${tpMulai.tp_kode}` : "Kamu siap menjelajah Kelasku!";
  const isi = tpMulai ? `${tpMulai.deskripsi}. Kita kuatkan bekal ini dulu, lalu lanjut ke Kelasku.` : "Semua bekal dasar sudah kamu kuasai.";

  return (
    <section className="w-full">
      <p className="mx-auto w-fit rounded-full bg-pasir px-4 py-1 text-sm font-extrabold text-bata">{hasil.nama}</p>
      <h2 className="mt-2 text-[24px] leading-tight font-extrabold">{judul}</h2>
      <p className="mx-auto mt-1 max-w-xl text-[16px] leading-relaxed text-teks-2">{isi}</p>

      <div className="mt-4 grid w-full gap-4 md:grid-cols-2">
        {kelas.map((k) => (
          <div key={k} className="rounded-[20px] border-2 border-jingga/35 bg-white/85 p-4 text-left">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-wider text-bata uppercase">
              <span className="flex size-6 items-center justify-center rounded-full bg-bata text-white">{k}</span>
              Kelas {k}
            </h3>
            <ul className="flex flex-col gap-1">
              {semua
                .filter((t) => t.kelas === k)
                .map((t) => (
                  <BarisTp key={t.tp_kode} tp={t} titikMulai={t.tp_kode === tpMulai?.tp_kode} />
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LayarHasil({
  hasil,
  mapelBelumSelesai,
  onLanjutMapel,
  onUlangi,
}: {
  hasil: HasilMapel[]; // mapel yang asesmennya sudah selesai
  mapelBelumSelesai: { mapel_id: number; nama: string }[];
  onLanjutMapel: () => void;
  onUlangi: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center py-6 text-center">
      <MascotPijar ekspresi="senang" gerak="senang" ukuran={130} />
      <p className="mt-3 rounded-full bg-emas px-4 py-1.5 text-sm font-extrabold">Peta bekal belajarmu</p>

      <div className="mt-5 flex w-full flex-col gap-10">
        {hasil.map((h) => (
          <HasilSatuMapel key={h.mapel_id} hasil={h} />
        ))}
      </div>

      <p className="mt-4 text-xs text-teks-2">
        Bukan nilai atau peringkat. Hasil ini ditinjau bersama guru atau pendampingmu.
      </p>

      {mapelBelumSelesai.length > 0 && (
        <TombolAnak onClick={onLanjutMapel} className="mt-6 sm:min-w-64">
          Lanjut petualangan {mapelBelumSelesai.map((m) => m.nama).join(" dan ")}
        </TombolAnak>
      )}

      {/* Peta penempatan (Pos Dasar -> Kelasku) ada di Beranda, disusun dari hasil ini. */}
      <div className="mt-7 flex w-full justify-center">
        <TautanAnak varian={mapelBelumSelesai.length > 0 ? "kedua" : "utama"} href="/anak" className="w-full sm:w-auto sm:min-w-60">
          Lihat petaku
        </TautanAnak>
      </div>
      <TombolAnak varian="lembut" onClick={onUlangi} className="mt-3 text-[15px]">
        Ulangi petualangan
      </TombolAnak>
    </div>
  );
}
