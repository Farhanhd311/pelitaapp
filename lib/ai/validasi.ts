// Pemeriksaan keluaran LLM setelah lolos skema Zod (fungsi MURNI, dites).
// Jika gagal, pemanggil memakai jawaban cadangan (tutor/laporan) atau menolak draf (generator soal).

import { normalisasiTeks } from "@/lib/krisis/detektor";
import { KATA_DIHINDARI } from "./prompts";
import type { KeluaranLaporan, KeluaranSoal, KeluaranTutor } from "./schemas";

export function hitungKalimat(teks: string): number {
  return teks
    .split(/[.!?]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0).length;
}

// Dicek per kata utuh, supaya "matematika" tidak dianggap memuat kata lain di dalamnya.
export function kataDihindariDalam(teks: string): string[] {
  const kata = ` ${normalisasiTeks(teks)} `;
  return KATA_DIHINDARI.filter((k) => kata.includes(` ${normalisasiTeks(k)} `));
}

function adaKataSalah(teks: string): boolean {
  return ` ${normalisasiTeks(teks)} `.includes(" salah ");
}

export function periksaTutor(k: KeluaranTutor, maksKalimat: number): string | null {
  if (!k.penjelasan.trim() || !k.petunjuk.trim()) return "penjelasan atau petunjuk kosong";
  if (hitungKalimat(k.penjelasan) > maksKalimat) return `penjelasan lebih dari ${maksKalimat} kalimat`;
  const semua = `${k.penjelasan} ${k.petunjuk}`;
  const dihindari = kataDihindariDalam(semua);
  if (dihindari.length > 0) return `memakai kata yang dihindari: ${dihindari.join(", ")}`;
  if (adaKataSalah(semua)) return "memakai kata 'salah'";
  return null;
}

export function periksaLaporan(k: KeluaranLaporan, kodeTp: string[]): string | null {
  const dihasilkan = new Set(k.capaian.map((c) => c.tp_kode));
  const kurang = kodeTp.filter((kode) => !dihasilkan.has(kode));
  if (kurang.length > 0) return `deskripsi TP tidak lengkap: ${kurang.join(", ")}`;
  const lebih = [...dihasilkan].filter((kode) => !kodeTp.includes(kode));
  if (lebih.length > 0) return `ada TP yang tidak diminta: ${lebih.join(", ")}`;
  if (k.capaian.some((c) => !c.deskripsi.trim())) return "ada deskripsi kosong";
  return null;
}

// ---------- Generator soal ----------

// Hitung kunci untuk soal hitungan langsung, misalnya "6 × 7 = ...", "24 : 6 = ?".
// null jika soal bukan hitungan langsung (soal cerita dicek manusia saat tinjauan).
export function hitungKunciSoal(pertanyaan: string): number | null {
  const cocok = pertanyaan.match(/(\d+)\s*([+\-−×x*:÷/])\s*(\d+)\s*=\s*(\.{2,}|…|\?)/);
  if (!cocok) return null;
  const a = Number(cocok[1]);
  const b = Number(cocok[3]);
  switch (cocok[2]) {
    case "+":
      return a + b;
    case "-":
    case "−":
      return a - b;
    case "×":
    case "x":
    case "*":
      return a * b;
    default:
      return b === 0 ? null : a / b;
  }
}

// Kemiripan dua teks: irisan kata dibagi gabungan kata (Jaccard), 0 = beda total, 1 = sama.
export function kemiripan(a: string, b: string): number {
  const ka = new Set(normalisasiTeks(a).split(" ").filter(Boolean));
  const kb = new Set(normalisasiTeks(b).split(" ").filter(Boolean));
  if (ka.size === 0 && kb.size === 0) return 1;
  const irisan = [...ka].filter((k) => kb.has(k)).length;
  return irisan / new Set([...ka, ...kb]).size;
}

export type HasilPeriksaSoal = {
  galat: string[]; // kosong = lolos validasi otomatis
  kunci_dicek_program: boolean; // true jika kunci soal hitungan dicek ulang dengan perhitungan program
};

export function periksaSoalAI(
  soal: KeluaranSoal,
  atur: { soal_ada: string[]; maks_kata_per_kalimat: number; ambang_kemiripan: number },
): HasilPeriksaSoal {
  const galat: string[] = [];
  const { pilihan } = soal;

  if (pilihan.length !== 4) galat.push(`harus tepat 4 pilihan (ada ${pilihan.length})`);
  const benar = pilihan.filter((p) => p.benar);
  if (benar.length !== 1) galat.push(`harus tepat 1 kunci (ada ${benar.length})`);
  const teks = pilihan.map((p) => normalisasiTeks(p.teks));
  if (new Set(teks).size !== teks.length) galat.push("ada pilihan yang sama");
  if (pilihan.some((p) => !p.benar && !p.miskonsepsi?.trim())) galat.push("ada pengecoh tanpa miskonsepsi");
  if (!soal.pembahasan.trim()) galat.push("pembahasan kosong");

  // Kunci dari LLM tidak dipercaya begitu saja: soal hitungan dihitung ulang oleh program.
  let kunciDicek = false;
  const hasilHitung = hitungKunciSoal(soal.pertanyaan);
  if (hasilHitung !== null && benar.length === 1) {
    kunciDicek = true;
    const angkaKunci = Number(benar[0].teks.replace(/[^\d.,-]/g, "").replace(",", "."));
    if (angkaKunci !== hasilHitung) galat.push(`kunci tidak cocok dengan perhitungan program (${hasilHitung})`);
  }

  const kalimatPanjang = soal.pertanyaan
    .split(/[.!?]+/)
    .some((k) => k.trim().split(/\s+/).filter(Boolean).length > atur.maks_kata_per_kalimat);
  if (kalimatPanjang) galat.push(`ada kalimat lebih dari ${atur.maks_kata_per_kalimat} kata`);

  const semuaTeks = [soal.pertanyaan, soal.pembahasan, ...pilihan.map((p) => p.teks)].join(" ");
  const dihindari = kataDihindariDalam(semuaTeks);
  if (dihindari.length > 0) galat.push(`memakai kata yang dihindari: ${dihindari.join(", ")}`);

  const mirip = atur.soal_ada.find((lain) => kemiripan(lain, soal.pertanyaan) >= atur.ambang_kemiripan);
  if (mirip !== undefined) galat.push("terlalu mirip dengan soal yang sudah ada");

  return { galat, kunci_dicek_program: kunciDicek };
}
