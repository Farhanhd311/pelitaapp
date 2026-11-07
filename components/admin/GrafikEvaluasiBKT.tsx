"use client";

// Hasil uji siswa virtual untuk asesmen BKT (PANDUAN 8.6), dari data/hasil_uji_asesmen.json.
// SELALU berlabel "hasil simulasi": ini bukan data anak sungguhan.
// Dua grafik kecil terpisah (persen dan jumlah soal punya skala berbeda, jadi tidak digabung dalam dua sumbu),
// ditambah tabel untuk semua skenario. Varian yang dipakai aplikasi (V3) disorot.

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPersen } from "@/components/admin/dasar";

export type BarisSimulasi = {
  nama: string; // skenario, misalnya "S1 Kondisi ideal"
  varian: string; // misalnya "V3 V1 + berhenti saat titik mulai pasti"
  akurasi_status_tp: number;
  titik_mulai_tepat_persis: number;
  meleset_lebih_tinggi: number;
  rata_soal: number;
  persentil_90_soal: number;
};

const kodeVarian = (v: string) => v.trim().split(/\s+/)[0]; // "V3", "B", ...
const VARIAN_DIPAKAI = "V3";

// Warna dari palet PELITA: bata untuk varian yang dipakai, pasir untuk pembanding.
const WARNA_DIPAKAI = "#bf4338";
const WARNA_LAIN = "#e8b98a";

function GrafikBatang({ judul, data, kunci, format }: { judul: string; data: BarisSimulasi[]; kunci: "titik_mulai_tepat_persis" | "rata_soal"; format: (n: number) => string }) {
  const titik = data.map((b) => ({ kode: kodeVarian(b.varian), varian: b.varian, nilai: b[kunci] }));
  return (
    <figure className="min-w-0 flex-1 rounded-xl border border-garis p-3">
      <figcaption className="mb-2 text-sm font-bold">{judul}</figcaption>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={titik} margin={{ top: 16, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="#f1dcc4" />
            <XAxis dataKey="kode" tickLine={false} axisLine={{ stroke: "#efc9a2" }} tick={{ fill: "#7a4335", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7a4335", fontSize: 11 }} tickFormatter={(n: number) => format(n)} width={48} />
            <Tooltip
              cursor={{ fill: "#fde9cc" }}
              formatter={(n) => [format(Number(n)), judul]}
              labelFormatter={(_, isi) => isi?.[0]?.payload?.varian ?? ""}
              contentStyle={{ borderRadius: 12, borderColor: "#efc9a2", fontSize: 12 }}
            />
            <Bar dataKey="nilai" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fill: "#2e0b07", formatter: (n: unknown) => format(Number(n)) }}>
              {titik.map((t) => (
                <Cell key={t.kode} fill={t.kode === VARIAN_DIPAKAI ? WARNA_DIPAKAI : WARNA_LAIN} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function GrafikEvaluasiBKT({ label, hasil }: { label: string; hasil: BarisSimulasi[] }) {
  const skenarioPertama = hasil[0]?.nama;
  const kondisiIdeal = hasil.filter((b) => b.nama === skenarioPertama);
  const varianDipakai = hasil.filter((b) => kodeVarian(b.varian) === VARIAN_DIPAKAI);

  return (
    <div className="flex flex-col gap-4">
      <p className="w-fit rounded-full bg-emas/30 px-3 py-1 text-xs font-extrabold">{label}</p>
      <p className="text-sm text-teks-2">
        Perbandingan varian aturan pada skenario <b>{skenarioPertama}</b>. Batang merah bata = varian yang dipakai aplikasi ({VARIAN_DIPAKAI}).
        B = pembanding yang menguji semua TP.
      </p>
      <div className="flex flex-col gap-3 md:flex-row">
        <GrafikBatang judul="Titik mulai tepat" data={kondisiIdeal} kunci="titik_mulai_tepat_persis" format={(n) => formatPersen(n)} />
        <GrafikBatang judul="Rata-rata soal per anak" data={kondisiIdeal} kunci="rata_soal" format={(n) => n.toFixed(1)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-xl text-left text-sm">
          <caption className="mb-2 text-left text-sm font-bold">Varian {VARIAN_DIPAKAI} di semua skenario</caption>
          <thead className="text-xs text-teks-2">
            <tr className="border-b border-garis">
              <th className="py-2 pr-3">Skenario</th>
              <th className="py-2 pr-3">Status TP benar</th>
              <th className="py-2 pr-3">Titik mulai tepat</th>
              <th className="py-2 pr-3">Terlalu tinggi</th>
              <th className="py-2 pr-3">Rata-rata soal</th>
              <th className="py-2">90% anak ≤</th>
            </tr>
          </thead>
          <tbody>
            {varianDipakai.map((b) => (
              <tr key={b.nama} className="border-b border-garis/60">
                <td className="py-2 pr-3 font-semibold">{b.nama}</td>
                <td className="py-2 pr-3">{formatPersen(b.akurasi_status_tp, 1)}</td>
                <td className="py-2 pr-3">{formatPersen(b.titik_mulai_tepat_persis, 1)}</td>
                <td className="py-2 pr-3">{formatPersen(b.meleset_lebih_tinggi, 1)}</td>
                <td className="py-2 pr-3">{b.rata_soal.toFixed(1)}</td>
                <td className="py-2">{b.persentil_90_soal} soal</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-teks-2">
        Catatan jujur: simulasi ini dijalankan sebelum revisi aturan kelas pilihan dan batas soal per mapel, jadi jumlah soal di
        aplikasi sekarang lebih sedikit dari angka di atas. Parameter BKT ditetapkan manual: model probabilistik, belum machine learning.
      </p>
    </div>
  );
}
