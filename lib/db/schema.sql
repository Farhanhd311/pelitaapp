-- Skema database PELITA: 20 tabel sesuai PANDUAN_PROYEK.md bagian 9, ditambah materi, narasi_materi
-- (migrasi 0001, disetujui tim) dan riwayat_migrasi.
-- Database yang sudah ada diperbarui lewat `npm run migrasi` (lib/db/migrasi/), BUKAN seed ulang.
-- MySQL 8, InnoDB, utf8mb4 (wajib, karena soal memakai emoji).
-- Nama tabel huruf kecil; dokumen tetap menyebutnya USERS, ANAK, dst.
-- Waktu disimpan dalam UTC: koneksi selalu memakai time_zone '+00:00' (lihat lib/db/index.ts),
-- sehingga DEFAULT CURRENT_TIMESTAMP juga bernilai UTC.
-- File ini hanya berisi CREATE TABLE. Penghapusan tabel dilakukan scripts/seed.ts (khusus database lokal/demo).
-- JANGAN mengubah skema tanpa persetujuan tim.

-- ============================================================
-- Akun dan anak
-- ============================================================

-- Pendamping (orang tua, wali, guru) dan admin. Anak BUKAN akun.
CREATE TABLE users (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama                VARCHAR(100) NOT NULL,
  email               VARCHAR(191) NOT NULL,
  no_hp               VARCHAR(20)  NULL,
  password_hash       VARCHAR(255) NOT NULL,          -- hash bcrypt, tidak pernah teks asli
  pin_pendamping_hash VARCHAR(255) NULL,              -- hash bcrypt PIN untuk masuk mode pendamping
  role                ENUM('admin','pendamping') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profil anak di bawah pendamping. Tanpa diagnosis, data obat, nomor HP, atau email.
CREATE TABLE anak (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama_panggilan       VARCHAR(50)  NOT NULL,
  tgl_lahir            DATE         NOT NULL,
  kelas_terakhir       TINYINT UNSIGNED NOT NULL,
  kelas_seharusnya     TINYINT UNSIGNED NOT NULL,
  tgl_berhenti_sekolah DATE         NULL,
  asal_sekolah         VARCHAR(150) NULL,             -- migrasi 0003; diisi saat pendaftaran
  pin_hash             VARCHAR(255) NULL,             -- PIN anak opsional (hash bcrypt)
  fase_pengobatan      ENUM('intensif','pemeliharaan','pemulihan') NOT NULL,
  mode_jeda            TINYINT(1)   NOT NULL DEFAULT 0,
  batas_layar_menit    SMALLINT UNSIGNED NULL,        -- NULL = tanpa batas dari orang tua
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relasi pendamping-anak. Hak akses data anak dicek lewat tabel ini (lib/db/rbac.ts).
CREATE TABLE pendampingan (
  pendamping_id INT UNSIGNED NOT NULL,
  anak_id       INT UNSIGNED NOT NULL,
  hubungan      ENUM('orang_tua','wali','guru') NOT NULL,
  PRIMARY KEY (pendamping_id, anak_id),
  KEY idx_pendampingan_anak (anak_id),
  CONSTRAINT fk_pendampingan_user FOREIGN KEY (pendamping_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_pendampingan_anak FOREIGN KEY (anak_id) REFERENCES anak (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Kurikulum dan bank soal
-- ============================================================

CREATE TABLE mapel (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tujuan_pembelajaran (
  kode              VARCHAR(20)  NOT NULL,            -- misalnya A1, B3, BI-A1
  mapel_id          INT UNSIGNED NOT NULL,
  elemen            VARCHAR(100) NOT NULL,
  fase              VARCHAR(5)   NOT NULL,
  kelas             TINYINT UNSIGNED NOT NULL,
  urutan            SMALLINT UNSIGNED NOT NULL,
  deskripsi         TEXT         NOT NULL,
  esensial_transisi TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (kode),
  KEY idx_tp_mapel_urutan (mapel_id, urutan),
  CONSTRAINT fk_tp_mapel FOREIGN KEY (mapel_id) REFERENCES mapel (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Graf prasyarat: tp_kode membutuhkan prasyarat_kode.
CREATE TABLE prasyarat_tp (
  tp_kode        VARCHAR(20) NOT NULL,
  prasyarat_kode VARCHAR(20) NOT NULL,
  PRIMARY KEY (tp_kode, prasyarat_kode),
  KEY idx_prasyarat_kode (prasyarat_kode),
  CONSTRAINT fk_prasyarat_tp FOREIGN KEY (tp_kode) REFERENCES tujuan_pembelajaran (kode) ON DELETE CASCADE,
  CONSTRAINT fk_prasyarat_prasyarat FOREIGN KEY (prasyarat_kode) REFERENCES tujuan_pembelajaran (kode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE konten (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tp_kode      VARCHAR(20)  NOT NULL,
  jenis        ENUM('baru','ulang','jembatan','santai') NOT NULL,
  format       ENUM('video','audio','interaktif') NOT NULL,
  durasi_menit SMALLINT UNSIGNED NULL,
  butuh_layar  TINYINT(1)   NOT NULL DEFAULT 1,
  url          VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_konten_tp (tp_kode),
  CONSTRAINT fk_konten_tp FOREIGN KEY (tp_kode) REFERENCES tujuan_pembelajaran (kode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hanya soal berstatus 'terbit' yang boleh tampil ke anak.
CREATE TABLE soal (
  id                VARCHAR(40)  NOT NULL,            -- id dari data, misalnya B3-D3
  tp_kode           VARCHAR(20)  NOT NULL,
  penggunaan        ENUM('diagnostik','formatif','santai') NOT NULL,
  tingkat_kesulitan TINYINT UNSIGNED NOT NULL,
  pertanyaan        TEXT         NOT NULL,
  bacaan            TEXT         NULL,
  visual            VARCHAR(255) NULL,                -- emoji pengganti gambar
  pembahasan        TEXT         NULL,
  sumber            ENUM('manual','ai') NOT NULL,
  status            ENUM('draf','ditinjau','terbit','ditolak') NOT NULL DEFAULT 'draf',
  dibuat_oleh       INT UNSIGNED NULL,
  ditinjau_oleh     INT UNSIGNED NULL,
  alasan_penolakan  TEXT         NULL,
  PRIMARY KEY (id),
  KEY idx_soal_tp_status (tp_kode, status, penggunaan),
  CONSTRAINT fk_soal_tp FOREIGN KEY (tp_kode) REFERENCES tujuan_pembelajaran (kode),
  CONSTRAINT fk_soal_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_soal_ditinjau_oleh FOREIGN KEY (ditinjau_oleh) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Benar/salah jawaban hanya disimpan di sini (tidak disimpan ganda di JAWABAN).
CREATE TABLE pilihan (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  soal_id     VARCHAR(40)  NOT NULL,
  teks        VARCHAR(255) NOT NULL,
  benar       TINYINT(1)   NOT NULL DEFAULT 0,
  miskonsepsi TEXT         NULL,                      -- penghubung ke AI tutor
  PRIMARY KEY (id),
  KEY idx_pilihan_soal (soal_id),
  CONSTRAINT fk_pilihan_soal FOREIGN KEY (soal_id) REFERENCES soal (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Proses belajar
-- ============================================================

CREATE TABLE checkin (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  anak_id    INT UNSIGNED NOT NULL,
  tanggal    DATE         NOT NULL,
  energi     ENUM('lemas','lumayan','semangat') NOT NULL,
  cuaca_hati ENUM('cerah','berawan','hujan','badai') NOT NULL,
  keluhan    VARCHAR(100) NULL,                       -- opsional, misalnya mata lelah, pusing, sakit sekali
  PRIMARY KEY (id),
  KEY idx_checkin_anak_tanggal (anak_id, tanggal),
  CONSTRAINT fk_checkin_anak FOREIGN KEY (anak_id) REFERENCES anak (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sesi (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  anak_id    INT UNSIGNED NOT NULL,
  checkin_id INT UNSIGNED NULL,
  jenis      ENUM('diagnostik','belajar') NOT NULL,
  level      ENUM('istirahat','ringan','normal','penuh') NULL,
  mulai      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  selesai    DATETIME     NULL,
  PRIMARY KEY (id),
  KEY idx_sesi_anak (anak_id, mulai),
  CONSTRAINT fk_sesi_anak FOREIGN KEY (anak_id) REFERENCES anak (id) ON DELETE CASCADE,
  CONSTRAINT fk_sesi_checkin FOREIGN KEY (checkin_id) REFERENCES checkin (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jawaban (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sesi_id          INT UNSIGNED NOT NULL,
  pilihan_id       INT UNSIGNED NOT NULL,
  waktu_respons_ms INT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_jawaban_sesi (sesi_id),
  KEY idx_jawaban_pilihan (pilihan_id),
  CONSTRAINT fk_jawaban_sesi FOREIGN KEY (sesi_id) REFERENCES sesi (id) ON DELETE CASCADE,
  CONSTRAINT fk_jawaban_pilihan FOREIGN KEY (pilihan_id) REFERENCES pilihan (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Status disimpan (tidak dihitung ulang) karena dipengaruhi validasi guru dan agar peta cepat dimuat.
CREATE TABLE progres_tp (
  anak_id       INT UNSIGNED NOT NULL,
  tp_kode       VARCHAR(20)  NOT NULL,
  status        ENUM('belum_diketahui','belum','jembatan','tercapai') NOT NULL,
  sumber_status ENUM('diuji','disimpulkan') NULL,
  p_menguasai   DOUBLE       NULL,                    -- peluang BKT 0-1, tidak ditampilkan ke orang tua
  diperbarui_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (anak_id, tp_kode),
  KEY idx_progres_tp (tp_kode),
  CONSTRAINT fk_progres_anak FOREIGN KEY (anak_id) REFERENCES anak (id) ON DELETE CASCADE,
  CONSTRAINT fk_progres_tp FOREIGN KEY (tp_kode) REFERENCES tujuan_pembelajaran (kode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Teman Cerita dan rujukan
-- ============================================================

-- Hanya hasil skrining yang disimpan; transkrip percakapan TIDAK disimpan.
CREATE TABLE skrining (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  anak_id       INT UNSIGNED NOT NULL,
  waktu         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  perasaan      VARCHAR(50)  NULL,
  sumber        VARCHAR(50)  NULL,
  kebutuhan     VARCHAR(50)  NULL,
  level         TINYINT UNSIGNED NULL,                -- level rujukan dari tabel aturan, bukan dari LLM
  sinyal_krisis TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_skrining_anak (anak_id, waktu),
  CONSTRAINT fk_skrining_anak FOREIGN KEY (anak_id) REFERENCES anak (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE layanan_dukungan (
  id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama   VARCHAR(150) NOT NULL,
  jenis  ENUM('komunitas','konseling','darurat') NOT NULL,
  kontak VARCHAR(255) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- disetujui_oleh hanya sah jika pendamping berhubungan orang_tua/wali (dicek di server).
CREATE TABLE rujukan (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  skrining_id           INT UNSIGNED NOT NULL,
  layanan_id            INT UNSIGNED NULL,
  disetujui_oleh        INT UNSIGNED NULL,
  status                VARCHAR(30)  NOT NULL,
  disetujui_at          DATETIME     NULL,
  alarm_palsu           TINYINT(1)   NOT NULL DEFAULT 0,
  catatan_tindak_lanjut TEXT         NULL,
  PRIMARY KEY (id),
  KEY idx_rujukan_skrining (skrining_id),
  KEY idx_rujukan_status (status),
  CONSTRAINT fk_rujukan_skrining FOREIGN KEY (skrining_id) REFERENCES skrining (id) ON DELETE CASCADE,
  CONSTRAINT fk_rujukan_layanan FOREIGN KEY (layanan_id) REFERENCES layanan_dukungan (id) ON DELETE SET NULL,
  CONSTRAINT fk_rujukan_disetujui_oleh FOREIGN KEY (disetujui_oleh) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Admin: pengaturan, log, dan evaluasi AI (PANDUAN 8.4-8.7)
-- ============================================================

-- Satu baris per versi. Hanya satu versi aktif per kunci (ditegakkan di lib/pengaturan).
CREATE TABLE pengaturan_sistem (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  kunci       VARCHAR(100) NOT NULL,                  -- misalnya bkt.ambang_tercapai
  nilai_json  JSON         NOT NULL,
  versi       INT UNSIGNED NOT NULL,
  aktif       TINYINT(1)   NOT NULL DEFAULT 0,
  alasan      TEXT         NULL,
  diubah_oleh INT UNSIGNED NULL,
  diubah_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pengaturan_kunci_versi (kunci, versi),
  KEY idx_pengaturan_aktif (kunci, aktif),
  CONSTRAINT fk_pengaturan_user FOREIGN KEY (diubah_oleh) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hanya bisa ditambah. Tanpa data sensitif (password, PIN, isi cerita anak).
CREATE TABLE log_aktivitas (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NULL,                   -- NULL misalnya untuk gagal login email tak dikenal
  jenis_tindakan VARCHAR(50)  NOT NULL,
  entitas        VARCHAR(50)  NULL,
  entitas_id     VARCHAR(50)  NULL,
  detail_json    JSON         NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_log_aktivitas_user (user_id, created_at),
  KEY idx_log_aktivitas_jenis (jenis_tindakan, created_at),
  CONSTRAINT fk_log_aktivitas_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Setiap panggilan LLM. Untuk chatbot hanya kategori, bukan isi cerita anak.
CREATE TABLE log_ai (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fitur            ENUM('tutor','chatbot','laporan','generator_soal','impor_tp') NOT NULL,  -- impor_tp: migrasi 0002
  anak_id          INT UNSIGNED NULL,
  ringkasan_input  TEXT         NULL,
  output_json      JSON         NULL,
  valid            TINYINT(1)   NOT NULL DEFAULT 0,
  pakai_fallback   TINYINT(1)   NOT NULL DEFAULT 0,
  waktu_respons_ms INT UNSIGNED NULL,
  versi_prompt     VARCHAR(50)  NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_log_ai_fitur (fitur, created_at),
  CONSTRAINT fk_log_ai_anak FOREIGN KEY (anak_id) REFERENCES anak (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE umpan_balik_ai (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  log_ai_id  BIGINT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NULL,
  nilai      ENUM('membantu','tidak_membantu') NOT NULL,
  komentar   TEXT         NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_umpan_balik_log (log_ai_id),
  CONSTRAINT fk_umpan_balik_log FOREIGN KEY (log_ai_id) REFERENCES log_ai (id) ON DELETE CASCADE,
  CONSTRAINT fk_umpan_balik_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Materi dan narasi kartu belajar (migrasi 0001)
-- ============================================================

-- Materi per kelas untuk peta petualangan anak (4 mapel). tp_terkait = TP adaptif yang dihitung di pos itu.
CREATE TABLE materi (
  kode                  VARCHAR(30)       NOT NULL,          -- misalnya MAT-1-BIL-01
  mapel_id              INT UNSIGNED      NOT NULL,
  fase                  VARCHAR(2)        NOT NULL,
  kelas                 TINYINT UNSIGNED  NOT NULL,
  elemen                VARCHAR(100)      NOT NULL,
  judul                 VARCHAR(200)      NOT NULL,
  deskripsi             TEXT              NOT NULL,
  tp_terkait            JSON              NOT NULL,          -- daftar kode TP, boleh kosong []
  esensial_transisi     TINYINT(1)        NULL,              -- null = belum diketahui
  dasar_pembagian_kelas VARCHAR(255)      NULL,
  urutan                SMALLINT UNSIGNED NOT NULL,
  diubah_oleh           INT UNSIGNED      NULL,              -- null = dari data awal
  diubah_at             DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (kode),
  KEY idx_materi_mapel_kelas (mapel_id, kelas, urutan),
  CONSTRAINT fk_materi_mapel FOREIGN KEY (mapel_id) REFERENCES mapel (id) ON DELETE CASCADE,
  CONSTRAINT fk_materi_user FOREIGN KEY (diubah_oleh) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Narasi kartu belajar bercerita: satu per TP, berisi adegan Pijar (lihat lib/kontrak/materi.ts).
CREATE TABLE narasi_materi (
  tp_kode     VARCHAR(20)  NOT NULL,
  judul       VARCHAR(200) NOT NULL,
  adegan_json JSON         NOT NULL,
  diubah_oleh INT UNSIGNED NULL,                             -- null = dari data awal
  diubah_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tp_kode),
  CONSTRAINT fk_narasi_tp FOREIGN KEY (tp_kode) REFERENCES tujuan_pembelajaran (kode) ON DELETE CASCADE,
  CONSTRAINT fk_narasi_user FOREIGN KEY (diubah_oleh) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Migrasi skema (scripts/migrasi.mts)
-- ============================================================

-- Migrasi yang sudah dijalankan. Seed mengisinya dengan semua migrasi (skema ini sudah termasuk isinya).
CREATE TABLE riwayat_migrasi (
  nama          VARCHAR(200) NOT NULL,
  checksum      CHAR(64)     NOT NULL,                     -- sha256 isi file (baris dinormalkan ke LF)
  dijalankan_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
