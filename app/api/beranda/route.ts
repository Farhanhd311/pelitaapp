// GET /api/beranda?mapel_id=1: peta petualangan (tetap) satu mapel sesuai hasil penempatan. Mode anak.
// Kontrak: lib/kontrak/beranda.ts. mapel_id opsional; default mapel utama (mapel pertama yang punya TP).
//   Mapel dengan TP di database dan asesmen selesai -> Pos Dasar, Kelasku, Pos tambahan (lib/peta/jalur-materi.ts).
//   Mapel tanpa penempatan (pustaka, atau belum diimpor/diasesmen) -> materi Kelasku saja.
// Materi dibaca dari tabel materi (migrasi 0001). Daftar mapel + jenisnya (adaptif/pustaka) tetap dari file data.
// Pos bertombol play = TP rekomendasi susunPeta, sama dengan yang dibuka sesi belajar "hari ini".

import { z } from "zod";
import dataMateri from "@/data/data_materi_per_kelas_SD.json";
import { GalatApi, tanganiApi } from "@/lib/api/respons";
import { cariLeluhur } from "@/lib/bkt/graph";
import { susunPeta, type StatusPeta } from "@/lib/bkt/peta";
import {
  ambilAnak,
  ambilDaftarMapel,
  ambilProgres,
  ambilRiwayatCheckin,
  ambilTpMapel,
  geserTanggal,
  tanggalLokal,
  type ProfilAnakLengkap,
} from "@/lib/db/anak";
import { ambilKurikulum, ambilTpBerkonten, statusAsesmen } from "@/lib/db/asesmen";
import { ambilMateriMapel } from "@/lib/db/materi";
import { wajibModeAnak } from "@/lib/db/rbac";
import { ambilTpPernahDilatih, hitungSisaBenar } from "@/lib/db/sesi-belajar";
import type { MapelBeranda, ResponsBeranda } from "@/lib/kontrak/beranda";
import { ambilPengaturanAktif, keParameterSesi } from "@/lib/pengaturan";
import { susunJalurMateri, type JalurMateri } from "@/lib/peta/jalur-materi";

const Kueri = z.object({ mapel_id: z.coerce.number().int().optional() });

type Penempatan = {
  progres: Map<string, { status: StatusPeta; p_menguasai?: number | null }>;
  rekomendasi_tp: string | null;
  asesmen_selesai: boolean;
  tp_wajib: Set<string>; // TP kelas bawah yang harus dikuasai dulu (prasyarat Kelasku), untuk urutan Pos Dasar
  urutan_tp: Map<string, number>; // urutan belajar TP (sesuai graf prasyarat), untuk urutan pos di peta
  tp_dilatih: Set<string>; // TP yang pernah dijawab di sesi belajar
};

const TANPA_PENEMPATAN: Penempatan = {
  progres: new Map(),
  rekomendasi_tp: null,
  asesmen_selesai: false,
  tp_wajib: new Set(),
  urutan_tp: new Map(),
  tp_dilatih: new Set(),
};

// Hasil penempatan satu mapel yang punya TP di database (sama seperti GET /api/peta).
// Mapel pustaka tidak punya asesmen penempatan (PANDUAN 10): dianggap sudah ditempatkan di materi kelasnya.
async function penempatan(anak: ProfilAnakLengkap, mapelId: number, pustaka = false): Promise<Penempatan> {
  const [kurikulum, daftarTp, progres, berkonten, tpDilatih] = await Promise.all([
    ambilKurikulum(mapelId),
    ambilTpMapel(mapelId),
    ambilProgres(anak.id, mapelId),
    ambilTpBerkonten(mapelId),
    ambilTpPernahDilatih(anak.id),
  ]);
  const peta = susunPeta({
    daftar_tp: daftarTp,
    graf: kurikulum.graf,
    progres,
    kelas_seharusnya: anak.kelas_seharusnya,
    fase_intensif: anak.fase_pengobatan === "intensif",
    tp_dengan_konten: berkonten,
  });
  // TP wajib = leluhur semua TP Kelasku menurut susunPeta. Jika data TP berhenti di bawah kelas seharusnya
  // (misalnya anak kelas 5, TP hanya sampai kelas 4), TP Kelasku versi susunPeta juga wajib.
  const tpKelasku = daftarTp.filter((t) => t.kelas === peta.kelas_kelasku).map((t) => t.kode);
  const tpWajib = new Set(tpKelasku.flatMap((kode) => [...cariLeluhur(kurikulum.graf, kode)]));
  if (peta.kelas_kelasku < anak.kelas_seharusnya) for (const kode of tpKelasku) tpWajib.add(kode);
  return {
    progres,
    rekomendasi_tp: peta.rekomendasi_tp,
    asesmen_selesai: pustaka || (await statusAsesmen(anak.id, kurikulum)).pernah_selesai,
    tp_wajib: tpWajib,
    urutan_tp: new Map(daftarTp.map((t) => [t.kode, t.urutan])),
    tp_dilatih: tpDilatih,
  };
}

// Sisa jawaban benar sampai TP tercapai, memakai aturan sesi yang sama dengan POST /api/sesi.
async function sisaJawabanBenar(anakId: number, tpKode: string, p: number | null | undefined): Promise<number> {
  return hitungSisaBenar(anakId, tpKode, p, keParameterSesi(await ambilPengaturanAktif()));
}

// Hari aktif minggu ini: tanggal berbeda yang punya check-in sejak Senin (waktu anak). Hari istirahat yang
// dilaporkan lewat check-in tetap dihitung, dan tidak ada streak yang bisa putus (PANDUAN 7.1).
async function hariAktifMingguIni(anakId: number): Promise<number> {
  const hariIni = tanggalLokal();
  const hariKe = (new Date(`${hariIni}T00:00:00Z`).getUTCDay() + 6) % 7; // Senin = 0 ... Minggu = 6
  const riwayat = await ambilRiwayatCheckin(anakId, geserTanggal(hariIni, -hariKe));
  return new Set(riwayat.map((c) => c.tanggal)).size;
}

export const GET = tanganiApi(async (req: Request) => {
  const { anak_id } = await wajibModeAnak();
  const kueri = Kueri.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!kueri.success) throw new GalatApi("INPUT_TIDAK_VALID", "mapel_id harus berupa angka.");

  const [daftarMapelDb, anak] = await Promise.all([ambilDaftarMapel(), ambilAnak(anak_id)]);
  const mapelUtama = daftarMapelDb[0];
  if (!mapelUtama) throw new GalatApi("TIDAK_DITEMUKAN", "Belum ada mata pelajaran.");

  const daftarMapel: MapelBeranda[] = dataMateri.mapel.map((m) => ({
    mapel_id: m.id,
    nama: m.nama,
    jenis: m.jenis === "pustaka" ? "pustaka" : "adaptif",
    bisa_belajar: daftarMapelDb.some((d) => d.mapel_id === m.id),
  }));
  const idDipilih = kueri.data.mapel_id ?? mapelUtama.mapel_id;
  const mapel = daftarMapel.find((m) => m.mapel_id === idDipilih);
  if (!mapel) throw new GalatApi("TIDAK_DITEMUKAN", "Mata pelajaran tidak ditemukan.");

  // Asesmen penempatan mapel utama menentukan apakah anak sudah boleh memilih mapel.
  const [utama, hariAktif] = await Promise.all([penempatan(anak, mapelUtama.mapel_id), hariAktifMingguIni(anak.id)]);
  const p =
    mapel.mapel_id === mapelUtama.mapel_id
      ? utama
      : mapel.bisa_belajar
        ? await penempatan(anak, mapel.mapel_id, mapel.jenis === "pustaka")
        : TANPA_PENEMPATAN;

  const jalur = susunJalurMateri({
    materi: await ambilMateriMapel(mapel.mapel_id), // dari tabel materi (bisa disunting admin)
    progres: p.progres,
    kelas_seharusnya: anak.kelas_seharusnya,
    fase_intensif: anak.fase_pengobatan === "intensif",
    rekomendasi_tp: p.rekomendasi_tp,
    tp_wajib: p.tp_wajib,
    urutan_tp: p.urutan_tp,
    tp_dilatih: p.tp_dilatih,
  });
  // Tanpa penempatan, Pos Dasar belum diketahui: peta berisi materi Kelasku saja, dari awal sampai akhir.
  const kelasku = jalur.pos.filter((pos) => pos.bagian === "kelasku");
  const jalurKelasku: JalurMateri = { pos: kelasku, indeks_sekarang: kelasku.length > 0 ? 0 : null };

  const rekomendasi = p.rekomendasi_tp;
  const sudahDilatih = rekomendasi !== null && p.tp_dilatih.has(rekomendasi);

  const respons: ResponsBeranda = {
    anak_id: anak.id,
    nama_anak: anak.nama_panggilan,
    kelas_seharusnya: anak.kelas_seharusnya,
    daftar_mapel: daftarMapel,
    mapel,
    asesmen_selesai: utama.asesmen_selesai,
    mapel_asesmen_selesai: p.asesmen_selesai,
    // Sudah dilatih tetapi belum tercapai: UI menjelaskan bahwa pos berikutnya terbuka setelah pos ini dikuasai.
    sekarang_dilatih: sudahDilatih,
    benar_lagi: sudahDilatih ? await sisaJawabanBenar(anak.id, rekomendasi, p.progres.get(rekomendasi)?.p_menguasai) : null,
    hari_aktif_minggu_ini: hariAktif,
    jalur: p.asesmen_selesai ? jalur : jalurKelasku,
  };
  return Response.json(respons);
});
