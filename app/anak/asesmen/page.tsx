"use client";

// Asesmen adaptif "Petualangan Pertama" (PANDUAN 5 A3, 7.2). Mode anak.
// Halaman ini hanya mengatur LAYAR; keputusan BKT (soal berikutnya, peluang, titik mulai) dihitung server
// di POST /api/asesmen dengan mesin lib/bkt. Kontrak data: lib/kontrak/asesmen.ts.
// Tampilan memakai komponen yang sama dengan check-in dan sesi belajar: LayarFokus, ProgresLangkah, KartuSoal.
//
// Satu petualangan, satu sesi: semua mapel ADAPTIF dari /api/mapel (Matematika + Bahasa Indonesia) dikerjakan
// berurutan tanpa layar "selesai" di antaranya, supaya anak tidak mengira petualangannya sudah selesai setelah
// satu mapel. Penanda bagian ("1 Matematika — 2 Bahasa Indonesia") selalu terlihat; saat pindah mapel ada layar
// singkat "Sekarang bagian ..." yang lanjut sendiri. Penempatan tetap terpisah per mapel (PANDUAN 7.2).
// Mapel pustaka (IPAS, Pendidikan Pancasila) tidak punya asesmen penempatan.
// Urutan mapel diacak (mapel dari ?mapel= didahulukan); asesmen yang sedang berjalan selalu dilanjutkan dulu.
//
// Alur layar: pembuka -> soal (berulang) -> [pindah_mapel -> soal ...] -> hasil
//             akhir_sesi muncul jika batas soal per sesi tercapai (jeda istirahat, progres tersimpan).
// Mode demo "putar otomatis": server menjawab sebagai Raka (aksi jawab_demo) setiap JEDA_DEMO_MS, untuk semua
// mapel berurutan menurut urutan data (Matematika dulu), tanpa layar akhir sesi.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { KartuSoal } from "@/components/anak/KartuSoal";
import { MascotPijar } from "@/components/anak/MascotPijar";
import {
  DialogBerhentiAsesmen,
  KilasanLanjut,
  LangkahMapel,
  LayarAkhirSesi,
  LayarPembuka,
  LayarPindahMapel,
  type BagianPetualangan,
} from "@/components/anak/asesmen/LayarAsesmen";
import { LayarHasil, type HasilMapel } from "@/components/anak/asesmen/LayarHasil";
import { PanelDemo } from "@/components/anak/asesmen/PanelDemo";
import { LayarFokus } from "@/components/anak/fokus/LayarFokus";
import { LayarPerluMasuk } from "@/components/anak/fokus/LayarPerluMasuk";
import { ProgresLangkah } from "@/components/anak/fokus/ProgresLangkah";
import { TautanAnak, TombolBulat } from "@/components/anak/fokus/TombolAnak";
import { butuhMasuk, GalatKlien, panggilApi, pesanGalat as teksGalat } from "@/lib/api/klien";
import type { PermintaanAsesmen, ResponsAsesmen } from "@/lib/kontrak/asesmen";
import type { ResponsProfil } from "@/lib/kontrak/auth";
import type { ResponsMapel, ResponsPeta } from "@/lib/kontrak/peta";
import { mapelDariUrl } from "@/components/anak/sesi/jalur";

// Tempo tampilan (bukan aturan bisnis): demo ±1,5 detik per soal (PANDUAN 5 A3), kilasan "Oke, lanjut!",
// layar pindah bagian, dan jeda di akhir tiap mapel demo supaya penonton melihat peta akhirnya.
const JEDA_DEMO_MS = 1500;
const LAMA_KILASAN_MS = 900;
const LAMA_PINDAH_MS = 2200;
const LAMA_PINDAH_DEMO_MS = 1500;
const JEDA_AKHIR_MAPEL_DEMO_MS = 1800;

type Mapel = ResponsMapel["mapel"][number];
type Fase = "memuat" | "pembuka" | "soal" | "pindah_mapel" | "akhir_sesi" | "hasil" | "galat";

const tunggu = (ms: number) => new Promise((selesai) => setTimeout(selesai, ms));

const KELAS_SD_LENGKAP = [1, 2, 3, 4, 5, 6];

/** Pilihan kelas yang bisa dipilih anak: seluruh jenjang kelas SD (1 sampai 6). */
function daftarKelas(_daftarPeta?: ResponsPeta[]): number[] {
  return KELAS_SD_LENGKAP;
}

/** Pilihan awal: kelas terakhir di profil anak; jika belum ada, default kelas 2. */
function pilihanAwal(daftarPeta: ResponsPeta[]): number | null {
  const kelasProfil = daftarPeta[0]?.kelas_terakhir ?? daftarPeta[0]?.kelas_seharusnya ?? 2;
  return KELAS_SD_LENGKAP.find((k) => k === kelasProfil) ?? 2;
}

function acak<T>(daftar: T[]): T[] {
  const hasil = [...daftar];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

/** Mapel yang masih harus diases: yang sedang berjalan dulu, lalu yang belum pernah selesai (diacak). */
function susunAntrean(mapel: Mapel[], peta: Record<number, ResponsPeta>): number[] {
  const berjalan = mapel.filter((m) => peta[m.mapel_id].asesmen_berjalan).map((m) => m.mapel_id);
  const belum = mapel.filter((m) => !peta[m.mapel_id].asesmen_berjalan && !peta[m.mapel_id].asesmen_selesai);
  return [...berjalan, ...acak(belum.map((m) => m.mapel_id))];
}

export default function HalamanAsesmen() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("memuat");
  const [daftarMapel, setDaftarMapel] = useState<Mapel[]>([]);
  const [peta, setPeta] = useState<Record<number, ResponsPeta>>({}); // per mapel_id
  const [antrean, setAntrean] = useState<number[]>([]); // mapel yang belum selesai di petualangan ini; [0] = sekarang
  const [urutanBagian, setUrutanBagian] = useState<number[]>([]); // semua mapel petualangan ini, urut dikerjakan
  const [titikMulai, setTitikMulai] = useState<Record<number, string | null>>({}); // dari respons "selesai"
  const [namaAnak, setNamaAnak] = useState<string | null>(null);
  const [respons, setRespons] = useState<ResponsAsesmen | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [kilasan, setKilasan] = useState(false);
  const [modeDemo, setModeDemo] = useState(false);
  const [demoBerjalan, setDemoBerjalan] = useState(false);
  const [tanyaBerhenti, setTanyaBerhenti] = useState(false);
  const [kelasPilihan, setKelasPilihan] = useState<number | null>(null); // dikirim saat putaran baru dan disimpan ke ANAK.kelas_terakhir
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [galatMasuk, setGalatMasuk] = useState<GalatKlien | null>(null); // belum login / belum pilih profil anak
  const mulaiSoal = useRef(0); // untuk waktu_respons_ms

  const mapelSekarang = daftarMapel.find((m) => m.mapel_id === antrean[0]) ?? null;

  const tanganiGalat = useCallback((g: unknown) => {
    setPesanGalat(teksGalat(g));
    if (butuhMasuk(g)) {
      setGalatMasuk(g);
      setFase("galat");
    }
  }, []);

  const muatPeta = useCallback(async (mapelId: number) => {
    const p = await panggilApi<ResponsPeta>(`/api/peta?mapel_id=${mapelId}`);
    setPeta((lama) => ({ ...lama, [mapelId]: p }));
    return p;
  }, []);

  // ---------- Muat awal: daftar mapel, nama anak, dan status asesmen setiap mapel ----------
  useEffect(() => {
    (async () => {
      try {
        const [{ mapel }, profil] = await Promise.all([
          panggilApi<ResponsMapel>("/api/mapel"),
          panggilApi<ResponsProfil>("/api/auth/profil"),
        ]);
        const adaptif = mapel.filter((m) => m.jenis === "adaptif");
        if (adaptif.length === 0) throw new GalatKlien("TIDAK_DITEMUKAN", "Belum ada mata pelajaran.");
        const daftarPeta = await Promise.all(adaptif.map((m) => panggilApi<ResponsPeta>(`/api/peta?mapel_id=${m.mapel_id}`)));
        const petaPerMapel = Object.fromEntries(daftarPeta.map((p) => [p.mapel_id, p]));
        const dariUrl = mapelDariUrl();
        const antreanAwal = susunAntrean(adaptif, petaPerMapel).sort((a, b) => Number(b === dariUrl) - Number(a === dariUrl));

        setDaftarMapel(adaptif);
        setNamaAnak(profil.anak_aktif?.nama_panggilan ?? null);
        setPeta(petaPerMapel);
        setAntrean(antreanAwal);
        // Mapel yang sudah selesai sebelumnya tampil lebih dulu (bercentang), lalu yang masih harus dikerjakan.
        setUrutanBagian([...adaptif.map((m) => m.mapel_id).filter((id) => !antreanAwal.includes(id)), ...antreanAwal]);
        setKelasPilihan(pilihanAwal(daftarPeta)); // pilihan awal dari profil anak (ANAK.kelas_terakhir)
        setFase(antreanAwal.length === 0 ? "hasil" : "pembuka");
      } catch (g) {
        tanganiGalat(g);
        setFase("galat");
      }
    })();
  }, [tanganiGalat]);

  // Permintaan "mulai" satu mapel. Kelas hanya dikirim untuk asesmen baru; asesmen yang sedang berjalan
  // dilanjutkan dengan kelasnya sendiri.
  const permintaanMulai = useCallback(
    (mapelId: number): PermintaanAsesmen =>
      peta[mapelId]?.asesmen_berjalan || kelasPilihan === null
        ? { aksi: "mulai", mapel_id: mapelId }
        : { aksi: "mulai", mapel_id: mapelId, kelas_terakhir: kelasPilihan },
    [peta, kelasPilihan],
  );

  // ---------- Panggil API asesmen dan pindah layar sesuai status ----------
  // antreanAwal[0] = mapel yang sedang diases. Saat mapel itu selesai, mapel berikutnya langsung dimulai
  // (layar pindah bagian sebentar), sampai antrean habis -> hasil.
  const kirimKeServer = useCallback(
    async (minta: PermintaanAsesmen, antreanAwal: number[], demo: boolean, mulaiMapel: (mapelId: number) => PermintaanAsesmen) => {
      setSibuk(true);
      setPesanGalat(null);
      let antreanKini = antreanAwal;
      let permintaan = minta;
      try {
        // Batas putaran hanya pengaman: permintaan asli, lalu "mulai" untuk melanjutkan (sesi baru atau mapel berikutnya).
        for (let putaran = 0; putaran < 8; putaran++) {
          const mapelId = antreanKini[0];
          const lanjutkan: PermintaanAsesmen = { aksi: "mulai", mapel_id: mapelId };
          let r: ResponsAsesmen;
          try {
            r = await panggilApi<ResponsAsesmen>("/api/asesmen", permintaan);
          } catch (g) {
            // Soal sudah dijawab / sesi sudah ditutup (misalnya dua tab terbuka): lanjutkan dari server.
            if (g instanceof GalatKlien && g.kode === "BENTROK") {
              permintaan = lanjutkan;
              continue;
            }
            throw g;
          }

          setRespons(r);
          mulaiSoal.current = Date.now();

          if (r.status === "lanjut") return setFase("soal");
          if (r.status === "batas_sesi") {
            if (!demo) return setFase("akhir_sesi");
            permintaan = lanjutkan; // demo: langsung lanjut di sesi baru, tanpa layar akhir sesi
            continue;
          }

          // Mapel ini selesai. Demo: peta akhirnya dibiarkan terlihat sebentar.
          setTitikMulai((lama) => ({ ...lama, [mapelId]: r.titik_mulai }));
          if (demo) await tunggu(JEDA_AKHIR_MAPEL_DEMO_MS);
          const sisa = antreanKini.filter((id) => id !== mapelId);
          antreanKini = sisa;
          setAntrean(sisa);
          if (sisa.length === 0) {
            await muatPeta(mapelId);
            setDemoBerjalan(false);
            return setFase("hasil");
          }
          // Masih ada mapel: bagian berikutnya di petualangan (dan sesi) yang sama, tanpa layar "selesai".
          setFase("pindah_mapel");
          await Promise.all([muatPeta(mapelId), tunggu(demo ? LAMA_PINDAH_DEMO_MS : LAMA_PINDAH_MS)]);
          permintaan = mulaiMapel(sisa[0]);
        }
      } catch (g) {
        tanganiGalat(g);
        setDemoBerjalan(false);
      } finally {
        setSibuk(false);
      }
    },
    [muatPeta, tanganiGalat],
  );

  // Mulai/lanjutkan petualangan dari mapel pertama di antrean.
  const mulai = (demo: boolean, antreanDipakai = antrean) => {
    const mapelId = antreanDipakai[0];
    if (mapelId === undefined) return;
    setModeDemo(demo);
    setDemoBerjalan(demo);
    setUrutanBagian((lama) => [...lama.filter((id) => !antreanDipakai.includes(id)), ...antreanDipakai]);
    void kirimKeServer(permintaanMulai(mapelId), antreanDipakai, demo, permintaanMulai);
  };

  // Mode demo panggung: semua mapel yang belum selesai (atau semuanya, jika sudah selesai semua), berurutan
  // menurut urutan data supaya sama dengan narasi demo. Jawaban Raka: data/seed_demo_raka.json.
  const mulaiDemo = () => {
    const ids = antrean.length > 0 ? antrean : daftarMapel.map((m) => m.mapel_id);
    const antreanDemo = daftarMapel.map((m) => m.mapel_id).filter((id) => ids.includes(id));
    setAntrean(antreanDemo);
    mulai(true, antreanDemo);
  };

  const kirimJawaban = (pilihanId: number) => {
    if (!respons?.soal || antrean[0] === undefined) return;
    setKilasan(true);
    setTimeout(() => setKilasan(false), LAMA_KILASAN_MS);
    void kirimKeServer(
      {
        aksi: "jawab",
        sesi_id: respons.sesi_id,
        soal_id: respons.soal.soal_id,
        pilihan_id: pilihanId,
        waktu_respons_ms: Date.now() - mulaiSoal.current,
      },
      antrean,
      false,
      permintaanMulai,
    );
  };

  // ---------- Putar otomatis (mode demo) ----------
  useEffect(() => {
    if (fase !== "soal" || !modeDemo || !demoBerjalan || sibuk || !respons?.soal || antrean[0] === undefined) return;
    const t = setTimeout(() => {
      void kirimKeServer({ aksi: "jawab_demo", sesi_id: respons.sesi_id, soal_id: respons.soal!.soal_id }, antrean, true, permintaanMulai);
    }, JEDA_DEMO_MS);
    return () => clearTimeout(t);
  }, [fase, modeDemo, demoBerjalan, sibuk, respons, antrean, kirimKeServer, permintaanMulai]);

  // ---------- Tampilan ----------
  const sedangMenjawab = fase === "soal" && respons?.soal;
  const tombolKiri = (
    <TombolBulat
      label={sedangMenjawab ? "Istirahat dulu" : "Keluar ke Beranda"}
      onClick={() => {
        if (!sedangMenjawab) return router.push("/anak");
        setDemoBerjalan(false);
        setTanyaBerhenti(true);
      }}
    >
      <X className="size-6" />
    </TombolBulat>
  );
  // Garis langkah terisi dari kiri ke kanan: soal ke-N di sesi ini (berlanjut lintas mapel) dari batas soal per sesi.
  // Mode demo tidak memakainya: panel demo sudah menunjukkan jalannya asesmen.
  const progres =
    sedangMenjawab && respons && !modeDemo ? (
      <ProgresLangkah sekarang={respons.nomor_soal} jumlah={respons.jumlah_soal} label={`Soal ${respons.nomor_soal} dari ${respons.jumlah_soal}`} />
    ) : null;

  const bagian: BagianPetualangan[] = urutanBagian.flatMap((id) => {
    const m = daftarMapel.find((x) => x.mapel_id === id);
    return m ? [{ mapel_id: id, nama: m.nama, selesai: !antrean.includes(id) }] : [];
  });
  // Deskripsi TP untuk panel demo (dari GET /api/peta), supaya penonton tidak hanya melihat kode TP.
  const petaSekarang = antrean[0] !== undefined ? peta[antrean[0]] : undefined;
  const deskripsiTp = Object.fromEntries([...(petaSekarang?.pos_dasar ?? []), ...(petaSekarang?.kelasku ?? [])].map((t) => [t.tp_kode, t.deskripsi]));

  const hasilSelesai: HasilMapel[] = daftarMapel
    .filter((m) => peta[m.mapel_id]?.asesmen_selesai)
    .map((m) => ({ mapel_id: m.mapel_id, nama: m.nama, peta: peta[m.mapel_id], titik_mulai: titikMulai[m.mapel_id] ?? null }));
  const mapelBelumSelesai = daftarMapel.filter((m) => peta[m.mapel_id] && !peta[m.mapel_id].asesmen_selesai);

  return (
    <LayarFokus kiri={tombolKiri} tengah={progres} kanan={<span className="size-14 shrink-0" aria-hidden />}>
      {fase === "memuat" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-teks-2">
          <MascotPijar ekspresi="penasaran" ukuran={150} />
          <p className="font-bold">Pijar sedang menyiapkan petualangan…</p>
        </div>
      )}

      {fase === "galat" &&
        (galatMasuk ? (
          <LayarPerluMasuk galat={galatMasuk} />
        ) : (
          <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
            <MascotPijar ekspresi="empati" ukuran={150} />
            <p className="mt-3 text-[22px] font-extrabold">{pesanGalat ?? "Ada gangguan. Coba lagi, ya."}</p>
            <TautanAnak varian="kedua" href="/anak" className="mt-6">
              Kembali ke Beranda
            </TautanAnak>
          </div>
        ))}

      {fase === "pembuka" && (
        <LayarPembuka
          namaAnak={namaAnak}
          bagian={bagian}
          sibuk={sibuk}
          pilihanKelas={daftarKelas(Object.values(peta))}
          kelas={kelasPilihan}
          onPilihKelas={setKelasPilihan}
          melanjutkan={antrean[0] !== undefined && (peta[antrean[0]]?.asesmen_berjalan ?? false)}
          onMulai={() => mulai(false)}
          onMulaiDemo={mulaiDemo}
        />
      )}

      {fase === "soal" && respons && (
        <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col items-center gap-5 sm:mt-6">
          <LangkahMapel bagian={bagian} sekarang={antrean[0] ?? null} />
          {modeDemo && (
            <PanelDemo
              demo={respons.demo}
              peta={respons.peta}
              tpSekarang={respons.soal?.tp_kode ?? null}
              titikMulai={respons.status === "selesai" ? respons.titik_mulai : null}
              deskripsiTp={deskripsiTp}
              jumlahSoal={respons.jumlah_soal_dijawab}
              berjalan={demoBerjalan}
              onJedaLanjut={() => setDemoBerjalan((b) => !b)}
            />
          )}
          {/* key: setiap soal baru mengosongkan pilihan. Mode demo: pilihan dikunci (server yang menjawab).
              Label mapel hanya jika petualangannya satu mapel (selain itu sudah ada penanda bagian di atas). */}
          {respons.soal && (
            <KartuSoal
              key={respons.soal.soal_id}
              soal={respons.soal}
              label={bagian.length < 2 && mapelSekarang ? `Petualangan Pertama · ${mapelSekarang.nama}` : undefined}
              terkunci={modeDemo}
              sibuk={sibuk}
              onKirim={kirimJawaban}
            />
          )}
        </div>
      )}

      {fase === "pindah_mapel" && <LayarPindahMapel bagian={bagian} sekarang={antrean[0] ?? null} />}

      {fase === "akhir_sesi" && (
        <LayarAkhirSesi jumlahSoal={respons?.nomor_soal ?? 0} bagian={bagian} sekarang={antrean[0] ?? null} sibuk={sibuk} onLanjut={() => mulai(false)} />
      )}

      {fase === "hasil" && (
        <LayarHasil
          hasil={hasilSelesai}
          mapelBelumSelesai={mapelBelumSelesai}
          onLanjutMapel={() => {
            setAntrean(susunAntrean(mapelBelumSelesai, peta));
            setFase("pembuka");
          }}
          onUlangi={() => {
            const semua = acak(daftarMapel.map((m) => m.mapel_id));
            setAntrean(semua);
            setUrutanBagian(semua);
            setTitikMulai({});
            setFase("pembuka");
          }}
        />
      )}

      {pesanGalat && fase !== "galat" && (
        <p role="alert" className="mx-auto mt-6 max-w-xl rounded-2xl bg-emas/25 px-4 py-3 text-center font-semibold">
          {pesanGalat}
        </p>
      )}

      <KilasanLanjut tampil={kilasan} />
      {tanyaBerhenti && <DialogBerhentiAsesmen onLanjut={() => setTanyaBerhenti(false)} />}
    </LayarFokus>
  );
}
