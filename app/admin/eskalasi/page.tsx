"use client";

// Antrean rujukan & eskalasi (PANDUAN 8.2, 8.7). Kasus darurat dari deteksi krisis masuk tanpa menunggu izin.
// Petugas menandai "ditangani" + catatan tindak lanjut, dan menandai alarm palsu bila perlu.
// Isi cerita anak TIDAK ditampilkan (transkrip tidak disimpan di MVP); hanya kategori dan level.

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chip, formatWaktu, JudulHalaman, KELAS_DIALOG, KELAS_INPUT, KELAS_KAKI_DIALOG, Kosong, KotakGalat, Memuat, TombolAdmin, useDataAdmin } from "@/components/admin/dasar";
import { useAdmin } from "@/components/admin/konteks";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ItemEskalasi, PermintaanEskalasi, ResponsEskalasi } from "@/lib/kontrak/admin";

const LABEL_STATUS: Record<string, string> = {
  eskalasi: "Darurat, perlu segera",
  menunggu_persetujuan: "Menunggu persetujuan orang tua",
  disetujui: "Disetujui, perlu ditindaklanjuti",
  ditolak: "Ditolak orang tua",
  ditangani: "Sudah ditangani",
};

// Yang bisa ditindak admin: kasus darurat dan rujukan yang sudah disetujui orang tua/wali.
// Sisanya (menunggu orang tua, sudah ditangani, ditolak) hanya informasi, jadi dilipat di "Riwayat".
const PERLU_DITANGANI = ["eskalasi", "disetujui"];

export default function Halaman() {
  const { data, galat, memuat, muatUlang } = useDataAdmin<ResponsEskalasi>("/api/admin/eskalasi");
  const { beriTahu } = useAdmin();
  const [tangani, setTangani] = useState<ItemEskalasi | null>(null);

  return (
    <>
      <JudulHalaman
        label="Dukungan anak"
        judul="Eskalasi & Rujukan"
        keterangan="Kasus darurat dari deteksi krisis masuk langsung tanpa menunggu izin. Rujukan level 1-3 masuk setelah disetujui orang tua/wali. Isi percakapan anak tidak pernah ditampilkan."
      />
      <KotakGalat pesan={galat} />
      {memuat && !data && <Memuat />}
      {data && data.antrean.length === 0 && <Kosong teks="Belum ada rujukan atau eskalasi. Kasus dari Teman Cerita akan muncul di sini." />}

      {data && data.antrean.length > 0 && (
        <EskalasiTerkelompok antrean={data.antrean} onTangani={setTangani} />
      )}

      {tangani && (
        <DialogTangani
          item={tangani}
          onTutup={() => setTangani(null)}
          onTersimpan={() => {
            beriTahu(`Rujukan ${tangani.nama_panggilan} ditandai sudah ditangani.`);
            setTangani(null);
            muatUlang();
          }}
        />
      )}
    </>
  );
}

function EskalasiTerkelompok({ antrean, onTangani }: { antrean: ItemEskalasi[]; onTangani: (e: ItemEskalasi) => void }) {
  const urut = [...antrean].sort((x, y) => Number(y.darurat) - Number(x.darurat));
  const perlu = urut.filter((e) => PERLU_DITANGANI.includes(e.status));
  const riwayat = urut.filter((e) => !PERLU_DITANGANI.includes(e.status));
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
          Perlu ditangani
          <span className={`rounded-full px-2 text-xs ${perlu.length > 0 ? "bg-emas" : "bg-pasir-muda"}`}>{perlu.length}</span>
        </h2>
        {perlu.length === 0 ? (
          <Kosong teks="Tidak ada kasus yang perlu ditangani sekarang." />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {perlu.map((e) => (
              <KartuEskalasi key={e.rujukan_id} e={e} onTangani={() => onTangani(e)} />
            ))}
          </ul>
        )}
      </section>
      {riwayat.length > 0 && (
        <details className="group rounded-[20px] border border-garis bg-white">
          <summary className="cursor-pointer list-none rounded-[20px] p-5 font-extrabold hover:bg-pasir-muda/40 [&::-webkit-details-marker]:hidden">
            Riwayat <span className="text-sm font-semibold text-teks-2">· {riwayat.length} (menunggu orang tua atau sudah selesai)</span>
          </summary>
          <ul className="flex flex-col gap-2.5 px-5 pb-5">
            {riwayat.map((e) => (
              <KartuEskalasi key={e.rujukan_id} e={e} onTangani={() => onTangani(e)} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function KartuEskalasi({ e, onTangani }: { e: ItemEskalasi; onTangani: () => void }) {
  const bisaDitangani = e.status === "eskalasi" || e.status === "disetujui";
  return (
    <li className={`rounded-2xl border bg-white p-4 ${e.darurat && bisaDitangani ? "border-emas border-l-4" : "border-garis"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-extrabold">{e.nama_panggilan}</p>
        {e.darurat && <Chip warna="emas">Darurat</Chip>}
        {e.level !== null && <Chip warna="pasir">Level {e.level}</Chip>}
        <Chip warna={e.status === "ditangani" ? "hijau" : "abu"}>{LABEL_STATUS[e.status] ?? e.status}</Chip>
        {e.alarm_palsu && <Chip warna="abu">Alarm palsu</Chip>}
        <span className="ml-auto text-xs text-teks-2">{formatWaktu(e.waktu)}</span>
      </div>
      <p className="mt-1 text-sm text-teks-2">
        Layanan tujuan: {e.layanan ?? "-"}
        {e.tindak_lanjut_pada && <> · jadwal tindak lanjut: {formatWaktu(e.tindak_lanjut_pada)}</>}
      </p>
      {e.catatan_tindak_lanjut && <p className="mt-1 text-sm">Catatan: {e.catatan_tindak_lanjut}</p>}
      {bisaDitangani && (
        <TombolAdmin ukuran="kecil" className="mt-3" onClick={onTangani}>
          Tandai ditangani
        </TombolAdmin>
      )}
    </li>
  );
}

function DialogTangani({ item, onTutup, onTersimpan }: { item: ItemEskalasi; onTutup: () => void; onTersimpan: () => void }) {
  const [catatan, setCatatan] = useState("");
  const [alarmPalsu, setAlarmPalsu] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan() {
    setSibuk(true);
    setGalat(null);
    try {
      const minta: PermintaanEskalasi = { rujukan_id: item.rujukan_id, alarm_palsu: alarmPalsu, catatan };
      await panggilApi<ResponsEskalasi>("/api/admin/eskalasi", minta);
      onTersimpan();
    } catch (g) {
      setGalat(pesanGalat(g));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <Dialog open onOpenChange={(b) => !b && onTutup()}>
      <DialogContent className={`${KELAS_DIALOG} sm:max-w-md`}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-extrabold">Tindak lanjut: {item.nama_panggilan}</DialogTitle>
          <DialogDescription className="text-teks-2">Catatan tidak disalin ke log aktivitas (bisa berisi hal pribadi).</DialogDescription>
        </DialogHeader>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Catatan tindak lanjut
          <textarea className={`${KELAS_INPUT} min-h-24`} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: sudah dihubungi relawan, dijadwalkan sesi cerita Kamis." />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={alarmPalsu} onChange={(e) => setAlarmPalsu(e.target.checked)} />
          <span>
            <b>Alarm palsu</b>: setelah dicek, anak tidak dalam bahaya. (Tetap lebih baik daripada kasus terlewat.)
          </span>
        </label>
        {galat && <p className="rounded-lg bg-emas/20 px-3 py-2 text-sm font-semibold">{galat}</p>}
        <DialogFooter className={KELAS_KAKI_DIALOG}>
          <TombolAdmin varian="kedua" onClick={onTutup}>
            Batal
          </TombolAdmin>
          <TombolAdmin disabled={sibuk || catatan.trim().length < 3} onClick={simpan}>
            {sibuk ? "Menyimpan…" : "Simpan"}
          </TombolAdmin>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
