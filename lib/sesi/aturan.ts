// Aturan sesi harian (PANDUAN 7.1). Semua fungsi MURNI: tanpa database, tanpa LLM.
// Angka durasi, jumlah soal, dan batas hari dikirim pemanggil dari PENGATURAN_SISTEM.
// Keputusan di sini memakai ATURAN TETAP, bukan keputusan LLM (prinsip "AI membantu, manusia memutuskan").

export type Level = "istirahat" | "ringan" | "normal" | "penuh";
export type JenisIsi = "santai" | "ulang" | "baru";
export type Energi = "lemas" | "lumayan" | "semangat";
export type CuacaHati = "cerah" | "berawan" | "hujan" | "badai";

const URUTAN_LEVEL: Level[] = ["istirahat", "ringan", "normal", "penuh"];
const LEVEL_DARI_ENERGI: Record<Energi, Level> = { lemas: "ringan", lumayan: "normal", semangat: "penuh" };
const CUACA_TURUN: CuacaHati[] = ["hujan", "badai"];

export type DataCheckin = { energi: Energi; cuaca_hati: CuacaHati; keluhan: string[] };
export type DataAnak = {
  mode_jeda: boolean;
  fase_pengobatan: "intensif" | "pemeliharaan" | "pemulihan";
  batas_layar_menit: number | null; // null = tanpa batas dari orang tua
};
export type DurasiLevel = { durasi_ringan: number; durasi_normal: number; durasi_penuh: number };

export type HasilLevel = {
  level: Level;
  jenis_isi: JenisIsi;
  durasi_menit: number;
  mode_audio: boolean;
  tawarkan_teman_cerita: boolean;
  tawarkan_beri_tahu_pendamping: boolean;
  alasan: string[]; // jejak aturan yang terpakai, untuk penjelasan ke pendamping/juri
};

function lebihRendah(a: Level, b: Level): Level {
  return URUTAN_LEVEL.indexOf(a) <= URUTAN_LEVEL.indexOf(b) ? a : b;
}

function turunkanSatu(level: Level): Level {
  return URUTAN_LEVEL[Math.max(0, URUTAN_LEVEL.indexOf(level) - 1)];
}

function durasiStandar(level: Level, durasi: DurasiLevel): number {
  if (level === "istirahat") return 0; // PANDUAN 7.1: istirahat = 0 menit
  return { ringan: durasi.durasi_ringan, normal: durasi.durasi_normal, penuh: durasi.durasi_penuh }[level];
}

// tentukanLevel (PANDUAN 7.1). Aturan yang lebih atas menang.
export function tentukanLevel(checkin: DataCheckin, anak: DataAnak, durasi: DurasiLevel): HasilLevel {
  const alasan: string[] = [];
  const hasil = (level: Level, ubah: Partial<HasilLevel> = {}): HasilLevel => ({
    level,
    jenis_isi: level === "istirahat" ? "santai" : level === "ringan" ? "ulang" : "baru",
    durasi_menit: 0,
    mode_audio: false,
    tawarkan_teman_cerita: false,
    tawarkan_beri_tahu_pendamping: false,
    alasan,
    ...ubah,
  });

  if (anak.mode_jeda) {
    alasan.push("mode jeda aktif");
    return hasil("istirahat");
  }
  if (checkin.keluhan.includes("sakit_sekali")) {
    alasan.push("keluhan sakit sekali");
    return hasil("istirahat", { tawarkan_beri_tahu_pendamping: true });
  }

  let level = LEVEL_DARI_ENERGI[checkin.energi];
  alasan.push(`energi ${checkin.energi}`);

  const modeAudio = checkin.keluhan.includes("mata_lelah");
  if (checkin.keluhan.length > 0) {
    level = lebihRendah(level, "ringan");
    alasan.push("ada keluhan: paling tinggi ringan");
  }
  if (anak.fase_pengobatan === "intensif") {
    level = turunkanSatu(level);
    alasan.push("fase intensif: turun satu tingkat");
  }

  const cuacaTurun = CUACA_TURUN.includes(checkin.cuaca_hati);
  if (cuacaTurun) {
    level = turunkanSatu(level);
    alasan.push(`cuaca hati ${checkin.cuaca_hati}: turun satu tingkat, isi diganti materi yang sudah dikuasai`);
  }

  let durasiMenit = durasiStandar(level, durasi);
  if (anak.batas_layar_menit !== null && anak.batas_layar_menit < durasiMenit) {
    durasiMenit = anak.batas_layar_menit;
    alasan.push("dibatasi batas layar dari orang tua");
  }

  // Materi baru hanya di normal/penuh, dan tidak saat cuaca hati hujan/badai.
  const jenisIsi: JenisIsi = level === "istirahat" ? "santai" : level === "ringan" || cuacaTurun ? "ulang" : "baru";

  return hasil(level, {
    jenis_isi: jenisIsi,
    durasi_menit: durasiMenit,
    mode_audio: modeAudio && level !== "istirahat",
    tawarkan_teman_cerita: cuacaTurun,
  });
}

// ---------- Pola check-in beberapa hari ----------

export type RingkasCheckin = { tanggal: string; energi: Energi; cuaca_hati: CuacaHati; keluhan: string[] };

// Berapa check-in TERAKHIR berturut-turut yang memenuhi syarat (dihitung dari yang paling baru).
export function hitungBeruntun(riwayat: RingkasCheckin[], syarat: (c: RingkasCheckin) => boolean): number {
  const urut = [...riwayat].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  let jumlah = 0;
  for (const c of urut) {
    if (!syarat(c)) break;
    jumlah++;
  }
  return jumlah;
}

// Kartu "perlu perhatian" (PANDUAN 7.1): N check-in berturut-turut lemas atau berkeluhan.
export function perluPerhatian(riwayat: RingkasCheckin[], hariPemicu: number): boolean {
  return hitungBeruntun(riwayat, (c) => c.energi === "lemas" || c.keluhan.length > 0) >= hariPemicu;
}

// Teman Cerita menyapa proaktif (PANDUAN 7.1): cuaca hati hujan/badai N hari berturut-turut.
export function cuacaTurunBeruntun(riwayat: RingkasCheckin[], hariPemicu: number): boolean {
  return hitungBeruntun(riwayat, (c) => CUACA_TURUN.includes(c.cuaca_hati)) >= hariPemicu;
}

// ---------- Cek "Masih kuat?" ----------

export type KeadaanCekKuat = {
  level: Level;
  menit_berjalan: number;
  durasi_menit: number;
  salah_beruntun: number;
  batas_salah_beruntun: number; // sesi.salah_beruntun_pemicu_cek
  sudah_cek_durasi: boolean;
  sudah_cek_tengah: boolean;
};

export type AlasanCekKuat = "durasi_tercapai" | "salah_beruntun" | "tengah_sesi_penuh";

// Kapan cek "Masih kuat?" muncul (PANDUAN 7.1). null = tidak perlu muncul sekarang.
export function evaluasiCekMasihKuat(k: KeadaanCekKuat): AlasanCekKuat | null {
  if (k.salah_beruntun >= k.batas_salah_beruntun) return "salah_beruntun";
  if (!k.sudah_cek_durasi && k.durasi_menit > 0 && k.menit_berjalan >= k.durasi_menit) return "durasi_tercapai";
  if (k.level === "penuh" && !k.sudah_cek_tengah && k.menit_berjalan >= k.durasi_menit / 2) return "tengah_sesi_penuh";
  return null;
}

export type PilihanKuat = "masih_kuat" | "agak_capek" | "istirahat" | "pusing";

export type TindakanKuat = {
  berhenti: boolean; // sesi dihentikan, progres tersimpan, TIDAK dihitung gagal
  tawarkan_selesai: boolean; // masih kuat tapi durasi sudah tercapai: tawarkan selesai dengan pujian
  tanpa_materi_baru: boolean;
  pakai_ceroboh_lelah: boolean; // sisa sesi memakai bkt.ceroboh_lelah
  kabari_pendamping: boolean; // "pusing" -> kartu di dashboard pendamping
};

export function tindakanMasihKuat(pilihan: PilihanKuat, durasiTercapai: boolean): TindakanKuat {
  const dasar: TindakanKuat = {
    berhenti: false,
    tawarkan_selesai: false,
    tanpa_materi_baru: false,
    pakai_ceroboh_lelah: false,
    kabari_pendamping: false,
  };
  switch (pilihan) {
    case "masih_kuat":
      return { ...dasar, tawarkan_selesai: durasiTercapai };
    case "agak_capek":
      return { ...dasar, tanpa_materi_baru: true, pakai_ceroboh_lelah: true };
    case "istirahat":
      return { ...dasar, berhenti: true };
    case "pusing":
      return { ...dasar, berhenti: true, kabari_pendamping: true };
  }
}

// Jumlah soal kuis per level (PANDUAN 7.1 / PRD F-SESI-3), dari PENGATURAN_SISTEM kuis.jumlah_soal_*.
export function jumlahSoalKuis(
  level: Level,
  atur: { jumlah_soal_ringan: number; jumlah_soal_normal: number; jumlah_soal_penuh: number },
): number {
  if (level === "istirahat") return 0;
  return { ringan: atur.jumlah_soal_ringan, normal: atur.jumlah_soal_normal, penuh: atur.jumlah_soal_penuh }[level];
}
