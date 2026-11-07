"use client";

// Daftar soal terbit di bank soal (yang dipakai anak sesuai TP-nya). Admin boleh melihat kunci dan miskonsepsi.
// Satu-satunya aksi: HAPUS soal yang tidak relevan (dengan alasan). Soal yang dihapus tidak dipakai lagi untuk anak.
// Kartu ringkas bisa dibuka; daftar dimuat bertahap supaya tidak terlalu panjang.

import { useState } from "react";
import { Check, ChevronDown, Sparkles, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chip, KELAS_DIALOG, KELAS_INPUT, KELAS_KAKI_DIALOG, TombolAdmin, formatPersen } from "@/components/admin/dasar";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ItemSoalAdmin, ResponsSoal } from "@/lib/kontrak/admin";

const PER_HALAMAN = 20; // banyaknya kartu yang ditampilkan sekaligus (tampilan saja)
const NAMA_PENGGUNAAN: Record<string, string> = { diagnostik: "Asesmen", formatif: "Latihan", santai: "Santai" };

export function DaftarSoal({ soal, onDihapus }: { soal: ItemSoalAdmin[]; onDihapus: (data: ResponsSoal, pesan: string) => void }) {
  const [batas, setBatas] = useState(PER_HALAMAN);
  const [hapus, setHapus] = useState<ItemSoalAdmin | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {soal.slice(0, batas).map((s) => (
          <KartuSoal key={s.soal_id} soal={s} onHapus={() => setHapus(s)} />
        ))}
      </ul>
      {soal.length > batas && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <TombolAdmin varian="kedua" onClick={() => setBatas((b) => b + PER_HALAMAN)}>
            Tampilkan {Math.min(PER_HALAMAN, soal.length - batas)} soal lagi
          </TombolAdmin>
          <span className="text-xs text-teks-2">
            Menampilkan {batas} dari {soal.length}
          </span>
        </div>
      )}
      {hapus && (
        <DialogHapus
          soal={hapus}
          onTutup={() => setHapus(null)}
          onSelesai={(data) => {
            setHapus(null);
            onDihapus(data, `Soal ${hapus.soal_id} dihapus dan tidak dipakai lagi untuk anak.`);
          }}
        />
      )}
    </>
  );
}

function KartuSoal({ soal: s, onHapus }: { soal: ItemSoalAdmin; onHapus: () => void }) {
  const [terbuka, setTerbuka] = useState(false);
  const kunci = s.pilihan.find((p) => p.benar);
  return (
    <li className="rounded-2xl border border-garis bg-white">
      <button
        type="button"
        onClick={() => setTerbuka((t) => !t)}
        aria-expanded={terbuka}
        className="flex w-full cursor-pointer items-start gap-3 rounded-2xl p-4 text-left hover:bg-pasir-muda/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 font-mono font-bold text-bata">{s.tp_kode}</span>
            <Chip warna="abu">{NAMA_PENGGUNAAN[s.penggunaan] ?? s.penggunaan}</Chip>
            {s.sumber === "ai" && (
              <Chip warna="merah-muda">
                <Sparkles className="mr-1 size-3" aria-hidden /> Dibuat AI
              </Chip>
            )}
          </div>
          <p className={cn("mt-1.5 font-bold", !terbuka && "line-clamp-1")}>
            {s.pertanyaan} {s.visual && <span className="font-normal">{s.visual}</span>}
          </p>
          {!terbuka && kunci && <p className="mt-0.5 text-xs text-teks-2">Kunci: {kunci.teks}</p>}
        </div>
        <span className="hidden shrink-0 text-right text-xs text-teks-2 sm:block">
          Dijawab {s.statistik.kali_dijawab}×
          <br />
          benar {formatPersen(s.statistik.persen_benar)}
        </span>
        <ChevronDown className={cn("mt-1 size-5 shrink-0 text-teks-2 transition-transform", terbuka && "rotate-180")} aria-hidden />
      </button>

      {terbuka && (
        <div className="border-t border-garis px-4 pt-3 pb-4">
          {s.bacaan && <p className="mb-2 rounded-lg bg-pasir-muda px-3 py-2 text-sm">Bacaan: {s.bacaan}</p>}
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {s.pilihan.map((p) => (
              <li key={p.pilihan_id} className={cn("rounded-lg border px-3 py-1.5 text-sm", p.benar ? "border-[#8fc283] bg-[#eef7ea]" : "border-garis")}>
                <span className="flex items-center gap-1.5 font-bold">
                  {p.benar && <Check className="size-4 text-[#24502a]" aria-hidden />}
                  {p.teks}
                  {p.benar && <span className="text-xs font-semibold text-[#24502a]">(kunci)</span>}
                </span>
                {!p.benar && p.miskonsepsi && <span className="block text-xs text-teks-2">Miskonsepsi: {p.miskonsepsi}</span>}
              </li>
            ))}
          </ul>
          {s.pembahasan && <p className="mt-2 text-xs text-teks-2">Pembahasan: {s.pembahasan}</p>}
          <div className="mt-3 flex justify-end border-t border-garis pt-3">
            <TombolAdmin varian="lembut" ukuran="kecil" onClick={onHapus}>
              <Trash2 aria-hidden /> Hapus soal
            </TombolAdmin>
          </div>
        </div>
      )}
    </li>
  );
}

function DialogHapus({ soal, onTutup, onSelesai }: { soal: ItemSoalAdmin; onTutup: () => void; onSelesai: (data: ResponsSoal) => void }) {
  const [alasan, setAlasan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function hapus() {
    setSibuk(true);
    setGalat(null);
    try {
      onSelesai(await panggilApi<ResponsSoal>("/api/admin/soal", { aksi: "hapus", soal_id: soal.soal_id, alasan }));
    } catch (g) {
      setGalat(pesanGalat(g));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <Dialog open onOpenChange={(b) => !b && onTutup()}>
      <DialogContent className={`${KELAS_DIALOG} sm:max-w-md`}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-extrabold">Hapus soal ini?</DialogTitle>
          <DialogDescription className="text-teks-2">{soal.pertanyaan}</DialogDescription>
        </DialogHeader>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Alasan (tercatat di log)
          <input className={KELAS_INPUT} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Contoh: sudah tidak sesuai TP" />
        </label>
        {galat && <p className="rounded-lg bg-emas/20 px-3 py-2 text-sm font-semibold">{galat}</p>}
        <DialogFooter className={KELAS_KAKI_DIALOG}>
          <TombolAdmin varian="kedua" onClick={onTutup}>
            Batal
          </TombolAdmin>
          <TombolAdmin disabled={sibuk || alasan.trim().length < 3} onClick={hapus}>
            {sibuk ? "Menghapus…" : "Hapus soal"}
          </TombolAdmin>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
