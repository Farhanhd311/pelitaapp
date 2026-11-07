// Mesin Bayesian Knowledge Tracing (BKT) + penelusuran prasyarat (PANDUAN 7.2).
// Semua fungsi di sini MURNI: tidak membaca database dan tidak menyimpan apa pun.
// Parameter (tebakan, ceroboh, ambang, dll.) TIDAK ditulis di sini: dikirim pemanggil
// dari PENGATURAN_SISTEM, supaya bisa diatur admin.
//
// Catatan jujur untuk juri: parameter ditetapkan manual, jadi ini model probabilistik,
// belum machine learning. Kalibrasi dari data adalah roadmap.

import { cariKeturunan, cariLeluhur, kelasTerdekat, pilihTpPertama, type GrafPrasyarat } from "./graph";

// ---------- Tipe ----------

export type ParameterAsesmen = {
  peluang_awal: number; // keyakinan awal setiap TP (0,5)
  tebakan: number; // peluang benar karena menebak (0,25 untuk 4 pilihan)
  ceroboh: number; // peluang salah padahal paham (0,10)
  belajar_saat_asesmen: number; // 0: tidak ada pengajaran di antara soal asesmen
  ambang_tercapai: number; // 0,85
  ambang_belum: number; // 0,30
  min_soal_per_tp: number; // minimal soal sebelum boleh memutuskan BELUM (2)
  min_soal_tercapai: number; // minimal soal sebelum boleh memutuskan TERCAPAI (3)
  maks_soal_per_tp: number; // setelah ini TP wajib diputuskan (4)
  berhenti_dini: boolean; // selesai begitu titik mulai sudah pasti
  maks_soal_asesmen: number; // batas soal satu asesmen untuk mapel ini (Matematika 18, Bahasa Indonesia 12)
};

export type ParameterSesi = {
  tebakan: number;
  ceroboh: number; // pemanggil mengirim bkt.ceroboh_lelah jika anak memilih "Agak capek" (PANDUAN 7.1)
  belajar_saat_sesi: number; // 0,15
  ambang_tercapai_sesi: number; // 0,95
  min_soal_tercapai: number; // 3
};

export type Keputusan = "tercapai" | "belum";

export type StatusTpAsesmen = {
  status: "belum_diketahui" | Keputusan;
  sumber_status: "diuji" | "disimpulkan" | null;
  p_menguasai: number;
  jumlah_soal: number; // soal yang sudah dijawab untuk TP ini
};

// Seluruh keadaan asesmen satu mapel. Objek biasa (bisa disimpan sebagai JSON),
// dan tidak pernah diubah langsung: setiap langkah menghasilkan keadaan baru.
export type KeadaanAsesmen = {
  tp: Record<string, StatusTpAsesmen>;
  tp_sekarang: string | null; // TP yang sedang diuji; null jika selesai
  jumlah_soal: number; // total soal yang sudah dijawab
  selesai: boolean;
  titik_mulai: string | null; // TP tempat anak mulai belajar (perbatasan)
  // Kelas terakhir anak di sekolah (dipilih sebelum asesmen). TP di atas kelas ini TIDAK diuji:
  // belum diajarkan di sekolah, jadi tetap belum_diketahui (keputusan tim, revisi PANDUAN 7.2).
  kelas_batas: number;
};

// Ringkasan satu langkah, untuk layar mode demo (batang peluang).
export type LangkahAsesmen = {
  tp_kode: string;
  p_sebelum: number;
  p_sesudah: number;
  keputusan: Keputusan | null;
};

// ---------- 1. Rumus BKT ----------

// Perbarui peluang menguasai setelah satu jawaban (teorema Bayes), lalu tambahkan
// kemungkinan anak baru belajar dari soal itu.
//   benar: dari semua cara menjawab benar, berapa bagian yang berasal dari anak yang paham?
//   salah: dari semua cara menjawab salah, berapa bagian yang berasal dari anak yang paham (tapi ceroboh)?
export function perbaruiBKT(
  p: number,
  benar: boolean,
  param: { tebakan: number; ceroboh: number; belajar: number },
): number {
  const { tebakan, ceroboh, belajar } = param;
  const pSetelahJawab = benar
    ? (p * (1 - ceroboh)) / (p * (1 - ceroboh) + (1 - p) * tebakan)
    : (p * ceroboh) / (p * ceroboh + (1 - p) * (1 - tebakan));
  return pSetelahJawab + (1 - pSetelahJawab) * belajar;
}

// ---------- 2. Keputusan per TP ----------

// Sudah cukup bukti untuk memutuskan TP ini? null = lanjut beri soal lagi di TP yang sama.
export function keputusanTp(jumlahSoal: number, p: number, param: ParameterAsesmen): Keputusan | null {
  if (jumlahSoal >= param.min_soal_tercapai && p >= param.ambang_tercapai) return "tercapai";
  if (jumlahSoal >= param.min_soal_per_tp && p <= param.ambang_belum) return "belum";
  if (jumlahSoal >= param.maks_soal_per_tp) return keputusanPaksa(p);
  return null;
}

// Terpaksa memutuskan tanpa bukti cukup: 0,5 = lebih mungkin paham daripada tidak.
function keputusanPaksa(p: number): Keputusan {
  return p >= 0.5 ? "tercapai" : "belum";
}

// ---------- 3. Asesmen: mulai ----------

// `kelasTerakhir` = kelas terakhir anak di sekolah, dipilih anak/pendamping sebelum asesmen.
export function mulaiAsesmen(
  graf: GrafPrasyarat,
  kelasTerakhir: number,
  param: ParameterAsesmen,
): KeadaanAsesmen {
  const tp: Record<string, StatusTpAsesmen> = {};
  for (const kode of graf.tp.keys()) {
    tp[kode] = { status: "belum_diketahui", sumber_status: null, p_menguasai: param.peluang_awal, jumlah_soal: 0 };
  }
  return {
    tp,
    tp_sekarang: pilihTpPertama(graf, kelasTerakhir),
    jumlah_soal: 0,
    selesai: false,
    titik_mulai: null,
    kelas_batas: kelasTerdekat(graf, kelasTerakhir),
  };
}

// ---------- 4. Asesmen: setelah anak menjawab ----------

export function setelahJawab(
  keadaan: KeadaanAsesmen,
  graf: GrafPrasyarat,
  benar: boolean,
  param: ParameterAsesmen,
): { keadaan: KeadaanAsesmen; langkah: LangkahAsesmen } {
  const kode = keadaan.tp_sekarang;
  if (keadaan.selesai || kode === null) throw new Error("Asesmen sudah selesai");

  const lama = keadaan.tp[kode];
  const p = perbaruiBKT(lama.p_menguasai, benar, {
    tebakan: param.tebakan,
    ceroboh: param.ceroboh,
    belajar: param.belajar_saat_asesmen,
  });
  const jumlahSoal = lama.jumlah_soal + 1;
  const keputusan = keputusanTp(jumlahSoal, p, param);

  let baru: KeadaanAsesmen = {
    ...keadaan,
    tp: { ...keadaan.tp, [kode]: { ...lama, p_menguasai: p, jumlah_soal: jumlahSoal } },
    jumlah_soal: keadaan.jumlah_soal + 1,
  };
  // Belum cukup bukti: soal berikutnya tetap dari TP yang sama.
  if (keputusan !== null) baru = putuskan(baru, graf, kode, keputusan, param);

  // Batas soal asesmen mapel ini tercapai: putuskan TP yang sedang diuji dari peluangnya, lalu berhenti.
  // TP yang belum sempat diuji tetap belum_diketahui (dicek lagi saat belajar). Beban anak lebih penting.
  if (!baru.selesai && baru.jumlah_soal >= param.maks_soal_asesmen) {
    if (keputusan === null) baru = putuskan(baru, graf, kode, keputusanPaksa(p), param);
    if (!baru.selesai) baru = { ...baru, tp_sekarang: null, selesai: true, titik_mulai: tentukanTitikMulai(baru.tp, graf, baru.kelas_batas) };
  }

  return { keadaan: baru, langkah: { tp_kode: kode, p_sebelum: lama.p_menguasai, p_sesudah: p, keputusan } };
}

// ---------- 5. Penyimpulan lewat graf + memilih TP berikutnya ----------

function belumDites(s: StatusTpAsesmen): boolean {
  return s.jumlah_soal === 0;
}

export function putuskan(
  keadaan: KeadaanAsesmen,
  graf: GrafPrasyarat,
  kode: string,
  hasil: Keputusan,
  param: ParameterAsesmen,
): KeadaanAsesmen {
  const tp = { ...keadaan.tp };
  tp[kode] = { ...tp[kode], status: hasil, sumber_status: "diuji" };

  // Paham TP ini -> pasti paham semua prasyaratnya. Belum paham -> pasti belum paham yang membutuhkannya.
  // p_menguasai TP yang disimpulkan tidak diubah (tidak ada jawaban sebagai bukti).
  const terkait = hasil === "tercapai" ? cariLeluhur(graf, kode) : cariKeturunan(graf, kode);
  for (const k of terkait) {
    if (belumDites(tp[k])) tp[k] = { ...tp[k], status: hasil, sumber_status: "disimpulkan" };
  }

  return { ...keadaan, tp, ...pilihLangkahBerikutnya(tp, graf, param, keadaan.kelas_batas) };
}

// Perbatasan = TP berstatus BELUM dengan urutan terendah yang semua prasyarat langsungnya tercapai.
// Di situlah anak mulai belajar (untuk Raka: B3).
export function cariPerbatasan(tp: Record<string, StatusTpAsesmen>, graf: GrafPrasyarat): string | null {
  const calon = [...graf.tp.values()]
    .filter((t) => tp[t.kode].status === "belum")
    .filter((t) => graf.prasyarat.get(t.kode)!.every((pr) => tp[pr].status === "tercapai"))
    .sort((a, b) => a.urutan - b.urutan);
  return calon[0]?.kode ?? null;
}

// Jika semua TP sampai kelas terakhir sudah dikuasai (tidak ada perbatasan), anak mulai di TP pertama
// kelas berikutnya yang tidak punya prasyarat berstatus "belum", yaitu langsung masuk Kelasku.
// Prasyarat yang belum_diketahui (TP kelas bawah yang tidak perlu diuji) tidak menghalangi.
function tpPertamaDiAtasBatas(tp: Record<string, StatusTpAsesmen>, graf: GrafPrasyarat, kelasBatas: number): string | null {
  const calon = [...graf.tp.values()]
    .filter((t) => t.kelas > kelasBatas && tp[t.kode].status === "belum_diketahui")
    .filter((t) => graf.prasyarat.get(t.kode)!.every((pr) => tp[pr].status !== "belum"))
    .sort((a, b) => a.urutan - b.urutan);
  return calon[0]?.kode ?? null;
}

// Titik mulai saat asesmen selesai: perbatasan; jika tidak ada (asesmen terhenti batas soal sebelum
// perbatasan pasti), TP "belum" dengan urutan terendah; jika semua dikuasai, TP pertama kelas berikutnya.
function tentukanTitikMulai(tp: Record<string, StatusTpAsesmen>, graf: GrafPrasyarat, kelasBatas: number): string | null {
  const belumTerendah = [...graf.tp.values()]
    .filter((t) => tp[t.kode].status === "belum")
    .sort((a, b) => a.urutan - b.urutan)[0]?.kode;
  return cariPerbatasan(tp, graf) ?? belumTerendah ?? tpPertamaDiAtasBatas(tp, graf, kelasBatas);
}

// TP kelas di bawah kelas pilihan hanya perlu diuji jika menjadi prasyarat (langsung/tidak langsung)
// TP yang DIUJI dan ternyata belum: untuk mencari dari mana anak harus mulai (Pos Dasar).
// Selebihnya tidak diuji dan tetap belum_diketahui -> pos opsional di Pos Dasar (PANDUAN 7.3).
function prasyaratYangPerluDicek(tp: Record<string, StatusTpAsesmen>, graf: GrafPrasyarat): Set<string> {
  const hasil = new Set<string>();
  for (const [kode, s] of Object.entries(tp)) {
    if (s.status === "belum" && s.sumber_status === "diuji") for (const k of cariLeluhur(graf, kode)) hasil.add(k);
  }
  return hasil;
}

function pilihLangkahBerikutnya(
  tp: Record<string, StatusTpAsesmen>,
  graf: GrafPrasyarat,
  param: ParameterAsesmen,
  kelasBatas: number,
): Pick<KeadaanAsesmen, "tp_sekarang" | "selesai" | "titik_mulai"> {
  const semuaTp = [...graf.tp.values()];
  const perbatasan = cariPerbatasan(tp, graf);
  const selesai = { tp_sekarang: null, selesai: true, titik_mulai: tentukanTitikMulai(tp, graf, kelasBatas) };

  // Berhenti dini: semua TP di bawah perbatasan sudah diketahui -> titik mulai sudah pasti.
  // TP di atas perbatasan dibiarkan belum_diketahui (untuk Raka: B6).
  if (param.berhenti_dini && perbatasan !== null) {
    const urutanPerbatasan = graf.tp.get(perbatasan)!.urutan;
    const semuaDiketahui = semuaTp
      .filter((t) => t.urutan < urutanPerbatasan)
      .every((t) => tp[t.kode].status !== "belum_diketahui");
    if (semuaDiketahui) return selesai;
  }

  // Kandidat = TP yang belum dites dan belum disimpulkan:
  //   - TP di kelas terakhir anak di sekolah (kelas pilihan), dan
  //   - TP kelas di bawahnya HANYA jika prasyarat TP yang ternyata belum dikuasai (keputusan tim).
  // TP kelas di atas kelas pilihan belum diajarkan di sekolah, jadi tidak diuji (tetap belum_diketahui).
  const perluDicek = prasyaratYangPerluDicek(tp, graf);
  let kandidat = semuaTp.filter(
    (t) =>
      (t.kelas === kelasBatas || (t.kelas < kelasBatas && perluDicek.has(t.kode))) &&
      tp[t.kode].status === "belum_diketahui" &&
      belumDites(tp[t.kode]),
  );

  // Berhenti dini: TP di atas TP "belum" terendah tidak perlu dites (anak toh belum sampai di sana).
  if (param.berhenti_dini) {
    const urutanBelum = semuaTp.filter((t) => tp[t.kode].status === "belum").map((t) => t.urutan);
    if (urutanBelum.length > 0) {
      const batas = Math.min(...urutanBelum);
      kandidat = kandidat.filter((t) => t.urutan < batas);
    }
  }

  if (kandidat.length === 0) return selesai;

  // Uji TP di tengah rantai yang tersisa (seperti main tebak angka): apa pun jawabannya,
  // sebanyak mungkin kandidat lain ikut tersimpulkan.
  const kodeKandidat = new Set(kandidat.map((t) => t.kode));
  const hitungDiKandidat = (s: Set<string>) => [...s].filter((k) => kodeKandidat.has(k)).length;

  const dinilai = kandidat.map((t) => {
    const leluhur = hitungDiKandidat(cariLeluhur(graf, t.kode));
    const keturunan = hitungDiKandidat(cariKeturunan(graf, t.kode));
    return { t, skor: Math.min(leluhur, keturunan), selisih: Math.abs(leluhur - keturunan) };
  });
  dinilai.sort(
    (a, b) =>
      b.skor - a.skor || // skor terbesar
      a.selisih - b.selisih || // seri: paling seimbang
      b.t.urutan - a.t.urutan, // masih seri: urutan terbesar
  );

  return { tp_sekarang: dinilai[0].t.kode, selesai: false, titik_mulai: null };
}

// ---------- 6. Putar ulang dari jawaban tersimpan ----------

export type JawabanTersimpan = {
  soal_id: string;
  tp_kode: string;
  benar: boolean;
  waktu: Date; // waktu mulai sesi tempat jawaban ini diberikan
};

export type PutaranAsesmen<P extends ParameterAsesmen> = {
  keadaan: KeadaanAsesmen;
  param: P; // parameter yang berlaku sejak putaran ini dimulai
  mulai_pada: Date;
  soal_dipakai: string[]; // soal yang sudah keluar di putaran ini (tidak diulang)
};

// Keadaan asesmen TIDAK disimpan terpisah: dihitung ulang dari jawaban di tabel JAWABAN dengan mesin
// yang sama. Jadi keadaan selalu konsisten dengan mesin yang dites, dan asesmen bisa dilanjutkan
// di sesi berikutnya. Begitu satu putaran selesai, jawaban berikutnya memulai putaran (asesmen) baru.
// `paramPada` memberi parameter yang berlaku pada waktu putaran dimulai (pengaturan berversi, PANDUAN 8.4).
// Kelas terakhir yang dipilih anak tidak perlu disimpan: TP pertama setiap putaran selalu berada di kelas itu,
// jadi kelasnya dibaca dari jawaban pertama putaran.
// Mengembalikan putaran terakhir, atau null jika belum ada jawaban.
export function putarUlangAsesmen<P extends ParameterAsesmen>(
  graf: GrafPrasyarat,
  jawaban: JawabanTersimpan[],
  paramPada: (waktu: Date) => P,
): PutaranAsesmen<P> | null {
  let putaran: PutaranAsesmen<P> | null = null;

  for (const j of jawaban) {
    if (putaran === null || putaran.keadaan.selesai) {
      const kelasTerakhir = graf.tp.get(j.tp_kode)?.kelas;
      if (kelasTerakhir === undefined) throw new Error(`Jawaban tersimpan merujuk TP yang tidak ada: ${j.tp_kode}`);
      const param = paramPada(j.waktu);
      putaran = { keadaan: mulaiAsesmen(graf, kelasTerakhir, param), param, mulai_pada: j.waktu, soal_dipakai: [] };
    }
    if (putaran.keadaan.tp_sekarang !== j.tp_kode) {
      throw new Error(
        `Jawaban tersimpan (${j.soal_id}) tidak cocok dengan urutan mesin BKT (seharusnya TP ${putaran.keadaan.tp_sekarang})`,
      );
    }
    putaran.keadaan = setelahJawab(putaran.keadaan, graf, j.benar, putaran.param).keadaan;
    putaran.soal_dipakai.push(j.soal_id);
  }
  return putaran;
}

// ---------- 7. Kuis formatif di sesi belajar ----------

// Satu jawaban kuis formatif setelah anak belajar. Berbeda dari asesmen: memakai unsur belajar
// (belajar_saat_sesi) dan ambang yang lebih tinggi (ambang_tercapai_sesi).
export function jawabFormatif(
  p: number,
  jumlahSoal: number,
  benar: boolean,
  param: ParameterSesi,
): { p_menguasai: number; jumlah_soal: number; tercapai: boolean } {
  const pBaru = perbaruiBKT(p, benar, {
    tebakan: param.tebakan,
    ceroboh: param.ceroboh,
    belajar: param.belajar_saat_sesi,
  });
  const jumlah = jumlahSoal + 1;
  return {
    p_menguasai: pBaru,
    jumlah_soal: jumlah,
    tercapai: jumlah >= param.min_soal_tercapai && pBaru >= param.ambang_tercapai_sesi,
  };
}
