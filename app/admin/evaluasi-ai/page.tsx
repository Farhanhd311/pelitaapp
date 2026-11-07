"use client";

// Evaluasi AI (PANDUAN 5 B14, 8.6): dua hal saja.
//   1. Asesmen BKT: hasil uji siswa virtual (data/hasil_uji_asesmen.json), berlabel "hasil simulasi".
//   2. Keandalan teknis: hitungan NYATA dari LOG_AI (panggilan, waktu respons, gagal, pakai cadangan).
// Tidak menampilkan isi percakapan anak: hanya hitungan.

import { ChartColumn, Gauge } from "lucide-react";
import { JudulHalaman, Kosong, Kotak, KotakGalat, Memuat, formatPersen, useDataAdmin } from "@/components/admin/dasar";
import { GrafikEvaluasiBKT, type BarisSimulasi } from "@/components/admin/GrafikEvaluasiBKT";
import type { ResponsEvaluasi } from "@/lib/kontrak/admin";

const NAMA_FITUR: Record<string, string> = { tutor: "AI tutor", chatbot: "Teman Cerita", laporan: "Draf laporan", generator_soal: "Generator soal" };

export default function Halaman() {
  const { data, galat, memuat } = useDataAdmin<ResponsEvaluasi>("/api/admin/evaluasi");
  const simulasi = (data?.simulasi_asesmen.data as { hasil?: BarisSimulasi[] } | undefined)?.hasil ?? [];

  return (
    <>
      <JudulHalaman
        label="Kendali AI"
        judul="Evaluasi AI"
        keterangan="Seberapa tepat asesmen BKT (hasil simulasi siswa virtual) dan seberapa andal fitur LLM (data nyata dari LOG_AI)."
      />
      <KotakGalat pesan={galat} />
      {memuat && !data && <Memuat />}

      {data && (
        <div className="flex flex-col gap-6">
          <Kotak judul="Asesmen BKT" ikon={<ChartColumn aria-hidden />}>
            {simulasi.length > 0 ? <GrafikEvaluasiBKT label={data.simulasi_asesmen.label} hasil={simulasi} /> : <p className="text-sm">Data simulasi tidak tersedia.</p>}
          </Kotak>

          <Kotak judul="Keandalan fitur LLM" ikon={<Gauge aria-hidden />} keterangan="Data nyata dari LOG_AI: setiap panggilan LLM dicatat.">
            {data.keandalan.length === 0 ? (
              <Kosong teks="Belum ada panggilan LLM yang tercatat." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-lg text-left text-sm">
                  <thead className="text-xs text-teks-2">
                    <tr className="border-b border-garis">
                      <th className="py-2 pr-3">Fitur</th>
                      <th className="py-2 pr-3">Panggilan</th>
                      <th className="py-2 pr-3">Rata-rata waktu</th>
                      <th className="py-2 pr-3">Gagal/timeout</th>
                      <th className="py-2">Pakai cadangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.keandalan.map((k) => (
                      <tr key={k.fitur} className="border-b border-garis/60">
                        <td className="py-2 pr-3 font-semibold">{NAMA_FITUR[k.fitur] ?? k.fitur}</td>
                        <td className="py-2 pr-3">{k.jumlah_panggilan}</td>
                        <td className="py-2 pr-3">{k.rata_waktu_ms === null ? "-" : `${(k.rata_waktu_ms / 1000).toFixed(1)} detik`}</td>
                        <td className="py-2 pr-3">{formatPersen(k.persen_gagal)}</td>
                        <td className="py-2">{formatPersen(k.persen_cadangan)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Kotak>
        </div>
      )}
    </>
  );
}
