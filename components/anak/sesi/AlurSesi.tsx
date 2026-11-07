"use client";

// Sesi belajar anak (PANDUAN 7.1-7.4). Layar ini MENGIKUTI `status` dari server (POST /api/sesi):
//   kartu_belajar -> KartuBelajar      kuis -> KartuSoal (+ PanelUmpanBalik setelah menjawab)
//   cek_kuat      -> ModalMasihKuat    selesai / berhenti / santai -> LayarAkhir
// Semua keputusan (soal berikutnya, pembaruan BKT, kapan cek "Masih kuat?") ada di server.
// Catatan alur: respons aksi "jawab" sudah berisi langkah berikutnya. Umpan balik jawaban ditampilkan
// dulu; langkah berikutnya baru dipakai setelah anak menekan "Lanjut".

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { KartuSoal } from "@/components/anak/KartuSoal";
import { MascotPijar } from "@/components/anak/MascotPijar";
import { ModalMasihKuat } from "@/components/anak/ModalMasihKuat";
import { LayarFokus } from "@/components/anak/fokus/LayarFokus";
import { LayarPerluMasuk } from "@/components/anak/fokus/LayarPerluMasuk";
import { ProgresLangkah } from "@/components/anak/fokus/ProgresLangkah";
import { TautanAnak, TombolAnak, TombolBulat } from "@/components/anak/fokus/TombolAnak";
import { butuhMasuk, GalatKlien, panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ResponsCheckinHariIni } from "@/lib/kontrak/checkin";
import type { ResponsBeranda } from "@/lib/kontrak/beranda";
import type { ResponsMapel } from "@/lib/kontrak/peta";
import type { PermintaanSesi, ResponsSesi } from "@/lib/kontrak/sesi";
import type { SoalTampil } from "@/lib/kontrak/umum";
import { KartuBelajar } from "./KartuBelajar";
import { LayarAkhir } from "./LayarAkhir";
import { PanelUmpanBalik } from "./PanelUmpanBalik";
import { denganMapel, HREF_PETA, mapelDariUrl, TP_PILIHAN_SERVER } from "./jalur";

type Keadaan =
  | { jenis: "memuat" }
  | { jenis: "galat"; pesan: string; perluCheckin: boolean }
  | { jenis: "perlu_masuk"; galat: GalatKlien }
  | { jenis: "perlu_asesmen"; mapelId: number }
  | { jenis: "jalan"; sesi: ResponsSesi };
type Umpan = { berikutnya: ResponsSesi; soal: SoalTampil; pilihanId: number };

const STATUS_AKHIR: ResponsSesi["status"][] = ["selesai", "berhenti", "santai"];

export function AlurSesi({ params }: { params: Promise<{ tpKode: string }> }) {
  const { tpKode } = use(params);
  const router = useRouter();
  const [keadaan, setKeadaan] = useState<Keadaan>({ jenis: "memuat" });
  const [umpan, setUmpan] = useState<Umpan | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galatKecil, setGalatKecil] = useState<string | null>(null);
  const [tanyaKeluar, setTanyaKeluar] = useState(false);
  const [tawaranDitutup, setTawaranDitutup] = useState(false);
  const dimulai = useRef(false);
  const mulaiSoal = useRef(0);
  const sesiTuntas = useRef(false);
  const [mapelId, setMapelId] = useState<number | null>(null); // dari ?mapel= (dipilih di Beranda)
  const hrefPeta = denganMapel(HREF_PETA, mapelId);

  // Buka sesi sekali saja (ref ini juga mencegah sesi ganda saat React StrictMode menjalankan efek dua kali).
  useEffect(() => {
    if (dimulai.current) return;
    dimulai.current = true;
    (async () => {
      try {
        // mapel_id tidak ditulis di kode: mapel yang dipilih di Beranda (?mapel=), atau mapel pertama yang punya TP.
        const { mapel } = await panggilApi<ResponsMapel>("/api/mapel");
        if (mapel.length === 0) throw new GalatKlien("TIDAK_DITEMUKAN", "Belum ada pelajaran yang tersedia.");
        const dariUrl = mapelDariUrl();
        const idMapel = mapel.find((m) => m.mapel_id === dariUrl)?.mapel_id ?? mapel[0].mapel_id;
        setMapelId(idMapel);

        // Materi dipilih dari hasil asesmen (PROGRES_TP). Belum asesmen mapel utama, atau mapel adaptif ini ->
        // Petualangan Pertama dulu, kecuali hari istirahat (sesi santai tidak butuh hasil asesmen).
        // Mapel pustaka (IPAS, Pendidikan Pancasila) tidak punya asesmen.
        const [beranda, { checkin }] = await Promise.all([
          panggilApi<ResponsBeranda>(`/api/beranda?mapel_id=${idMapel}`),
          panggilApi<ResponsCheckinHariIni>("/api/checkin"),
        ]);
        if ((!beranda.asesmen_selesai || !beranda.mapel_asesmen_selesai) && checkin && checkin.level !== "istirahat") {
          setKeadaan({ jenis: "perlu_asesmen", mapelId: beranda.asesmen_selesai ? idMapel : mapel[0].mapel_id });
          return;
        }
        const sesi = await panggilApi<ResponsSesi>("/api/sesi", {
          aksi: "mulai",
          mapel_id: idMapel,
          tp_kode: tpKode === TP_PILIHAN_SERVER ? undefined : decodeURIComponent(tpKode),
        });
        setKeadaan({ jenis: "jalan", sesi });
      } catch (e) {
        if (butuhMasuk(e)) return setKeadaan({ jenis: "perlu_masuk", galat: e });
        setKeadaan({ jenis: "galat", pesan: pesanGalat(e), perluCheckin: e instanceof GalatKlien && /check-in/i.test(e.message) });
      }
    })();
  }, [tpKode]);

  // cacheComponents (Next 16) menyimpan halaman yang pernah dibuka di <Activity>: saat anak kembali ke Beranda,
  // efek dibersihkan tetapi state tetap, sehingga layar "Yeay" lama muncul lagi di kunjungan berikutnya.
  // Jika sesi sudah tuntas, kosongkan state saat halaman disembunyikan supaya kunjungan berikutnya membuka sesi baru.
  // (Saat StrictMode menjalankan efek dua kali, sesi belum tuntas, jadi tidak ada sesi ganda.)
  useEffect(() => {
    sesiTuntas.current = keadaan.jenis === "jalan" && STATUS_AKHIR.includes(keadaan.sesi.status);
  }, [keadaan]);
  useEffect(
    () => () => {
      if (!sesiTuntas.current) return;
      sesiTuntas.current = false;
      dimulai.current = false;
      setKeadaan({ jenis: "memuat" });
      setUmpan(null);
      setTanyaKeluar(false);
      setGalatKecil(null);
    },
    [],
  );

  const sesi = keadaan.jenis === "jalan" ? keadaan.sesi : null;
  const soalId = sesi?.soal?.soal_id;

  // Waktu respons dihitung sejak soal tampil (disimpan di JAWABAN, tidak pernah ditampilkan ke anak).
  useEffect(() => {
    mulaiSoal.current = Date.now();
  }, [soalId]);

  async function kirim(body: PermintaanSesi): Promise<ResponsSesi | null> {
    setSibuk(true);
    setGalatKecil(null);
    try {
      return await panggilApi<ResponsSesi>("/api/sesi", body);
    } catch (e) {
      setGalatKecil(pesanGalat(e));
      return null;
    } finally {
      setSibuk(false);
    }
  }

  const terapkan = (berikutnya: ResponsSesi | null) => {
    if (!berikutnya) return;
    setKeadaan({ jenis: "jalan", sesi: berikutnya });
    setTawaranDitutup(false);
  };

  async function jawab(pilihanId: number) {
    if (!sesi?.soal) return;
    const soal = sesi.soal;
    const r = await kirim({
      aksi: "jawab",
      sesi_id: sesi.sesi_id,
      soal_id: soal.soal_id,
      pilihan_id: pilihanId,
      waktu_respons_ms: Date.now() - mulaiSoal.current,
    });
    if (r) setUmpan({ berikutnya: r, soal, pilihanId });
  }

  function lanjutSetelahUmpan() {
    if (!umpan) return;
    terapkan(umpan.berikutnya);
    setUmpan(null);
  }

  async function berhentiSekarang() {
    setTanyaKeluar(false);
    if (!sesi) return;
    terapkan(await kirim({ aksi: "selesai", sesi_id: sesi.sesi_id }));
    setUmpan(null);
  }

  const sedangJalan = sesi !== null && !STATUS_AKHIR.includes(sesi.status);
  const tampilProgres = sesi && (sesi.status === "kuis" || umpan) && sesi.jumlah_soal > 0;
  // Soal yang sedang tampil, sebelum maupun sesudah dijawab (saat umpan balik, sesi masih menunjuk soal ini).
  const soalTampil = umpan?.soal ?? sesi?.soal ?? null;

  return (
    <LayarFokus
      kiri={
        <TombolBulat label={sedangJalan ? "Berhenti dulu" : "Keluar ke Beranda"} onClick={() => (sedangJalan ? setTanyaKeluar(true) : router.push(hrefPeta))}>
          <X className="size-6" />
        </TombolBulat>
      }
      tengah={
        tampilProgres ? (
          // Jatah soal level sudah lewat tetapi materi belum dikuasai: soal tambahan sampai TP tercapai.
          sesi.nomor_soal > sesi.jumlah_soal ? (
            <ChipSoalTambahan sisa={sesi.benar_lagi_untuk_tercapai} />
          ) : (
            <ProgresLangkah
              sekarang={sesi.nomor_soal}
              jumlah={sesi.jumlah_soal}
              label={`Soal ${sesi.nomor_soal} dari ${sesi.jumlah_soal}`}
            />
          )
        ) : null
      }
      kanan={<span className="size-14 shrink-0" aria-hidden />}
    >
      {keadaan.jenis === "memuat" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-teks-2">
          <MascotPijar ekspresi="sambut" ukuran={150} />
          <p className="font-bold">Pijar sedang menyiapkan sesimu…</p>
        </div>
      )}

      {keadaan.jenis === "perlu_masuk" && <LayarPerluMasuk galat={keadaan.galat} />}

      {keadaan.jenis === "perlu_asesmen" && (
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
          <MascotPijar ekspresi="penasaran" gerak="coba_lagi" ukuran={160} />
          <h1 className="mt-3 text-[28px] leading-tight font-extrabold text-balance">Yuk, Petualangan Pertama dulu!</h1>
          <p className="mt-2 text-[16px] leading-relaxed text-teks-2">
            Pijar perlu tahu dulu sampai mana kamu sudah belajar, supaya materinya pas. Ajak pendampingmu menemani, ya.
          </p>
          <div className="mt-7 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <TautanAnak varian="kedua" href={hrefPeta}>
              Nanti saja
            </TautanAnak>
            <TautanAnak href={denganMapel("/anak/asesmen", keadaan.mapelId)} className="sm:min-w-60">
              Mulai Petualangan Pertama
            </TautanAnak>
          </div>
        </div>
      )}

      {keadaan.jenis === "galat" && (
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
          <MascotPijar ekspresi="empati" ukuran={150} />
          <p className="mt-3 text-[22px] font-extrabold">{keadaan.pesan}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <TautanAnak varian="kedua" href={hrefPeta}>
              Kembali ke Beranda
            </TautanAnak>
            {keadaan.perluCheckin ? <TautanAnak href={denganMapel("/anak/checkin", mapelId)}>Check-in dulu</TautanAnak> : <TombolAnak onClick={() => location.reload()}>Coba lagi</TombolAnak>}
          </div>
        </div>
      )}

      {sesi && sesi.status === "kartu_belajar" && (
        <KartuBelajar tp={sesi.tp} kartu={sesi.kartu_belajar} sibuk={sibuk} onLanjut={async () => terapkan(await kirim({ aksi: "kuis", sesi_id: sesi.sesi_id }))} />
      )}

      {sesi && (sesi.status === "kuis" || umpan) && (
        <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-center sm:mt-10">
          {sesi.tawarkan_selesai && !tawaranDitutup && !umpan && (
            <div className="mb-6 flex w-full flex-col items-center gap-3 rounded-[20px] bg-emas/25 p-4 text-center sm:flex-row sm:text-left">
              <MascotPijar ekspresi="senang" ukuran={64} />
              <p className="flex-1 font-bold">{sesi.pesan}</p>
              <div className="flex gap-2">
                <TombolAnak varian="lembut" onClick={() => setTawaranDitutup(true)}>
                  Satu soal lagi
                </TombolAnak>
                <TombolAnak onClick={berhentiSekarang} disabled={sibuk}>
                  Selesai
                </TombolAnak>
              </div>
            </div>
          )}

          {/* Satu KartuSoal yang sama sebelum dan sesudah dijawab: kartu tidak dipasang ulang (animasi masuknya tidak
              diputar lagi), panel umpan balik cukup muncul di bawahnya. Key memuat nomor soal karena soal yang sama
              bisa muncul lagi sebagai soal tambahan. */}
          {soalTampil && (
            <KartuSoal
              key={`${soalTampil.soal_id}-${sesi.nomor_soal}`}
              soal={soalTampil}
              label={labelIsi(sesi)}
              terkunci={umpan !== null}
              pilihanAwal={umpan?.pilihanId ?? null}
              sibuk={sibuk}
              onKirim={jawab}
            />
          )}
          {umpan?.berikutnya.umpan_balik && (
            <PanelUmpanBalik
              umpan={umpan.berikutnya.umpan_balik}
              sesiId={sesi.sesi_id}
              soalId={umpan.soal.soal_id}
              pilihanId={umpan.pilihanId}
              onLanjut={lanjutSetelahUmpan}
            />
          )}
        </div>
      )}

      {sesi && !umpan && sesi.status === "cek_kuat" && (
        <>
          <div className="flex flex-1 items-center justify-center">
            <MascotPijar ekspresi="tenang" ukuran={160} />
          </div>
          <ModalMasihKuat
            alasan={sesi.alasan_cek_kuat}
            sibuk={sibuk}
            onPilih={async (pilihan) => terapkan(await kirim({ aksi: "masih_kuat", sesi_id: sesi.sesi_id, pilihan }))}
          />
        </>
      )}

      {sesi && !umpan && STATUS_AKHIR.includes(sesi.status) && <LayarAkhir sesi={sesi} hrefPeta={hrefPeta} />}

      {galatKecil && (
        <p role="alert" className="mx-auto mt-6 max-w-xl rounded-2xl bg-emas/25 px-4 py-3 text-center font-semibold">
          {galatKecil}
        </p>
      )}

      {tanyaKeluar && <DialogBerhenti onLanjut={() => setTanyaKeluar(false)} onBerhenti={berhentiSekarang} sibuk={sibuk} />}
    </LayarFokus>
  );
}

const labelIsi = (sesi: ResponsSesi) => (sesi.jenis_isi === "ulang" ? "Mengulang materi" : "Materi baru");

// Konfirmasi lembut sebelum keluar di tengah sesi. Berhenti tidak dihitung gagal; progres tersimpan.
function DialogBerhenti({ onLanjut, onBerhenti, sibuk }: { onLanjut: () => void; onBerhenti: () => void; sibuk: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-teks/40 p-3 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="judul-berhenti" className="w-full max-w-md rounded-[28px] bg-krem p-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <MascotPijar ekspresi="peduli" ukuran={110} />
        </div>
        <h2 id="judul-berhenti" className="mt-2 text-[26px] font-extrabold">
          Mau berhenti dulu?
        </h2>
        <p className="mt-1 text-[16px] text-teks-2">Jawabanmu sudah tersimpan. Kamu bisa lanjut lain kali.</p>
        <div className="mt-6 flex flex-col gap-3">
          <TombolAnak onClick={onLanjut} autoFocus>
            Lanjut belajar
          </TombolAnak>
          <TombolAnak varian="kedua" onClick={onBerhenti} disabled={sibuk}>
            Ya, berhenti dulu
          </TombolAnak>
        </div>
      </div>
    </div>
  );
}

// Penanda soal tambahan: berapa jawaban benar lagi sampai pos berikutnya terbuka. Bukan angka peluang
// dan bukan hitung mundur waktu (PANDUAN 7.2, 13).
function ChipSoalTambahan({ sisa }: { sisa: number | null }) {
  const teks = sisa ? `Tinggal ${sisa} jawaban benar lagi untuk membuka pos berikutnya` : "Sedikit lagi menuju pos berikutnya";
  return (
    <p
      role="status"
      className="mx-auto flex w-fit max-w-md items-center gap-2 rounded-full bg-emas/30 px-4 py-2 text-center font-heading text-[14px] leading-tight font-extrabold text-teks"
    >
      <Sparkles className="size-4 shrink-0 text-bata" aria-hidden />
      <span>
        Soal tambahan · <span className="font-bold">{teks}</span>
      </span>
    </p>
  );
}
