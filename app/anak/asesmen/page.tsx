"use client";

// Asesmen adaptif "Petualangan Pertama" (PANDUAN 5 A3, 7.2). Mode anak.
// Halaman ini hanya mengatur LAYAR; keputusan BKT (soal berikutnya, peluang, titik mulai) dihitung server
// di POST /api/asesmen dengan mesin lib/bkt. Kontrak data: lib/kontrak/asesmen.ts.
// Tampilan memakai komponen yang sama dengan check-in dan sesi belajar: LayarFokus, ProgresLangkah, KartuSoal.
//
// Asesmen mencakup semua mapel ADAPTIF dari /api/mapel (Matematika + Bahasa Indonesia), satu per satu. Mapel pustaka
// (IPAS, Pendidikan Pancasila) tidak punya asesmen penempatan. Mapel dari ?mapel= (dipilih di Beranda) didahulukan.
// Penempatan tetap terpisah per mapel (PANDUAN 7.2); batas soal per mapel diatur server (PENGATURAN_SISTEM).
// Urutan mapel diacak; asesmen yang sedang berjalan selalu dilanjutkan dulu. Mode demo: mapel pertama saja.
//
// Alur layar: pembuka -> soal (berulang) -> akhir_sesi (batas soal per sesi) | ganti_mapel | hasil
// Mode demo "putar otomatis": server yang menjawab sebagai Raka (aksi jawab_demo) setiap JEDA_DEMO_MS.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { KartuSoal } from "@/components/anak/KartuSoal";
import { MascotPijar } from "@/components/anak/MascotPijar";
import {
  DialogBerhentiAsesmen,
  KilasanLanjut,
  LayarAkhirSesi,
  LayarGantiMapel,
  LayarPembuka,
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

// Tempo tampilan (bukan aturan bisnis): demo ±1,5 detik per soal (PANDUAN 5 A3), kilasan "Oke, lanjut!".
const JEDA_DEMO_MS = 1500;
const LAMA_KILASAN_MS = 900;
const JEDA_SEBELUM_HASIL_DEMO_MS = 1800;

type Mapel = ResponsMapel["mapel"][number];
type Fase = "memuat" | "pembuka" | "soal" | "akhir_sesi" | "ganti_mapel" | "hasil" | "galat";

/** Kelas yang punya TP di peta semua mapel, urut naik. */
function daftarKelas(daftarPeta: ResponsPeta[]): number[] {
  const kelas = daftarPeta.flatMap((p) => [...p.pos_dasar, ...p.kelasku].map((t) => t.kelas));
  return [...new Set(kelas)].sort((a, b) => a - b);
}

/** Pilihan awal: kelas terakhir di profil; jika tidak ada di peta, kelas terdekat di bawahnya. */
function pilihanAwal(daftarPeta: ResponsPeta[]): number | null {
  const kelas = daftarKelas(daftarPeta);
  const kelasProfil = daftarPeta[0]?.kelas_terakhir ?? 0;
  return kelas.filter((k) => k <= kelasProfil).at(-1) ?? kelas[0] ?? null;
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
  const [antrean, setAntrean] = useState<number[]>([]); // mapel yang diases di petualangan ini; [0] = sekarang
  const [titikMulai, setTitikMulai] = useState<Record<number, string | null>>({}); // dari respons "selesai"
  const [mapelBaruSelesai, setMapelBaruSelesai] = useState<number | null>(null); // untuk layar ganti mapel
  const [namaAnak, setNamaAnak] = useState<string | null>(null);
  const [respons, setRespons] = useState<ResponsAsesmen | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [kilasan, setKilasan] = useState(false);
  const [modeDemo, setModeDemo] = useState(false);
  const [demoBerjalan, setDemoBerjalan] = useState(false);
  const [tanyaBerhenti, setTanyaBerhenti] = useState(false);
  const [kelasPilihan, setKelasPilihan] = useState<number | null>(null); // hanya untuk asesmen ini, tidak disimpan ke profil
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [galatMasuk, setGalatMasuk] = useState<GalatKlien | null>(null); // belum login / belum pilih profil anak
  const mulaiSoal = useRef(0); // untuk waktu_respons_ms

  const mapelSekarang = daftarMapel.find((m) => m.mapel_id === antrean[0]) ?? null;
  const namaMapel = (id: number | undefined) => daftarMapel.find((m) => m.mapel_id === id)?.nama ?? "";

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
        setKelasPilihan(pilihanAwal(daftarPeta)); // pilihan awal dari profil anak (ANAK.kelas_terakhir)
        setFase(antreanAwal.length === 0 ? "hasil" : "pembuka");
      } catch (g) {
        tanganiGalat(g);
        setFase("galat");
      }
    })();
  }, [tanganiGalat]);

  // ---------- Panggil API asesmen dan pindah layar sesuai status ----------
  const kirimKeServer = useCallback(
    async (minta: PermintaanAsesmen, mapelId: number, sisaAntrean: number[], demo: boolean) => {
      const mulaiLagi: PermintaanAsesmen = { aksi: "mulai", mapel_id: mapelId };
      setSibuk(true);
      setPesanGalat(null);
      try {
        let permintaan = minta;
        // Paling banyak 3 putaran: permintaan asli, lalu "mulai" untuk melanjutkan di sesi baru jika perlu.
        for (let putaran = 0; putaran < 3; putaran++) {
          let r: ResponsAsesmen;
          try {
            r = await panggilApi<ResponsAsesmen>("/api/asesmen", permintaan);
          } catch (g) {
            // Soal sudah dijawab / sesi sudah ditutup (misalnya dua tab terbuka): lanjutkan dari server.
            if (g instanceof GalatKlien && g.kode === "BENTROK") {
              permintaan = mulaiLagi;
              continue;
            }
            throw g;
          }

          setRespons(r);
          mulaiSoal.current = Date.now();

          if (r.status === "batas_sesi" && demo) {
            permintaan = mulaiLagi; // demo: langsung lanjut di sesi baru, tanpa layar akhir sesi
            continue;
          }
          if (r.status === "lanjut") setFase("soal");
          else if (r.status === "batas_sesi") setFase("akhir_sesi");
          else {
            // Mapel ini selesai. Demo: langsung hasil. Selain itu: mapel berikutnya (jika ada) setelah jeda.
            if (demo) await new Promise((t) => setTimeout(t, JEDA_SEBELUM_HASIL_DEMO_MS)); // penonton melihat peta akhir
            await muatPeta(mapelId);
            setTitikMulai((lama) => ({ ...lama, [mapelId]: r.titik_mulai }));
            setMapelBaruSelesai(mapelId);
            const sisa = sisaAntrean.filter((id) => id !== mapelId);
            setAntrean(sisa);
            setDemoBerjalan(false);
            setFase(!demo && sisa.length > 0 ? "ganti_mapel" : "hasil");
          }
          return;
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

  // Mulai/lanjutkan asesmen mapel pertama di antrean.
  const mulai = (demo: boolean, antreanDipakai = antrean) => {
    const mapelId = antreanDipakai[0];
    if (mapelId === undefined) return;
    setModeDemo(demo);
    setDemoBerjalan(demo);
    // Kelas hanya dikirim untuk asesmen baru; asesmen yang sedang berjalan dilanjutkan dengan kelasnya sendiri.
    const kelas = peta[mapelId]?.asesmen_berjalan || kelasPilihan === null ? {} : { kelas_terakhir: kelasPilihan };
    void kirimKeServer({ aksi: "mulai", mapel_id: mapelId, ...kelas }, mapelId, antreanDipakai, demo);
  };

  // Mode demo panggung: satu mapel saja, yaitu mapel pertama di antrean (yang dipilih di Beranda atau yang belum
  // selesai). Jawaban Raka disiapkan untuk Matematika dan Bahasa Indonesia (data/seed_demo_raka.json).
  const mulaiDemo = () => {
    const antreanDemo = (antrean.length > 0 ? antrean : daftarMapel.map((m) => m.mapel_id)).slice(0, 1);
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
      antrean[0],
      antrean,
      false,
    );
  };

  // ---------- Putar otomatis (mode demo) ----------
  useEffect(() => {
    if (fase !== "soal" || !modeDemo || !demoBerjalan || sibuk || !respons?.soal || antrean[0] === undefined) return;
    const t = setTimeout(() => {
      void kirimKeServer({ aksi: "jawab_demo", sesi_id: respons.sesi_id, soal_id: respons.soal!.soal_id }, antrean[0], antrean, true);
    }, JEDA_DEMO_MS);
    return () => clearTimeout(t);
  }, [fase, modeDemo, demoBerjalan, sibuk, respons, antrean, kirimKeServer]);

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
  // Garis langkah terisi dari kiri ke kanan: soal ke-N di sesi ini dari batas soal per sesi.
  const progres =
    sedangMenjawab && respons ? (
      <ProgresLangkah sekarang={respons.nomor_soal} jumlah={respons.jumlah_soal} label={`Soal ${respons.nomor_soal} dari ${respons.jumlah_soal}`} />
    ) : null;

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
          sibuk={sibuk}
          pilihanKelas={daftarKelas(Object.values(peta))}
          kelas={kelasPilihan}
          onPilihKelas={setKelasPilihan}
          melanjutkan={antrean[0] !== undefined && (peta[antrean[0]]?.asesmen_berjalan ?? false)}
          onMulai={() => mulai(false)}
          onMulaiDemo={mulaiDemo}
        />
      )}

      {sedangMenjawab && respons?.soal && (
        <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-center gap-6 sm:mt-10">
          {modeDemo && (
            <PanelDemo
              demo={respons.demo}
              peta={respons.peta}
              tpSekarang={respons.soal.tp_kode}
              jumlahSoal={respons.jumlah_soal_dijawab}
              berjalan={demoBerjalan}
              onJedaLanjut={() => setDemoBerjalan((b) => !b)}
            />
          )}
          {/* key: setiap soal baru mengosongkan pilihan. Mode demo: pilihan dikunci (server yang menjawab). */}
          <KartuSoal
            key={respons.soal.soal_id}
            soal={respons.soal}
            label={mapelSekarang ? `Petualangan Pertama · ${mapelSekarang.nama}` : "Petualangan Pertama"}
            terkunci={modeDemo}
            sibuk={sibuk}
            onKirim={kirimJawaban}
          />
        </div>
      )}

      {fase === "akhir_sesi" && <LayarAkhirSesi jumlahSoal={respons?.jumlah_soal_dijawab ?? 0} sibuk={sibuk} onLanjut={() => mulai(false)} />}

      {fase === "ganti_mapel" && (
        <LayarGantiMapel
          mapelSelesai={namaMapel(mapelBaruSelesai ?? undefined)}
          mapelBerikut={namaMapel(antrean[0])}
          sibuk={sibuk}
          onLanjut={() => mulai(false)}
        />
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
            setAntrean(acak(daftarMapel.map((m) => m.mapel_id)));
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
