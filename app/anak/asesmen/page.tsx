"use client";

// Asesmen adaptif "Petualangan Pertama" (PANDUAN 5 A3, 7.2). Mode anak.
// Halaman ini hanya mengatur LAYAR; keputusan BKT (soal berikutnya, peluang, titik mulai) dihitung server
// di POST /api/asesmen dengan mesin lib/bkt. Kontrak data: lib/kontrak/asesmen.ts.
// Tampilan memakai komponen yang sama dengan check-in dan sesi belajar: LayarFokus, ProgresLangkah, KartuSoal.
//
// Alur layar: pembuka -> soal (berulang) -> akhir_sesi (batas soal per sesi) | hasil
// Mode demo "putar otomatis": server yang menjawab sebagai Raka (aksi jawab_demo) setiap JEDA_DEMO_MS.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { KartuSoal } from "@/components/anak/KartuSoal";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { DialogBerhentiAsesmen, KilasanLanjut, LayarAkhirSesi, LayarPembuka } from "@/components/anak/asesmen/LayarAsesmen";
import { LayarHasil } from "@/components/anak/asesmen/LayarHasil";
import { PanelDemo } from "@/components/anak/asesmen/PanelDemo";
import { LayarFokus } from "@/components/anak/fokus/LayarFokus";
import { LayarPerluMasuk } from "@/components/anak/fokus/LayarPerluMasuk";
import { ProgresLangkah } from "@/components/anak/fokus/ProgresLangkah";
import { TautanAnak, TombolBulat } from "@/components/anak/fokus/TombolAnak";
import { butuhMasuk, GalatKlien, panggilApi, pesanGalat as teksGalat } from "@/lib/api/klien";
import type { PermintaanAsesmen, ResponsAsesmen } from "@/lib/kontrak/asesmen";
import type { ResponsProfil } from "@/lib/kontrak/auth";
import type { ResponsMapel, ResponsPeta } from "@/lib/kontrak/peta";
import { denganMapel, HREF_PETA, mapelDariUrl } from "@/components/anak/sesi/jalur";

// Tempo tampilan (bukan aturan bisnis): demo ±1,5 detik per soal (PANDUAN 5 A3), kilasan "Oke, lanjut!".
const JEDA_DEMO_MS = 1500;
const LAMA_KILASAN_MS = 900;
const JEDA_SEBELUM_HASIL_DEMO_MS = 1800;

type Fase = "memuat" | "pembuka" | "soal" | "akhir_sesi" | "hasil" | "galat";

export default function HalamanAsesmen() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("memuat");
  const [mapelId, setMapelId] = useState<number | null>(null);
  const [namaMapel, setNamaMapel] = useState<string | null>(null);
  const [namaAnak, setNamaAnak] = useState<string | null>(null);
  const [respons, setRespons] = useState<ResponsAsesmen | null>(null);
  const [peta, setPeta] = useState<ResponsPeta | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [kilasan, setKilasan] = useState(false);
  const [modeDemo, setModeDemo] = useState(false);
  const [demoBerjalan, setDemoBerjalan] = useState(false);
  const [tanyaBerhenti, setTanyaBerhenti] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [galatMasuk, setGalatMasuk] = useState<GalatKlien | null>(null); // belum login / belum pilih profil anak
  const mulaiSoal = useRef(0); // untuk waktu_respons_ms

  const tanganiGalat = useCallback((g: unknown) => {
    setPesanGalat(teksGalat(g));
    if (butuhMasuk(g)) {
      setGalatMasuk(g);
      setFase("galat");
    }
  }, []);

  // ---------- Muat awal: mapel, nama anak, dan apakah asesmen sudah pernah selesai ----------
  useEffect(() => {
    (async () => {
      try {
        const [{ mapel }, profil] = await Promise.all([
          panggilApi<ResponsMapel>("/api/mapel"),
          panggilApi<ResponsProfil>("/api/auth/profil"),
        ]);
        if (mapel.length === 0) throw new GalatKlien("TIDAK_DITEMUKAN", "Belum ada mata pelajaran.");
        // Penempatan per mapel (PANDUAN 7.2): mapel dari ?mapel= (dipilih di Beranda), atau mapel pertama yang punya TP.
        const dariUrl = mapelDariUrl();
        const dipilih = mapel.find((m) => m.mapel_id === dariUrl) ?? mapel[0];
        setMapelId(dipilih.mapel_id);
        setNamaMapel(dipilih.nama);
        setNamaAnak(profil.anak_aktif?.nama_panggilan ?? null);
        const p = await panggilApi<ResponsPeta>(`/api/peta?mapel_id=${dipilih.mapel_id}`);
        setPeta(p);
        setFase(p.asesmen_selesai ? "hasil" : "pembuka");
      } catch (g) {
        tanganiGalat(g);
        setFase("galat");
      }
    })();
  }, [tanganiGalat]);

  // ---------- Panggil API asesmen dan pindah layar sesuai status ----------
  const kirimKeServer = useCallback(
    async (minta: PermintaanAsesmen, demo: boolean) => {
      if (!mapelId) return;
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
            if (demo) await new Promise((t) => setTimeout(t, JEDA_SEBELUM_HASIL_DEMO_MS)); // penonton melihat peta akhir
            setPeta(await panggilApi<ResponsPeta>(`/api/peta?mapel_id=${mapelId}`));
            setDemoBerjalan(false);
            setFase("hasil");
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
    [mapelId, tanganiGalat],
  );

  const mulai = (demo: boolean) => {
    if (!mapelId) return;
    setModeDemo(demo);
    setDemoBerjalan(demo);
    void kirimKeServer({ aksi: "mulai", mapel_id: mapelId }, demo);
  };

  const kirimJawaban = (pilihanId: number) => {
    if (!respons?.soal) return;
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
      false,
    );
  };

  // ---------- Putar otomatis (mode demo) ----------
  useEffect(() => {
    if (fase !== "soal" || !modeDemo || !demoBerjalan || sibuk || !respons?.soal) return;
    const t = setTimeout(() => {
      void kirimKeServer({ aksi: "jawab_demo", sesi_id: respons.sesi_id, soal_id: respons.soal!.soal_id }, true);
    }, JEDA_DEMO_MS);
    return () => clearTimeout(t);
  }, [fase, modeDemo, demoBerjalan, sibuk, respons, kirimKeServer]);

  // ---------- Tampilan ----------
  const hrefPeta = denganMapel(HREF_PETA, mapelId);
  const sedangMenjawab = fase === "soal" && respons?.soal;
  const tombolKiri = (
    <TombolBulat
      label={sedangMenjawab ? "Istirahat dulu" : "Keluar ke Beranda"}
      onClick={() => {
        if (!sedangMenjawab) return router.push(hrefPeta);
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
            <TautanAnak varian="kedua" href={hrefPeta} className="mt-6">
              Kembali ke Beranda
            </TautanAnak>
          </div>
        ))}

      {fase === "pembuka" && <LayarPembuka namaAnak={namaAnak} namaMapel={namaMapel} hrefPeta={hrefPeta} sibuk={sibuk} onMulai={() => mulai(false)} onMulaiDemo={() => mulai(true)} />}

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
          <KartuSoal key={respons.soal.soal_id} soal={respons.soal} label={namaMapel ? `Petualangan Pertama · ${namaMapel}` : "Petualangan Pertama"} terkunci={modeDemo} sibuk={sibuk} onKirim={kirimJawaban} />
        </div>
      )}

      {fase === "akhir_sesi" && <LayarAkhirSesi jumlahSoal={respons?.jumlah_soal_dijawab ?? 0} hrefPeta={hrefPeta} sibuk={sibuk} onLanjut={() => mulai(false)} />}

      {fase === "hasil" && peta && <LayarHasil peta={peta} titikMulai={respons?.titik_mulai ?? null} hrefPeta={hrefPeta} onUlangi={() => setFase("pembuka")} />}

      {pesanGalat && fase !== "galat" && (
        <p role="alert" className="mx-auto mt-6 max-w-xl rounded-2xl bg-emas/25 px-4 py-3 text-center font-semibold">
          {pesanGalat}
        </p>
      )}

      <KilasanLanjut tampil={kilasan} />
      {tanyaBerhenti && <DialogBerhentiAsesmen hrefPeta={hrefPeta} onLanjut={() => setTanyaBerhenti(false)} />}
    </LayarFokus>
  );
}
