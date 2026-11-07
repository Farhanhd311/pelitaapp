// Bilah 16 segmen di atas soal = PETA MINI asesmen (PANDUAN 5 A3: "peta TP berubah warna").
// Satu segmen = satu TP (urut menurut `urutan`). Segmen TP yang sedang diuji menyala bata.
// Bukan "soal ke-N dari 16": jumlah soal asesmen adaptif tidak tetap.

import { cn } from "cn";
import type { KotakPetaTp, StatusTp } from "@/lib/kontrak/umum";

// Warna status (bukan merah untuk "belum": PANDUAN 13 melarang warna kesalahan).
export const WARNA_STATUS: Record<StatusTp, string> = {
  belum_diketahui: "bg-merah-muda/35",
  belum: "bg-merah-muda",
  jembatan: "bg-jingga",
  tercapai: "bg-emas",
};

export const LABEL_STATUS_ANAK: Record<StatusTp, string> = {
  belum_diketahui: "Belum dicoba",
  belum: "Akan dipelajari",
  jembatan: "Sedang dikuatkan",
  tercapai: "Sudah bisa",
};

export function BilahTp({ peta, tpSekarang, tampilkanKode = false }: { peta: KotakPetaTp[]; tpSekarang: string | null; tampilkanKode?: boolean }) {
  const urut = [...peta].sort((a, b) => a.urutan - b.urutan);
  return (
    <ol className="flex w-full gap-1.5" aria-label="Peta tujuan pembelajaran">
      {urut.map((k) => {
        const sekarang = k.tp_kode === tpSekarang;
        return (
          <li key={k.tp_kode} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                "h-3 w-full rounded-full transition-colors duration-500",
                sekarang ? "bg-bata" : WARNA_STATUS[k.status],
              )}
              title={`${k.tp_kode}: ${LABEL_STATUS_ANAK[k.status]}`}
            />
            {tampilkanKode && (
              <span className={cn("text-[10px] font-bold", sekarang ? "text-bata" : "text-teks-2")}>{k.tp_kode}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function LegendaStatus() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-teks-2">
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-bata" /> Sedang dicoba
      </li>
      {(["tercapai", "belum", "belum_diketahui"] as const).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded-full", WARNA_STATUS[s])} /> {LABEL_STATUS_ANAK[s]}
        </li>
      ))}
    </ul>
  );
}
