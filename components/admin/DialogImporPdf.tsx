"use client";

// Import TP dari PDF kurikulum: admin memilih mapel tujuan, AI membaca PDF dan menyusun daftar TP.
// Hasilnya BELUM disimpan: diteruskan ke pratinjau import (DialogImporTp) supaya admin melihat TP baru/berubah
// sebelum menerapkannya.

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KELAS_DIALOG, KELAS_KAKI_DIALOG, TombolAdmin } from "@/components/admin/dasar";
import { Dropdown } from "@/components/admin/Dropdown";
import { pesanGalat } from "@/lib/api/klien";
import type { ResponsBacaPdf, ResponsMateriAdmin } from "@/lib/kontrak/materi";

export function DialogImporPdf({
  file,
  mapel,
  mapelAwal,
  onTutup,
  onHasil,
}: {
  file: File;
  mapel: ResponsMateriAdmin["mapel"];
  mapelAwal: number | null;
  onTutup: () => void;
  onHasil: (data: unknown, jumlahTp: number) => void;
}) {
  const [mapelId, setMapelId] = useState(String(mapelAwal ?? mapel[0]?.mapel_id ?? ""));
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function baca() {
    setSibuk(true);
    setGalat(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mapel_id", mapelId);
      // Unggahan file memakai FormData, jadi fetch langsung (panggilApi hanya mengirim JSON).
      const res = await fetch("/api/admin/materi/pdf", { method: "POST", body: form });
      const isi = (await res.json().catch(() => null)) as (ResponsBacaPdf & { galat?: string }) | null;
      if (!res.ok || !isi?.data) throw new Error(isi?.galat ?? "Maaf, ada gangguan. Coba lagi sebentar lagi.");
      onHasil(isi.data, isi.jumlah_tp);
    } catch (g) {
      setGalat(g instanceof Error ? g.message : pesanGalat(g));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <Dialog open onOpenChange={(b) => !b && !sibuk && onTutup()}>
      <DialogContent className={`${KELAS_DIALOG} sm:max-w-md`}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-extrabold">Import TP dari PDF</DialogTitle>
          <DialogDescription className="text-teks-2">
            AI membaca dokumen kurikulum (CP, ATP, atau modul ajar) dan menyusun daftar TP. Kamu akan melihat pratinjaunya dulu sebelum
            disimpan.
          </DialogDescription>
        </DialogHeader>

        <p className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm">
          <FileText className="size-5 shrink-0 text-bata" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span>
          <span className="shrink-0 text-xs text-teks-2">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
        </p>

        <Dropdown
          label="TP ini untuk mata pelajaran"
          nilai={mapelId}
          onPilih={setMapelId}
          pilihan={mapel.map((m) => ({ nilai: String(m.mapel_id), label: m.nama }))}
        />

        {sibuk && (
          <p className="rounded-xl bg-pasir-muda px-3 py-2.5 text-sm" role="status">
            AI sedang membaca PDF… Biasanya kurang dari satu menit, tergantung tebal dokumen.
          </p>
        )}
        {galat && (
          <p role="alert" className="rounded-xl border border-emas bg-emas/20 px-3 py-2 text-sm font-semibold">
            {galat}
          </p>
        )}

        <DialogFooter className={KELAS_KAKI_DIALOG}>
          <TombolAdmin varian="kedua" disabled={sibuk} onClick={onTutup}>
            Batal
          </TombolAdmin>
          <TombolAdmin disabled={sibuk || !mapelId} onClick={baca}>
            <Sparkles aria-hidden /> {sibuk ? "Membaca…" : "Baca dengan AI"}
          </TombolAdmin>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
