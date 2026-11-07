"use client";

// Halaman Cetak & Draf Laporan Sekolah Asal (PRD 9.9 A7).
// Memetakan progres belajar anak ke CP & TP Kurikulum Merdeka resmi (BSKAP 046/H/KR/2025).
// Mendukung penyuntingan draf narasi buatan AI (F-LAP-2) dan pencetakan PDF via window.print() (F-LAP-3).

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit3, FileDown, Info, Loader2, Printer, ShieldCheck } from "lucide-react";
import { GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsDataLaporan } from "@/lib/kontrak/pendamping";

// Suspense wajib karena isi halaman membaca ?anak_id & ?mapel_id lewat useSearchParams (cacheComponents, Next 16).
export default function HalamanLaporanSekolah() {
  return (
    <Suspense>
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
  const [drafNarasi, setDrafNarasi] = useState<string>("");
  const [drafAsli, setDrafAsli] = useState<string>("");
  const [sedangSunting, setSedangSunting] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    panggilApi<ResponsDataLaporan>(
      `/api/pendamping/laporan?anak_id=${anakId}&mapel_id=${mapelId}`,
    )
      .then((res) => {
        setData(res);

        // Buat narasi draf AI Kurikulum Merdeka otomatis dari progres TP
        const dikuasai = res.tp.filter((t) => t.status === "tercapai");
        const sedang = res.tp.filter((t) => t.status === "jembatan");

        let narasiAwal = `Ananda ${res.anak.nama_panggilan} menunjukkan perkembangan belajar yang positif pada mata pelajaran ${res.mapel}. `;
        if (dikuasai.length > 0) {
          narasiAwal += `Ananda telah menguasai kompetensi dasar meliputi: ${dikuasai
            .slice(0, 3)
            .map((t) => t.deskripsi.toLowerCase())
            .join("; ")}. `;
        }
        if (sedang.length > 0) {
          narasiAwal += `Saat ini ananda sedang memperkuat pemahaman pada kompetensi: ${sedang
            .map((t) => t.deskripsi.toLowerCase())
            .join("; ")}. `;
        }
        narasiAwal += `Pembelajaran dilaksanakan secara adaptif dengan mempertimbangkan kondisi stamina harian anak.`;

        setDrafNarasi(narasiAwal);
        setDrafAsli(narasiAwal);
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
    const diubah = drafNarasi !== drafAsli;
    const bedaKarakter = Math.abs(drafNarasi.length - drafAsli.length);

    await panggilApi("/api/pendamping/laporan", {
      anak_id: anakId,
      mapel_id: mapelId,
      log_ai_id: null,
      diubah,
      besar_suntingan: bedaKarakter,
    }).catch(() => undefined);

    window.print();
  }

  if (memuat) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FCEBD4] p-4 text-teks">
        <Loader2 className="size-10 animate-spin text-bata" />
        <p className="mt-3 font-heading text-sm font-extrabold text-teks">
          Menyusun Data Laporan Kurikulum Merdeka…
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

  return (
    <div className="min-h-dvh bg-pasir-muda/40 text-teks py-8 px-4 sm:px-6">
      {/* Top Bar Navigasi (Disembunyikan saat mencetak via CSS print:hidden) */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/pendamping/dashboard?anak_id=${anakId}`}
          className="flex items-center gap-1.5 rounded-full border border-[#E5B97F] bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-teks hover:bg-[#FFF4E4] transition shadow-2xs"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSedangSunting((s) => !s)}
            className="flex items-center gap-1.5 rounded-xl border border-[#E5B97F] bg-white px-3.5 py-2 text-xs font-bold text-teks hover:bg-pasir transition shadow-2xs cursor-pointer"
          >
            <Edit3 className="size-3.5 text-bata" />
            <span>{sedangSunting ? "Selesai Menyunting" : "Sunting Narasi AI"}</span>
          </button>

          <button
            type="button"
            onClick={cetakLaporan}
            className="flex items-center gap-2 rounded-xl bg-bata px-4 py-2 text-xs sm:text-sm font-heading font-black text-white hover:bg-bata-tua transition shadow-xs cursor-pointer"
          >
            <Printer className="size-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Lembar Dokumen Laporan (Format A4 Resmi untuk Sekolah Asal) */}
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-[#E5B97F]/80 p-6 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0">
        {/* Kop Surat Laporan */}
        <div className="border-b-2 border-teks pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading text-lg font-black tracking-widest text-bata">
                PELITA
              </span>
              <span className="text-xs font-bold text-teks-2 border-l border-garis pl-2">
                Platform Belajar Adaptif Anak Sakit Kronis
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-black text-teks uppercase tracking-wide">
              Laporan Perkembangan Capaian Belajar
            </h1>
            <p className="text-xs text-teks-2 mt-0.5">
              Bukti Asesmen & Perkembangan Belajar untuk Sekolah Asal
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-teks-2 shrink-0">
            <p>Tanggal Cetak: <strong>{tanggalCetakStr}</strong></p>
            <p>Mata Pelajaran: <strong>{data.mapel}</strong></p>
          </div>
        </div>

        {/* Identitas Siswa */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFBF5] border border-[#E5B97F]/60 rounded-xl p-4 text-xs">
          <div>
            <span className="text-teks-2 block">Nama Siswa</span>
            <strong className="text-sm text-teks">{data.anak.nama_panggilan}</strong>
          </div>
          <div>
            <span className="text-teks-2 block">Kelas Seharusnya</span>
            <strong className="text-sm text-teks">Kelas {data.anak.kelas_seharusnya} SD</strong>
          </div>
          <div>
            <span className="text-teks-2 block">Kelas Terakhir</span>
            <strong className="text-sm text-teks">Kelas {data.anak.kelas_terakhir} SD</strong>
          </div>
          <div>
            <span className="text-teks-2 block">Metode Pembelajaran</span>
            <strong className="text-sm text-bata">Adaptif & Fleksibel</strong>
          </div>
        </div>

        {/* Narasi Deskripsi Capaian AI */}
        <div className="my-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-teks">
              Deskripsi Capaian Kompetensi
            </h2>
            <span className="rounded-full bg-emas/20 border border-emas px-2.5 py-0.5 text-[10px] font-bold text-teks-2">
              Draf dibuat AI — periksa sebelum dikirim
            </span>
          </div>

          {sedangSunting ? (
            <textarea
              rows={4}
              value={drafNarasi}
              onChange={(e) => setDrafNarasi(e.target.value)}
              className="w-full rounded-xl border-2 border-emas bg-white p-3 text-xs sm:text-sm text-teks leading-relaxed focus:outline-none"
            />
          ) : (
            <div className="rounded-xl bg-[#FFFDF9] border border-[#E5B97F]/60 p-4 text-xs sm:text-sm text-teks leading-relaxed">
              <p>{drafNarasi}</p>
            </div>
          )}
        </div>

        {/* Tabel Pemetaan TP Kurikulum Merdeka */}
        <div className="my-6 space-y-2">
          <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-teks">
            Pemetaan Capaian Tujuan Pembelajaran (TP)
          </h2>

          <div className="border border-[#E5B97F]/80 rounded-xl overflow-hidden text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FFF4E4] border-b border-[#E5B97F]/80 text-teks font-extrabold">
                  <th className="py-2.5 px-3 w-16 text-center">Kode</th>
                  <th className="py-2.5 px-2 w-16 text-center">Kelas</th>
                  <th className="py-2.5 px-3">Tujuan Pembelajaran (Kurikulum Merdeka)</th>
                  <th className="py-2.5 px-3 w-32 text-center">Status Capaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2D7B3]/60">
                {data.tp.map((t) => {
                  const label =
                    t.status === "tercapai"
                      ? "Sudah Kuasai"
                      : t.status === "jembatan"
                        ? "Sedang Menguatkan"
                        : t.status === "belum"
                          ? "Akan Dipelajari"
                          : "Belum Dicoba";

                  const style =
                    t.status === "tercapai"
                      ? "text-emerald-800 font-extrabold bg-emerald-50"
                      : t.status === "jembatan"
                        ? "text-amber-800 font-bold bg-amber-50"
                        : "text-teks-2";

                  return (
                    <tr key={t.tp_kode} className="hover:bg-[#FFFBF5]">
                      <td className="py-2 px-3 text-center font-bold text-bata">
                        {t.tp_kode}
                      </td>
                      <td className="py-2 px-2 text-center font-medium">
                        {t.kelas}
                      </td>
                      <td className="py-2 px-3 leading-relaxed">
                        {t.deskripsi}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${style}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pernyataan Hukum & Klaim Resmi (PANDUAN 8.3) */}
        <div className="my-6 rounded-xl bg-gray-50 border border-gray-200 p-3 text-[11px] text-gray-600 leading-relaxed space-y-1">
          <p>
            <strong>Dasar Acuan:</strong> {data.acuan}.
          </p>
          <p>
            <strong>Keterangan:</strong> {data.klaim}
          </p>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-teks-2">Mengetahui,</p>
            <p className="font-extrabold text-teks">Orang Tua / Wali Siswa</p>
            <div className="h-16" />
            <p className="border-t border-teks/40 mx-auto w-40 font-bold">
              ( ..................................... )
            </p>
          </div>
          <div>
            <p className="text-teks-2">Dibuat oleh,</p>
            <p className="font-extrabold text-teks">Guru / Pendamping Belajar</p>
            <div className="h-16" />
            <p className="border-t border-teks/40 mx-auto w-40 font-bold">
              ( ..................................... )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
