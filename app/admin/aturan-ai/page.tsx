"use client";

// Aturan AI (PANDUAN 5 B12, 8.4): angka yang mengendalikan sistem, dari PENGATURAN_SISTEM.
// Admin mengubahnya dalam rentang aman + alasan; setiap perubahan = versi baru dan tercatat di log.
// Hanya grup Mesin BKT, Asesmen, dan Demo yang ditampilkan, dan hanya pengaturan yang bisa diubah.
// Jawaban untuk juri "siapa yang mengontrol AI-nya?": manusia, lewat halaman ini.

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, History, Pencil, Search, Undo2 } from "lucide-react";
import { Chip, JudulHalaman, KELAS_INPUT, Kosong, KotakGalat, Memuat, useDataAdmin } from "@/components/admin/dasar";
import { DialogRiwayat, DialogUbahPengaturan, tampilkanNilai, type NamaMapel } from "@/components/admin/DialogPengaturan";
import { useAdmin } from "@/components/admin/konteks";
import type { ItemPengaturan, ResponsPengaturan } from "@/lib/kontrak/admin";
import type { ResponsMapel } from "@/lib/kontrak/peta";

// Grup yang bisa diatur admin (keputusan tim). Pengaturan lain (sesi, kuis, rujukan, LLM, krisis, generator) tetap
// berjalan dengan nilainya, tetapi tidak ditampilkan di sini. Teks tampilan saja, bukan aturan bisnis.
const GRUP: { awalan: string; nama: string; ket: string }[] = [
  { awalan: "bkt", nama: "Mesin BKT", ket: "Peluang dan ambang yang menentukan status TP." },
  { awalan: "asesmen", nama: "Asesmen", ket: "Batas soal dan kapan asesmen berhenti." },
  { awalan: "demo", nama: "Demo", ket: "Sakelar untuk presentasi." },
];

type Dialog = { item: ItemPengaturan; jenis: "ubah" | "kembalikan" | "riwayat" } | null;

export default function Halaman() {
  const { data, galat, memuat, muatUlang } = useDataAdmin<ResponsPengaturan>("/api/admin/pengaturan");
  const { data: mapel } = useDataAdmin<ResponsMapel>("/api/mapel");
  const { beriTahu } = useAdmin();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [cari, setCari] = useState("");

  const namaMapel: NamaMapel = useMemo(() => Object.fromEntries((mapel?.mapel ?? []).map((m) => [String(m.mapel_id), m.nama])), [mapel]);

  // Pengaturan tetap (tidak bisa diubah lewat admin) tidak ditampilkan supaya tidak membingungkan.
  const bisaDiubah = (data?.pengaturan ?? []).filter((i) => i.label !== null);
  const kata = cari.trim().toLowerCase();
  const tersaring = bisaDiubah.filter((i) => !kata || [i.label ?? "", i.keterangan ?? ""].some((t) => t.toLowerCase().includes(kata)));

  return (
    <>
      <JudulHalaman
        label="Kendali AI"
        judul="Aturan AI"
        keterangan="Angka yang mengendalikan asesmen, sesi belajar, dan fitur AI. Nilai di luar rentang aman ditolak. Setiap perubahan wajib beralasan, tercatat di log, dan hanya berlaku untuk sesi baru."
      />
      <KotakGalat pesan={galat} />

      <label className="relative mb-5 block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-teks-2" aria-hidden />
        <input className={`${KELAS_INPUT} pl-9`} value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari pengaturan, misalnya: soal, ambang, demo" aria-label="Cari pengaturan" />
      </label>

      {memuat && !data && <Memuat />}
      {data && tersaring.length === 0 && <Kosong teks={`Tidak ada pengaturan yang cocok dengan "${cari}".`} />}

      <div className="flex flex-col gap-4">
        {GRUP.map((g) => {
          const daftar = tersaring.filter((i) => i.kunci.split(".")[0] === g.awalan);
          if (daftar.length === 0) return null;
          return (
            <details key={g.awalan} open className="group rounded-[20px] border border-garis bg-white">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[20px] p-5 hover:bg-pasir-muda/40 [&::-webkit-details-marker]:hidden">
                <span className="flex-1">
                  <span className="block text-base font-extrabold">
                    {g.nama} <span className="text-sm font-semibold text-teks-2">· {daftar.length}</span>
                  </span>
                  <span className="block text-[13px] text-teks-2">{g.ket}</span>
                </span>
                <ChevronDown className="size-5 text-teks-2 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="divide-y divide-garis px-5 pb-2">
                {daftar.map((item) => (
                  <BarisPengaturan key={item.kunci} item={item} namaMapel={namaMapel} onAksi={(jenis) => setDialog({ item, jenis })} />
                ))}
              </ul>
            </details>
          );
        })}
      </div>

      {dialog?.jenis === "riwayat" && <DialogRiwayat item={dialog.item} namaMapel={namaMapel} onTutup={() => setDialog(null)} />}
      {dialog && dialog.jenis !== "riwayat" && (
        <DialogUbahPengaturan
          key={`${dialog.item.kunci}-${dialog.jenis}`}
          item={dialog.item}
          mode={dialog.jenis}
          namaMapel={namaMapel}
          onTutup={() => setDialog(null)}
          onTersimpan={(pesan) => {
            setDialog(null);
            beriTahu(pesan);
            muatUlang();
          }}
        />
      )}
    </>
  );
}

function BarisPengaturan({ item, namaMapel, onAksi }: { item: ItemPengaturan; namaMapel: NamaMapel; onAksi: (jenis: "ubah" | "kembalikan" | "riwayat") => void }) {
  return (
    <li className="grid gap-x-6 gap-y-2 py-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
          {item.label}
          {item.versi > 1 && <Chip warna="emas">Sudah diubah</Chip>}
        </p>
        {item.keterangan && <p className="mt-0.5 text-xs leading-relaxed text-teks-2">{item.keterangan}</p>}
      </div>
      <div className="min-w-0 text-sm">
        <span className="font-bold break-words">{tampilkanNilai(item.nilai, item.rentang?.jenis, namaMapel)}</span>
        {item.rentang?.jenis === "angka" && (
          <span className="ml-2 text-xs whitespace-nowrap text-teks-2">
            aman {item.rentang.min}–{item.rentang.maks}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <TombolAksi label="Ubah" onClick={() => onAksi("ubah")} utama>
          <Pencil className="size-4" aria-hidden /> Ubah
        </TombolAksi>
        {item.bisa_dikembalikan && (
          <TombolAksi label="Kembalikan ke versi sebelumnya" onClick={() => onAksi("kembalikan")}>
            <Undo2 className="size-4" aria-hidden />
          </TombolAksi>
        )}
        {item.versi > 1 && (
          <TombolAksi label="Riwayat perubahan" onClick={() => onAksi("riwayat")}>
            <History className="size-4" aria-hidden />
          </TombolAksi>
        )}
      </div>
    </li>
  );
}

function TombolAksi({ label, onClick, utama, children }: { label: string; onClick: () => void; utama?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={
        utama
          ? "flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-garis bg-white px-3 text-sm font-bold text-teks transition-colors hover:border-jingga hover:text-bata"
          : "flex size-9 cursor-pointer items-center justify-center rounded-lg text-teks-2 transition-colors hover:bg-pasir-muda hover:text-bata"
      }
    >
      {children}
    </button>
  );
}
