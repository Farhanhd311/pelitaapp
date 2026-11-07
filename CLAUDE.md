# PELITA

Platform belajar adaptif untuk anak SD dengan penyakit kronis. Proyek Hackathon FIRETECH 2026 (24 jam).

Pedoman lengkap ada di file berikut. Baca seluruhnya sebelum menulis kode, dan ikuti isinya:

@docs/PANDUAN_PROYEK.md

## Aturan paling penting (ringkasan)

- **Bangun hanya fitur di PANDUAN bagian 5.** Fitur lain adalah roadmap; ingatkan tim dulu jika diminta. Setelah titik bekukan fitur (H17), hanya perbaikan bug.
- Kode sederhana, modular, dan mudah dijelaskan. Setiap anggota tim harus bisa menjelaskan kodenya ke juri.
- Logika BKT, penelusuran prasyarat, aturan level sesi, dan deteksi krisis ditulis sebagai **fungsi murni** di `/lib`, dengan tes unit (Vitest). Kasus uji ada di `data/tes_kasus_bkt.json`.
- **Jangan menulis angka ambang, durasi, kata kunci, `mapel_id`, atau kode TP langsung di kode.** Baca dari `PENGATURAN_SISTEM` dan dari data.
- LLM hanya dipanggil dari server, keluarannya JSON yang divalidasi, selalu ada cadangan, dan dicatat di `LOG_AI`. LLM tidak pernah mengambil keputusan sistem.
- Soal untuk anak selalu dari bank soal berstatus `terbit`. Acak urutan pilihan saat ditampilkan.
- **Database MySQL 8 (`utf8mb4`), bukan Supabase/Postgres.** Login buatan sendiri (`bcryptjs` + `iron-session`). Hak akses dicek di setiap API route lewat `lib/db/rbac.ts`, karena MySQL tidak punya Row Level Security. Selalu pakai query berparameter. Anak bukan akun.
- **Hosting di Google Cloud Platform** (Cloud Run + Cloud SQL for MySQL 8, region `asia-southeast2`), bukan Vercel. Langkah deploy: `docs/ARSITEKTUR_TEKNIS.md` bagian 7.3.
- Skill desain di `.claude/skills/` (misalnya UI/UX Pro Max) **hanya referensi**. Jika bertentangan, PANDUAN yang berlaku: palet dan larangan UI di bagian 13, teknologi di bagian 11. Jangan menambah pustaka dari saran skill (misalnya GSAP atau Chart.js; animasi pakai `motion`, grafik pakai Recharts).
- Semua teks antarmuka dalam Bahasa Indonesia. Ikuti prinsip UI di PANDUAN bagian 13 (tanpa tanda X merah, tanpa kata "Salah", tanpa timer hitung mundur).
- Jangan mengubah skema database atau aturan bisnis tanpa persetujuan tim. Jika PANDUAN tidak mengatur sesuatu, tanya dulu.

## File data

| File | Isi |
|---|---|
| `data/data_awal_matematika_fase_A_B.json` | 16 TP, 19 prasyarat, 64 soal diagnostik, parameter BKT awal. **Dipakai di MVP** |
| `data/data_awal_bahasa_indonesia_fase_A_B.json` | 12 TP, 13 prasyarat, 48 soal (ada kolom `bacaan`). Diimpor untuk demo atas keputusan tim (PANDUAN bagian 5) |
| `data/data_awal_ipas_kelas_4.json`, `data/data_awal_pendidikan_pancasila_kelas_4.json` | Mapel pustaka kelas 4 (tanpa asesmen), draf ditulis dengan bantuan AI, wajib ditinjau guru |
| `data/narasi_materi_*.json` | Kartu belajar bercerita per TP (draf, ditinjau guru) |
| `data/data_materi_per_kelas_SD.json` | Materi per kelas 4 mapel untuk peta Beranda (`tp_terkait` = TP yang dipakai sesi) |
| `data/tes_kasus_bkt.json` | Kasus uji untuk `/lib/bkt` |
| `data/hasil_uji_asesmen.json` | Hasil uji siswa virtual untuk halaman Evaluasi AI (berlabel "hasil simulasi") |

Struktur folder, stack, dan konfigurasi lingkungan: `docs/ARSITEKTUR_TEKNIS.md` (ikuti saat membuat file baru; jika bertentangan, PANDUAN yang berlaku).

Kebutuhan produk lengkap (fitur, kriteria penerimaan, alur): `docs/PRD_PELITA.md`. Pakai kriteria penerimaannya saat membangun dan menguji fitur.

Dokumen pendukung (dibaca jika perlu, bukan aturan): `docs/rencana_24_jam_pelita.md` (jadwal dan lingkup), `docs/hasil_uji_asesmen_pelita.md` (penjelasan hasil uji).

Desain referensi dari Google Stitch ada di folder `desain/` (jika sudah ditambahkan tim).
