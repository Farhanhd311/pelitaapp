// Aturan sesi harian (PANDUAN 7.1). Semua fungsi di sini MURNI: tidak membaca database, tidak memanggil LLM.
// Angka ambang (durasi, jumlah hari, salah beruntun) dikirim lewat parameter `pengaturan`, yang diisi
// dari PENGATURAN_SISTEM oleh pemanggil (API route). Jadi fungsi ini mudah dites dan mudah dijelaskan.

export type Energi = "lemas" | "lumayan" | "semangat";
export type CuacaHati = "cerah" | "berawan" | "hujan" | "badai";
export type FasePengobatan = "intensif" | "pemeliharaan" | "pemulihan";
export type Level = "istirahat" | "ringan" | "normal" | "penuh";

/** Keluhan yang punya aturan khusus. Keluhan lain (misalnya "pusing") tetap dihitung "ada keluhan". */
export const KELUHAN_SAKIT_SEKALI = "sakit sekali";
export const KELUHAN_MATA_LELAH = "mata lelah";

export type Checkin = { energi: Energi; cuaca_hati: CuacaHati; keluhan: string | null };
export type ProfilAnak = { mode_jeda: boolean; fase_pengobatan: FasePengobatan; batas_layar_menit: number | null };

/** Nilai dari PENGATURAN_SISTEM yang dipakai aturan sesi (kunci aslinya di komentar). */
export type PengaturanSesi = {
  durasi: Record<Exclude<Level, "istirahat">, number>; // sesi.durasi_ringan / _normal / _penuh (menit)
  salahBeruntunPemicuCek: number; // sesi.salah_beruntun_pemicu_cek
  hariLemasPemicuPerhatian: number; // sesi.hari_lemas_pemicu_perhatian
  hariMoodTurunPemicuChatbot: number; // sesi.hari_mood_turun_pemicu_chatbot
};

/** Isi sesi: materi baru HANYA di level normal dan penuh (PANDUAN 7.1). */
export type IsiSesi = "santai" | "ulang_tercapai" | "materi_baru";

export type HasilLevel = {
  level: Level;
  durasiMenit: number;
  isi: IsiSesi;
  /** Keluhan "mata lelah": sajikan materi dalam format audio/video pendek. */
  modeAudio: boolean;
  tawarkanTemanCerita: boolean;
  tawarkanBeriTahuPendamping: boolean;
  /** Daftar aturan yang terpakai, untuk ditampilkan/dijelaskan (mis. ke juri atau di log). */
  alasan: string[];
};

const URUTAN_LEVEL: Level[] = ["istirahat", "ringan", "normal", "penuh"];
const LEVEL_DARI_ENERGI: Record<Energi, Level> = { lemas: "ringan", lumayan: "normal", semangat: "penuh" };

const lebihRendah = (a: Level, b: Level): Level => (URUTAN_LEVEL.indexOf(a) <= URUTAN_LEVEL.indexOf(b) ? a : b);

// Turun satu tingkat, tetapi tidak sampai "istirahat": istirahat hanya lewat mode jeda atau
// keluhan "sakit sekali". Dengan begitu skenario demo (lemas + hujan + mata lelah) tetap "ringan".
function turunSatuTingkat(level: Level): Level {
  const i = URUTAN_LEVEL.indexOf(level);
  return URUTAN_LEVEL[Math.max(i - 1, URUTAN_LEVEL.indexOf("ringan"))];
}

/**
 * Menentukan level sesi hari ini dari check-in dan profil anak. Aturan yang lebih atas menang:
 * 1. mode jeda → istirahat
 * 2. keluhan "sakit sekali" → istirahat (+ tawarkan memberi tahu pendamping)
 * 3. level awal dari energi: lemas → ringan, lumayan → normal, semangat → penuh
 * 4. ada keluhan → paling tinggi ringan; "mata lelah" → mode audio
 * 5. fase pengobatan intensif → turun satu tingkat
 * 6. cuaca hati hujan/badai → turun satu tingkat, isi diganti TP yang sudah dikuasai, tawarkan Teman Cerita
 * Durasi = durasi standar level, dibatasi batas layar dari orang tua.
 */
export function tentukanLevel(checkin: Checkin, anak: ProfilAnak, pengaturan: PengaturanSesi): HasilLevel {
  const istirahat = (alasan: string, beriTahu = false): HasilLevel => ({
    level: "istirahat",
    durasiMenit: 0,
    isi: "santai",
    modeAudio: false,
    tawarkanTemanCerita: false,
    tawarkanBeriTahuPendamping: beriTahu,
    alasan: [alasan],
  });

  if (anak.mode_jeda) return istirahat("Mode jeda aktif");
  if (checkin.keluhan === KELUHAN_SAKIT_SEKALI) return istirahat("Keluhan sakit sekali", true);

  const alasan: string[] = [];
  let level = LEVEL_DARI_ENERGI[checkin.energi];
  alasan.push(`Energi ${checkin.energi} → ${level}`);

  let modeAudio = false;
  if (checkin.keluhan) {
    level = lebihRendah(level, "ringan");
    alasan.push(`Ada keluhan (${checkin.keluhan}) → paling tinggi ringan`);
    if (checkin.keluhan === KELUHAN_MATA_LELAH) {
      modeAudio = true;
      alasan.push("Mata lelah → mode audio");
    }
  }

  if (anak.fase_pengobatan === "intensif") {
    level = turunSatuTingkat(level);
    alasan.push(`Fase intensif → turun satu tingkat (${level})`);
  }

  const moodTurun = checkin.cuaca_hati === "hujan" || checkin.cuaca_hati === "badai";
  if (moodTurun) {
    level = turunSatuTingkat(level);
    alasan.push(`Cuaca hati ${checkin.cuaca_hati} → turun satu tingkat (${level}), ulang materi yang sudah dikuasai`);
  }

  const durasiStandar = pengaturan.durasi[level as Exclude<Level, "istirahat">];
  const durasiMenit = anak.batas_layar_menit == null ? durasiStandar : Math.min(durasiStandar, anak.batas_layar_menit);

  // Materi baru hanya di normal/penuh, dan tidak saat hati sedang hujan/badai.
  const isi: IsiSesi = level === "ringan" || moodTurun ? "ulang_tercapai" : "materi_baru";

  return {
    level,
    durasiMenit,
    isi,
    modeAudio,
    tawarkanTemanCerita: moodTurun,
    tawarkanBeriTahuPendamping: false,
    alasan,
  };
}

/* ---------- Cek "Masih kuat?" selama sesi ---------- */

export type KeadaanSesi = {
  level: Level;
  menitBerjalan: number;
  durasiMenit: number;
  salahBeruntun: number;
  /** Sesi penuh: cek di tengah sesi cukup sekali. */
  sudahCekTengah: boolean;
};

/**
 * Kapan menampilkan cek "Masih kuat?" (aturan tetap, bukan keputusan LLM):
 * durasi level tercapai, ATAU salah beruntun mencapai ambang, ATAU di tengah sesi penuh.
 */
export function perluCekMasihKuat(sesi: KeadaanSesi, pengaturan: Pick<PengaturanSesi, "salahBeruntunPemicuCek">): boolean {
  if (sesi.menitBerjalan >= sesi.durasiMenit) return true;
  if (sesi.salahBeruntun >= pengaturan.salahBeruntunPemicuCek) return true;
  if (sesi.level === "penuh" && !sesi.sudahCekTengah && sesi.menitBerjalan >= sesi.durasiMenit / 2) return true;
  return false;
}

export type PilihanMasihKuat = "masih_kuat" | "agak_capek" | "mau_istirahat" | "pusing";

export type TindakanMasihKuat = {
  lanjut: boolean;
  /** Masih kuat tetapi durasi sudah tercapai: tawarkan selesai dengan pujian. */
  tawarkanSelesai: boolean;
  /** Agak capek: lanjut tanpa materi baru, dan kuis memakai bkt.ceroboh_lelah. */
  tanpaMateriBaru: boolean;
  pakaiCerobohLelah: boolean;
  /** Pusing: tampilkan kartu "perlu perhatian" di dashboard pendamping. */
  kartuUntukPendamping: boolean;
};

/** Tindakan sistem untuk pilihan anak. Sesi yang dihentikan di tengah TIDAK dihitung gagal. */
export function tindakanMasihKuat(pilihan: PilihanMasihKuat, durasiTercapai: boolean): TindakanMasihKuat {
  const dasar = { lanjut: true, tawarkanSelesai: false, tanpaMateriBaru: false, pakaiCerobohLelah: false, kartuUntukPendamping: false };
  switch (pilihan) {
    case "masih_kuat":
      return { ...dasar, tawarkanSelesai: durasiTercapai };
    case "agak_capek":
      return { ...dasar, tanpaMateriBaru: true, pakaiCerobohLelah: true };
    case "mau_istirahat":
      return { ...dasar, lanjut: false };
    case "pusing":
      return { ...dasar, lanjut: false, kartuUntukPendamping: true };
  }
}

/* ---------- Pola check-in beberapa hari ---------- */

/**
 * Kartu "perlu perhatian": N check-in terakhir berturut-turut berenergi lemas atau berkeluhan.
 * `riwayat` diurutkan dari yang TERBARU.
 */
export function perluPerhatian(riwayat: Checkin[], pengaturan: Pick<PengaturanSesi, "hariLemasPemicuPerhatian">): boolean {
  const n = pengaturan.hariLemasPemicuPerhatian;
  if (riwayat.length < n) return false;
  return riwayat.slice(0, n).every((c) => c.energi === "lemas" || Boolean(c.keluhan));
}

/** Teman Cerita menyapa proaktif: N check-in terakhir berturut-turut cuaca hati hujan/badai. */
export function temanCeritaMenyapa(riwayat: Checkin[], pengaturan: Pick<PengaturanSesi, "hariMoodTurunPemicuChatbot">): boolean {
  const n = pengaturan.hariMoodTurunPemicuChatbot;
  if (riwayat.length < n) return false;
  return riwayat.slice(0, n).every((c) => c.cuaca_hati === "hujan" || c.cuaca_hati === "badai");
}
