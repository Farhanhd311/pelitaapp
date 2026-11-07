-- Migrasi 0001: materi per kelas + narasi kartu belajar disimpan di database (disetujui tim, 2026-11-08).
-- Sebelumnya dibaca langsung dari data/data_materi_per_kelas_SD.json dan data/narasi_materi_*.json.
-- Isi awalnya dimasukkan oleh Reset demo / seed (lib/db/kurikulum-awal.ts), hanya menambah yang belum ada.
-- IF NOT EXISTS: aman untuk database yang dibuat dari schema.sql terbaru.

-- Materi per kelas untuk peta petualangan anak (4 mapel). tp_terkait = TP adaptif yang dihitung di pos itu.
CREATE TABLE IF NOT EXISTS materi (
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
CREATE TABLE IF NOT EXISTS narasi_materi (
  tp_kode     VARCHAR(20)  NOT NULL,
  judul       VARCHAR(200) NOT NULL,
  adegan_json JSON         NOT NULL,
  diubah_oleh INT UNSIGNED NULL,                             -- null = dari data awal
  diubah_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tp_kode),
  CONSTRAINT fk_narasi_tp FOREIGN KEY (tp_kode) REFERENCES tujuan_pembelajaran (kode) ON DELETE CASCADE,
  CONSTRAINT fk_narasi_user FOREIGN KEY (diubah_oleh) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
