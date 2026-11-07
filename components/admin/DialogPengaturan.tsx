"use client";

// Dialog ubah satu pengaturan (PANDUAN 8.4): nilai baru + ALASAN wajib, atau kembalikan ke versi sebelumnya.
// Rentang aman divalidasi lagi di server; pesan galat server ditampilkan apa adanya.
// Bentuk isian mengikuti jenis pengaturan: angka, ya/tidak, daftar teks (satu per baris),
// angka per mapel (dengan nama mapel), atau JSON (tabel yang jarang diubah).

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatWaktu, KELAS_DIALOG, KELAS_INPUT, KELAS_KAKI_DIALOG, TombolAdmin, useDataAdmin } from "@/components/admin/dasar";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ItemPengaturan, PermintaanPengaturan, ResponsPengaturan } from "@/lib/kontrak/admin";

export type NamaMapel = Record<string, string>; // mapel_id -> nama

/** Nilai pengaturan -> teks yang mudah dibaca admin. */
export function tampilkanNilai(nilai: unknown, jenis?: string, namaMapel: NamaMapel = {}): string {
  if (typeof nilai === "boolean") return nilai ? "Ya" : "Tidak";
  if (typeof nilai === "number") return nilai.toLocaleString("id-ID");
  if (jenis === "angka_per_mapel" && nilai && typeof nilai === "object") {
    return Object.entries(nilai as Record<string, number>)
      .map(([id, n]) => `${namaMapel[id] ?? `Mapel ${id}`}: ${n}`)
      .join(" · ");
  }
  if (Array.isArray(nilai) && nilai.every((v) => typeof v === "string")) {
    return nilai.length > 4 ? `${nilai.slice(0, 4).join(", ")} … (+${nilai.length - 4})` : nilai.join(", ");
  }
  if (jenis === "aturan_level" && Array.isArray(nilai)) {
    return (nilai as { level: number; rujukan: string }[]).map((a) => `Level ${a.level}: ${a.rujukan}`).join(" · ");
  }
  if (jenis === "kode_kebutuhan" && nilai && typeof nilai === "object") {
    return Object.entries(nilai as Record<string, number>)
      .map(([k, l]) => `${k} → level ${l}`)
      .join(" · ");
  }
  return JSON.stringify(nilai);
}

function nilaiKeTeks(item: ItemPengaturan): string {
  const jenis = item.rentang?.jenis;
  if (jenis === "daftar_teks" && Array.isArray(item.nilai)) return item.nilai.join("\n");
  if (jenis === "angka" || jenis === "boolean") return String(item.nilai);
  return JSON.stringify(item.nilai, null, 2);
}

// Teks isian -> nilai JSON yang dikirim ke server. Galat ditampilkan, bukan dilempar.
function teksKeNilai(jenis: string | undefined, teks: string): { nilai?: unknown; galat?: string } {
  if (jenis === "angka") {
    const n = Number(teks.replace(",", "."));
    return Number.isFinite(n) && teks.trim() !== "" ? { nilai: n } : { galat: "Isi dengan angka." };
  }
  if (jenis === "boolean") return { nilai: teks === "true" };
  if (jenis === "daftar_teks") return { nilai: teks.split("\n").map((t) => t.trim()).filter(Boolean) };
  try {
    return { nilai: JSON.parse(teks) };
  } catch {
    return { galat: "Format JSON belum benar." };
  }
}

export function DialogUbahPengaturan({
  item,
  mode,
  namaMapel,
  onTutup,
  onTersimpan,
}: {
  item: ItemPengaturan;
  mode: "ubah" | "kembalikan";
  namaMapel: NamaMapel;
  onTutup: () => void;
  onTersimpan: (pesan: string) => void;
}) {
  const jenis = item.rentang?.jenis;
  const [teks, setTeks] = useState(() => nilaiKeTeks(item));
  const [perMapel, setPerMapel] = useState<Record<string, string>>(() =>
    jenis === "angka_per_mapel" ? Object.fromEntries(Object.entries(item.nilai as Record<string, number>).map(([k, v]) => [k, String(v)])) : {},
  );
  const [alasan, setAlasan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  function nilaiBaru(): { nilai?: unknown; galat?: string } {
    if (jenis !== "angka_per_mapel") return teksKeNilai(jenis, teks);
    const hasil: Record<string, number> = {};
    for (const [id, t] of Object.entries(perMapel)) {
      const n = Number(t);
      if (!Number.isInteger(n)) return { galat: `Batas untuk ${namaMapel[id] ?? `mapel ${id}`} harus bilangan bulat.` };
      hasil[id] = n;
    }
    return { nilai: hasil };
  }

  async function simpan() {
    setGalat(null);
    let minta: PermintaanPengaturan;
    if (mode === "ubah") {
      const hasil = nilaiBaru();
      if (hasil.galat) return setGalat(hasil.galat);
      minta = { aksi: "ubah", kunci: item.kunci, nilai: hasil.nilai, alasan };
    } else {
      minta = { aksi: "kembalikan", kunci: item.kunci, alasan };
    }
    setSibuk(true);
    try {
      await panggilApi<ResponsPengaturan>("/api/admin/pengaturan", minta);
      onTersimpan(mode === "ubah" ? `${item.label} disimpan sebagai versi ${item.versi + 1}.` : `${item.label} dikembalikan ke versi sebelumnya.`);
    } catch (g) {
      setGalat(pesanGalat(g));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <Dialog open onOpenChange={(buka) => !buka && onTutup()}>
      <DialogContent className={`${KELAS_DIALOG} max-h-[90dvh] overflow-y-auto sm:max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-extrabold">
            {mode === "ubah" ? "Ubah" : "Kembalikan"}: {item.label}
          </DialogTitle>
          <DialogDescription className="text-teks-2">{item.keterangan}</DialogDescription>
        </DialogHeader>

        <p className="rounded-lg bg-white px-3 py-2 text-sm">
          <span className="text-teks-2">Nilai sekarang (versi {item.versi}): </span>
          <b>{tampilkanNilai(item.nilai, jenis, namaMapel)}</b>
        </p>

        {mode === "ubah" && (
          <div className="flex flex-col gap-1.5 text-sm font-bold">
            <span>Nilai baru</span>
            {jenis === "angka" && (
              <>
                <input className={KELAS_INPUT} inputMode="decimal" value={teks} onChange={(e) => setTeks(e.target.value)} aria-label="Nilai baru" />
                <span className="text-xs font-normal text-teks-2">
                  Rentang aman: {item.rentang?.min} sampai {item.rentang?.maks}. Pakai titik untuk desimal (contoh 0.3).
                </span>
              </>
            )}
            {jenis === "boolean" && (
              <select className={KELAS_INPUT} value={teks} onChange={(e) => setTeks(e.target.value)} aria-label="Nilai baru">
                <option value="true">Ya</option>
                <option value="false">Tidak</option>
              </select>
            )}
            {jenis === "angka_per_mapel" && (
              <div className="flex flex-col gap-2 rounded-lg border border-garis bg-white p-3 font-normal">
                {Object.keys(perMapel).map((id) => (
                  <label key={id} className="flex items-center justify-between gap-3">
                    <span className="font-bold">{namaMapel[id] ?? `Mapel ${id}`}</span>
                    <input
                      className={`${KELAS_INPUT} w-24`}
                      inputMode="numeric"
                      value={perMapel[id]}
                      onChange={(e) => setPerMapel({ ...perMapel, [id]: e.target.value })}
                    />
                  </label>
                ))}
                <span className="text-xs text-teks-2">Bilangan bulat. Rentang aman diperiksa server.</span>
              </div>
            )}
            {jenis !== "angka" && jenis !== "boolean" && jenis !== "angka_per_mapel" && (
              <>
                <textarea className={`${KELAS_INPUT} min-h-40 font-mono text-xs`} value={teks} onChange={(e) => setTeks(e.target.value)} aria-label="Nilai baru" />
                <span className="text-xs font-normal text-teks-2">
                  {jenis === "daftar_teks" ? "Satu kata atau pola per baris. Tidak boleh dikosongkan." : "Format JSON. Ubah hanya bagian yang perlu."}
                </span>
              </>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Alasan perubahan (wajib, min. 5 huruf)
          <textarea
            className={`${KELAS_INPUT} min-h-20`}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Contoh: hasil uji menunjukkan anak terlalu cepat dinyatakan tercapai."
          />
          <span className="text-xs font-normal text-teks-2">Tercatat di log aktivitas. Hanya berlaku untuk sesi dan asesmen baru.</span>
        </label>

        {galat && (
          <p role="alert" className="rounded-lg border border-emas bg-emas/20 px-3 py-2 text-sm font-semibold">
            {galat}
          </p>
        )}

        <DialogFooter className={KELAS_KAKI_DIALOG}>
          <TombolAdmin varian="kedua" onClick={onTutup}>
            Batal
          </TombolAdmin>
          <TombolAdmin disabled={sibuk || alasan.trim().length < 5} onClick={simpan}>
            {sibuk ? "Menyimpan…" : mode === "ubah" ? "Simpan versi baru" : "Kembalikan"}
          </TombolAdmin>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DialogRiwayat({ item, namaMapel, onTutup }: { item: ItemPengaturan; namaMapel: NamaMapel; onTutup: () => void }) {
  const { data, galat, memuat } = useDataAdmin<ResponsPengaturan>(`/api/admin/pengaturan?kunci=${encodeURIComponent(item.kunci)}`);
  return (
    <Dialog open onOpenChange={(buka) => !buka && onTutup()}>
      <DialogContent className={`${KELAS_DIALOG} sm:max-w-xl`}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-extrabold">Riwayat: {item.label ?? item.kunci}</DialogTitle>
          <DialogDescription className="text-teks-2">Setiap perubahan disimpan sebagai versi baru. Versi lama tidak pernah dihapus.</DialogDescription>
        </DialogHeader>
        {memuat && <p className="text-sm text-teks-2">Memuat…</p>}
        {galat && <p className="text-sm font-semibold">{galat}</p>}
        <ol className="flex max-h-96 flex-col gap-2 overflow-y-auto">
          {data?.riwayat?.map((r) => (
            <li key={r.versi} className="rounded-xl border border-garis bg-white p-3 text-sm">
              <p className="flex flex-wrap items-center gap-2 font-bold">
                Versi {r.versi}
                {r.aktif && <span className="rounded-full bg-emas/30 px-2 text-xs">dipakai sekarang</span>}
                <span className="ml-auto text-xs font-normal text-teks-2">
                  {formatWaktu(r.diubah_at)} · {r.diubah_oleh ?? "nilai awal"}
                </span>
              </p>
              <p className="mt-1 break-words">{tampilkanNilai(r.nilai, item.rentang?.jenis, namaMapel)}</p>
              {r.alasan && <p className="mt-1 text-xs text-teks-2">Alasan: {r.alasan}</p>}
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
