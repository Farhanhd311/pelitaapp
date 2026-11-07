import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Compass,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Volume2,
  Sun,
  Award,
  BookOpen,
  Users,
  Lock,
  Printer,
  Edit3,
  Scale,
  EyeOff,
  Sliders,
} from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import {
  IlustrasiPulauHero,
  IlustrasiPetaPulau,
} from "@/components/landing/IlustrasiPelita";
import {
  KartuCheckinInteraktif,
  ShowcaseBelajarAnak,
  AccordionFaq,
} from "@/components/landing/InteraktifLanding";

export default function Beranda() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF4] text-[#4A1520] selection:bg-[#EDB664]/50 selection:text-[#7F1D2B]">
      {/* =====================================================================
          NAVBAR (Sticky Top)
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#EDB664]/50 bg-[#FFFBF4]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo PELITA */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBD9B5] via-[#EDB664] to-[#F4813A] shadow-xs border border-[#8E1F2E]/20">
              <Sparkles className="h-4 w-4 text-[#7F1D2B]" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-[#7F1D2B] leading-none">
                PELITA
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#A82535]">
                Cahaya Belajar
              </span>
            </div>
          </Link>

          {/* Menu Tengah */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#6E3B3B]">
            <a
              href="#adaptif-kondisi"
              className="hover:text-[#8E1F2E] transition-colors"
            >
              Kondisi Harian
            </a>
            <a
              href="#cara-kerja"
              className="hover:text-[#8E1F2E] transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#ruang-belajar"
              className="hover:text-[#8E1F2E] transition-colors"
            >
              Ruang Belajar
            </a>
            <a
              href="#peta-tp"
              className="hover:text-[#8E1F2E] transition-colors"
            >
              Peta Prasyarat
            </a>
            <a
              href="#pendamping"
              className="hover:text-[#8E1F2E] transition-colors"
            >
              Pendamping & Sekolah
            </a>
            <a
              href="#prinsip-ai"
              className="hover:text-[#8E1F2E] transition-colors"
            >
              Prinsip AI
            </a>
            <a href="#faq" className="hover:text-[#8E1F2E] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Tombol Aksi Kanan */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/pilih-profil"
              className="hidden sm:inline-flex items-center rounded-full border border-[#EDB664] bg-[#FFF4DF] px-3.5 py-1.5 text-xs font-semibold text-[#7F1D2B] hover:bg-[#FBD9B5]/70 transition-colors"
            >
              Pilih Profil
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#8E1F2E] px-4 py-2 text-xs font-semibold text-[#FFFBF4] shadow-xs hover:bg-[#7F1D2B] transition-colors"
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#EDB664]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* =====================================================================
            SECTION 1: HERO ("Cahaya belajar, tetap menyala.")
        ===================================================================== */}
        <section className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-12">
          {/* Pendaran cahaya keemasan lembut di latar atas */}
          <div
            className="pointer-events-none absolute -top-28 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-45"
            style={{
              background:
                "radial-gradient(circle, #EDB664 0%, #FBD9B5 55%, transparent 75%)",
            }}
          />
          <div
            className="pointer-events-none absolute top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40"
            style={{
              background:
                "radial-gradient(circle, #F8C99A 0%, #F3A08F 60%, transparent 75%)",
            }}
          />

          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Kolom Kiri Hero */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#EDB664] bg-gradient-to-r from-[#FFF4DF] to-[#FBD9B5]/60 px-3.5 py-1.5 text-xs font-semibold text-[#8E1F2E] shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#F4813A]" />
                  <span>Pendidikan Adaptif untuk Anak dengan Penyakit Kronis</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-[#4A1520] leading-[1.1]">
                  Cahaya belajar,{" "}
                  <span className="relative inline-block text-[#8E1F2E]">
                    <span className="relative z-10">tetap menyala.</span>
                    <span
                      className="absolute bottom-1.5 left-0 -z-0 h-3.5 w-full rounded-sm opacity-70"
                      style={{
                        background:
                          "linear-gradient(90deg, #EDB664 0%, #F8C99A 60%, #F4813A 100%)",
                      }}
                    />
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#6E3B3B] leading-relaxed max-w-xl">
                  PELITA mendampingi anak usia sekolah dasar yang menjalani
                  pengobatan jangka panjang—menyesuaikan cara dan beban belajar
                  dengan <strong className="text-[#7F1D2B]">kondisi fisik hari itu</strong>,
                  menemukan titik mulai yang tepat tanpa stres, serta
                  menjembatani progres belajarnya kembali ke sekolah asal.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8E1F2E] via-[#A82535] to-[#D93A45] px-6 py-3 text-sm font-semibold text-[#FFFBF4] shadow-[0_10px_25px_-6px_rgba(142,31,46,0.45)] hover:opacity-95 transition-all"
                  >
                    <span>Mulai Belajar Sekarang</span>
                    <ArrowRight className="h-4 w-4 text-[#EDB664]" />
                  </Link>
                  <a
                    href="#adaptif-kondisi"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#EDB664] bg-[#FFFBF4] px-5 py-2.5 text-sm font-semibold text-[#7F1D2B] hover:bg-[#FFF4DF] transition-colors"
                  >
                    <span>Lihat Cara Kerja</span>
                  </a>
                </div>

                <div className="flex items-center gap-2.5 pt-2 text-xs text-[#6E3B3B]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4DF] border border-[#EDB664] text-[#8E1F2E]">
                    ✦
                  </span>
                  <span>
                    Tanpa menyimpan diagnosis medis • Mengikuti ritme pemulihan
                    anak • Dipetakan ke Kurikulum Merdeka
                  </span>
                </div>
              </div>

              {/* Kolom Kanan Hero: Ilustrasi Pulau Fantasi & Pijar */}
              <div className="lg:col-span-6">
                <IlustrasiPulauHero />
              </div>
            </div>

            {/* Strip 3 Keunggulan Utama di Bawah Hero (Seperti Gambar Referensi) */}
            <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-[#EDB664]/60 py-4 bg-[#FFF6E6]/70 rounded-2xl px-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBD9B5] text-[#8E1F2E]">
                  <Sun className="h-4 w-4 text-[#F4813A]" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#4A1520]">
                  Menyesuaikan kondisi fisik & suasana hati harian
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBD9B5] text-[#8E1F2E]">
                  <Compass className="h-4 w-4 text-[#D93A45]" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#4A1520]">
                  Menemukan akar prasyarat tanpa label &ldquo;tertinggal&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBD9B5] text-[#8E1F2E]">
                  <FileText className="h-4 w-4 text-[#8E1F2E]" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#4A1520]">
                  Laporan capaian TP siap pakai untuk sekolah asal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: EMPATI & KONTEKS ("Rutinitas boleh berubah. Rasa ingin tahu tetap punya tempat.")
        ===================================================================== */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                  MENGAPA PELITA HADIR
                </span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A1520] leading-tight">
                  Rutinitas boleh berubah. Rasa ingin tahu tetap punya tempat.
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-[#6E3B3B] leading-relaxed">
                <p>
                  Pengobatan penyakit kronis seperti leukemia anak dapat
                  berlangsung <strong className="text-[#4A1520]">2 hingga 3 tahun</strong>{" "}
                  dengan siklus rawat inap berulang. Selama masa itu, tugas
                  sekolah sering kali dititipkan begitu saja tanpa melihat
                  apakah hari itu anak sedang segar atau baru selesai menjalani
                  terapi yang melelahkan.
                </p>
                <p>
                  Ketika kembali ke kelas, anak kerap kesulitan mengejar
                  pelajaran bukan karena tidak mampu, melainkan karena ada satu
                  konsep dasar yang terlewat saat ia dirawat.
                </p>

                <div className="pt-2">
                  <div className="inline-flex items-start sm:items-center gap-3 rounded-2xl border border-[#EDB664] bg-gradient-to-r from-[#FFF4DF] to-[#FBD9B5]/60 px-4 py-3 text-xs sm:text-sm font-semibold text-[#7F1D2B]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F4813A] text-[#FFFBF4] font-bold">
                      →
                    </span>
                    <span>
                      Setiap anak yang berhasil diselamatkan kesehatannya, juga
                      berhak diselamatkan keberlanjutan masa sekolahnya.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: CHECK-IN KONDISI HARIAN ("Yang disesuaikan adalah langkahnya. Bukan harapannya.")
        ===================================================================== */}
        <section
          id="adaptif-kondisi"
          className="py-16 sm:py-22 border-y border-[#EDB664]/60"
          style={{
            background:
              "linear-gradient(180deg, #FFF5E2 0%, #FDEBD0 55%, #FFF6E6 100%)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
              <div className="lg:col-span-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                  BELAJAR ADAPTIF TERHADAP KONDISI HARIAN
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                  Yang disesuaikan adalah langkahnya. Bukan harapannya.
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-sm sm:text-base text-[#6E3B3B] leading-relaxed">
                  Sebelum membuka materi apa pun, PELITA menyapa anak untuk
                  mengenali energi, cuaca hati, dan keluhan fisiknya hari itu.
                  Beban belajar lentur mengikuti tenaga anak, tanpa tekanan.
                </p>
              </div>
            </div>

            {/* Konten 2 Kolom: 3 Poin di Kiri + Kartu Interaktif Check-in di Kanan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-start gap-4 rounded-2xl bg-[#FFFBF4]/80 p-4 border border-[#EDB664]/60">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBD9B5] to-[#EDB664] text-[#7F1D2B] font-bold shadow-2xs">
                    1
                  </span>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-[#4A1520]">
                      Durasi & format berubah sesuai keluhan fisik
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6E3B3B] leading-relaxed">
                      Saat anak memilih <em>lemas</em> atau <em>mata lelah</em>,
                      fungsi <code className="rounded bg-[#FFF4DF] px-1.5 py-0.5 text-[#8E1F2E] font-mono text-xs">tentukanLevel()</code>{" "}
                      otomatis menurunkan sesi ke{" "}
                      <strong className="text-[#7F1D2B]">Mode Audio 5 menit</strong>{" "}
                      mengulang materi yang sudah dikuasai.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl bg-[#FFFBF4]/80 p-4 border border-[#EDB664]/60">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBD9B5] to-[#EDB664] text-[#7F1D2B] font-bold shadow-2xs">
                    2
                  </span>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-[#4A1520]">
                      Motivasi tanpa menghukum hari istirahat
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6E3B3B] leading-relaxed">
                      Tidak ada <em>streak</em> harian yang bisa putus. Hari
                      istirahat yang dilaporkan lewat check-in tetap dihitung
                      sebagai hari aktif, dan <em>Mode Jeda</em> membekukan target
                      saat rawat inap intensif.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl bg-[#FFFBF4]/80 p-4 border border-[#EDB664]/60">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBD9B5] to-[#EDB664] text-[#7F1D2B] font-bold shadow-2xs">
                    3
                  </span>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-[#4A1520]">
                      Peringatan dini untuk orang tua & guru
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6E3B3B] leading-relaxed">
                      Tiga kali check-in berturut-turut dengan energi lemas atau
                      keluhan fisik langsung menyalakan kartu{" "}
                      <strong className="text-[#7F1D2B]">Perlu Perhatian</strong>{" "}
                      berwarna amber lembut di dashboard pendamping.
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
        <section id="cara-kerja" className="py-16 sm:py-22 bg-[#FFFBF4]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                ALUR PENGGUNA TERPADU
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                Satu perjalanan kecil. Selalu ada yang menemani.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  no: "01",
                  judul: "Check-in Harian",
                  isi: "Anak memilih energi, cuaca hati, dan keluhan fisik hari itu (didampingi orang tua bila perlu).",
                  ikon: Sun,
                },
                {
                  no: "02",
                  judul: "Asesmen & Peta TP",
                  isi: "BKT dan graf prasyarat menemukan titik mulai belajar yang pas dengan soal sesedikit mungkin.",
                  ikon: Compass,
                },
                {
                  no: "03",
                  judul: "Belajar & AI Tutor",
                  isi: "Kartu belajar bersuara dan penjelasan miskonsepsi yang ramah anak saat menjawab keliru.",
                  ikon: BookOpen,
                },
                {
                  no: "04",
                  judul: "Cek 'Masih Kuat?'",
                  isi: "Jeda otomatis untuk memastikan anak tidak kelelahan; sesi boleh berhenti kapan saja tanpa gagal.",
                  ikon: HeartHandshake,
                },
                {
                  no: "05",
                  judul: "Jembatan Sekolah",
                  isi: "Capaian per Tujuan Pembelajaran (TP) dirangkum menjadi draf laporan Kurikulum Merdeka.",
                  ikon: Award,
                },
              ].map((step, i) => {
                const Ikon = step.ikon;
                return (
                  <div
                    key={step.no}
                    className="relative rounded-2xl border border-[#EDB664]/80 bg-gradient-to-b from-[#FFF7EA] to-[#FFFBF4] p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBD9B5] text-[#7F1D2B] border border-[#EDB664]">
                          <Ikon className="h-4 w-4 text-[#A82535]" />
                        </span>
                        <span className="font-mono text-xs font-bold text-[#D93A45]">
                          {step.no} {i < 4 ? "→" : "✦"}
                        </span>
                      </div>
                      <h3 className="mt-4 font-serif text-base font-bold text-[#4A1520]">
                        {step.judul}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#6E3B3B] leading-relaxed">
                        {step.isi}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: PENGALAMAN BELAJAR ANAK ("Bisa dilihat. Bisa didengar. Bisa dibaca pelan-pelan.")
        ===================================================================== */}
        <section
          id="ruang-belajar"
          className="py-16 sm:py-22 border-y border-[#EDB664]/60"
          style={{
            background:
              "linear-gradient(180deg, #FFF3DC 0%, #FBD9B5 50%, #FFF6E6 100%)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-8">
              <div className="lg:col-span-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                  PENGALAMAN BELAJAR MULTI-MODAL
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                  Bisa dilihat. Bisa didengar. Bisa dibaca pelan-pelan.
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-sm sm:text-base text-[#5C232C] leading-relaxed">
                  Dirancang hangat dan menenangkan—bukan seperti aplikasi rumah
                  sakit. Setiap instruksi memiliki tombol pembaca suara Bahasa
                  Indonesia, target sentuh besar (≥56 px), dan umpan balik yang
                  membangun rasa percaya diri.
                </p>
              </div>
            </div>

            <ShowcaseBelajarAnak />
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: PETA PRASYARAT & BKT ("Setiap anak punya peta. Tak harus punya tempo yang sama.")
        ===================================================================== */}
        <section id="peta-tp" className="py-16 sm:py-22 bg-[#FFFBF4]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-10">
              <div className="lg:col-span-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                  BAYESIAN KNOWLEDGE TRACING (BKT) & GRAF PRASYARAT
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                  Setiap anak punya peta. Tak harus punya tempo yang sama.
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-sm sm:text-base text-[#6E3B3B] leading-relaxed">
                  Anak yang tertinggal di Pecahan (Kelas 4) bisa jadi sebenarnya
                  belum kuat di Perkalian (Kelas 3). Asesmen adaptif PELITA
                  menelusuri rantai prasyarat lintas kelas untuk menemukan{" "}
                  <strong className="text-[#7F1D2B]">Titik Mulai</strong> yang
                  tepat hanya dalam rata-rata 18 soal, bukan 44 soal.
                </p>
              </div>
            </div>

            {/* Banner Visual 3 Pulau Prasyarat (Seperti Gambar Referensi) */}
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#EDB664] shadow-[0_20px_50px_-15px_rgba(127,29,43,0.14)] min-h-[340px] p-6 sm:p-8 flex flex-col justify-between">
              <IlustrasiPetaPulau />

              {/* Label Atas Peta */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBF4]/95 px-3.5 py-1 text-xs font-bold text-[#7F1D2B] border border-[#EDB664] shadow-2xs">
                  🧭 Peta Petualangan Raka • Matematika Fase A–B
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#FFFBF4]/95 px-3 py-1 text-[11px] font-semibold text-[#8E1F2E] border border-[#EDB664]">
                    Menu: Kelasku & Pos Dasar
                  </span>
                </div>
              </div>

              {/* 3 Kartu Pos Pulau di Atas Ilustrasi */}
              <div className="relative z-10 my-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                {/* Pulau 1: Prasyarat Tercapai */}
                <div className="rounded-2xl border border-[#EDB664] bg-[#FFFBF4]/95 p-4 text-center shadow-md backdrop-blur-xs">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF4DF] text-[#8E1F2E] border border-[#EDB664]">
                    <CheckCircle2 className="h-5 w-5 text-[#F4813A]" />
                  </span>
                  <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#A82535]">
                    Pos Dasar • TP A4 & B2
                  </div>
                  <h3 className="mt-0.5 font-serif text-base font-bold text-[#4A1520]">
                    Penjumlahan & Pengurangan
                  </h3>
                  <p className="mt-1 text-xs text-[#6E3B3B]">
                    Status:{" "}
                    <strong className="text-[#7F1D2B]">
                      Tercapai ✓
                    </strong>{" "}
                    (Diuji & Disimpulkan)
                  </p>
                </div>

                {/* Pulau 2 (Tengah, Menonjol): Titik Mulai B3 */}
                <div className="rounded-2xl border-2 border-[#8E1F2E] bg-[#FFFBF4] p-5 text-center shadow-[0_14px_34px_rgba(127,29,43,0.22)] md:-translate-y-3">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FBD9B5] to-[#F4813A] text-[#FFFBF4] shadow-xs">
                    <Sparkles className="h-5 w-5 text-[#7F1D2B]" />
                  </span>
                  <div className="mt-2 inline-block rounded-full bg-[#FFF4DF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D93A45] border border-[#EDB664]">
                    Titik Mulai Raka • TP B3
                  </div>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#4A1520]">
                    Perkalian Bilangan Cacah
                  </h3>
                  <p className="mt-1 text-xs text-[#6E3B3B]">
                    Modul Jembatan aktif di{" "}
                    <strong className="text-[#8E1F2E]">Pos Dasar</strong>
                  </p>
                </div>

                {/* Pulau 3: Target Kelasku */}
                <div className="rounded-2xl border border-[#EDB664] bg-[#FFFBF4]/95 p-4 text-center shadow-md backdrop-blur-xs">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF4DF] text-[#7F1D2B] border border-[#EDB664]">
                    <Compass className="h-5 w-5 text-[#A82535]" />
                  </span>
                  <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#A82535]">
                    Kelasku (Kelas 4) • TP B7
                  </div>
                  <h3 className="mt-0.5 font-serif text-base font-bold text-[#4A1520]">
                    Pecahan Senilai
                  </h3>
                  <p className="mt-1 text-xs text-[#6E3B3B]">
                    Terbuka otomatis setelah Pos Dasar B3 selesai
                  </p>
                </div>
              </div>
            </div>

            {/* Banner Callout Keemasan di Bawah Peta (Seperti Gambar Referensi) */}
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#EDB664] bg-gradient-to-r from-[#FFF4DF] via-[#FBD9B5]/70 to-[#F8C99A]/70 px-5 py-4">
              <div className="flex items-center gap-3.5">
                <MascotPijar ekspresi="idle" ukuran="sm" />
                <div>
                  <h4 className="text-sm font-bold text-[#4A1520]">
                    &ldquo;3 pos lagi menuju Pecahan!&rdquo; — Bingkai positif
                    tanpa label tertinggal
                  </h4>
                  <p className="text-xs text-[#6E3B3B]">
                    Saat fase pengobatan intensif, peta otomatis menyaring hanya
                    TP berlabel <em>esensial_transisi</em> (prinsip ATP Transisi).
                  </p>
                </div>
              </div>
              <Link
                href="/anak/asesmen"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#8E1F2E] bg-[#FFFBF4] px-4 py-2 text-xs font-bold text-[#7F1D2B] hover:bg-[#8E1F2E] hover:text-[#FFFBF4] transition-colors"
              >
                <span>Putar Demo Asesmen</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 7: PENDAMPING & LAPORAN SEKOLAH ("Kemajuan kecil, lebih mudah dipahami bersama.")
        ===================================================================== */}
        <section
          id="pendamping"
          className="py-16 sm:py-22 border-t border-[#EDB664]/60"
          style={{
            background:
              "linear-gradient(180deg, #FFF6E6 0%, #FFFBF4 100%)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Kolom Kiri: Penjelasan & Ringkasan Status TP */}
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                  DASHBOARD ORANG TUA, GURU & SEKOLAH ASAL
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                  Kemajuan kecil, lebih mudah dipahami bersama.
                </h2>
                <p className="text-sm sm:text-base text-[#6E3B3B] leading-relaxed">
                  Orang tua tidak perlu menebak harus mengajar apa di rumah.
                  Dashboard pendamping menyajikan tren kondisi harian, kartu{" "}
                  <strong className="text-[#7F1D2B]">Perlu Perhatian</strong>,
                  serta daftar <strong className="text-[#7F1D2B]">Keputusan Menunggu</strong>{" "}
                  untuk setiap persetujuan penting.
                </p>

                {/* Kartu Ringkasan Progres per TP (Status, Bukan Persen) */}
                <div className="rounded-2xl border-2 border-[#EDB664]/80 bg-[#FFFBF4] p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2D5B0]">
                    <span className="text-xs font-bold text-[#4A1520]">
                      Ringkasan Progres TP Raka
                    </span>
                    <span className="rounded-full bg-[#FFF4DF] px-2.5 py-0.5 text-[10px] font-semibold text-[#8E1F2E] border border-[#EDB664]">
                      Status Kurikulum (Bukan %)
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="font-medium text-[#4A1520]">
                        TP A4 & B2 • Penjumlahan Cacah
                      </span>
                      <span className="rounded-full bg-[#FBD9B5]/70 px-2.5 py-0.5 font-bold text-[#7F1D2B]">
                        Tercapai ✓
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-t border-[#F2D5B0]/60">
                      <span className="font-medium text-[#4A1520]">
                        TP B3 • Perkalian s.d. 100
                      </span>
                      <span className="rounded-full bg-[#EDB664]/45 px-2.5 py-0.5 font-bold text-[#8E1F2E]">
                        Jembatan (Pos Dasar)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-t border-[#F2D5B0]/60">
                      <span className="font-medium text-[#4A1520]">
                        Tren Check-in 7 Hari Terakhir
                      </span>
                      <span className="rounded-full bg-[#F4813A]/20 px-2.5 py-0.5 font-bold text-[#A82535] border border-[#F4813A]/40">
                        Perlu Perhatian (3x Lemas)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6E3B3B]">
                  <Lock className="h-3.5 w-3.5 text-[#8E1F2E] shrink-0" />
                  <span>
                    Dilindungi PIN Pendamping di server • Akses terpisah antara
                    Orang Tua dan Guru Pendamping.
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: Kartu Draf Laporan Sekolah Buatan AI */}
              <div className="lg:col-span-7">
                <div className="rounded-[2rem] border-2 border-[#EDB664] bg-[#FFFBF4] p-6 sm:p-8 shadow-[0_22px_55px_-15px_rgba(127,29,43,0.14)]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A82535]">
                        JEMBATAN KE SEKOLAH ASAL
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A1520]">
                        Ringkasan Capaian Kurikulum Merdeka
                      </h3>
                    </div>
                    <Link
                      href="/pendamping/laporan"
                      className="rounded-full bg-[#FFF4DF] px-3 py-1 text-xs font-semibold text-[#7F1D2B] border border-[#EDB664] hover:bg-[#FBD9B5]/60 transition-colors"
                    >
                      Buka Halaman Laporan
                    </Link>
                  </div>

                  {/* Label Wajib sesuai PRD: "Draf dibuat AI — periksa sebelum dikirim" */}
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#EDB664] bg-gradient-to-r from-[#FFF4DF] to-[#FBD9B5]/65 px-4 py-2.5 text-xs font-semibold text-[#7F1D2B]">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#F4813A]" />
                    <span>
                      Draf dibuat AI — periksa dan sunting sebelum dikirim ke
                      wali kelas sekolah asal
                    </span>
                  </div>

                  {/* Metadata Siswa */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-[#FFF7EA] p-3.5 border border-[#EDB664]/50 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-[#A82535]">
                        Nama Siswa & Fase
                      </div>
                      <div className="mt-0.5 font-semibold text-[#4A1520]">
                        Raka (Data Contoh) • Kelas 4 (Fase B)
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-[#A82535]">
                        Acuan Kurikulum
                      </div>
                      <div className="mt-0.5 font-semibold text-[#4A1520]">
                        CP BSKAP No. 046/H/KR/2025 • Matematika
                      </div>
                    </div>
                  </div>

                  {/* Isi Draf Deskripsi Capaian */}
                  <div className="mt-4 rounded-2xl border border-[#EDB664]/80 bg-[#FFFDF9] p-4 text-xs sm:text-sm text-[#4A1520] leading-relaxed">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E1F2E] mb-1.5">
                      Deskripsi Capaian Tujuan Pembelajaran (TP):
                    </div>
                    <p>
                      &ldquo;Ananda Raka telah menunjukkan penguasaan yang baik
                      pada konsep nilai tempat bilangan cacah sampai 10.000
                      serta operasi penjumlahan dan pengurangan (TP A1–A8, B1,
                      B2). Saat ini ananda sedang memperkuat pemahaman konsep
                      perkalian bilangan cacah sampai 100 menggunakan bantuan
                      kelompok benda konkret (TP B3) pada modul jembatan dengan
                      penyesuaian durasi belajar harian selama masa
                      pemeliharaan.&rdquo;
                    </p>
                  </div>

                  {/* Tombol Sunting & Cetak PDF */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-[#6E3B3B]">
                      Sebagai bukti asesmen bagi sekolah asal (bukan pengganti
                      rapor resmi)
                    </span>
                    <div className="flex items-center gap-2.5">
                      <Link
                        href="/pendamping/laporan"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#EDB664] bg-[#FFF4DF] px-3.5 py-2 text-xs font-semibold text-[#7F1D2B] hover:bg-[#FBD9B5]/60 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Sunting Draf</span>
                      </Link>
                      <Link
                        href="/pendamping/laporan"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#8E1F2E] px-4 py-2 text-xs font-semibold text-[#FFFBF4] hover:bg-[#7F1D2B] transition-colors shadow-xs"
                      >
                        <Printer className="h-3.5 w-3.5 text-[#EDB664]" />
                        <span>Cetak / Simpan PDF</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 8: PRINSIP AI ("AI membantu, manusia memutuskan.")
            Kontras Marun-Keemasan sesuai referensi gambar & color-palette-api-merah-keemasan.md
        ===================================================================== */}
        <section
          id="prinsip-ai"
          className="py-16 sm:py-24 text-[#FFFBF4]"
          style={{
            background:
              "linear-gradient(180deg, #7F1D2B 0%, #8E1F2E 52%, #A82535 100%)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
              <div className="lg:col-span-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#EDB664]">
                  TATA KELOLA, ETIKA & KEAMANAN AI
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#FFFBF4] leading-tight">
                  AI membantu, manusia memutuskan.
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-sm sm:text-base text-[#FBD9B5] leading-relaxed">
                  Di setiap titik sensitif, PELITA memisahkan dengan tegas antara
                  perhitungan deterministik yang dapat diaudit dan pemodelan
                  bahasa generatif. LLM tidak pernah mengambil keputusan
                  keselamatan atau klinis.
                </p>
              </div>
            </div>

            {/* 3 Kolom Prinsip Tata Kelola */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-[#EDB664]/35 bg-[#7F1D2B]/55 p-6 backdrop-blur-xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDB664]/20 text-[#EDB664] border border-[#EDB664]/40">
                  <Scale className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-[#FFFBF4]">
                  Aturan Tetap untuk Keselamatan
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#FBD9B5]/90 leading-relaxed">
                  Penentuan beban belajar harian, munculnya cek{" "}
                  <em>&ldquo;Masih kuat?&rdquo;</em>, dan deteksi kata kunci
                  krisis dijalankan oleh algoritma aturan tetap yang teruji unit
                  test—bukan diserahkan pada keputusan LLM.
                </p>
              </div>

              <div className="rounded-2xl border border-[#EDB664]/35 bg-[#7F1D2B]/55 p-6 backdrop-blur-xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDB664]/20 text-[#EDB664] border border-[#EDB664]/40">
                  <Sliders className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-[#FFFBF4]">
                  Tinjauan Manusia & Parameter Berversi
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#FBD9B5]/90 leading-relaxed">
                  Soal buatan AI divalidasi kuncinya secara terprogram dan wajib
                  disetujui peninjau manusia sebelum berstatus{" "}
                  <code className="text-[#EDB664]">terbit</code>. Seluruh ambang
                  batas BKT diatur dalam rentang aman yang tercatat di log audit.
                </p>
              </div>

              <div className="rounded-2xl border border-[#EDB664]/35 bg-[#7F1D2B]/55 p-6 backdrop-blur-xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDB664]/20 text-[#EDB664] border border-[#EDB664]/40">
                  <EyeOff className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-[#FFFBF4]">
                  Minimisasi Data Pribadi Anak
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#FBD9B5]/90 leading-relaxed">
                  Anak bukan akun mandiri. Tidak ada penyimpanan diagnosis
                  penyakit, data obat, nomor HP anak, maupun transkrip obrolan
                  Teman Cerita. Pemanggilan AI dilakukan tanpa mengirim nama
                  atau ID anak.
                </p>
              </div>
            </div>

            {/* Banner Cerah Keemasan di Dalam Section Kontras (Seperti Gambar Referensi) */}
            <div className="mt-10 rounded-[1.75rem] border-2 border-[#EDB664] bg-gradient-to-r from-[#FFF6E5] via-[#FBD9B5] to-[#F8C99A] p-6 sm:p-8 text-[#4A1520] shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 flex items-center gap-4">
                  <div className="shrink-0">
                    <MascotPijar ekspresi="senang" ukuran="md" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A1520]">
                      Ketenangan untuk yang mendampingi.
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#5C232C] leading-relaxed">
                      Setiap keluaran AI memiliki batas waktu ketat (8 detik)
                      dengan jawaban cadangan terkurasi dan telemetri lengkap di
                      halaman Evaluasi AI.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#FFFBF4]/90 p-3.5 border border-[#EDB664]">
                    <div className="font-serif text-lg font-bold text-[#8E1F2E]">
                      95,4% Akurasi
                    </div>
                    <div className="text-[#6E3B3B] mt-0.5">
                      Kesesuaian status TP pada simulasi 2.000 siswa virtual
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FFFBF4]/90 p-3.5 border border-[#EDB664]">
                    <div className="font-serif text-lg font-bold text-[#8E1F2E]">
                      100% Terkendali
                    </div>
                    <div className="text-[#6E3B3B] mt-0.5">
                      Rujukan komunitas wajib disetujui Orang Tua/Wali
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 9: FAQ ("Hal yang mungkin ingin Anda tanyakan.")
        ===================================================================== */}
        <section id="faq" className="py-16 sm:py-22 bg-[#FFFBF4]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#A82535]">
                  TANYA JAWAB
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                  Hal yang mungkin ingin Anda tanyakan.
                </h2>
                <p className="mt-3 text-sm text-[#6E3B3B] leading-relaxed">
                  Penjelasan transparan tentang cara kerja asesmen adaptif,
                  batasan peran AI, dan perlindungan privasi keluarga di PELITA.
                </p>
              </div>

              <div className="lg:col-span-8">
                <AccordionFaq />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 10: PRE-FOOTER CTA ("Temani langkah kecilnya. Jaga cahaya belajarnya.")
        ===================================================================== */}
        <section
          className="py-14 sm:py-20 border-t border-[#EDB664]"
          style={{
            background:
              "linear-gradient(135deg, #FFF3DC 0%, #FBD9B5 40%, #F8C99A 75%, #EDB664 100%)",
          }}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <MascotPijar ekspresi="senang" ukuran="xl" />
              </div>

              <div className="md:col-span-8 text-center md:text-left space-y-4">
                <span className="inline-block rounded-full bg-[#FFFBF4]/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8E1F2E] border border-[#EDB664]">
                  PELITA • AGAR SAKIT TIDAK MEMADAMKAN CAHAYA BELAJAR MEREKA
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1520] leading-tight">
                  Temani langkah kecilnya. Jaga cahaya belajarnya.
                </h2>
                <p className="text-sm sm:text-base text-[#5C232C] max-w-2xl leading-relaxed">
                  Jelajahi alur lengkap Raka (Siswa Kelas 4), Ibu Sari
                  (Orang Tua Pendamping), serta panel tata kelola AI Admin
                  langsung di prototipe interaktif kami.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-[#8E1F2E] px-6 py-3 text-sm font-semibold text-[#FFFBF4] shadow-[0_10px_24px_rgba(127,29,43,0.3)] hover:bg-[#7F1D2B] transition-all"
                  >
                    <span>Masuk Akun Demo</span>
                    <ArrowRight className="h-4 w-4 text-[#EDB664]" />
                  </Link>
                  <Link
                    href="/anak/asesmen"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#7F1D2B]/30 bg-[#FFFBF4]/90 px-5 py-2.5 text-sm font-semibold text-[#7F1D2B] hover:bg-[#FFFBF4] transition-colors"
                  >
                    <span>Simulasi Asesmen BKT</span>
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
      <footer className="border-t border-[#EDB664]/60 bg-[#FFFBF4] py-12 text-xs text-[#6E3B3B]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#F2D5B0]">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBD9B5] to-[#EDB664] border border-[#8E1F2E]/20">
                  <Sparkles className="h-4 w-4 text-[#7F1D2B]" />
                </span>
                <span className="font-serif text-lg font-bold text-[#7F1D2B]">
                  PELITA
                </span>
              </div>
              <p className="max-w-sm leading-relaxed text-[#6E3B3B]">
                Platform Belajar Adaptif Berbasis AI yang Menyesuaikan Kondisi
                Kesehatan Harian untuk Menjaga Keberlanjutan Pendidikan Anak
                dengan Penyakit Kronis.
              </p>
              <p className="text-[11px] text-[#8E1F2E] font-medium">
                Hackathon FIRETECH 2026 • Harmonizing Tech and Humanity
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#4A1520]">
                Alur Anak
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/anak/checkin" className="hover:text-[#8E1F2E]">
                    Check-in Harian
                  </Link>
                </li>
                <li>
                  <Link href="/anak/asesmen" className="hover:text-[#8E1F2E]">
                    Asesmen Adaptif
                  </Link>
                </li>
                <li>
                  <Link href="/anak/peta" className="hover:text-[#8E1F2E]">
                    Peta Kelasku & Pos Dasar
                  </Link>
                </li>
                <li>
                  <Link href="/anak/sesi/B3" className="hover:text-[#8E1F2E]">
                    Sesi Belajar TP B3
                  </Link>
                </li>
                <li>
                  <Link
                    href="/anak/teman-cerita"
                    className="hover:text-[#8E1F2E]"
                  >
                    Teman Cerita
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#4A1520]">
                Pendamping
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/login" className="hover:text-[#8E1F2E]">
                    Login Akun Demo
                  </Link>
                </li>
                <li>
                  <Link href="/pilih-profil" className="hover:text-[#8E1F2E]">
                    Layar Pilih Profil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pendamping/dashboard"
                    className="hover:text-[#8E1F2E]"
                  >
                    Dashboard Ibu Sari
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pendamping/laporan"
                    className="hover:text-[#8E1F2E]"
                  >
                    Laporan Kurikulum Merdeka
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#4A1520]">
                Tata Kelola Admin (Q&A)
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/admin/aturan-ai"
                    className="hover:text-[#8E1F2E]"
                  >
                    Aturan & Parameter AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/bank-soal"
                    className="hover:text-[#8E1F2E]"
                  >
                    Bank Soal & Tinjauan AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/evaluasi-ai"
                    className="hover:text-[#8E1F2E]"
                  >
                    Evaluasi Kinerja AI
                  </Link>
                </li>
                <li>
                  <Link href="/admin/eskalasi" className="hover:text-[#8E1F2E]">
                    Antrean Eskalasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/log-aktivitas"
                    className="hover:text-[#8E1F2E]"
                  >
                    Log Aktivitas Audit
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6E3B3B]">
            <span>
              © 2026 Tim PELITA. Seluruh data siswa pada mode demo menggunakan
              nama samaran.
            </span>
            <span>
              Prinsip Utama: &ldquo;AI membantu, manusia memutuskan.&rdquo;
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
