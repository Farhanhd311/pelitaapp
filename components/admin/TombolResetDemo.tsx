"use client";

// Tombol Reset demo (PANDUAN 5 A9): kembalikan data Raka sebelum naik panggung.
// Juga melengkapi data awal yang belum ada di database (kurikulum Bahasa Indonesia, kunci pengaturan baru).
// Selalu minta konfirmasi, karena progres, sesi, dan jawaban Raka dihapus.
// Ditaruh di Beranda admin (kartu Persiapan demo), bukan di menu samping, supaya tidak tertekan tanpa sengaja.

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KELAS_DIALOG, KELAS_KAKI_DIALOG, TombolAdmin } from "@/components/admin/dasar";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsResetDemo } from "@/lib/kontrak/admin";

export function TombolResetDemo() {
  const [buka, setBuka] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function reset() {
    setSibuk(true);
    setGalat(null);
    try {
      const r = await panggilApi<ResponsResetDemo>("/api/admin/reset-demo", {});
      const tambahan = [
        r.ringkasan.tp_ditambah ? `${r.ringkasan.tp_ditambah} TP & ${r.ringkasan.soal_ditambah} soal baru` : null,
        r.pengaturan_ditambah.length ? `${r.pengaturan_ditambah.length} pengaturan baru` : null,
      ].filter(Boolean);
      setHasil(`Data demo Raka sudah kembali seperti awal.${tambahan.length ? ` Ditambahkan: ${tambahan.join(", ")}.` : ""}`);
    } catch (g) {
      setGalat(pesanGalat(g));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <>
      <TombolAdmin
        varian="kedua"
        onClick={() => {
          setHasil(null);
          setGalat(null);
          setBuka(true);
        }}
      >
        <RotateCcw aria-hidden /> Reset data demo
      </TombolAdmin>

      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogContent className={`${KELAS_DIALOG} sm:max-w-md`}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-extrabold">Reset data demo?</DialogTitle>
            <DialogDescription className="text-teks-2">
              Progres TP, sesi, jawaban, check-in, skrining, dan log AI milik Raka dikembalikan ke data awal demo. Log aktivitas
              tidak dihapus. Data awal yang belum ada (misalnya kurikulum mapel baru) ikut ditambahkan.
            </DialogDescription>
          </DialogHeader>
          {hasil && <p className="rounded-lg bg-[#dcefd4] px-3 py-2 text-sm font-semibold text-[#24502a]">{hasil}</p>}
          {galat && <p className="rounded-lg bg-emas/20 px-3 py-2 text-sm font-semibold">{galat}</p>}
          <DialogFooter className={KELAS_KAKI_DIALOG}>
            <TombolAdmin varian="kedua" onClick={() => setBuka(false)}>
              {hasil ? "Tutup" : "Batal"}
            </TombolAdmin>
            {!hasil && (
              <TombolAdmin disabled={sibuk} onClick={reset}>
                {sibuk ? "Mereset…" : "Ya, reset sekarang"}
              </TombolAdmin>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
