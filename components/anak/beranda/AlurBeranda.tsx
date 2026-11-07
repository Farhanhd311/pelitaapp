"use client";

// Beranda Anak (satu-satunya halaman utama mode anak, tanpa header): peta jalur belajar selebar layar.
// Menu ☰ di kiri atas (pilih mapel + ganti profil); judul petualangan dan lencana hari aktif menempel di atas peta.
// Peta dari GET /api/beranda: satu peta tetap = satu mapel, dari materi awal sampai akhir kelasnya.
//   Belum asesmen -> pos pertama "Petualangan Pertama" (/anak/asesmen), tanpa pemilih mapel.
//   Sudah asesmen -> anak memilih mapel (disimpan di URL ?mapel=). Mapel dengan sesi belajar: Pos Dasar lalu
//   Kelasku, "Mulai Belajar!" ke check-in (PANDUAN 6.2) lalu sesi TP rekomendasi. Mapel lain: "segera hadir".

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { LayarPerluMasuk } from "@/components/anak/fokus/LayarPerluMasuk";
import { TombolAnak } from "@/components/anak/fokus/TombolAnak";
import { denganMapel } from "@/components/anak/sesi/jalur";
import { butuhMasuk, panggilApi, pesanGalat, type GalatKlien } from "@/lib/api/klien";
import type { ResponsBeranda } from "@/lib/kontrak/beranda";
import type { PosJalur } from "@/lib/peta/jalur-materi";
import { LencanaMingguIni } from "./LencanaMingguIni";
import { PetaPetualangan } from "./PetaPetualangan";
import { MenuMapel } from "./MenuMapel";
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


// "Matematika · Kelas 4": bagian sesudah titik tengah tidak dipecah. Di bawah layar lebar (lg) kotak judulnya sempit,
// jadi titiknya disembunyikan dan baris dilipat sebelum "Kelas 4" (bukan "Matematika / · Kelas 4").
function JudulPetualangan({ judul }: { judul: string }) {
  const [utama, ...lanjutan] = judul.split(" · ");
  return (
    <>
      {utama}
      {lanjutan.map((bagian) => (
        <span key={bagian}>
          {" "}
          <span className="whitespace-nowrap">
            <span className="hidden lg:inline">· </span>
            {bagian}
          </span>
        </span>
      ))}
    </>
  );
}

// Pos tambahan bisa memakai materi yang sama dengan pos Pos Dasar (satu materi, dua TP), jadi judulnya dibedakan.
const judulPos = (p: PosJalur) => (p.bagian === "tambahan" ? `Lanjutan: ${p.judul}` : p.judul);

// i = urutan pos di jalur (0 = pos pertama).
const kePos = (p: PosJalur, i: number): PosBeranda => ({
  id: p.id,
  judul: judulPos(p),
  // Materi tanpa TP adaptif belum punya soal: "Segera hadir" (jam pasir), bukan gembok. Pos lain cukup "Level N"
  // menurut urutannya di peta, tanpa kelas asal materinya: anak tidak perlu tahu ia sedang mengulang materi kelas
  // bawah (PANDUAN 13: tanpa label "tertinggal"). Kelas tetap tercatat di data dan dashboard pendamping.
  chip: p.status === "tercapai" ? "Tercapai" : p.status === "bacaan" ? "Segera hadir" : `Level ${i + 1}`,
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
    judulPetualangan: `${mapel.nama} · Kelas ${s.kelas}`,
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

      {/* Lencana hari aktif minggu ini (kanan atas, tetap terlihat saat peta digulir). */}
      <div className="fixed top-4 right-4 z-40 sm:right-7">
        <LencanaMingguIni hari={respons.hari_aktif_minggu_ini} />
      </div>

      {/* Menu ☰ (kiri atas, tetap terlihat): pilih mapel setelah asesmen penempatan, dan Ganti profil. */}
      <MenuMapel
        daftar={respons.daftar_mapel}
        dipilih={respons.mapel.mapel_id}
        bisaPilih={respons.asesmen_selesai}
        sibuk={berganti}
        namaAnak={data.namaAnak}
        onPilih={(id) => {
          setBerganti(true);
          router.replace(`/anak?mapel=${id}`, { scroll: false });
        }}
      />

      <div
        aria-busy={berganti}
        className={`relative min-w-0 transition-opacity xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain ${berganti ? "opacity-60" : ""}`}
      >
        {/* Lapisan atas peta (ikut tergulir bersama peta): judul petualangan di tengah. Kiri dan kanannya dikosongkan
            untuk tombol menu ☰ dan lencana hari aktif yang menempel (sticky). */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0">
          <div className="pointer-events-auto absolute top-4 left-1/2 w-max max-w-[calc(100%-13.5rem)] -translate-x-1/2 rounded-[20px] border border-garis bg-krem/90 px-3 py-2 sm:rounded-[28px] sm:border-2 sm:px-10 sm:py-4 text-center shadow-[0_4px_0_var(--color-garis)] backdrop-blur-sm sm:max-w-[calc(100%-24rem)]">
            <p className="text-[10px] font-bold tracking-[0.05em] whitespace-nowrap text-bata uppercase sm:text-[13px] sm:tracking-[0.14em]">
              Petualangan hari ini
            </p>
            <h2 className="text-[15px] leading-snug font-extrabold text-balance sm:mt-1 sm:text-[30px] sm:leading-tight">
              <JudulPetualangan judul={data.judulPetualangan} />
            </h2>
          </div>
        </div>

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
