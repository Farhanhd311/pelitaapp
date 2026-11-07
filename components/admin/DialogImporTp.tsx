"use client";

// Import TP dua langkah: (1) pratinjau, server menghitung TP baru/berubah dan memeriksa galat tanpa menulis apa pun;
// (2) terapkan, perubahan disimpan lalu AI membuat soal untuk TP yang baru atau berubah.

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KELAS_DIALOG, KELAS_KAKI_DIALOG, TombolAdmin } from "@/components/admin/dasar";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsImporTp } from "@/lib/kontrak/materi";

export function DialogImporTp({ nama, data, onTutup, onSelesai }: { nama: string; data: unknown; onTutup: () => void; onSelesai: (pesan: string) => void }) {
  const [pratinjau, setPratinjau] = useState<ResponsImporTp | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    let batal = false;
    panggilApi<ResponsImporTp>("/api/admin/materi", { aksi: "pratinjau", data })
      .then((r) => !batal && setPratinjau(r))
      .catch((g) => !batal && setGalat(pesanGalat(g)));
    return () => {
      batal = true;
    };
  }, [data]);

  const adaPerubahan = pratinjau && (pratinjau.tp_baru.length > 0 || pratinjau.tp_berubah.length > 0 || pratinjau.prasyarat_baru > 0 || pratinjau.mapel_baru.length > 0);

  async function terapkan() {
    setSibuk(true);
    setGalat(null);
    try {
      const r = await panggilApi<ResponsImporTp>("/api/admin/materi", { aksi: "terapkan", data });
      const g = r.generator;
      onSelesai(
        `TP diperbarui: ${r.tp_baru.length} baru, ${r.tp_berubah.length} berubah.` +
          (g ? (g.dilewati ? ` ${g.dilewati}` : ` AI membuat ${g.terbit} soal baru${g.gagal ? ` (${g.gagal} tidak lolos pemeriksaan)` : ""}.`) : ""),
      );
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <Dialog open onOpenChange={(b) => !b && !sibuk && onTutup()}>
      <DialogContent className={`${KELAS_DIALOG} max-h-[90dvh] overflow-y-auto sm:max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-extrabold">Import TP</DialogTitle>
          <DialogDescription className="text-teks-2">{nama}</DialogDescription>
        </DialogHeader>

        {!pratinjau && !galat && <p className="text-sm text-teks-2">Memeriksa isi file…</p>}
        {pratinjau && (
          <div className="flex flex-col gap-3 text-sm">
            {pratinjau.galat.length > 0 ? (
              <div className="rounded-xl border border-emas bg-emas/15 p-3">
                <p className="font-bold">File belum bisa diimport:</p>
                <ul className="mt-1 ml-5 list-disc">
                  {pratinjau.galat.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            ) : !adaPerubahan ? (
              <p className="rounded-xl bg-white px-3 py-2">Isi file sama dengan TP yang sudah ada. Tidak ada yang perlu diimport.</p>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-2">
                  <Angka label="TP baru" n={pratinjau.tp_baru.length} />
                  <Angka label="TP berubah" n={pratinjau.tp_berubah.length} />
                  <Angka label="Prasyarat baru" n={pratinjau.prasyarat_baru} />
                  <Angka label="Mapel baru" n={pratinjau.mapel_baru.length} />
                </ul>
                {pratinjau.tp_baru.length > 0 && (
                  <div>
                    <p className="font-bold">TP baru:</p>
                    <ul className="mt-1 flex max-h-40 flex-col gap-1 overflow-y-auto">
                      {pratinjau.tp_baru.map((t) => (
                        <li key={t.kode} className="rounded-lg bg-white px-3 py-1.5">
                          <span className="font-mono font-bold text-bata">{t.kode}</span> {t.deskripsi}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pratinjau.tp_berubah.length > 0 && (
                  <p>
                    <b>Berubah:</b> {pratinjau.tp_berubah.map((t) => `${t.kode} (${t.kolom.join(", ")})`).join("; ")}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-teks-2">
                  TP yang tidak ada di file tidak dihapus. Setelah diterapkan, AI membuat soal untuk TP yang baru atau berubah; ini bisa memakan waktu
                  sekitar satu menit.
                </p>
              </>
            )}
          </div>
        )}
        {galat && <p className="rounded-lg bg-emas/20 px-3 py-2 text-sm font-semibold">{galat}</p>}

        <DialogFooter className={KELAS_KAKI_DIALOG}>
          <TombolAdmin varian="kedua" disabled={sibuk} onClick={onTutup}>
            {adaPerubahan && !pratinjau?.galat.length ? "Batal" : "Tutup"}
          </TombolAdmin>
          {adaPerubahan && pratinjau?.galat.length === 0 && (
            <TombolAdmin disabled={sibuk} onClick={terapkan}>
              {sibuk ? "Menerapkan & membuat soal…" : "Terapkan & buat soal"}
            </TombolAdmin>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Angka({ label, n }: { label: string; n: number }) {
  return (
    <li className="rounded-xl bg-white px-3 py-2">
      <span className="block text-xs text-teks-2">{label}</span>
      <span className="text-xl font-extrabold">{n}</span>
    </li>
  );
}
