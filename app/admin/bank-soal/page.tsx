"use client";

// Bank soal (keputusan tim, menggantikan antrean tinjauan): soal untuk SEMUA mapel dibuat AI otomatis setiap
// minggu (dan saat ada TP baru), langsung terbit jika lolos pemeriksaan otomatis, lalu dipakai anak sesuai TP-nya.
// Admin melihat soal terbit, bisa menghapus yang tidak relevan, dan bisa menjalankan generator sekarang.

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { JudulHalaman, KELAS_INPUT, Kosong, Kotak, KotakGalat, Memuat, TombolAdmin, formatWaktu, useDataAdmin } from "@/components/admin/dasar";
import { DaftarSoal } from "@/components/admin/DaftarSoal";
import { Dropdown } from "@/components/admin/Dropdown";
import { useAdmin } from "@/components/admin/konteks";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsSoal } from "@/lib/kontrak/admin";

export default function Halaman() {
  const { data: dataAwal, galat, memuat } = useDataAdmin<ResponsSoal>("/api/admin/soal");
  const { beriTahu } = useAdmin();
  const [dataBaru, setDataBaru] = useState<ResponsSoal | null>(null);
  const data = dataBaru ?? dataAwal;
  const [mapel, setMapel] = useState("");
  const [tp, setTp] = useState("");
  const [jenis, setJenis] = useState("");
  const [cari, setCari] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galatBuat, setGalatBuat] = useState<string | null>(null);

  const daftarTp = useMemo(() => data?.daftar_tp ?? [], [data]);
  const daftarMapel = useMemo(() => [...new Set(daftarTp.map((t) => t.mapel))], [daftarTp]);
  const mapelTp = useMemo(() => new Map(daftarTp.map((t) => [t.kode, t.mapel])), [daftarTp]);
  const kata = cari.trim().toLowerCase();
  const tersaring = (data?.soal ?? []).filter(
    (s) =>
      (!mapel || mapelTp.get(s.tp_kode) === mapel) &&
      (!tp || s.tp_kode === tp) &&
      (!jenis || (jenis === "diagnostik" ? s.penggunaan === "diagnostik" : s.penggunaan !== "diagnostik")) &&
      (!kata || [s.pertanyaan, s.bacaan ?? "", s.tp_kode].some((t) => t.toLowerCase().includes(kata))),
  );

  async function buatSekarang() {
    setSibuk(true);
    setGalatBuat(null);
    try {
      const r = await panggilApi<ResponsSoal>("/api/admin/soal", { aksi: "buat_sekarang" });
      setDataBaru(r);
      const h = r.hasil_generator;
      beriTahu(h?.dilewati ?? `AI membuat ${h?.terbit ?? 0} soal baru untuk ${h?.jumlah_tp ?? 0} TP${h?.gagal ? ` (${h.gagal} tidak lolos pemeriksaan, dibuang)` : ""}.`);
    } catch (g) {
      setGalatBuat(pesanGalat(g));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <>
      <JudulHalaman
        label="Konten"
        judul="Bank Soal"
        keterangan="Soal semua mata pelajaran yang dipakai anak sesuai TP-nya. Hapus soal yang sudah tidak relevan."
      />
      <KotakGalat pesan={galat} />

      {data && (
        <Kotak className="mb-5" judul="Soal otomatis dari AI" ikon={<Sparkles aria-hidden />}>
          <p className="text-sm leading-relaxed text-teks-2">
            Setiap {data.generator.interval_hari} hari AI membuat soal latihan baru untuk semua TP (dan soal asesmen untuk TP baru). Soal langsung
            terbit jika lolos pemeriksaan otomatis: 4 pilihan, 1 kunci, kunci hitungan dicek program, kalimat pendek, tanpa kata yang dihindari,
            dan tidak mirip soal lama.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span>
              Terakhir: <b>{data.generator.terakhir ? formatWaktu(data.generator.terakhir) : "belum pernah"}</b>
            </span>
            <span>
              Berikutnya: <b>{data.generator.berikutnya ? formatWaktu(data.generator.berikutnya) : "saat jadwal berikutnya berjalan"}</b>
            </span>
            <TombolAdmin ukuran="kecil" className="ml-auto" disabled={sibuk} onClick={buatSekarang}>
              <Sparkles aria-hidden /> {sibuk ? "AI sedang membuat soal… (±1 menit)" : "Buat soal sekarang"}
            </TombolAdmin>
          </div>
          {galatBuat && <p className="mt-3 rounded-lg bg-emas/20 px-3 py-2 text-sm font-semibold">{galatBuat}</p>}
        </Kotak>
      )}

      <div className="mb-5 grid gap-3 rounded-[20px] border border-garis bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <label className="relative flex flex-col gap-1.5 text-xs font-bold">
          Cari
          <Search className="pointer-events-none absolute bottom-3 left-3 size-4 text-teks-2" aria-hidden />
          <input className={`${KELAS_INPUT} pl-9`} value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Pertanyaan, bacaan, atau kode TP" />
        </label>
        <Dropdown
          label="Mapel"
          nilai={mapel}
          onPilih={(v) => {
            setMapel(v);
            setTp("");
          }}
          pilihan={[{ nilai: "", label: "Semua mapel" }, ...daftarMapel.map((m) => ({ nilai: m, label: m }))]}
        />
        <Dropdown
          label="Tujuan pembelajaran"
          nilai={tp}
          onPilih={setTp}
          bisaDicari
          placeholderCari="Cari kode atau isi TP…"
          pilihan={[
            { nilai: "", label: "Semua TP" },
            ...daftarTp
              .filter((t) => !mapel || t.mapel === mapel)
              .map((t) => ({ nilai: t.kode, label: `${t.kode} · Kelas ${t.kelas}`, keterangan: t.deskripsi, grup: t.mapel })),
          ]}
        />
        <Dropdown
          label="Jenis"
          nilai={jenis}
          onPilih={setJenis}
          pilihan={[
            { nilai: "", label: "Semua jenis" },
            { nilai: "formatif", label: "Latihan", keterangan: "Dipakai di sesi belajar" },
            { nilai: "diagnostik", label: "Asesmen", keterangan: "Dipakai di asesmen penempatan" },
          ]}
        />
      </div>

      {memuat && !data && <Memuat />}
      {data && <p className="mb-3 text-sm text-teks-2">{tersaring.length} soal</p>}
      {data && tersaring.length === 0 && <Kosong teks="Tidak ada soal yang cocok. Coba ubah saringan." />}
      {tersaring.length > 0 && (
        <DaftarSoal
          key={`${mapel}|${tp}|${jenis}|${kata}`}
          soal={tersaring}
          onDihapus={(r, pesan) => {
            setDataBaru(r);
            beriTahu(pesan);
          }}
        />
      )}
    </>
  );
}
