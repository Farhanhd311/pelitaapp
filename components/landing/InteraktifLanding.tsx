"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Volume2,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { MascotPijar, type EkspresiPijar } from "@/components/anak/MascotPijar";
import { TombolSpeaker } from "@/components/anak/TombolSpeaker";

type PilihanEnergi = "semangat" | "lumayan" | "lemas";

const dataCheckinPreview: Record<
  PilihanEnergi,
  {
    label: string;
    emoji: string;
    ekspresi: EkspresiPijar;
    level: string;
    durasi: string;
    ringkasan: string;
    teksSuara: string;
  }
> = {
  semangat: {
    label: "Semangat",
    emoji: "☀️",
    ekspresi: "semangat",
    level: "Level Penuh • 25–30 menit",
    durasi: "25–30 menit",
    ringkasan:
      "Sesi penuh dengan jeda otomatis: materi baru di Pos Dasar, latihan bertahap, dan kuis lengkap.",
    teksSuara:
      "Kamu memilih semangat! Hari ini kita belajar materi baru dengan jeda istirahat.",
  },
  lumayan: {
    label: "Lumayan",
    emoji: "🌤️",
    ekspresi: "tenang",
    level: "Level Normal • 15–20 menit",
    durasi: "15–20 menit",
    ringkasan:
      "Sesi belajar santai 15–20 menit untuk 1 Tujuan Pembelajaran (TP B3) dengan 3–5 soal formatif.",
    teksSuara:
      "Kamu memilih lumayan. Hari ini kita belajar santai lima belas menit di Pos Dasar Perkalian.",
  },
  lemas: {
    label: "Lelah / Mata Lelah",
    emoji: "🌧️",
    ekspresi: "istirahat",
    level: "Level Ringan • Mode Audio 5–10 menit",
    durasi: "5–10 menit",
    ringkasan:
      "Mode ramah mata aktif: mengulang materi yang sudah dikuasai lewat cerita suara tanpa memengaruhi status TP.",
    teksSuara:
      "Tidak apa-apa kalau hari ini lelah. Kita dengarkan cerita suara singkat lima menit saja ya.",
  },
};

export function KartuCheckinInteraktif() {
  const [pilihan, setPilihan] = useState<PilihanEnergi>("semangat");
  const aktif = dataCheckinPreview[pilihan];

  return (
    <div className="rounded-[24px] bg-[#FCECD7] p-6 sm:p-7 shadow-[0_12px_32px_rgba(74,21,32,0.08)] border border-[#E5B97F]/60">
      {/* Baris atas: badge kiri + speaker kanan */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-[#E5AD57] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2E0B07]">
          Check-in Harian
        </span>
        <TombolSpeaker teks={aktif.teksSuara} label="Suara" />
      </div>

      {/* Judul + Pijar */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2E0B07]">
            Bagaimana tenagamu hari ini?
          </h3>
          <p className="mt-1 text-xs text-[#7A4335]">
            Pilih satu kondisi untuk melihat penyesuaian sesi:
          </p>
        </div>
        <MascotPijar ekspresi={aktif.ekspresi} ukuran={56} />
      </div>

      {/* 3 Baris Pilihan */}
      <div className="mt-4 space-y-2.5">
        {(["semangat", "lumayan", "lemas"] as PilihanEnergi[]).map((item) => {
          const d = dataCheckinPreview[item];
          const terpilih = pilihan === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setPilihan(item)}
              className={`w-full min-h-[48px] rounded-[12px] px-4 py-2.5 text-left transition-all cursor-pointer flex items-center justify-between ${
                terpilih
                  ? "bg-[#E3AA52] text-[#2E0B07] font-bold shadow-2xs border border-[#C98A32]"
                  : "bg-[#FDF3E4] text-[#2E0B07] font-semibold border border-[#C87D4B]/70 hover:bg-[#F9E3C4]"
              }`}
            >
              <span className="flex items-center gap-2.5 text-xs sm:text-sm">
                <span>{d.emoji}</span>
                <span>{d.label}</span>
              </span>
              <span className="text-[11px] opacity-80">{d.durasi}</span>
            </button>
          );
        })}
      </div>

      {/* Tombol Aksi Emas */}
      <div className="mt-4">
        <Link
          href="/pilih-profil"
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#E3AA52] px-4 py-2.5 text-xs font-extrabold text-[#2E0B07] hover:bg-[#D89B3E] transition-colors"
        >
          <span>Mulai Sesi Ini</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Catatan hasil aturan tentukanLevel() */}
      <p className="mt-3 text-[11px] text-[#7A4335] leading-relaxed">
        <strong className="text-[#2E0B07]">{aktif.level}:</strong>{" "}
        {aktif.ringkasan}
      </p>
    </div>
  );
}

export function ShowcaseBelajarAnak() {
  const [tabAktif, setTabAktif] = useState<"kartu" | "kuis" | "audio">("kartu");

  return (
    <div>
      {/* Baris Tab Teks Kiri & Pill Kanan (Persis Referensi Gambar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-5 text-xs sm:text-sm">
          {[
            { id: "kartu", label: "Kartu Belajar" },
            { id: "kuis", label: "Kuis Formatif" },
            { id: "audio", label: "Mode Audio" },
          ].map((t) => {
            const aktif = tabAktif === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTabAktif(t.id as "kartu" | "kuis" | "audio")}
                className={`cursor-pointer transition-colors pb-1 ${
                  aktif
                    ? "font-extrabold text-[#2E0B07] border-b-2 border-[#2E0B07]"
                    : "font-medium text-[#7A4335] hover:text-[#2E0B07]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3AA52] px-3.5 py-1 text-[11px] font-bold text-[#2E0B07]">
          🔊 Ramah Mata & Suara Aktif
        </span>
      </div>

      {/* Kartu Besar Utama (Latar Krem #FCECD7) */}
      <div className="rounded-[24px] bg-[#FCECD7] p-5 sm:p-7 border border-[#E5B97F]/60 shadow-[0_12px_32px_rgba(74,21,32,0.06)]">
        {/* Baris Header Kartu */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4CFA4] text-xs">
              🍊
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#2E0B07]">
              {tabAktif === "kuis"
                ? "Kuis Formatif • Soal B3-D3"
                : tabAktif === "audio"
                ? "Mode Audio Ramah Mata • TP B3"
                : "Kartu Belajar • Perkalian B3"}
            </span>
          </div>

          <TombolSpeaker
            teks="Enam keranjang jeruk, masing-masing berisi tujuh buah jeruk. Enam dikali tujuh sama dengan empat puluh dua."
            label="Dengarkan"
            className="bg-[#E3AA52] text-[#2E0B07] border-[#C98A32] font-bold"
          />
        </div>

        {/* 3 Panel Utama: Kiri (Cerita) - Tengah (Kotak Emas 3 Keranjang) - Kanan (6 x 7 = 42) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kiri: Kotak Cerita */}
          <div className="lg:col-span-4 rounded-[16px] bg-[#F7DEC0] p-4 border border-[#E5B97F]/50 flex flex-col justify-between">
            <div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#2E0B07]">
                Cerita di Kebun Jeruk
              </h4>
              <p className="mt-1.5 text-xs text-[#7A4335] leading-relaxed">
                Pijar membantu memanen jeruk ke dalam{" "}
                <strong className="text-[#2E0B07]">6 keranjang</strong>. Setiap
                keranjang diisi{" "}
                <strong className="text-[#2E0B07]">7 buah jeruk</strong> manis.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2.5 pt-2 border-t border-[#E5B97F]/40">
              <MascotPijar ekspresi="penasaran" ukuran={44} />
              <span className="text-[11px] font-semibold text-[#7A4335]">
                Bebas konteks medis/rumah sakit
              </span>
            </div>
          </div>

          {/* Tengah: Kotak Emas Menonjol dengan 3 Kotak Putih di Dalamnya (Persis Gambar Referensi) */}
          <div className="lg:col-span-4 rounded-[18px] bg-[#E3AA52] p-5 text-[#2E0B07] shadow-xs">
            <div className="text-xs sm:text-sm font-extrabold leading-snug">
              Enam kelompok berisi tujuh benda konkret
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { nama: "Kelompok 1", isi: "7 jeruk" },
                { nama: "Kelompok 2", isi: "7 jeruk" },
                { nama: "Kelompok 3–6", isi: "@ 7 jeruk" },
              ].map((k) => (
                <div key={k.nama} className="text-center">
                  <div className="aspect-square rounded-[12px] bg-[#FFFDF9] border border-[#C98A32]/40 flex flex-col items-center justify-center p-2 shadow-2xs">
                    <div className="flex flex-wrap justify-center gap-1 max-w-[42px]">
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <span
                          key={n}
                          className="h-2 w-2 rounded-full bg-[#E3AA52]"
                        />
                      ))}
                    </div>
                    <span className="mt-1.5 text-[10px] font-bold text-[#2E0B07]">
                      {k.isi}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold text-[#2E0B07]">
                    {k.nama}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs font-extrabold text-[#2E0B07]">
                7 + 7 + 7 + 7 + 7 + 7 = 42
              </div>
              <div className="text-[10px] text-[#2E0B07]/80 mt-0.5">
                Bukan 6 + 7 = 13 • Konsep penjumlahan berulang
              </div>
            </div>
          </div>

          {/* Kanan: Kotak Persamaan Besar 6 x 7 = 42 */}
          <div className="lg:col-span-4 rounded-[16px] bg-[#F7DEC0] p-5 border border-[#E5B97F]/50 flex flex-col items-center justify-center text-center min-h-[150px]">
            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2E0B07]">
              6 × 7 = 42
            </div>
            <p className="mt-1.5 text-xs font-semibold text-[#7A4335]">
              Enam keranjang dikali tujuh jeruk
            </p>
            <div className="mt-3">
              <MascotPijar ekspresi="senang" ukuran={54} />
            </div>
          </div>
        </div>
      </div>

      {/* 2 Kartu Krem Sejajar di Bawah (Persis Gambar Referensi) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kartu Kiri: AI Tutor */}
        <div className="rounded-[20px] bg-[#FCECD7] p-5 border border-[#E5B97F]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#7A4335]">
                Respons AI Tutor (Saat memilih 13)
              </span>
              <Volume2 className="h-4 w-4 text-[#BF4338]" />
            </div>
            <div className="mt-3 flex items-start gap-3">
              <MascotPijar ekspresi="empati" ukuran={52} />
              <p className="text-xs sm:text-sm font-semibold text-[#2E0B07] leading-relaxed">
                &ldquo;Yuk, coba lihat lagi! Sepertinya kamu menjumlahkan 6 dan
                7 jadi 13. Kalau 6 × 7 artinya ada 6 kelompok yang masing-masing
                isinya 7.&rdquo;
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E5B97F] bg-[#FDF3E4] px-3 py-1 text-[10px] font-bold text-[#7A4335]">
              ✓ Tanpa kata &ldquo;Salah&rdquo;
            </span>
            <span className="rounded-full border border-[#E5B97F] bg-[#FDF3E4] px-3 py-1 text-[10px] font-bold text-[#7A4335]">
              Berdasarkan miskonsepsi pilihan
            </span>
          </div>
        </div>

        {/* Kartu Kanan: Cek Masih Kuat & Teman Cerita */}
        <div className="rounded-[20px] bg-[#FCECD7] p-5 border border-[#E5B97F]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-sm sm:text-base font-bold text-[#2E0B07]">
                Cek &ldquo;Masih kuat?&rdquo;
              </span>
              <Link
                href="/anak/teman-cerita"
                className="rounded-[10px] bg-[#E3AA52] px-3.5 py-1.5 text-[11px] font-extrabold text-[#2E0B07] hover:bg-[#D89B3E] transition-colors"
              >
                Mau Istirahat
              </Link>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <MascotPijar ekspresi="peduli" ukuran={52} />
              <p className="text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                Muncul otomatis di tengah sesi atau setelah 3 jawaban keliru.
                Anak boleh memilih <strong className="text-[#2E0B07]">Agak capek</strong>{" "}
                atau berhenti istirahat kapan saja tanpa dihitung gagal.
              </p>
            </div>
          </div>
          <div className="mt-4 text-[11px] font-semibold text-[#7A4335]">
            ✦ Keputusan jeda menggunakan aturan tetap, bukan keputusan LLM
          </div>
        </div>
      </div>
    </div>
  );
}

const daftarFaq = [
  {
    tanya: "Kapan anak sebaiknya mulai menggunakan PELITA?",
    jawab:
      "PELITA dapat digunakan sejak anak menjalani perawatan di rumah sakit maupun saat pemulihan di rumah. Setiap hari sesi dimulai dengan check-in kondisi fisik dan suasana hati sehingga beban belajar selalu menyesuaikan tenaga anak hari itu.",
  },
  {
    tanya: "Apakah PELITA menggantikan sekolah asal?",
    jawab:
      "Tidak. PELITA bukan pengganti sekolah dan tidak menerbitkan rapor resmi. PELITA menghasilkan laporan capaian belajar yang dipetakan ke CP dan TP Kurikulum Merdeka sebagai bukti asesmen bagi wali kelas di sekolah asal.",
  },
  {
    tanya: "Sejauh apa peran AI di dalam aplikasi ini?",
    jawab:
      "Kami memisahkan AI pengambil keputusan (Bayesian Knowledge Tracing & graf prasyarat) dari AI generatif (LLM). LLM hanya menyusun penjelasan tutor ramah anak dan draf laporan, serta tidak pernah mengambil keputusan keselamatan atau menghentikan sesi.",
  },
  {
    tanya: "Bagaimana privasi data medis dan cerita anak dijaga?",
    jawab:
      "Sesuai prinsip minimisasi data UU PDP, PELITA tidak menyimpan diagnosis penyakit, nama obat, maupun transkrip obrolan Teman Cerita. Anak masuk melalui profil di bawah akun pendamping yang dilindungi PIN Pendamping.",
  },
  {
    tanya: "Apa peran Orang Tua dan Guru Pendamping?",
    jawab:
      "Orang tua memegang kendali penuh atas pengaturan profil, batas layar, dan persetujuan rujukan di menu Keputusan Menunggu. Guru pendamping dapat memantau progres TP anak binaannya dan mengusulkan penyesuaian jalur belajar.",
  },
];

export function AccordionFaq() {
  // Sesuai gambar referensi: 3 pertanyaan pertama terbuka secara default, 2 di bawahnya tertutup
  const [terbukaSet, setTerbukaSet] = useState<number[]>([0, 1, 2]);

  const toggleItem = (idx: number) => {
    setTerbukaSet((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  return (
    <div className="divide-y divide-[#E2B77E]">
      {daftarFaq.map((item, idx) => {
        const aktif = terbukaSet.includes(idx);
        return (
          <div key={idx} className="py-4 first:pt-0">
            <button
              type="button"
              onClick={() => toggleItem(idx)}
              className="flex w-full items-center justify-between gap-4 text-left cursor-pointer group"
            >
              <span className="font-serif text-sm sm:text-base font-bold text-[#2E0B07] group-hover:text-[#BF4338] transition-colors">
                {item.tanya}
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#BF4338]">
                {aktif ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </span>
            </button>
            {aktif && (
              <p className="mt-2 pr-8 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                {item.jawab}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
