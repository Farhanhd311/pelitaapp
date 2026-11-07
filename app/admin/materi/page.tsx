"use client";

// Materi: meninjau TP semua mapel (deskripsi, prasyarat, jumlah soal, kartu belajar, materi di peta anak) dan
// mengimpor TP baru/berubah dari PDF kurikulum (dibaca AI) atau file JSON. Keduanya lewat pratinjau yang sama. Tidak ada tombol sunting: perubahan TP lewat import, lalu AI otomatis
// membuat soal untuk TP yang baru atau berubah (lib/ai/generator-soal.ts).

import { useRef, useState } from "react";
import { BookOpen, Check, FileJson, FileText, Search } from "lucide-react";
import { Chip, JudulHalaman, KELAS_INPUT, Kosong, Kotak, KotakGalat, Memuat, TombolAdmin, useDataAdmin } from "@/components/admin/dasar";
import { DialogImporPdf } from "@/components/admin/DialogImporPdf";
import { DialogImporTp } from "@/components/admin/DialogImporTp";
import { Dropdown } from "@/components/admin/Dropdown";
import { useAdmin } from "@/components/admin/konteks";
import type { ResponsMateriAdmin } from "@/lib/kontrak/materi";

export default function Halaman() {
  const { data, galat, memuat, muatUlang } = useDataAdmin<ResponsMateriAdmin>("/api/admin/materi");
  const { beriTahu } = useAdmin();
  const [mapelId, setMapelId] = useState<number | null>(null);
  const [kelas, setKelas] = useState<number | null>(null);
  const [cari, setCari] = useState("");
  const [isiFile, setIsiFile] = useState<{ nama: string; data: unknown } | null>(null);
  const [galatFile, setGalatFile] = useState<string | null>(null);
  const [filePdf, setFilePdf] = useState<File | null>(null);
  const inputFile = useRef<HTMLInputElement>(null);
  const inputPdf = useRef<HTMLInputElement>(null);

  const idAktif = mapelId ?? data?.mapel[0]?.mapel_id ?? null;
  const mapel = data?.mapel.find((m) => m.mapel_id === idAktif);
  const tpMapel = (data?.tp ?? []).filter((t) => t.mapel_id === idAktif);
  const daftarKelas = [...new Set(tpMapel.map((t) => t.kelas))].sort((a, b) => a - b);
  const kata = cari.trim().toLowerCase();
  const tersaring = tpMapel.filter(
    (t) => (kelas === null || t.kelas === kelas) && (!kata || [t.kode, t.deskripsi, t.elemen, ...t.materi].some((x) => x.toLowerCase().includes(kata))),
  );

  async function pilihFile(f: File | undefined) {
    if (!f) return;
    setGalatFile(null);
    try {
      setIsiFile({ nama: f.name, data: JSON.parse(await f.text()) });
    } catch {
      setGalatFile(`${f.name} bukan file JSON yang valid.`);
    }
    if (inputFile.current) inputFile.current.value = "";
  }

  return (
    <>
      <JudulHalaman
        label="Konten"
        judul="Materi"
        keterangan="Tinjau tujuan pembelajaran (TP) setiap mata pelajaran. Jika kurikulum berubah, import PDF kurikulum (AI menyusun daftar TP-nya) atau file JSON. Setelah diterapkan, AI otomatis membuat soal untuk TP yang baru atau berubah."
        aksi={
          <>
            <input ref={inputFile} type="file" accept=".json,application/json" className="hidden" onChange={(e) => pilihFile(e.target.files?.[0])} />
            <input
              ref={inputPdf}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                setGalatFile(null);
                setFilePdf(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <TombolAdmin varian="kedua" onClick={() => inputFile.current?.click()}>
                <FileJson aria-hidden /> Import JSON
              </TombolAdmin>
              <TombolAdmin onClick={() => inputPdf.current?.click()}>
                <FileText aria-hidden /> Import PDF
              </TombolAdmin>
            </div>
          </>
        }
      />
      <KotakGalat pesan={galat ?? galatFile} />
      {memuat && !data && <Memuat />}

      {data && (
        <>
          <div className="mb-5 grid gap-3 rounded-[20px] border border-garis bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
            <Dropdown
              label="Mapel"
              nilai={String(idAktif ?? "")}
              onPilih={(v) => {
                setMapelId(Number(v));
                setKelas(null);
              }}
              pilihan={data.mapel.map((m) => ({
                nilai: String(m.mapel_id),
                label: m.nama,
                keterangan: `${data.tp.filter((t) => t.mapel_id === m.mapel_id).length} TP · ${m.jenis === "pustaka" ? "pustaka" : "adaptif"}`,
              }))}
            />
            <Dropdown
              label="Kelas"
              nilai={kelas === null ? "" : String(kelas)}
              onPilih={(v) => setKelas(v ? Number(v) : null)}
              pilihan={[
                { nilai: "", label: "Semua kelas" },
                ...daftarKelas.map((k) => ({ nilai: String(k), label: `Kelas ${k}`, keterangan: `${tpMapel.filter((t) => t.kelas === k).length} TP` })),
              ]}
            />
            <label className="relative flex flex-col gap-1.5 text-xs font-bold">
              Cari
              <Search className="pointer-events-none absolute bottom-3 left-3 size-4 text-teks-2" aria-hidden />
              <input className={`${KELAS_INPUT} pl-9`} value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Kode TP, deskripsi, elemen, atau judul materi" />
            </label>
          </div>

          {mapel && (
            <p className="mb-4 text-sm text-teks-2">
              <b className="text-teks">{mapel.nama}</b> · {mapel.jenis === "pustaka" ? "mapel pustaka (tanpa asesmen penempatan)" : "mapel adaptif (dengan asesmen penempatan)"} ·{" "}
              {tersaring.length} TP ditampilkan
            </p>
          )}

          {tersaring.length === 0 ? (
            <Kosong teks="Tidak ada TP yang cocok. Coba ubah saringan." />
          ) : (
            <div className="flex flex-col gap-5">
              {daftarKelas
                .filter((k) => tersaring.some((t) => t.kelas === k))
                .map((k) => (
                  <Kotak key={k} judul={`Kelas ${k}`} ikon={<BookOpen aria-hidden />}>
                    <ul className="-mt-1 divide-y divide-garis">
                      {tersaring
                        .filter((t) => t.kelas === k)
                        .map((t) => (
                          <li key={t.kode} className="grid gap-x-6 gap-y-2 py-3.5 md:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="min-w-0">
                              <p className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm font-bold text-bata">{t.kode}</span>
                                <span className="text-xs text-teks-2">{t.elemen}</span>
                                {t.esensial_transisi && <Chip warna="emas">Esensial</Chip>}
                              </p>
                              <p className="mt-1 text-sm leading-relaxed">{t.deskripsi}</p>
                              <p className="mt-1 text-xs text-teks-2">
                                Prasyarat: {t.prasyarat.length ? t.prasyarat.join(", ") : "tidak ada"}
                                {t.materi.length > 0 && <> · Di peta anak: {t.materi.join(", ")}</>}
                              </p>
                            </div>
                            <div className="flex flex-wrap content-start gap-1.5 text-xs md:justify-end">
                              {mapel?.jenis === "adaptif" && <Chip warna={t.soal_asesmen > 0 ? "pasir" : "emas"}>{t.soal_asesmen} soal asesmen</Chip>}
                              <Chip warna={t.soal_latihan > 0 ? "pasir" : "emas"}>{t.soal_latihan} soal latihan</Chip>
                              {t.ada_kartu_belajar ? (
                                <Chip warna="hijau">
                                  <Check className="mr-1 size-3" aria-hidden /> Kartu belajar
                                </Chip>
                              ) : (
                                <Chip warna="abu">Tanpa kartu belajar</Chip>
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </Kotak>
                ))}
            </div>
          )}
        </>
      )}

      {filePdf && data && (
        <DialogImporPdf
          file={filePdf}
          mapel={data.mapel}
          mapelAwal={idAktif}
          onTutup={() => setFilePdf(null)}
          onHasil={(hasil, jumlah) => {
            setIsiFile({ nama: `${filePdf.name} · ${jumlah} TP disusun AI`, data: hasil });
            setFilePdf(null);
          }}
        />
      )}

      {isiFile && (
        <DialogImporTp
          nama={isiFile.nama}
          data={isiFile.data}
          onTutup={() => setIsiFile(null)}
          onSelesai={(pesan) => {
            setIsiFile(null);
            beriTahu(pesan);
            muatUlang();
          }}
        />
      )}
    </>
  );
}
