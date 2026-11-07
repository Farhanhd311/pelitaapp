// Rentang aman setiap kunci PENGATURAN_SISTEM (PANDUAN 8.4) + pemeriksaan kombinasi yang tidak logis.
// Fungsi MURNI. Dipakai server sebelum menyimpan versi baru dari halaman admin "Aturan AI".

type Aturan =
  | { jenis: "angka"; min: number; maks: number; bulat?: boolean }
  | { jenis: "boolean" }
  | { jenis: "daftar_teks" } // tidak boleh kosong
  | { jenis: "aturan_level" }
  | { jenis: "kode_kebutuhan" }
  | { jenis: "angka_per_mapel"; min: number; maks: number }; // { "<mapel_id>": bilangan bulat }

// Kunci yang tidak ada di sini tidak bisa diubah lewat halaman admin (misalnya bkt.belajar_saat_asesmen,
// yang harus 0 karena tidak ada pengajaran di antara soal asesmen).
export const RENTANG_AMAN: Record<string, Aturan & { label: string }> = {
  "bkt.peluang_awal": { jenis: "angka", min: 0.1, maks: 0.9, label: "Peluang awal" },
  "bkt.tebakan": { jenis: "angka", min: 0.05, maks: 0.4, label: "Peluang menebak" },
  "bkt.ceroboh": { jenis: "angka", min: 0.01, maks: 0.3, label: "Peluang ceroboh" },
  "bkt.ceroboh_lelah": { jenis: "angka", min: 0.01, maks: 0.4, label: "Peluang ceroboh saat lelah" },
  "bkt.belajar_saat_sesi": { jenis: "angka", min: 0, maks: 0.5, label: "Peluang belajar saat sesi" },
  "bkt.ambang_tercapai": { jenis: "angka", min: 0.7, maks: 0.99, label: "Ambang tercapai (asesmen)" },
  "bkt.ambang_tercapai_sesi": { jenis: "angka", min: 0.8, maks: 0.99, label: "Ambang tercapai (sesi belajar)" },
  "bkt.ambang_belum": { jenis: "angka", min: 0.05, maks: 0.5, label: "Ambang belum" },
  "bkt.min_soal_tercapai": { jenis: "angka", min: 2, maks: 5, bulat: true, label: "Minimal soal untuk tercapai" },
  "bkt.min_soal_per_tp": { jenis: "angka", min: 1, maks: 3, bulat: true, label: "Minimal soal untuk belum" },
  "bkt.maks_soal_per_tp": { jenis: "angka", min: 3, maks: 8, bulat: true, label: "Maksimal soal per TP" },
  "asesmen.berhenti_dini": { jenis: "boolean", label: "Berhenti dini" },
  "asesmen.maks_soal_per_sesi": { jenis: "angka", min: 5, maks: 20, bulat: true, label: "Maksimal soal per sesi asesmen" },
  "asesmen.maks_soal_per_mapel": { jenis: "angka_per_mapel", min: 5, maks: 40, label: "Maksimal soal satu asesmen per mapel" },
  "sesi.durasi_ringan": { jenis: "angka", min: 3, maks: 15, bulat: true, label: "Durasi sesi ringan (menit)" },
  "sesi.durasi_normal": { jenis: "angka", min: 10, maks: 30, bulat: true, label: "Durasi sesi normal (menit)" },
  "sesi.durasi_penuh": { jenis: "angka", min: 15, maks: 45, bulat: true, label: "Durasi sesi penuh (menit)" },
  "sesi.hari_mood_turun_pemicu_chatbot": { jenis: "angka", min: 1, maks: 7, bulat: true, label: "Hari cuaca hati turun sebelum Teman Cerita menyapa" },
  "sesi.hari_lemas_pemicu_perhatian": { jenis: "angka", min: 2, maks: 7, bulat: true, label: "Hari lemas/berkeluhan sebelum kartu perlu perhatian" },
  "sesi.salah_beruntun_pemicu_cek": { jenis: "angka", min: 2, maks: 5, bulat: true, label: 'Salah beruntun sebelum cek "Masih kuat?"' },
  "kuis.gagal_sebelum_ditinjau_guru": { jenis: "angka", min: 1, maks: 5, bulat: true, label: "Kuis gagal sebelum ditinjau guru" },
  "kuis.jumlah_soal_ringan": { jenis: "angka", min: 1, maks: 2, bulat: true, label: "Jumlah soal kuis level ringan" },
  "kuis.jumlah_soal_normal": { jenis: "angka", min: 3, maks: 5, bulat: true, label: "Jumlah soal kuis level normal" },
  "kuis.jumlah_soal_penuh": { jenis: "angka", min: 5, maks: 15, bulat: true, label: "Jumlah soal kuis level penuh" },
  "krisis.daftar_kata_kunci": { jenis: "daftar_teks", label: "Daftar kata kunci krisis" },
  "rujukan.aturan_level": { jenis: "aturan_level", label: "Tabel level rujukan" },
  "rujukan.kode_kebutuhan": { jenis: "kode_kebutuhan", label: "Pilihan kebutuhan -> level rujukan" },
  "rujukan.hari_tindak_lanjut": { jenis: "angka", min: 3, maks: 14, bulat: true, label: "Hari sampai tindak lanjut rujukan" },
  "llm.batas_waktu_detik": { jenis: "angka", min: 3, maks: 20, label: "Batas waktu LLM (detik)" },
  "llm.maks_kalimat_tutor": { jenis: "angka", min: 1, maks: 5, bulat: true, label: "Maksimal kalimat AI tutor" },
  "generator_soal.maks_kata_per_kalimat": { jenis: "angka", min: 8, maks: 30, bulat: true, label: "Maksimal kata per kalimat soal AI" },
  "generator_soal.ambang_kemiripan": { jenis: "angka", min: 0.5, maks: 0.95, label: "Ambang kemiripan soal AI" },
  "sesi.ambang_kartu_belajar": { jenis: "angka", min: 0.2, maks: 0.6, label: "Peluang di bawah ini: kartu belajar dulu" },
  "demo.pakai_cadangan": { jenis: "boolean", label: "Pakai jawaban cadangan (demo)" },
};

// Penjelasan singkat setiap kunci untuk admin (halaman Aturan AI): apa artinya dan apa akibat menaikkannya.
// Teks tampilan saja; tidak dipakai untuk keputusan apa pun.
export const KETERANGAN: Record<string, string> = {
  "bkt.peluang_awal": "Keyakinan awal bahwa anak sudah menguasai TP sebelum menjawab soal apa pun.",
  "bkt.tebakan": "Peluang anak menjawab benar karena menebak. Untuk pilihan ganda 4 opsi sekitar 0,25.",
  "bkt.ceroboh": "Peluang anak menjawab keliru padahal sebenarnya paham.",
  "bkt.ceroboh_lelah": "Dipakai setelah anak memilih \"Agak capek\": kekeliruan tidak terlalu menurunkan peluang.",
  "bkt.belajar_saat_asesmen": "Harus 0: tidak ada pengajaran di antara soal asesmen. Tidak bisa diubah.",
  "bkt.belajar_saat_sesi": "Peluang anak menjadi paham setelah satu soal latihan di sesi belajar.",
  "bkt.ambang_tercapai": "Asesmen: TP dinyatakan tercapai jika peluang setidaknya sebesar ini. Lebih tinggi = lebih ketat, soal lebih banyak.",
  "bkt.ambang_tercapai_sesi": "Sesi belajar: TP lulus jika peluang setidaknya sebesar ini.",
  "bkt.ambang_belum": "Asesmen: TP dinyatakan belum jika peluang turun sampai sebesar ini.",
  "bkt.min_soal_tercapai": "Minimal soal sebelum TP boleh dinyatakan tercapai (2 soal terbukti terlalu cepat).",
  "bkt.min_soal_per_tp": "Minimal soal sebelum TP boleh dinyatakan belum.",
  "bkt.maks_soal_per_tp": "Setelah soal sebanyak ini, TP wajib diputuskan. Jangan diturunkan ke 3.",
  "asesmen.berhenti_dini": "Asesmen selesai begitu titik mulai sudah pasti, supaya anak tidak mengerjakan soal yang tidak perlu.",
  "asesmen.maks_soal_per_sesi": "Setelah soal sebanyak ini, anak diajak istirahat; asesmen dilanjutkan di sesi berikutnya.",
  "asesmen.maks_soal_per_mapel": "Batas soal satu asesmen untuk setiap mata pelajaran. Jika tercapai, asesmen mapel itu selesai.",
  "sesi.durasi_ringan": "Lama sesi level ringan (menit). Perlu divalidasi tenaga kesehatan.",
  "sesi.durasi_normal": "Lama sesi level normal (menit).",
  "sesi.durasi_penuh": "Lama sesi level penuh (menit), dengan jeda.",
  "sesi.hari_mood_turun_pemicu_chatbot": "Jika cuaca hati hujan/badai sekian hari berturut-turut, Teman Cerita menyapa lebih dulu.",
  "sesi.hari_lemas_pemicu_perhatian": "Jika lemas/berkeluhan sekian hari berturut-turut, muncul kartu \"perlu perhatian\" untuk pendamping.",
  "sesi.salah_beruntun_pemicu_cek": "Setelah kekeliruan beruntun sebanyak ini, anak ditanya \"Masih kuat?\".",
  "sesi.ambang_kartu_belajar": "TP dengan peluang di bawah ini ditampilkan kartu belajar dulu sebelum kuis.",
  "kuis.gagal_sebelum_ditinjau_guru": "Setelah kuis gagal sekian kali, TP ditandai untuk ditinjau guru (anak tidak dipaksa mengulang).",
  "kuis.jumlah_soal_ringan": "Jumlah soal santai di sesi ringan (tidak memengaruhi status TP).",
  "kuis.jumlah_soal_normal": "Jumlah soal formatif di sesi normal.",
  "kuis.jumlah_soal_penuh": "Jumlah soal di kuis lengkap sesi penuh.",
  "krisis.daftar_kata_kunci": "Kata/pola yang memicu eskalasi darurat. Hanya boleh ditambah atau direvisi, tidak boleh dikosongkan.",
  "rujukan.aturan_level": "Tabel level rujukan Teman Cerita (level 1-3) dan layanan tujuannya.",
  "rujukan.kode_kebutuhan": "Pilihan kebutuhan anak di Teman Cerita dan level rujukan yang dipicunya.",
  "rujukan.hari_tindak_lanjut": "Berapa hari setelah rujukan disetujui sebelum ditindaklanjuti.",
  "llm.batas_waktu_detik": "Jika LLM lebih lama dari ini, sistem memakai jawaban cadangan.",
  "llm.maks_kalimat_tutor": "Panjang maksimal penjelasan AI tutor untuk anak.",
  "generator_soal.maks_kata_per_kalimat": "Soal buatan AI dengan kalimat lebih panjang dari ini ditolak otomatis.",
  "generator_soal.ambang_kemiripan": "Soal buatan AI yang kemiripannya dengan soal lama di atas ini ditolak otomatis.",
  "generator_soal.interval_hari": "Soal latihan baru dibuat AI otomatis untuk semua TP setiap sekian hari.",
  "generator_soal.soal_per_tp": "Banyaknya soal baru per TP setiap kali generator berjalan.",
  "impor_tp.batas_waktu_detik": "Batas waktu AI membaca PDF kurikulum saat import TP (lebih lama dari panggilan AI biasa).",
  "impor_tp.maks_mb": "Ukuran maksimal file PDF untuk import TP (batas permintaan API 32 MB setelah dienkode).",
  "demo.pakai_cadangan": "Jika Ya, semua fitur LLM langsung memakai jawaban cadangan (untuk sinyal panggung yang buruk).",
};

function periksaJenis(aturan: Aturan, nilai: unknown): string | null {
  switch (aturan.jenis) {
    case "angka":
      if (typeof nilai !== "number" || !Number.isFinite(nilai)) return "harus berupa angka";
      if (aturan.bulat && !Number.isInteger(nilai)) return "harus bilangan bulat";
      if (nilai < aturan.min || nilai > aturan.maks) return `harus di antara ${aturan.min} dan ${aturan.maks}`;
      return null;
    case "boolean":
      return typeof nilai === "boolean" ? null : "harus true atau false";
    case "daftar_teks":
      if (!Array.isArray(nilai) || nilai.some((v) => typeof v !== "string")) return "harus daftar teks";
      return nilai.some((v) => v.trim().length > 0) ? null : "tidak boleh kosong";
    case "aturan_level":
      return Array.isArray(nilai) &&
        nilai.length > 0 &&
        nilai.every(
          (a) =>
            Number.isInteger(a?.level) &&
            typeof a?.kebutuhan === "string" &&
            typeof a?.rujukan === "string" &&
            typeof a?.butuh_persetujuan_orang_tua === "boolean",
        )
        ? null
        : "format tabel level rujukan tidak valid";
    case "angka_per_mapel":
      return nilai !== null &&
        typeof nilai === "object" &&
        !Array.isArray(nilai) &&
        Object.keys(nilai).length > 0 &&
        Object.values(nilai).every((v) => Number.isInteger(v) && v >= aturan.min && v <= aturan.maks)
        ? null
        : `harus pasangan mapel -> bilangan bulat ${aturan.min}-${aturan.maks}`;
    case "kode_kebutuhan":
      return nilai !== null &&
        typeof nilai === "object" &&
        !Array.isArray(nilai) &&
        Object.values(nilai).every((v) => Number.isInteger(v))
        ? null
        : "harus pasangan kode -> nomor level";
  }
}

// Kombinasi yang tidak logis, dicek terhadap seluruh nilai setelah perubahan.
function periksaKombinasi(n: Record<string, unknown>): string | null {
  const angka = (k: string) => n[k] as number;
  if (angka("bkt.ambang_tercapai") <= angka("bkt.ambang_belum")) return "ambang tercapai harus lebih besar dari ambang belum";
  if (angka("bkt.ceroboh_lelah") < angka("bkt.ceroboh")) return "ceroboh saat lelah tidak boleh lebih kecil dari ceroboh biasa";
  if (angka("bkt.min_soal_tercapai") > angka("bkt.maks_soal_per_tp")) return "minimal soal tercapai melebihi maksimal soal per TP";
  if (angka("bkt.min_soal_per_tp") > angka("bkt.maks_soal_per_tp")) return "minimal soal belum melebihi maksimal soal per TP";
  if (angka("sesi.durasi_ringan") > angka("sesi.durasi_normal") || angka("sesi.durasi_normal") > angka("sesi.durasi_penuh")) {
    return "durasi harus naik: ringan <= normal <= penuh";
  }
  const kode = n["rujukan.kode_kebutuhan"] as Record<string, number> | undefined;
  const level = n["rujukan.aturan_level"] as { level: number }[] | undefined;
  if (kode && level && Object.values(kode).some((l) => !level.some((a) => a.level === l))) {
    return "kode kebutuhan merujuk level yang tidak ada di tabel rujukan";
  }
  return null;
}

// null = boleh disimpan; selain itu pesan galat untuk admin.
export function validasiPengaturan(kunci: string, nilai: unknown, nilaiAktif: Record<string, unknown>): string | null {
  const aturan = RENTANG_AMAN[kunci];
  if (!aturan) return "kunci ini tidak bisa diubah lewat halaman admin";
  const galat = periksaJenis(aturan, nilai);
  if (galat) return `${aturan.label} ${galat}`;
  return periksaKombinasi({ ...nilaiAktif, [kunci]: nilai });
}
