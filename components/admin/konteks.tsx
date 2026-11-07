"use client";

// Konteks bersama halaman admin: beriTahu(teks) menampilkan notifikasi singkat setelah aksi berhasil
// (hilang sendiri), supaya admin tahu aksinya tersimpan.

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";

type KonteksAdmin = { beriTahu: (teks: string) => void };

const Konteks = createContext<KonteksAdmin | null>(null);

// Lama notifikasi tampil (tampilan saja).
const LAMA_NOTIFIKASI_MS = 4000;

export function useAdmin(): KonteksAdmin {
  const k = useContext(Konteks);
  if (!k) throw new Error("useAdmin hanya bisa dipakai di dalam KerangkaAdmin");
  return k;
}

export function PenyediaAdmin({ children }: { children: ReactNode }) {
  const [notifikasi, setNotifikasi] = useState<{ id: number; teks: string } | null>(null);
  const pewaktu = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beriTahu = useCallback((teks: string) => {
    setNotifikasi({ id: Date.now(), teks });
    if (pewaktu.current) clearTimeout(pewaktu.current);
    pewaktu.current = setTimeout(() => setNotifikasi(null), LAMA_NOTIFIKASI_MS);
  }, []);

  return (
    <Konteks.Provider value={{ beriTahu }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
        {notifikasi && (
          <div
            key={notifikasi.id}
            role="status"
            className="pointer-events-auto flex max-w-lg items-center gap-3 rounded-xl border border-[#8fc283] bg-[#eef7ea] px-4 py-3 text-sm font-semibold text-[#24502a] shadow-lg"
          >
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            <span>{notifikasi.teks}</span>
            <button type="button" aria-label="Tutup" onClick={() => setNotifikasi(null)} className="cursor-pointer rounded p-1 hover:bg-white/60">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </Konteks.Provider>
  );
}
