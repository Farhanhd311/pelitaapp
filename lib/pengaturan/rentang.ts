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
