// Jawaban cadangan (PANDUAN 8: "selalu ada cadangan"). Dipakai jika LLM timeout, gagal validasi,
// menolak, API key kosong, atau sakelar demo.pakai_cadangan menyala (sinyal panggung buruk).
// Cadangan tidak memanggil jaringan sama sekali, jadi demo tetap jalan tanpa internet.

import type { KeluaranLaporan, KeluaranSoal, KeluaranTutor } from "./schemas";

// ---------- AI tutor ----------

// Jawaban cadangan terbaik yang disiapkan untuk soal demo (PANDUAN 14: B3-D3, Raka menjawab 13).
const TUTOR_TERSIMPAN: Record<string, Record<string, KeluaranTutor>> = {
  "B3-D3": {
    "13": {
      penjelasan:
        "Kamu menjumlahkan 6 dan 7, padahal tanda × artinya mengalikan. 6 × 7 berarti ada 6 kelompok, dan setiap kelompok berisi 7.",
      petunjuk: "Yuk, coba hitung 7 + 7 + 7 + 7 + 7 + 7 pelan-pelan!",
    },
  },
};

// Urutan cadangan tutor: jawaban tersimpan untuk soal+pilihan ini -> pembahasan dari bank soal.
export function cadanganTutor(m: { soal_id: string; jawaban_anak: string; pembahasan: string | null }): KeluaranTutor {
  const tersimpan = TUTOR_TERSIMPAN[m.soal_id]?.[m.jawaban_anak.trim()];
  if (tersimpan) return tersimpan;
  return {
    penjelasan: m.pembahasan ?? "Yuk, coba lihat lagi soalnya pelan-pelan.",
    petunjuk: "Baca soalnya sekali lagi, lalu coba pilih jawaban yang menurutmu tepat.",
  };
}

// ---------- Draf laporan ----------

// Cadangan laporan disusun dari templat per status, jadi selalu lengkap untuk semua TP.
export function cadanganLaporan(m: {
  mapel: string;
  tp: { tp_kode: string; deskripsi: string; status: string }[];
}): KeluaranLaporan {
  const huruf = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  const capaian = m.tp.map((t) => {
    const isi = huruf(t.deskripsi);
    const deskripsi =
      t.status === "tercapai"
        ? `Ananda sudah mampu ${isi}.`
        : t.status === "jembatan"
          ? `Ananda sedang berlatih ${isi} dan menunjukkan kemajuan.`
          : t.status === "belum"
            ? `Ananda perlu bimbingan untuk ${isi}.`
            : `Capaian Ananda untuk ${isi} belum dinilai.`;
    return { tp_kode: t.tp_kode, deskripsi };
  });
  const tercapai = m.tp.filter((t) => t.status === "tercapai").length;
  return {
    pengantar: `Berikut capaian belajar ${m.mapel} Ananda selama belajar dari rumah. Ananda sudah menguasai ${tercapai} dari ${m.tp.length} tujuan pembelajaran yang dinilai.`,
    capaian,
    saran: "Lanjutkan dari tujuan pembelajaran yang masih perlu bimbingan, dengan benda konkret dan jeda istirahat yang cukup.",
  };
}

// ---------- Generator soal ----------

// Satu variasi tersimpan per TP demo, supaya alur "Buat variasi soal dengan AI" tetap bisa didemokan offline.
// Tetap masuk antrean tinjauan berstatus draf seperti soal AI lainnya.
const SOAL_TERSIMPAN: Record<string, KeluaranSoal> = {
  B3: {
    pertanyaan: "7 × 8 = ...",
    visual: null,
    pilihan: [
      { teks: "15", benar: false, miskonsepsi: "Menjumlahkan, bukan mengalikan" },
      { teks: "56", benar: true, miskonsepsi: null },
      { teks: "49", benar: false, miskonsepsi: "Kurang satu kelompok (7 × 7)" },
      { teks: "63", benar: false, miskonsepsi: "Lebih satu kelompok (7 × 9)" },
    ],
    pembahasan: "7 × 8 artinya 7 kelompok berisi 8. Bisa dihitung dari 7 × 10 = 70, dikurangi 7 × 2 = 14: 70 − 14 = 56.",
  },
};

export function cadanganSoal(tpKode: string): KeluaranSoal | null {
  return SOAL_TERSIMPAN[tpKode] ?? null;
}
