"use client";

// Beranda admin: laporan umum yang langsung terlihat.
//   - Angka utama: anak, TP, soal terbit, panggilan AI.
//   - Ringkasan per mapel (TP dan soal).
//   - Perlu ditangani: eskalasi/rujukan (halaman Eskalasi dibuka dari sini, tidak ada di menu).
//   - Soal otomatis AI: kapan terakhir dan berikutnya.
//   - Aktivitas terbaru (halaman Log Aktivitas dibuka dari sini) dan Persiapan demo (Reset demo).
// Semua dari API admin yang sudah ada; isi percakapan anak tidak pernah ditampilkan.

import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenCheck, ChartColumn, LifeBuoy, ScrollText, Sparkles, Theater, Users } from "lucide-react";
import { Chip, JudulHalaman, Kotak, KotakGalat, formatPersen, formatWaktu, useDataAdmin } from "@/components/admin/dasar";
import { labelTindakan } from "@/components/admin/label-log";
import { TombolResetDemo } from "@/components/admin/TombolResetDemo";
import type { ResponsEskalasi, ResponsEvaluasi, ResponsLog, ResponsSoal } from "@/lib/kontrak/admin";
import type { ResponsMateriAdmin } from "@/lib/kontrak/materi";

function Angka({ ikon, label, nilai, keterangan }: { ikon: ReactNode; label: string; nilai: ReactNode; keterangan?: string }) {
  return (
    <div className="rounded-[20px] border border-garis bg-white p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-teks-2">
        <span className="text-bata [&_svg]:size-4.5">{ikon}</span>
        {label}
      </p>
      <p className="mt-2 font-heading text-[34px] leading-none font-black">{nilai}</p>
      {keterangan && <p className="mt-1.5 text-xs text-teks-2">{keterangan}</p>}
    </div>
  );
}

const TautanKecil = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="font-heading text-sm font-bold text-bata hover:underline">
    {children}
  </Link>
);

export default function Halaman() {
  const evaluasi = useDataAdmin<ResponsEvaluasi>("/api/admin/evaluasi");
  const soal = useDataAdmin<ResponsSoal>("/api/admin/soal");
  const materi = useDataAdmin<ResponsMateriAdmin>("/api/admin/materi");
  const eskalasi = useDataAdmin<ResponsEskalasi>("/api/admin/eskalasi");
  const log = useDataAdmin<ResponsLog>("/api/admin/log-aktivitas");

  const semuaSoal = soal.data?.soal ?? [];
  const soalAi = semuaSoal.filter((s) => s.sumber === "ai").length;
  const keandalan = evaluasi.data?.keandalan ?? [];
  const panggilan = keandalan.reduce((n, k) => n + k.jumlah_panggilan, 0);
  const cadangan = keandalan.length ? keandalan.reduce((n, k) => n + (k.persen_cadangan ?? 0) * k.jumlah_panggilan, 0) / Math.max(1, panggilan) : null;
  const perlu = (eskalasi.data?.antrean ?? []).filter((e) => e.status === "eskalasi" || e.status === "disetujui");
  const mapelTp = new Map((soal.data?.daftar_tp ?? []).map((t) => [t.kode, t.mapel]));
  const galat = evaluasi.galat ?? soal.galat ?? materi.galat ?? eskalasi.galat ?? log.galat;

  return (
    <>
      <JudulHalaman label="Ruang admin" judul="Beranda" keterangan="Laporan singkat keadaan PELITA: anak, kurikulum, soal, fitur AI, dan hal yang perlu ditangani." />
      <KotakGalat pesan={galat} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Angka
          ikon={<Users aria-hidden />}
          label="Anak terdaftar"
          nilai={evaluasi.data?.agregat_anak.jumlah_anak ?? "–"}
          keterangan={evaluasi.data ? `${evaluasi.data.agregat_anak.perlu_perhatian} perlu perhatian (kondisi menurun)` : undefined}
        />
        <Angka ikon={<BookOpenCheck aria-hidden />} label="Tujuan pembelajaran" nilai={materi.data?.tp.length ?? "–"} keterangan={materi.data ? `${materi.data.mapel.length} mata pelajaran` : undefined} />
        <Angka ikon={<Sparkles aria-hidden />} label="Soal terbit" nilai={soal.data ? semuaSoal.length : "–"} keterangan={soal.data ? `${soalAi} dibuat AI` : undefined} />
        <Angka
          ikon={<ChartColumn aria-hidden />}
          label="Panggilan AI"
          nilai={evaluasi.data ? panggilan : "–"}
          keterangan={evaluasi.data ? `memakai jawaban cadangan ${formatPersen(cadangan)}` : undefined}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Kotak judul="Per mata pelajaran" ikon={<BookOpenCheck aria-hidden />} aksi={<TautanKecil href="/admin/materi">Materi →</TautanKecil>}>
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-teks-2">
              <tr className="border-b border-garis">
                <th className="py-2 pr-3">Mapel</th>
                <th className="py-2 pr-3">TP</th>
                <th className="py-2 pr-3">Soal terbit</th>
                <th className="py-2">Dibuat AI</th>
              </tr>
            </thead>
            <tbody>
              {(materi.data?.mapel ?? []).map((m) => {
                const soalMapel = semuaSoal.filter((s) => mapelTp.get(s.tp_kode) === m.nama);
                return (
                  <tr key={m.mapel_id} className="border-b border-garis/60">
                    <td className="py-2 pr-3 font-semibold">
                      {m.nama} {m.jenis === "pustaka" && <span className="text-xs font-normal text-teks-2">(pustaka)</span>}
                    </td>
                    <td className="py-2 pr-3">{materi.data!.tp.filter((t) => t.mapel_id === m.mapel_id).length}</td>
                    <td className="py-2 pr-3">{soalMapel.length}</td>
                    <td className="py-2">{soalMapel.filter((s) => s.sumber === "ai").length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Kotak>

        <Kotak
          judul="Perlu ditangani"
          ikon={<LifeBuoy aria-hidden />}
          keterangan="Kasus darurat dari Teman Cerita dan rujukan yang sudah disetujui orang tua."
          aksi={<TautanKecil href="/admin/eskalasi">Buka eskalasi →</TautanKecil>}
        >
          {perlu.length === 0 ? (
            <p className="rounded-xl bg-[#eef7ea] px-4 py-3 text-sm font-semibold text-[#24502a]">Tidak ada kasus yang perlu ditangani.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-garis text-sm">
              {perlu.slice(0, 4).map((e) => (
                <li key={e.rujukan_id} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="font-bold">{e.nama_panggilan}</span>
                  {e.darurat ? <Chip warna="emas">Darurat</Chip> : e.level !== null && <Chip warna="pasir">Level {e.level}</Chip>}
                  <span className="text-teks-2">{e.layanan ?? ""}</span>
                  <span className="ml-auto text-xs text-teks-2">{formatWaktu(e.waktu)}</span>
                </li>
              ))}
            </ul>
          )}
        </Kotak>

        <Kotak judul="Aktivitas terbaru" ikon={<ScrollText aria-hidden />} aksi={<TautanKecil href="/admin/log-aktivitas">Semua log →</TautanKecil>}>
          <ul className="flex flex-col divide-y divide-garis text-sm">
            {(log.data?.log ?? []).slice(0, 6).map((l) => (
              <li key={l.id} className="flex flex-wrap items-baseline gap-x-2 py-2">
                <span className="font-bold">{labelTindakan(l.jenis_tindakan)}</span>
                <span className="text-teks-2">oleh {l.nama ?? "sistem"}</span>
                <span className="ml-auto text-xs text-teks-2">{formatWaktu(l.waktu)}</span>
              </li>
            ))}
            {log.data && log.data.log.length === 0 && <li className="py-2 text-teks-2">Belum ada aktivitas.</li>}
          </ul>
        </Kotak>

        <div className="flex flex-col gap-5">
          <Kotak judul="Soal otomatis AI" ikon={<Sparkles aria-hidden />} aksi={<TautanKecil href="/admin/bank-soal">Bank soal →</TautanKecil>}>
            <p className="text-sm">
              Terakhir: <b>{soal.data?.generator.terakhir ? formatWaktu(soal.data.generator.terakhir) : "belum pernah"}</b>
            </p>
            <p className="mt-1 text-sm">
              Berikutnya: <b>{soal.data?.generator.berikutnya ? formatWaktu(soal.data.generator.berikutnya) : "saat jadwal berjalan"}</b>
            </p>
          </Kotak>
          <section className="rounded-[20px] bg-pasir p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold">
              <Theater className="size-5 text-bata" aria-hidden /> Persiapan demo
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed">
              Tekan <b>Reset data demo</b> sebelum naik panggung. Sinyal buruk? Nyalakan <b>Pakai jawaban cadangan</b> di{" "}
              <Link href="/admin/aturan-ai" className="font-bold text-bata hover:underline">
                Aturan AI
              </Link>
              .
            </p>
            <div className="mt-3">
              <TombolResetDemo />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
