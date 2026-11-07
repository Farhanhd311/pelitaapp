"use client";

// Isi layar asesmen (di dalam LayarFokus): pembuka, penanda bagian, pindah bagian, akhir sesi, kilasan "Oke, lanjut!",
// dan dialog berhenti. Gaya sama dengan check-in dan sesi belajar (komponen fokus/TombolAnak). Bingkai positif,
// tanpa nilai/peringkat.

import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Check, CheckCircle2, Heart } from "lucide-react";
import { cn } from "cn";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { TautanAnak, TombolAnak } from "@/components/anak/fokus/TombolAnak";

// ---------- Penanda bagian: satu petualangan, beberapa mapel ("1 Matematika — 2 Bahasa Indonesia") ----------

export type BagianPetualangan = { mapel_id: number; nama: string; selesai: boolean };

// Selalu terlihat selama petualangan, supaya anak tahu masih ada bagian berikutnya setelah satu mapel.
// Hanya satu mapel: tidak ditampilkan.
export function LangkahMapel({ bagian, sekarang }: { bagian: BagianPetualangan[]; sekarang: number | null }) {
  if (bagian.length < 2) return null;
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Bagian petualangan">
      {bagian.map((b, i) => {
        const aktif = b.mapel_id === sekarang;
        return (
          <li key={b.mapel_id} className="flex items-center gap-2">
            {i > 0 && <span className="h-0.5 w-5 rounded-full bg-garis" aria-hidden />}
            <span
              aria-current={aktif ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-sm font-extrabold transition-colors",
                aktif ? "bg-emas text-teks" : b.selesai ? "bg-pasir text-teks" : "border border-garis bg-white/80 text-teks-2",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  aktif ? "bg-bata text-white" : b.selesai ? "bg-emas text-teks" : "bg-pasir text-teks-2",
                )}
              >
                {b.selesai && !aktif ? <Check className="size-3.5" strokeWidth={3} aria-label="selesai" /> : i + 1}
              </span>
              {b.nama}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Pindah bagian: satu mapel tuntas, mapel berikutnya langsung menyusul (tanpa tombol) ----------

// Sengaja BUKAN layar "selesai": anak langsung diantar ke bagian berikutnya dalam petualangan yang sama.
export function LayarPindahMapel({ bagian, sekarang }: { bagian: BagianPetualangan[]; sekarang: number | null }) {
  const berikut = bagian.find((b) => b.mapel_id === sekarang);
  const sisa = bagian.filter((b) => !b.selesai).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center"
      role="status"
    >
      <MascotPijar ekspresi="semangat" gerak="senang" ukuran={160} />
      <h1 className="mt-3 text-[28px] leading-tight font-extrabold text-balance">Sekarang bagian {berikut?.nama ?? "berikutnya"}!</h1>
      <p className="mt-2 text-[16px] leading-relaxed text-teks-2">
        Petualanganmu belum selesai, {sisa > 1 ? `tinggal ${sisa} bagian lagi` : "tinggal satu bagian lagi"}. Kamu hebat!
      </p>
      <div className="mt-5">
        <LangkahMapel bagian={bagian} sekarang={sekarang} />
      </div>
    </motion.div>
  );
}

// ---------- Pembuka "Petualangan Pertama" ----------

const CARA_MENJAWAB = [
  // Tanpa pembaca suara (keputusan tim): anak yang belum lancar membaca dibantu pendamping.
  { ikon: BookOpen, judul: "Baca pelan-pelan", isi: "Belum lancar membaca? Minta pendampingmu membacakan soalnya." },
  { ikon: CheckCircle2, judul: "Pilih satu jawaban", isi: "Pilih yang menurutmu tepat, lalu kirim." },
  { ikon: Heart, judul: "Boleh ambil jeda", isi: "Tidak perlu buru-buru. Istirahat kapan pun kamu butuh." },
];

export function LayarPembuka({
  namaAnak,
  bagian,
  sibuk,
  pilihanKelas,
  kelas,
  onPilihKelas,
  melanjutkan,
  onMulai,
  onMulaiDemo,
}: {
  namaAnak: string | null;
  bagian: BagianPetualangan[]; // mapel dalam petualangan ini, urut dikerjakan
  sibuk: boolean;
  pilihanKelas: number[]; // kelas yang punya TP di peta (dari data, bukan angka di kode)
  kelas: number | null; // kelas terakhir di sekolah yang dipilih anak
  onPilihKelas: (kelas: number) => void;
  melanjutkan: boolean; // asesmen sebelumnya belum selesai -> lanjutkan, tanpa tanya kelas lagi
  onMulai: () => void;
  onMulaiDemo: () => void;
}) {
  const judul = melanjutkan ? "Yuk, lanjutkan petualanganmu!" : "Yuk, temukan titik mulai belajarmu!";
  // Sebutkan semua bagian di awal, supaya anak tahu petualangannya baru selesai setelah bagian terakhir.
  const daftarBagian = bagian.filter((b) => !b.selesai).map((b) => b.nama);
  const tentangBagian = daftarBagian.length > 1 ? ` Ada ${daftarBagian.length} bagian: ${daftarBagian.join(" lalu ")}.` : "";
  const isi = `Hai${namaAnak ? `, ${namaAnak}` : ""}! Pijar akan memberi beberapa soal yang menyesuaikan jawabanmu.${tentangBagian} Jawab sendiri, ya. Keliru juga bagian dari belajar.`;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-6 text-center">
      <MascotPijar ekspresi="sambut" gerak="idle" ukuran={150} />
      <p className="mt-3 rounded-full bg-emas px-4 py-1.5 text-sm font-extrabold">Petualangan Pertama</p>
      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-[28px] leading-tight font-extrabold text-balance sm:text-[32px]">{judul}</h1>
      </div>
      <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-teks-2">{isi}</p>
      <div className="mt-4">
        <LangkahMapel bagian={bagian} sekarang={null} />
      </div>

      <ul className="mt-7 grid w-full gap-3 text-left sm:grid-cols-3">
        {CARA_MENJAWAB.map(({ ikon: Ikon, judul: j, isi: k }, i) => (
          <li key={j} className="rounded-[20px] border-2 border-jingga/35 bg-white/85 p-4">
            <p className="flex items-center gap-2 font-heading text-[17px] font-extrabold">
              <span className="flex size-8 items-center justify-center rounded-full bg-emas text-sm">{i + 1}</span>
              <Ikon className="size-5 text-bata" aria-hidden /> {j}
            </p>
            <p className="mt-1.5 text-[15px] text-teks-2">{k}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 max-w-xl rounded-[20px] bg-pasir px-4 py-3 text-[15px]">
        <b>Untuk pendamping:</b> bacakan soal jika anak belum lancar membaca, tanpa memberi petunjuk jawaban.
      </p>

      {/* Asesmen mulai dari TP di kelas terakhir anak di sekolah dan tidak menguji di atasnya (PANDUAN 7.2). */}
      {!melanjutkan && (
        <PilihKelas pilihanKelas={pilihanKelas} kelas={kelas} onPilih={onPilihKelas} />
      )}

      <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <TautanAnak varian="kedua" href="/anak">
          Nanti saja
        </TautanAnak>
        <TombolAnak onClick={onMulai} disabled={sibuk || (!melanjutkan && kelas === null)} className="sm:min-w-60">
          {sibuk ? "Menyiapkan…" : melanjutkan ? "Lanjut petualangan" : "Aku siap, mulai!"}
        </TombolAnak>
      </div>
      {/* Mode demo panggung (PANDUAN 14): jawaban Raka diputar server, mesin BKT sungguhan. */}
      <TombolAnak varian="lembut" onClick={onMulaiDemo} disabled={sibuk || (!melanjutkan && kelas === null)} className="mt-3 text-[15px]">
        Putar otomatis (demo)
      </TombolAnak>
    </div>
  );
}

function PilihKelas({ pilihanKelas, kelas, onPilih }: { pilihanKelas: number[]; kelas: number | null; onPilih: (k: number) => void }) {
  const tanya = "Kamu terakhir sekolah di kelas berapa?";
  return (
    <section className="mt-7 w-full rounded-[24px] border-2 border-jingga/35 bg-pasir-muda/70 p-5">
      <div className="flex items-center justify-center gap-3">
        <h2 id="tanya-kelas" className="font-heading text-[20px] font-extrabold">
          {tanya}
        </h2>
      </div>
      <p className="mt-1 text-[15px] text-teks-2">Pijar mulai dari soal kelas itu. Tidak apa-apa kalau ada yang lupa.</p>
      <div role="radiogroup" aria-labelledby="tanya-kelas" className="mt-4 flex flex-wrap justify-center gap-3">
        {pilihanKelas.map((k) => {
          const dipilih = k === kelas;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={dipilih}
              onClick={() => onPilih(k)}
              className={
                "min-h-14 min-w-28 cursor-pointer rounded-full border-2 px-6 font-heading text-[18px] font-extrabold transition focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none active:scale-95 " +
                (dipilih ? "border-bata bg-emas text-teks shadow-[0_4px_0_var(--color-bata-tua)]" : "border-jingga/50 bg-white text-teks hover:bg-pasir")
              }
            >
              Kelas {k}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Akhir sesi: batas soal per sesi tercapai, progres tersimpan ----------

// Jeda istirahat di TENGAH petualangan (bukan akhir): penanda bagian ikut tampil supaya anak tahu masih ada lanjutannya.
export function LayarAkhirSesi({
  jumlahSoal,
  bagian,
  sekarang,
  sibuk,
  onLanjut,
}: {
  jumlahSoal: number;
  bagian: BagianPetualangan[];
  sekarang: number | null;
  sibuk: boolean;
  onLanjut: () => void;
}) {
  const judul = "Kamu sudah berusaha. Itu langkah yang hebat!";
  const isi = `Kamu sudah menjawab ${jumlahSoal} soal dan semuanya tersimpan. Petualanganmu belum selesai. Mau lanjut sekarang atau istirahat dulu?`;
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
      <MascotPijar ekspresi="senang" gerak="senang" ukuran={160} />
      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-[28px] leading-tight font-extrabold text-balance">{judul}</h1>
      </div>
      <p className="mt-2 text-[16px] leading-relaxed text-teks-2">{isi}</p>
      <div className="mt-4">
        <LangkahMapel bagian={bagian} sekarang={sekarang} />
      </div>
      <p className="mt-4 rounded-[20px] bg-pasir px-4 py-3 text-[15px]">
        <b>Bukan tentang nilai atau peringkat.</b> Kita mencari titik mulai belajar yang pas untukmu.
      </p>
      <div className="mt-7 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <TautanAnak varian="kedua" href="/anak">
          Istirahat dulu
        </TautanAnak>
        <TombolAnak onClick={onLanjut} disabled={sibuk} className="sm:min-w-56">
          {sibuk ? "Menyiapkan…" : "Lanjut petualangan"}
        </TombolAnak>
      </div>
    </div>
  );
}

// ---------- Kilasan netral setelah menjawab (PANDUAN 7.2: tanpa benar/salah) ----------

export function KilasanLanjut({ tampil }: { tampil: boolean }) {
  return (
    <AnimatePresence>
      {tampil && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          role="status"
        >
          <div className="flex items-center gap-3 rounded-full border-2 border-jingga/35 bg-white px-5 py-2 shadow-lg">
            <MascotPijar ekspresi="semangat" gerak="senang" ukuran={48} />
            <span className="font-heading text-xl font-extrabold">Oke, lanjut!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Dialog berhenti (gaya sama dengan dialog berhenti sesi belajar) ----------

export function DialogBerhentiAsesmen({ onLanjut }: { onLanjut: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-teks/40 p-3 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="judul-berhenti-asesmen" className="w-full max-w-md rounded-[28px] bg-krem p-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <MascotPijar ekspresi="istirahat" gerak="lelah" ukuran={110} />
        </div>
        <h2 id="judul-berhenti-asesmen" className="mt-2 text-[26px] font-extrabold">
          Mau istirahat dulu?
        </h2>
        <p className="mt-1 text-[16px] text-teks-2">Jawabanmu sudah tersimpan. Nanti kita lanjutkan dari soal berikutnya.</p>
        <div className="mt-6 flex flex-col gap-3">
          <TombolAnak onClick={onLanjut} autoFocus>
            Lanjut menjawab
          </TombolAnak>
          <TautanAnak varian="kedua" href="/anak">
            Ya, istirahat dulu
          </TautanAnak>
        </div>
      </div>
    </div>
  );
}
