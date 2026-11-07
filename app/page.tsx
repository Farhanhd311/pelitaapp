import Link from "next/link";
import {
  ArrowRight,
  Scale,
  EyeOff,
  Sliders,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { MascotPijar } from "@/components/anak/MascotPijar";
import {
  RevealSection,
  HoverCard,
  BintangKilau,
  SapuanCahayaEmas,
  ScrollProgressBar,
  HeroLangitParallax,
  DekorasiLangitCerah,
  HeroEditorialBawah,
  TombolKembaliKeAtas,
  RoadmapAlurBelajar,
  ShowcaseBelajarAnak,
  AccordionFaq,
} from "@/components/landing/InteraktifLanding";

export default function Beranda() {
  return (
    <div className="min-h-dvh w-full flex flex-col bg-[#FCEBD4] text-teks font-sans selection:bg-emas/40 selection:text-teks overflow-x-hidden">
      <ScrollProgressBar />
      <TombolKembaliKeAtas />

      {/* =====================================================================
          SECTION 1: FULL-VIEWPORT HERO (Tanpa Header, Tanpa Angka Kanan, Tanpa URL Anchor)
      ===================================================================== */}
      <section className="relative min-h-dvh w-full flex flex-col justify-between pt-10 sm:pt-14 pb-10 sm:pb-14">
        <HeroLangitParallax />

        {/* AREA TENGAH HERO: MASKOT BESAR JAUH DI TEPI KIRI & KANAN, TULISAN TENGAH LEGA TANPA TERHIMPIT */}
        <div className="relative z-10 flex-1 flex items-center justify-center mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
          <RevealSection className="relative w-full flex items-center justify-center text-center">
            {/* Maskot Kiri Jauh di Tepi Kiri Layar */}
            <div className="hidden lg:flex pointer-events-none absolute left-0 xl:left-4 2xl:left-8 top-1/2 -translate-y-1/2 items-center justify-center">
              <MascotPijar
                ekspresi="sambut"
                gerak="idle"
                ukuran={220}
                className="scale-90 xl:scale-100 drop-shadow-[0_18px_34px_rgba(234,123,48,0.24)]"
              />
            </div>

            {/* Blok Tulisan Tengah Hero Section (Bebas Penuh di Tengah Tanpa Terhimpit) */}
            <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center text-center space-y-5 sm:space-y-6 px-2">
              {/* Baris Maskot Ringkas untuk Layar Mobile/Tablet (<1024px) */}
              <div className="flex lg:hidden items-center justify-center gap-6">
                <MascotPijar ekspresi="sambut" gerak="idle" ukuran={88} />
                <MascotPijar ekspresi="semangat" gerak="idle" ukuran={88} />
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-[72px] xl:text-[80px] font-extrabold uppercase tracking-tight leading-[1.03]">
                <span className="block text-teks sm:whitespace-nowrap">
                  CAHAYA BELAJAR,
                </span>
                <span className="block bg-gradient-to-r from-[#EA7B30] via-[#D85C2A] to-[#BF4338] bg-clip-text text-transparent mt-1 sm:whitespace-nowrap">
                  TETAP MENYALA.
                </span>
              </h1>

              {/* Paragraf Pengantar Singkat & Terpusat */}
              <p className="mx-auto max-w-xl text-sm sm:text-base md:text-lg text-teks-2 leading-relaxed font-medium">
                Ruang belajar ramah untuk anak SD dalam masa pemulihan yang
                menyesuaikan tenaga harian dan terhubung ke sekolah asal.
              </p>

              {/* Tombol Aksi Utama Terpusat */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-[14px] bg-emas px-6 py-3.5 text-sm font-extrabold text-teks hover:bg-[#D89B3E] transition-colors shadow-2xs"
                >
                  <span>Mulai Bersama PELITA</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Maskot Kanan Jauh di Tepi Kanan Layar */}
            <div className="hidden lg:flex pointer-events-none absolute right-0 xl:right-4 2xl:right-8 top-1/2 -translate-y-1/2 items-center justify-center">
              <MascotPijar
                ekspresi="semangat"
                gerak="idle"
                ukuran={220}
                className="scale-90 xl:scale-100 drop-shadow-[0_18px_34px_rgba(234,123,48,0.24)]"
              />
            </div>
          </RevealSection>
        </div>

        {/* BARIS BAWAH HERO: 3 KOLOM EDITORIAL TERBUKA + GARIS PROGRES HORIZONTAL */}
        <RevealSection delay={0.14}>
          <HeroEditorialBawah />
        </RevealSection>
      </section>

      <main className="flex-1 w-full">
        {/* =====================================================================
            SECTION 2: EMPATI & KONTEKS ("Rutinitas boleh berubah. Rasa ingin tahu tetap punya tempat.")
        ===================================================================== */}
        <section className="relative w-full py-16 sm:py-24">
          <RevealSection className="mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              <div className="lg:col-span-5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-teks-2">
                  MENGAPA PELITA HADIR
                </span>
                <h2 className="mt-2.5 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-teks leading-snug">
                  Rutinitas boleh berubah. Rasa ingin tahu tetap punya tempat.
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                <p>
                  Pengobatan penyakit kronis pada anak dapat berlangsung dua
                  hingga tiga tahun dengan jadwal istirahat dan perawatan yang
                  berulang. Sering kali tugas sekolah diberikan begitu saja
                  tanpa melihat apakah hari itu anak sedang bugar atau sedang
                  lelah, sementara satu materi dasar yang terlewat membuat anak
                  kurang percaya diri saat kembali ke kelas.
                </p>

                <div className="pt-2">
                  <p className="rounded-[16px] bg-[#F7DEC0] px-5 py-3.5 text-sm sm:text-base font-extrabold text-teks border border-[#E5B97F]/70">
                    Setiap anak yang sedang berjuang memulihkan kesehatannya
                    juga berhak dijaga semangat dan masa sekolahnya.
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* =====================================================================
            SECTION 3: ADAPTIF KONDISI HARIAN ("Yang disesuaikan adalah langkahnya. Bukan harapannya.")
        ===================================================================== */}
        <section
          id="adaptif-kondisi"
          className="relative w-full py-16 sm:py-24"
        >
          <DekorasiLangitCerah varian="satu" />
          <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            {/* Header Terpusat (Center-Aligned) */}
            <RevealSection className="relative mx-auto max-w-3xl text-center mb-12 space-y-3.5">
              <BintangKilau
                varian={2}
                ukuran={34}
                delay={0.3}
                className="absolute -top-3 left-2 sm:left-4 scale-75 sm:scale-100"
              />
              <BintangKilau
                varian={3}
                ukuran={28}
                delay={1.2}
                className="absolute top-6 right-2 sm:right-4 scale-75 sm:scale-100"
              />
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teks-2">
                BELAJAR ADAPTIF KONDISI HARIAN
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                Yang disesuaikan adalah langkahnya. Bukan harapannya.
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                Durasi belajar, tampilan materi, dan pembacaan suara
                menyesuaikan tenaga serta suasana hati anak pada hari itu agar
                belajar terasa menenangkan.
              </p>
            </RevealSection>

            {/* 3 Pilar Informasi Adaptif Kondisi Harian */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  no: "01",
                  judul: "Durasi mengikuti tenaga anak hari itu",
                  isi: "Ketika anak sedang bersemangat, ia dapat mempelajari materi baru. Namun saat sedang lemas atau mata lelah, kegiatan belajar beralih ke cerita suara singkat selama 5 hingga 10 menit.",
                  tag: "Empat pilihan ritme belajar harian",
                },
                {
                  no: "02",
                  judul: "Hari istirahat tidak pernah dihukum",
                  isi: "Target belajar dihitung secara mingguan dan fleksibel. Ketika anak membutuhkan waktu istirahat penuh, kemajuannya tetap terjaga dengan aman tanpa beban ketertinggalan.",
                  tag: "Belajar tenang tanpa tekanan",
                },
                {
                  no: "03",
                  judul: "Kabar perhatian untuk orang tua dan guru",
                  isi: "Apabila anak merasa lemas atau kurang nyaman selama beberapa hari berturut-turut, dashboard pendamping menampilkan pengingat hangat agar keluarga dapat menyesuaikan pendampingan.",
                  tag: "Komunikasi hangat bersama keluarga",
                },
              ].map((item, idx) => (
                <RevealSection key={item.no} delay={idx * 0.08}>
                  <HoverCard className="h-full rounded-[22px] bg-[#FCECD7] p-6 sm:p-7 border border-[#E5B97F]/70 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emas font-heading text-xs font-extrabold text-teks">
                        {item.no}
                      </span>
                      <h3 className="mt-4 font-heading text-lg font-extrabold text-teks leading-snug">
                        {item.judul}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-teks-2 leading-relaxed">
                        {item.isi}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-[#E5B97F]/50 text-xs font-extrabold text-teks">
                      {item.tag}
                    </div>
                  </HoverCard>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: ROADMAP ALUR BELAJAR HARIAN ("Satu perjalanan kecil. Selalu ada yang menemani.")
        ===================================================================== */}
        <section
          id="cara-kerja"
          className="relative w-full py-16 sm:py-24"
        >
          <DekorasiLangitCerah varian="dua" />
          <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            <RevealSection className="relative mx-auto max-w-3xl text-center space-y-3.5">
              <BintangKilau
                varian={1}
                ukuran={32}
                delay={0.2}
                className="absolute -top-3 left-2 sm:left-6 scale-75 sm:scale-100"
              />
              <BintangKilau
                varian={3}
                ukuran={28}
                delay={1.0}
                className="absolute top-4 right-2 sm:right-6 scale-75 sm:scale-100"
              />
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teks-2">
                ALUR BELAJAR HARIAN
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                Satu perjalanan kecil. Selalu ada yang menemani.
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                Lima langkah terhubung yang mendampingi anak dari awal membuka
                aplikasi hingga kemajuannya siap diteruskan ke sekolah asal.
              </p>
            </RevealSection>

            <RoadmapAlurBelajar />
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: PENGALAMAN BELAJAR ANAK ("Bisa dilihat. Bisa didengar. Bisa dibaca pelan-pelan.")
        ===================================================================== */}
        <section
          id="ruang-belajar"
          className="relative w-full py-16 sm:py-24"
        >
          <DekorasiLangitCerah varian="tiga" />
          <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            {/* Header Terpusat (Center-Aligned) */}
            <RevealSection className="relative mx-auto max-w-3xl text-center mb-10 space-y-3.5">
              <BintangKilau
                varian={2}
                ukuran={34}
                delay={0.4}
                className="absolute -top-2 left-2 scale-75 sm:scale-100"
              />
              <BintangKilau
                varian={4}
                ukuran={26}
                delay={1.3}
                className="absolute top-6 right-2 scale-75 sm:scale-100"
              />
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teks-2">
                RUANG BELAJAR RAMAH ANAK
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                Bisa dilihat. Bisa didengar. Bisa dibaca pelan-pelan.
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                Setiap materi disajikan lewat cerita bergambar, pembaca suara
                Bahasa Indonesia, dan pendampingan Pijar yang sabar membangun
                rasa percaya diri anak.
              </p>
            </RevealSection>

            <RevealSection delay={0.1}>
              <ShowcaseBelajarAnak />
            </RevealSection>
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: PETA BELAJAR ("Setiap anak punya peta. Tak harus punya tempo yang sama.")
        ===================================================================== */}
        <section
          id="peta-tp"
          className="relative w-full py-16 sm:py-24"
        >
          <DekorasiLangitCerah varian="satu" />
          <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            {/* Header Terpusat (Center-Aligned) */}
            <RevealSection className="mx-auto max-w-3xl text-center mb-12 space-y-3.5">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teks-2">
                PETA BELAJAR & POS DASAR
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                Setiap anak punya peta. Tak harus punya tempo yang sama.
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium pt-1">
                Jika ada materi dari kelas sebelumnya yang belum kuat, PELITA
                menyiapkan jembatan belajar di Pos Dasar sebelum anak
                melanjutkan materi kelasnya.
              </p>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                Anak yang kesulitan di materi Pecahan bisa jadi hanya perlu
                menguatkan kembali konsep Perkalian. Dengan mengenali bagian
                dasar yang terlewat, anak dapat mengejar pelajaran dengan
                langkah yang ringan.
              </p>
            </RevealSection>

            {/* Kotak Peta 3 Kartu */}
            <RevealSection delay={0.08}>
              <div className="rounded-[24px] border border-[#E2B378] bg-[#F9E3C4] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                  <span className="inline-flex items-center rounded-full bg-emas px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teks">
                    Contoh Peta Belajar Raka
                  </span>
                  <span className="rounded-full bg-[#FCECD7] px-3.5 py-1 text-xs font-bold text-teks-2 border border-[#E2B378]">
                    Matematika Sekolah Dasar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <HoverCard className="rounded-[18px] bg-[#FCECD7] p-5 border border-[#E5B97F]/60">
                    <div className="font-heading text-base sm:text-lg font-extrabold text-teks">
                      Operasi Dasar
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-teks-2">
                      Penjumlahan dan Pengurangan Bilangan
                    </p>
                    <span className="mt-3.5 inline-block rounded-full bg-[#F2C995] px-3 py-1 text-xs font-extrabold text-teks">
                      Sudah Dikuasai
                    </span>
                  </HoverCard>

                  <HoverCard className="rounded-[18px] bg-[#FCECD7] p-5 border-2 border-emas">
                    <div className="font-heading text-base sm:text-lg font-extrabold text-teks">
                      Perkalian Dasar
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-teks-2">
                      Perkalian lewat Kelompok Benda Nyata
                    </p>
                    <span className="mt-3.5 inline-block rounded-full bg-emas px-3 py-1 text-xs font-extrabold text-teks">
                      Sedang Dipelajari di Pos Dasar
                    </span>
                  </HoverCard>

                  <HoverCard className="rounded-[18px] bg-[#FCECD7] p-5 border border-[#E5B97F]/60">
                    <div className="font-heading text-base sm:text-lg font-extrabold text-teks">
                      Pecahan Dasar
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-teks-2">
                      Mengenal Pecahan Senilai di Kelas 4
                    </p>
                    <span className="mt-3.5 inline-block rounded-full bg-[#F2C995]/70 px-3 py-1 text-xs font-bold text-teks-2">
                      Tujuan Berikutnya
                    </span>
                  </HoverCard>
                </div>

                <p className="mt-5 text-xs text-teks-2 font-medium">
                  Selama masa perawatan intensif, peta belajar otomatis
                  menampilkan materi-materi inti yang paling penting agar anak
                  tidak terbebani.
                </p>
              </div>
            </RevealSection>

            {/* Banner Emas Bawah Peta */}
            <RevealSection delay={0.14}>
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] bg-emas p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#FCECD7]">
                    <MascotPijar ekspresi="semangat" gerak="idle" ukuran={48} />
                  </div>
                  <div>
                    <h4 className="font-heading text-base sm:text-lg font-extrabold text-teks">
                      Tidak ada label &ldquo;tertinggal&rdquo; di ruang belajar
                      anak.
                    </h4>
                    <p className="text-xs sm:text-sm text-teks/85 font-medium">
                      Setiap langkah dibingkai dengan kalimat penyemangat:
                      &ldquo;Tiga pos lagi menuju materi Pecahan!&rdquo;
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full bg-[#FCECD7] px-4 py-1.5 text-xs font-extrabold text-teks">
                  Menu Kelasku & Pos Dasar
                </span>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* =====================================================================
            SECTION 7: PENDAMPING & SEKOLAH ("Kemajuan kecil, lebih mudah dipahami bersama.")
        ===================================================================== */}
        <section
          id="pendamping"
          className="relative w-full py-16 sm:py-24"
        >
          <DekorasiLangitCerah varian="tiga" />
          <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Kolom Kiri */}
              <RevealSection className="lg:col-span-5 space-y-5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-teks-2">
                  PENDAMPING & SEKOLAH ASAL
                </span>
                <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                  Kemajuan kecil, lebih mudah dipahami bersama.
                </h2>
                <p className="text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                  Orang tua tidak perlu menebak materi apa yang harus diajarkan
                  di rumah. Perkembangan anak dirangkum dengan status yang
                  mudah dipahami oleh keluarga maupun guru di sekolah.
                </p>

                {/* Kartu Ringkasan Belajar Raka */}
                <HoverCard className="rounded-[20px] bg-[#FCECD7] p-6 border border-[#E5B97F]/70">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5B97F]/50">
                    <span className="font-heading text-sm font-extrabold text-teks">
                      Ringkasan Belajar Raka
                    </span>
                    <span className="rounded-full bg-[#F2C995] px-3 py-0.5 text-xs font-extrabold text-teks">
                      Data Contoh
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-3 text-xs sm:text-sm font-semibold">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-teks-2">
                        Penjumlahan & Pengurangan
                      </span>
                      <span className="rounded-full bg-[#F2C995] px-3 py-0.5 text-xs font-extrabold text-teks">
                        Tercapai
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-teks-2">Perkalian Dasar</span>
                      <span className="rounded-full bg-emas px-3 py-0.5 text-xs font-extrabold text-teks">
                        Jembatan Belajar
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-teks-2">Kondisi Minggu Ini</span>
                      <span className="rounded-full bg-[#F2C995] px-3 py-0.5 text-xs font-extrabold text-teks-2">
                        Perlu Perhatian
                      </span>
                    </div>
                  </div>
                </HoverCard>

                <p className="text-xs text-teks-2 font-semibold leading-relaxed">
                  Halaman orang tua dilindungi dengan kode PIN khusus agar
                  pengaturan waktu layar dan laporan tetap berada di bawah
                  kendali keluarga.
                </p>
              </RevealSection>

              {/* Kolom Kanan: Kartu Draf Laporan Sekolah */}
              <RevealSection delay={0.1} className="lg:col-span-7">
                <span className="inline-flex items-center rounded-full bg-emas px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teks mb-3">
                  Jembatan ke Sekolah
                </span>

                <HoverCard className="rounded-[24px] bg-[#FCECD7] p-6 sm:p-8 border border-[#E5B97F]/70 shadow-[0_12px_32px_rgba(74,21,32,0.06)]">
                  <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-teks">
                    Draf Laporan untuk Sekolah Asal
                  </h3>

                  {/* Bar Emas: Label Wajib */}
                  <div className="mt-3.5 rounded-[12px] bg-emas px-4 py-2.5 text-xs sm:text-sm font-extrabold text-teks">
                    Draf laporan disusun otomatis dan diperiksa orang tua
                    sebelum dikirim
                  </div>

                  {/* Field Tujuan Pembelajaran */}
                  <div className="mt-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-teks-2">
                      Materi Pembelajaran
                    </div>
                    <div className="mt-1.5 rounded-[12px] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-teks border border-[#E5B97F]">
                      Perkalian Bilangan Cacah sampai 100 (Kelas 3–4)
                    </div>
                  </div>

                  {/* Field Deskripsi Capaian */}
                  <div className="mt-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-teks-2">
                      Deskripsi Capaian Kurikulum Merdeka
                    </div>
                    <div className="mt-1.5 rounded-[14px] border border-[#C87D4B]/60 bg-[#FDF6EC] p-4 text-xs sm:text-sm text-teks leading-relaxed font-medium">
                      Ananda Raka menunjukkan penguasaan yang baik pada operasi
                      penjumlahan dan pengurangan bilangan cacah. Saat ini
                      ananda sedang memperkuat konsep perkalian menggunakan
                      bantuan kelompok benda nyata dengan penyesuaian durasi
                      belajar harian selama masa pemulihan.
                    </div>
                  </div>

                  {/* Informasi Fitur Laporan */}
                  <div className="mt-4 pt-3 border-t border-[#E5B97F]/50 flex flex-wrap items-center gap-3 text-xs font-bold text-teks-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7DEC0] px-3.5 py-1 text-teks">
                      <CheckCircle2 className="h-3.5 w-3.5 text-bata" />
                      Dapat disunting orang tua dan guru pendamping
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7DEC0] px-3.5 py-1 text-teks">
                      <FileText className="h-3.5 w-3.5 text-bata" />
                      Siap dicetak atau disimpan sebagai PDF
                    </span>
                  </div>
                </HoverCard>

                <p className="mt-3 text-xs text-teks-2 font-medium">
                  Laporan capaian belajar disusun mengikuti panduan Kurikulum
                  Merdeka sehingga dapat digunakan wali kelas sebagai bukti
                  perkembangan belajar anak.
                </p>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 8: PRINSIP PENDAMPINGAN ("AI membantu, manusia memutuskan.")
        ===================================================================== */}
        <section
          id="prinsip-ai"
          className="relative w-full py-16 sm:py-24"
        >
          <DekorasiLangitCerah varian="dua" />
          <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            {/* Header Terpusat (Center-Aligned) */}
            <RevealSection className="relative mx-auto max-w-3xl text-center mb-12 space-y-3.5">
              <BintangKilau
                varian={2}
                ukuran={34}
                delay={0.2}
                className="absolute -top-2 left-2 sm:left-4 scale-75 sm:scale-100"
              />
              <BintangKilau
                varian={3}
                ukuran={28}
                delay={1.1}
                className="absolute top-6 right-2 sm:right-4 scale-75 sm:scale-100"
              />
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teks-2">
                PRINSIP KEAMANAN & ETIKA
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                AI membantu, manusia memutuskan.
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium pt-1">
                Teknologi hadir untuk meringankan langkah belajar anak dan
                memudahkan orang tua, sementara setiap keputusan penting tetap
                berada di tangan keluarga dan pendidik.
              </p>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-teks-2 leading-relaxed font-medium">
                Seluruh materi soal yang tampil kepada anak telah melalui
                peninjauan pendidik, dan setiap dukungan pendampingan
                memerlukan persetujuan langsung dari orang tua.
              </p>
            </RevealSection>

            {/* 3 Kolom Prinsip Bersih */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  ikon: Scale,
                  judul: "Kenyamanan anak selalu diutamakan",
                  isi: "Penyesuaian durasi belajar harian dan jeda istirahat bekerja secara konsisten untuk menjaga agar anak tidak pernah kelelahan.",
                },
                {
                  ikon: Sliders,
                  judul: "Ditinjau dan disetujui manusia",
                  isi: "Setiap materi latihan ditinjau terlebih dahulu oleh pendidik sebelum diberikan kepada anak, dan rujukan dukungan selalu meminta izin orang tua.",
                },
                {
                  ikon: EyeOff,
                  judul: "Menjaga privasi keluarga",
                  isi: "Tidak pernah menyimpan diagnosis penyakit, catatan medis, ataupun isi percakapan pribadi anak di dalam aplikasi.",
                },
              ].map((item, idx) => {
                const Ikon = item.ikon;
                return (
                  <RevealSection key={item.judul} delay={idx * 0.08}>
                    <HoverCard className="h-full rounded-[22px] bg-[#FCECD7] p-6 border border-[#E5B97F]/70 text-center flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7DEC0] border border-[#E2B378]">
                        <Ikon className="h-6 w-6 text-bata" />
                      </div>
                      <h3 className="mt-4 font-heading text-lg font-extrabold text-teks">
                        {item.judul}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-teks-2 leading-relaxed">
                        {item.isi}
                      </p>
                    </HoverCard>
                  </RevealSection>
                );
              })}
            </div>

            {/* Banner Emas dengan Kotak Pijar di Kiri */}
            <RevealSection delay={0.14}>
              <div className="mt-10 rounded-[24px] bg-emas p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-6 flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-[#FCECD7]">
                      <MascotPijar ekspresi="tenang" gerak="idle" ukuran={68} />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg sm:text-2xl font-extrabold text-teks">
                        Ketenangan untuk yang mendampingi.
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-teks/85 leading-relaxed font-medium">
                        Dirancang bersama prinsip perlindungan anak agar orang
                        tua dan guru dapat mendampingi dengan tenang.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-6 text-xs sm:text-sm text-teks/90 leading-relaxed font-medium">
                    Anak dapat belajar sesuai kondisinya hari itu, orang tua
                    memegang kendali penuh atas pengaturan keluarga, dan sekolah
                    asal menerima gambaran capaian belajar yang utuh.
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* =====================================================================
            SECTION 9: FAQ ("Hal yang mungkin ingin Anda tanyakan.")
        ===================================================================== */}
        <section id="faq" className="relative w-full py-16 sm:py-24">
          <RevealSection className="mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-teks-2">
                  TANYA JAWAB
                </span>
                <h2 className="mt-2.5 font-heading text-2xl sm:text-4xl font-extrabold text-teks leading-tight">
                  Hal yang mungkin ingin Anda tanyakan.
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-teks-2 leading-relaxed font-medium">
                  Penjelasan singkat mengenai cara kerja adaptif, privasi
                  keluarga, dan hubungan dengan sekolah asal.
                </p>
              </div>

              <div className="lg:col-span-8">
                <AccordionFaq />
              </div>
            </div>
          </RevealSection>
        </section>

        {/* =====================================================================
            SECTION 10: PRE-FOOTER CTA ("Temani langkah kecilnya. Jaga cahaya belajarnya.")
        ===================================================================== */}
        <section className="relative w-full py-12 sm:py-20">
          {/* Pendaran cahaya blur di belakang kartu agar menyatu tanpa garis */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -bottom-24 inset-x-0"
            style={{
              background:
                "radial-gradient(ellipse 75% 50% at 50% 50%, rgba(234,123,48,0.28) 0%, rgba(243,180,72,0.14) 50%, rgba(252,235,212,0) 80%)",
            }}
          />

          <RevealSection className="relative z-10 mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#F08C3E] via-[#EA7B30] to-[#D86522] p-8 sm:p-12 lg:p-14 shadow-[0_24px_60px_rgba(216,101,34,0.22)]">
              {/* Ornamen Awan & Bintang di Dalam Kartu CTA */}
              <img
                src="/dekorasi/awan-11.webp"
                alt=""
                aria-hidden
                className="pointer-events-none select-none absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-32 sm:w-64 opacity-35"
              />
              <img
                src="/dekorasi/awan-12.webp"
                alt=""
                aria-hidden
                className="pointer-events-none select-none absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-32 sm:w-64 opacity-35"
              />
              <BintangKilau
                varian={2}
                ukuran={40}
                delay={0.2}
                className="absolute top-4 left-[6%] sm:top-6 sm:left-[8%] scale-75 sm:scale-100"
              />
              <BintangKilau
                varian={3}
                ukuran={34}
                delay={1.0}
                className="absolute bottom-6 right-[6%] sm:bottom-8 sm:right-[8%] scale-75 sm:scale-100"
              />
              <SapuanCahayaEmas
                lebar={110}
                delay={0.5}
                className="absolute top-6 right-[10%] sm:top-8 sm:right-[14%] scale-75 sm:scale-100"
              />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Kotak Krem Besar dengan Asset Pijar (Animasi Tenang, Tidak Bouncy) */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-[28px] bg-[#FFF5E6] shadow-[0_14px_34px_rgba(74,21,32,0.12)]">
                    <BintangKilau
                      varian={1}
                      ukuran={30}
                      delay={0.5}
                      className="absolute -top-3 -right-3"
                    />
                    <MascotPijar ekspresi="senang" gerak="idle" ukuran={156} />
                  </div>
                </div>

                {/* Teks & Tombol Masuk Utama */}
                <div className="md:col-span-8 space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-teks/85">
                    MULAI BERSAMA PELITA
                  </span>
                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-teks leading-tight">
                    Temani langkah kecilnya. Jaga cahaya belajarnya.
                  </h2>
                  <p className="text-sm sm:text-base text-teks/90 max-w-2xl leading-relaxed font-medium">
                    PELITA menyatukan pembelajaran yang peka terhadap kondisi
                    harian anak, pemetaan materi Kurikulum Merdeka, serta
                    kendali penuh di tangan orang tua dan sekolah asal.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-[14px] bg-[#FFFDF9] px-6 py-3.5 text-sm font-extrabold text-teks hover:bg-[#FCECD7] transition-colors shadow-sm"
                    >
                      <span>Masuk ke PELITA</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>
      </main>

      {/* =====================================================================
           FOOTER (Menyatu Tanpa Garis Pembatas, Tanpa Navigasi Halaman, Tanpa Icon PELITA & Tanpa Copyright Bawah)
      ===================================================================== */}
      <footer className="relative w-full pt-8 pb-14 text-xs text-teks-2">
        <div className="mx-auto w-full max-w-[1480px] px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-2.5">
              <span className="block font-heading text-xl font-extrabold text-teks">
                PELITA
              </span>
              <p className="font-heading text-sm font-extrabold text-teks">
                Pelita, agar sakit tidak memadamkan cahaya belajar mereka.
              </p>
              <p className="max-w-md text-xs leading-relaxed text-teks-2">
                Platform belajar adaptif yang menyesuaikan kondisi kesehatan
                harian untuk menjaga keberlanjutan pendidikan anak dengan
                penyakit kronis.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="font-heading font-extrabold text-teks">
                Fokus Utama
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>Penyesuaian Belajar Harian</li>
                <li>Jembatan Materi di Pos Dasar</li>
                <li>Pendamping Belajar Ramah Anak</li>
                <li>Laporan Capaian Kurikulum Merdeka</li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="font-heading font-extrabold text-teks">
                Prinsip Keamanan
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>Menjaga Privasi Data Anak</li>
                <li>Tanpa Simpan Catatan Medis</li>
                <li>Persetujuan Penuh Orang Tua</li>
                <li>Materi Terkurasi Pendidik</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
