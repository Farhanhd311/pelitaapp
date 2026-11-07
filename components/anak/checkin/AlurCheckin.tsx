"use client";

// Check-in harian anak (PANDUAN 7.1, PRD 9.2): energi -> cuaca hati -> keluhan -> hasil.
// Satu pertanyaan per layar. Pilihan tunggal langsung pindah ke langkah berikutnya; keluhan boleh banyak.
// Level sesi DIHITUNG SERVER (POST /api/checkin -> tentukanLevel), layar ini hanya menampilkan hasilnya.

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CloudLightning, CloudRain, CloudSun, Smile, Sun, X } from "lucide-react";
import { MascotPijar, type EkspresiPijar } from "@/components/anak/MascotPijar";
import { LayarFokus } from "@/components/anak/fokus/LayarFokus";
import { LayarPerluMasuk } from "@/components/anak/fokus/LayarPerluMasuk";
import { ProgresLangkah } from "@/components/anak/fokus/ProgresLangkah";
import { TombolAnak, TombolBulat } from "@/components/anak/fokus/TombolAnak";
import { butuhMasuk, panggilApi, pesanGalat, type GalatKlien } from "@/lib/api/klien";
import {
  LABEL_KELUHAN,
  type CuacaHati,
  type Energi,
  type Keluhan,
  type ResponsCheckin,
  type ResponsCheckinHariIni,
} from "@/lib/kontrak/checkin";
import { HasilCheckin } from "./HasilCheckin";
import { KartuPilihan } from "./KartuPilihan";

const PILIHAN_ENERGI: { nilai: Energi; ekspresi: EkspresiPijar; judul: string; keterangan: string }[] = [
  { nilai: "lemas", ekspresi: "istirahat", judul: "Lemas", keterangan: "Badanku lemas" },
  { nilai: "lumayan", ekspresi: "tenang", judul: "Lumayan", keterangan: "Cukup baik" },
  { nilai: "semangat", ekspresi: "semangat", judul: "Semangat!", keterangan: "Aku siap belajar" },
];

const PILIHAN_CUACA: { nilai: CuacaHati; ikon: ReactNode; latar: string; judul: string; keterangan: string }[] = [
  { nilai: "cerah", ikon: <Sun className="size-9" />, latar: "bg-emas/30 text-bata", judul: "Cerah", keterangan: "Hatiku senang" },
  { nilai: "berawan", ikon: <CloudSun className="size-9" />, latar: "bg-pasir text-jingga", judul: "Berawan", keterangan: "Biasa saja" },
  { nilai: "hujan", ikon: <CloudRain className="size-9" />, latar: "bg-merah-muda/35 text-bata", judul: "Hujan", keterangan: "Aku sedih" },
  { nilai: "badai", ikon: <CloudLightning className="size-9" />, latar: "bg-bata-tua/15 text-bata-tua", judul: "Badai", keterangan: "Aku kesal atau takut" },
];

const DAFTAR_KELUHAN = Object.keys(LABEL_KELUHAN) as Keluhan[];

const LANGKAH = [
  { judul: "Bagaimana energimu hari ini?", ekspresi: "sambut" as EkspresiPijar },
  { judul: "Bagaimana cuaca hatimu?", ekspresi: "penasaran" as EkspresiPijar },
  { judul: "Ada yang terasa tidak enak?", ekspresi: "peduli" as EkspresiPijar },
];

type Tampilan =
  | { jenis: "memuat" }
  | { jenis: "isi" }
  | { jenis: "hasil"; hasil: ResponsCheckin; sudahSebelumnya: boolean }
  | { jenis: "perlu_masuk"; galat: GalatKlien };

export function AlurCheckin() {
  const router = useRouter();
  const [tampilan, setTampilan] = useState<Tampilan>({ jenis: "memuat" });
  const [langkah, setLangkah] = useState(0);
  const [arah, setArah] = useState(1);
  const [energi, setEnergi] = useState<Energi | null>(null);
  const [cuaca, setCuaca] = useState<CuacaHati | null>(null);
  const [keluhan, setKeluhan] = useState<Keluhan[]>([]);
  const [tanpaKeluhan, setTanpaKeluhan] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Sudah check-in hari ini? Langsung tampilkan hasilnya (anak boleh mengubah kondisinya).
  useEffect(() => {
    panggilApi<ResponsCheckinHariIni>("/api/checkin")
      .then(({ checkin }) => setTampilan(checkin ? { jenis: "hasil", hasil: checkin, sudahSebelumnya: true } : { jenis: "isi" }))
      .catch((e) => {
        if (butuhMasuk(e)) return setTampilan({ jenis: "perlu_masuk", galat: e });
        setGalat(pesanGalat(e));
        setTampilan({ jenis: "isi" });
      });
  }, []);

  const pindah = (ke: number) => {
    setArah(ke > langkah ? 1 : -1);
    setLangkah(ke);
  };

  // Pilihan tunggal: tandai dulu sebentar supaya anak melihat pilihannya, lalu pindah langkah.
  const pilihLaluLanjut = (setel: () => void) => {
    setel();
    setTimeout(() => pindah(langkah + 1), 280);
  };

  const ubahKeluhan = (k: Keluhan) => {
    setTanpaKeluhan(false);
    setKeluhan((daftar) => (daftar.includes(k) ? daftar.filter((x) => x !== k) : [...daftar, k]));
  };

  async function kirim() {
    if (!energi || !cuaca) return;
    setMengirim(true);
    setGalat(null);
    try {
      const hasil = await panggilApi<ResponsCheckin>("/api/checkin", { energi, cuaca_hati: cuaca, keluhan: tanpaKeluhan ? [] : keluhan });
      setTampilan({ jenis: "hasil", hasil, sudahSebelumnya: false });
    } catch (e) {
      if (butuhMasuk(e)) setTampilan({ jenis: "perlu_masuk", galat: e });
      else setGalat(pesanGalat(e));
    } finally {
      setMengirim(false);
    }
  }

  const ulangi = () => {
    setLangkah(0);
    setArah(-1);
    setTampilan({ jenis: "isi" });
  };

  const tombolKiri =
    tampilan.jenis === "isi" && langkah > 0 ? (
      <TombolBulat label="Kembali" onClick={() => pindah(langkah - 1)}>
        <ArrowLeft className="size-6" />
      </TombolBulat>
    ) : (
      <TombolBulat label="Keluar ke Beranda" onClick={() => router.push("/anak")}>
        <X className="size-6" />
      </TombolBulat>
    );

  return (
    <LayarFokus
      kiri={tombolKiri}
      tengah={tampilan.jenis === "isi" ? <ProgresLangkah sekarang={langkah + 1} jumlah={LANGKAH.length} label={`Langkah ${langkah + 1} dari ${LANGKAH.length}`} /> : null}
      kanan={<span className="size-14 shrink-0" aria-hidden />}
    >
      {tampilan.jenis === "memuat" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-teks-2">
          <MascotPijar ekspresi="sambut" ukuran={140} />
          <p className="font-bold">Sebentar, ya…</p>
        </div>
      )}

      {tampilan.jenis === "perlu_masuk" && <LayarPerluMasuk galat={tampilan.galat} />}

      {tampilan.jenis === "hasil" && <HasilCheckin hasil={tampilan.hasil} sudahSebelumnya={tampilan.sudahSebelumnya} onUbah={ulangi} />}

      {tampilan.jenis === "isi" && (
        <AnimatePresence mode="wait" custom={arah} initial={false}>
          <motion.section
            key={langkah}
            custom={arah}
            initial={{ opacity: 0, x: arah * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: arah * -32, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center pt-6 sm:pt-10"
            aria-labelledby="judul-langkah"
          >
            <div className="flex items-center gap-3">
              <MascotPijar ekspresi={LANGKAH[langkah].ekspresi} ukuran={84} />
              <div className="text-left">
                <p className="text-sm font-bold tracking-wide text-bata uppercase">Check-in hari ini</p>
                <h1 id="judul-langkah" className="text-[26px] leading-tight font-extrabold text-balance sm:text-[32px]">
                  {LANGKAH[langkah].judul}
                </h1>
              </div>
            </div>

            {langkah === 0 && (
              <div role="radiogroup" aria-labelledby="judul-langkah" className="mt-8 grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
                {PILIHAN_ENERGI.map((p) => (
                  <KartuPilihan
                    key={p.nilai}
                    dipilih={energi === p.nilai}
                    onPilih={() => pilihLaluLanjut(() => setEnergi(p.nilai))}
                    tataLetak="datar-hp"
                    gambar={<MascotPijar ekspresi={p.ekspresi} gerak={energi === p.nilai ? "senang" : "idle"} ukuran={96} />}
                    judul={p.judul}
                    keterangan={p.keterangan}
                  />
                ))}
              </div>
            )}

            {langkah === 1 && (
              <div role="radiogroup" aria-labelledby="judul-langkah" className="mt-8 grid w-full grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {PILIHAN_CUACA.map((p) => (
                  <KartuPilihan
                    key={p.nilai}
                    dipilih={cuaca === p.nilai}
                    onPilih={() => pilihLaluLanjut(() => setCuaca(p.nilai))}
                    gambar={<span className={`flex size-20 items-center justify-center rounded-full ${p.latar}`}>{p.ikon}</span>}
                    judul={p.judul}
                    keterangan={p.keterangan}
                  />
                ))}
              </div>
            )}

            {langkah === 2 && (
              <>
                <p className="mt-2 text-[15px] text-teks-2">Boleh pilih lebih dari satu, atau langsung tekan Selesai.</p>
                <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <KartuPilihan
                    peran="toggle"
                    tataLetak="datar"
                    dipilih={tanpaKeluhan}
                    onPilih={() => {
                      setTanpaKeluhan((x) => !x);
                      setKeluhan([]);
                    }}
                    gambar={<Smile className="size-7 shrink-0 text-jingga" aria-hidden />}
                    judul="Tidak ada, aku baik"
                  />
                  {DAFTAR_KELUHAN.map((k) => (
                    <KartuPilihan
                      key={k}
                      peran="toggle"
                      tataLetak="datar"
                      dipilih={keluhan.includes(k)}
                      onPilih={() => ubahKeluhan(k)}
                      gambar={
                        <span className="text-[28px] leading-none" aria-hidden>
                          {LABEL_KELUHAN[k].emoji}
                        </span>
                      }
                      judul={LABEL_KELUHAN[k].teks}
                    />
                  ))}
                </div>
                <TombolAnak className="mt-8 w-full sm:w-auto sm:min-w-64" disabled={mengirim} onClick={kirim}>
                  {mengirim ? "Pijar sedang menyiapkan…" : "Selesai"}
                </TombolAnak>
              </>
            )}

            {galat && (
              <p role="alert" className="mt-5 rounded-2xl bg-emas/25 px-4 py-3 text-center font-semibold text-teks">
                {galat}
              </p>
            )}
          </motion.section>
        </AnimatePresence>
      )}
    </LayarFokus>
  );
}
