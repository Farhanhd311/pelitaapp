# DOKUMENTASI ARSITEKTUR, STRUKTUR FOLDER, & TECH STACK: PELITA

> Versi direvisi 7 November 2026: **database diganti ke MySQL 8** (tanpa Supabase), login buatan sendiri, region Vercel, nama model LLM, Zustand dihapus, URL folder halaman, mode demo memakai mesin BKT sungguhan, dan catatan tambahan di bagian 8. Jika bertentangan dengan `PANDUAN_PROYEK.md`, PANDUAN yang berlaku.

Dokumen ini adalah panduan teknis implementasi untuk proyek **PELITA** pada Hackathon FIRETECH 2026. Dokumen ini menyelaraskan aturan pada `PANDUAN_PROYEK.md`, `peta_ai_dan_data_pelita.md`, dan `rencana_24_jam_pelita.md`, serta menyaring konsep awal pada `dokumentasi_alur_sistem_aplikasi_edukasi_adaptif.md` agar siap dieksekusi dalam waktu 24 jam.

---

## 1. Rekonsiliasi Dokumen (Penting untuk Seluruh Tim & AI Assistant)

Berdasarkan analisis keempat dokumen proyek, **`PANDUAN_PROYEK.md` adalah sumber kebenaran utama (*Single Source of Truth*)**. File ke-4 (`dokumentasi_alur_sistem_aplikasi_edukasi_adaptif.md`) merupakan draf konsep awal yang beberapa bagiannya **telah diubah atau ditolak**:

| Aspek | Konsep Awal (Ditolak / Jangan Dikode) | Aturan Final `PANDUAN_PROYEK.md` (Wajib Dipakai) |
|---|---|---|
| **Pembuatan Soal Anak** | LLM men-generate soal secara *real-time* saat anak kuis | **Ditolak.** Soal untuk anak wajib diambil dari tabel `SOAL` berstatus `terbit`. LLM hanya dipakai Admin untuk membuat draf variasi soal. |
| **Intervensi Lelah / Mood** | Timer 15 menit memicu LLM untuk menganalisis *mood* dan menghentikan sesi (`STOP_SESSION`) | **Ditolak.** Cek kondisi **"Masih kuat?"** memakai **aturan tetap** (durasi level tercapai / 3 salah beruntun / tengah sesi `penuh`), bukan keputusan LLM. |
| **Placement Test** | Hanya menguji 5 soal di kelas terakhir | **Ditolak.** Menggunakan **BKT + penelusuran graf prasyarat lintas kelas** (mulai dari `kelas_seharusnya - 1`) dengan aturan `berhenti_dini`. |
| **Tampilan Progres Orang Tua** | Menampilkan persentase skor BKT (misal: `96%`, `78%`) | **Ditolak.** Orang tua hanya melihat status (`belum`, `jembatan`, `tercapai`). Angka peluang hanya tampil di Mode Demo Asesmen dan Admin. |
| **Animasi Maskot Saat Salah** | Maskot bergoyang kiri-kanan seperti menggeleng (`x: [-12, 12, ...]`) | **Diubah.** Varian `coba_lagi` hanya boleh **miring lembut** (`rotate: -8`), dilarang menggeleng atau menampilkan tanda X merah / kata "Salah". |

---

## 2. Ringkasan Tech Stack Utama

Proyek ini menggunakan arsitektur **Full-Stack Monorepo** dengan **Next.js (App Router) + TypeScript** agar *type-safe* dari database hingga antarmuka pengguna dan bebas dari masalah konfigurasi CORS.

| Lapisan | Teknologi Utama | Pustaka Pendukung (Best Practice) | Kegunaan Utama |
|---|---|---|---|
| **Framework Inti** | Next.js (App Router) + TypeScript | — | Routing halaman (`anak`, `pendamping`, `admin`) & Server API Routes |
| **Database** | **MySQL 8** (`utf8mb4`) | `mysql2` + satu file `schema.sql`; **Drizzle ORM (mysql)** hanya jika ada anggota yang sudah familiar | Mengelola 20 tabel relasional & skrip *seed* |
| **Login** | Buatan sendiri | `bcryptjs` + `iron-session` | Hash password & PIN, sesi di cookie terenkripsi `httpOnly`. Tidak memakai Supabase Auth |
| **Styling & UI** | Tailwind CSS + shadcn/ui | `lucide-react` | Komponen UI aksesibel dengan palet warna hangat (*teal*, *peach*, *lavender*, krem, *amber*) |
| **Animasi & Audio** | `motion` (Framer Motion) | **Web Speech API** (`window.speechSynthesis`) | Animasi ekspresi maskot **Pijar** & fitur baca suara otomatis (`id-ID`) untuk mode ramah mata |
| **State Management** | React State / `useReducer` | — (tanpa Zustand) | Cukup untuk *state* kuis dan interval otomatis (±1,5 detik/soal) pada **Mode Demo Asesmen**. Satu pustaka lebih sedikit untuk dijelaskan |
| **AI & Validasi** | LLM API (Server-side) | **Vercel AI SDK (`ai`)** + **Zod** | Memaksa keluaran JSON sesuai skema, mengatur *timeout*, *fallback*, dan mencatat ke `LOG_AI` |
| **Visualisasi & PDF** | CSS Grid + **Recharts** | `window.print()` + `@media print` | Grid peta TP (tanpa React Flow), grafik Evaluasi AI Admin, & cetak laporan sekolah ke PDF |
| **Pengujian (Testing)** | **Vitest** | — | Menguji fungsi murni `/lib/bkt`, `/lib/sesi`, dan `/lib/krisis` |
| **Hosting** | **Vercel** + **MySQL terkelola** | Localhost (MySQL lokal, misalnya Laragon/XAMPP/Docker) + Video Cadangan | Vercel tidak menyediakan MySQL, jadi butuh MySQL di internet yang bisa dihubungi Vercel (lihat 7.1). Pilih server MySQL di **Singapura** dan atur **region fungsi Vercel ke `sin1`** (bawaannya Amerika Serikat) |

> **Daftar Pustaka yang Dilarang di MVP:** `React Flow`, `@react-pdf/renderer`, modul PWA/Offline kompleks, dan gateway OTP SMS.

---

## 3. Struktur Folder Lengkap (Monorepo Next.js)

Struktur ini dirancang agar 3–5 anggota tim dapat bekerja paralel di *branch* atau folder masing-masing tanpa mengalami *merge conflict* dan mudah dijelaskan saat sesi tanya jawab juri:

```text
pelita-app/
├── CLAUDE.md                     # Ringkasan aturan + impor docs/PANDUAN_PROYEK.md (jangan disalin, supaya tidak ada dua versi)
├── docs/                         # PANDUAN_PROYEK.md, ARSITEKTUR_TEKNIS.md, rencana_24_jam_pelita.md, hasil_uji_asesmen_pelita.md
├── app/                          # FULL-STACK ROUTING (Next.js App Router)
│   ├── (auth)/                   # Grup halaman autentikasi & pilih profil (URL: /login, /pilih-profil)
│   │   ├── login/page.tsx        # Login akun demo (email + password)
│   │   └── pilih-profil/page.tsx # Ketuk avatar Anak atau masuk mode Pendamping (wajib PIN)
│   ├── anak/                     # UI Mode Anak, URL /anak/... (target sentuh >= 56px, minim teks, penuh ikon)
│   │   ├── layout.tsx            # Layout krem hangat + Maskot Pijar + Tombol Speaker
│   │   ├── checkin/page.tsx      # Input energi, cuaca hati, keluhan -> panggil tentukanLevel()
│   │   ├── asesmen/page.tsx      # Asesmen adaptif BKT + Toggle "Mode Demo Putar Otomatis"
│   │   ├── peta/page.tsx         # Peta TP: Tab "Kelasku" & "Pos Dasar" (CSS Grid berwarna)
│   │   ├── sesi/[tpKode]/page.tsx# Sesi TP B3: Kartu Belajar -> Kuis -> AI Tutor -> "Masih kuat?"
│   │   └── teman-cerita/page.tsx # Skrining chip 3 dimensi + deteksi krisis aturan tetap
│   ├── pendamping/               # UI Mode Orang Tua / Wali / Guru Pendamping, URL /pendamping/...
│   │   ├── layout.tsx            # Guard sesi PIN Pendamping (dicek lagi di setiap API route)
│   │   ├── dashboard/page.tsx    # Ringkasan, tren check-in, kartu "perlu perhatian", Keputusan Menunggu
│   │   └── laporan/page.tsx      # Sunting draf laporan AI + halaman cetak PDF (window.print)
│   ├── admin/                    # UI Mode Admin, URL /admin/... (tab cadangan untuk tanya jawab juri)
│   │   ├── aturan-ai/page.tsx    # Ubah parameter BKT dalam rentang aman + alasan + riwayat versi
│   │   ├── bank-soal/page.tsx    # Daftar soal + "Buat variasi soal dengan AI" + antrean tinjauan
│   │   ├── evaluasi-ai/page.tsx  # Grafik Recharts (hasil_uji_asesmen.json + metrik nyata LOG_AI)
│   │   ├── eskalasi/page.tsx     # Antrean rujukan & eskalasi darurat
│   │   └── log-aktivitas/page.tsx# Tabel audit log + filter jenis tindakan + ekspor CSV
│   └── api/                      # BACKEND API ROUTES (Server-side only)
│       ├── auth/pin/route.ts     # Verifikasi pin_pendamping_hash di server
│       ├── checkin/route.ts      # Simpan CHECKIN + hitung level sesi + cek 3x lemas beruntun
│       ├── asesmen/route.ts      # Simpan JAWABAN diagnostik + jalankan perbaruiBKT() & putuskan()
│       ├── sesi/route.ts         # Simpan JAWABAN formatif + update PROGRES_TP + cek kondisi
│       ├── ai/
│       │   ├── tutor/route.ts    # Panggil LLM AI Tutor + fallback pembahasan soal
│       │   ├── laporan/route.ts  # Panggil LLM Draf Laporan Sekolah Kurikulum Merdeka
│       │   └── buat-soal/route.ts# Panggil LLM Generator Soal + validasi kunci otomatis
│       ├── teman-cerita/route.ts # Jalankan cekKataKunciKrisis() SEBELUM LLM -> simpan SKRINING
│       ├── pendamping/keputusan/route.ts # Setujui/tolak rujukan (hanya orang_tua/wali)
│       └── admin/
│           ├── pengaturan/route.ts # Validasi rentang aman & simpan versi baru PENGATURAN_SISTEM
│           ├── soal/route.ts       # Terbitkan / tolak soal di antrean tinjauan
│           └── reset-demo/route.ts # WAJIB: Kembalikan seluruh data Raka ke kondisi awal demo
├── components/                   # KOMPONEN UI REUSABLE
│   ├── ui/                       # Komponen dasar shadcn/ui (Button, Card, Dialog, Badge, Tabs)
│   ├── anak/                     # MascotPijar.tsx, TombolSpeaker.tsx, ModalMasihKuat.tsx
│   ├── pendamping/               # KartuPerluPerhatian.tsx, DaftarKeputusanMenunggu.tsx
│   └── admin/                    # GrafikEvaluasiBKT.tsx, TabelTinjauanSoal.tsx, TombolResetDemo.tsx
├── lib/                          # LOGIKA INTI BACKEND & FUNGSI MURNI (Fokus Penilaian Teknis 20%)
│   ├── bkt/                      # Algoritma BKT & penelusuran prasyarat (Zero DB dependency)
│   │   ├── engine.ts             # perbaruiBKT(), setelahJawab(), putuskan()
│   │   ├── graph.ts              # Cari leluhur, keturunan, & kandidat tengah rantai prasyarat
│   │   └── bkt.test.ts           # Unit test Vitest memakai data/tes_kasus_bkt.json
│   ├── sesi/                     # Aturan bisnis sesi harian & cek kondisi tengah sesi
│   │   ├── aturan.ts             # tentukanLevel(), evaluasiCekMasihKuat(), cekPeringatanTigaHari()
│   │   └── sesi.test.ts          # Unit test Vitest
│   ├── krisis/                   # Deteksi sinyal krisis berbasis aturan tetap (Bukan AI)
│   │   ├── detektor.ts           # cekKataKunciKrisis(), tentukanLevelRujukan()
│   │   └── krisis.test.ts        # Unit test Vitest
│   ├── ai/                       # Abstraksi Pemanggilan LLM Server-Side
│   │   ├── client.ts             # Wrapper panggilLLM(): timeout, validasi Zod, fallback, & LOG_AI
│   │   ├── prompts.ts            # Template prompt + guardrail kata sensitif (tanpa jarum/RS)
│   │   ├── schemas.ts            # Skema Zod untuk output JSON Tutor, Laporan, & Generator Soal
│   │   └── fallbacks.ts          # Jawaban cadangan statis untuk demo (B3-D3 & laporan Raka)
│   ├── pengaturan/               # Pembaca & Validator PENGATURAN_SISTEM
│   │   └── index.ts              # ambilPengaturanAktif(), validasiRentangPengaturan()
│   ├── log/                      # Pencatat Audit & Telemetri AI
│   │   └── index.ts              # catatAktivitas() (append-only), catatLogAI()
│   ├── evaluasi/                 # Kalkulasi metrik halaman Evaluasi AI
│   │   └── index.ts              # hitungMetrikLogAI(), ambilDataSimulasi()
│   ├── auth/                     # Login buatan sendiri
│   │   └── sesi.ts               # ambilSesi(), masuk(), keluar(), cekPin() (bcryptjs + iron-session)
│   └── db/                       # Koneksi Database, Skema 20 Tabel, & Otorisasi RBAC
│       ├── index.ts              # Pool koneksi mysql2 (charset utf8mb4, connectionLimit kecil)
│       ├── schema.sql            # Definisi 20 tabel persis sesuai Bagian 9 PANDUAN_PROYEK.md (InnoDB, utf8mb4)
│       └── rbac.ts               # Helper cekPeranServer(), wajibOrangTuaAtauWali()
├── data/                         # FILE DATA AWAL & KONFIGURASI SEED
│   ├── data_awal_matematika_fase_A_B.json
│   ├── data_awal_bahasa_indonesia_fase_A_B.json   # cadangan, di luar lingkup 24 jam
│   ├── tes_kasus_bkt.json        # kasus uji untuk bkt.test.ts
│   ├── hasil_uji_asesmen.json
│   ├── seed_pengaturan_sistem.json
│   └── seed_demo_raka.json       # Profil Raka, Ibu Sari, Kak Dina, riwayat check-in, daftar TP yang dikuasai Raka (bukan jejak hasil), 8 soal formatif B3
└── scripts/
    └── seed.ts                   # Skrip seed awal & fungsi resetDataRaka()
```

---

## 4. Arsitektur Backend & Best Practices

### 4.1. Isolasi Fungsi Murni (*Pure Functions*) untuk Penilaian Teknis
Seluruh logika pengambilan keputusan di `/lib/bkt`, `/lib/sesi`, dan `/lib/krisis` wajib ditulis sebagai **fungsi murni TypeScript** tanpa memanggil database di dalamnya:
* Parameter sistem diambil terlebih dahulu dari tabel `PENGATURAN_SISTEM` oleh *API Route* melalui `/lib/pengaturan`, lalu dikirim sebagai parameter ke fungsi murni.
* **Tidak boleh ada angka ambang batas, durasi, atau kata kunci krisis yang ditulis langsung (*hardcoded*) di dalam logika fungsi.**
* Saat sesi tanya jawab, tim dapat langsung mendemokan eksekusi `npx vitest run` untuk membuktikan bahwa logika BKT, penentuan level sesi, dan deteksi krisis telah teruji secara matematis.

### 4.2. Penegakan Hak Akses (RBAC) di Server
Sesuai matriks akses pada Bagian 4 `PANDUAN_PROYEK.md`, pembatasan akses tidak boleh hanya disembunyikan di tombol UI, melainkan wajib dicek di setiap *API Route* (`/lib/db/rbac.ts`):
* **Anak bukan akun di tabel `USERS`**, melainkan profil di tabel `ANAK` yang terhubung ke pendamping lewat tabel `PENDAMPINGAN`.
* Perpindahan dari tampilan Anak ke tampilan Pendamping wajib memverifikasi `USERS.pin_pendamping_hash` di server.
* Aksi sensitif seperti **menyetujui rujukan komunitas** (`RUJUKAN.disetujui_oleh`) dan **mereset progres** hanya sah jika `PENDAMPINGAN.hubungan` bernilai `'orang_tua'` atau `'wali'` (akun `'guru'` hanya berhak melihat atau mengusulkan).

### 4.3. Wrapper LLM Satu Pintu (`/lib/ai/client.ts`)
Semua pemanggilan LLM untuk AI Tutor, Draf Laporan Sekolah, Generator Variasi Soal, dan Teman Cerita wajib melewati satu fungsi pembungkus di server yang menerapkan aturan berikut:
1. Membaca `llm.batas_waktu_detik` (default `8` detik) dan `llm.maks_kalimat_tutor` (default `3` kalimat) dari `PENGATURAN_SISTEM`.
2. Meminta keluaran terstruktur (**JSON**) dan memvalidasinya dengan skema **Zod**.
3. Untuk generator soal hitungan sederhana, melakukan **validasi ulang kunci jawaban secara terprogram** sebelum soal disimpan sebagai `draf`.
4. Jika terjadi *timeout*, gagal validasi, atau mode cadangan aktif, otomatis mengembalikan respons dari `/lib/ai/fallbacks.ts` atau kolom `SOAL.pembahasan`.
5. Mencatat setiap panggilan ke tabel `LOG_AI` (`fitur`, `ringkasan_input`, `output_json`, `valid`, `pakai_fallback`, `waktu_respons_ms`, `versi_prompt`). Untuk chatbot, **dilarang mencatat isi cerita anak** (hanya simpan kategori skrining).

---

## 5. Arsitektur Frontend & Prinsip UI/UX

### 5.1. Antarmuka Mode Anak (`/app/anak`)
* **Desain Hangat & Non-Klinis:** Menggunakan latar warna krem hangat dengan warna utama *teal* lembut, aksen *peach*, dan *lavender* untuk Teman Cerita. Tidak boleh terlihat seperti aplikasi medis/rumah sakit.
* **Aksesibilitas Anak Sedang Pengobatan:** Semua tombol memiliki area sentuh minimal `56px` dan dilengkapi `TombolSpeaker.tsx` (memanfaatkan `window.speechSynthesis` bahasa Indonesia) agar anak dengan keluhan `"mata lelah"` tetap bisa belajar lewat mode audio. **Suara `id-ID` tidak tersedia di semua perangkat/peramban**: cek di laptop demo sejak H0 (Chrome biasanya punya). Jika tidak ada, siapkan rekaman audio untuk kartu belajar B3 dan audio sesi ringan.
* **Psikologi Positif Tanpa Hukuman:**
  * Tidak ada tanda silang merah (❌), kata `"Salah"`, *timer* hitung mundur, atau papan peringkat.
  * Target dihitung per minggu; hari istirahat yang dilaporkan lewat check-in tetap dihitung sebagai hari aktif.
* **Mode Demo "Putar Otomatis" (`/app/anak/asesmen`):** Menyediakan tombol khusus untuk demo panggung (±1,5 detik per soal), menampilkan pergerakan peluang BKT serta perubahan warna peta TP hingga berhenti di **TP B3** dalam ±25 detik.
  * **Yang di-skrip hanya jawaban Raka**, diturunkan dari daftar TP yang ia kuasai (benar jika dikuasai, salah jika tidak). Pemilihan TP berikutnya, angka peluang, penyimpulan, dan titik mulai **harus dihitung oleh mesin BKT yang sama** lewat `/api/asesmen`, bukan diputar dari rekaman 17 langkah. Dengan begitu tim bisa jujur berkata ke juri: "ini mesin sungguhan, hanya jawabannya yang otomatis". Hasilnya harus sama dengan `data/tes_kasus_bkt.json`.

### 5.2. Animasi Maskot "Pijar" (`components/anak/MascotPijar.tsx`)
Menggunakan satu aset PNG transparan lentera kecil bernama **Pijar** yang dianimasikan dengan pustaka `motion` (Metode A — Bahasa Tubuh & Elemen Melayang):

```tsx
// Varian animasi yang telah disesuaikan dengan Bagian 13 PANDUAN_PROYEK.md
export const pijarVariants = {
  idle: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
  },
  senang: {
    y: [0, -24, 0],
    scale: [1, 1.12, 1],
    transition: { type: "spring", stiffness: 280 }
  },
  // PENTING: Hanya miring lembut, BUKAN menggeleng kiri-kanan
  coba_lagi: {
    rotate: -8,
    y: 2,
    transition: { type: "spring", stiffness: 200, damping: 15 }
  },
  lelah: {
    y: 8,
    scale: 0.95,
    rotate: -4,
    transition: { duration: 0.6 }
  }
};
```

### 5.3. Antarmuka Mode Pendamping & Cetak PDF (`/app/pendamping`)
* **Pusat Kendali Orang Tua:** Semua hal yang memerlukan izin (seperti persetujuan rujukan dari Teman Cerita) dikumpulkan di bagian **"Keputusan Menunggu"**.
* **Kartu "Perlu Perhatian" (Warna Amber):** Muncul otomatis untuk orang tua dan guru pendamping apabila terdapat 3 check-in berturut-turut dengan energi `lemas` atau memiliki keluhan fisik.
* **Cetak Laporan Sekolah Tanpa Library PDF:** Halaman `/pendamping/laporan` (folder `app/pendamping/laporan`) menggunakan *class* Tailwind `print:hidden` untuk menyembunyikan navigasi saat tombol **"Cetak / Simpan PDF"** (`window.print()`) ditekan, menghasilkan dokumen capaian per TP sesuai gaya Kurikulum Merdeka secara instan.

---

## 6. Strategi Penggunaan Claude Max & Penyedia LLM API

Memisahkan fungsi langganan **Claude Max** (untuk proses pengembangan oleh tim) dan **LLM API Key** (untuk dijalankan di dalam server aplikasi Next.js):

### 6.1. Pemanfaatan Langganan Claude Max (Oleh Tim Developer)
1. **AI Coding Assistant dengan `CLAUDE.md`:** Simpan aturan `PANDUAN_PROYEK.md` ke dalam file `CLAUDE.md` di *root* proyek. Gunakan **Claude Code** untuk membangun modul per folder sesuai instruksi di Bagian 15 `PANDUAN_PROYEK.md`.
2. **Pabrik Data Seed & Jawaban Fallback:** Gunakan Claude Max sebelum/saat awal hackathon untuk menyusun:
   * 8 soal formatif TP B3 lengkap dengan `miskonsepsi` di setiap opsi pengecoh dan `pembahasan`.
   * 1 konten Kartu Belajar perkalian (TP B3) dan naskah audio pengulangan materi.
   * Respons JSON cadangan terbaik untuk **AI Tutor soal B3-D3 ($6 \times 7$ dijawab 13)** dan **Draf Laporan Sekolah Raka** untuk disimpan di `/lib/ai/fallbacks.ts`.

### 6.2. Konfigurasi LLM API di Server Aplikasi (`/lib/ai/client.ts`)
Menggunakan **Vercel AI SDK (`ai`)** sehingga pergantian model hanya membutuhkan perubahan 1 baris kode:
* **Penyedia Utama:** Google Gemini API atau Anthropic API, model versi cepat/kecil. **Nama model di dokumen lama sudah usang dan bisa sudah dipensiunkan**; cek nama model terbaru di dokumentasi penyedia pada hari-H (misalnya keluarga Claude Haiku/Sonnet terbaru, atau Gemini Flash terbaru), lalu simpan di variabel lingkungan `LLM_MODEL` dan `BACKUP_LLM_MODEL`, bukan di kode. Uji kecepatan dan keluaran JSON sekali di H0–H2.
* **Catatan biaya:** langganan Claude Max hanya untuk aplikasi Claude dan Claude Code tim; API key aplikasi ditagih terpisah. Pastikan ada kuota/saldo, dan konfirmasi ke panitia bahwa API pihak ketiga boleh dipakai.
* **Penyedia Cadangan (API Key ke-2):** Siapkan kunci API kedua di variabel lingkungan (`BACKUP_LLM_API_KEY`) untuk mengantisipasi batas kuota (*rate limit*).
* **Cadangan Statis (Jaminan Demo Tetap Jalan):** Jika panggilan API melebihi batas waktu atau koneksi internet panggung terganggu, sistem otomatis menyajikan data dari `/lib/ai/fallbacks.ts`.

---

## 7. Hosting, Variabel Lingkungan (`.env`), & Pembagian Kerja Tim

### 7.1. Konfigurasi `.env.local` & Vercel Environment Variables
```env
# Database MySQL 8 (lokal saat coding, terkelola saat deploy)
# Lokal:  mysql://root:password@localhost:3306/pelita
# Deploy: pakai MySQL terkelola yang bisa diakses dari internet (cek pilihan gratis yang tersedia hari ini,
#         misalnya Aiven, Railway, atau TiDB Cloud yang kompatibel MySQL). Biasanya wajib SSL.
DATABASE_URL="mysql://user:password@host:3306/pelita"

# Kunci enkripsi cookie sesi (iron-session), minimal 32 karakter acak. HANYA di server.
SESSION_SECRET="ganti-dengan-32-karakter-acak-atau-lebih"

# LLM API Keys (HANYA DI SERVER - JANGAN PAKAI NEXT_PUBLIC_)
PRIMARY_LLM_API_KEY="..."
LLM_MODEL="(isi nama model terbaru dari dokumentasi penyedia)"
BACKUP_LLM_API_KEY="..."
BACKUP_LLM_MODEL="..."

# Mode cadangan demo TIDAK disimpan di .env (mengubah env di Vercel butuh deploy ulang).
# Simpan sebagai pengaturan `demo.pakai_cadangan` (true/false) di PENGATURAN_SISTEM,
# supaya bisa dinyalakan dari halaman Aturan AI dalam hitungan detik saat sinyal panggung buruk.
```

### 7.2. Pembagian Kepemilikan Modul (Agar Setiap Anggota Siap Tanya Jawab)
Sesuai aturan hackathon, setiap anggota tim wajib memahami dan mampu menjelaskan kodenya di depan juri:

| Peran Anggota | Area Folder yang Dikuasai | Tanggung Jawab Utama & Pertanyaan Juri yang Dijawab |
|---|---|---|
| **Anggota 1: Backend & Algoritma** | `/lib/bkt`, `/lib/sesi`, `/lib/krisis`, `/lib/db`, `/scripts/seed.ts` | Menjelaskan rumus BKT, penelusuran graf prasyarat, aturan `tentukanLevel`, deteksi krisis aturan tetap, skema 20 tabel, & menjalankan *unit test* Vitest di depan juri. |
| **Anggota 2: Frontend Anak & Interaksi** | `/app/anak`, `/components/anak` | Membangun alur Check-in, Mode Demo Putar Otomatis Asesmen, Peta TP (Kelasku/Pos Dasar), Sesi Belajar B3, cek "Masih kuat?", Web Speech API, & animasi Maskot Pijar. |
| **Anggota 3: Pendamping, Admin & AI** | `/app/pendamping`, `/app/admin`, `/lib/ai`, `/lib/evaluasi`, `/data` | Membangun Dashboard Ibu Sari, cetak PDF Laporan Sekolah, integrasi prompt LLM + Zod + `LOG_AI`, halaman Admin (Aturan AI, Bank Soal, Evaluasi AI), & tombol **Reset Demo**. |

---

## 8. Catatan Tambahan Penting

1. **Login buatan sendiri.** Password dan PIN di-hash dengan `bcryptjs` (simpan di `USERS.password_hash` dan `USERS.pin_pendamping_hash`). Setelah login, `iron-session` menyimpan `user_id`, `role`, `anak_aktif`, dan penanda `mode_pendamping` (true hanya setelah PIN benar) di cookie `httpOnly`, `secure`, `sameSite=lax`. Batasi percobaan PIN (misalnya kunci 5 menit setelah 5 kali salah). Jangan pakai NextAuth/Auth.js kecuali ada anggota yang sudah menguasainya.
2. **MySQL tidak punya Row Level Security.** Satu-satunya penjaga akses adalah `rbac.ts`, jadi wajib dipanggil di **setiap** route yang menyentuh data anak.
5. **Hal teknis MySQL yang sering bikin macet:**
   - **`utf8mb4` di semua tempat** (database, tabel, koneksi). Dengan `utf8` biasa, emoji di soal (🐟, ⭐, 📘) gagal disimpan atau berubah jadi `????`.
   - Gunakan **pool** `mysql2` dengan `connectionLimit` kecil (misalnya 5). Di Vercel setiap fungsi membuka koneksi sendiri; MySQL gratisan biasanya membatasi jumlah koneksi.
   - Selalu pakai **query berparameter** (`?`), jangan menyambung string SQL.
   - Kolom JSON: `mysql2` mengembalikannya sebagai objek; saat menyimpan, kirim `JSON.stringify(...)`.
   - Nama tabel huruf besar (`USERS`) bisa berbeda perilakunya di Windows dan Linux. Paling aman pakai **nama tabel huruf kecil** di SQL (`users`, `progres_tp`), sementara dokumen tetap menyebutnya `USERS`.
3. **Definisi "Reset demo":** riwayat check-in Raka 3–4 minggu (termasuk 3 hari lemas berturut-turut), profil Ibu Sari dan Kak Dina, satu skrining dan satu rujukan menunggu tetap ada; **progres TP Raka dikosongkan** supaya asesmen bisa diputar ulang di panggung; log demo dibersihkan. Setelah asesmen diputar, buka/muat ulang tab dashboard supaya progres terbaru tampil.
4. **Urutan pembuatan tabel:** satu file SQL untuk 20 tabel di H0–H2 tidak masalah, tetapi isi dan pakai dulu tabel inti (kurikulum, soal, anak, check-in, sesi, jawaban, progres). Tabel admin dipakai setelah H12.

---

## 9. Daftar Periksa Teknis Sesuai Titik Cek 24 Jam

- [ ] **H0–H2:** Repo GitHub aktif, MySQL terkelola sudah dibuat dan berhasil dihubungi dari Vercel (region `sin1`), emoji tersimpan benar (uji `utf8mb4`), login + cookie sesi jalan, satu panggilan LLM uji berhasil, suara `id-ID` tersedia di laptop demo, `CLAUDE.md` terpasang, 20 tabel terbuat di MySQL, skrip `seed.ts` & endpoint `/api/admin/reset-demo` berhasil memasukkan data awal Matematika Fase A–B dan profil Raka, serta aplikasi ter-deploy pertama kali di Vercel.
- [ ] **H7 (Titik Cek 1):** Alur `Check-in` $\rightarrow$ `Asesmen Adaptif (Mode Putar Otomatis)` $\rightarrow$ `Peta TP` berjalan mulus dari awal sampai akhir; *unit test* `/lib/bkt` dan `/lib/sesi` lulus di Vitest.
- [ ] **H12 (Titik Cek 2):** Seluruh skenario demo 130 detik Raka berjalan utuh (Sesi B3 $\rightarrow$ salah di soal B3-D3 $\rightarrow$ AI Tutor menjelaskan miskonsepsi $\rightarrow$ Dashboard Ibu Sari $\rightarrow$ Cetak PDF Laporan).
- [ ] **H17 (Fitur Dibekukan):** Halaman Admin Kelas B (Aturan AI, Tinjauan Soal AI, Evaluasi AI dari `hasil_uji_asesmen.json` + `LOG_AI`) selesai. Tidak ada penambahan fitur baru setelah H17.
- [ ] **H20–H22:** Video demo cadangan telah direkam, aplikasi lokal berjalan lancar sebagai cadangan internet panggung, dan seluruh anggota tim telah melakukan sesi bedah kode bersama.