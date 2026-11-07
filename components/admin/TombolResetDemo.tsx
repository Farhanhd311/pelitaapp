"use client";

// Tombol Reset demo (memanggil POST /api/admin/reset-demo) sesuai PANDUAN 14 & ARSITEKTUR 8.
// Mengembalikan profil Raka ke kondisi awal: asesmen kosong (siap diuji ulang), check-in hari ini kosong.

import { useState } from "react";
import { RotateCcw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsResetDemo } from "@/lib/kontrak/admin";

export function TombolResetDemo({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function handleReset() {
    if (loading) return;
    const konfirmasi = window.confirm(
      "Apakah Anda yakin ingin mereset data demo Raka?\n\nSemua progres belajar dan sesi asesmen Raka akan dikosongkan agar siap asesmen ulang.",
    );
    if (!konfirmasi) return;

    setLoading(true);
    setPesan(null);
    setGalat(null);

    try {
      await panggilApi<ResponsResetDemo>("/api/admin/reset-demo", {});
      setPesan("Data demo Raka berhasil direset! Siap untuk asesmen ulang.");
      setTimeout(() => setPesan(null), 5000);
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className={`flex items-center gap-2 rounded-xl bg-bata px-4 py-2.5 font-heading text-sm font-extrabold text-white shadow-sm transition hover:bg-bata-tua disabled:opacity-50 cursor-pointer ${
          className ?? ""
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Mereset Data Demo…</span>
          </>
        ) : (
          <>
            <RotateCcw className="size-4" />
            <span>Reset Demo Raka</span>
          </>
        )}
      </button>

      {pesan && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{pesan}</span>
        </p>
      )}

      {galat && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
          <AlertCircle className="size-4 text-rose-600" />
          <span>{galat}</span>
        </p>
      )}
    </div>
  );
}
