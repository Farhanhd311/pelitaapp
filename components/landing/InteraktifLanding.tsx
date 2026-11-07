"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Headphones,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { MascotPijar, type EkspresiPijar } from "@/components/anak/MascotPijar";
import { TombolSpeaker } from "@/components/anak/TombolSpeaker";
import { IlustrasiKebunCerita } from "@/components/landing/IlustrasiPelita";

type PilihanEnergi = "semangat" | "lumayan" | "lemas";

const dataCheckinPreview: Record<
  PilihanEnergi,
  {
    label: string;
    emoji: string;
    sublabel: string;
    level: string;
    durasi: string;
    mode: string;
    ringkasan: string;
    teksSuara: string;
  }
> = {
  semangat: {
    label: "Semangat",
    emoji: "☀️",
    sublabel: "Tubuh segar, siap menjelajah hal baru",
    level: "Level Penuh",
    durasi: "25–30 menit (dengan jeda)",
    mode: "Materi Baru + Kuis Lengkap",
    ringkasan:
      "Pijar menyiapkan kartu belajar baru dan tantangan seru dengan jeda istirahat di tengah sesi.",
    teksSuara:
      "Kamu memilih semangat! Hari ini kita belajar materi baru selama dua puluh lima menit dengan jeda istirahat.",
  },
  lumayan: {
    label: "Lumayan",
    emoji: "🌤️",
    sublabel: "Bisa belajar santai sesuai ritme",
    level: "Level Normal",
    durasi: "15–20 menit",
    mode: "Modul Jembatan + 3–5 Soal Formatif",
    ringkasan:
      "Fokus mengejar 1 Tujuan Pembelajaran di Pos Dasar (Perkalian B3) dengan tempo tenang.",
    teksSuara:
      "Kamu memilih lumayan. Hari ini kita belajar santai lima belas menit di Pos Dasar Perkalian.",
  },
  lemas: {
    label: "Lemas / Mata Lelah",
    emoji: "🌧️",
    sublabel: "Ingin ditemani cerita suara tanpa menatap layar lama",
    level: "Level Ringan • Mode Audio",
    durasi: "5–10 menit",
    mode: "Audio Cerita Ulang • 1–2 Soal Santai",
    ringkasan:
      "Layar meredup ramah mata. Mengulang materi yang sudah dikuasai lewat suara tanpa memengaruhi status TP.",
    teksSuara:
      "Tidak apa-apa kalau hari ini lemas atau mata lelah. Kita dengarkan cerita audio singkat lima menit saja ya.",
  },
};

export function KartuCheckinInteraktif() {
  const [pilihan, setPilihan] = useState<PilihanEnergi>("lumayan");
  const aktif = dataCheckinPreview[pilihan];

  return (
    <div className="rounded-[1.75rem] border-2 border-[#EDB664]/80 bg-[#FFFBF4] p-6 sm:p-7 shadow-[0_20px_50px_-12px_rgba(127,29,43,0.14)]">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4DF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#A82535] border border-[#EDB664]/70">
          <Sparkles className="h-3 w-3 text-[#F4813A]" />
          Check-in Harian
        </span>
        <TombolSpeaker teks={aktif.teksSuara} label="Bacakan" />
      </div>

      <h3 className="mt-4 font-serif text-xl sm:text-2xl font-semibold text-[#4A1520]">
        Bagaimana rasanya hari ini?
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-[#6E3B3B]">
        Pilih kondisi yang paling menggambarkan tenagamu sekarang:
      </p>

      <div className="mt-4 space-y-2.5">
        {(["semangat", "lumayan", "lemas"] as PilihanEnergi[]).map((item) => {
          const d = dataCheckinPreview[item];
          const terpilih = pilihan === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setPilihan(item)}
              className={`w-full min-h-[56px] rounded-2xl px-4 py-3 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                terpilih
                  ? "bg-gradient-to-r from-[#FBD9B5] via-[#F8C99A] to-[#EDB664]/90 border-2 border-[#8E1F2E] shadow-sm"
                  : "bg-[#FFF6E8] border border-[#EDB664]/60 hover:bg-[#FBD9B5]/45"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFFBF4] text-lg shadow-xs border border-[#EDB664]/50">
                  {d.emoji}
                </span>
                <div>
                  <div className="text-sm font-bold text-[#4A1520]">
                    {d.label}
                  </div>
                  <div className="text-xs text-[#6E3B3B]">{d.sublabel}</div>
                </div>
              </div>
              <div
                className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  terpilih
                    ? "border-[#7F1D2B] bg-[#7F1D2B] text-[#FFFBF4]"
                    : "border-[#D93A45]/50 bg-[#FFFBF4]"
                }`}
              >
                {terpilih && <span className="h-2 w-2 rounded-full bg-[#EDB664]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hasil tentukanLevel() */}
      <div className="mt-4 rounded-2xl border border-[#EDB664] bg-[#FFF4DF] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8E1F2E] px-3 py-1 text-xs font-semibold text-[#FFFBF4]">
            {aktif.level}
          </span>
          <span className="text-xs font-semibold text-[#7F1D2B]">
            ⏱️ {aktif.durasi}
          </span>
        </div>
        <p className="mt-2 text-xs text-[#5C232C] leading-relaxed">
          {aktif.ringkasan}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        <Link
          href="/anak/checkin"
          className="inline-flex items-center gap-2 rounded-full bg-[#F4813A] px-4 py-2 text-xs font-bold text-[#FFFBF4] shadow-xs hover:bg-[#D93A45] transition-colors"
        >
          Coba Sesi Ini
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <span className="text-[11px] text-[#6E3B3B]">
          Hari istirahat tetap dihitung aktif ✦
        </span>
      </div>
    </div>
  );
}

export function ShowcaseBelajarAnak() {
  const [tabAktif, setTabAktif] = useState<"kartu" | "kuis" | "audio">("kartu");
  const [kondisiKuat, setKondisiKuat] = useState<
    "kuat" | "capek" | "istirahat"
  >("kuat");

  const mapEkspresi: Record<"kuat" | "capek" | "istirahat", EkspresiPijar> = {
    kuat: "senang",
    capek: "coba_lagi",
    istirahat: "lelah",
  };

  return (
    <div>
      {/* Baris Tab Filter Atas */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-[#FFFBF4] p-1.5 border border-[#EDB664]/80 shadow-xs">
          {[
            { id: "kartu", label: "1. Kartu Belajar B3" },
            { id: "kuis", label: "2. Kuis & AI Tutor" },
            { id: "audio", label: "3. Mode Ramah Mata (Audio)" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabAktif(t.id as "kartu" | "kuis" | "audio")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tabAktif === t.id
                  ? "bg-[#8E1F2E] text-[#FFFBF4] shadow-xs"
                  : "text-[#6E3B3B] hover:text-[#4A1520]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <TombolSpeaker
          teks="Enam dikali tujuh artinya ada enam keranjang, dan setiap keranjang berisi tujuh buah jeruk emas. Kalau dijumlahkan semuanya menjadi empat puluh dua."
          label="Dengarkan Materi (id-ID)"
          ukuran="md"
        />
      </div>

      {/* Kartu Utama 3 Panel (Seperti Gambar Referensi) */}
      <div className="rounded-[2rem] border-2 border-[#EDB664]/80 bg-[#FFFBF4] p-5 sm:p-7 shadow-[0_22px_55px_-16px_rgba(127,29,43,0.13)]">
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[#F2D5B0]">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#F4813A]" />
            <span className="text-xs sm:text-sm font-bold text-[#4A1520]">
              Pos Dasar Matematika • TP B3 (Perkalian Bilangan Cacah s.d. 100)
            </span>
          </div>
          <span className="rounded-full bg-[#FFF4DF] px-3 py-1 text-[11px] font-semibold text-[#8E1F2E] border border-[#EDB664]">
            🔊 Suara Otomatis Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Panel Kiri: Ilustrasi Cerita Kontekstual */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-[#EDB664]/60 bg-[#FFF7EA] p-4">
            <div>
              <IlustrasiKebunCerita />
              <h4 className="mt-3.5 font-serif text-base font-semibold text-[#4A1520]">
                Panen di Kebun Jeruk Emas
              </h4>
              <p className="mt-1 text-xs text-[#6E3B3B] leading-relaxed">
                &ldquo;Pijar mengumpulkan jeruk ke dalam{" "}
                <strong className="text-[#8E1F2E]">6 keranjang</strong>. Setiap
                keranjang diisi{" "}
                <strong className="text-[#8E1F2E]">7 jeruk</strong> hangat.&rdquo;
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#EDB664]/40 flex items-center justify-between text-[11px] text-[#7F1D2B]">
              <span>Bebas kata medis/sensitif</span>
              <span className="font-semibold">Fase B • Kelas 3–4</span>
            </div>
          </div>

          {/* Panel Tengah: Visualisasi Kelompok Benda Konkret (6 x 7) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border-2 border-[#EDB664] bg-gradient-to-b from-[#FFF4DF] to-[#FBD9B5]/45 p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A82535]">
                  {tabAktif === "kuis"
                    ? "SOAL FORMATIF B3-D3"
                    : tabAktif === "audio"
                    ? "MODE AUDIO RAMAH MATA"
                    : "VISUALISASI KELOMPOK BENDA"}
                </span>
                <span className="rounded-full bg-[#FFFBF4] px-2.5 py-0.5 text-xs font-bold text-[#8E1F2E] border border-[#EDB664]">
                  6 × 7 = 42
                </span>
              </div>

              {/* 6 Kelompok Keranjang x 7 Titik Emas */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((keranjang) => (
                  <div
                    key={keranjang}
                    className="rounded-xl border border-[#EDB664] bg-[#FFFBF4] p-2.5 text-center shadow-2xs"
                  >
                    <div className="flex flex-wrap justify-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((buah) => (
                        <span
                          key={buah}
                          className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#EDB664] to-[#F4813A] border border-[#A82535]/30"
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 text-[10px] font-bold text-[#7F1D2B]">
                      Kelompok {keranjang} (7)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#FFFBF4]/90 p-3 text-center border border-[#EDB664]/60">
              <p className="text-xs font-semibold text-[#4A1520]">
                6 kelompok berisi 7 ={" "}
                <span className="text-[#D93A45] font-bold">
                  7 + 7 + 7 + 7 + 7 + 7 = 42
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#6E3B3B]">
                Bukan 6 + 7 = 13 • Konsep dibangun lewat benda konkret
              </p>
            </div>
          </div>

          {/* Panel Kanan: Maskot Pijar & Cek "Masih kuat?" */}
          <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl border border-[#EDB664]/80 bg-gradient-to-b from-[#FBD9B5]/60 via-[#FFF4DF] to-[#FFFBF4] p-4 text-center">
            <div className="flex flex-col items-center">
              <span className="rounded-full bg-[#FFFBF4] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8E1F2E] border border-[#EDB664]">
                Cek Tengah Sesi
              </span>
              <div className="my-2">
                <MascotPijar
                  ekspresi={mapEkspresi[kondisiKuat]}
                  ukuran="md"
                />
              </div>
              <h4 className="font-serif text-base font-semibold text-[#4A1520]">
                Masih kuat lanjut?
              </h4>
              <p className="mt-0.5 text-[11px] text-[#6E3B3B]">
                Klik untuk melihat respons Pijar & sistem:
              </p>
            </div>

            <div className="mt-3 space-y-1.5 text-left">
              {[
                {
                  id: "kuat",
                  ikon: "😊",
                  teks: "Masih kuat",
                  ket: "Lanjut belajar",
                },
                {
                  id: "capek",
                  ikon: "😪",
                  teks: "Agak capek",
                  ket: "Ceroboh = 0,30",
                },
                {
                  id: "istirahat",
                  ikon: "🤒",
                  teks: "Mau istirahat",
                  ket: "Simpan & berhenti",
                },
              ].map((opsi) => (
                <button
                  key={opsi.id}
                  type="button"
                  onClick={() =>
                    setKondisiKuat(opsi.id as "kuat" | "capek" | "istirahat")
                  }
                  className={`w-full rounded-xl px-3 py-2 text-xs flex items-center justify-between transition-all cursor-pointer ${
                    kondisiKuat === opsi.id
                      ? "bg-[#8E1F2E] text-[#FFFBF4] font-semibold shadow-2xs"
                      : "bg-[#FFFBF4] text-[#4A1520] border border-[#EDB664]/60 hover:bg-[#FBD9B5]/40"
                  }`}
                >
                  <span>
                    {opsi.ikon} {opsi.teks}
                  </span>
                  <span
                    className={`text-[10px] ${
                      kondisiKuat === opsi.id
                        ? "text-[#FBD9B5]"
                        : "text-[#8E1F2E]"
                    }`}
                  >
                    {opsi.ket}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Kartu Bawah: Kiri Gelap (AI Tutor Miskonsepsi) & Kanan Terang (Teman Cerita) */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Kiri: Kartu Kontras Marun-Keemasan AI Tutor */}
        <div
          className="md:col-span-6 rounded-[1.75rem] p-6 text-[#FFFBF4] shadow-[0_18px_40px_-12px_rgba(127,29,43,0.3)] border border-[#EDB664]/40 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(135deg, #7F1D2B 0%, #8E1F2E 55%, #A82535 100%)",
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDB664]/20 px-3 py-1 text-[11px] font-semibold text-[#FBD9B5] border border-[#EDB664]/40">
                <Sparkles className="h-3.5 w-3.5 text-[#EDB664]" />
                AI Tutor Berbasis Miskonsepsi
              </span>
              <span className="text-[11px] text-[#FBD9B5]/80">
                Saat Raka menjawab 13 pada 6 × 7
              </span>
            </div>
            <p className="mt-4 font-serif text-base sm:text-lg text-[#FFFBF4] leading-relaxed">
              &ldquo;Yuk, coba lihat lagi! Sepertinya kamu{" "}
              <span className="text-[#EDB664] underline decoration-[#EDB664]/60 underline-offset-4">
                menjumlahkan 6 dan 7
              </span>{" "}
              jadi 13. Kalau 6 × 7 artinya ada 6 kelompok yang masing-masing
              isinya 7. Coba kita hitung pelan-pelan ya!&rdquo;
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#FBD9B5]/20 flex flex-wrap items-center justify-between gap-3">
            <TombolSpeaker
              teks="Yuk, coba lihat lagi! Sepertinya kamu menjumlahkan enam dan tujuh jadi tiga belas. Kalau enam dikali tujuh artinya ada enam kelompok yang masing-masing isinya tujuh."
              label="Putar Suara Tutor"
            />
            <span className="text-xs text-[#FBD9B5]">
              ✓ Maks. 3 kalimat ramah • Tanpa tanda ❌
            </span>
          </div>
        </div>

        {/* Kanan: Kartu Cerah Keemasan Teman Cerita */}
        <div className="md:col-span-6 rounded-[1.75rem] border-2 border-[#EDB664]/80 bg-[#FFFBF4] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4DF] px-3 py-1 text-[11px] font-bold text-[#8E1F2E] border border-[#EDB664]">
                <HeartHandshake className="h-3.5 w-3.5 text-[#F4813A]" />
                Teman Cerita • Triase Non-Kognitif
              </span>
              <span className="rounded-full bg-[#FBD9B5]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#7F1D2B]">
                Transkrip Tidak Disimpan
              </span>
            </div>
            <h4 className="mt-3.5 font-serif text-lg font-semibold text-[#4A1520]">
              Menyaring suasana hati, menghubungkan ke manusia yang tepat.
            </h4>
            <p className="mt-1.5 text-xs sm:text-sm text-[#6E3B3B] leading-relaxed">
              Lewat pilihan chip cuaca hati, sumber perasaan, dan kebutuhan,
              sistem mendeteksi sinyal krisis dengan aturan tetap sebelum LLM
              dan merujuk dukungan atas persetujuan orang tua.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F2D5B0] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#FFF4DF] px-2.5 py-1 text-[11px] font-medium text-[#7F1D2B] border border-[#EDB664]/60">
                🌧️ Cuaca Hati
              </span>
              <span className="rounded-full bg-[#FFF4DF] px-2.5 py-1 text-[11px] font-medium text-[#7F1D2B] border border-[#EDB664]/60">
                🤝 Rujukan Berjenjang (Level 1–3)
              </span>
            </div>
            <Link
              href="/anak/teman-cerita"
              className="text-xs font-bold text-[#A82535] hover:text-[#7F1D2B] inline-flex items-center gap-1"
            >
              Lihat Alur <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const daftarFaq = [
  {
    tanya: "Bagaimana cara PELITA menyesuaikan belajar dengan kondisi kesehatan harian anak?",
    jawab:
      "Setiap hari sebelum belajar, anak mengisi check-in singkat berisi energi (lemas, lumayan, semangat), cuaca hati, dan keluhan fisik seperti mata lelah atau pusing. Fungsi aturan tetap tentukanLevel() secara otomatis mengatur durasi dan format—misalnya mengubah sesi menjadi mode audio 5 menit saat mata anak lelah, atau memberikan hari istirahat penuh tanpa memutus keaktifan mingguan.",
  },
  {
    tanya: "Apakah aplikasi ini menyimpan diagnosis medis atau data obat anak?",
    jawab:
      "Tidak. Sesuai prinsip minimisasi data dan pelindungan data pribadi anak (UU PDP), PELITA sama sekali tidak menyimpan diagnosis penyakit, nama rumah sakit, maupun jadwal obat. Sistem hanya menyimpan fase pendampingan umum (intensif, pemeliharaan, atau pemulihan) dan batas waktu layar yang diatur orang tua.",
  },
  {
    tanya: "Bagaimana jika AI salah menempatkan titik mulai belajar atau salah membuat soal?",
    jawab:
      "Asesmen penempatan menggunakan model probabilistik Bayesian Knowledge Tracing (BKT) di atas graf prasyarat yang telah diuji pada 10.000 simulasi siswa virtual (akurasi status TP 95,4% dengan rata-rata 18 soal), serta dapat divalidasi oleh guru pendamping. Selain itu, soal variasi buatan AI tidak pernah langsung tampil ke anak: kunci hitungan dicek ulang secara terprogram dan wajib disetujui manusia di antrean tinjauan hingga berstatus terbit.",
  },
  {
    tanya: "Siapa saja yang bisa melihat data progres dan hasil skrining emosional anak?",
    jawab:
      "Anak bukan akun mandiri, melainkan profil di bawah kendali orang tua/wali yang dilindungi PIN Pendamping. Orang tua memegang hak penuh atas persetujuan rujukan di menu Keputusan Menunggu. Guru pendamping hanya melihat progres akademik anak binaannya. Untuk fitur Teman Cerita, transkrip obrolan tidak disimpan di database—orang tua hanya menerima ringkasan kategori kebutuhan dukungan.",
  },
  {
    tanya: "Apakah laporan dari PELITA menggantikan rapor resmi dari sekolah asal?",
    jawab:
      "Tidak. Penerbitan rapor dan penentuan kenaikan kelas tetap menjadi kewenangan sekolah asal. PELITA menghasilkan laporan capaian belajar per Tujuan Pembelajaran (TP) yang dipetakan ke Capaian Pembelajaran Kurikulum Merdeka (BSKAP No. 046/H/KR/2025) sehingga dapat langsung digunakan wali kelas sebagai bukti asesmen selama anak menjalani pengobatan.",
  },
];

export function AccordionFaq() {
  const [terbuka, setTerbuka] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#EDB664]/60 rounded-[1.75rem] border-2 border-[#EDB664]/70 bg-[#FFFBF4] px-6 py-2 shadow-xs">
      {daftarFaq.map((item, idx) => {
        const aktif = terbuka === idx;
        return (
          <div key={idx} className="py-4">
            <button
              type="button"
              onClick={() => setTerbuka(aktif ? null : idx)}
              className="flex w-full items-center justify-between gap-4 text-left cursor-pointer group"
            >
              <span className="font-serif text-base sm:text-lg font-semibold text-[#4A1520] group-hover:text-[#A82535] transition-colors">
                {item.tanya}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#EDB664] transition-transform ${
                  aktif
                    ? "rotate-180 bg-[#8E1F2E] text-[#FFFBF4]"
                    : "bg-[#FFF4DF] text-[#7F1D2B]"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            {aktif && (
              <p className="mt-3 pr-8 text-sm text-[#6E3B3B] leading-relaxed">
                {item.jawab}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

