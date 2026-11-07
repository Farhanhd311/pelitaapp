// Perhitungan metrik halaman Evaluasi AI (PANDUAN 8.6). Fungsi MURNI: menerima baris data, mengembalikan angka.
// Tidak pernah menerima atau menampilkan isi percakapan anak, hanya hitungan dan kategori.

import hasilUji from "@/data/hasil_uji_asesmen.json";

// Persen dibulatkan satu desimal; null jika belum ada data (lebih jujur daripada 0%).
export function persen(bagian: number, total: number): number | null {
  return total > 0 ? Math.round((bagian / total) * 1000) / 10 : null;
}

export type BarisLogAI = { fitur: string; valid: boolean; pakai_fallback: boolean; waktu_respons_ms: number | null };

// Keandalan teknis per fitur: jumlah panggilan, rata-rata waktu respons, % gagal (tidak valid), % memakai cadangan.
export function hitungMetrikLogAI(baris: BarisLogAI[]) {
  const fitur = [...new Set(baris.map((b) => b.fitur))].sort();
  return fitur.map((f) => {
    const milik = baris.filter((b) => b.fitur === f);
    const waktu = milik.map((b) => b.waktu_respons_ms).filter((w): w is number => w !== null);
    return {
      fitur: f,
      jumlah_panggilan: milik.length,
      rata_waktu_ms: waktu.length ? Math.round(waktu.reduce((a, b) => a + b, 0) / waktu.length) : null,
      persen_gagal: persen(milik.filter((b) => !b.valid).length, milik.length),
      persen_cadangan: persen(milik.filter((b) => b.pakai_fallback).length, milik.length),
    };
  });
}

// Draf laporan: dari catatan unduhan (LOG_AKTIVITAS detail: diubah, besar_suntingan).
export function hitungMetrikLaporan(jumlahDraf: number, unduhan: { diubah: boolean; besar_suntingan: number }[]) {
  const total = unduhan.length;
  return {
    jumlah_draf: jumlahDraf,
    jumlah_dikirim: total,
    persen_tanpa_diubah: persen(unduhan.filter((u) => !u.diubah).length, total),
    rata_suntingan: total ? Math.round(unduhan.reduce((a, u) => a + u.besar_suntingan, 0) / total) : null,
  };
}

// Alasan penolakan terbanyak (untuk memperbaiki prompt generator soal).
export function kelompokkanAlasan(alasan: string[]): { alasan: string; jumlah: number }[] {
  const hitung = new Map<string, number>();
  for (const a of alasan) hitung.set(a, (hitung.get(a) ?? 0) + 1);
  return [...hitung].map(([a, jumlah]) => ({ alasan: a, jumlah })).sort((x, y) => y.jumlah - x.jumlah);
}

// Hasil uji siswa virtual (data/hasil_uji_asesmen.json). WAJIB berlabel "hasil simulasi" di halaman (PANDUAN 8.6).
export function ambilDataSimulasi() {
  return { label: "Hasil simulasi siswa virtual (bukan data anak sungguhan)", data: hasilUji };
}
