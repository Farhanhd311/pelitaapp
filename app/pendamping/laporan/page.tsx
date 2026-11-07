"use client";

// Halaman Cetak & Draf Laporan Sekolah Asal (PRD 9.9 A7).
// Memetakan progres belajar anak ke CP & TP Kurikulum Merdeka resmi (BSKAP 046/H/KR/2025).
// Format Kop Surat resmi dinas/lembaga pendidikan, memuat seluruh mata pelajaran,
// tanpa label AI, tanpa kolom metode pembelajaran, dan siap cetak/simpan PDF via window.print().

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Printer, ShieldCheck } from "lucide-react";
import { GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import type { MapelLaporan, ResponsDataLaporan } from "@/lib/kontrak/pendamping";

export default function HalamanLaporanSekolah() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#BF4338] animate-spin" />
        </div>
      }
    >
      <IsiLaporanSekolah />
    </Suspense>
  );
}

function IsiLaporanSekolah() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const anakId = Number(searchParams.get("anak_id") ?? 1);
  const mapelId = Number(searchParams.get("mapel_id") ?? 1);

  const [data, setData] = useState<ResponsDataLaporan | null>(null);
  const [narasiCapaian, setNarasiCapaian] = useState<string>("");
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    panggilApi<ResponsDataLaporan>(
      `/api/pendamping/laporan?anak_id=${anakId}&mapel_id=${mapelId}`,
    )
      .then((res) => {
        setData(res);

        // Susun narasi resmi capaian perkembangan siswa
        const daftarMapel = res.daftar_mapel ?? [{ mapel_id: 1, mapel: res.mapel ?? "Matematika", tp: res.tp }];
        const semuaTp = daftarMapel.flatMap((m) => m.tp);
        const dikuasai = semuaTp.filter((t) => t.status === "tercapai");
        const sedang = semuaTp.filter((t) => t.status === "jembatan");

        let narasi = `Berdasarkan rekam capaian belajar pada Platform Pelita, ananda ${res.anak.nama_panggilan} menunjukkan dedikasi dan perkembangan belajar yang konsisten pada seluruh program pendampingan kurikulum. `;
        if (dikuasai.length > 0) {
          narasi += `Ananda telah tuntas menguasai ${dikuasai.length} Tujuan Pembelajaran (TP) esensial, mencakup penguasaan materi inti pada mata pelajaran ${daftarMapel.map((m) => m.mapel).join(", ")}. `;
        }
        if (sedang.length > 0) {
          narasi += `Saat ini ananda secara berkala sedang memperkuat ${sedang.length} kompetensi prasyarat lanjutan dengan ritme belajar yang fleksibel dan terstruktur. `;
        }
        narasi += `Seluruh proses asesmen penempatan diagnostik dan penguatan materi disesuaikan dengan stamina kesehatan harian ananda agar kesinambungan akademiknya tetap terjaga dengan optimal.`;

        setNarasiCapaian(narasi);
      })
      .catch((e) => {
        if (e instanceof GalatKlien && (e.kode === "BELUM_LOGIN" || e.kode === "TIDAK_BERHAK")) {
          router.replace("/pilih-profil");
        } else {
          setGalat(pesanGalat(e));
        }
      })
      .finally(() => setMemuat(false));
  }, [anakId, mapelId, router]);

  async function cetakLaporan() {
    if (!data) return;

    // Catat aktivitas cetak / unduh laporan ke server (PRD F-LAP-4)
    await panggilApi("/api/pendamping/laporan", {
      anak_id: anakId,
      mapel_id: mapelId,
      log_ai_id: null,
      diubah: false,
      besar_suntingan: 0,
    }).catch(() => undefined);

    window.print();
  }

  if (memuat) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FCEBD4] p-4 text-teks">
        <Loader2 className="size-10 animate-spin text-bata" />
        <p className="mt-3 font-heading text-sm font-extrabold text-teks">
          Menyiapkan Format Dokumen Resmi Sekolah…
        </p>
      </div>
    );
  }

  if (galat || !data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FCEBD4] p-4 text-teks">
        <p className="font-bold text-rose-700 bg-white p-4 rounded-2xl border border-rose-300">
          {galat ?? "Gagal memuat data laporan"}
        </p>
        <Link
          href={`/pendamping/dashboard?anak_id=${anakId}`}
          className="mt-4 rounded-xl bg-bata px-4 py-2 font-bold text-white"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const tanggalCetakStr = new Date(data.dicetak_pada).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const daftarMapelUntukTabel: MapelLaporan[] =
    data.daftar_mapel && data.daftar_mapel.length > 0
      ? data.daftar_mapel
      : [{ mapel_id: 1, mapel: data.mapel ?? "Matematika", tp: data.tp }];

  return (
    <div className="min-h-dvh bg-pasir-muda/40 text-teks py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Top Bar Navigasi (Disembunyikan saat cetak) */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/pendamping/dashboard?anak_id=${anakId}`}
          className="flex items-center gap-1.5 rounded-full border border-[#E5B97F] bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-teks hover:bg-[#FFF4E4] transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cetakLaporan}
            className="flex items-center gap-2 rounded-xl bg-bata px-5 py-2.5 text-xs sm:text-sm font-heading font-black text-white shadow-xs transition hover:bg-bata-tua cursor-pointer"
          >
            <Printer className="size-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Lembar Dokumen Laporan (Format Resmi A4) */}
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-[#E5B97F]/80 p-6 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0">
        {/* ======================================================== */}
        {/* KOP SURAT RESMI LEMBAGA (Garis Ganda Tradisional) */}
        {/* ======================================================== */}
        <div className="border-b-4 border-double border-teks pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
            {/* Logo & Identitas Lembaga */}
            <div className="flex items-center gap-3.5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4E4] border-2 border-bata p-1 shadow-2xs overflow-hidden">
                <img
                  src="/ilustrasi/Cheerful%20Chibi%20Flame%20Face.webp"
                  alt="Logo PELITA"
                  className="size-full object-contain select-none"
                />
              </div>
              <div>
                <h2 className="font-heading text-base sm:text-lg font-black tracking-wider text-teks uppercase leading-tight">
                  PROGRAM PENDIDIKAN DAN PENDAMPINGAN ANAK PELITA
                </h2>
                <p className="text-xs font-bold text-teks-2 mt-0.5">
                  Layanan Dukungan Belajar Berkelanjutan Berbasis Kurikulum Merdeka Kemendikbudristek
                </p>
                <p className="text-[11px] text-teks-2/80 mt-0.5">
                  Sekretariat Inklusi Edukasi Anak Sakit Kronis · Laman Resmi: pelita.app · Surel: layanan@pelita.app
                </p>
              </div>
            </div>

            {/* Nomor Dokumen & Tanggal Terbit (Tanpa Mata Pelajaran Tunggal di Kop) */}
            <div className="text-center sm:text-right text-[11px] text-teks-2 shrink-0 pt-1">
              <p className="font-bold text-teks tracking-wider uppercase">DOKUMEN RESMI ASESMEN</p>
              <p className="mt-0.5">
                No: <span className="font-mono font-bold text-teks">PLT/LAP/{new Date().getFullYear()}/{String(anakId).padStart(4, "0")}</span>
              </p>
              <p>
                Diterbitkan: <strong className="text-teks">{tanggalCetakStr}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="mt-6 mb-4 text-center space-y-1">
          <h1 className="font-heading text-lg sm:text-xl font-black text-teks uppercase tracking-wide">
            LAPORAN PERKEMBANGAN CAPAIAN TUJUAN PEMBELAJARAN (TP)
          </h1>
          <p className="text-xs text-teks-2 font-medium">
            Portofolio Pemetaan Capaian Belajar Adaptif untuk Bahan Pertimbangan Akademik Sekolah Asal
          </p>
        </div>

        {/* Identitas Siswa (Tanpa Metode Pembelajaran) */}
        <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFBF5] border border-[#E5B97F]/70 rounded-xl p-4 text-xs">
          <div>
            <span className="text-teks-2 block">Nama Siswa:</span>
            <strong className="text-sm font-extrabold text-teks">{data.anak.nama_panggilan}</strong>
          </div>
          <div>
            <span className="text-teks-2 block">Kelas Seharusnya:</span>
            <strong className="text-sm font-bold text-teks">Kelas {data.anak.kelas_seharusnya} SD</strong>
          </div>
          <div>
            <span className="text-teks-2 block">Kelas Terakhir:</span>
            <strong className="text-sm font-bold text-teks">Kelas {data.anak.kelas_terakhir} SD</strong>
          </div>
          <div>
            <span className="text-teks-2 block">Tahun Ajaran:</span>
            <strong className="text-sm font-bold text-teks">2025 / 2026</strong>
          </div>
        </div>

        {/* Narasi Deskripsi Capaian Kompetensi (Resmi & Non-AI Slop) */}
        <div className="my-5 space-y-2">
          <h2 className="font-heading text-xs font-black uppercase tracking-wider text-teks">
            I. Deskripsi Capaian Perkembangan Kompetensi
          </h2>
          <div className="rounded-xl bg-[#FFFDF9] border border-[#E5B97F]/60 p-4 text-xs sm:text-sm text-teks leading-relaxed text-justify">
            <p>{narasiCapaian}</p>
          </div>
        </div>

        {/* Tabel Pemetaan Capaian TP untuk SELURUH Mata Pelajaran */}
        <div className="my-6 space-y-6">
          <div>
            <h2 className="font-heading text-xs font-black uppercase tracking-wider text-teks">
              II. Pemetaan Capaian Tujuan Pembelajaran (Kurikulum Merdeka)
            </h2>
            <p className="text-[11px] text-teks-2 mt-0.5">
              Rincian ketercapaian kompetensi dasar siswa yang dipisahkan berdasarkan masing-masing mata pelajaran.
            </p>
          </div>

          {/* Loop untuk Setiap Mata Pelajaran */}
          {daftarMapelUntukTabel.map((mapelItem, idx) => {
            const tercapaiCount = mapelItem.tp.filter((t) => t.status === "tercapai").length;

            return (
              <div key={mapelItem.mapel_id} className="space-y-2">
                {/* Header Mata Pelajaran */}
                <div className="flex items-center justify-between border-b-2 border-[#E5B97F] pb-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-md bg-bata text-white text-[11px] font-black">
                      {idx + 1}
                    </span>
                    <h3 className="font-heading text-xs sm:text-sm font-black text-teks uppercase tracking-wide">
                      Mata Pelajaran: {mapelItem.mapel}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-teks-2">
                    {tercapaiCount} dari {mapelItem.tp.length} TP Tuntas Dikuasai
                  </span>
                </div>

                {/* Tabel TP Mapel Terkait */}
                <div className="border border-[#E5B97F]/80 rounded-xl overflow-hidden text-xs">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#FFF4E4] border-b border-[#E5B97F]/80 text-teks font-heading font-black">
                        <th className="py-2 px-3 w-20 text-center uppercase tracking-wider">Kode</th>
                        <th className="py-2 px-4">Tujuan Pembelajaran Resmi (Kurikulum Merdeka)</th>
                        <th className="py-2 px-3 w-36 text-center uppercase tracking-wider">Status Capaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2D7B3]/60">
                      {mapelItem.tp.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-3 text-center text-teks-2 font-medium">
                            Belum ada materi Tujuan Pembelajaran yang terdaftar untuk mata pelajaran ini.
                          </td>
                        </tr>
                      ) : (
                        mapelItem.tp.map((t) => {
                          const label =
                            t.status === "tercapai"
                              ? "Sudah Kuasai"
                              : t.status === "jembatan"
                                ? "Sedang Menguatkan"
                                : t.status === "belum"
                                  ? "Rencana Belajar"
                                  : "Belum Diuji";

                          const style =
                            t.status === "tercapai"
                              ? "text-emerald-900 font-extrabold bg-emerald-50 border border-emerald-300"
                              : t.status === "jembatan"
                                ? "text-amber-900 font-bold bg-amber-50 border border-amber-300"
                                : "text-stone-700 bg-stone-50 border border-stone-200";

                          return (
                            <tr key={t.tp_kode} className="hover:bg-[#FFFBF5]">
                              <td className="py-2 px-3 text-center font-heading font-black text-bata">
                                {t.tp_kode}
                              </td>
                              <td className="py-2 px-4 leading-relaxed text-teks">
                                {t.deskripsi}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${style}`}>
                                  {label}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dasar Acuan Hukum & Klaim Resmi (PANDUAN 8.3) */}
        <div className="my-5 rounded-xl bg-stone-50 border border-stone-200 p-3.5 text-[11px] text-stone-600 leading-relaxed space-y-1">
          <p>
            <strong>Dasar Acuan:</strong> {data.acuan}.
          </p>
          <p>
            <strong>Keterangan Resmi:</strong> {data.klaim}
          </p>
        </div>

        {/* Lembar Pengesahan Tanda Tangan */}
        <div className="mt-10 pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-teks-2">Mengetahui,</p>
            <p className="font-extrabold text-teks">Orang Tua / Wali Siswa</p>
            <div className="h-16" />
            <p className="border-t border-teks/50 mx-auto w-44 font-bold text-teks">
              ( ..................................... )
            </p>
          </div>
          <div>
            <p className="text-teks-2">Diverifikasi oleh,</p>
            <p className="font-extrabold text-teks">Guru / Pendamping Edukasi</p>
            <div className="h-16" />
            <p className="border-t border-teks/50 mx-auto w-44 font-bold text-teks">
              ( ..................................... )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
