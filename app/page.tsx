import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Compass,
  HeartHandshake,
  Sun,
  Award,
  BookOpen,
  Printer,
  Edit3,
  Scale,
  EyeOff,
  Sliders,
} from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import {
  KartuCheckinInteraktif,
  ShowcaseBelajarAnak,
  AccordionFaq,
} from "@/components/landing/InteraktifLanding";

export default function Beranda() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCEBD4] text-[#2E0B07] selection:bg-[#E3AA52]/40 selection:text-[#2E0B07]">
      {/* =====================================================================
          NAVBAR
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#E2B378]/70 bg-[#F7D7AD]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo PELITA */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3AA52] text-[#2E0B07] shadow-2xs">
              <Sparkles className="h-4 w-4 text-[#7F1D2B]" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-extrabold tracking-tight text-[#2E0B07] leading-none">
                PELITA
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#7A4335]">
                Teman Bertumbuh
              </span>
            </div>
          </Link>

          {/* Menu Tengah */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#5C2B1E]">
            <a
              href="#adaptif-kondisi"
              className="hover:text-[#2E0B07] transition-colors"
            >
              Kondisi Harian
            </a>
            <a
              href="#cara-kerja"
              className="hover:text-[#2E0B07] transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#ruang-belajar"
              className="hover:text-[#2E0B07] transition-colors"
            >
              Ruang Belajar
            </a>
            <a
              href="#pendamping"
              className="hover:text-[#2E0B07] transition-colors"
            >
              Pendamping & Sekolah
            </a>
          </nav>

          {/* Tombol Aksi Kanan */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#E3AA52] px-4 py-2 text-xs font-extrabold text-[#2E0B07] hover:bg-[#D89B3E] transition-colors"
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* =====================================================================
            SECTION 1: HERO ("Cahaya belajar, tetap menyala.")
        ===================================================================== */}
        <section className="bg-[#F7D7AD] pt-10 pb-0 sm:pt-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Kolom Kiri Hero */}
              <div className="lg:col-span-6 space-y-5">
                <span className="inline-flex items-center rounded-full bg-[#E3AA52] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2E0B07]">
                  Pendidikan Adaptif Anak
                </span>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08]">
                  <span className="block text-[#4A1520]">Cahaya belajar,</span>
                  <span className="block text-[#EA7B30] mt-1">
                    tetap menyala.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#6E3B2E] leading-relaxed max-w-lg">
                  Platform belajar adaptif untuk anak usia sekolah dasar dengan
                  penyakit kronis yang menyesuaikan cara dan beban belajar dengan
                  kondisi fisiknya hari itu, serta menjembatani progresnya
                  kembali ke sekolah asal.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#E3AA52] px-5 py-3 text-xs sm:text-sm font-extrabold text-[#2E0B07] hover:bg-[#D89B3E] transition-colors"
                  >
                    <span>Mulai Belajar</span>
                  </Link>
                  <Link
                    href="/pilih-profil"
                    className="inline-flex items-center gap-2 rounded-[12px] border border-[#DFB074] bg-[#FCECD7] px-5 py-3 text-xs sm:text-sm font-bold text-[#2E0B07] hover:bg-[#F9DFBE] transition-colors"
                  >
                    <span>Pilih Profil Demo</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#7A4335] pt-1">
                  <span className="text-[#EA7B30]">✦</span>
                  <span>
                    Mengikuti ritme pemulihan anak • Dipetakan ke Kurikulum
                    Merdeka
                  </span>
                </div>
              </div>

              {/* Kolom Kanan Hero: Kartu Ringkasan Hangat + Pijar (Persis Gambar Referensi) */}
              <div className="lg:col-span-6">
                <div className="rounded-[24px] bg-[#FCECD7] p-6 sm:p-8 border border-[#E5B97F]/70 shadow-[0_14px_36px_rgba(74,21,32,0.07)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-[#E3AA52] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2E0B07]">
                        Pendampingan Harian
                      </span>
                      <h2 className="mt-3 font-serif text-xl sm:text-2xl font-bold text-[#2E0B07] leading-snug">
                        PELITA membantu anak menemukan langkah belajar yang
                        ramah hari itu.
                      </h2>
                    </div>
                    <MascotPijar
                      ekspresi="sambut"
                      gerak="idle"
                      ukuran={84}
                      className="shrink-0"
                    />
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                    Saat energi sedang turun atau mata lelah sehabis terapi,
                    sistem otomatis beralih ke sesi ringan bersuara tanpa
                    memutus keaktifan mingguan anak.
                  </p>

                  <ul className="mt-4 space-y-2 text-xs sm:text-sm font-semibold text-[#4A1520]">
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#EA7B30]" />
                      <span>
                        Beban dan format sesi mengikuti check-in kondisi harian
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#EA7B30]" />
                      <span>
                        Asesmen adaptif BKT menemukan titik mulai di Pos Dasar
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#EA7B30]" />
                      <span>
                        Laporan capaian per TP siap dibagikan ke sekolah asal
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Strip 3 Poin Bawah Hero */}
          <div className="border-y border-[#E2B378] bg-[#F1C895]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#4A1520]">
              <div className="flex items-center gap-2">
                <span className="text-[#BF4338]">✦</span>
                <span>Menyesuaikan kondisi harian</span>
              </div>
              <div className="flex items-center gap-2 sm:justify-center">
                <span className="text-[#BF4338]">✦</span>
                <span>Menemukan akar prasyarat</span>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-[#BF4338]">✦</span>
                <span>Jembatan kembali ke sekolah asal</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: EMPATI & KONTEKS ("Rutinitas boleh berubah. Rasa ingin tahu tetap punya tempat.")
        ===================================================================== */}
        <section className="bg-[#FCEBD4] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  MENGAPA PELITA HADIR
                </span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-extrabold text-[#2E0B07] leading-snug">
                  Rutinitas boleh berubah. Rasa ingin tahu tetap punya tempat.
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                <p>
                  Pengobatan penyakit kronis seperti leukemia anak berlangsung 2
                  hingga 3 tahun dengan siklus rawat inap berulang. Tugas
                  sekolah sering kali diberikan tanpa melihat kondisi fisik anak
                  hari itu, sementara satu konsep dasar yang terlewat membuat
                  anak kesulitan mengejar pelajaran saat kembali ke kelas.
                </p>

                <div className="flex items-center gap-2.5 pt-1 text-xs sm:text-sm font-extrabold text-[#2E0B07]">
                  <span className="text-[#EA7B30]">→</span>
                  <span>
                    Setiap anak yang berhasil diselamatkan nyawanya juga harus
                    diselamatkan masa sekolahnya.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: CHECK-IN KONDISI HARIAN ("Yang disesuaikan adalah langkahnya. Bukan harapannya.")
        ===================================================================== */}
        <section id="adaptif-kondisi" className="bg-[#F5CFA2] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
              <div className="lg:col-span-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  BELAJAR ADAPTIF KONDISI HARIAN
                </span>
                <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  Yang disesuaikan adalah langkahnya. Bukan harapannya.
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-xs sm:text-sm text-[#6E3B2E] leading-relaxed">
                  Sebelum sesi dimulai, anak memilih kondisi tenaganya hari itu.
                  Sistem menyesuaikan durasi, format suara, dan tingkat beban
                  secara otomatis.
                </p>
              </div>
            </div>

            {/* Konten 2 Kolom: 3 Poin Bernomor Tanpa Kotak di Kiri + Kartu Check-in di Kanan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs font-extrabold text-[#7A4335] pt-1">
                    01
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-extrabold text-[#2E0B07]">
                      Beban belajar mengikuti tenaga hari itu
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6E3B2E] leading-relaxed">
                      Saat anak memilih lemas atau mata lelah, fungsi aturan
                      tetap menurunkan sesi ke mode audio singkat mengulang TP
                      yang sudah tercapai.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs font-extrabold text-[#7A4335] pt-1">
                    02
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-extrabold text-[#2E0B07]">
                      Hari istirahat tidak pernah dihukum
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6E3B2E] leading-relaxed">
                      Target belajar dihitung per minggu tanpa streak harian
                      yang bisa putus. Hari istirahat yang dilaporkan lewat
                      check-in tetap dihitung aktif.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs font-extrabold text-[#7A4335] pt-1">
                    03
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-extrabold text-[#2E0B07]">
                      Sinyal perhatian dini untuk pendamping
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6E3B2E] leading-relaxed">
                      Tiga kali check-in berturut-turut berenergi lemas atau
                      berkeluhan menyalakan kartu Perlu Perhatian berwarna emas
                      di dashboard orang tua dan guru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <KartuCheckinInteraktif />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: 5 LANGKAH PERJALANAN ("Satu perjalanan kecil. Selalu ada yang menemani.")
        ===================================================================== */}
        <section id="cara-kerja" className="bg-[#FCEBD4] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                ALUR BELAJAR HARIAN
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                Satu perjalanan kecil. Selalu ada yang menemani.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  judul: "Kenali kondisi hari ini",
                  isi: "Check-in energi, cuaca hati, dan keluhan fisik sebelum mulai belajar.",
                  ikon: Sun,
                },
                {
                  judul: "Temukan titik mulai",
                  isi: "Asesmen BKT menelusuri prasyarat agar anak mulai di pos yang tepat.",
                  ikon: Compass,
                },
                {
                  judul: "Pelajari sedikit demi sedikit",
                  isi: "Kartu belajar bersuara dilanjutkan kuis formatif singkat sesuai level sesi.",
                  ikon: BookOpen,
                },
                {
                  judul: "Dibantu saat keliru",
                  isi: "AI Tutor menjelaskan letak miskonsepsi dengan kalimat pendek yang ramah.",
                  ikon: HeartHandshake,
                },
                {
                  judul: "Terhubung ke sekolah",
                  isi: "Progres tiap TP dirangkum menjadi laporan Kurikulum Merdeka untuk wali kelas.",
                  ikon: Award,
                },
              ].map((step, i) => {
                const Ikon = step.ikon;
                return (
                  <div key={step.judul} className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3AA52] text-[#2E0B07]">
                        <Ikon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-bold text-[#7A4335]">
                        {i < 4 ? "→" : "✦"}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#2E0B07] leading-snug">
                      {step.judul}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#7A4335] leading-relaxed">
                      {step.isi}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: PENGALAMAN BELAJAR ANAK ("Bisa dilihat. Bisa didengar. Bisa dibaca pelan-pelan.")
        ===================================================================== */}
        <section id="ruang-belajar" className="bg-[#F5CFA2] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-8">
              <div className="lg:col-span-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  RUANG BELAJAR RAMAH ANAK
                </span>
                <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  Bisa dilihat. Bisa didengar. Bisa dibaca pelan-pelan.
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-xs sm:text-sm text-[#6E3B2E] leading-relaxed">
                  Setiap instruksi dilengkapi pembaca suara Bahasa Indonesia,
                  visualisasi benda konkret, dan maskot Pijar yang menemani
                  tanpa tekanan waktu.
                </p>
              </div>
            </div>

            <ShowcaseBelajarAnak />
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: PETA PRASYARAT ("Setiap anak punya peta. Tak harus punya tempo yang sama.")
        ===================================================================== */}
        <section id="peta-tp" className="bg-[#FCEBD4] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-10">
              <div className="lg:col-span-6 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  PETA PRASYARAT & POS DASAR
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  Setiap anak punya peta. Tak harus punya tempo yang sama.
                </h2>
                <p className="text-xs sm:text-sm text-[#7A4335] leading-relaxed pt-1">
                  Jika ada prasyarat kelas sebelumnya yang belum kuat, PELITA
                  menyisipkan modul jembatan di Pos Dasar sebelum lanjut ke
                  materi Kelasku.
                </p>
              </div>
              <div className="lg:col-span-6">
                <p className="text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                  Bayesian Knowledge Tracing (BKT) menyimpulkan penguasaan
                  leluhur dan keturunan pada graf prasyarat, sehingga titik
                  mulai ditemukan hanya dalam rata-rata 18 soal.
                </p>
              </div>
            </div>

            {/* Kotak Peta 3 Kartu (Persis Gambar Referensi) */}
            <div className="rounded-[24px] border border-[#E2B378] bg-[#F9E3C4] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center rounded-full bg-[#E3AA52] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2E0B07]">
                  Jalur Transisi Raka
                </span>
                <span className="rounded-full bg-[#FCECD7] px-3 py-1 text-[10px] font-bold text-[#7A4335] border border-[#E2B378]">
                  Matematika Fase A–B
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-[16px] bg-[#FCECD7] p-5 border border-[#E5B97F]/60">
                  <div className="font-serif text-base font-extrabold text-[#2E0B07]">
                    Operasi Dasar
                  </div>
                  <p className="mt-1 text-xs text-[#7A4335]">
                    Penjumlahan & Pengurangan (TP A4 & B2)
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-[#F2C995] px-2.5 py-0.5 text-[10px] font-bold text-[#4A1520]">
                    Tercapai ✓
                  </span>
                </div>

                <div className="rounded-[16px] bg-[#FCECD7] p-5 border-2 border-[#E3AA52]">
                  <div className="font-serif text-base font-extrabold text-[#2E0B07]">
                    Perkalian B3
                  </div>
                  <p className="mt-1 text-xs text-[#7A4335]">
                    Perkalian Bilangan Cacah s.d. 100
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-[#E3AA52] px-2.5 py-0.5 text-[10px] font-extrabold text-[#2E0B07]">
                    Titik Mulai
                  </span>
                </div>

                <div className="rounded-[16px] bg-[#FCECD7] p-5 border border-[#E5B97F]/60">
                  <div className="font-serif text-base font-extrabold text-[#2E0B07]">
                    Pecahan Dasar
                  </div>
                  <p className="mt-1 text-xs text-[#7A4335]">
                    Pecahan Senilai di Kelasku (TP B7)
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-[#F2C995]/70 px-2.5 py-0.5 text-[10px] font-bold text-[#7A4335]">
                    3 Pos Lagi
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-[#7A4335]">
                Saat fase pengobatan intensif, peta otomatis menyaring hanya TP
                berlabel <em>esensial_transisi</em> (mengadopsi prinsip ATP
                Transisi Kemendikdasmen).
              </p>
            </div>

            {/* Banner Emas Bawah Peta dengan Kotak Pijar Kiri & Tombol Bata Kanan */}
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] bg-[#E3AA52] p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#FCECD7]">
                  <MascotPijar ekspresi="semangat" ukuran={44} />
                </div>
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-extrabold text-[#2E0B07]">
                    Tidak ada label &ldquo;tertinggal&rdquo; di ruang belajar
                    anak.
                  </h4>
                  <p className="text-xs text-[#2E0B07]/80">
                    Progres dibingkai positif bersama Pijar: &ldquo;3 pos lagi
                    menuju Pecahan!&rdquo;
                  </p>
                </div>
              </div>

              <Link
                href="/anak"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-[12px] bg-[#BF4338] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#8C2B29] transition-colors"
              >
                <span>Lihat Peta Anak</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 7: PENDAMPING & SEKOLAH ("Kemajuan kecil, lebih mudah dipahami bersama.")
        ===================================================================== */}
        <section id="pendamping" className="bg-[#F5CFA2] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Kolom Kiri */}
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  PENDAMPING & SEKOLAH ASAL
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  Kemajuan kecil, lebih mudah dipahami bersama.
                </h2>
                <p className="text-xs sm:text-sm text-[#6E3B2E] leading-relaxed">
                  Orang tua memantau tren kondisi harian dan menyetujui rujukan
                  di menu Keputusan Menunggu, sementara progres per TP
                  ditampilkan sebagai status kurikulum yang jelas—bukan angka
                  persentase yang membingungkan.
                </p>

                {/* Kartu Ringkasan Belajar Raka */}
                <div className="rounded-[20px] bg-[#FCECD7] p-5 border border-[#E5B97F]/70">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5B97F]/50">
                    <span className="text-xs font-extrabold text-[#2E0B07]">
                      Ringkasan Belajar Raka
                    </span>
                    <span className="rounded-full bg-[#F2C995] px-2.5 py-0.5 text-[10px] font-bold text-[#4A1520]">
                      Data Contoh
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#6E3B2E]">Operasi Hitung A4–B2</span>
                      <span className="rounded-full bg-[#F2C995] px-2.5 py-0.5 text-[10px] font-bold text-[#2E0B07]">
                        Tercapai
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#6E3B2E]">Perkalian TP B3</span>
                      <span className="rounded-full bg-[#E3AA52] px-2.5 py-0.5 text-[10px] font-extrabold text-[#2E0B07]">
                        Jembatan
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#6E3B2E]">Tren Check-in</span>
                      <span className="rounded-full bg-[#F2C995] px-2.5 py-0.5 text-[10px] font-bold text-[#7A4335]">
                        Perlu Perhatian
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-[#6E3B2E]">
                  <span className="text-[#EA7B30] font-bold">✦</span>
                  <span>
                    Masuk ke mode pendamping dari mode anak wajib menggunakan
                    PIN Pendamping yang diverifikasi di server.
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: Kartu Draf Laporan Sekolah */}
              <div className="lg:col-span-7">
                <span className="inline-flex items-center rounded-full bg-[#E3AA52] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2E0B07] mb-3">
                  Jembatan ke Sekolah
                </span>

                <div className="rounded-[24px] bg-[#FCECD7] p-6 sm:p-7 border border-[#E5B97F]/70 shadow-[0_12px_32px_rgba(74,21,32,0.06)]">
                  <h3 className="font-serif text-lg sm:text-xl font-extrabold text-[#2E0B07]">
                    Draf Laporan untuk Sekolah
                  </h3>

                  {/* Bar Emas: Label Wajib */}
                  <div className="mt-3 rounded-[10px] bg-[#E3AA52] px-3.5 py-2 text-xs font-extrabold text-[#2E0B07]">
                    Draf dibuat AI — periksa sebelum dikirim
                  </div>

                  {/* Field Tujuan Pembelajaran */}
                  <div className="mt-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A4335]">
                      Tujuan Pembelajaran
                    </div>
                    <div className="mt-1 rounded-[10px] bg-white px-3.5 py-2 text-xs font-bold text-[#2E0B07] border border-[#E5B97F]">
                      TP B3 • Perkalian Bilangan Cacah s.d. 100 (Fase B)
                    </div>
                  </div>

                  {/* Field Deskripsi Capaian */}
                  <div className="mt-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A4335]">
                      Deskripsi Capaian Kurikulum Merdeka
                    </div>
                    <div className="mt-1 rounded-[12px] border border-[#C87D4B]/60 bg-[#FDF6EC] p-3.5 text-xs text-[#2E0B07] leading-relaxed">
                      Ananda Raka menunjukkan penguasaan yang baik pada operasi
                      penjumlahan dan pengurangan bilangan cacah (TP A1–A8, B1,
                      B2). Saat ini ananda sedang memperkuat konsep perkalian
                      sebagai penjumlahan berulang pada modul jembatan (TP B3)
                      dengan penyesuaian durasi belajar harian selama masa
                      pemeliharaan.
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-[#7A4335]">
                    Dapat disunting pendamping sebelum dicetak atau disimpan
                    sebagai PDF.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <Link
                      href="/pendamping/laporan"
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#DFB074] bg-[#F7DEC0] px-3.5 py-2 text-xs font-bold text-[#2E0B07] hover:bg-[#F2C995] transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Sunting Draf</span>
                    </Link>
                    <Link
                      href="/pendamping/laporan"
                      className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#BF4338] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#8C2B29] transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Simpan PDF</span>
                    </Link>
                  </div>
                </div>

                <p className="mt-2.5 text-[11px] text-[#6E3B2E]">
                  Aplikasi menghasilkan laporan capaian belajar yang dipetakan
                  ke CP dan TP Kurikulum Merdeka sehingga dapat digunakan
                  sekolah asal sebagai bukti asesmen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 8: PRINSIP AI ("AI membantu, manusia memutuskan.")
            Latar Krem-Emas Terang Sesuai Gambar Referensi
        ===================================================================== */}
        <section id="prinsip-ai" className="bg-[#FAE4C4] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
              <div className="lg:col-span-6 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  PRINSIP & TATA KELOLA AI
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  AI membantu, manusia memutuskan.
                </h2>
                <p className="text-xs sm:text-sm text-[#7A4335] leading-relaxed pt-1">
                  Keputusan keselamatan, level sesi, dan rujukan dukungan
                  dikendalikan oleh aturan tetap yang teruji—bukan diserahkan
                  pada model bahasa.
                </p>
              </div>
              <div className="lg:col-span-6">
                <p className="text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                  Seluruh ambang batas BKT dan daftar kata kunci krisis disimpan
                  berversi di pengaturan sistem, dapat diaudit oleh admin, dan
                  dilengkapi jawaban cadangan jika koneksi lambat.
                </p>
              </div>
            </div>

            {/* 3 Kolom Tata Kelola Bersih */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Scale className="h-5 w-5 text-[#BF4338]" />
                <h3 className="mt-3 font-serif text-base font-extrabold text-[#2E0B07]">
                  Aturan tetap yang menentukan
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                  Level sesi harian, pemicu cek &ldquo;Masih kuat?&rdquo;, dan
                  deteksi sinyal krisis dijalankan oleh algoritma aturan tetap
                  sebelum menyentuh LLM.
                </p>
              </div>

              <div>
                <Sliders className="h-5 w-5 text-[#BF4338]" />
                <h3 className="mt-3 font-serif text-base font-extrabold text-[#2E0B07]">
                  Manusia yang menyetujui
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                  Soal buatan AI wajib lolos validasi kunci otomatis dan
                  disetujui peninjau manusia sebelum terbit. Rujukan komunitas
                  wajib disetujui orang tua.
                </p>
              </div>

              <div>
                <EyeOff className="h-5 w-5 text-[#BF4338]" />
                <h3 className="mt-3 font-3 font-serif text-base font-extrabold text-[#2E0B07]">
                  Ruang aman & minim data
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                  Tidak menyimpan diagnosis medis, data obat, maupun transkrip
                  percakapan Teman Cerita. Pemanggilan AI dilakukan tanpa
                  mengirim nama atau ID anak.
                </p>
              </div>
            </div>

            {/* Banner Emas dengan Kotak Pijar di Kiri (Persis Gambar Referensi) */}
            <div className="mt-10 rounded-[22px] bg-[#E3AA52] p-6 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-[#FCECD7]">
                    <MascotPijar ekspresi="tenang" ukuran={68} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-extrabold text-[#2E0B07]">
                      Ketenangan untuk yang mendampingi.
                    </h3>
                    <p className="mt-1 text-xs text-[#2E0B07]/85 leading-relaxed">
                      Setiap keluaran AI dicatat di log audit dan dievaluasi
                      berkala pada panel Evaluasi AI.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-6 text-xs text-[#2E0B07]/90 leading-relaxed">
                  Hasil simulasi pada 10.000 siswa virtual menunjukkan akurasi
                  penempatan status TP sebesar <strong>95,4%</strong> dengan
                  rata-rata hanya <strong>18 soal</strong> per mata pelajaran,
                  dilengkapi batas waktu 8 detik dan jawaban cadangan otomatis.
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-[#7A4335]">
              ✦ Lihat metrik lengkap di halaman Admin: Aturan AI, Bank Soal, dan
              Evaluasi Kinerja AI.
            </p>
          </div>
        </section>

        {/* =====================================================================
            SECTION 9: FAQ ("Hal yang mungkin ingin Anda tanyakan.")
        ===================================================================== */}
        <section id="faq" className="bg-[#FCEBD4] py-16 sm:py-22">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A4335]">
                  TANYA JAWAB
                </span>
                <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  Hal yang mungkin ingin Anda tanyakan.
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-[#7A4335] leading-relaxed">
                  Penjelasan singkat mengenai cara kerja adaptif, privasi
                  keluarga, dan hubungan dengan sekolah asal.
                </p>
              </div>

              <div className="lg:col-span-8">
                <AccordionFaq />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 10: PRE-FOOTER CTA ORANYE ("Temani langkah kecilnya. Jaga cahaya belajarnya.")
            Kotak Krem Besar di Kiri Berisi Pijar (Menggantikan Placeholder 'P')
        ===================================================================== */}
        <section className="bg-[#EA7B30] py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Kotak Krem Besar dengan Asset Pijar */}
              <div className="md:col-span-4 flex justify-center">
                <div className="flex h-48 w-48 sm:h-52 sm:w-52 items-center justify-center rounded-[24px] bg-[#F7DFC2] shadow-sm">
                  <MascotPijar ekspresi="senang" gerak="senang" ukuran={148} />
                </div>
              </div>

              {/* Teks & Tombol CTA */}
              <div className="md:col-span-8 space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E0B07]/80">
                  MULAI BERSAMA PELITA
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2E0B07] leading-tight">
                  Temani langkah kecilnya. Jaga cahaya belajarnya.
                </h2>
                <p className="text-xs sm:text-sm text-[#2E0B07]/85 max-w-xl leading-relaxed">
                  Coba langsung alur belajar Raka, pantau progres dan draf
                  laporan sekolah di dashboard Ibu Sari, atau tinjau parameter
                  tata kelola AI di halaman Admin.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#FCECD7] px-5 py-3 text-xs sm:text-sm font-extrabold text-[#2E0B07] hover:bg-white transition-colors"
                  >
                    <span>Masuk Akun Demo</span>
                  </Link>
                  <Link
                    href="/pilih-profil"
                    className="text-xs font-extrabold text-[#2E0B07] hover:underline"
                  >
                    Langsung ke Pilih Profil (Raka / Pendamping) →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER
      ===================================================================== */}
      <footer className="bg-[#FCEBD4] py-12 text-xs text-[#7A4335]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#E2B378]">
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3AA52]">
                  <Sparkles className="h-4 w-4 text-[#2E0B07]" />
                </span>
                <span className="font-serif text-lg font-extrabold text-[#2E0B07]">
                  PELITA
                </span>
              </div>
              <p className="font-serif text-sm font-bold text-[#2E0B07]">
                Pelita, agar sakit tidak memadamkan cahaya belajar mereka.
              </p>
              <p className="max-w-sm text-[11px] leading-relaxed text-[#7A4335]">
                Platform belajar adaptif berbasis AI yang menyesuaikan kondisi
                kesehatan harian untuk menjaga keberlanjutan pendidikan anak
                dengan penyakit kronis.
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="font-extrabold text-[#2E0B07]">Ruang Anak</div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <Link href="/anak" className="hover:text-[#2E0B07]">
                    Beranda Anak
                  </Link>
                </li>
                <li>
                  <Link href="/anak/checkin" className="hover:text-[#2E0B07]">
                    Check-in Harian
                  </Link>
                </li>
                <li>
                  <Link href="/anak/asesmen" className="hover:text-[#2E0B07]">
                    Asesmen Adaptif
                  </Link>
                </li>
                <li>
                  <Link href="/anak/peta" className="hover:text-[#2E0B07]">
                    Peta Belajar
                  </Link>
                </li>
                <li>
                  <Link href="/anak/sesi/B3" className="hover:text-[#2E0B07]">
                    Sesi TP B3
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="font-extrabold text-[#2E0B07]">
                Pendamping & Sekolah
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <Link href="/login" className="hover:text-[#2E0B07]">
                    Masuk Akun Demo
                  </Link>
                </li>
                <li>
                  <Link href="/pilih-profil" className="hover:text-[#2E0B07]">
                    Pilih Profil & PIN
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pendamping/dashboard"
                    className="hover:text-[#2E0B07]"
                  >
                    Dashboard Pendamping
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pendamping/laporan"
                    className="hover:text-[#2E0B07]"
                  >
                    Laporan Kurikulum Merdeka
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="font-extrabold text-[#2E0B07]">Tata Kelola</div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <Link
                    href="/admin/aturan-ai"
                    className="hover:text-[#2E0B07]"
                  >
                    Aturan AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/bank-soal"
                    className="hover:text-[#2E0B07]"
                  >
                    Bank Soal AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/evaluasi-ai"
                    className="hover:text-[#2E0B07]"
                  >
                    Evaluasi AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/log-aktivitas"
                    className="hover:text-[#2E0B07]"
                  >
                    Log Aktivitas
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A4335]">
            <span>© 2026 Tim PELITA</span>
            <span>AI membantu, manusia memutuskan</span>
            <span>Hackathon FIRETECH 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
