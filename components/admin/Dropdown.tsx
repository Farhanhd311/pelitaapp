"use client";

// Dropdown admin bergaya PELITA, dibangun di atas Popover base-ui (posisi, fokus, dan tombol Escape sudah ditangani).
// Pilihan bisa punya keterangan dan kelompok (misalnya TP per kelas). `bisaDicari` menambah kotak pencarian di atas
// daftar: cocok untuk daftar panjang seperti tujuan pembelajaran. Enter di kotak pencarian memilih hasil pertama.

import { useId, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "cn";

export type PilihanDropdown = { nilai: string; label: string; keterangan?: string; grup?: string };

export function Dropdown({
  label,
  nilai,
  pilihan,
  onPilih,
  bisaDicari = false,
  placeholderCari = "Cari…",
  className,
}: {
  label: string;
  nilai: string;
  pilihan: PilihanDropdown[];
  onPilih: (nilai: string) => void;
  bisaDicari?: boolean;
  placeholderCari?: string;
  className?: string;
}) {
  const [buka, setBuka] = useState(false);
  const [cari, setCari] = useState("");
  const inputCari = useRef<HTMLInputElement>(null);
  const idLabel = useId();
  const terpilih = pilihan.find((p) => p.nilai === nilai);

  const kata = cari.trim().toLowerCase();
  const tersaring = kata ? pilihan.filter((p) => `${p.label} ${p.keterangan ?? ""} ${p.grup ?? ""}`.toLowerCase().includes(kata)) : pilihan;
  const grup = [...new Set(tersaring.map((p) => p.grup ?? ""))];

  function pilih(v: string) {
    onPilih(v);
    setBuka(false);
    setCari("");
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span id={idLabel} className="text-xs font-bold">
        {label}
      </span>
      <Popover.Root
        open={buka}
        onOpenChange={(b) => {
          setBuka(b);
          if (!b) setCari("");
        }}
      >
        <Popover.Trigger
          aria-labelledby={idLabel}
          className={cn(
            "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 text-left text-sm font-semibold text-teks transition-colors outline-none hover:border-jingga/60 focus-visible:border-jingga focus-visible:ring-3 focus-visible:ring-emas/40",
            buka ? "border-jingga" : "border-garis",
          )}
        >
          <span className="min-w-0 flex-1 truncate">{terpilih?.label ?? "Pilih"}</span>
          <ChevronDown className={cn("size-4 shrink-0 text-teks-2 transition-transform", buka && "rotate-180")} aria-hidden />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={6} align="start" className="z-[80]">
            <Popover.Popup
              initialFocus={bisaDicari ? inputCari : undefined}
              className="w-[max(var(--anchor-width),18rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-garis bg-white shadow-[0_12px_32px_rgba(46,11,7,0.14)] outline-none"
            >
              {bisaDicari && (
                <div className="relative border-b border-garis p-2">
                  <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-teks-2" aria-hidden />
                  <input
                    ref={inputCari}
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tersaring[0]) {
                        e.preventDefault();
                        pilih(tersaring[0].nilai);
                      }
                    }}
                    placeholder={placeholderCari}
                    aria-label={`Cari ${label.toLowerCase()}`}
                    className="min-h-10 w-full rounded-xl bg-pasir-muda/60 py-2 pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-emas/40"
                  />
                </div>
              )}
              <div role="listbox" aria-labelledby={idLabel} className="max-h-80 overflow-y-auto p-1.5">
                {tersaring.length === 0 && <p className="px-3 py-4 text-center text-sm text-teks-2">Tidak ada yang cocok dengan &quot;{cari}&quot;.</p>}
                {grup.map((g) => (
                  <div key={g || "-"}>
                    {g && <p className="px-3 pt-2 pb-1 text-[11px] font-extrabold tracking-wider text-bata uppercase">{g}</p>}
                    {tersaring
                      .filter((p) => (p.grup ?? "") === g)
                      .map((p) => {
                        const aktif = p.nilai === nilai;
                        return (
                          <button
                            key={p.nilai}
                            type="button"
                            role="option"
                            aria-selected={aktif}
                            onClick={() => pilih(p.nilai)}
                            className={cn(
                              "flex w-full cursor-pointer items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:bg-pasir-muda",
                              aktif ? "bg-pasir font-bold text-teks" : "text-teks hover:bg-pasir-muda",
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block">{p.label}</span>
                              {p.keterangan && <span className="mt-0.5 block text-xs font-normal text-teks-2">{p.keterangan}</span>}
                            </span>
                            {aktif && <Check className="mt-0.5 size-4 shrink-0 text-bata" aria-hidden />}
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
