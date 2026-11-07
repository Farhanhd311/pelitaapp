"use client";

// Halaman Dashboard Pendamping (PRD 9.8 A7).
// Menampilkan ringkasan minggu ini, kartu perhatian amber, keputusan rujukan menunggu,
// tren check-in kesehatan 28 hari, progres capaian TP, dan pengaturan konteks kesehatan.

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { HeaderPendamping } from "@/components/pendamping/HeaderPendamping";
import { KartuPerluPerhatian } from "@/components/pendamping/KartuPerluPerhatian";
import { DaftarKeputusanMenunggu } from "@/components/pendamping/DaftarKeputusanMenunggu";
import { MetrikAktivitasMingguan } from "@/components/pendamping/MetrikAktivitasMingguan";
import { GrafikTrenCheckin } from "@/components/pendamping/GrafikTrenCheckin";
import { PetaProgresTp } from "@/components/pendamping/PetaProgresTp";
import { PengaturanKesehatanAnak } from "@/components/pendamping/PengaturanKesehatanAnak";
import { GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsDashboard } from "@/lib/kontrak/pendamping";
import type { ResponsProfil } from "@/lib/kontrak/auth";

export default function HalamanDashboardPendamping() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profilUser, setProfilUser] = useState<ResponsProfil | null>(null);
  const [dataDashboard, setDataDashboard] = useState<ResponsDashboard | null>(null);
  const [anakIdTerpilih, setAnakIdTerpilih] = useState<number | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  // 1. Muat data profil user untuk daftar anak binaan
  useEffect(() => {
    panggilApi<ResponsProfil>("/api/auth/profil")
      .then((p) => {
        setProfilUser(p);
        const queryId = searchParams.get("anak_id");
        const idDefault = queryId
          ? Number(queryId)
          : p.anak_aktif?.anak_id ?? p.daftar_anak[0]?.anak_id ?? null;
        setAnakIdTerpilih(idDefault);
      })
      .catch((e) => {
        if (e instanceof GalatKlien && (e.kode === "BELUM_LOGIN" || e.kode === "TIDAK_BERHAK")) {
          router.replace("/pilih-profil");
        } else {
          setGalat(pesanGalat(e));
          setMemuat(false);
        }
      });
  }, [router, searchParams]);

  // 2. Muat data dashboard spesifik untuk anak yang dipilih
  const muatDataDashboard = useCallback(async (id: number) => {
    setMemuat(true);
    setGalat(null);
    try {
      const data = await panggilApi<ResponsDashboard>(
        `/api/pendamping/dashboard?anak_id=${id}`,
      );
      setDataDashboard(data);
    } catch (e) {
      if (e instanceof GalatKlien && (e.kode === "BELUM_LOGIN" || e.kode === "TIDAK_BERHAK")) {
        router.replace("/pilih-profil");
      } else {
        setGalat(pesanGalat(e));
      }
    } finally {
      setMemuat(false);
    }
  }, [router]);

  useEffect(() => {
    if (anakIdTerpilih) {
      void muatDataDashboard(anakIdTerpilih);
    }
  }, [anakIdTerpilih, muatDataDashboard]);

  function gantiAnak(id: number) {
    setAnakIdTerpilih(id);
    router.replace(`/pendamping/dashboard?anak_id=${id}`);
  }

  if (memuat && !dataDashboard) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FCEBD4] p-4 text-teks">
        <Loader2 className="size-10 animate-spin text-bata" />
        <p className="mt-3 font-heading text-sm font-extrabold text-teks">
          Menyiapkan Dashboard Pendamping…
        </p>
      </div>
    );
  }

  const bisaMengubah =
    dataDashboard?.hubungan === "orang_tua" || dataDashboard?.hubungan === "wali";

  return (
    <div className="min-h-dvh bg-[#FCEBD4] text-teks pb-16">
      {/* Header Sticky */}
      <HeaderPendamping
        namaPendamping={profilUser?.nama ?? "Pendamping"}
        hubungan={dataDashboard?.hubungan ?? "orang_tua"}
        daftarAnak={profilUser?.daftar_anak ?? []}
        anakAktifId={anakIdTerpilih ?? 0}
        onGantiAnak={gantiAnak}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 space-y-6">
        {galat && (
          <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 flex items-center justify-between">
            <span>{galat}</span>
            <button
              type="button"
              onClick={() => anakIdTerpilih && muatDataDashboard(anakIdTerpilih)}
              className="flex items-center gap-1 text-bata hover:underline"
            >
              <RefreshCw className="size-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {dataDashboard && (
          <>
            {/* 1. Kartu Perhatian (Amber Alert - F-DASH-2) */}
            <KartuPerluPerhatian daftar={dataDashboard.perlu_perhatian} />

            {/* 2. Keputusan Menunggu Persetujuan (F-DASH-4 & F-TC-6) */}
            {dataDashboard.keputusan_menunggu.length > 0 && (
              <DaftarKeputusanMenunggu
                daftarAwal={dataDashboard.keputusan_menunggu}
                onKeputusanDiperbarui={() => anakIdTerpilih && muatDataDashboard(anakIdTerpilih)}
              />
            )}

            {/* 3. Ringkasan Aktivitas Minggu Ini (F-DASH-1) */}
            <MetrikAktivitasMingguan mingguIni={dataDashboard.minggu_ini} />

            {/* 4. Grid 2 Kolom: Tren Check-in & Konteks Kesehatan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <GrafikTrenCheckin riwayat={dataDashboard.tren_checkin} />
              </div>
              <div className="lg:col-span-5">
                <PengaturanKesehatanAnak
                  anak={dataDashboard.anak}
                  bisaMengubah={bisaMengubah}
                  onDiperbarui={() => anakIdTerpilih && muatDataDashboard(anakIdTerpilih)}
                />
              </div>
            </div>

            {/* 5. Peta Progres Capaian TP (F-DASH-3) */}
            <PetaProgresTp
              daftarMapel={dataDashboard.progres}
              anakId={dataDashboard.anak.anak_id}
            />
          </>
        )}
      </main>
    </div>
  );
}
