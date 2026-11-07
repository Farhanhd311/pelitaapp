# Rencana 24 Jam PELITA

Versi 1 · 4 November 2026 · Untuk Hackathon FIRETECH 2026 (7–8 November, Telkom AI Center Padang)

Format yang dipakai di rencana ini: **presentasi 5 menit termasuk demo** (jatah demo ±2 menit 10 detik) dan **tanya jawab 10 menit**. Guidebook versi 1 menyebut 7 + 13 menit. Kalau ternyata 7 menit, bagian demo cukup diperpanjang (lihat naskah).

## 1. Prinsip memilih fitur

Waktu kerja nyata hanya sekitar 18 jam, karena ada pembukaan, makan, istirahat, rekam video cadangan, dan latihan. Demo hanya ±130 detik. Jadi setiap fitur harus lolos salah satu dari tiga pertanyaan:

1. **Apakah tampil di demo 130 detik?** Jika ya, bangun sampai benar-benar jalan dan rapi.
2. **Apakah menjawab pertanyaan juri yang hampir pasti muncul?** ("AI-nya di mana?", "bagaimana kalau AI salah?", "siapa yang mengontrol?") Jika ya, bangun versi sederhana untuk tab cadangan saat tanya jawab.
3. **Selain itu:** jadikan data contoh, tunjukkan rancangannya dari Google Stitch, atau sebut sebagai roadmap.

Kualitas Teknis (20%) menilai struktur kode dan fungsionalitas, bukan banyaknya fitur. Lima fitur yang jalan mulus dan kodenya bisa dijelaskan lebih bernilai daripada lima belas fitur setengah jadi.

## 2. Keputusan lingkup

Keterangan: **A** = bangun penuh (tampil di demo) · **B** = versi sederhana (untuk tanya jawab) · **D** = data contoh atau di-seed · **R** = roadmap, cukup dijawab lisan atau di slide · **✗** = tidak dipakai.

### Mode anak
| Fitur | Kelas | Catatan |
|---|---|---|
| Pilih profil (avatar) + PIN pendamping | A | PIN 4 digit, dicek di server |
| Check-in harian + `tentukanLevel` | A | Fungsi murni + tes unit. Di demo cukup tampilkan hasil "lemas + mata lelah" |
| Tombol speaker (Web Speech API) | A | Murah dan langsung menunjukkan mode audio |
| Asesmen adaptif BKT + **mode demo "putar otomatis"** | A | Jawaban Raka diputar otomatis, ±1,5 detik per soal, sambil batang peluang bergerak dan peta TP berubah warna. 17 soal selesai sekitar 25 detik dan aman dari salah klik |
| Peta TP (Kelasku / Pos Dasar) | A | Cukup grid per kelas dengan warna status. **Tidak perlu React Flow** |
| Sesi belajar TP B3: kartu belajar → kuis formatif → update BKT | A | Konten hanya untuk B3. TP lain menampilkan "segera hadir" |
| AI tutor (LLM + cadangan dari `pembahasan`) | A | Soal demo B3-D3 (6 × 7, jawaban 13) |
| Cek "Masih kuat?" di tengah sesi | A | Pakai aturan tetap, bukan LLM (dari dokumen teman, versi aman) |
| Ceroboh naik ke 0,30 saat anak memilih "agak capek" | B | Satu nilai pengaturan, hanya untuk kuis formatif |
| Maskot Pijar beranimasi | A | Metode A (gerak tubuh + ikon melayang). Pakai Metode C hanya jika aset wajah sudah dibuat sebelum hari-H |
| Teman Cerita: skrining chip + deteksi krisis aturan tetap + level rujukan | B | Tanpa LLM dulu. Kalau sempat, tambahkan satu balasan empatik dari LLM |
| Lapis koreksi (soal cek untuk TP disimpulkan) | R | Sudah ada di desain dan hasil uji. Jelaskan saat ditanya |
| Checkpoint retensi setelah 3 TP | R | Ide dari dokumen teman. Bagus, tapi tidak tampil di demo |
| Tipe soal benar/salah dan susun kata, tebakan per tipe | R | MVP hanya pilihan ganda |
| Analisis mood oleh LLM, rekaman suara anak | ✗ | Keputusan keselamatan harus memakai aturan tetap, dan suara anak adalah data pribadi |
| Mode offline (PWA) | R | |

### Mode pendamping
| Fitur | Kelas | Catatan |
|---|---|---|
| Login akun demo (email + password) | A | OTP lewat SMS menjadi roadmap |
| Onboarding dan survei awal | B / D | Data Raka di-seed. Formulir satu halaman hanya jika sempat. Tunjukkan rancangan Stitch jika ditanya |
| Ringkasan + tren check-in + progres per TP (status, bukan persen) | A | |
| Kartu "perlu perhatian": 3 check-in lemas berturut-turut | A | Ide dari dokumen teman, dialihkan ke orang tua, bukan ke admin |
| Keputusan Menunggu (persetujuan rujukan) | B | Satu jenis keputusan saja |
| Draf laporan sekolah oleh AI + cetak/simpan PDF | A | Pakai halaman cetak dan `window.print()`, **tidak perlu pustaka PDF** |
| Laporan naratif harian | R | Ringkasan otomatis di dashboard sudah cukup |
| Akun guru pendamping (Kak Dina) | D | Di-seed, hanya bisa melihat. Verifikasi oleh admin menjadi roadmap |

### Mode admin (semua untuk tab cadangan tanya jawab)
| Fitur | Kelas | Catatan |
|---|---|---|
| Aturan AI: ubah parameter BKT dalam rentang aman + alasan + tercatat di log | B | Simpan versi di tabel. Tombol "kembalikan" hanya jika sempat |
| Bank soal + "Buat variasi soal dengan AI" + antrean tinjauan | B | Validasi otomatis kunci jawaban wajib ada |
| Evaluasi AI | B + D | Tabel dan grafik dari `hasil_uji_asesmen.json` (berlabel "hasil simulasi"), ditambah hitungan nyata dari `LOG_AI` (jumlah panggilan, % memakai cadangan) |
| Log aktivitas | B | Tabel dengan filter jenis tindakan |
| Antrean eskalasi | B | Daftar sederhana |
| Tombol **"Reset demo"** | A | Mengembalikan data Raka ke kondisi awal. Wajib, supaya demo bisa diulang |
| Pratinjau dampak perubahan ambang | R | |

### Di belakang layar
| Bagian | Kelas | Catatan |
|---|---|---|
| `/lib/bkt`, `/lib/sesi`, `/lib/krisis` sebagai fungsi murni + tes unit (Vitest) | A | Ini yang paling mungkin diminta juri saat bertanya soal kode |
| Pemanggilan LLM hanya dari server, keluaran JSON tervalidasi, ada cadangan, tercatat di `LOG_AI` | A | |
| Jawaban AI cadangan yang disimpan untuk skenario demo | A | Demo tidak boleh bergantung pada kecepatan API |
| Pengecekan peran di setiap API route | A | Satu-satunya penjaga akses, karena MySQL tidak punya Row Level Security |
| Guardrail kata sensitif di prompt (jarum, rumah sakit, penyakit parah) | A | Dari dokumen teman, cukup satu baris di prompt |

## 3. Yang diambil dari dokumen teman, dan yang tidak

| Ide | Keputusan | Alasan |
|---|---|---|
| Cek kondisi di tengah sesi | **Diambil**, keputusan pakai aturan tetap | Menambah sisi kesehatan. Muncul di akhir durasi level atau setelah 3 salah berturut-turut, karena timer 15 menit tidak akan pernah muncul di sesi ringan 5–10 menit |
| Ceroboh naik saat lelah | **Diambil**, hanya untuk kuis formatif | Satu salah dari peluang 0,80 hanya turun ke 0,62, bukan 0,35. Anak tidak "dihukum" |
| Dua ambang: 0,85 untuk penempatan, 0,95 untuk kelulusan saat belajar | **Diambil** | Keduanya tetap butuh minimal 3 jawaban benar. Dari status belum (Raka di B3), butuh ±5 jawaban benar untuk lulus |
| Kartu belajar jika p < 0,40 | **Diambil**, ditambah "TP baru selalu mulai dari kartu belajar" | Tanpa tambahan itu, TP baru (p = 0,5) langsung dikuis sebelum diajari |
| Guardrail kata sensitif | **Diambil** | Murah dan relevan |
| Maskot dengan Framer Motion | **Diambil**, Metode A | Paling cepat. Metode C butuh aset terpisah |
| Peringatan 3 sesi lelah | **Diambil**, dikirim ke orang tua | Orang tua adalah pengambil keputusan. Admin cukup melihat rekap |
| Tebakan per tipe soal | Roadmap | MVP hanya pilihan ganda |
| Checkpoint retensi | Roadmap, **tanpa** reset paksa ke 0,65 | BKT biasa sudah menurunkan sendiri: dua salah dari 0,95 menjadi 0,25 |
| Tes penempatan 5 soal di kelas terakhir | **Tidak** | Tidak bisa menemukan celah di bawah kelas terakhir, padahal itu inti pitch kita |
| Soal dibuat LLM saat itu juga | **Tidak** | Kunci bisa salah dan ada jeda saat demo. Soal diambil dari bank soal |
| LLM memutuskan sesi dihentikan atau mengubah parameter | **Tidak** | Keputusan keselamatan harus bisa diaudit |
| Persen BKT ditampilkan ke orang tua | **Tidak** | Itu peluang, bukan nilai. Tampilkan status |
| Rekaman suara anak | **Tidak** | Data pribadi anak |

## 4. Teknologi final

Next.js (App Router) + TypeScript · Tailwind + shadcn/ui · MySQL 8 (`utf8mb4`) + login buatan sendiri (`bcryptjs` + `iron-session`) · satu penyedia LLM dengan mode JSON (cek kuota gratis, siapkan API key cadangan) · `motion` (Framer Motion) untuk maskot · Recharts hanya di Evaluasi AI · Vitest · Google Cloud (Cloud Run + Cloud SQL, region Jakarta).

**Tidak dipakai di MVP:** React Flow, @react-pdf/renderer, PWA/offline, OTP SMS. Setiap pustaka tambahan butuh waktu untuk dipelajari dan dijelaskan.

## 5. Yang disiapkan sebelum hari-H (5–6 November)

Semuanya berupa **data, teks, aset, dan akun**, bukan kode aplikasi. Tetap konfirmasi ke panitia apakah data dan teks prompt boleh disiapkan lebih dulu.

| No | Barang | Pemilik |
|---|---|---|
| 1 | MySQL lokal (XAMPP, database `pelita`) + proyek Google Cloud dengan penagihan aktif (Cloud Run + Cloud SQL), GitHub, API key LLM (+ cadangan), dicoba sekali | Backend |
| 2 | Teks prompt: tutor, laporan sekolah, generator soal (+ Teman Cerita jika dipakai), lengkap dengan skema JSON | AI |
| 3 | Seed pengaturan sistem dan tabel aturan rujukan (JSON) | Backend |
| 4 | Daftar kata kunci krisis (draf, ditandai "perlu tinjauan psikolog") | AI |
| 5 | 8 soal formatif TP B3 + 1 kartu belajar perkalian | Data |
| 6 | Data demo Raka: profil, 3–4 minggu check-in (termasuk 3 hari lemas berturut-turut), progres TP, satu skrining, satu rujukan menunggu | Data |
| 7 | Jawaban AI cadangan: penjelasan tutor untuk B3-D3, satu draf laporan sekolah | AI |
| 8 | Aset maskot Pijar (PNG transparan) dan ikon check-in | Desain |
| 9 | Desain Google Stitch final sebagai acuan layar | Desain |
| 10 | Slide (6 slide) dan latihan naskah | Presenter |

## 6. Jadwal 24 jam (H = jam sejak mulai)

| Jam | Backend / logika | Frontend anak | Frontend pendamping + admin | Data, AI, presenter |
|---|---|---|---|---|
| H0–H2 | Inisialisasi proyek, skema, seed, akun demo, deploy pertama | Tata letak, tema warna, navigasi | Tata letak dashboard | Impor data, cek prompt di API |
| H2–H7 | `/lib/bkt` + tes, `/lib/sesi` + tes, API asesmen | Check-in, layar asesmen + mode demo, peta TP | Dashboard pendamping (ringkasan, progres) | Isi soal formatif dan data Raka ke seed |
| **H7 · cek 1** | **Alur check-in → asesmen → peta jalan dari awal sampai akhir** | | | |
| H7–H12 | API sesi + update BKT, `/lib/krisis` + tes | Sesi belajar B3, kartu belajar, "Masih kuat?", maskot | Laporan AI + halaman cetak, kartu perlu perhatian | AI tutor + cadangan, `LOG_AI` |
| **H12 · cek 2** | **Seluruh alur demo jalan dari awal sampai akhir dengan data Raka** | | | |
| H12–H16 | Aturan AI (API + validasi + log), log aktivitas | Teman Cerita (chip + krisis) | Bank soal + generator + antrean tinjauan, Evaluasi AI | Generator soal, Keputusan Menunggu |
| **H16–H17 · fitur dibekukan** | **Tidak ada fitur baru setelah H17.** Yang belum jadi pindah ke roadmap | | | |
| H17–H20 | Perbaikan bug, tombol Reset demo | Rapikan UI, uji di HP | Rapikan UI | Uji demo berulang kali |
| H20–H22 | Deploy final, unggah kode sumber | Rekam video demo cadangan | | Bedah kode: setiap orang menjelaskan modulnya |
| H22–H24 | Cadangan waktu | | | Latihan presentasi minimal 3 kali dengan stopwatch, latihan tanya jawab |

Atur giliran tidur 2–3 jam per orang di antara H12 dan H20, supaya tidak ada yang menjalani 24 jam penuh tanpa tidur.

## 7. Pembagian tim

- **3 orang:** (1) backend + logika + admin, (2) frontend anak + pendamping, (3) AI + data + presenter.
- **4 orang:** pisahkan frontend anak dan frontend pendamping/admin.
- **5 orang:** tambah satu orang khusus QA, demo, slide, dan latihan tanya jawab.

Setiap modul punya satu pemilik yang **wajib bisa menjelaskan kodenya**. Karena kalian vibecoding, juri bisa meminta salah satu anggota membuka file dan menjelaskannya.

## 8. Risiko dan cadangan

| Risiko | Cadangan |
|---|---|
| API LLM lambat atau mati saat demo | Jawaban cadangan yang disimpan + `pembahasan` dari data soal |
| Internet panggung bermasalah | Video demo (direkam H20–H22) + aplikasi lokal |
| Fitur melebar dan tidak selesai | Cek di H7 dan H12, bekukan fitur di H17 |
| Kode buatan AI tidak dipahami tim | Satu pemilik per modul, sesi bedah kode di H20–H22 |
| Data demo rusak saat latihan | Tombol Reset demo |
| Tim kelelahan | Giliran tidur, presenter tidur paling cukup |

## 9. Daftar periksa sebelum naik panggung

- [ ] Data Raka sudah di-reset, akun sudah login, dan setiap layar terbuka di tab terpisah sesuai urutan demo
- [ ] Mode demo asesmen sudah diuji 3 kali berturut-turut tanpa salah
- [ ] Jawaban AI cadangan aktif
- [ ] Video cadangan siap di desktop
- [ ] Tab tanya jawab terbuka: Aturan AI, Evaluasi AI, antrean tinjauan soal, file `/lib/bkt` beserta hasil tesnya
- [ ] Satu orang bicara, satu orang mengoperasikan aplikasi
