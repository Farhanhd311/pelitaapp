"use client";

// Beranda Anak (satu-satunya halaman utama mode anak, tanpa sidebar): pemilih mapel + lencana hari aktif
// minggu ini, petualangan hari ini, lalu peta jalur belajar selebar layar.
// Peta dari GET /api/beranda: satu peta tetap = satu mapel, dari materi awal sampai akhir kelasnya.
//   Belum asesmen -> pos pertama "Petualangan Pertama" (/anak/asesmen), tanpa pemilih mapel.
//   Sudah asesmen -> anak memilih mapel (disimpan di URL ?mapel=). Mapel dengan sesi belajar: Pos Dasar lalu
//   Kelasku, "Mulai Belajar!" ke check-in (PANDUAN 6.2) lalu sesi TP rekomendasi. Mapel lain: "segera hadir".

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { LogoPelita } from "@/components/LogoPelita";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { LayarPerluMasuk } from "@/components/anak/fokus/LayarPerluMasuk";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";
import { denganMapel } from "@/components/anak/sesi/jalur";
import { butuhMasuk, panggilApi, pesanGalat, type GalatKlien } from "@/lib/api/klien";
import type { ResponsBeranda } from "@/lib/kontrak/beranda";
import type { PosJalur } from "@/lib/peta/jalur-materi";
import { DialogPanduan } from "./DialogAnak";
import { LencanaMingguIni } from "./LencanaMingguIni";
import { PetaPetualangan } from "./PetaPetualangan";
import { PilihMapel } from "./PilihMapel";
import type { DataBeranda, PosBeranda } from "./jenis";

const HREF_CHECKIN = "/anak/checkin";
const HREF_ASESMEN = "/anak/asesmen";

type Keadaan =
  | { jenis: "memuat" }
  | { jenis: "perlu_masuk"; galat: GalatKlien }
  | { jenis: "galat"; pesan: string }
  | { jenis: "siap"; respons: ResponsBeranda; dariIndeks: number | null };

// Pos bertombol play terakhir yang dilihat anak, per anak dan mapel (hanya kenyamanan tampilan di perangkat ini).
// Jika pos itu sekarang sudah tuntas dan ada di belakang pos play, Beranda memutar animasi: Pijar pindah dari
// pos lama ke pos baru diiringi jejak kaki. Hasilnya indeks pos lama (atau null jika tidak ada animasi).
const kunciPos = (r: ResponsBeranda) => `pelita:pos-sekarang:${r.anak_id}:${r.mapel.mapel_id}`;

// Memakai daftar pos yang benar-benar ditampilkan (termasuk pos penutup "Semua pos sudah kamu lewati!").
function cekMaju(r: ResponsBeranda, d: DataBeranda): number | null {
  if (!r.asesmen_selesai) return null;
  const sekarang = d.pos[d.indeksSekarang]?.id;
  try {
    const lama = localStorage.getItem(kunciPos(r));
    if (sekarang) localStorage.setItem(kunciPos(r), sekarang);
    if (!lama || lama === sekarang) return null;
    const i = d.pos.findIndex((p) => p.id === lama);
    return i >= 0 && i < d.indeksSekarang && d.pos[i].tercapai ? i : null;
  } catch {
    return null; // penyimpanan diblokir: tampil tanpa animasi
  }
}

const NAMA_BAGIAN = { pos_dasar: "Pos Dasar", kelasku: "Kelasku", tambahan: "Pos tambahan" } as const;
const namaBagian = (p: PosJalur) => `${NAMA_BAGIAN[p.bagian]} kelas ${p.kelas}`;

// Pos tambahan bisa memakai materi yang sama dengan pos Pos Dasar (satu materi, dua TP), jadi judulnya dibedakan.
const judulPos = (p: PosJalur) => (p.bagian === "tambahan" ? `Lanjutan: ${p.judul}` : p.judul);

const kePos = (p: PosJalur): PosBeranda => ({
  id: p.id,
  judul: judulPos(p),
  // Materi tanpa TP adaptif belum punya soal: "Segera hadir" (jam pasir), bukan gembok.
  chip:
    p.status === "tercapai"
      ? "Tercapai"
      : p.status === "bacaan"
        ? "Segera hadir"
        : p.bagian === "kelasku"
          ? `Kelas ${p.kelas}`
          : NAMA_BAGIAN[p.bagian],
  tercapai: p.status === "tercapai",
  segera: p.status === "bacaan",
});

// Pos buatan untuk keadaan tanpa pos materi bertombol play (belum asesmen, semua tuntas, materi kosong).
const posKhusus = (id: string, judul: string): PosBeranda => ({ id, judul, chip: "", tercapai: false });

export function keDataBeranda(r: ResponsBeranda): DataBeranda {
  const { jalur, mapel } = r;
  const dasar = { namaAnak: r.nama_anak };
  const semua = jalur.pos.map(kePos);
  const k = jalur.indeks_sekarang;
  const s = k === null ? null : jalur.pos[k];

  // Asesmen penempatan dilakukan per mapel (PANDUAN 7.2): mapel utama dulu, lalu setiap mapel adaptif lain
  // (misalnya Bahasa Indonesia) punya Petualangan Pertamanya sendiri. Mapel pustaka tidak punya asesmen.
  const mapelLain = r.asesmen_selesai;
  if (!r.asesmen_selesai || (mapel.bisa_belajar && !r.mapel_asesmen_selesai)) {
    return {
      ...dasar,
      judulPetualangan: mapelLain ? `${mapel.nama} · Petualangan Pertama` : "Petualangan Pertama",
      // Pratinjau tujuan: Kelasku. Pos Dasar baru diketahui setelah asesmen.
      pos: [posKhusus("petualangan-pertama", "Petualangan Pertama"), ...semua],
      indeksSekarang: 0,
      sekarang: {
        judul: "Petualangan Pertama",
        keterangan: mapelLain ? `Kenalan dulu dengan kemampuan ${mapel.nama}-mu` : "Kenalan dulu dengan kemampuanmu",
        ajakan: mapelLain ? `Yuk, kenalan dulu lewat Petualangan Pertama ${mapel.nama}!` : "Yuk, kenalan dulu lewat Petualangan Pertama!",
        pesan: "Bukan ujian, santai saja. 😊",
        href: denganMapel(HREF_ASESMEN, mapel.mapel_id),
        labelTombol: "Mulai Petualangan!",
      },
    };
  }

  if (!mapel.bisa_belajar) {
    const kosong = semua.length === 0;
    return {
      ...dasar,
      judulPetualangan: `${mapel.nama} · Kelas ${r.kelas_seharusnya}`,
      pos: kosong ? [posKhusus("kosong", "Belum ada materi untuk kelasmu")] : semua,
      indeksSekarang: kosong ? 0 : (k ?? 0),
      sekarang: {
        judul: s?.judul ?? "Belum ada materi untuk kelasmu",
        keterangan: "Materinya sedang disiapkan",
        ajakan: `Petualangan ${mapel.nama} segera hadir, ya!`,
        pesan: "Sementara itu, belajar mapel lain dulu, ya.",
        labelTombol: "Segera hadir",
      },
    };
  }

  // Semua pos tuntas: tombol play ada di pos penutup, tepat setelah pos terakhir yang bisa dimainkan
  // (sebelum pos "Segera hadir" di akhir peta).
  if (!s) {
    const ujung = semua.findIndex((p) => p.segera);
    const sisip = ujung === -1 ? semua.length : ujung;
    return {
      ...dasar,
      judulPetualangan: mapel.nama,
      pos: [...semua.slice(0, sisip), posKhusus("selesai", "Semua pos sudah kamu lewati!"), ...semua.slice(sisip)],
      indeksSekarang: sisip,
      // Tidak ada materi baru yang bisa dibuka sesi (POST /api/sesi membalas "Materi ini belum tersedia"),
      // jadi tombolnya tampil "Segera hadir" tanpa tautan.
      sekarang: {
        judul: "Semua pos sudah kamu lewati!",
        keterangan: "Semua materi yang ada sudah kamu kuasai",
        ajakan: "Hebat! Materi baru segera hadir, ya.",
        pesan: "Pelajaran baru menyusul ya! 😊",
        labelTombol: "Segera hadir",
      },
    };
  }

  // Bingkai positif (PANDUAN 13): jarak menuju Kelasku, bukan "tertinggal".
  const posDasarTersisa = jalur.pos.filter((p) => p.bagian === "pos_dasar" && p.status !== "tercapai").length;
  // Pos berikutnya terbuka hanya setelah pos ini dikuasai (BKT + prasyarat, PANDUAN 7.2-7.3), bukan setelah sesi selesai.
  // Sisa jawaban benar dihitung server dengan aturan yang sama dengan sesi (tanpa angka peluang).
  const bagianTersisa = s.tp_total - s.tp_tercapai;
  const pesan = r.benar_lagi
    ? bagianTersisa > 1
      ? `Tinggal ${r.benar_lagi} jawaban benar lagi untuk bagian ini 🔓`
      : `Tinggal ${r.benar_lagi} jawaban benar lagi, pos berikutnya terbuka 🔓`
    : r.sekarang_dilatih
      ? "Kuasai pos ini dulu, nanti pos berikutnya terbuka 🔓"
    : posDasarTersisa > 0
      ? `${posDasarTersisa} pos lagi menuju Kelasku!`
      : "Kamu sudah sampai di Kelasku! 🎉";

  return {
    ...dasar,
    judulPetualangan: `${mapel.nama} · ${namaBagian(s)}`,
    pos: semua,
    indeksSekarang: k!,
    sekarang: {
      judul: judulPos(s),
      keterangan:
        s.status === "sedang" || r.sekarang_dilatih ? "Sedang kamu latih" : s.tp_tercapai > 0 ? "Sedikit lagi!" : "Belum dimulai",
      kemajuan: s.tp_total > 0 ? { tuntas: s.tp_tercapai, total: s.tp_total } : undefined,
      ajakan: "Yuk, kita mulai dari pos ini!",
      pesan,
      href: denganMapel(HREF_CHECKIN, mapel.mapel_id),
      labelTombol: "Mulai Belajar!",
    },
  };
}

export function AlurBeranda() {
  const router = useRouter();
  const mapelDiUrl = useSearchParams().get("mapel");
  const [keadaan, setKeadaan] = useState<Keadaan>({ jenis: "memuat" });
  const [berganti, setBerganti] = useState(false); // sedang memuat peta mapel lain; peta lama tetap tampil
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    let batal = false;
    const url = mapelDiUrl ? `/api/beranda?mapel_id=${encodeURIComponent(mapelDiUrl)}` : "/api/beranda";
    panggilApi<ResponsBeranda>(url)
      .then((respons) => !batal && setKeadaan({ jenis: "siap", respons, dariIndeks: cekMaju(respons, keDataBeranda(respons)) }))
      .catch((e) => {
        if (batal) return;
        setKeadaan(butuhMasuk(e) ? { jenis: "perlu_masuk", galat: e } : { jenis: "galat", pesan: pesanGalat(e) });
      })
      .finally(() => !batal && setBerganti(false));
    return () => {
      batal = true;
    };
  }, [mapelDiUrl, percobaan]);

  if (keadaan.jenis === "perlu_masuk") {
    return (
      <div className="flex min-h-dvh flex-col p-6">
        <LayarPerluMasuk galat={keadaan.galat} />
      </div>
    );
  }
  if (keadaan.jenis !== "siap") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center" aria-live="polite">
        <MascotPijar ekspresi={keadaan.jenis === "galat" ? "peduli" : "penasaran"} gerak="idle" ukuran={140} />
        <p className="font-heading text-[18px] font-extrabold">
          {keadaan.jenis === "galat" ? keadaan.pesan : "Pijar sedang menyiapkan petamu…"}
        </p>
        {keadaan.jenis === "galat" && (
          <TombolAnak
            onClick={() => {
              setKeadaan({ jenis: "memuat" });
              // Mapel di URL tidak dikenal? Kembali ke peta mapel utama.
              if (mapelDiUrl) router.replace("/anak");
              else setPercobaan((n) => n + 1);
            }}
          >
            Coba lagi
          </TombolAnak>
        )}
      </div>
    );
  }

  const { respons } = keadaan;
  const data = keDataBeranda(respons);

  return (
    // Layar lebar (xl): halaman setinggi layar; pemilih mapel dan banner diam, hanya peta yang bergulir. Layar lebih kecil: seluruh halaman bergulir seperti biasa.
    <div className="flex flex-col xl:h-dvh">
      <h1 className="sr-only">Peta petualangan {data.namaAnak}</h1>

      {/* Ponsel: baris 1 = logo + lencana, baris 2 = pemilih mapel selebar layar.
          Layar lebih lebar: satu baris, pemilih mapel di kiri dan lencana di kanan atas. */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:items-start sm:px-7">
        <span className="sm:hidden">
          <LogoPelita ukuran={36} />
        </span>
        {/* Memilih mapel baru boleh setelah asesmen penempatan selesai. */}
        {respons.asesmen_selesai ? (
          <PilihMapel
            daftar={respons.daftar_mapel}
            dipilih={respons.mapel.mapel_id}
            sibuk={berganti}
            onPilih={(id) => {
              setBerganti(true);
              router.replace(`/anak?mapel=${id}`, { scroll: false });
            }}
          />
        ) : (
          <div className="hidden flex-1 sm:block" />
        )}
        <span className="ml-auto sm:ml-0">
          <LencanaMingguIni hari={respons.hari_aktif_minggu_ini} />
        </span>
      </div>

      <section className="flex flex-wrap items-center gap-3 bg-pasir px-4 py-2.5 text-teks sm:px-7">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.12em] text-bata uppercase">Petualangan hari ini</p>
          <h2 className="text-xl font-extrabold">{data.judulPetualangan}</h2>
        </div>
        {/* Satu-satunya jalan keluar dari mode anak: kembali ke pilih profil (mode pendamping butuh PIN). */}
        <Link
          href="/pilih-profil"
          aria-label={`${data.namaAnak}, ganti profil`}
          className="flex min-h-14 items-center gap-2 rounded-full border border-garis bg-pasir-muda p-1.5 font-heading text-sm font-bold transition hover:bg-krem focus-visible:ring-4 focus-visible:ring-emas/60 focus-visible:outline-none sm:pr-4"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-merah-muda text-lg font-extrabold" aria-hidden>
            {data.namaAnak.charAt(0)}
          </span>
          <span className="hidden sm:inline" aria-hidden>
            Ganti profil
          </span>
        </Link>
        <DialogPanduan
          className="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-jingga bg-pasir-muda font-heading text-sm font-bold transition hover:bg-krem sm:px-5"
          pemicu={
            <>
              {/* ponsel: ikon saja agar judul petualangan tidak terjepit */}
              <BookOpen className="size-5" aria-hidden /> <span className="sr-only sm:not-sr-only">Lihat panduan</span>
            </>
          }
        />
      </section>

      <div
        aria-busy={berganti}
        className={`min-w-0 transition-opacity xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain ${berganti ? "opacity-60" : ""}`}
      >
        {/* key ikut pos aktif: saat kembali dari sesi dan pos aktif berubah, peta dipasang ulang supaya animasi
            jejak kaki dan gulir otomatis berjalan lagi (halaman yang tersimpan oleh cacheComponents tidak dibuat ulang). */}
        <PetaPetualangan
          key={`${respons.mapel.mapel_id}:${data.pos[data.indeksSekarang]?.id}`}
          dariIndeks={keadaan.dariIndeks}
          namaAnak={data.namaAnak}
          pos={data.pos}
          indeksSekarang={data.indeksSekarang}
          sekarang={data.sekarang}
        />
      </div>
    </div>
  );
}
