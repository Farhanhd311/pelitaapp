// POST /api/asesmen: asesmen adaptif BKT + penelusuran prasyarat (PANDUAN 7.2, PRD 9.3).
// Kontrak: lib/kontrak/asesmen.ts (aksi: mulai | jawab | jawab_demo).
//
// Alur setiap permintaan:
//   1. Pastikan yang memanggil adalah anak yang sedang aktif (rbac). anak_id dari sesi, bukan body.
//   2. Hitung ulang keadaan asesmen dari jawaban tersimpan (putarUlangAsesmen, mesin yang sama dengan tes).
//   3. Untuk jawaban: cek soalnya memang soal berikutnya, lalu setelahJawab() dari lib/bkt.
//   4. Simpan JAWABAN + PROGRES_TP dalam satu transaksi, lalu balas soal berikutnya.
// Respons tidak pernah memberi tahu benar/salah ke anak (umpan balik netral).

import demoRaka from "@/data/seed_demo_raka.json";
import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { mulaiAsesmen, putarUlangAsesmen, setelahJawab, type KeadaanAsesmen } from "@/lib/bkt/engine";
import { denganTransaksi, query } from "@/lib/db";
import {
  ambilJawabanAsesmen,
  ambilKelasTerakhir,
  ambilKurikulum,
  ambilPilihan,
  ambilPilihanUntukDemo,
  ambilTpSoal,
  ambilSesiTerbuka,
  buatSesiAsesmen,
  keadaanKePeta,
  pilihSoalDiagnostik,
  simpanJawaban,
  simpanProgres,
  tutupSesi,
  wajibSesiTerbuka,
  type KurikulumMapel,
  type SesiAsesmen,
} from "@/lib/db/asesmen";
import { wajibModeAnak } from "@/lib/db/rbac";
import { PermintaanAsesmen, type ResponsAsesmen, type StatusAsesmen } from "@/lib/kontrak/asesmen";
import { ambilRiwayatPengaturan, keParameterAsesmen, pilihNilaiPada } from "@/lib/pengaturan";

type ParameterLengkap = ReturnType<typeof keParameterAsesmen>;

// Keadaan asesmen yang sedang berjalan untuk mapel ini. Jika belum ada, atau yang terakhir sudah selesai,
// dibuat putaran baru dari kelasBaru (kelas terakhir anak di sekolah) dengan pengaturan yang berlaku
// saat sesi ini dimulai. Putaran yang sedang berjalan tetap dilanjutkan dengan kelasnya sendiri.
async function putaranSekarang(anakId: number, kurikulum: KurikulumMapel, sesi: SesiAsesmen, kelasBaru: number) {
  const [riwayat, jawaban] = await Promise.all([ambilRiwayatPengaturan(), ambilJawabanAsesmen(anakId, kurikulum.mapel_id)]);
  const paramPada = (waktu: Date): ParameterLengkap => keParameterAsesmen(pilihNilaiPada(riwayat, waktu), kurikulum.mapel_id);

  const putaran = putarUlangAsesmen(kurikulum.graf, jawaban, paramPada);
  const paramSesi = paramPada(sesi.mulai);
  if (putaran && !putaran.keadaan.selesai) {
    return { keadaan: putaran.keadaan, param: putaran.param, soal_dipakai: putaran.soal_dipakai, paramSesi };
  }
  const keadaan: KeadaanAsesmen = mulaiAsesmen(kurikulum.graf, kelasBaru, paramSesi);
  return { keadaan, param: paramSesi, soal_dipakai: [] as string[], paramSesi };
}

function balas(
  sesi: SesiAsesmen,
  kurikulum: KurikulumMapel,
  keadaan: KeadaanAsesmen,
  status: StatusAsesmen,
  soal: ResponsAsesmen["soal"],
  demo: ResponsAsesmen["demo"],
  progres: { nomor_soal: number; jumlah_soal: number },
): Response {
  const respons: ResponsAsesmen = {
    sesi_id: sesi.id,
    status,
    soal,
    jumlah_soal_dijawab: keadaan.jumlah_soal,
    ...progres,
    peta: keadaanKePeta(kurikulum, keadaan),
    titik_mulai: keadaan.titik_mulai,
    demo,
  };
  return Response.json(respons);
}

// ---------- aksi: mulai ----------

async function mulai(anakId: number, mapelId: number, kelasPilihan: number | undefined): Promise<Response> {
  const kurikulum = await ambilKurikulum(mapelId);
  // Kelas terakhir di sekolah yang dipilih di layar; jika kosong, dari profil anak.
  // Pilihan itu juga DISIMPAN ke profil (keputusan tim: halaman daftar tidak menanyakan kelas terakhir,
  // jadi ANAK.kelas_terakhir dan ANAK.kelas_seharusnya diselaraskan dari asesmen). Layar hanya mengirimnya untuk putaran baru.
  if (kelasPilihan !== undefined) {
    await query("UPDATE anak SET kelas_terakhir = ?, kelas_seharusnya = ? WHERE id = ?", [kelasPilihan, kelasPilihan, anakId]);
  }
  const kelasBaru = kelasPilihan ?? (await ambilKelasTerakhir(anakId));

  // Pakai sesi asesmen yang masih terbuka; jika batas soal per sesi sudah tercapai, tutup dan buka yang baru.
  let sesi = await ambilSesiTerbuka(anakId);
  if (sesi) {
    const { paramSesi } = await putaranSekarang(anakId, kurikulum, sesi, kelasBaru);
    if (sesi.jumlah_jawaban >= paramSesi.maks_soal_per_sesi) {
      await denganTransaksi((kueri) => tutupSesi(kueri, sesi!.id));
      sesi = null;
    }
  }
  sesi ??= await buatSesiAsesmen(anakId);

  const { keadaan, soal_dipakai, paramSesi } = await putaranSekarang(anakId, kurikulum, sesi, kelasBaru);
  const soal = await pilihSoalDiagnostik(keadaan.tp_sekarang!, soal_dipakai);
  return balas(sesi, kurikulum, keadaan, "lanjut", soal, null, {
    nomor_soal: sesi.jumlah_jawaban + 1,
    jumlah_soal: paramSesi.maks_soal_per_sesi,
  });
}

// ---------- aksi: jawab / jawab_demo ----------

async function jawab(
  anakId: number,
  minta: Extract<PermintaanAsesmen, { aksi: "jawab" | "jawab_demo" }>,
): Promise<Response> {
  const sesi = await wajibSesiTerbuka(anakId, minta.sesi_id);
  const tpSoal = await ambilTpSoal(minta.soal_id);
  const kurikulum = await ambilKurikulum(tpSoal.mapel_id);
  // Jawaban pertama sebuah putaran: kelasnya = kelas TP soal itu (TP pertama selalu di kelas pilihan anak).
  // Jika soal itu ternyata bukan TP pertama kelas tersebut, pemeriksaan "soal berikutnya" di bawah menolaknya.
  const kelasSoal = kurikulum.graf.tp.get(tpSoal.tp_kode)!.kelas;
  const { keadaan, param, soal_dipakai, paramSesi } = await putaranSekarang(anakId, kurikulum, sesi, kelasSoal);
  const tpSekarang = keadaan.tp_sekarang!;

  // Hanya soal berikutnya yang boleh dijawab (mencegah jawaban ganda atau soal yang dikirim asal).
  const soalBerikutnya = await pilihSoalDiagnostik(tpSekarang, soal_dipakai);
  if (soalBerikutnya.soal_id !== minta.soal_id) {
    throw new GalatApi("BENTROK", "Soal ini sudah dijawab. Muat ulang untuk melanjutkan.");
  }

  // Benar/salah selalu ditentukan server dari PILIHAN.benar.
  let pilihanId: number;
  let benar: boolean;
  if (minta.aksi === "jawab") {
    const pilihan = await ambilPilihan(minta.pilihan_id);
    if (!pilihan || pilihan.soal_id !== minta.soal_id) {
      throw new GalatApi("INPUT_TIDAK_VALID", "Pilihan jawaban tidak cocok dengan soal.");
    }
    pilihanId = pilihan.pilihan_id;
    benar = pilihan.benar;
  } else {
    // Mode demo: yang di-skrip HANYA jawabannya (benar jika TP dikuasai Raka). Sisanya mesin sungguhan.
    benar = demoRaka.tp_dikuasai.includes(tpSekarang);
    pilihanId = await ambilPilihanUntukDemo(minta.soal_id, benar);
  }

  const { keadaan: baru, langkah } = setelahJawab(keadaan, kurikulum.graf, benar, param);
  const jumlahDiSesi = sesi.jumlah_jawaban + 1;
  const status: StatusAsesmen = baru.selesai
    ? "selesai"
    : jumlahDiSesi >= paramSesi.maks_soal_per_sesi
      ? "batas_sesi" // progres tersimpan; panggil `mulai` lagi untuk melanjutkan di sesi baru
      : "lanjut";

  await denganTransaksi(async (kueri) => {
    await simpanJawaban(kueri, {
      sesi_id: sesi.id,
      pilihan_id: pilihanId,
      waktu_respons_ms: minta.aksi === "jawab" ? minta.waktu_respons_ms : null,
    });
    await simpanProgres(kueri, anakId, baru);
    if (status !== "lanjut") await tutupSesi(kueri, sesi.id);
  });

  const soal = status === "lanjut" ? await pilihSoalDiagnostik(baru.tp_sekarang!, [...soal_dipakai, minta.soal_id]) : null;
  const demo = minta.aksi === "jawab_demo" ? langkah : null;
  return balas(sesi, kurikulum, baru, status, soal, demo, {
    nomor_soal: status === "lanjut" ? jumlahDiSesi + 1 : jumlahDiSesi,
    jumlah_soal: paramSesi.maks_soal_per_sesi,
  });
}

export const POST = tanganiApi(async (req: Request) => {
  const { anak_id } = await wajibModeAnak();
  const minta = await bacaBody(req, PermintaanAsesmen);
  return minta.aksi === "mulai" ? mulai(anak_id, minta.mapel_id, minta.kelas_terakhir) : jawab(anak_id, minta);
});
