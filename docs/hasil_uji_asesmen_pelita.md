# Hasil Uji Asesmen Adaptif PELITA dengan Siswa Virtual

Versi 1 · 3 November 2026 · Data: `data_awal_matematika_fase_A_B.json` (16 TP, 19 prasyarat, 64 soal diagnostik)

## 1. Ringkasan

Asesmen penempatan Matematika diuji dengan 2.000 siswa virtual per skenario. Setiap siswa virtual punya peta penguasaan yang sudah kita ketahui, jadi hasil asesmen bisa dicek benar atau salahnya.

Uji ini menemukan satu kelemahan pada rancangan awal: TP bisa dinyatakan **tercapai** setelah hanya 2 jawaban benar. Anak yang belum paham pun punya peluang 6% menebak benar 2 kali berturut-turut (0,25 × 0,25). Kesalahan ini lalu ikut menyebar ke semua prasyarat TP tersebut, dan titik mulai jadi terlalu tinggi pada 28% siswa.

Setelah aturan diperbaiki (varian **V3**: tercapai butuh minimal 3 soal, dan asesmen berhenti begitu titik mulai sudah pasti), hasil pada kondisi normal:

| Ukuran | Rancangan awal (V0) | **Rekomendasi (V3)** | Pembanding: uji semua TP |
|---|---|---|---|
| Status TP benar | 93,1% | **95,4%** | 94,6% |
| Titik mulai tepat | 67,0% | **76,7%** | 81,5% |
| Titik mulai terlalu tinggi (ada materi terlewat) | 28,0% | **17,6%** | 4,5% |
| Rata-rata soal | 17,8 | **18,0** | 44,0 |
| TP yang benar-benar diuji | 7,3 dari 16 | **6,5 dari 16** | 16 dari 16 |

Artinya, V3 menghasilkan status TP seakurat menguji semua TP, tetapi dengan **59% lebih sedikit soal** (18 dibanding 44). Ini penting untuk anak yang sedang sakit dan cepat lelah. Harganya: titik mulai sedikit kurang tepat (76,7% dibanding 81,5%) dan lebih sering terlalu tinggi. Sisa risiko ini ditangani oleh lapis koreksi saat belajar (bagian 6).

## 2. Cara menguji

**Siswa virtual.** Setiap siswa diberi kelas seharusnya (2–5) dan tingkat kemampuan (kuat, sedang, tertinggal, sangat tertinggal). Penguasaan dibangkitkan mengikuti urutan TP: TP hanya bisa dikuasai jika prasyaratnya dikuasai. Materi di atas kelasnya hampir selalu belum dikuasai.

**Cara siswa virtual menjawab.** Jika menguasai TP, siswa menjawab benar dengan peluang 1 − ceroboh. Jika belum, siswa hanya benar karena menebak.

**Skenario.** Diuji juga kondisi saat perilaku anak tidak sesuai asumsi sistem:

| Kode | Kondisi | Kenapa relevan |
|---|---|---|
| S1 | Ideal: ceroboh 0,10, tebakan 0,25 (sama dengan parameter sistem) | Pembanding dasar |
| S2 | Ceroboh 0,20 | Anak lelah atau mual saat mengerjakan |
| S3 | Tebakan 0,35 | Pengecoh soal kurang kuat, anak bisa mengeliminasi |
| S4 | 10% TP dikuasai tanpa prasyarat | Peta prasyarat tidak sepenuhnya cocok dengan anak nyata |
| S5 | Gabungan S2 + S3 + S4 | Kondisi terberat |

**Varian aturan.**

| Kode | Aturan |
|---|---|
| V0 | Rancangan awal di PANDUAN 7.2: min 2 soal, maks 4, ambang 0,85 / 0,30 |
| V1 | V0, tetapi status **tercapai** butuh minimal 3 soal (status belum tetap boleh setelah 2 soal) |
| V2 | V1 dengan maks 3 soal per TP |
| V3 | V1 + **berhenti dini**: asesmen selesai saat titik mulai sudah pasti, TP di atasnya tidak diuji |
| B | Pembanding: semua 16 TP diuji berurutan dengan aturan V1, tanpa penyimpulan prasyarat |

**Ukuran yang dihitung.** Akurasi status per TP; titik mulai tepat (sama dengan TP perbatasan pertama yang sebenarnya); arah meleset (ke bawah berarti anak mengulang materi yang sudah dikuasai, ke atas berarti ada materi yang terlewat); jumlah soal.

## 3. Hasil per skenario (V3 dibanding pembanding)

| Skenario | Status TP benar (V3 / B) | Titik mulai tepat (V3 / B) | Terlalu tinggi (V3 / B) | Rata-rata soal (V3 / B) |
|---|---|---|---|---|
| S1 Ideal | 95,4% / 94,6% | 76,7% / 81,5% | 17,6% / 4,5% | 18,0 / 44,0 |
| S2 Lebih ceroboh | 93,4% / 91,8% | 66,1% / 63,6% | 16,2% / 3,2% | 18,0 / 44,4 |
| S3 Lebih sering menebak | 90,6% / 89,2% | 60,1% / 75,8% | 34,8% / 10,8% | 18,8 / 46,8 |
| S4 Pola tidak ideal | 92,3% / 94,7% | 67,0% / 80,6% | 27,2% / 4,3% | 18,0 / 44,4 |
| S5 Terberat | 85,7% / 85,5% | 44,6% / 58,1% | 38,5% / 7,5% | 18,9 / 47,7 |

Tabel lengkap semua varian ada di Lampiran A.

## 4. Temuan

1. **Dua jawaban benar terlalu cepat untuk menyatakan tercapai.** Ini sumber kesalahan terbesar di V0. Menaikkan syarat menjadi 3 soal menurunkan titik mulai yang terlalu tinggi dari 28,0% menjadi 17,1%, dengan tambahan rata-rata 2 soal.
2. **Membatasi maksimal 3 soal per TP justru memperburuk hasil (V2).** Pada soal ke-3 sistem dipaksa memutuskan, dan pola benar-benar-salah langsung dianggap tercapai. Batas maksimal 4 soal sebaiknya dipertahankan.
3. **Berhenti dini menghemat sekitar 2 soal tanpa menurunkan akurasi** (V1 → V3: 20,1 → 18,0 soal). Sekitar 5% TP dibiarkan "belum diketahui". TP ini berada di atas titik mulai, jadi akan dicek saat anak sampai ke sana.
4. **Penyimpulan prasyarat bekerja.** Pada V3 lebih dari separuh status TP (55%) diperoleh dari penyimpulan, bukan dari soal. Akurasinya 96,4%, malah sedikit di atas TP yang diuji langsung (94,6%).
5. **Kesalahan V3 condong ke atas, kesalahan pembanding condong ke bawah.** Penyimpulan "tercapai → semua prasyarat tercapai" ikut menyebarkan satu tebakan beruntung ke beberapa TP. Inilah alasan lapis koreksi di bagian 6 wajib ada.
6. **Ketika anak lebih sering menebak benar (S3), akurasi turun paling tajam.** Kualitas pengecoh soal lebih menentukan daripada aturan BKT. Soal dengan pengecoh lemah perlu diperbaiki lewat review soal di dashboard admin.
7. **Jumlah soal melebihi batas sesi.** Rata-rata 18 soal, dan 90% siswa selesai dalam 24 soal, sedangkan batas per sesi adalah 10–12 soal. Asesmen satu mapel perlu dibagi menjadi **2 sesi**. Fitur simpan-dan-lanjutkan wajib berjalan.
8. **Aturan "soal ke-4: tercapai jika p ≥ 0,5" hampir tidak pernah menentukan hasil.** Setelah 4 jawaban, nilai p selalu sudah melewati salah satu ambang. Aturan ini boleh dipertahankan sebagai pengaman.

## 5. Jejak asesmen Raka (untuk demo)

Profil demo: Raka, seharusnya kelas 4. Ia menguasai A1–A8, B1, B2, B6, tetapi belum menguasai perkalian (B3). Karena itu pembagian, kelipatan, pecahan senilai, dan desimal (B4, B5, B7, B8) juga belum. Titik mulai yang benar: **B3**.

Jejak V3 jika Raka menjawab sesuai penguasaannya:

| Langkah | TP diuji | Jawaban | Peluang menguasai | Keputusan |
|---|---|---|---|---|
| 1–2 | B3 Perkalian | ✗ ✗ | 0,50 → 0,12 → 0,02 | **Belum** → B4, B5, B7, B8 disimpulkan belum |
| 3–5 | A4 Jumlah/kurang sampai 20 | ✓ ✓ ✓ | 0,50 → 0,78 → 0,93 → 0,98 | Tercapai → A1, A3 disimpulkan tercapai |
| 6–8 | A7 Nilai tempat sampai 100 | ✓ ✓ ✓ | 0,50 → 0,78 → 0,93 → 0,98 | Tercapai → A2, A6 disimpulkan tercapai |
| 9–11 | A8 Pecahan ½ dan ¼ | ✓ ✓ ✓ | sama | Tercapai |
| 12–14 | A5 Makna "=" dan soal cerita | ✓ ✓ ✓ | sama | Tercapai |
| 15–17 | B2 Jumlah/kurang sampai 1.000 | ✓ ✓ ✓ | sama | Tercapai → B1 disimpulkan tercapai |

Hasil: titik mulai **B3**, 17 soal. B6 tidak perlu diuji karena tidak memengaruhi titik mulai.

Saat Raka menjawab dengan ceroboh dan menebak secara acak (2.000 ulangan), titik mulai B3 ditemukan pada 73,5% ulangan. Hanya 4% meleset ke atas (B4, B5, B7). Sisanya meleset ke bawah karena Raka ceroboh pada materi yang sebenarnya ia kuasai, jadi ia hanya mengulang materi yang sudah dikuasai.

**Dua hal di naskah demo yang perlu disesuaikan:**
- PANDUAN bagian 15 menulis "masalah Raka di pecahan senilai (B7) ternyata berakar di perkalian (B3)". Menurut aturan, asesmen Raka langsung **dimulai dari B3** (TP kunci kelas 3), bukan dari B7. Ceritanya tetap bisa dipakai dengan sedikit diubah: *"Sistem tidak perlu menguji pecahan. Begitu tahu perkalian belum kuat, pecahan senilai otomatis ditandai belum, karena pecahan senilai butuh perkalian."*
- Demo AI tutor memakai soal 702 − 358 (TP B2), padahal di profil ini Raka sudah menguasai B2. Lebih konsisten jika memakai soal B3, misalnya **B3-D3 "6 × 7 = ..."**: Raka menjawab **13**, dan AI tutor menjelaskan miskonsepsi "menjumlahkan, bukan mengalikan".
- Untuk demo 5 menit, tampilkan 3–5 jawaban pertama secara langsung, lalu percepat sisanya.

## 6. Rekomendasi

Perubahan aturan (untuk PANDUAN 7.2 dan `meta.parameter_bkt`):

| Parameter | Lama | Baru |
|---|---|---|
| `min_soal_tercapai` (baru) | — (ikut min 2) | **3** |
| `min_soal_per_tp` (untuk status belum) | 2 | 2 (tetap) |
| `maks_soal_per_tp` | 4 | 4 (tetap, jangan diturunkan) |
| `berhenti_dini` (baru) | — | **true** |
| Batas soal per sesi asesmen | 10–12 | 12, asesmen satu mapel dirancang selesai dalam 2 sesi |

Lapis koreksi saat belajar (menangani sisa titik mulai yang terlalu tinggi):
1. Setiap TP yang statusnya **disimpulkan** atau **belum diketahui** diberi 2 soal cek saat pertama kali muncul. Jika salah, status dikoreksi (aturan ini sudah ada di PANDUAN 7.2, sekarang ada angka yang mendukungnya).
2. Jika kuis formatif di sebuah TP gagal, sistem mengecek prasyarat langsung TP itu yang berstatus tercapai dengan 2 soal per prasyarat. Prasyarat yang ternyata belum dipindah ke Pos Dasar.
3. Soal yang terlalu sering dijawab benar oleh anak berstatus belum ditandai di dashboard admin sebagai "pengecoh lemah" (temuan 6).

## 7. Batasan uji

- Siswa virtual mengikuti model jawaban yang sama dengan model BKT, kecuali di skenario S2–S5. Anak nyata bisa berbeda dengan cara yang tidak kita modelkan, misalnya lelah bertahap di akhir sesi atau salah membaca soal.
- Peta penguasaan dibangkitkan dari aturan sederhana, bukan dari data anak nyata. Angka di sini menguji **logika** asesmen, bukan membuktikan akurasi pada anak sungguhan.
- Semua soal dianggap setara kesulitannya. Tingkat kesulitan soal belum dipakai.
- Hanya Matematika elemen Bilangan (16 TP). Peta yang lebih besar akan butuh lebih banyak soal.
- Parameter BKT ditetapkan manual. Kalibrasi dari data jawaban anak nyata adalah langkah setelah uji coba lapangan.

## 8. Kalimat untuk juri

> "Sebelum diuji ke anak, kami menguji logika asesmen dengan 2.000 siswa virtual yang peta penguasaannya sudah kami ketahui. Uji ini menemukan kelemahan di rancangan awal kami: dua tebakan beruntung bisa membuat anak dianggap sudah paham. Setelah aturannya kami perbaiki, 95% status materi yang ditentukan sistem sesuai kondisi sebenarnya, hampir sama dengan menguji semua materi, tetapi cukup 18 soal, bukan 44. Untuk anak yang sedang menjalani pengobatan, itu berarti asesmen selesai dalam 2 sesi pendek, bukan 4."

Jika juri bertanya "kenapa titik mulai hanya 77% tepat?": *"Separuh dari yang meleset hanya bergeser satu TP. Karena itu penempatan kami tidak final: setiap materi yang disimpulkan dicek ulang dengan dua soal saat anak sampai ke sana, jadi kesalahan penempatan terkoreksi sambil belajar."*

## 9. File dan cara menjalankan

- `simulasi_bkt.py`: skrip uji (Python 3, tanpa pustaka tambahan). Jalankan: `python3 simulasi_bkt.py data_awal_matematika_fase_A_B.json hasil/`
- `hasil_uji_asesmen.json`: semua angka, termasuk jejak lengkap Raka.
- Benih acak tetap, jadi hasil bisa diulang persis.

Catatan aturan lomba: skrip ini alat evaluasi untuk persiapan, bukan kode aplikasi. Fungsi BKT di aplikasi tetap ditulis saat hackathon (di `/lib/bkt`). Skrip ini bisa dipakai sebagai acuan tes unit.

## Lampiran A. Tabel lengkap (2.000 siswa per sel)

| Varian | Skenario | Status TP benar | Titik mulai tepat | Meleset ke bawah | Meleset ke atas | Rata-rata soal | 90% siswa selesai dalam | TP diuji |
|---|---|---|---|---|---|---|---|---|
| V0 | S1 | 93,1% | 67,0% | 5,0% | 28,0% | 17,8 | 23 soal | 7,3 |
| V0 | S2 | 91,6% | 59,3% | 15,9% | 24,8% | 18,2 | 24 soal | 7,3 |
| V0 | S3 | 86,7% | 50,1% | 3,8% | 46,1% | 19,1 | 24 soal | 7,5 |
| V0 | S4 | 90,4% | 59,2% | 5,1% | 35,7% | 17,9 | 23 soal | 7,4 |
| V0 | S5 | 83,2% | 37,3% | 14,7% | 48,0% | 19,4 | 25 soal | 7,4 |
| V1 | S1 | 95,4% | 76,8% | 6,0% | 17,1% | 20,1 | 26 soal | 7,3 |
| V1 | S2 | 93,6% | 67,1% | 17,3% | 15,6% | 20,1 | 27 soal | 7,2 |
| V1 | S3 | 90,4% | 57,0% | 6,3% | 36,7% | 21,3 | 28 soal | 7,3 |
| V1 | S4 | 92,4% | 64,0% | 6,2% | 29,8% | 20,4 | 26 soal | 7,3 |
| V1 | S5 | 85,8% | 43,1% | 16,4% | 40,5% | 22,1 | 28 soal | 7,4 |
| V2 | S1 | 89,0% | 55,2% | 3,3% | 41,5% | 19,1 | 24 soal | 7,4 |
| V2 | S2 | 87,9% | 50,2% | 10,4% | 39,3% | 18,8 | 24 soal | 7,4 |
| V2 | S3 | 79,5% | 35,1% | 2,3% | 62,6% | 20,0 | 25 soal | 7,5 |
| V2 | S4 | 85,8% | 46,5% | 2,6% | 50,9% | 19,4 | 24 soal | 7,5 |
| V2 | S5 | 76,8% | 28,3% | 9,9% | 61,8% | 20,0 | 25 soal | 7,5 |
| **V3** | S1 | 95,4% | 76,7% | 5,7% | 17,6% | 18,0 | 24 soal | 6,5 |
| **V3** | S2 | 93,4% | 66,1% | 17,6% | 16,2% | 18,0 | 24 soal | 6,4 |
| **V3** | S3 | 90,6% | 60,1% | 5,1% | 34,8% | 18,8 | 25 soal | 6,4 |
| **V3** | S4 | 92,3% | 67,0% | 5,9% | 27,2% | 18,0 | 24 soal | 6,5 |
| **V3** | S5 | 85,7% | 44,6% | 16,9% | 38,5% | 18,9 | 26 soal | 6,3 |
| B | S1 | 94,6% | 81,5% | 14,1% | 4,5% | 44,0 | 49 soal | 16 |
| B | S2 | 91,8% | 63,6% | 33,1% | 3,2% | 44,4 | 50 soal | 16 |
| B | S3 | 89,2% | 75,8% | 13,4% | 10,8% | 46,8 | 51 soal | 16 |
| B | S4 | 94,7% | 80,6% | 15,0% | 4,3% | 44,4 | 50 soal | 16 |
| B | S5 | 85,5% | 58,1% | 34,4% | 7,5% | 47,7 | 52 soal | 16 |

Catatan: titik mulai tepat + meleset ke bawah + meleset ke atas = 100%. Pada V3, akurasi status TP dihitung dari TP yang statusnya diketahui; rata-rata 4,5% TP dibiarkan belum diketahui.
