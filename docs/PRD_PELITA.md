# PRD — PELITA

**Product Requirements Document**

| | |
|---|---|
| Nama produk | **PELITA** (nama sementara) |
| Judul lengkap | PELITA: Platform Belajar Adaptif Berbasis AI yang Menyesuaikan Kondisi Kesehatan Harian untuk Menjaga Keberlanjutan Pendidikan Anak dengan Penyakit Kronis |
| Konteks | Hackathon FIRETECH 2026, tema *AI Innovation Sprint – Harmonizing Tech and Humanity: Creating Solutions for a Better Society* |
| Subtema | Pendidikan dan Literasi Digital, dengan konteks Kesehatan (pilih keduanya jika boleh) |
| Versi | 1.0 · 7 November 2026 (hari-H) |
| Status | Disetujui tim untuk dibangun dalam 24 jam |
| Lokasi lomba | Telkom AI Center Padang, 7–8 November 2026 |

**Hubungan dengan dokumen lain.** PRD ini menjelaskan *apa* yang dibangun dan *kenapa*. Aturan teknis rinci untuk AI coding assistant ada di `PANDUAN_PROYEK.md`, struktur kode di `ARSITEKTUR_TEKNIS.md`, dan jadwal di `rencana_24_jam_pelita.md`. Isi keempatnya sudah diselaraskan. Jika suatu saat ada perbedaan, **PANDUAN yang berlaku** untuk aturan teknis, dan PRD yang berlaku untuk lingkup produk.

---

## Daftar isi
1. Ringkasan
2. Latar belakang dan masalah
3. Solusi yang sudah ada dan celahnya
4. Tujuan, non-tujuan, dan ukuran keberhasilan
5. Pengguna, persona, dan peran
6. Proposisi nilai dan pembeda
7. Lingkup rilis
8. Alur pengguna
9. Kebutuhan fungsional
10. Aturan bisnis
11. Kecerdasan buatan (AI)
12. Data dan konten
13. Kebutuhan non-fungsional
14. Desain dan pengalaman pengguna
15. Arsitektur dan teknologi
16. Validasi asesmen (uji siswa virtual)
17. Demo, presentasi, dan tanya jawab
18. Rencana eksekusi 24 jam
19. Risiko dan mitigasi
20. Roadmap setelah lomba
21. Asumsi, ketergantungan, dan pertanyaan terbuka
22. Lampiran

---

## 1. Ringkasan

**Satu kalimat:** PELITA adalah platform belajar adaptif untuk anak SD dengan penyakit kronis yang menyesuaikan materi bukan hanya dengan kemampuan anak, tetapi juga dengan kondisi fisiknya hari itu, dan menjembatani progres belajarnya kembali ke sekolah asal.

**Deskripsi singkat (±75 kata, untuk pendaftaran):** PELITA adalah platform belajar untuk anak usia sekolah dasar yang tidak dapat bersekolah rutin karena menjalani pengobatan jangka panjang. Setiap hari, PELITA menyesuaikan cara dan beban belajar dengan kondisi anak, sehingga anak tetap belajar tanpa merasa terbebani. PELITA juga membantu menemukan bagian pelajaran yang paling perlu dikejar anak, lalu menyampaikan perkembangan belajarnya kepada orang tua dan sekolah, agar anak dapat kembali ke kelasnya tanpa tertinggal.

**Makna nama:** *pelita* adalah lentera kecil yang menerangi jalan saat gelap. Maskotnya lentera kecil bernama **Pijar**. Kalimat penutup: *"Pelita, agar sakit tidak memadamkan cahaya belajar mereka."*

**Prinsip produk:** "**AI membantu, manusia memutuskan**" di setiap titik sensitif.

---

## 2. Latar belakang dan masalah

### 2.1 Data pendukung (dicek per 3 November 2026)

| Fakta | Angka | Sumber |
|---|---|---|
| Kasus baru kanker anak usia 0–19 tahun di Indonesia | ±11.156 (estimasi 2020) | Kemenkes, RAN Kanker Anak 2025–2029 |
| Leukemia sebagai jenis terbanyak | 3.880 kasus (34,8%) | Kemenkes |
| Perkiraan total kasus vs yang teridentifikasi | ±100.000 vs ±12.000 (<10%) | CNA Indonesia mengutip Kemenkes dan IDAI |
| Kesintasan kanker anak Indonesia | ±24%, target >50% | Kemenkes, RAN 2025–2029 |
| Pembanding kesintasan | >80% di negara berpenghasilan tinggi; <30% di sebagian negara berpenghasilan rendah-menengah | WHO via Childhood Cancer International |
| Lama pengobatan leukemia limfoblastik akut | 2–3 tahun, kemoterapi bersiklus | Universitas Airlangga (2023) |
| Kualitas hidup anak kanker (RSUP Hasan Sadikin, 60 anak) | 53,3% kualitas hidup buruk; **fungsi sekolah skor terendah (40,08)** vs fisik 50,74, emosi 48,50, sosial 68,67 | Nurhidayah dkk. (2016) |
| Dampak sekolah (766.217 anak, Skotlandia) | 1,82× lebih sering tidak hadir (kanker darah 2,04×); 2,15× lebih berisiko berprestasi rendah | Baughan dkk., PLoS One (2023) |
| Bukti intervensi dukungan pendidikan | Belum jelas, hanya 4 studi | Tinjauan Cochrane |
| Regulasi | Permendikbud 72/2013 tentang Pendidikan Layanan Khusus tidak menyebut anak dengan penyakit kronis secara eksplisit | Permendikbud 72/2013 |
| Konteks lokal | RS M. Djamil adalah rumah sakit rujukan nasional untuk Sumatera Bagian Tengah | Kemenkes (Juli 2026) |

Catatan penggunaan data: sebut tahun untuk angka 11.156 (estimasi 2020); jangan mencampur kesintasan 24% dengan klaim "90% bisa disembuhkan bila terdeteksi dini"; studi Skotlandia adalah bukti internasional; kutipan wawancara ditampilkan anonim dan atas izin. Data khusus Sumatera Barat (jumlah pasien kanker anak per tahun di RS M. Djamil, jumlah anak thalasemia) belum ditemukan dari sumber terbuka.

### 2.2 Validasi pengguna
Wawancara dengan penyintas leukemia anak di Sumatera Barat:
- Pengobatan sekitar **2 tahun**, minimal **2 minggu per bulan dirawat penuh** di rumah sakit; bisa **sebulan penuh** bila ada komplikasi.
- Motivasi belajar turun karena sakit.
- Tugas sekolah dititipkan lewat orang tua **"tanpa melihat kondisi anak"**.
- Saat kembali ke sekolah, **sulit mengejar** teman-temannya.
- Yang dibutuhkan: **fleksibilitas, belajar tanpa stres, dan beban yang lebih ringan**.

### 2.3 Rumusan masalah
1. **Cara mengejar ketertinggalan tidak melihat kondisi anak.** Beban belajar sama untuk hari ketika anak segar maupun ketika ia lemas setelah kemoterapi.
2. **Tidak ada yang tahu persis di mana pemahaman anak terputus.** Anak yang tertinggal di pecahan bisa jadi sebenarnya belum kuat di perkalian.
3. **Tidak ada jembatan ke sekolah asal.** Progres belajar anak selama pengobatan tidak tercatat dalam bahasa kurikulum yang dipahami wali kelas.
4. **Kondisi emosional anak** jarang tersaring dan dihubungkan ke dukungan yang tepat.

**Framing utama:** *"Indonesia sedang berjuang menaikkan angka kesembuhan kanker anak. Tapi setiap anak yang berhasil diselamatkan nyawanya juga harus diselamatkan masa sekolahnya."*

---

## 3. Solusi yang sudah ada dan celahnya

| Solusi | Bentuk | Celah yang diisi PELITA | Posisi |
|---|---|---|---|
| **Sekolahku (YKAKI)** | Sekolah gratis tatap muka di rumah singgah dan rumah sakit mitra | Anak yang sudah pulang ke rumah di antara siklus pengobatan | Calon mitra |
| **Hospital Schooling RS M. Djamil Padang** (diluncurkan Juli 2026) | Belajar-bermain untuk pasien anak rawat inap bersama relawan Aruna | Melanjutkan pendampingan setelah anak pulang | **Calon mitra utama** |
| **Colourise (Unair)** | Aplikasi terapi seni dan *storytelling* untuk anak kanker | Fokus pendidikan akademik dan laporan ke sekolah | Pelengkap |
| Ruangguru, Rumah Belajar, YouTube | Fleksibel waktunya, materi sama untuk semua anak | Tidak menyesuaikan kondisi harian, tidak mencari akar kesulitan, tidak melapor ke sekolah asal | Bukan sasaran yang sama |

Semua lembaga di Sumatera Barat (RS M. Djamil, YKI Sumbar, IZI Sumbar, HIMPONI Sumbar, Dinas PPPA, Dinas Pendidikan) berstatus **calon mitra** sampai ada kesepakatan resmi.

---

## 4. Tujuan, non-tujuan, dan ukuran keberhasilan

### 4.1 Tujuan produk
- **T1.** Anak tetap belajar selama pengobatan dengan beban yang sesuai kondisinya hari itu.
- **T2.** Menemukan titik mulai belajar yang tepat dengan soal sesedikit mungkin.
- **T3.** Menjelaskan kesalahan anak dengan bahasa anak, berdasarkan miskonsepsinya.
- **T4.** Memberi orang tua kendali dan gambaran yang jelas, serta laporan yang bisa dipakai sekolah asal.
- **T5.** Menyaring kondisi emosional anak dan menghubungkannya ke manusia yang tepat.

### 4.2 Tujuan hackathon
- Demo 130 detik berjalan mulus dan bisa diulang.
- Kode rapi, modular, logika inti teruji, dan setiap anggota bisa menjelaskan modulnya.
- Siap menjawab pertanyaan juri dengan bukti (halaman admin, hasil uji, tes unit).

### 4.3 Non-tujuan
- PELITA **tidak menerbitkan rapor** dan **tidak menentukan kenaikan kelas**. Itu kewenangan sekolah.
- PELITA **tidak memberi diagnosis** medis atau psikologis dan tidak menyimpan diagnosis atau data obat.
- PELITA **bukan tempat curhat utama** anak. Teman Cerita adalah penyaring yang menghubungkan ke manusia.
- PELITA **tidak menggantikan** guru, sekolah, atau layanan pendidikan rumah sakit.
- Di MVP tidak ada model yang dilatih dari nol.

### 4.4 Ukuran keberhasilan

| Lingkup | Ukuran | Target |
|---|---|---|
| Asesmen (simulasi, sudah diukur) | Status TP sesuai kondisi sebenarnya | ≥95% pada kondisi normal (tercapai: 95,4%) |
| Asesmen (simulasi) | Rata-rata soal per mapel | Jauh di bawah menguji semua TP (18 vs 44 soal) |
| Demo | Alur Raka berjalan dari reset sampai laporan | 3 kali berturut-turut tanpa gagal sebelum naik panggung |
| Teknis | Tes unit `/lib/bkt`, `/lib/sesi`, `/lib/krisis` | Semua lulus; hasil asesmen Raka sama dengan `tes_kasus_bkt.json` |
| AI | Respons AI tutor saat demo | ≤ batas waktu 8 detik, atau otomatis memakai cadangan |
| Pilot (setelah lomba) | Ketercapaian TP per anak, keberlanjutan belajar selama pengobatan, kesiapan kembali ke sekolah menurut wali kelas, kepuasan orang tua, **nol eskalasi krisis yang terlewat** | Ditetapkan bersama mitra |

---

## 5. Pengguna, persona, dan peran

### 5.1 Persona demo
- **Raka**, 10 tahun, kelas seharusnya 4, kelas terakhir 3, leukemia fase pemeliharaan. Profil penguasaan Matematika: menguasai A1–A8, B1, B2, B6; **belum menguasai B3 (perkalian)**, sehingga B4, B5, B7, B8 juga belum. Titik mulai yang benar: **B3**.
- **Ibu Sari**, orang tua Raka: pemantau dan pengambil keputusan.
- **Kak Dina**, guru pendamping (di-seed, hanya melihat dan mengusulkan).
- **Admin**: tim PELITA di MVP. Setelah lomba, pengelola platform bersama mitra.

Semua data demo memakai nama samaran dan diberi label "data contoh".

### 5.2 Peran sistem
Hanya **tiga peran**:

| Peran | Keterangan |
|---|---|
| **Admin** | Mengelola kurikulum, konten, bank soal (termasuk meninjau soal buatan AI), layanan dukungan, antrean rujukan dan eskalasi, verifikasi pengguna, log aktivitas, pengaturan ambang batas aturan AI, dan evaluasi kinerja AI |
| **Pendamping** | Satu peran untuk orang tua, wali, dan guru pendamping, dibedakan lewat `PENDAMPINGAN.hubungan` (`orang_tua`, `wali`, `guru`) |
| **Anak** | **Bukan akun.** Profil di bawah pendamping; tidak ada di tabel `USERS`, tidak punya nomor HP, email, atau password. Masuk dengan mengetuk avatar; PIN anak opsional |

**Kenapa anak bukan akun:** menghindari pemborosan akun, meminimalkan data pribadi anak, dan menjaga kendali tetap di orang tua. Di satu perangkat, pendamping login sekali, lalu muncul layar pilih profil (avatar anak atau tombol "Pendamping"). Masuk ke mode pendamping dari mode anak **wajib memakai PIN pendamping**.

### 5.3 Matriks akses (wajib ditegakkan di server, bukan hanya disembunyikan di UI)

| Aksi | Anak | Orang tua / Wali | Guru pendamping | Admin |
|---|---|---|---|---|
| Belajar, kuis, check-in | Ya | Bantu check-in | — | — |
| Bercerita ke chatbot | Ya | — | — | — |
| Ubah profil, data kesehatan, mode jeda, batas layar | — | Ya | Usul saja | — |
| Lihat progres detail per TP | Peta positif saja | Ya | Ya (anak binaannya) | Agregat |
| Lihat ringkasan kategori skrining | — | Ya | Lihat saja | Antrean |
| Baca transkrip chatbot | — | — | — | — (transkrip tidak disimpan) |
| Setujui rujukan komunitas | — | **Hanya orang tua/wali** | — | — |
| Lewati prasyarat wajib | — | — | Ya | — |
| Unduh/kirim laporan ke sekolah | — | Ya | Ya | — |
| Hapus data / reset progres | — | **Hanya orang tua/wali** | — | — |
| Kelola kurikulum, konten, soal | — | — | — | Ya |
| Tinjau dan terbitkan soal buatan AI | — | — | Usul revisi | Ya |
| Lihat log aktivitas akun | — | — | — | Ya |
| Ubah ambang batas aturan AI | — | — | — | Ya (dalam rentang aman, tercatat) |
| Lihat evaluasi kinerja AI | — | — | — | Ya |
| Beri penilaian pada keluaran AI | — | Ya | Ya | Ya |

Yang **tidak bisa** diakses anak: pengaturan profil dan kesehatan, mode jeda, batas layar, progres detail dan angka, ringkasan skrining, persetujuan rujukan, laporan sekolah, dan semua menu admin. Anak hanya melihat peta yang dibingkai positif.

Orang tua adalah **pemantau dan pengambil keputusan**: semua yang butuh persetujuan dikumpulkan di **"Keputusan Menunggu"**.

---

## 6. Proposisi nilai dan pembeda

**Tiga pembeda utama:**
1. **Belajar adaptif terhadap kondisi harian.** Check-in kondisi menentukan beban dan format sesi; hari istirahat tidak dihukum.
2. **Asesmen diagnostik dua jalur.** Kognitif: asesmen adaptif berbasis peta prasyarat menemukan akar kesulitan dan titik mulai. Non-kognitif: Teman Cerita menyaring kebutuhan emosional dan merujuk ke dukungan.
3. **Jembatan ke sekolah asal.** Laporan capaian per Tujuan Pembelajaran (TP) yang dipetakan ke Kurikulum Merdeka.

**Nilai per pihak:**
- **Anak:** belajar tetap berjalan tanpa stres, sesuai kondisinya.
- **Orang tua:** tidak perlu menebak harus mengajar apa; keputusan tetap di tangan mereka.
- **Sekolah:** laporan capaian yang bisa langsung dipakai sebagai bukti asesmen.
- **Mitra (Hospital Schooling, yayasan):** pendampingan berlanjut saat anak sudah pulang ke rumah.
- **Skala:** sistem tidak bergantung pada mata pelajaran, lokasi, atau jenis penyakit; mapel lain cukup ditambah lewat data.

---

## 7. Lingkup rilis

Aturan memilih fitur: **(A)** tampil di demo ±130 detik → bangun penuh; **(B)** menjawab pertanyaan juri yang hampir pasti muncul → versi sederhana untuk tab cadangan tanya jawab; selain itu → data contoh, rancangan Google Stitch, atau roadmap. Lima fitur yang jalan mulus lebih bernilai daripada lima belas fitur setengah jadi.

### 7.1 A — Bangun penuh (tampil di demo)

| ID | Fitur |
|---|---|
| A1 | Login akun demo (email + password) → pilih profil (avatar anak / Pendamping + PIN) |
| A2 | Check-in harian + `tentukanLevel` yang benar-benar mengubah isi sesi; tombol speaker (Web Speech API) |
| A3 | Asesmen adaptif Matematika (BKT + penelusuran prasyarat) dengan **mode demo "putar otomatis"** |
| A4 | Peta TP dengan menu **Kelasku** dan **Pos Dasar** (grid per kelas berwarna status) |
| A5 | Sesi belajar **TP B3**: kartu belajar → kuis formatif → update BKT, termasuk cek "Masih kuat?". TP lain menampilkan "segera hadir" |
| A6 | **AI tutor** berdasarkan `miskonsepsi`, dengan cadangan |
| A7 | Dashboard pendamping: ringkasan, tren check-in, progres per TP (status, bukan persen), kartu "perlu perhatian", **draf laporan sekolah buatan AI** + halaman cetak |
| A8 | Maskot Pijar beranimasi |
| A9 | Tombol **Reset demo** di admin |
| A10 | Tes unit untuk `/lib/bkt`, `/lib/sesi`, `/lib/krisis` |

### 7.2 B — Versi sederhana (untuk tanya jawab)

| ID | Fitur |
|---|---|
| B1 | Teman Cerita: skrining chip → deteksi krisis aturan tetap → level rujukan → Keputusan Menunggu; eskalasi masuk antrean admin. LLM hanya jika sempat |
| B2 | Admin **Aturan AI**: ubah parameter dalam rentang aman + alasan + tercatat (riwayat versi; tombol kembalikan jika sempat) |
| B3 | Admin **bank soal + "Buat variasi soal dengan AI" + antrean tinjauan** dengan validasi kunci otomatis |
| B4 | Admin **Evaluasi AI**: hasil uji siswa virtual (berlabel "hasil simulasi") + hitungan nyata dari `LOG_AI` |
| B5 | Admin log aktivitas (tabel + filter) dan antrean eskalasi |
| B6 | Onboarding: data Raka di-seed; formulir survei satu halaman hanya jika sempat |
| B7 | Ceroboh naik ke 0,30 saat anak memilih "agak capek" (satu nilai pengaturan) |

### 7.3 Data contoh / di-seed
Profil Raka, Ibu Sari, Kak Dina; riwayat check-in 3–4 minggu; satu skrining dan satu rujukan menunggu; metrik Evaluasi AI selain asesmen dan keandalan teknis; akun guru pendamping (hanya melihat).

### 7.4 Roadmap (dijawab lisan atau di slide)
OTP SMS/WhatsApp, verifikasi guru oleh admin, mode offline/PWA, lapis koreksi otomatis (desain sudah ada di 10.3), checkpoint retensi, tipe soal benar/salah dan susun kata (dengan `tebakan` per tipe), laporan naratif harian, pratinjau dampak perubahan ambang, berbagi laporan lewat tautan ke wali kelas, Bahasa Indonesia elemen Membaca (data sudah siap), IPAS dan Pendidikan Pancasila sebagai pustaka materi, kalibrasi BKT dari data, personalisasi dari pola check-in, komunitas orang tua, kode rujukan rumah sakit, mode serah perangkat, evaluasi AI lanjutan (kalibrasi otomatis, uji A/B prompt).

### 7.5 Tidak dipakai (keputusan desain)

| Ide | Alasan |
|---|---|
| Soal dibuat LLM langsung untuk anak | Kunci bisa salah, tidak ada data miskonsepsi, ada jeda saat demo |
| LLM menganalisis mood dan menghentikan sesi | Keputusan keselamatan harus memakai aturan tetap yang bisa diaudit |
| Rekaman suara anak | Data pribadi anak |
| Tes penempatan 5 soal di kelas terakhir saja | Tidak bisa menemukan celah di bawah kelas terakhir |
| Persen BKT ditampilkan ke orang tua | Itu peluang, bukan nilai; bisa disalahartikan wali kelas |
| Reset paksa nilai BKT ke 0,65 di checkpoint | Tidak perlu; BKT biasa sudah menurunkan sendiri (dua salah dari 0,95 menjadi 0,25) |
| Streak harian yang bisa putus | Menghukum hari istirahat |

---

## 8. Alur pengguna

### 8.1 Onboarding (desain lengkap; di MVP diganti akun demo dan data seed)
1. Pendamping mendaftar (nama, nomor HP, OTP) dan memilih hubungan dengan anak.
2. Persetujuan data: penjelasan apa yang bisa dan tidak bisa dilihat pendamping.
3. Profil anak: nama panggilan, tanggal lahir, avatar.
4. Survei awal: kelas terakhir, kelas seharusnya (otomatis dari usia, bisa diubah), tanggal berhenti sekolah, nama sekolah asal (opsional), status di sekolah asal.
5. Konteks kesehatan **minimal**: fase pengobatan (`intensif`, `pemeliharaan`, `pemulihan`), batas waktu layar, mode jeda. **Tidak menyimpan diagnosis atau data obat.**
6. Atur PIN pendamping.
7. Asesmen diagnostik "Petualangan Pertama", didampingi pendamping.

### 8.2 Siklus harian anak
Pilih avatar → check-in → sistem menentukan level sesi → kartu belajar dan kuis per TP (sesuai level) → update status TP → cek "Masih kuat?" bila terpicu → selesai dengan pujian. Secara berkala: laporan untuk orang tua dan sekolah.

### 8.3 Alur pendamping
Login → PIN → dashboard (ringkasan, tren check-in, kartu perlu perhatian, Keputusan Menunggu) → progres per TP → buat draf laporan AI → sunting → cetak/simpan PDF.

### 8.4 Alur admin
Login admin → Aturan AI / Bank soal + tinjauan soal AI / Evaluasi AI / Log aktivitas / Antrean eskalasi / Reset demo.

### 8.5 Asesmen ulang
- Saat mode jeda panjang berakhir: cek singkat TP yang sedang dipelajari.
- Sebelum anak kembali ke sekolah: pastikan laporan sesuai kondisi terbaru.

---

## 9. Kebutuhan fungsional

Format: kebutuhan → kriteria penerimaan (KP).

### 9.1 Login, profil, dan PIN (A1)
- **F-AUTH-1** Pendamping dan admin login dengan email + password.
  - KP: password disimpan sebagai hash bcrypt; sesi disimpan di cookie terenkripsi `httpOnly`, `secure`, `sameSite=lax`; logout menghapus sesi; login dan logout tercatat di `LOG_AKTIVITAS`.
- **F-AUTH-2** Setelah login pendamping, tampil layar pilih profil: avatar setiap anak yang didampingi + tombol "Pendamping".
- **F-AUTH-3** Masuk ke mode pendamping dari mode anak wajib PIN pendamping.
  - KP: PIN dicek di server terhadap `pin_pendamping_hash`; percobaan dibatasi (misalnya kunci 5 menit setelah 5 kali salah); sesi menyimpan penanda `mode_pendamping` hanya setelah PIN benar.
- **F-AUTH-4** Setiap API route memeriksa peran dan relasi `PENDAMPINGAN` sebelum menyentuh data anak.
  - KP: permintaan ke data anak lain ditolak walaupun URL diketik manual; aksi khusus orang tua/wali ditolak untuk akun guru.

### 9.2 Check-in harian (A2)
- **F-CHK-1** Anak memilih **energi** (lemas / lumayan / semangat), **cuaca hati** (cerah / berawan / hujan / badai), dan **keluhan** opsional (misalnya mata lelah, pusing, sakit sekali). Pendamping boleh membantu mengisi.
- **F-CHK-2** Sistem memanggil `tentukanLevel(checkin, anak)` (aturan di 10.1) dan menampilkan isi sesi yang sesuai level.
  - KP demo: "lemas 🌧️ + mata lelah" → level ringan, **mode audio**, ±5 menit mengulang materi yang sudah dikuasai; "semangat" → materi baru.
- **F-CHK-3** Hari istirahat yang dilaporkan lewat check-in tetap dihitung hari aktif.
- **F-CHK-4** Setiap instruksi punya tombol speaker (Web Speech API, `id-ID`).
- **F-CHK-5** 3 check-in berturut-turut berenergi lemas atau berkeluhan → kartu "perlu perhatian" di dashboard orang tua dan guru (lihat 9.8).
- **F-CHK-6** Cuaca hati hujan/badai menurunkan level dan menawarkan Teman Cerita; 3 hari berturut-turut → Teman Cerita menyapa proaktif.

### 9.3 Asesmen adaptif (A3)
- **F-ASM-1** Asesmen per mata pelajaran memakai BKT + penelusuran graf prasyarat (algoritma di 10.2).
- **F-ASM-2** TP pertama yang diuji: TP di tengah daftar TP kelas `kelas_seharusnya − 1` (urut menurut `urutan`, indeks `floor(jumlah/2)` mulai dari 0). Untuk Raka: B3.
- **F-ASM-3** Soal diambil dari bank soal berstatus `terbit` dengan `penggunaan = diagnostik`; **urutan pilihan diacak** saat ditampilkan.
- **F-ASM-4** Umpan balik **netral** selama asesmen ("Oke, lanjut!"); tidak ada benar/salah.
- **F-ASM-5** Maksimal 12 soal per sesi asesmen; status penelusuran disimpan sehingga bisa dilanjutkan. Asesmen satu mapel dirancang selesai dalam **2 sesi** (rata-rata 18 soal; 90% anak ≤ 24).
- **F-ASM-6** Hasil: status per TP (`tercapai`/`belum`/`belum_diketahui`), sumber status (`diuji`/`disimpulkan`), `p_menguasai`, dan **titik mulai**.
- **F-ASM-7 Mode demo "putar otomatis"**: tombol yang mengirim jawaban Raka (benar jika TP dikuasai, salah jika tidak) ke `/api/asesmen` setiap ±1,5 detik. Batang peluang bergerak dan peta TP berubah warna.
  - KP: **yang di-skrip hanya jawabannya**; pemilihan TP, angka peluang, penyimpulan, dan titik mulai dihitung mesin BKT yang sama. Hasil harus sama dengan `data/tes_kasus_bkt.json`: urutan TP diuji B3 → A4 → A7 → A8 → A5 → B2, **17 soal**, titik mulai **B3**, B6 berstatus `belum_diketahui`. Selesai dalam ±25 detik.
- **F-ASM-8** Angka peluang hanya terlihat di mode demo dan halaman admin.

### 9.4 Peta TP (A4)
- **F-PETA-1** Dua menu: **Kelasku** (TP sesuai kelas seharusnya) dan **Pos Dasar** (TP prasyarat yang belum tercapai / modul jembatan).
- **F-PETA-2** Tampilan grid per kelas, warna sesuai status; dibingkai positif untuk anak ("3 pos lagi menuju Pecahan!"), tanpa label "tertinggal".
- **F-PETA-3** Saat fase pengobatan `intensif`, tampilkan hanya TP berlabel `esensial_transisi`.
- **F-PETA-4** Hanya TP B3 yang punya konten di MVP; TP lain menampilkan "segera hadir".

### 9.5 Sesi belajar (A5)
- **F-SESI-1** TP baru atau `p_menguasai` < 0,40 → **kartu belajar dulu** (konten disiapkan + tombol speaker), baru kuis.
- **F-SESI-2** Kuis formatif pilihan ganda; setiap jawaban memperbarui BKT dengan `belajar_saat_sesi` (0,15). TP tercapai jika minimal 3 soal dan p ≥ `ambang_tercapai_sesi` (0,95).
  - KP: dari status belum (p 0,017), urutan jawaban salah-benar-benar-benar-benar menghasilkan p 0,152 → 0,483 → 0,805 → 0,947 → 0,987; tercapai pada jawaban ke-5.
- **F-SESI-3** Jumlah soal mengikuti level: ringan 1–2 soal santai (tidak memengaruhi status TP), normal 3–5 soal formatif, penuh kuis lengkap.
- **F-SESI-4** Jawaban salah ditampilkan lembut ("Yuk, coba lihat lagi"), memicu AI tutor, maskot berpose `coba_lagi`.
- **F-SESI-5** Kuis gagal 2 kali → TP ditandai untuk ditinjau guru pendamping; anak tidak dipaksa mengulang terus.
- **F-SESI-6** Status TP berpindah `belum` → `jembatan` (sedang dikejar di Pos Dasar) → `tercapai`.

### 9.6 Cek "Masih kuat?" (A5)
- **F-KUAT-1** Muncul saat durasi level tercapai, **atau** setelah 3 jawaban salah berturut-turut, **atau** di tengah sesi `penuh`. Keputusan memakai aturan tetap, **bukan LLM**.
- **F-KUAT-2** Tiga pilihan ikon dan tindakannya:

| Pilihan | Tindakan |
|---|---|
| 😊 Masih kuat | Lanjut; jika durasi level sudah tercapai, tawarkan selesai dengan pujian |
| 😪 Agak capek | Lanjut tanpa materi baru; `ceroboh` sisa sesi = `ceroboh_lelah` (0,30) |
| 🤒 Mau istirahat / pusing | Sesi berhenti, progres tersimpan, pesan istirahat dari Pijar; jika pusing, muncul kartu di dashboard pendamping |

- **F-KUAT-3** Sesi yang dihentikan di tengah tidak dihitung gagal.

### 9.7 AI tutor (A6)
- **F-TUTOR-1** Input: pertanyaan, jawaban anak, kunci, `miskonsepsi` pilihan yang dipilih, deskripsi TP, kelas anak. **Tanpa nama atau ID anak.**
- **F-TUTOR-2** Output JSON tervalidasi: penjelasan ≤3 kalimat berbahasa anak + satu langkah petunjuk; bisa dibacakan.
- **F-TUTOR-3** Jika timeout (8 detik), gagal validasi, atau `demo.pakai_cadangan` aktif → pakai jawaban cadangan tersimpan, lalu `pembahasan` soal.
- **F-TUTOR-4** Pendamping/guru bisa memberi jempol (membantu/tidak membantu) yang tersimpan di `UMPAN_BALIK_AI`.
- KP demo: soal B3-D3 (6 × 7), Raka memilih **13** → penjelasan "menjumlahkan, bukan mengalikan" dan 6 × 7 sebagai 6 kelompok berisi 7.

### 9.8 Dashboard pendamping (A7)
- **F-DASH-1** Ringkasan minggu ini (target per minggu), tren check-in (energi dan cuaca hati).
- **F-DASH-2** Kartu **"perlu perhatian"** (amber) saat 3 check-in berturut-turut lemas/berkeluhan, atau anak memilih "pusing" di tengah sesi; berisi saran berkonsultasi dengan tim medis.
- **F-DASH-3** Progres per TP dengan **status** (belum / jembatan / tercapai), bukan persen.
- **F-DASH-4** **Keputusan Menunggu**: daftar hal yang butuh persetujuan (di MVP: rujukan dari Teman Cerita).
- **F-DASH-5** Ringkasan kategori skrining (bukan isi percakapan).
- **F-DASH-6** Guru pendamping hanya melihat anak binaannya dan hanya bisa mengusulkan.

### 9.9 Draf laporan sekolah (A7)
- **F-LAP-1** Tombol "Buat draf laporan" → LLM menyusun deskripsi capaian per TP bergaya rapor Kurikulum Merdeka dari `PROGRES_TP`.
- **F-LAP-2** Label tampilan: **"Draf dibuat AI — periksa sebelum dikirim"**. Pendamping bisa menyunting.
- **F-LAP-3** Halaman cetak (navigasi disembunyikan dengan `print:hidden`) → `window.print()` → simpan sebagai PDF.
- **F-LAP-4** Unduhan tercatat di `LOG_AKTIVITAS`.
- Kalimat klaim yang benar: *"Aplikasi menghasilkan laporan capaian belajar yang dipetakan ke CP dan TP Kurikulum Merdeka sehingga dapat digunakan sekolah asal sebagai bukti asesmen."*

### 9.10 Teman Cerita (B1)
- **F-TC-1** Sapaan + aturan kerahasiaan jujur: *"Ceritamu aman di sini. Tapi kalau kamu dalam bahaya, kakak harus kasih tahu ayah atau ibumu supaya kamu dibantu."*
- **F-TC-2** Skrining tiga dimensi lewat chip/emoji: **perasaan** (cuaca), **sumber**, **kebutuhan**.
- **F-TC-3** Teks bebas (jika ada) **dicek dulu dengan daftar kata/pola krisis** sebelum dikirim ke LLM. Ambang sengaja sensitif.
- **F-TC-4** Jika sinyal krisis: chatbot tetap menemani dengan tenang, **notifikasi langsung ke orang tua**, kasus masuk antrean eskalasi admin (jenis layanan `darurat`, tidak menunggu izin).
- **F-TC-5** Level rujukan ditentukan **tabel aturan**:
  - Level 1 (butuh teman/aktivitas) → grup sebaya termoderasi
  - Level 2 (butuh tempat cerita) → relawan pendamping terlatih
  - Level 3 (distres berulang) → psikolog/konselor mitra
- **F-TC-6** Rujukan level 1–3 butuh **persetujuan orang tua/wali** (masuk Keputusan Menunggu). Orang tua hanya melihat ringkasan kategori.
- **F-TC-7** Tindak lanjut seminggu kemudian.
- **F-TC-8** **Transkrip tidak disimpan**; hanya hasil `SKRINING`.
- Pemicu: tombol "Mau cerita?", cuaca hati hujan/badai 3 hari berturut-turut, skrining berkala.

### 9.11 Admin — Aturan AI (B2)
- **F-ATR-1** Menampilkan dan mengubah semua kunci `PENGATURAN_SISTEM` (daftar lengkap di 10.5).
- **F-ATR-2** Validasi rentang aman di server; tolak nilai di luar rentang dan kombinasi tidak logis (misalnya ambang tercapai ≤ ambang belum).
- **F-ATR-3** Setiap perubahan wajib menyertakan **alasan** dan tercatat (nilai lama, nilai baru, siapa, kapan).
- **F-ATR-4** Pengaturan **berversi**; perubahan hanya berlaku untuk sesi/asesmen baru. Tombol "kembalikan ke versi sebelumnya" jika sempat.
- **F-ATR-5** Daftar kata kunci krisis hanya boleh ditambah/direvisi, **tidak boleh dikosongkan**.
- **F-ATR-6** Sakelar `demo.pakai_cadangan` untuk sinyal panggung buruk.

### 9.12 Admin — Bank soal dan tinjauan soal AI (B3)
- **F-SOAL-1** Daftar soal dengan filter TP, penggunaan, tingkat kesulitan, sumber (manual/AI), status.
- **F-SOAL-2** Tombol **"Buat variasi soal dengan AI"** per TP. Input: deskripsi TP, contoh soal terbit, penggunaan, tingkat kesulitan. Output JSON: pertanyaan, 4 pilihan, kunci, `miskonsepsi` tiap pengecoh, `pembahasan`.
- **F-SOAL-3** Validasi otomatis sebelum masuk antrean: tepat 4 pilihan, tepat 1 kunci, tidak ada pilihan ganda, setiap pengecoh punya miskonsepsi, **kunci soal hitungan dicek ulang dengan perhitungan program**, bahasa sesuai usia, tidak terlalu mirip soal yang ada.
- **F-SOAL-4** Soal masuk antrean berstatus `draf` dengan label "Dibuat AI". Peninjau bisa menerbitkan, menyunting lalu menerbitkan, atau menolak dengan alasan.
- **F-SOAL-5** **Soal AI tidak pernah tampil ke anak sebelum `terbit`.** Soal dari data awal diimpor berstatus `terbit`, sumber `manual`.
- **F-SOAL-6** (Jika sempat) statistik per soal: berapa kali muncul, persentase benar, pengecoh paling sering dipilih.

### 9.13 Admin — Evaluasi AI (B4)

| Fitur AI | Yang diukur | Sumber |
|---|---|---|
| Asesmen BKT | Hasil uji siswa virtual (V0/V3/pembanding, skenario S1–S5); nanti: kesesuaian status tercapai dengan kuis berikutnya, status disimpulkan yang dikoreksi | `hasil_uji_asesmen.json` (berlabel "hasil simulasi"), `PROGRES_TP`, `JAWABAN` |
| AI tutor | % penjelasan dinilai membantu; % anak benar pada percobaan berikutnya | `UMPAN_BALIK_AI`, `JAWABAN` |
| Draf laporan | % draf dikirim tanpa diubah; besar suntingan | `LOG_AI` |
| Generator soal | % diterbitkan vs ditolak; alasan penolakan terbanyak | `SOAL`, `LOG_AKTIVITAS` |
| Teman Cerita | Jumlah eskalasi, % alarm palsu, kasus terlewat | `RUJUKAN` |
| Keandalan teknis | Jumlah panggilan, rata-rata waktu respons, % gagal/timeout, % memakai cadangan | `LOG_AI` (data nyata) |

Untuk chatbot, **alarm palsu lebih dapat diterima daripada kasus terlewat**. Halaman ini tidak menampilkan isi percakapan anak. Metrik selain asesmen dan keandalan teknis diisi data contoh berlabel jelas.

### 9.14 Admin — Log aktivitas, eskalasi, reset demo (B5, A9)
- **F-LOG-1** Dicatat: login, logout, gagal login berulang, ganti PIN; pendaftaran, verifikasi, penonaktifan akun; perubahan peran/hubungan; **akses guru dan admin ke data anak**; persetujuan/penolakan rujukan; penanganan eskalasi; perubahan aturan AI; tindakan bank soal; unduhan laporan.
- **F-LOG-2** Log **hanya bisa ditambah**; tanpa data sensitif (password, PIN, isi cerita). Filter pengguna, jenis tindakan, rentang waktu; ekspor CSV.
- **F-ESK-1** Antrean eskalasi: daftar kasus, tandai ditangani, tandai alarm palsu, catatan tindak lanjut.
- **F-RESET-1** **Reset demo**: riwayat check-in Raka (termasuk 3 hari lemas berturut-turut), profil Ibu Sari dan Kak Dina, satu skrining dan satu rujukan menunggu tetap ada; **progres TP Raka dikosongkan** supaya asesmen bisa diputar ulang; log demo dibersihkan.

---

## 10. Aturan bisnis

### 10.1 Level sesi

| Level | Durasi awal | Isi | Kuis |
|---|---|---|---|
| `istirahat` | 0 menit | Konten santai opsional (cerita, musik) | Tidak ada |
| `ringan` | 5–10 menit | Mengulang TP yang sudah tercapai, audio/video pendek | 1–2 soal santai, tidak memengaruhi status TP |
| `normal` | 15–20 menit | Materi baru atau modul jembatan | 3–5 soal formatif |
| `penuh` | 25–30 menit dengan jeda | Materi baru + latihan + tantangan | Kuis lengkap |

Materi baru hanya di `normal` dan `penuh`. Angka durasi adalah nilai awal yang perlu divalidasi tenaga kesehatan.

```
fungsi tentukanLevel(checkin, anak):          // aturan atas menang
  jika anak.mode_jeda                         → ISTIRAHAT
  jika checkin.keluhan == "sakit sekali"      → ISTIRAHAT (+ tawarkan memberi tahu pendamping)
  level = {lemas: RINGAN, lumayan: NORMAL, semangat: PENUH}[checkin.energi]
  jika checkin.keluhan ada                    → level = min(level, RINGAN); jika "mata lelah" → mode audio
  jika anak.fase_pengobatan == intensif       → turunkan satu tingkat
  jika checkin.cuaca_hati in [hujan, badai]   → turunkan satu tingkat, isi diganti TP yang sudah dikuasai, tawarkan Teman Cerita
  durasi = min(durasi_standar[level], anak.batas_layar_menit)
```

**Motivasi tanpa hukuman:** target dihitung per minggu; hari istirahat yang dilaporkan tetap dihitung aktif; mode jeda membekukan target dan mematikan semua pengingat; bintang dan poin boleh, tanpa streak yang bisa putus.

### 10.2 Asesmen adaptif: Bayesian Knowledge Tracing (BKT)

Parameter (dibaca dari `PENGATURAN_SISTEM`, **tidak ditulis di kode**):

| Parameter | Nilai | Arti |
|---|---|---|
| peluang_awal | 0,5 | Keyakinan awal |
| tebakan | 0,25 | Benar karena menebak (pilihan ganda 4 opsi) |
| ceroboh | 0,10 | Salah padahal paham |
| ceroboh_lelah | 0,30 | Hanya kuis formatif setelah "Agak capek" |
| belajar_saat_asesmen | 0 | Tidak ada pengajaran di antara soal asesmen |
| belajar_saat_sesi | 0,15 | Dipakai saat kuis formatif |
| ambang_tercapai | 0,85 | Asesmen penempatan |
| ambang_tercapai_sesi | 0,95 | Kelulusan TP saat belajar |
| ambang_belum | 0,30 | |
| min_soal_per_tp | 2 | Minimal soal sebelum memutuskan **belum** |
| min_soal_tercapai | 3 | Minimal soal sebelum memutuskan **tercapai** |
| maks_soal_per_tp | 4 | Jangan diturunkan ke 3 |
| berhenti_dini | true | Selesai begitu titik mulai pasti |

```
fungsi perbaruiBKT(p, benar, tebakan, ceroboh, belajar):
  jika benar: p = p*(1-ceroboh) / (p*(1-ceroboh) + (1-p)*tebakan)
  jika salah: p = p*ceroboh / (p*ceroboh + (1-p)*(1-tebakan))
  return p + (1-p)*belajar

fungsi setelahJawab(tp, benar):
  tp.p = perbaruiBKT(...); tp.jumlahSoal += 1
  jika jumlahSoal >= 3 dan p >= 0.85 → putuskan(tp, TERCAPAI)
  jika jumlahSoal >= 2 dan p <= 0.30 → putuskan(tp, BELUM)
  jika jumlahSoal >= 4               → putuskan(tp, p >= 0.5 ? TERCAPAI : BELUM)

fungsi putuskan(tp, hasil):
  TERCAPAI → semua leluhur yang belum dites = DISIMPULKAN_TERCAPAI
  BELUM    → semua keturunan yang belum dites = DISIMPULKAN_BELUM
  perbatasan = TP BELUM dengan urutan terendah yang semua prasyaratnya tercapai
  jika berhenti_dini dan semua TP sebelum perbatasan sudah diketahui → selesai
  jika berhenti_dini → kandidat hanya TP dengan urutan di bawah perbatasan
  jika kandidat kosong → selesai; titik mulai = perbatasan
  selain itu → uji kandidat "di tengah rantai":
     skor = min(leluhur di kandidat, keturunan di kandidat), terbesar dipilih;
     seri → selisih |leluhur − keturunan| terkecil; masih seri → urutan terbesar
```

Nilai rujukan: benar dari 0,5 → 0,7826; salah dari 0,5 → 0,1176; benar dari 0,7826 → 0,9284; salah dari 0,8 → 0,3478 (ceroboh 0,10) atau 0,6154 (ceroboh 0,30). Dua benar = 0,928 (belum boleh tercapai); tiga benar = 0,979 (tercapai); dua salah = 0,017 (belum).

**Kejujuran klaim:** parameter ditetapkan manual dari literatur, jadi ini **model probabilistik, belum machine learning**. Jangan menyebutnya "model yang dilatih". Kalibrasi dari data adalah roadmap.

### 10.3 Prasyarat, Pos Dasar, jalur transisi, dan lapis koreksi
- Sebelum TP baru di Kelasku dimulai, cek prasyaratnya. Jika ada yang belum tercapai, sisipkan **modul jembatan** di **Pos Dasar**, lalu kembali ke TP kelasnya.
- Materi lama yang bukan prasyarat langsung: opsional di Pos Dasar.
- Label `esensial_transisi` diadopsi dari prinsip **ATP Transisi** Kemendikdasmen (ATP yang dipadatkan untuk murid terdampak bencana). Saat fase `intensif`, hanya TP esensial yang tampil.
- Penempatan dilakukan **terpisah per mata pelajaran**.
- **Lapis koreksi** (desain wajib, dibangun setelah lomba): TP berstatus disimpulkan atau belum diketahui diberi 2 soal cek saat pertama kali muncul; jika kuis formatif gagal, prasyarat langsungnya yang berstatus tercapai dicek ulang (2 soal per prasyarat). Alasan: 17,6% penempatan simulasi meleset terlalu tinggi (median 1 TP).

### 10.4 Status TP
`belum` → `jembatan` → `tercapai`, ditambah `belum_diketahui` (akibat berhenti dini). Simpan `sumber_status` (`diuji`/`disimpulkan`) dan `p_menguasai`. `PROGRES_TP.status` disimpan (tidak dihitung ulang) karena dipengaruhi validasi guru.

### 10.5 Pengaturan sistem (`PENGATURAN_SISTEM`)

| Grup | Kunci | Nilai awal | Rentang aman |
|---|---|---|---|
| BKT | `bkt.peluang_awal` | 0,5 | 0,1–0,9 |
| BKT | `bkt.tebakan` | 0,25 | 0,05–0,4 |
| BKT | `bkt.ceroboh` | 0,10 | 0,01–0,3 |
| BKT | `bkt.ceroboh_lelah` | 0,30 | ≥ `bkt.ceroboh`, maks. 0,4 |
| BKT | `bkt.belajar_saat_sesi` | 0,15 | 0–0,5 |
| BKT | `bkt.ambang_tercapai` | 0,85 | 0,7–0,99 (> ambang_belum) |
| BKT | `bkt.ambang_tercapai_sesi` | 0,95 | 0,8–0,99 |
| BKT | `bkt.ambang_belum` | 0,30 | 0,05–0,5 |
| BKT | `bkt.min_soal_per_tp` / `bkt.maks_soal_per_tp` | 2 / 4 | 1–3 / 3–8 |
| BKT | `bkt.min_soal_tercapai` | 3 | 2–5 |
| Asesmen | `asesmen.berhenti_dini` | true | true/false |
| Asesmen | `asesmen.maks_soal_per_sesi` | 12 | 5–20 |
| Sesi | `sesi.durasi_ringan` / `normal` / `penuh` | 10 / 20 / 30 menit | 3–15 / 10–30 / 15–45 |
| Sesi | `sesi.hari_mood_turun_pemicu_chatbot` | 3 | 1–7 |
| Sesi | `sesi.hari_lemas_pemicu_perhatian` | 3 | 2–7 |
| Sesi | `sesi.salah_beruntun_pemicu_cek` | 3 | 2–5 |
| Kuis | `kuis.gagal_sebelum_ditinjau_guru` | 2 | 1–5 |
| Krisis | `krisis.daftar_kata_kunci` | daftar awal (perlu tinjauan psikolog) | tidak boleh kosong |
| Rujukan | `rujukan.aturan_level` | tabel level 1–3 | — |
| LLM | `llm.batas_waktu_detik` | 8 | 3–20 |
| LLM | `llm.maks_kalimat_tutor` | 3 | 1–5 |
| Demo | `demo.pakai_cadangan` | false | true/false |

---

## 11. Kecerdasan buatan (AI)

### 11.1 Dua lapis AI

| Lapis | Peran | Teknik | Dipakai di |
|---|---|---|---|
| **AI pengambil keputusan** | Menentukan *apa* yang dipelajari | BKT + penelusuran graf prasyarat | Penempatan, pemilihan soal, update status TP |
| **AI generatif (LLM)** | Menentukan *bagaimana* disampaikan | API model bahasa | AI tutor, draf laporan sekolah, variasi soal (admin), Teman Cerita (opsional) |

Kedua lapis terhubung lewat field `miskonsepsi` di setiap pilihan jawaban salah: diagnosis dari lapis pertama menjadi bahan penjelasan lapis kedua.

### 11.2 Komponen dan cara menyiapkannya

| Komponen | Teknik | Disiapkan dengan | Diuji dengan |
|---|---|---|---|
| Asesmen adaptif | BKT + graf prasyarat | Parameter dari literatur | Siswa virtual (sudah, bagian 16) |
| AI tutor | LLM | Prompt + data miskonsepsi | Set uji 64 soal × 3 pengecoh = 192 pasangan + rubrik (setelah lomba) |
| Teman Cerita | Chip + tabel aturan; LLM opsional | Prompt + tabel aturan rujukan | Skenario percakapan berlabel level 1–3 dan krisis |
| Deteksi krisis (**bukan AI**) | Daftar kata dan pola | Daftar dari psikolog | Skenario krisis |
| Draf laporan sekolah | LLM | Prompt + contoh gaya deskripsi capaian | Ditinjau guru/orang tua |
| Generator soal | LLM + validasi program | Prompt + contoh soal terbit | % soal lolos tinjauan |
| Insight pola check-in | Statistik + narasi LLM | Aturan perhitungan + prompt | Roadmap |

**Prinsip:** di MVP tidak ada model yang dilatih dari nol. Data buatan dipakai untuk **menguji**, bukan melatih.

### 11.3 Aturan wajib semua pemanggilan LLM
- Hanya dari server; API key hanya di variabel lingkungan server.
- Satu pintu (`/lib/ai/client.ts`): keluaran **JSON** divalidasi skema (Zod); batas waktu dari pengaturan; jika gagal → cadangan; setiap panggilan dicatat di `LOG_AI` (fitur, ringkasan input, output, valid, pakai_fallback, waktu respons, versi prompt).
- Untuk anak: bahasa Indonesia sederhana, maksimal 3 kalimat untuk tutor, ramah, tidak menghakimi, tidak keluar konteks.
- **Tidak pernah** memberi diagnosis medis/psikologis, label kondisi mental, atau saran pengobatan.
- **Guardrail kata sensitif:** tanpa konteks jarum suntik, rumah sakit, obat, atau penyakit parah.
- **LLM tidak pernah mengambil keputusan sistem** (menghentikan sesi, mengubah parameter, menentukan level rujukan).
- Soal untuk anak selalu dari bank soal berstatus `terbit`.
- Keluaran untuk pihak luar (laporan, soal baru) berstatus **draf** dan ditinjau manusia.
- Data minimal ke LLM: tanpa nama dan ID anak. Untuk Teman Cerita, `LOG_AI` hanya menyimpan kategori.
- Jawaban cadangan tersimpan untuk skenario demo (tutor B3-D3 dan draf laporan Raka).

### 11.4 Penyedia LLM
Satu penyedia utama dengan mode keluaran JSON (Gemini atau Anthropic, model versi cepat terbaru) + API key cadangan. Nama model disimpan di variabel lingkungan dan dicek di dokumentasi penyedia pada hari-H. Langganan Claude Max hanya untuk alat kerja tim; API key aplikasi butuh kuota sendiri. Konfirmasi ke panitia bahwa API pihak ketiga boleh dipakai.

---

## 12. Data dan konten

### 12.1 Acuan kurikulum
- **CP:** Keputusan Kepala BSKAP No. 046/H/KR/2025 (16 Juli 2025). Perubahan 2026 (BKPDM No. 020/2026) hanya untuk Agama dan Budi Pekerti.
- **Fase:** A (kelas 1–2), B (kelas 3–4), C (kelas 5–6). CP memakai kata "umumnya", sehingga capaian anak tidak harus sama dengan kelasnya.
- **TP dan ATP:** disusun dari CP 2025 dengan inspirasi contoh ATP Ruang GTK, termasuk ATP Transisi Fase A dan B.
- **Asesmen dan pelaporan:** Panduan Pembelajaran dan Asesmen (PPA) edisi revisi 2025. Istilah yang benar untuk SD: **modul ajar**.

### 12.2 Mata pelajaran
- **Jalur adaptif:** Matematika elemen Bilangan (MVP); Bahasa Indonesia elemen Membaca dan Memirsa (data siap, di luar lingkup 24 jam).
- **Kenapa Matematika dan Bahasa Indonesia:** literasi dan numerasi adalah fondasi semua mapel dan paling berjenjang; mengejar semua mapel sekaligus bertentangan dengan kondisi anak yang berobat.
- **Pustaka materi (roadmap):** IPAS dan Pendidikan Pancasila, tanpa asesmen penempatan; posisi mengikuti bab kelas asal, format menyesuaikan level membaca anak dari hasil Bahasa Indonesia.

### 12.3 File data

| File | Isi | Status |
|---|---|---|
| `data_awal_matematika_fase_A_B.json` | 16 TP (A1–A8, B1–B8), 19 prasyarat, 64 soal diagnostik (4 per TP) dengan miskonsepsi dan pembahasan, parameter BKT | Draf, perlu tinjauan guru SD. **Dipakai di MVP** |
| `data_awal_bahasa_indonesia_fase_A_B.json` | 12 TP (BI-A1–BI-A6, BI-B1–BI-B6), 13 prasyarat, 48 soal (34 dengan kolom `bacaan`), mapel_id 2 | Draf; pembagian kelas perkiraan dari CP. Cadangan |
| `tes_kasus_bkt.json` | Nilai `perbaruiBKT`, keputusan per TP, jejak asesmen Raka, sesi formatif B3 | Siap dipakai tes unit |
| `hasil_uji_asesmen.json` | Hasil uji siswa virtual 5 varian × 5 skenario × 2.000 siswa + jejak Raka | Untuk Evaluasi AI |

Format soal: `id`, `tp_kode`, `penggunaan`, `tingkat_kesulitan` (1–3), `pertanyaan`, `bacaan` (opsional), `visual` (emoji pengganti gambar), `pilihan[{teks, benar, miskonsepsi}]`, `pembahasan`. Kunci di data Matematika sering di posisi kedua, sehingga **pilihan wajib diacak saat ditampilkan**. Semua soal Fase A harus bisa dibacakan.

Rantai penting untuk demo: operasi hitung A1 → A3 → A4 → B3 → B4 → B5; pecahan bercabang A1 → A8 → B6 → B7 → B8, dan B3 → B7.

### 12.4 Data dan konten yang masih harus disiapkan

| No | Barang | Kebutuhan |
|---|---|---|
| 1 | Teks prompt tutor, laporan, generator soal (+ Teman Cerita jika dipakai) | Lengkap dengan skema JSON |
| 2 | Seed pengaturan sistem dan aturan rujukan (JSON) | Dari tabel 10.5 |
| 3 | Daftar kata kunci krisis | Draf, ditandai "perlu tinjauan psikolog" |
| 4 | Daftar layanan dukungan | Nama calon mitra; nomor darurat diverifikasi |
| 5 | 8 soal formatif TP B3 + 2 soal santai | Dari status belum butuh ±5 jawaban benar untuk lulus |
| 6 | 1 kartu belajar perkalian (B3) + 1 audio ulang materi yang sudah dikuasai | Rekaman audio cadangan jika suara `id-ID` tidak tersedia |
| 7 | Contoh gaya deskripsi capaian rapor | Untuk prompt laporan |
| 8 | Data demo Raka (`seed_demo_raka.json`) | Profil, check-in 3–4 minggu (termasuk 3 hari lemas berturut-turut), daftar TP yang dikuasai, satu skrining, satu rujukan menunggu |
| 9 | Jawaban AI cadangan | Tutor B3-D3, draf laporan Raka |
| 10 | Aset maskot Pijar (PNG transparan) dan ikon check-in | — |

### 12.5 Model data (20 tabel)

- `USERS` (id, nama, email, no_hp, password_hash, pin_pendamping_hash, role: admin|pendamping)
- `ANAK` (id, nama_panggilan, tgl_lahir, kelas_terakhir, kelas_seharusnya, tgl_berhenti_sekolah, pin_hash opsional, fase_pengobatan, mode_jeda, batas_layar_menit)
- `PENDAMPINGAN` (pendamping_id, anak_id, hubungan: orang_tua|wali|guru)
- `MAPEL` (id, nama)
- `TUJUAN_PEMBELAJARAN` (kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi)
- `PRASYARAT_TP` (tp_kode, prasyarat_kode)
- `KONTEN` (id, tp_kode, jenis: baru|ulang|jembatan|santai, format: video|audio|interaktif, durasi_menit, butuh_layar, url)
- `SOAL` (id, tp_kode, penggunaan: diagnostik|formatif|santai, tingkat_kesulitan, pertanyaan, bacaan, visual, pembahasan, sumber: manual|ai, status: draf|ditinjau|terbit|ditolak, dibuat_oleh, ditinjau_oleh, alasan_penolakan)
- `PILIHAN` (id, soal_id, teks, benar, miskonsepsi)
- `CHECKIN` (id, anak_id, tanggal, energi, cuaca_hati, keluhan)
- `SESI` (id, anak_id, checkin_id, jenis: diagnostik|belajar, level, mulai, selesai)
- `JAWABAN` (id, sesi_id, pilihan_id, waktu_respons_ms)
- `PROGRES_TP` (anak_id, tp_kode, status, sumber_status, p_menguasai, diperbarui_at)
- `SKRINING` (id, anak_id, waktu, perasaan, sumber, kebutuhan, level, sinyal_krisis)
- `LAYANAN_DUKUNGAN` (id, nama, jenis: komunitas|konseling|darurat, kontak)
- `RUJUKAN` (id, skrining_id, layanan_id, disetujui_oleh, status, disetujui_at, alarm_palsu, catatan_tindak_lanjut)
- `PENGATURAN_SISTEM` (id, kunci, nilai_json, versi, aktif, alasan, diubah_oleh, diubah_at) — satu baris per versi, satu versi aktif per kunci
- `LOG_AKTIVITAS` (id, user_id, jenis_tindakan, entitas, entitas_id, detail_json, created_at) — hanya bisa ditambah
- `LOG_AI` (id, fitur, anak_id opsional, ringkasan_input, output_json, valid, pakai_fallback, waktu_respons_ms, versi_prompt, created_at)
- `UMPAN_BALIK_AI` (id, log_ai_id, user_id, nilai: membantu|tidak_membantu, komentar, created_at)

Catatan: benar/salah diambil dari `PILIHAN.benar`; `RUJUKAN.disetujui_oleh` hanya sah jika hubungan `orang_tua`/`wali`; database MySQL dengan `utf8mb4`, kolom `*_json` bertipe JSON, waktu disimpan dalam UTC, nama tabel di SQL huruf kecil.

---

## 13. Kebutuhan non-fungsional

### 13.1 Privasi dan kepatuhan
- Minimisasi data (UU PDP No. 27/2022; data anak termasuk sensitif): **tidak ada** diagnosis, data obat, nomor HP, atau email anak.
- Transkrip Teman Cerita tidak disimpan; hanya kategori skrining.
- Log tanpa password, PIN, atau isi cerita.
- Guru pendamping diverifikasi admin sebelum mengakses data anak (roadmap; di MVP di-seed).
- Data demo memakai nama samaran.
- Persiapan produksi: PP 33/2026 berlaku 16 Januari 2027 (DPIA wajib karena memakai AI, catatan kegiatan pemrosesan, DPO, persetujuan orang tua, notifikasi kebocoran 3×24 jam, mekanisme transfer data lintas negara) — lihat bagian 20.

### 13.2 Keamanan
- Hak akses dicek di **setiap** API route (MySQL tidak punya Row Level Security).
- Password dan PIN di-hash bcrypt; cookie sesi terenkripsi, `httpOnly`, `secure`.
- Query SQL selalu berparameter.
- API key dan `SESSION_SECRET` hanya di server.
- Percobaan PIN dibatasi.

### 13.3 Kinerja dan keandalan
- Panggilan LLM berbatas waktu 8 detik, lalu cadangan.
- Aplikasi di Cloud Run dan database di Cloud SQL, keduanya di region Jakarta (`asia-southeast2`).
- Pool koneksi MySQL kecil (±5).
- Demo tetap jalan tanpa internet: aplikasi lokal + video cadangan + sakelar `demo.pakai_cadangan`.

### 13.4 Aksesibilitas dan perangkat
- Target sentuh minimal 56 px di mode anak, teks minim, ikon di setiap aksi.
- Tombol speaker di setiap instruksi; suara `id-ID` dicek di laptop demo.
- Tampilan responsif (HP dan laptop).

### 13.5 Kualitas kode
- Fungsi murni + tes unit untuk logika inti; nama mengikuti istilah dokumen (`tentukanLevel`, `perbaruiBKT`, `p_menguasai`).
- Tidak ada angka ambang, durasi, kata kunci, `mapel_id`, atau kode TP yang ditulis langsung di kode.
- Komentar singkat di logika penting; commit kecil dan sering.
- Setiap modul punya satu pemilik yang bisa menjelaskannya ke juri.

---

## 14. Desain dan pengalaman pengguna

- **Suasana:** hangat, tenang, penuh harapan. **Tidak boleh terlihat seperti aplikasi rumah sakit.**
- **Palet:** teal lembut (utama), peach (aksen), lavender (Teman Cerita), latar krem, amber lembut untuk "perlu perhatian" (bukan merah).
- **Dilarang:** tanda X merah, kata "Salah", timer hitung mundur, papan peringkat, perbandingan dengan anak lain, label "tertinggal".
- **Bahasa:** semua teks antarmuka berbahasa Indonesia. Untuk anak: bingkai positif. Untuk pendamping: data detail.
- **Maskot Pijar:** satu aset PNG, ekspresi lewat gerak tubuh (`motion`): `idle` (mengambang pelan), `senang` (melompat + bintang), `coba_lagi` (miring lembut, **bukan** menggeleng), `lelah` (turun sedikit + "Zzz").
- **Desain referensi:** Google Stitch (dua proyek: aplikasi mobile anak dan pendamping, web admin), termasuk layar Keputusan Menunggu dan halaman admin.

**Daftar layar MVP:** login · pilih profil · PIN · check-in · hasil level/sesi ringan audio · asesmen (dengan mode demo) · peta Kelasku/Pos Dasar · sesi B3 (kartu belajar, kuis, AI tutor, modal "Masih kuat?") · Teman Cerita · dashboard pendamping · laporan (sunting + cetak) · admin: Aturan AI, bank soal + antrean tinjauan, Evaluasi AI, eskalasi, log aktivitas, reset demo.

---

## 15. Arsitektur dan teknologi

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript, satu repo (frontend + API route) |
| Database | **MySQL 8** (`utf8mb4`), `mysql2` + `schema.sql`; Drizzle (mysql) hanya jika ada yang familiar |
| Login | Buatan sendiri: `bcryptjs` + `iron-session` |
| UI | Tailwind CSS + shadcn/ui, `lucide-react` |
| Animasi dan suara | `motion`; Web Speech API |
| State | React state / `useReducer` |
| AI | Vercel AI SDK (`ai`) + Zod; satu penyedia utama + cadangan |
| Grafik | Recharts (hanya Evaluasi AI); peta TP dengan CSS Grid |
| PDF | Halaman cetak + `window.print()` |
| Tes | Vitest |
| Hosting | Google Cloud Platform: Cloud Run + Cloud SQL for MySQL 8 (region `asia-southeast2`, Jakarta); XAMPP (MariaDB) lokal untuk coding |
| Tidak dipakai | React Flow, @react-pdf/renderer, PWA/offline, OTP SMS, Zustand, Supabase |

**Struktur folder ringkas:** `app/(auth)`, `app/anak`, `app/pendamping`, `app/admin`, `app/api/...`; `lib/bkt`, `lib/sesi`, `lib/krisis` (fungsi murni + tes), `lib/ai` (client, prompts, schemas, fallbacks), `lib/pengaturan`, `lib/log`, `lib/evaluasi`, `lib/auth`, `lib/db` (pool, schema.sql, rbac); `components/`, `data/`, `scripts/seed.mts`. Rincian lengkap dan variabel lingkungan ada di `ARSITEKTUR_TEKNIS.md`.

**Alur data utama:** API route membaca pengaturan aktif dari `PENGATURAN_SISTEM` → memanggil fungsi murni (`perbaruiBKT`, `putuskan`, `tentukanLevel`, `cekKataKunciKrisis`) → menyimpan hasil ke MySQL → mencatat log.

---

## 16. Validasi asesmen (uji siswa virtual)

**Metode:** 2.000 siswa virtual per skenario dengan peta penguasaan yang diketahui (kelas seharusnya 2–5; tingkat kuat/sedang/tertinggal/sangat tertinggal). Siswa menjawab benar dengan peluang 1 − ceroboh bila menguasai, atau menebak bila belum.

**Skenario:** S1 ideal; S2 lebih ceroboh (0,20); S3 lebih sering menebak (0,35); S4 10% TP dikuasai tanpa prasyarat; S5 gabungan.

**Varian:** V0 rancangan awal (min 2 soal); V1 tercapai butuh min 3 soal; V2 V1 + maks 3 soal; **V3 V1 + berhenti dini (dipakai)**; B pembanding uji semua 16 TP.

**Hasil kondisi normal (S1):**

| Ukuran | V0 | **V3** | Uji semua TP |
|---|---|---|---|
| Status TP benar | 93,1% | **95,4%** | 94,6% |
| Titik mulai tepat | 67,0% | **76,7%** | 81,5% |
| Titik mulai terlalu tinggi | 28,0% | **17,6%** | 4,5% |
| Rata-rata soal | 17,8 | **18,0** (90% ≤ 24) | 44,0 |

**Temuan penting:**
1. Dua jawaban benar terlalu cepat untuk menyatakan tercapai (6% anak yang belum paham lolos karena menebak) → `min_soal_tercapai` = 3.
2. Maksimal 3 soal per TP memperburuk akurasi → tetap 4.
3. Berhenti dini menghemat ±2 soal tanpa menurunkan akurasi.
4. 55% status diperoleh dari penyimpulan dengan akurasi 96,4%.
5. Kesalahan V3 condong ke atas → perlu lapis koreksi.
6. Kualitas pengecoh paling menentukan (akurasi turun tajam di S3) → perbaiki lewat tinjauan soal.
7. Asesmen satu mapel tidak muat satu sesi → 2 sesi.
8. Aturan "soal ke-4 tercapai jika p ≥ 0,5" hampir tidak pernah menentukan hasil.

**Raka:** jejak ideal B3 ✗✗ → A4 ✓✓✓ → A7 ✓✓✓ → A8 ✓✓✓ → A5 ✓✓✓ → B2 ✓✓✓, 17 soal, titik mulai B3. Dengan jawaban acak (2.000 ulangan), B3 ditemukan pada 73,5% ulangan; hanya 4% meleset ke atas.

**Bahasa Indonesia (V3, S1):** status TP benar 94,7%, rata-rata 12 soal (90% ≤ 16).

**Batasan:** siswa virtual mengikuti model jawaban yang sama dengan BKT kecuali S2–S5; peta penguasaan dari aturan sederhana; semua soal dianggap setara; hanya elemen Bilangan; parameter manual. Angka ini **menguji logika**, belum membuktikan akurasi pada anak sungguhan.

---

## 17. Demo, presentasi, dan tanya jawab

### 17.1 Format
Presentasi **5 menit termasuk demo** + tanya jawab **10 menit** (guidebook v1: 7 + 13 menit; jika itu yang berlaku, demo diperpanjang). Penilaian: Inovasi & Orisinalitas 30%, Relevansi Tema 20%, Kualitas Teknis & Eksekusi 20%, Dampak & Keberlanjutan 15%, Presentasi & Demo 15%.

### 17.2 Susunan presentasi

| Waktu | Bagian | Layar |
|---|---|---|
| 0:00–0:20 | Pembuka dan makna ide | Slide 1: logo dan Pijar |
| 0:20–1:05 | Latar belakang | Slide 2: tiga angka + kutipan penyintas |
| 1:05–1:35 | Masalah utama | Slide 3: celah layanan |
| 1:35–2:00 | Solusi dan value proposition | Slide 4: tiga keunggulan |
| 2:00–4:10 | Demo | Aplikasi |
| 4:10–4:45 | Manfaat dan dampak | Slide 5: manfaat per pihak |
| 4:45–5:00 | Penutup | Slide 6 |

### 17.3 Skenario demo (±130 detik)

| Waktu | Layar | Yang terlihat |
|---|---|---|
| ±25 detik | Check-in | "Lemas 🌧️ + mata lelah" → level ringan, mode audio 5 menit mengulang materi yang dikuasai |
| ±40 detik | Asesmen, putar otomatis | Mulai B3, salah 2 kali → B4, B5, B7, B8 belum tanpa diuji → turun ke A4, A7, A8, A5, B2 yang dikuasai → titik mulai B3 di Pos Dasar |
| ±25 detik | Sesi B3 | Kartu belajar → B3-D3, Raka menjawab 13 → AI tutor |
| ±30 detik | Dashboard Ibu Sari | Tren check-in + kartu perlu perhatian, progres per TP, draf laporan AI → halaman cetak |
| ±10 detik | Teman Cerita | Satu skrining → rujukan masuk Keputusan Menunggu (lewati jika mepet) |

### 17.4 Kesiapan tanya jawab
Tab cadangan: **Aturan AI**, **Evaluasi AI**, **antrean tinjauan soal AI**, dan file `/lib/bkt` + hasil `npx vitest run`. Pertanyaan yang paling mungkin: bedanya dengan platform lain; AI-nya di mana; dataset dan pelatihan model; bagaimana kalau AI salah menempatkan anak; evaluasi AI; siapa yang mengontrol AI; skala masalah; validasi pengguna; fitur yang sudah jalan vs rencana; pemahaman kode hasil vibecoding; anak lelah di tengah sesi; keamanan data anak; pengakuan laporan oleh sekolah; keberlanjutan pendanaan; mitra. Jawaban lengkap ada di dokumen persiapan tanya jawab (36 pertanyaan).

---

## 18. Rencana eksekusi 24 jam

| Jam | Fokus |
|---|---|
| H0–H2 | Inisialisasi proyek, `schema.sql`, seed, akun demo, login + sesi, deploy pertama; Cloud SQL terhubung dari Cloud Run (`asia-southeast2`), uji `utf8mb4`, satu panggilan LLM uji, cek suara `id-ID` |
| H2–H7 | `/lib/bkt` + tes, `/lib/sesi` + tes, API asesmen; check-in, layar asesmen + mode demo, peta TP; dashboard dasar |
| **H7 · cek 1** | **Alur check-in → asesmen → peta jalan** |
| H7–H12 | API sesi + update BKT, `/lib/krisis` + tes; sesi B3, kartu belajar, "Masih kuat?", maskot; laporan AI + halaman cetak, kartu perlu perhatian; AI tutor + cadangan, `LOG_AI` |
| **H12 · cek 2** | **Seluruh alur demo jalan dengan data Raka** |
| H12–H16 | Aturan AI, log aktivitas; Teman Cerita; bank soal + generator + antrean tinjauan, Evaluasi AI; Keputusan Menunggu |
| **H16–H17** | **Fitur dibekukan.** Yang belum jadi pindah ke roadmap |
| H17–H20 | Perbaikan bug, Reset demo, rapikan UI, uji di HP, uji demo berulang |
| H20–H22 | Deploy final, unggah kode sumber, rekam video cadangan, bedah kode per anggota |
| H22–H24 | Latihan presentasi minimal 3 kali dengan stopwatch, latihan tanya jawab |

Giliran tidur 2–3 jam per orang di antara H12 dan H20. Prioritas jika waktu sempit: **asesmen + mode demo → sesi B3 + AI tutor → check-in → dashboard + laporan → admin**.

**Pembagian tim (3–5 orang):**
- Anggota 1 — backend dan algoritma: `/lib/bkt`, `/lib/sesi`, `/lib/krisis`, `/lib/db`, `/lib/auth`, seed.
- Anggota 2 — frontend anak: check-in, asesmen + mode demo, peta, sesi B3, "Masih kuat?", suara, maskot.
- Anggota 3 — pendamping, admin, dan AI: dashboard, laporan, `/lib/ai`, halaman admin, Reset demo.
- Anggota 4 (jika ada): memisahkan frontend pendamping/admin. Anggota 5: QA, demo, slide, latihan tanya jawab.

**Daftar periksa sebelum naik panggung:** Reset demo sudah ditekan; akun login dan setiap layar terbuka di tab sesuai urutan; mode demo asesmen diuji 3 kali berturut-turut; jawaban cadangan aktif; video cadangan siap; tab tanya jawab terbuka; satu orang bicara, satu orang mengoperasikan.

---

## 19. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| API LLM lambat atau mati saat demo | Batas waktu 8 detik, jawaban cadangan, sakelar `demo.pakai_cadangan` |
| Internet panggung bermasalah | Aplikasi lokal + video demo cadangan |
| Cloud SQL tidak bisa dihubungi Cloud Run | Uji di H0–H2; cadangan demo dari localhost (konfirmasi ke panitia untuk tautan prototipe) |
| Emoji rusak di database | `utf8mb4` di database, tabel, dan koneksi; diuji di jam pertama |
| Fitur melebar dan tidak selesai | Titik cek H7, H12; fitur dibekukan H17 |
| Kode buatan AI tidak dipahami tim | Satu pemilik per modul, bedah kode H20–H22 |
| Data demo rusak saat latihan | Tombol Reset demo |
| Suara `id-ID` tidak tersedia | Rekaman audio untuk kartu belajar dan sesi ringan |
| Akses data anak bocor antarakun | `rbac.ts` di setiap route, diuji dengan akun guru dan akun lain |
| Penempatan meleset terlalu tinggi | Lapis koreksi (desain), guru bisa mengoreksi, jelaskan jujur ke juri |
| Tim kelelahan | Giliran tidur; presenter tidur paling cukup |

---

## 20. Roadmap setelah lomba

**Tahap 1 — Siap pilot (1–3 bulan), 10–20 keluarga di satu mitra (misalnya Hospital Schooling RS M. Djamil):**
- Kepatuhan: UU PDP sudah berlaku; PP 33/2026 berlaku 16 Januari 2027. Siapkan DPIA (pemakaian AI adalah pemicu), catatan kegiatan pemrosesan, DPO, persetujuan tertulis orang tua, prosedur notifikasi kebocoran 3×24 jam, mekanisme transfer data lintas negara (server dan API di luar Indonesia) atau hosting di Indonesia. Pendaftaran PSE lingkup privat. Izin komisi etik jika dijadikan penelitian. MoU yang mengatur penanganan eskalasi krisis.
- Keselamatan anak: daftar kata krisis dan skenario Teman Cerita ditinjau psikolog; eskalasi sampai ke petugas yang siaga dengan target waktu respons; durasi sesi divalidasi perawat/dokter onkologi anak; bank soal ditinjau guru.
- Keamanan: MFA admin, batas permintaan API, rotasi semua kunci hackathon, login OTP, verifikasi guru, pembatasan pengguna database (log hanya bisa ditambah).

**Tahap 2 — Rekayasa:** lingkungan dev/staging/production terpisah, migrasi skema, CI (lint, cek tipe, Vitest, Playwright untuk alur kritis), review kode, pemantauan error dan uptime, **alarm jika eskalasi krisis gagal terkirim**, pemantauan LLM (waktu, biaya, persentase cadangan), backup harian dan uji pemulihan, versi prompt dan set uji sebelum rilis.

**Tahap 3 — Perluasan:** kalibrasi BKT dari jawaban nyata dan analisis butir soal, lapis koreksi, mode offline/PWA (uji di Android murah dan sinyal lemah), Bahasa Indonesia, pustaka materi IPAS dan Pendidikan Pancasila, Fase C, tipe soal lain, laporan naratif, berbagi laporan ke wali kelas, personalisasi dari pola check-in, perluasan ke penyakit kronis lain (thalasemia, gagal ginjal) dan daerah lain.

**Keberlanjutan:** gratis untuk keluarga; pendanaan dari yayasan kanker anak, rumah sakit, CSR, dan dinas pendidikan; biaya terbesar layanan AI dan konten, ditekan dengan model kecil untuk fitur yang sering dipakai; hitung biaya per anak per bulan untuk proposal.

---

## 21. Asumsi, ketergantungan, dan pertanyaan terbuka

**Asumsi:** pendamping punya satu perangkat dan koneksi internet; anak SD kelas 1–4 di Fase A–B; konten dan soal draf cukup untuk demo; parameter BKT dari literatur memadai untuk MVP.

**Ketergantungan:** penyedia LLM dan kuotanya; proyek Google Cloud dengan penagihan aktif (Cloud SQL berbayar per jam); aset maskot dan desain Stitch; tinjauan guru, psikolog, dan perawat (setelah lomba).

**Pertanyaan ke panitia:**
1. Durasi presentasi yang berlaku (5 + 10 atau 7 + 13 menit)?
2. Bolehkah memakai API AI pihak ketiga, termasuk berbayar?
3. Bolehkah data awal, teks prompt, dan aset desain disiapkan sebelum hari-H?
4. Apakah tautan prototipe boleh berupa video jika deploy bermasalah?
5. Apakah subtema harus dipilih saat pendaftaran, dan bolehkah lebih dari satu?
6. Apakah proposal masih perlu dikirim?

**Validasi yang masih dibutuhkan:** guru SD (bank soal, pembagian kelas Bahasa Indonesia), psikolog/konselor anak (kata krisis, skenario chatbot), perawat/dokter anak (durasi sesi), sumber resmi (nomor layanan darurat).

---

## 22. Lampiran

### 22.1 TP Matematika (elemen Bilangan) — dipakai di MVP

| Kode | Fase | Kelas | Urutan | Esensial | Deskripsi | Prasyarat |
|---|---|---|---|---|---|---|
| A1 | A | 1 | 1 | ya | Membilang banyak benda, membaca, dan menulis lambang bilangan 0 sampai 20 | — |
| A2 | A | 1 | 2 | ya | Membandingkan dan mengurutkan bilangan cacah sampai 20 | A1 |
| A3 | A | 1 | 3 | ya | Menyusun dan mengurai bilangan serta menentukan nilai tempat (puluhan, satuan) sampai 20 | A1 |
| A4 | A | 1 | 4 | ya | Melakukan penjumlahan dan pengurangan sampai 20 dengan bantuan benda konkret atau gambar | A3 |
| A5 | A | 1 | 5 | ya | Memahami makna simbol '=' dan menyelesaikan soal cerita penjumlahan dan pengurangan sampai 20 | A4 |
| A6 | A | 2 | 6 | ya | Membaca, menulis, membandingkan, dan mengurutkan bilangan cacah sampai 100 | A2 |
| A7 | A | 2 | 7 | ya | Menentukan nilai tempat serta menyusun dan mengurai bilangan cacah sampai 100 | A3, A6 |
| A8 | A | 2 | 8 | tidak | Memahami pecahan setengah dan seperempat sebagai bagian dari keseluruhan | A1 |
| B1 | B | 3 | 9 | ya | Membaca, menulis, membandingkan, dan mengurutkan bilangan cacah sampai 10.000 serta menentukan nilai tempat dan menyusun-mengurai bilangan | A7 |
| B2 | B | 3 | 10 | ya | Melakukan dan menyelesaikan masalah penjumlahan dan pengurangan bilangan cacah sampai 1.000 | A4, B1 |
| B3 | B | 3 | 11 | ya | Melakukan dan menyelesaikan masalah perkalian bilangan cacah sampai 100 dengan bantuan benda konkret, gambar, dan simbol | A4 |
| B4 | B | 3 | 12 | ya | Melakukan dan menyelesaikan masalah pembagian bilangan cacah sampai 100 dengan bantuan benda konkret, gambar, dan simbol | B3 |
| B5 | B | 3 | 13 | tidak | Mengenal kelipatan dan faktor bilangan cacah | B3, B4 |
| B6 | B | 4 | 14 | ya | Membandingkan dan mengurutkan pecahan berpembilang satu dan pecahan berpenyebut sama | A8 |
| B7 | B | 4 | 15 | ya | Mengenal dan menerapkan pecahan senilai menggunakan gambar dan simbol | B6, B3 |
| B8 | B | 4 | 16 | ya | Memiliki intuisi pecahan dan desimal serta menyatakan pecahan sebagai desimal dan persen | B7 |

Pembagian kelas Fase B mengikuti ATP Transisi (kelas 3: bilangan dan operasi; kelas 4: pecahan, desimal, persen). ATP Fase B lain yang melampaui CP 2025 tidak dipakai.

### 22.2 TP Bahasa Indonesia (elemen Membaca dan Memirsa) — cadangan

| Kode | Fase | Kelas | Urutan | Esensial | Deskripsi | Prasyarat |
|---|---|---|---|---|---|---|
| BI-A1 | A | 1 | 1 | ya | Mengenal huruf dan bunyinya, termasuk huruf besar-kecil dan huruf awal sebuah kata | — |
| BI-A2 | A | 1 | 2 | ya | Membaca suku kata dan menggabungkannya menjadi kata | BI-A1 |
| BI-A3 | A | 1 | 3 | ya | Membaca kata sederhana dan memahami maknanya | BI-A2 |
| BI-A4 | A | 1 | 4 | ya | Membaca kalimat sederhana dan memahami maknanya | BI-A3 |
| BI-A5 | A | 2 | 5 | ya | Memahami isi tersurat bacaan pendek (siapa, apa, di mana, kapan) | BI-A4 |
| BI-A6 | A | 2 | 6 | tidak | Memahami perasaan tokoh dan pesan sederhana dalam cerita anak | BI-A5 |
| BI-B1 | B | 3 | 7 | ya | Memahami makna kata baru dari konteks kalimat atau bacaan | BI-A4 |
| BI-B2 | B | 3 | 8 | ya | Menemukan informasi tersurat dalam teks nonsastra (pengumuman, teks informasi) | BI-A5 |
| BI-B3 | B | 3 | 9 | ya | Menentukan ide pokok paragraf | BI-A5, BI-B1 |
| BI-B4 | B | 4 | 10 | ya | Membedakan ide pokok dan ide pendukung dalam paragraf | BI-B3 |
| BI-B5 | B | 4 | 11 | ya | Memahami watak tokoh dan pesan (amanat) dalam teks sastra | BI-A6, BI-B3 |
| BI-B6 | B | 4 | 12 | tidak | Memahami informasi dari teks multimodal sederhana (jadwal, tabel, diagram gambar) | BI-B2 |

Elemen Menyimak bisa ditambah dengan soal yang dibacakan; Berbicara dan Menulis tidak cocok dinilai dengan pilihan ganda.

### 22.3 Glosarium

| Istilah | Arti |
|---|---|
| CP | Capaian Pembelajaran, target per fase dari BSKAP |
| TP | Tujuan Pembelajaran, pecahan CP yang lebih kecil; satuan progres di PELITA |
| ATP | Alur Tujuan Pembelajaran, urutan TP |
| ATP Transisi | ATP yang dipadatkan Kemendikdasmen untuk murid yang pembelajarannya terganggu |
| BKT | Bayesian Knowledge Tracing, model peluang anak menguasai sebuah TP |
| Tebakan / ceroboh | Peluang benar karena menebak / salah padahal paham |
| Titik mulai | TP belum dengan urutan terendah yang semua prasyaratnya tercapai |
| Disimpulkan | Status TP yang ditentukan dari peta prasyarat tanpa diuji langsung |
| Kelasku / Pos Dasar | Menu TP sesuai kelas / menu TP prasyarat dan modul jembatan |
| Modul jembatan | Materi prasyarat yang disisipkan sebelum melanjutkan TP kelas |
| Pendamping | Orang tua, wali, atau guru pendamping |
| Keputusan Menunggu | Daftar hal yang butuh persetujuan orang tua/wali |
| Teman Cerita | Chatbot penyaring dan penghubung ke dukungan |
| Pijar | Maskot lentera PELITA |

### 22.4 Daftar dokumen sumber
`PANDUAN_PROYEK.md` · `ARSITEKTUR_TEKNIS.md` · `rencana_24_jam_pelita.md` · `hasil_uji_asesmen_pelita.md` · `peta_ai_dan_data_pelita.md` · `data_latar_belakang_pelita.md` · `judul_dan_deskripsi_pelita.md` · `naskah_presentasi_pelita.md` · `persiapan_tanya_jawab_pelita.md` · file data JSON di folder `data/`.

### 22.5 Sumber data latar belakang
- Kemenkes – RAN Kanker Anak 2025–2029: https://kemkes.go.id/id/rencana-aksi-nasional-kanker-anak-2025-2029-langkah-strategis-kendalikan-kanker-pada-anak-di-indonesia
- CNA Indonesia: https://www.cna.id/indonesia/tren-kanker-anak-meningkat-di-indonesia-ada-100-ribu-kasus-28321
- Childhood Cancer International (WHO): https://www.childhoodcancerinternational.org/facts
- Universitas Airlangga: https://unair.ac.id/kemoterapi-sebagai-terapi-utama-leukemia-pada-anak/
- Nurhidayah dkk. (2016): https://jkp.fkep.unpad.ac.id/index.php/jkp/article/download/136/117/261
- Baughan dkk. (2023): https://pmc.ncbi.nlm.nih.gov/articles/10370705
- Cochrane: https://cochrane.org/id/CD011538/PUBHLTH_apakah-layanan-dukungan-pendidikan-yang-diberikan-pada-anak-dan-remaja-dengan-penyakit-kronis-mampu
- Kemenkes – Hospital Schooling RS M. Djamil: https://keslan.kemkes.go.id/read/3999/anak-tetap-sekolah-meski-dirawat-inovasi-djamil-hospital-schooling-resmi-diluncurkan
- Kemenkes – RS M. Djamil rujukan nasional: https://keslan.kemkes.go.id/read/3991/rs-m-djamil-tegaskan-kolaborasi-jadi-kunci-pengendalian-kanker
- Permendikbud 72/2013: https://peraturan.go.id/files/bn822-2013.pdf
- PP 33/2026 (ringkasan): https://siplawfirm.id/resources/pp-33-2026-pelindungan-data-pribadi
