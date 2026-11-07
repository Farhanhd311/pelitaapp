-- Migrasi 0002: fitur AI baru "impor_tp" (admin mengimpor TP dari PDF; AI menyusun daftar TP).
-- Setiap panggilan LLM wajib tercatat di LOG_AI (PANDUAN 8), jadi kolom fitur perlu nilai ENUM baru.
-- Aman diulang: MODIFY ke definisi yang sama tidak mengubah apa pun.
ALTER TABLE log_ai MODIFY fitur ENUM('tutor','chatbot','laporan','generator_soal','impor_tp') NOT NULL;
