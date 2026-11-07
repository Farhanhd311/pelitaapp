# PANDUAN PROYEK: PELITA

Dokumen ini adalah pedoman utama untuk siapa pun (termasuk AI coding assistant) yang mengerjakan kode proyek ini. Baca seluruhnya sebelum menulis kode. Jika ada instruksi yang bertentangan dengan dokumen ini, tanyakan dulu ke tim.

"Pelita" adalah nama sementara.

---

## 1. Konteks

- **Lomba:** Hackathon FIRETECH 2026, tema *AI Innovation Sprint – Harmonizing Tech and Humanity: Creating Solutions for a Better Society*. Subtema yang dipilih: **Pendidikan dan Literasi Digital** (dengan konteks kesehatan).
- **Format:** pengerjaan 24 jam di Telkom AI Center Padang, 7–8 November 2026. Studi kasus hari-H melibatkan pemanfaatan AI.
- **Presentasi:** 5 menit **termasuk demo** (jatah demo ±2 menit 10 detik) + tanya jawab 10 menit. Guidebook versi 1 menyebut 7 + 13 menit; jika itu yang berlaku, demo cukup diperpanjang.
- **Rencana kerja jam per jam, pembagian tim, dan daftar periksa:** lihat `docs/rencana_24_jam_pelita.md`.
- **Penilaian:** Inovasi & Orisinalitas 30%, Relevansi Tema 20%, Kualitas Teknis & Eksekusi 20% (struktur kode, arsitektur, fungsionalitas, ketepatan teknologi, UI/UX), Dampak & Keberlanjutan 15%, Presentasi & Demo 15%.
- **Aturan penting:** dilarang memakai prototipe atau kode utuh yang sudah dibuat sebelumnya. Setup awal proyek diperbolehkan. Source code dan tautan prototipe wajib diunggah sebelum batas waktu.

Karena kualitas struktur kode dinilai dan setiap anggota tim harus bisa menjelaskan kode saat tanya jawab, **utamakan kode yang rapi, modular, dan mudah dijelaskan** daripada fitur yang banyak.

---

## 2. Masalah yang diselesaikan

Anak usia SD dengan penyakit kronis (misalnya leukemia) tidak bisa bersekolah rutin selama pengobatan. Validasi dari penyintas leukemia anak di Sumatera Barat:

- Pengobatan leukemia berlangsung sekitar **2 tahun**, minimal **2 minggu per bulan dirawat penuh** di rumah sakit. Jika ada komplikasi bisa **sebulan penuh**.
- Motivasi belajar turun karena sakit.
- Anak tetap dipaksa belajar dengan cara konvensional, **diberi tugas lewat orang tua untuk mengejar ketertinggalan, tanpa melihat kondisi anak**.
- Saat kembali ke sekolah, anak **sulit mengejar** teman-temannya.
- Yang dibutuhkan: **fleksibilitas, cara belajar yang tidak membuat stres, dan meringankan beban anak**.

Solusi yang sudah ada (jelaskan sebagai pelengkap, bukan saingan):
- **Sekolahku (YKAKI):** sekolah gratis di rumah singgah dan rumah sakit mitra, tatap muka dengan guru.
- **Hospital Schooling RS M. Djamil Padang:** belajar-bermain di rumah sakit bersama relawan Aruna (diluncurkan Juli 2026). Calon mitra utama.
- **Colourise (Unair):** aplikasi terapi seni dan storytelling untuk anak kanker.

---

## 3. Solusi dan tiga pembeda utama

> Platform belajar adaptif untuk anak dengan penyakit kronis yang menyesuaikan materi bukan hanya dengan kemampuan anak, tetapi juga dengan kondisi fisiknya hari itu, dan menjembatani progres belajarnya kembali ke sekolah asal.

1. **Belajar adaptif terhadap kondisi harian.** Check-in kondisi menentukan beban dan format sesi.
2. **Asesmen diagnostik dua jalur.** Kognitif (asesmen adaptif berbasis peta prasyarat) menentukan jalur belajar; non-kognitif (chatbot triase) menentukan rujukan dukungan.
3. **Jembatan ke sekolah asal.** Laporan capaian per Tujuan Pembelajaran (TP) yang dipetakan ke Kurikulum Merdeka.

Prinsip AI: **"AI membantu, manusia memutuskan"** di setiap titik sensitif.

---

## 4. Pengguna dan peran

Hanya ada **tiga peran** di MVP:

| Peran | Keterangan |
|---|---|
| **Admin** | Mengelola kurikulum, konten, bank soal (termasuk meninjau soal buatan AI), layanan dukungan, antrean rujukan dan eskalasi, verifikasi pengguna, log aktivitas akun, pengaturan ambang batas aturan AI, dan evaluasi kinerja AI (lihat bagian 8.4–8.6) |
| **Pendamping** | Satu peran untuk orang tua, wali, dan guru pendamping. Dibedakan lewat `PENDAMPINGAN.hubungan` (`orang_tua`, `wali`, `guru`) |
| **Anak** | **Bukan akun.** Anak adalah profil di bawah pendamping (tidak ada di tabel `USERS`, tidak punya nomor HP/email/password). Masuk dengan mengetuk avatar; PIN anak opsional |

Cara pakai di satu perangkat: pendamping login sekali, lalu muncul layar pilih profil (avatar anak atau tombol "Pendamping"). Masuk ke mode pendamping dari mode anak **wajib memakai PIN pendamping** (`USERS.pin_pendamping_hash`).

### Batasan akses (wajib ditegakkan di backend, bukan hanya disembunyikan di UI)

| Aksi | Anak | Orang tua / Wali | Guru pendamping | Admin |
|---|---|---|---|---|
| Belajar, kuis, check-in | Ya | Bantu check-in | — | — |
| Bercerita ke chatbot | Ya | — | — | — |
| Ubah profil, data kesehatan, mode jeda, batas layar | — | Ya | Usul saja | — |
| Lihat progres detail per TP | Peta positif saja | Ya | Ya (anak binaannya) | Agregat |
| Lihat ringkasan kategori skrining | — | Ya | Lihat saja | Antrean |
| Baca transkrip chatbot | — | — | — | — (di MVP transkrip tidak disimpan) |
| Setujui rujukan komunitas | — | **Hanya orang tua/wali** | — | — |
| Lewati prasyarat wajib | — | — | Ya | — |
| Unduh/kirim laporan ke sekolah | — | Ya | Ya | — |
| Hapus data / reset progres | — | **Hanya orang tua/wali** | — | — |
| Kelola kurikulum, konten, soal | — | — | — | Ya |
| Tinjau dan terbitkan soal buatan AI | — | — | Usul revisi | Ya |
| Lihat log aktivitas akun | — | — | — | Ya |
| Ubah ambang batas aturan AI | — | — | — | Ya (dalam rentang aman, tercatat di log) |
| Lihat evaluasi kinerja AI | — | — | — | Ya |
| Beri penilaian pada keluaran AI (penjelasan tutor, draf laporan) | — | Ya | Ya | Ya |

Orang tua adalah **pemantau dan pengambil keputusan**: semua hal yang butuh persetujuan dikumpulkan di bagian **"Keputusan Menunggu"** di dashboard pendamping.

---

## 5. Lingkup MVP (24 jam)

Aturan memilih fitur: **(A)** tampil di demo ±130 detik → bangun penuh; **(B)** menjawab pertanyaan juri yang hampir pasti muncul → versi sederhana untuk tab cadangan tanya jawab; selain itu → data contoh, rancangan Stitch, atau roadmap. Daftar lengkap dan alasannya ada di `docs/rencana_24_jam_pelita.md` bagian 2.

### A. Bangun penuh (tampil di demo)
1. Login akun demo (email + password) → pilih profil (avatar anak / Pendamping + PIN).
2. Check-in harian + `tentukanLevel` yang **benar-benar mengubah isi sesi**, tombol speaker (Web Speech API).
3. **Asesmen adaptif Matematika** (BKT + penelusuran prasyarat) dengan **mode demo "putar otomatis"**: jawaban Raka diputar ±1,5 detik per soal sambil batang peluang bergerak dan peta TP berubah warna.
4. Peta TP dengan menu **Kelasku** dan **Pos Dasar** (grid per kelas berwarna status, tanpa React Flow).
5. Sesi belajar **TP B3**: kartu belajar → kuis formatif → update BKT, termasuk cek "Masih kuat?" (7.1). TP lain cukup "segera hadir".
6. **AI tutor** berdasarkan `miskonsepsi`, dengan cadangan `pembahasan` dan jawaban cadangan tersimpan.
7. Dashboard pendamping: ringkasan, tren check-in, progres per TP (**status, bukan persen**), kartu "perlu perhatian", **draf laporan sekolah buatan AI** + halaman cetak (`window.print()` → simpan PDF).
8. Maskot Pijar beranimasi (bagian 13).
9. Tombol **"Reset demo"** di admin untuk mengembalikan data Raka.
10. Tes unit untuk `/lib/bkt`, `/lib/sesi`, `/lib/krisis`.

### B. Versi sederhana (untuk tanya jawab)
11. Teman Cerita: skrining chip → deteksi krisis aturan tetap → level rujukan → masuk **Keputusan Menunggu** orang tua; eskalasi muncul di antrean admin. LLM hanya jika sempat.
12. Admin **Aturan AI**: ubah parameter BKT dalam rentang aman + alasan + tercatat (riwayat versi; tombol kembalikan jika sempat).
13. Admin **bank soal + "Buat variasi soal dengan AI" + antrean tinjauan** (draf → terbit/ditolak) dengan validasi kunci otomatis.
14. Admin **Evaluasi AI**: hasil uji siswa virtual dari `hasil_uji_asesmen.json` (berlabel "hasil simulasi") + hitungan nyata dari `LOG_AI`.
15. Admin log aktivitas (tabel + filter) dan antrean eskalasi.
16. Onboarding: data Raka di-seed; formulir survei satu halaman hanya jika sempat.

### Tambahan atas keputusan tim (8 November, dekat titik bekukan fitur)
Peta Beranda memuat keempat mapel, masing-masing minimal 5 sesi untuk demo:
- **Matematika** dan **Bahasa Indonesia** adaptif, masing-masing dengan asesmen penempatan sendiri.
- **IPAS** dan **Pendidikan Pancasila** pustaka: tanpa asesmen, langsung materi kelasnya.

Soal dan narasi IPAS/PP ditulis dengan bantuan AI dan **diterbitkan langsung tanpa antrean tinjauan** (sumber `ai` di `SOAL`). Ini **pengecualian dari bagian 8**, diputuskan tim untuk demo; soal-soal itu tetap wajib ditinjau guru sebelum dipakai di luar demo.

### Di luar MVP (roadmap, dijawab lisan atau di slide)
OTP SMS, verifikasi guru, mode offline/PWA, lapis koreksi otomatis (desainnya ada di 7.2), checkpoint retensi, tipe soal benar/salah dan susun kata (dengan `tebakan` per tipe), laporan naratif harian, pratinjau dampak perubahan ambang, Bahasa Indonesia elemen Membaca, IPAS dan Pendidikan Pancasila sebagai pustaka materi, kalibrasi BKT dari data, personalisasi dari pola check-in, komunitas orang tua, kode rujukan rumah sakit.

**Tidak dipakai:** soal dibuat LLM langsung untuk anak, analisis mood oleh LLM yang memutuskan sesi, rekaman suara anak.

**Titik cek:** H7 alur check-in → asesmen → peta jalan; H12 seluruh alur demo jalan dengan data Raka; **H17 fitur dibekukan**. Jika waktu sempit, prioritas: **asesmen + mode demo → sesi B3 + AI tutor → check-in → dashboard + laporan → admin**.

---

## 6. Alur utama

### 6.1 Onboarding
Di MVP: akun demo (email + password) dan data Raka di-seed. Alur di bawah adalah desain lengkap; formulir satu halaman dibuat hanya jika sempat, dan OTP SMS adalah roadmap.

1. Pendamping daftar (nama, no HP, OTP) dan memilih hubungan dengan anak.
2. Persetujuan data: jelaskan apa yang bisa dan tidak bisa dilihat pendamping.
3. Profil anak: nama panggilan, tanggal lahir, avatar.
4. Survei awal: kelas terakhir, kelas seharusnya (otomatis dari usia, bisa diubah), tanggal berhenti sekolah, nama sekolah asal (opsional), status di sekolah asal.
5. Konteks kesehatan **minimal**: fase pengobatan (`intensif`, `pemeliharaan`, `pemulihan`), batas waktu layar, mode jeda. **Jangan menyimpan diagnosis atau data obat.**
6. Atur PIN pendamping.
7. Asesmen diagnostik ("Petualangan Pertama"), didampingi pendamping.

### 6.2 Siklus harian anak
Check-in → sistem menentukan level sesi → modul + kuis per TP → update status TP → (berkala) laporan. Lihat aturan di bagian 7.

### 6.3 Asesmen ulang
- Saat mode jeda panjang berakhir: cek singkat TP yang sedang dipelajari.
- Sebelum anak kembali ke sekolah: pastikan laporan sesuai kondisi terbaru.

---

## 7. Aturan bisnis

### 7.1 Level sesi berdasarkan kondisi

| Level | Durasi | Isi | Kuis |
|---|---|---|---|
| `istirahat` | 0 menit | Hanya konten santai opsional (cerita, musik) | Tidak ada |
| `ringan` | 5–10 menit | Mengulang TP yang **sudah tercapai**, format audio/video pendek | 1–2 soal santai, **tidak memengaruhi status TP** |
| `normal` | 15–20 menit | Materi baru atau modul jembatan | Minimal 3–5 soal formatif, lalu soal tambahan sampai TP tercapai |
| `penuh` | 25–30 menit dengan jeda | Materi baru + latihan + tantangan | Kuis lengkap, lalu soal tambahan sampai TP tercapai |

Materi baru **hanya** muncul di level `normal` dan `penuh`. Angka durasi adalah nilai awal yang perlu divalidasi tenaga kesehatan.

**Soal tambahan (keputusan tim, perlu persetujuan seluruh tim):** di sesi materi baru, jatah soal level (`kuis.jumlah_soal_*`) adalah jumlah **minimal**. Sesi tidak berakhir karena jatah habis; soal tambahan diberikan sampai TP tercapai (`bkt.ambang_tercapai_sesi`, minimal `bkt.min_soal_tercapai` soal), dengan penanda "Tinggal N jawaban benar lagi" (jumlah jawaban, bukan angka peluang). Anak tetap bisa berhenti kapan saja, cek "Masih kuat?" tetap berlaku, dan progres tersimpan. Sesi `ringan` tetap berhenti di jatahnya.

Urutan aturan (yang lebih atas menang):
```
fungsi tentukanLevel(checkin, anak):
  jika anak.mode_jeda                    → ISTIRAHAT
  jika checkin.keluhan == "sakit sekali" → ISTIRAHAT (+ tawarkan memberi tahu pendamping)
  level = {lemas: RINGAN, lumayan: NORMAL, semangat: PENUH}[checkin.energi]
  jika checkin.keluhan ada               → level = min(level, RINGAN); jika "mata lelah" → mode audio
  jika anak.fase_pengobatan == intensif  → turunkan satu tingkat
  jika checkin.cuaca_hati in [hujan, badai] → turunkan satu tingkat, isi diganti TP yang sudah dikuasai, tawarkan chatbot
     (jika 3 hari berturut-turut → chatbot menyapa proaktif)
  durasi = min(durasi_standar[level], anak.batas_layar_menit)
```

Selama sesi, cek **"Masih kuat?"** (aturan tetap, **bukan keputusan LLM**):
- Muncul saat durasi level tercapai, **atau** setelah 3 jawaban salah berturut-turut, **atau** di tengah sesi `penuh`.
- Anak memilih satu dari tiga ikon:

| Pilihan | Tindakan sistem |
|---|---|
| 😊 Masih kuat | Lanjut. Jika durasi level sudah tercapai, tawarkan selesai dengan pujian |
| 😪 Agak capek | Lanjut tanpa materi baru; `ceroboh` untuk sisa sesi = `bkt.ceroboh_lelah` (0,30) supaya kesalahan tidak terlalu menurunkan peluang |
| 🤒 Mau istirahat / pusing | Sesi berhenti, progres tersimpan, pesan istirahat dari Pijar. Jika "pusing", tampilkan kartu di dashboard pendamping |

- Sesi yang dihentikan di tengah **tidak dihitung gagal**.
- **3 check-in berturut-turut berenergi `lemas` atau berkeluhan** → kartu "perlu perhatian" (warna amber) di dashboard **orang tua dan guru pendamping**, berisi saran berkonsultasi dengan tim medis. Admin hanya melihat jumlah agregat.

Motivasi tanpa hukuman:
- Target dihitung **per minggu**, bukan per hari.
- **Hari istirahat yang dilaporkan lewat check-in tetap dihitung hari aktif.** Streak tidak putus karena istirahat.
- Mode jeda membekukan streak dan mematikan semua pengingat.

### 7.2 Asesmen adaptif: Bayesian Knowledge Tracing (BKT)

Setiap TP menyimpan `p_menguasai` (0–1). Nilai parameter **tidak boleh ditulis langsung di kode**: dibaca dari tabel `PENGATURAN_SISTEM` (bagian 8.4) supaya bisa diatur admin. Nilai awal diambil dari `meta.parameter_bkt` pada file data saat seed:

| Parameter | Nilai | Arti |
|---|---|---|
| peluang_awal | 0,5 | Keyakinan awal |
| tebakan | 0,25 | Benar karena menebak (pilihan ganda 4 opsi) |
| ceroboh | 0,10 | Salah padahal paham |
| belajar_saat_asesmen | 0 | Tidak ada pengajaran di antara soal asesmen |
| belajar_saat_sesi | 0,15 | Dipakai saat kuis formatif setelah belajar |
| ambang_tercapai | 0,85 | Untuk **asesmen penempatan** (tanpa unsur belajar) |
| ambang_tercapai_sesi | 0,95 | Untuk **kelulusan TP saat sesi belajar** (dengan `belajar_saat_sesi`). Dari status belum, butuh ±5 jawaban benar |
| ceroboh_lelah | 0,30 | Hanya untuk kuis formatif setelah anak memilih "Agak capek" (7.1). Tidak pernah dipakai saat asesmen |
| ambang_belum | 0,30 | |
| min_soal_per_tp | 2 | Minimal soal sebelum boleh memutuskan **belum** |
| min_soal_tercapai | 3 | Minimal soal sebelum boleh memutuskan **tercapai** (hasil uji siswa virtual: 2 soal terlalu cepat, 6% anak yang belum paham lolos karena menebak) |
| maks_soal_per_tp | 4 | Jangan diturunkan ke 3 (uji menunjukkan akurasi turun) |
| berhenti_dini | true | Asesmen selesai begitu titik mulai pasti; TP di atasnya berstatus `belum_diketahui` |

```
fungsi perbaruiBKT(p, benar, tebakan, ceroboh, belajar):
  jika benar: p = p*(1-ceroboh) / (p*(1-ceroboh) + (1-p)*tebakan)
  jika salah: p = p*ceroboh / (p*ceroboh + (1-p)*(1-tebakan))
  return p + (1-p)*belajar

fungsi setelahJawab(tp, benar):
  tp.p = perbaruiBKT(...); tp.jumlahSoal += 1
  jika jumlahSoal >= min_soal_tercapai (3) dan p >= 0.85 → putuskan(tp, TERCAPAI)
  jika jumlahSoal >= min_soal_per_tp (2)   dan p <= 0.30 → putuskan(tp, BELUM)
  jika jumlahSoal >= maks_soal_per_tp (4)               → putuskan(tp, p >= 0.5 ? TERCAPAI : BELUM)

fungsi putuskan(tp, hasil):
  TERCAPAI → semua leluhur (prasyarat langsung/tidak langsung) yang belum dites = DISIMPULKAN_TERCAPAI
  BELUM    → semua keturunan yang belum dites = DISIMPULKAN_BELUM
  kandidat = TP yang belum dites dan belum disimpulkan
  jika berhenti_dini dan semua TP sebelum perbatasan pertama sudah diketahui → selesai
     (perbatasan = TP BELUM dengan urutan terendah yang semua prasyaratnya tercapai)
  jika berhenti_dini → kandidat hanya TP dengan urutan di bawah perbatasan yang sudah diketahui
  jika kandidat kosong → selesai; titik mulai = perbatasan
  selain itu → uji kandidat di tengah rantai yang tersisa
     (skor = min(jumlah leluhur di kandidat, jumlah keturunan di kandidat), terbesar dipilih;
      jika seri: selisih |leluhur − keturunan| terkecil; jika masih seri: urutan terbesar)
```

Aturan asesmen:
- TP pertama yang diuji: TP kunci di **kelas (kelas_seharusnya − 1)**, yaitu TP di tengah daftar TP kelas itu yang diurutkan menurut `urutan` (indeks `floor(jumlah / 2)`, mulai dari 0). Untuk Raka (kelas seharusnya 4) hasilnya B3.
- Kasus uji siap pakai untuk tes unit ada di `data/tes_kasus_bkt.json` (nilai `perbaruiBKT`, keputusan per TP, jejak asesmen Raka lengkap, dan sesi formatif B3).
- Penempatan dilakukan **terpisah per mata pelajaran**.
- Maksimal 12 soal per sesi asesmen; status penelusuran disimpan agar bisa dilanjutkan. Hasil uji: rata-rata 18 soal per mapel (90% anak ≤ 24), jadi rancang asesmen satu mapel selesai dalam **2 sesi**.
- Selama asesmen, umpan balik **netral** ("Oke, lanjut!"), tidak ada benar/salah.
- **Lapis koreksi (desain wajib, di luar lingkup 24 jam; bangun hanya jika fitur bagian 5 sudah selesai):** TP berstatus *disimpulkan* atau *belum_diketahui* diberi 2 soal cek saat pertama kali muncul di sesi belajar; koreksi status jika ternyata belum paham. Jika kuis formatif sebuah TP gagal, cek prasyarat langsungnya yang berstatus tercapai (2 soal per prasyarat) dan pindahkan yang ternyata belum ke Pos Dasar. Alasannya: uji siswa virtual menunjukkan 17,6% penempatan meleset terlalu tinggi (median 1 TP).
- Hasil uji lengkap: `docs/hasil_uji_asesmen_pelita.md`. Acuan tes unit `/lib/bkt`: `data/tes_kasus_bkt.json`.
- **Acak urutan pilihan jawaban saat ditampilkan** (di data, kunci sering di posisi kedua).

Aturan sesi belajar (kuis formatif):
- **TP baru atau `p_menguasai` < 0,40 → tampilkan kartu belajar dulu** (konten yang sudah disiapkan + tombol speaker), baru kuis. Tanpa aturan ini, TP baru (p = 0,5) langsung dikuis sebelum diajari.
- Setiap jawaban memperbarui BKT dengan `belajar_saat_sesi`. Status `tercapai` jika minimal 3 soal dan p ≥ `ambang_tercapai_sesi`.
- Hanya pilihan ganda di MVP (`tebakan` 0,25). Tipe soal lain beserta nilai `tebakan` per tipe adalah roadmap.
- Angka peluang **tidak ditampilkan ke orang tua sebagai persen**; tampilkan status (`belum` / `jembatan` / `tercapai`). Angka hanya terlihat di mode demo asesmen dan di halaman admin.

Kejujuran klaim: di MVP parameter ditetapkan manual, jadi ini **model probabilistik, belum machine learning**. Jangan menyebutnya "model yang dilatih". Kalibrasi dari data adalah roadmap.

### 7.3 Prasyarat, Pos Dasar, dan jalur transisi
- Sebelum TP baru di **Kelasku** dimulai, cek prasyaratnya. Jika ada yang belum tercapai, sisipkan **modul jembatan** di **Pos Dasar**, lalu kembali ke TP kelasnya.
- Materi lama yang bukan prasyarat langsung: opsional di Pos Dasar.
- Label `esensial_transisi` diadopsi dari prinsip **ATP Transisi** Kemendikdasmen (ATP yang dipadatkan untuk murid terdampak bencana). Saat fase pengobatan `intensif`, tampilkan hanya TP esensial.

### 7.4 Status TP (`PROGRES_TP.status`)
`belum` → `jembatan` (sedang dikejar di Pos Dasar) → `tercapai`. Simpan juga `sumber_status` (`diuji` / `disimpulkan`) dan `p_menguasai`. Kuis gagal 2 kali → tandai untuk ditinjau guru pendamping, jangan paksa anak mengulang terus. (Dengan aturan soal tambahan di 7.1, "kuis gagal" berarti sesi yang dihentikan anak sebelum TP tercapai. Penandaan untuk guru belum dibangun di MVP.)

---

## 8. Fitur AI (dua lapis)

| Lapis | Peran | Teknik | Dipakai di |
|---|---|---|---|
| **AI pengambil keputusan** | Menentukan *apa* yang dipelajari | BKT + penelusuran graf prasyarat | Penempatan, pemilihan soal, update status TP |
| **AI generatif (LLM)** | Menentukan *bagaimana* disampaikan | API model bahasa | AI tutor, chatbot triase, draf laporan sekolah, variasi soal (admin) |

Kedua lapis terhubung lewat field `miskonsepsi` di setiap pilihan jawaban yang salah.

### Aturan wajib untuk semua pemanggilan LLM
- Panggil API **hanya dari server** (API route). API key tidak boleh ada di kode frontend.
- Minta output **JSON** dengan skema jelas, lalu **validasi** sebelum dipakai. Jika gagal/timeout, pakai fallback (misalnya `pembahasan` dari data soal).
- Untuk anak: bahasa Indonesia sederhana, kalimat pendek (maks. 3 kalimat untuk tutor), ramah, tidak menghakimi, tidak membahas topik di luar konteks.
- Jangan pernah memberi diagnosis medis atau psikologis, label kondisi mental, atau saran pengobatan.
- **Guardrail kata sensitif:** cerita soal dan penjelasan tidak memakai konteks jarum suntik, rumah sakit, obat, atau penyakit parah.
- **LLM tidak pernah mengambil keputusan sistem**: tidak menghentikan sesi, tidak mengubah parameter, tidak menentukan level rujukan. Keputusan memakai aturan tetap dan nilai dari `PENGATURAN_SISTEM`.
- Soal untuk anak **selalu dari bank soal berstatus `terbit`**, tidak pernah dibuat LLM saat itu juga.
- Semua keluaran AI untuk pihak luar (laporan sekolah, soal baru) berstatus **draf** dan harus ditinjau manusia.
- Siapkan **jawaban cadangan yang disimpan** untuk demo jika API lambat.

### 8.1 AI tutor
Input: pertanyaan, jawaban anak, kunci, `miskonsepsi` pilihan yang dipilih, deskripsi TP, kelas anak. Output: penjelasan ≤3 kalimat dengan bahasa anak + satu langkah petunjuk. Teks juga bisa dibacakan (Web Speech API).

### 8.2 Chatbot triase ("Teman Cerita")
Fungsinya **saringan dan penghubung ke manusia**, bukan teman curhat utama.
1. Sapaan + aturan kerahasiaan yang jujur ("Ceritamu aman di sini. Tapi kalau kamu dalam bahaya, kakak harus kasih tahu ayah atau ibumu supaya kamu dibantu.").
2. Skrining tiga dimensi lewat pilihan (emoji/chip): perasaan (cuaca), sumber, kebutuhan.
3. **Cek sinyal krisis dengan aturan tetap (daftar kata/pola), dijalankan SEBELUM teks dikirim ke LLM.** Ambang sengaja sensitif. Jika terdeteksi: chatbot tetap menemani dengan tenang, notifikasi langsung ke orang tua, kasus masuk antrean eskalasi (`LAYANAN_DUKUNGAN.jenis = darurat`, tidak menunggu izin).
4. LLM boleh dipakai untuk membuat percakapan natural dan merangkum jawaban menjadi kategori, tetapi **keputusan level rujukan memakai tabel aturan**:
   - Level 1 (butuh teman/aktivitas) → grup sebaya termoderasi
   - Level 2 (butuh tempat cerita) → relawan pendamping terlatih
   - Level 3 (distres berulang) → psikolog/konselor mitra
5. Rujukan level 1–3 butuh **persetujuan orang tua/wali**. Orang tua hanya melihat **ringkasan kategori**, bukan isi percakapan.
6. Tindak lanjut seminggu kemudian.
7. **Transkrip tidak disimpan di MVP**; hanya hasil `SKRINING` yang disimpan.

Pemicu chatbot: tombol "Mau cerita?", pola check-in menurun (misalnya hujan/badai 3 hari berturut-turut), skrining berkala.

### 8.3 Draf laporan untuk sekolah
Input: data `PROGRES_TP` per mata pelajaran. Output: draf deskripsi capaian per TP dengan gaya rapor Kurikulum Merdeka. Label tampilan: "Draf dibuat AI — periksa sebelum dikirim". Pendamping bisa menyunting draf, lalu membuka halaman cetak dan menyimpannya sebagai PDF (`window.print()`, tanpa pustaka PDF). Berbagi lewat tautan ke wali kelas adalah roadmap.

Kalimat klaim yang benar: *"Aplikasi menghasilkan laporan capaian belajar yang dipetakan ke CP dan TP Kurikulum Merdeka sehingga dapat digunakan sekolah asal sebagai bukti asesmen."* **Jangan** mengklaim aplikasi menerbitkan rapor atau menentukan kenaikan kelas; itu kewenangan sekolah.

### 8.4 Pengaturan ambang batas aturan AI (admin)

Semua angka dan daftar yang mengendalikan perilaku sistem disimpan di tabel `PENGATURAN_SISTEM`, bukan di kode. Admin mengubahnya lewat halaman **"Aturan AI"**.

| Grup | Kunci pengaturan | Nilai awal | Rentang aman |
|---|---|---|---|
| BKT | `bkt.peluang_awal` | 0,5 | 0,1–0,9 |
| BKT | `bkt.tebakan` | 0,25 | 0,05–0,4 |
| BKT | `bkt.ceroboh` | 0,10 | 0,01–0,3 |
| BKT | `bkt.belajar_saat_sesi` | 0,15 | 0–0,5 |
| BKT | `bkt.ambang_tercapai` | 0,85 | 0,7–0,99 (harus > ambang_belum) |
| BKT | `bkt.ambang_tercapai_sesi` | 0,95 | 0,8–0,99 |
| BKT | `bkt.min_soal_tercapai` | 3 | 2–5 |
| BKT | `bkt.ceroboh_lelah` | 0,30 | harus ≥ `bkt.ceroboh`, maks. 0,4 |
| Asesmen | `asesmen.berhenti_dini` | true | true/false |
| BKT | `bkt.ambang_belum` | 0,30 | 0,05–0,5 |
| BKT | `bkt.min_soal_per_tp` / `bkt.maks_soal_per_tp` | 2 / 4 | 1–3 / 3–8 |
| Asesmen | `asesmen.maks_soal_per_sesi` | 12 | 5–20 |
| Sesi | `sesi.durasi_ringan` / `normal` / `penuh` (menit) | 10 / 20 / 30 | 3–15 / 10–30 / 15–45 |
| Sesi | `sesi.hari_mood_turun_pemicu_chatbot` | 3 | 1–7 |
| Sesi | `sesi.hari_lemas_pemicu_perhatian` | 3 | 2–7 |
| Sesi | `sesi.salah_beruntun_pemicu_cek` | 3 | 2–5 |
| Kuis | `kuis.gagal_sebelum_ditinjau_guru` | 2 | 1–5 |
| Krisis | `krisis.daftar_kata_kunci` | daftar awal dari psikolog | **tidak boleh kosong** |
| Rujukan | `rujukan.aturan_level` | tabel level 1–3 (bagian 8.2) | — |
| LLM | `llm.batas_waktu_detik` | 8 | 3–20 |
| LLM | `llm.maks_kalimat_tutor` | 3 | 1–5 |
| Demo | `demo.pakai_cadangan` | false | true/false. Jika true, semua fitur LLM langsung memakai jawaban cadangan (untuk sinyal panggung buruk) |

Aturan pengaman:
- Validasi rentang di **server**. Tolak nilai di luar rentang aman dan kombinasi yang tidak logis.
- Setiap perubahan wajib menyertakan **alasan**, dan tercatat di `LOG_AKTIVITAS` (nilai lama, nilai baru, siapa, kapan).
- Pengaturan **berversi**: perubahan hanya berlaku untuk sesi atau asesmen **baru**, tidak mengubah hasil yang sudah berjalan. Sediakan tombol **"Kembalikan ke versi sebelumnya"**.
- Perubahan daftar kata kunci krisis hanya boleh **menambah atau merevisi**, tidak boleh mengosongkan. Idealnya disetujui psikolog mitra (roadmap).
- Tampilkan **pratinjau dampak** sebelum disimpan bila memungkinkan, misalnya "Dengan ambang 0,90, rata-rata soal per TP naik dari 2,4 menjadi 3,1" (dihitung dari simulasi data jawaban yang ada).

### 8.5 Bank soal dan tinjauan soal buatan AI (admin)

Alur soal buatan AI:
1. Admin memilih TP lalu menekan **"Buat variasi soal dengan AI"**. Input ke LLM: deskripsi TP, contoh soal terbit, jenis penggunaan, tingkat kesulitan. Output JSON: pertanyaan, 4 pilihan, kunci, `miskonsepsi` setiap pengecoh, `pembahasan`.
2. Server memvalidasi otomatis sebelum masuk antrean:
   - tepat 4 pilihan, tepat 1 kunci, tidak ada pilihan ganda;
   - setiap pengecoh punya `miskonsepsi`;
   - untuk soal hitungan sederhana, **kunci dicek ulang dengan perhitungan program** (jangan percaya kunci dari LLM);
   - bahasa sesuai usia (kalimat pendek, tanpa kata sulit);
   - tidak mirip berlebihan dengan soal yang sudah ada.
3. Soal masuk **antrean tinjauan** berstatus `draf` dengan label "Dibuat AI".
4. Peninjau (admin atau guru yang ditunjuk) bisa **menerbitkan**, **menyunting lalu menerbitkan**, atau **menolak dengan alasan**. Soal AI **tidak pernah langsung tampil ke anak**.
5. Semua tindakan tercatat. Alasan penolakan dipakai untuk memperbaiki prompt.

Status soal: `draf` → `ditinjau` → `terbit` (atau `ditolak`). Hanya soal `terbit` yang dipakai sistem. Soal dari file data awal diimpor dengan status `terbit` dan sumber `manual`.

Fitur bank soal lain: filter per TP, jenis penggunaan, tingkat kesulitan, sumber (manual/AI), dan status; statistik per soal (berapa kali muncul, persentase benar, pengecoh yang paling sering dipilih) untuk menemukan soal yang terlalu mudah, terlalu sulit, atau membingungkan.

### 8.6 Evaluasi AI (admin)

Halaman **"Evaluasi AI"** memantau apakah setiap fitur AI bekerja baik. Data diambil dari `LOG_AI`, `UMPAN_BALIK_AI`, dan tabel proses belajar.

| Fitur AI | Yang diukur | Sumber data |
|---|---|---|
| AI tutor | Persentase penjelasan dinilai membantu (jempol dari pendamping/guru); persentase anak menjawab benar pada percobaan berikutnya setelah penjelasan | `UMPAN_BALIK_AI`, `JAWABAN` |
| Draf laporan sekolah | Persentase draf dikirim tanpa diubah; rata-rata besarnya suntingan | `LOG_AI` (output vs versi akhir) |
| Generator soal | Persentase soal diterbitkan vs ditolak; alasan penolakan terbanyak | Status `SOAL`, `LOG_AKTIVITAS` |
| Chatbot triase | Jumlah eskalasi, persentase yang ditandai **alarm palsu** oleh petugas, kasus yang terlewat (dilaporkan manual) | `RUJUKAN`, catatan tindak lanjut |
| Asesmen BKT | Kesesuaian status "tercapai" dengan hasil kuis berikutnya; status "disimpulkan" yang kemudian dikoreksi | `PROGRES_TP`, `JAWABAN` |
| Keandalan teknis | Jumlah panggilan, rata-rata waktu respons, persentase gagal/timeout, persentase memakai fallback | `LOG_AI` |

Catatan:
- Untuk chatbot, **alarm palsu lebih dapat diterima daripada kasus terlewat**. Jangan menaikkan ambang hanya untuk mengurangi alarm palsu.
- Evaluasi AI **tidak menampilkan isi percakapan anak**; hanya hitungan dan kategori.
- Metrik BKT menjadi dasar kalibrasi parameter dari data (roadmap). Di MVP cukup ditampilkan.
- Untuk demo, bagian asesmen BKT menampilkan **hasil uji siswa virtual** dari `hasil_uji_asesmen.json` (berlabel "hasil simulasi"): perbandingan varian V0/V3/pembanding dan skenario S1–S5. Bagian keandalan teknis memakai hitungan nyata dari `LOG_AI`. Metrik lain diisi data contoh berlabel jelas.

### 8.7 Log aktivitas akun (admin)

Catat di `LOG_AKTIVITAS`:
- login, logout, gagal login berulang, ganti PIN;
- pendaftaran, verifikasi, dan penonaktifan akun; perubahan peran atau hubungan pendamping;
- **akses ke data anak** oleh guru dan admin (siapa, data apa, kapan);
- persetujuan dan penolakan rujukan; penanganan eskalasi;
- perubahan pengaturan aturan AI;
- tindakan pada bank soal (buat, sunting, terbitkan, tolak);
- unduh dan pembagian laporan sekolah.

Aturan:
- Log **hanya bisa ditambah**, tidak bisa diubah atau dihapus lewat aplikasi.
- Jangan menyimpan data sensitif di log (password, PIN, isi cerita anak). Cukup ID dan jenis tindakan.
- Halaman admin menyediakan filter (pengguna, jenis tindakan, rentang waktu) dan ekspor CSV.

---

## 9. Model data (20 tabel)

Gunakan nama tabel dan kolom berikut. **Jangan mengubah skema tanpa persetujuan tim.**

- `USERS` (id, nama, email, no_hp, password_hash, pin_pendamping_hash, role: admin|pendamping). Login MVP memakai email + password; `password_hash` dan `pin_pendamping_hash` diisi hash bcrypt, tidak pernah teks asli.
- `ANAK` (id, nama_panggilan, tgl_lahir, kelas_terakhir, kelas_seharusnya, tgl_berhenti_sekolah, pin_hash opsional, fase_pengobatan, mode_jeda, batas_layar_menit)
- `PENDAMPINGAN` (pendamping_id, anak_id, hubungan: orang_tua|wali|guru)
- `MAPEL` (id, nama)
- `TUJUAN_PEMBELAJARAN` (kode, mapel_id, elemen, fase, kelas, urutan, deskripsi, esensial_transisi)
- `PRASYARAT_TP` (tp_kode, prasyarat_kode)
- `KONTEN` (id, tp_kode, jenis: baru|ulang|jembatan|santai, format: video|audio|interaktif, durasi_menit, butuh_layar, url)
- `SOAL` (id, tp_kode, penggunaan: diagnostik|formatif|santai, tingkat_kesulitan, pertanyaan, bacaan (teks, boleh kosong), visual, pembahasan, sumber: manual|ai, status: draf|ditinjau|terbit|ditolak, dibuat_oleh, ditinjau_oleh, alasan_penolakan)
- `PILIHAN` (id, soal_id, teks, benar, miskonsepsi)
- `CHECKIN` (id, anak_id, tanggal, energi, cuaca_hati, keluhan)
- `SESI` (id, anak_id, checkin_id, jenis: diagnostik|belajar, level: istirahat|ringan|normal|penuh, mulai, selesai)
- `JAWABAN` (id, sesi_id, pilihan_id, waktu_respons_ms)
- `PROGRES_TP` (anak_id, tp_kode, status, sumber_status, p_menguasai, diperbarui_at)
- `SKRINING` (id, anak_id, waktu, perasaan, sumber, kebutuhan, level, sinyal_krisis)
- `LAYANAN_DUKUNGAN` (id, nama, jenis: komunitas|konseling|darurat, kontak)
- `RUJUKAN` (id, skrining_id, layanan_id, disetujui_oleh, status, disetujui_at, alarm_palsu, catatan_tindak_lanjut)

Tabel untuk fitur admin (bagian 8.4–8.7):
- `PENGATURAN_SISTEM` (id, kunci, nilai_json, versi, aktif, alasan, diubah_oleh, diubah_at). Satu baris per versi; hanya satu versi aktif per kunci.
- `LOG_AKTIVITAS` (id, user_id, jenis_tindakan, entitas, entitas_id, detail_json tanpa data sensitif, created_at). Hanya bisa ditambah.
- `LOG_AI` (id, fitur: tutor|chatbot|laporan|generator_soal, anak_id opsional, ringkasan_input, output_json, valid, pakai_fallback, waktu_respons_ms, versi_prompt, created_at). Untuk chatbot, simpan **kategori saja**, bukan isi cerita anak.
- `UMPAN_BALIK_AI` (id, log_ai_id, user_id, nilai: membantu|tidak_membantu, komentar, created_at)

Catatan desain:
- **MySQL:** buat database dan semua tabel dengan `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, dan set `charset: 'utf8mb4'` di koneksi. Kolom `*_json` bertipe `JSON`, kolom ya/tidak bertipe `TINYINT(1)`, pilihan nilai (enum) boleh `ENUM` atau `VARCHAR`. Simpan waktu dalam UTC.
- Benar/salah jawaban diambil dari `PILIHAN.benar` (tidak disimpan ganda).
- Fase bisa diturunkan dari kelas, tetapi disimpan di TP untuk kemudahan kueri.
- `PROGRES_TP.status` sengaja disimpan (bukan dihitung ulang) karena dipengaruhi validasi guru dan agar peta cepat dimuat.
- `RUJUKAN.disetujui_oleh` hanya sah jika pendamping tersebut berhubungan `orang_tua` atau `wali`.

### Data awal
File **`data/data_awal_matematika_fase_A_B.json`** berisi 16 TP Matematika elemen Bilangan (A1–A8, B1–B8), 19 relasi prasyarat, dan 64 soal diagnostik (4 per TP) lengkap dengan `miskonsepsi` dan `pembahasan`. Status: **draf**, perlu ditinjau guru SD. Buat skrip seed yang mengimpor file ini ke database.

File **`data/data_awal_bahasa_indonesia_fase_A_B.json`** (mapel_id 2) berisi 12 TP elemen Membaca dan Memirsa (BI-A1–BI-A6, BI-B1–BI-B6), 13 relasi prasyarat, dan 48 soal diagnostik dengan format yang sama. Bedanya hanya kolom **`bacaan`**: teks yang dibaca anak sebelum menjawab (34 soal memakainya); tampilkan di atas pertanyaan dengan tombol speaker. Status: **draf**, pembagian kelas masih perkiraan dari CP. Mapel ini semula di luar lingkup 24 jam; kini diimpor untuk demo (lihat bagian 5, "Tambahan atas keputusan tim"). Kode asesmen dan sesi memakai `mapel_id` dari data (`?mapel=` di URL), tidak ditulis langsung di kode.

File **`data/data_awal_ipas_kelas_4.json`** (mapel_id 3, IPAS-B1–B7) dan **`data/data_awal_pendidikan_pancasila_kelas_4.json`** (mapel_id 4, PP-B1–B5) adalah mapel pustaka kelas 4: tanpa prasyarat, 5 soal latihan per TP. Kaitannya dengan materi ada di `tp_terkait` pada `data_materi_per_kelas_SD.json`. Status: **draf ditulis dengan bantuan AI**, wajib ditinjau guru. Semua kurikulum diimpor oleh `npm run seed`; untuk database yang sudah terisi tanpa menghapus data, pakai `npm run impor-kurikulum`. Simulasi siswa virtual pada peta ini: rata-rata 12 soal (90% anak ≤ 16), akurasi status TP 94,7%.

Rantai penting untuk demo:
- Operasi hitung: A1 → A3 → A4 → B3 → B4 → B5
- Pecahan (bercabang): A1 → A8 → B6 → B7 → B8, dan B3 → B7

---

## 10. Acuan kurikulum

- **CP:** Keputusan Kepala BSKAP No. 046/H/KR/2025 (ditetapkan 16 Juli 2025). Perubahan tahun 2026 (BKPDM No. 020/2026) hanya untuk Agama dan Budi Pekerti; CP Matematika dan Bahasa Indonesia tetap mengacu 046/H/KR/2025.
- **CP disusun per fase:** Fase A (kelas 1–2), Fase B (kelas 3–4), Fase C (kelas 5–6). Teks CP memakai kata "umumnya" untuk kelas, sehingga capaian anak tidak harus sama dengan kelasnya.
- **TP dan ATP:** disusun dari CP 2025 dengan inspirasi ATP Ruang GTK, termasuk ATP Transisi Fase A dan B.
- **Asesmen dan pelaporan:** Panduan Pembelajaran dan Asesmen (PPA) edisi revisi 2025.
- Istilah yang benar untuk SD: **modul ajar** (bukan RPS).

Mata pelajaran:
- **Jalur adaptif:** Matematika (MVP), Bahasa Indonesia elemen Membaca (berikutnya).
- **Pustaka materi (roadmap):** IPAS, Pendidikan Pancasila. Tanpa asesmen penempatan; posisi mengikuti bab yang sedang dipelajari kelas asal. Format materi menyesuaikan level membaca anak dari hasil Bahasa Indonesia (misalnya video/audio jika belum lancar membaca).
- Sistem **tidak bergantung pada mata pelajaran**: menambah mapel cukup dengan menambah data.

---

## 11. Teknologi (final untuk hackathon)

- **Framework:** Next.js (App Router) + TypeScript.
- **Hosting:** **Google Cloud Platform**: aplikasi di **Cloud Run**, database di **Cloud SQL for MySQL 8**, keduanya di region Jakarta (`asia-southeast2`). Tidak memakai Vercel. Langkah deploy di `docs/ARSITEKTUR_TEKNIS.md` bagian 7.3.
- **Database:** **MySQL 8** dengan charset **`utf8mb4`** (wajib, karena soal memakai emoji). Akses lewat `mysql2` + satu file SQL skema; Drizzle (mysql) boleh jika ada anggota yang familiar.
- **Login:** buatan sendiri, sederhana: password dan PIN di-hash dengan `bcryptjs`, sesi disimpan di cookie terenkripsi `httpOnly` (`iron-session`). Tidak ada Row Level Security di MySQL, jadi hak akses **wajib dicek di setiap API route** berdasarkan peran dan `PENDAMPINGAN` (`/lib/db/rbac.ts`).
- **UI:** Tailwind CSS + shadcn/ui. Desain referensi dari Google Stitch.
- **Animasi maskot:** `motion` (Framer Motion).
- **Grafik:** Recharts, hanya di Evaluasi AI.
- **AI:** satu penyedia LLM dengan mode keluaran JSON, dipanggil dari API route server. Siapkan API key cadangan.
- **Suara:** Web Speech API bawaan browser untuk membacakan soal dan penjelasan.
- **PDF laporan:** halaman cetak + `window.print()`.
- **Tes:** Vitest untuk fungsi murni.
- **Tidak dipakai di MVP:** React Flow, @react-pdf/renderer, PWA/offline, OTP SMS.

Struktur folder lengkap, konfigurasi lingkungan, dan pembagian modul ada di `docs/ARSITEKTUR_TEKNIS.md`. Jika ada yang bertentangan, dokumen ini (PANDUAN) yang berlaku. Ringkasnya:
```
/app            → halaman (anak, pendamping, admin) dan API route
/lib/bkt        → logika BKT dan penelusuran prasyarat (fungsi murni, mudah dites)
/lib/sesi       → aturan level sesi
/lib/ai         → pemanggilan LLM, prompt, validasi output, fallback
/lib/krisis     → deteksi sinyal krisis berbasis aturan
/lib/pengaturan → baca/tulis PENGATURAN_SISTEM, validasi rentang aman, versi
/lib/log        → pencatatan LOG_AKTIVITAS dan LOG_AI
/lib/evaluasi   → perhitungan metrik evaluasi AI
/lib/db         → akses database
/data           → file data awal JSON
/scripts        → seed database
/components     → komponen UI
```

---

## 12. Privasi dan keamanan

- Prinsip minimisasi data (UU Pelindungan Data Pribadi, data anak termasuk sensitif): tidak ada diagnosis, data obat, nomor HP, atau email anak.
- Transkrip chatbot tidak disimpan di MVP.
- Guru pendamping wajib diverifikasi admin sebelum bisa mengakses data anak.
- API key hanya di environment variable server.
- Data demo memakai nama samaran (misalnya "Raka").

---

## 13. Prinsip UI/UX

- Hangat, tenang, penuh harapan. **Tidak boleh terlihat seperti aplikasi rumah sakit.**
- Mode anak: target sentuh besar (min. 56px), teks minim, ikon dan ilustrasi untuk setiap aksi, **tombol speaker di setiap instruksi**.
- **Dilarang:** tanda X merah, kata "Salah", timer hitung mundur, papan peringkat, perbandingan dengan anak lain, label "tertinggal". Kesalahan ditampilkan lembut ("Yuk, coba lihat lagi").
- Untuk anak: bingkai positif ("3 pos lagi menuju Pecahan!"). Untuk pendamping: data detail.
- Palet (tema api hangat): latar krem `#FFF4E4`, permukaan pasir `#F9DAAC`, garis tepi jingga `#DC895B`, aksen emas `#ECAC54`, aksi utama bata `#BF4338` (bayangan/hover `#8C2B29`), teks cokelat tua `#2E0B07`, hiasan merah muda `#E79CA2` (juga untuk fitur emosi/chat). "Perlu perhatian" memakai emas, bukan merah. Warna bata/merah **hanya** untuk tombol aksi, ikon, dan hiasan; **tidak pernah** untuk menandai kesalahan. Latar tetap terang; merah tidak dipakai sebagai warna latar dominan. Huruf: Nunito.
- Maskot: nyala api kecil bernama "Pijar" (api dari pelita), satu gambar per ekspresi di `/public/pijar`. Ekspresi dibuat lewat gerak tubuh dengan `motion`: `idle` (mengambang pelan), `senang` (melompat + bintang), `coba_lagi` (miring lembut, **bukan** menggeleng), `lelah` (turun sedikit + "Zzz"). Jika aset wajah terpisah sudah dibuat sebelum hari-H, boleh memakai teknik tumpuk stiker wajah.
- Bintang dan poin boleh, tetapi **tanpa streak harian yang bisa putus** (lihat 7.1).
- **Semua teks antarmuka dalam Bahasa Indonesia.**

---

## 14. Skenario demo (±130 detik, di dalam presentasi 5 menit)

Tokoh: **Raka**, 10 tahun, kelas seharusnya 4, kelas terakhir 3, leukemia fase pemeliharaan. Pendamping: Ibu Sari (orang tua), Kak Dina (guru pendamping, di-seed).

| Waktu | Layar | Yang terlihat |
|---|---|---|
| ±25 detik | Check-in | Raka memilih "lemas 🌧️ + mata lelah" → level ringan, mode audio 5 menit mengulang materi yang sudah dikuasai. Jalur "semangat" cukup disebut lisan |
| ±40 detik | Asesmen, mode demo putar otomatis | Mulai dari B3, Raka salah 2 kali → B4, B5, B7, B8 berubah "belum" tanpa diuji → turun ke A4, A7, A8, A5, B2 yang dikuasai → titik mulai B3 di Pos Dasar (17 soal, ±25 detik) |
| ±25 detik | Sesi B3 | Kartu belajar → soal B3-D3, Raka menjawab 13 → AI tutor: "menjumlahkan, bukan mengalikan", 6 × 7 sebagai 6 kelompok berisi 7 (pakai jawaban cadangan jika API lambat) |
| ±30 detik | Dashboard Ibu Sari | Tren check-in + kartu "perlu perhatian", progres per TP, draf laporan AI → halaman cetak |
| ±10 detik | Teman Cerita | Satu skrining → rujukan masuk Keputusan Menunggu (lewati jika waktu mepet) |

Siapkan setiap layar di tab terpisah. Tekan **Reset demo** sebelum naik panggung.

Tab cadangan untuk tanya jawab: **Aturan AI**, **Evaluasi AI** (hasil uji siswa virtual), **antrean tinjauan soal buatan AI**, dan file `/lib/bkt` beserta hasil tesnya. Keempatnya menjawab pertanyaan seperti "bagaimana kalau AI-nya salah?", "siapa yang mengontrol AI-nya?", dan "coba jelaskan kodenya".

---

## 15. Cara bekerja untuk AI coding assistant

- **Jangan membuat fitur di luar bagian 5.** Jika diminta fitur yang masuk roadmap, ingatkan tim dulu. Setelah H17 tidak ada fitur baru, hanya perbaikan.
- Setiap modul punya satu pemilik di tim yang harus bisa menjelaskannya ke juri. Tulis kode yang sederhana dan mudah dibaca, bukan yang paling canggih.
- Kerjakan **per modul kecil** sesuai struktur folder; jangan menulis seluruh aplikasi sekaligus.
- Sebelum membuat fitur, cek bagian terkait di dokumen ini. Jika dokumen tidak mengatur, **tanya dulu**, jangan menebak.
- Jangan mengubah skema database, aturan BKT, atau aturan level sesi tanpa persetujuan.
- **Jangan menulis angka ambang, durasi, atau daftar kata kunci langsung di kode.** Selalu baca dari `PENGATURAN_SISTEM` melalui `/lib/pengaturan`.
- Setiap pemanggilan LLM wajib dicatat di `LOG_AI`, dan setiap tindakan penting dicatat di `LOG_AKTIVITAS`.
- Soal buatan AI tidak boleh pernah tampil ke anak sebelum berstatus `terbit`.
- Logika BKT, penelusuran prasyarat, aturan level sesi, dan deteksi krisis ditulis sebagai **fungsi murni** dan diberi **tes unit**.
- Beri nama variabel dan fungsi yang jelas dan konsisten dengan istilah di dokumen ini (misalnya `tentukanLevel`, `perbaruiBKT`, `p_menguasai`).
- Tambahkan komentar singkat pada logika penting supaya tim bisa menjelaskannya ke juri.
- Commit kecil dan sering dengan pesan yang jelas.
- Jangan menambahkan dependensi besar tanpa alasan.

---

## 16. Hal yang belum pasti (konfirmasi ke panitia)

- Apakah proposal masih perlu dikirim sebelum hari-H?
- Apakah subtema harus dipilih saat pendaftaran?
- Bolehkah memakai API AI pihak ketiga (termasuk berbayar)?
- Bolehkah data awal (TP, soal, data demo), teks prompt, dan aset desain disiapkan sebelum hari-H?
- Berapa durasi presentasi yang berlaku: 5 menit termasuk demo + 10 menit tanya jawab, atau 7 + 13 menit seperti guidebook versi 1?

Semua lembaga di Sumatera Barat (RS M. Djamil, YKI Sumbar, IZI Sumbar, HIMPONI Sumbar, Dinas PPPA, Dinas Pendidikan) berstatus **calon mitra** sampai ada kesepakatan.
