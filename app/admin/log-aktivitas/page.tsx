"use client";

// Log aktivitas akun (PANDUAN 8.7, PRD 9.14): hanya bisa DIBACA dan diekspor, tidak bisa diubah/dihapus.
// Filter pengguna, jenis tindakan, rentang tanggal; ekspor CSV memakai filter yang sama.

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { JudulHalaman, KELAS_INPUT, Kosong, KotakGalat, Memuat, formatWaktu, useDataAdmin } from "@/components/admin/dasar";
import { labelTindakan, uraiDetail } from "@/components/admin/label-log";
import type { ResponsLog } from "@/lib/kontrak/admin";

type Filter = { user_id: string; jenis: string; dari: string; sampai: string };

// Tanggal lokal hari ini - n hari, format YYYY-MM-DD untuk <input type="date">.
function tanggalLalu(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Tanggal lokal (YYYY-MM-DD) -> batas waktu ISO (UTC) untuk server. "sampai" mencakup seluruh hari itu.
function keKueri(f: Filter, format?: "csv"): string {
  const q = new URLSearchParams();
  if (f.user_id) q.set("user_id", f.user_id);
  if (f.jenis) q.set("jenis", f.jenis);
  if (f.dari) q.set("dari", new Date(`${f.dari}T00:00:00`).toISOString());
  if (f.sampai) q.set("sampai", new Date(`${f.sampai}T23:59:59.999`).toISOString());
  if (format) q.set("format", format);
  return `/api/admin/log-aktivitas?${q}`;
}

export default function Halaman() {
  const [filter, setFilter] = useState<Filter>({ user_id: "", jenis: "", dari: "", sampai: "" });
  const { data, galat, memuat } = useDataAdmin<ResponsLog>(keKueri(filter));
  // Pilihan filter dari isi log tanpa filter (jenis tindakan dan pengguna tidak ditulis di kode).
  const { data: semua } = useDataAdmin<ResponsLog>("/api/admin/log-aktivitas");
  const daftarJenis = useMemo(() => [...new Set(semua?.log.map((l) => l.jenis_tindakan))].sort(), [semua]);
  const daftarPengguna = useMemo(
    () => [...new Map(semua?.log.filter((l) => l.user_id !== null).map((l) => [l.user_id!, l.nama ?? `#${l.user_id}`])).entries()],
    [semua],
  );

  const ubah = (k: keyof Filter) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilter({ ...filter, [k]: e.target.value });

  return (
    <>
      <JudulHalaman
        label="Keamanan"
        judul="Log Aktivitas"
        keterangan="Catatan login, akses data anak, perubahan aturan AI, tindakan bank soal, dan lainnya. Log hanya bisa ditambah, tidak bisa diubah atau dihapus. Tidak menyimpan password, PIN, atau isi cerita anak."
        aksi={
          <a
            href={keKueri(filter, "csv")}
            className="inline-flex items-center gap-2 rounded-xl border border-garis bg-white px-4 py-2 text-sm font-bold hover:bg-pasir-muda"
          >
            <Download className="size-4" aria-hidden /> Ekspor CSV
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold">
          Pengguna
          <select className={KELAS_INPUT} value={filter.user_id} onChange={ubah("user_id")}>
            <option value="">Semua</option>
            {daftarPengguna.map(([id, nama]) => (
              <option key={id} value={id}>
                {nama}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Jenis tindakan
          <select className={KELAS_INPUT} value={filter.jenis} onChange={ubah("jenis")}>
            <option value="">Semua</option>
            {daftarJenis.map((j) => (
              <option key={j} value={j}>
                {labelTindakan(j)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Dari
          <input type="date" className={KELAS_INPUT} value={filter.dari} onChange={ubah("dari")} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Sampai
          <input type="date" className={KELAS_INPUT} value={filter.sampai} onChange={ubah("sampai")} />
        </label>
        <div className="flex gap-1 pb-0.5">
          {[
            { label: "Hari ini", hariLalu: 0 },
            { label: "7 hari", hariLalu: 6 },
            { label: "Semua", hariLalu: null },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              // Tanggal dihitung saat diklik (bukan saat render).
              onClick={() => setFilter({ ...filter, dari: p.hariLalu === null ? "" : tanggalLalu(p.hariLalu), sampai: "" })}
              className="cursor-pointer rounded-lg border border-garis bg-white px-3 py-2 text-xs font-bold hover:border-jingga"
            >
              {p.label}
            </button>
          ))}
        </div>
        {data && <p className="pb-2 text-sm text-teks-2">{data.log.length} catatan</p>}
      </div>

      <KotakGalat pesan={galat} />
      {memuat && !data && <Memuat />}
      {data && data.log.length === 0 && <Kosong teks="Tidak ada catatan untuk saringan ini. Coba pilih Semua atau ubah rentang tanggal." />}
      {data && data.log.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-garis bg-white">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead className="bg-pasir-muda text-xs text-teks-2">
              <tr>
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Pengguna</th>
                <th className="px-3 py-2">Tindakan</th>
                <th className="px-3 py-2">Entitas</th>
                <th className="px-3 py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.log.map((l) => (
                <tr key={l.id} className="border-t border-garis/70 align-top">
                  <td className="px-3 py-2 whitespace-nowrap">{formatWaktu(l.waktu)}</td>
                  <td className="px-3 py-2">{l.nama ?? "-"}</td>
                  <td className="px-3 py-2 font-semibold">{labelTindakan(l.jenis_tindakan)}</td>
                  <td className="px-3 py-2 text-xs">{l.entitas ? `${l.entitas} ${l.entitas_id ?? ""}` : "-"}</td>
                  <td className="max-w-md px-3 py-2 text-xs break-words text-teks-2">
                    {uraiDetail(l.detail).length === 0 ? "-" : uraiDetail(l.detail).map((d) => <span key={d} className="block">{d}</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
