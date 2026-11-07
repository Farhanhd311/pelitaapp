# DOKUMENTASI ARSITEKTUR, STRUKTUR FOLDER, & TECH STACK: PELITA

> Versi direvisi 7 November 2026: **database diganti ke MySQL 8** (tanpa Supabase), login buatan sendiri, **hosting diganti ke Google Cloud Platform** (Cloud Run + Cloud SQL, region Jakarta `asia-southeast2`, tanpa Vercel), nama model LLM, Zustand dihapus, URL folder halaman, mode demo memakai mesin BKT sungguhan, dan catatan tambahan di bagian 8. Jika bertentangan dengan `PANDUAN_PROYEK.md`, PANDUAN yang berlaku.

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
| **AI & Validasi** | Claude API (Server-side), model dari `LLM_MODEL` (saat ini `claude-haiku-5-5`) | **SDK resmi `@anthropic-ai/sdk`** (structured outputs) + **Zod** | Memaksa keluaran JSON sesuai skema, mengatur *timeout*, *fallback*, dan mencatat ke `LOG_AI`. Paket `ai` (Vercel AI SDK) tidak dipakai |
| **Visualisasi & PDF** | CSS Grid + **Recharts** | `window.print()` + `@media print` | Grid peta TP (tanpa React Flow), grafik Evaluasi AI Admin, & cetak laporan sekolah ke PDF |
| **Pengujian (Testing)** | **Vitest** | — | Menguji fungsi murni `/lib/bkt`, `/lib/sesi`, dan `/lib/krisis` |
| **Hosting** | **Google Cloud Platform**: **Cloud Run** (aplikasi Next.js) + **Cloud SQL for MySQL 8** | Localhost (XAMPP, database `pelita`) + Video Cadangan | Keduanya di region **Jakarta `asia-southeast2`** (paling dekat ke Padang). Cloud Run terhubung ke Cloud SQL lewat unix socket (`DB_SOCKET_PATH`), tanpa IP publik. Langkah deploy di 7.3 |

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
│   └── api/                      # BACKEND API ROUTES (Server-side only). Contoh request semua route: docs/api.http
│       ├── health/route.ts       # GET cek koneksi DB + utf8mb4
│       ├── auth/
│       │   ├── login/route.ts    # POST email + password
│       │   ├── logout/route.ts   # POST hapus sesi
│       │   ├── profil/route.ts   # GET siapa login + daftar avatar anak; POST pilih anak (mode anak)
│       │   └── pin/route.ts      # POST verifikasi pin_pendamping_hash (percobaan dibatasi) -> mode pendamping
│       ├── mapel/route.ts        # GET daftar mapel
│       ├── checkin/route.ts      # GET check-in hari ini; POST simpan CHECKIN + tentukanLevel()
│       ├── asesmen/route.ts      # POST mulai | jawab | jawab_demo (mesin BKT, keadaan dihitung ulang dari JAWABAN)
│       ├── peta/route.ts         # GET Kelasku + Pos Dasar (susunPeta)
│       ├── sesi/route.ts         # POST mulai | kuis | jawab | masih_kuat | selesai (kuis formatif + cek "Masih kuat?")
│       ├── teman-cerita/route.ts # GET chip; POST skrining: cekKataKunciKrisis() dulu -> level rujukan -> SKRINING
│       ├── ai/
│       │   ├── tutor/route.ts    # POST AI tutor + cadangan
│       │   ├── laporan/route.ts  # POST draf laporan sekolah + cadangan templat
│       │   ├── buat-soal/route.ts# POST generator soal + validasi otomatis -> antrean draf
│       │   └── umpan-balik/route.ts # POST jempol membantu/tidak membantu
│       ├── pendamping/
│       │   ├── dashboard/route.ts  # GET ringkasan, tren, perlu perhatian, progres, keputusan
│       │   ├── keputusan/route.ts  # GET daftar; POST setujui/tolak rujukan (hanya orang_tua/wali)
│       │   ├── anak/route.ts       # GET profil; PATCH mode jeda / batas layar / fase (hanya orang_tua/wali)
│       │   └── laporan/route.ts    # GET data halaman cetak; POST catat unduhan
│       └── admin/
│           ├── pengaturan/route.ts # GET + POST ubah/kembalikan (rentang aman, alasan, versi baru)
│           ├── soal/route.ts       # GET bank soal + statistik; POST terbitkan / sunting / tolak
│           ├── evaluasi/route.ts   # GET metrik Evaluasi AI + hasil simulasi berlabel
│           ├── log-aktivitas/route.ts # GET log + filter + ekspor CSV
│           ├── eskalasi/route.ts   # GET antrean; POST tandai ditangani / alarm palsu
│           └── reset-demo/route.ts # POST kembalikan data Raka ke kondisi awal demo
├── components/                   # KOMPONEN UI REUSABLE
│   ├── ui/                       # Komponen dasar shadcn/ui (Button, Card, Dialog, Badge, Tabs)
│   ├── anak/                     # MascotPijar.tsx, TombolSpeaker.tsx, ModalMasihKuat.tsx
│   ├── pendamping/               # KartuPerluPerhatian.tsx, DaftarKeputusanMenunggu.tsx
│   └── admin/                    # GrafikEvaluasiBKT.tsx, TabelTinjauanSoal.tsx, TombolResetDemo.tsx
├── lib/                          # LOGIKA INTI BACKEND & FUNGSI MURNI (Fokus Penilaian Teknis 20%)
│   ├── bkt/                      # Algoritma BKT & penelusuran prasyarat (Zero DB dependency)
│   │   ├── engine.ts             # perbaruiBKT(), setelahJawab(), putuskan(), putarUlangAsesmen(), jawabFormatif()
│   │   ├── graph.ts              # Cari leluhur, keturunan, TP pertama
│   │   ├── peta.ts               # susunPeta(): Kelasku, Pos Dasar, TP terkunci, rekomendasi
│   │   └── bkt.test.ts           # Unit test Vitest memakai data/tes_kasus_bkt.json
│   ├── sesi/                     # Aturan bisnis sesi harian & cek kondisi tengah sesi
│   │   ├── aturan.ts             # tentukanLevel(), evaluasiCekMasihKuat(), tindakanMasihKuat(), perluPerhatian()
│   │   └── sesi.test.ts          # Unit test Vitest
│   ├── krisis/                   # Deteksi sinyal krisis berbasis aturan tetap (Bukan AI)
│   │   ├── detektor.ts           # cekKataKunciKrisis(), tentukanLevelRujukan()
│   │   └── krisis.test.ts        # Unit test Vitest
│   ├── ai/                       # Abstraksi Pemanggilan LLM Server-Side (SDK resmi @anthropic-ai/sdk)
│   │   ├── client.ts             # Wrapper panggilLLM(): timeout, structured output + Zod, key cadangan, fallback, LOG_AI
│   │   ├── prompts.ts            # Template prompt + guardrail kata sensitif (tanpa jarum/RS)
│   │   ├── schemas.ts            # Skema Zod untuk output JSON Tutor, Laporan, & Generator Soal
│   │   ├── validasi.ts           # Cek keluaran: jumlah kalimat, kata dihindari, 4 pilihan/1 kunci, kunci dihitung ulang
│   │   ├── validasi.test.ts      # Unit test Vitest
│   │   └── fallbacks.ts          # Jawaban cadangan (tutor B3-D3, templat laporan, soal B3)
│   ├── pengaturan/               # Pembaca & Validator PENGATURAN_SISTEM
│   │   ├── index.ts              # Nilai aktif, nilai yang berlaku pada waktu tertentu (berversi), simpan/kembalikan versi
│   │   ├── rentang.ts            # Rentang aman + kombinasi tidak logis (PANDUAN 8.4)
│   │   └── pengaturan.test.ts    # Unit test Vitest
│   ├── log/                      # Pencatat Audit & Telemetri AI
│   │   └── index.ts              # catatAktivitas() (append-only), catatLogAI()
│   ├── api/
│   │   └── respons.ts            # tanganiApi(), bacaBody(), GalatApi: bentuk galat seragam untuk semua route
│   ├── kontrak/                  # Kontrak API (request: skema Zod; response: tipe), dipakai server DAN frontend
│   │   ├── umum.ts               # Bentuk galat, enum status, SoalTampil (tanpa kunci jawaban), KotakPetaTp
│   │   ├── auth.ts, checkin.ts, asesmen.ts, peta.ts, sesi.ts, ai.ts, teman-cerita.ts, pendamping.ts, admin.ts
│   │   └── kontrak.test.ts       # Data contoh lolos skema + cocok dengan tes_kasus_bkt.json
│   ├── evaluasi/                 # Kalkulasi metrik halaman Evaluasi AI
│   │   ├── index.ts              # hitungMetrikLogAI(), ambilDataSimulasi()
│   │   └── evaluasi.test.ts
│   ├── auth/                     # Login buatan sendiri
│   │   └── sesi.ts               # ambilSesi(), masuk(), keluar(), cekPin() (bcryptjs + iron-session)
│   └── db/                       # Koneksi Database, Skema 20 Tabel, Otorisasi RBAC, & query per fitur
│       ├── index.ts              # Pool koneksi mysql2 (charset utf8mb4, connectionLimit kecil), denganTransaksi()
│       ├── schema.sql            # Definisi 20 tabel persis sesuai Bagian 9 PANDUAN_PROYEK.md (InnoDB, utf8mb4)
│       ├── rbac.ts               # wajibLogin(), wajibModeAnak(), wajibModePendamping(), wajibAksesAnak(), wajibOrangTuaAtauWali()
│       └── anak.ts, asesmen.ts, sesi-belajar.ts, pendamping.ts, soal.ts  # query berparameter per fitur
├── data/                         # FILE DATA AWAL & KONFIGURASI SEED
│   ├── data_awal_matematika_fase_A_B.json
│   ├── data_awal_bahasa_indonesia_fase_A_B.json   # cadangan, di luar lingkup 24 jam
│   ├── tes_kasus_bkt.json        # kasus uji untuk bkt.test.ts
│   ├── hasil_uji_asesmen.json
│   ├── seed_pengaturan_sistem.json  # termasuk kunci tambahan (jumlah soal kuis, kode kebutuhan, ambang kartu belajar, ...)
│   ├── seed_layanan_dukungan.json   # layanan contoh (calon mitra), dipakai Reset demo
│   └── seed_demo_raka.json       # Data Reset demo: TP dikuasai Raka, riwayat check-in, skrining + rujukan, konten contoh
└── scripts/
    └── seed.mts                  # Skrip seed awal & fungsi resetDataRaka()
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

### 7.1. Konfigurasi `.env` & variabel lingkungan Cloud Run
Salin `.env.example` menjadi `.env` (sudah di-`.gitignore`). Di Cloud Run, nilai yang sama diisi sebagai variabel lingkungan; nilai rahasia (password DB, `SESSION_SECRET`, API key) disimpan di **Secret Manager**.
```env
# Database MySQL 8 (lokal saat coding, Cloud SQL saat deploy)
# Lokal (XAMPP):  mysql://root@localhost:3306/pelita  (buat dulu database `pelita` utf8mb4 di phpMyAdmin)
# Cloud Run:      mysql://pelita_app:password@localhost/pelita  (host diabaikan karena DB_SOCKET_PATH diisi)
DATABASE_URL="mysql://user:password@host:3306/pelita"

# Hanya di Cloud Run: unix socket Cloud SQL. Kosongkan untuk lokal.
DB_SOCKET_PATH="/cloudsql/PROJECT_ID:asia-southeast2:pelita-mysql"

# Password dan PIN akun demo, dipakai scripts/seed.mts (disimpan sebagai hash bcrypt)
DEMO_PASSWORD="..."
DEMO_PIN="...."

# Kunci enkripsi cookie sesi (iron-session), minimal 32 karakter acak. HANYA di server.
SESSION_SECRET="ganti-dengan-32-karakter-acak-atau-lebih"

# LLM API Keys (HANYA DI SERVER - JANGAN PAKAI NEXT_PUBLIC_)
PRIMARY_LLM_API_KEY="..."
LLM_MODEL="(isi nama model terbaru dari dokumentasi penyedia)"
BACKUP_LLM_API_KEY="..."
BACKUP_LLM_MODEL="..."

# Mode cadangan demo TIDAK disimpan di .env (mengubah env di Cloud Run membuat revisi baru).
# Simpan sebagai pengaturan `demo.pakai_cadangan` (true/false) di PENGATURAN_SISTEM,
# supaya bisa dinyalakan dari halaman Aturan AI dalam hitungan detik saat sinyal panggung buruk.
```

### 7.2. Pembagian Kepemilikan Modul (Agar Setiap Anggota Siap Tanya Jawab)
Sesuai aturan hackathon, setiap anggota tim wajib memahami dan mampu menjelaskan kodenya di depan juri:

| Peran Anggota | Area Folder yang Dikuasai | Tanggung Jawab Utama & Pertanyaan Juri yang Dijawab |
|---|---|---|
| **Anggota 1: Backend & Algoritma** | `/lib/bkt`, `/lib/sesi`, `/lib/krisis`, `/lib/db`, `/scripts/seed.mts` | Menjelaskan rumus BKT, penelusuran graf prasyarat, aturan `tentukanLevel`, deteksi krisis aturan tetap, skema 20 tabel, & menjalankan *unit test* Vitest di depan juri. |
| **Anggota 2: Frontend Anak & Interaksi** | `/app/anak`, `/components/anak` | Membangun alur Check-in, Mode Demo Putar Otomatis Asesmen, Peta TP (Kelasku/Pos Dasar), Sesi Belajar B3, cek "Masih kuat?", Web Speech API, & animasi Maskot Pijar. |
| **Anggota 3: Pendamping, Admin & AI** | `/app/pendamping`, `/app/admin`, `/lib/ai`, `/lib/evaluasi`, `/data` | Membangun Dashboard Ibu Sari, cetak PDF Laporan Sekolah, integrasi prompt LLM + Zod + `LOG_AI`, halaman Admin (Aturan AI, Bank Soal, Evaluasi AI), & tombol **Reset Demo**. |

### 7.3. Deploy ke Google Cloud (Cloud Run + Cloud SQL)
Kerjakan di H0–H2. Ganti `PROJECT_ID` dengan ID proyek GCP tim. Perintah memakai `gcloud` (Google Cloud CLI) di terminal bash.

```bash
# 0. Sekali per laptop / proyek
gcloud auth login
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com

# 1. Cloud SQL MySQL 8 di Jakarta (±10 menit). db-f1-micro cukup untuk demo.
gcloud sql instances create pelita-mysql --database-version=MYSQL_8_0 --edition=enterprise \
  --tier=db-f1-micro --region=asia-southeast2 --database-flags=character_set_server=utf8mb4
gcloud sql databases create pelita --instance=pelita-mysql --charset=utf8mb4 --collation=utf8mb4_unicode_ci
gcloud sql users create pelita_app --instance=pelita-mysql --password="PASSWORD_KUAT"

# 2. Simpan nilai rahasia di Secret Manager
printf "%s" "mysql://pelita_app:PASSWORD_KUAT@localhost/pelita" | gcloud secrets create DATABASE_URL --data-file=-
printf "%s" "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" | gcloud secrets create SESSION_SECRET --data-file=-
printf "%s" "API_KEY_UTAMA"   | gcloud secrets create PRIMARY_LLM_API_KEY --data-file=-
printf "%s" "API_KEY_CADANGAN" | gcloud secrets create BACKUP_LLM_API_KEY --data-file=-

# 3. Izinkan service account Cloud Run membaca secret dan memakai Cloud SQL
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")
SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$SA" --role=roles/cloudsql.client

# 4. Deploy dari folder proyek (buildpack Node 22 menjalankan npm run build lalu npm start; tanpa Dockerfile).
#    File yang diunggah mengikuti .gcloudignore (semua .env* tidak ikut).
gcloud run deploy pelita --source . --region=asia-southeast2 --allow-unauthenticated --max-instances=3 \
  --add-cloudsql-instances=PROJECT_ID:asia-southeast2:pelita-mysql \
  --set-env-vars="DB_SOCKET_PATH=/cloudsql/PROJECT_ID:asia-southeast2:pelita-mysql,LLM_MODEL=NAMA_MODEL,BACKUP_LLM_MODEL=NAMA_MODEL_CADANGAN" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest,PRIMARY_LLM_API_KEY=PRIMARY_LLM_API_KEY:latest,BACKUP_LLM_API_KEY=BACKUP_LLM_API_KEY:latest"

# 5. Cek: harus mengembalikan {"ok":true,...,"teks":"🐟📘"}
curl https://URL-CLOUD-RUN/api/health
```

**Seed Cloud SQL dari laptop** lewat [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/mysql/sql-proxy):
```bash
# Terminal 1: buka terowongan ke Cloud SQL di port 3308
cloud-sql-proxy --port 3308 PROJECT_ID:asia-southeast2:pelita-mysql
# Terminal 2: variabel yang di-set di terminal mengalahkan nilai di .env
DATABASE_URL="mysql://pelita_app:PASSWORD_KUAT@127.0.0.1:3308/pelita" npm run seed
```
> **Perhatian:** lewat proxy, host database terlihat `127.0.0.1`, jadi pengaman "bukan database lokal" di skrip seed tidak aktif. Seed **menghapus semua data**; jalankan hanya saat memang ingin mengembalikan Cloud SQL ke kondisi awal.

Catatan:
- Jika build gagal karena izin, beri service account `$SA` peran `roles/cloudbuild.builds.builder` lalu ulangi langkah 4.
- Deploy ulang setelah perubahan kode: ulangi langkah 4 (variabel dan secret tetap tersimpan, cukup `gcloud run deploy pelita --source . --region=asia-southeast2`).
- Cloud SQL ditagih per jam walau tidak dipakai. Setelah lomba: `gcloud sql instances patch pelita-mysql --activation-policy=NEVER` (mematikan) atau hapus instance.

---

## 8. Catatan Tambahan Penting

1. **Login buatan sendiri.** Password dan PIN di-hash dengan `bcryptjs` (simpan di `USERS.password_hash` dan `USERS.pin_pendamping_hash`). Setelah login, `iron-session` menyimpan `user_id`, `role`, `anak_aktif`, dan penanda `mode_pendamping` (true hanya setelah PIN benar) di cookie `httpOnly`, `secure`, `sameSite=lax`. Batasi percobaan PIN (misalnya kunci 5 menit setelah 5 kali salah). Jangan pakai NextAuth/Auth.js kecuali ada anggota yang sudah menguasainya.
2. **MySQL tidak punya Row Level Security.** Satu-satunya penjaga akses adalah `rbac.ts`, jadi wajib dipanggil di **setiap** route yang menyentuh data anak.
5. **Hal teknis MySQL yang sering bikin macet:**
   - **`utf8mb4` di semua tempat** (database, tabel, koneksi). Dengan `utf8` biasa, emoji di soal (🐟, ⭐, 📘) gagal disimpan atau berubah jadi `????`.
   - Gunakan **pool** `mysql2` dengan `connectionLimit` kecil (misalnya 5). Setiap instance Cloud Run punya pool sendiri, dan instance Cloud SQL kecil membatasi jumlah koneksi; batasi juga `--max-instances` Cloud Run.
   - Selalu pakai **query berparameter** (`?`), jangan menyambung string SQL.
   - Kolom JSON: saat menyimpan, kirim `JSON.stringify(...)`; saat membaca, pakai `bacaJson(...)` dari `lib/db`. Pool memakai `jsonStrings: true` supaya kolom JSON selalu kembali sebagai teks, baik di XAMPP maupun Cloud SQL.
   - **Lokal memakai XAMPP, yang isinya MariaDB 10.4, bukan MySQL 8.** Skema yang sama berjalan di keduanya, tetapi jangan memakai fitur khusus MySQL 8 (misalnya `JSON_TABLE`, fungsi window tertentu, `CHECK` yang bergantung versi) tanpa mengujinya juga di Cloud SQL. Uji alur penting di Cloud Run sebelum demo.
   - Nama tabel huruf besar (`USERS`) bisa berbeda perilakunya di Windows dan Linux. Paling aman pakai **nama tabel huruf kecil** di SQL (`users`, `progres_tp`), sementara dokumen tetap menyebutnya `USERS`.
3. **Definisi "Reset demo":** riwayat check-in Raka 3–4 minggu (termasuk 3 hari lemas berturut-turut), profil Ibu Sari dan Kak Dina, satu skrining dan satu rujukan menunggu tetap ada; **progres TP Raka dikosongkan** supaya asesmen bisa diputar ulang di panggung; log demo dibersihkan. Setelah asesmen diputar, buka/muat ulang tab dashboard supaya progres terbaru tampil.
4. **Urutan pembuatan tabel:** satu file SQL untuk 20 tabel di H0–H2 tidak masalah, tetapi isi dan pakai dulu tabel inti (kurikulum, soal, anak, check-in, sesi, jawaban, progres). Tabel admin dipakai setelah H12.

---

## 9. Daftar Periksa Teknis Sesuai Titik Cek 24 Jam

- [ ] **H0–H2:** Repo GitHub aktif, Cloud SQL (MySQL 8, `asia-southeast2`) sudah dibuat dan berhasil dihubungi dari Cloud Run (`/api/health` mengembalikan 🐟📘), emoji tersimpan benar (uji `utf8mb4`), login + cookie sesi jalan, satu panggilan LLM uji berhasil, suara `id-ID` tersedia di laptop demo, `CLAUDE.md` terpasang, 20 tabel terbuat di MySQL, skrip `seed.mts` & endpoint `/api/admin/reset-demo` berhasil memasukkan data awal Matematika Fase A–B dan profil Raka, serta aplikasi ter-deploy pertama kali di Cloud Run.
- [ ] **H7 (Titik Cek 1):** Alur `Check-in` $\rightarrow$ `Asesmen Adaptif (Mode Putar Otomatis)` $\rightarrow$ `Peta TP` berjalan mulus dari awal sampai akhir; *unit test* `/lib/bkt` dan `/lib/sesi` lulus di Vitest.
- [ ] **H12 (Titik Cek 2):** Seluruh skenario demo 130 detik Raka berjalan utuh (Sesi B3 $\rightarrow$ salah di soal B3-D3 $\rightarrow$ AI Tutor menjelaskan miskonsepsi $\rightarrow$ Dashboard Ibu Sari $\rightarrow$ Cetak PDF Laporan).
- [ ] **H17 (Fitur Dibekukan):** Halaman Admin Kelas B (Aturan AI, Tinjauan Soal AI, Evaluasi AI dari `hasil_uji_asesmen.json` + `LOG_AI`) selesai. Tidak ada penambahan fitur baru setelah H17.
- [ ] **H20–H22:** Video demo cadangan telah direkam, aplikasi lokal berjalan lancar sebagai cadangan internet panggung, dan seluruh anggota tim telah melakukan sesi bedah kode bersama.