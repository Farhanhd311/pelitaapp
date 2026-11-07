-- Migrasi 0003: asal sekolah anak (diisi di halaman pendaftaran; disetujui tim 2026-11-08).
-- Opsional (NULL). Dipakai untuk laporan ke sekolah asal.
-- Aman diulang: hanya ditambah jika kolomnya belum ada.
SET @ada := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'anak' AND COLUMN_NAME = 'asal_sekolah');
SET @sql := IF(@ada = 0, 'ALTER TABLE anak ADD COLUMN asal_sekolah VARCHAR(150) NULL AFTER tgl_berhenti_sekolah', 'SELECT 1');
PREPARE langkah FROM @sql;
EXECUTE langkah;
DEALLOCATE PREPARE langkah;
