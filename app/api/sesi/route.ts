// POST /api/sesi: sesi belajar harian (PANDUAN 7.1-7.4, PRD 9.5-9.6). Mode anak.
// Kontrak: lib/kontrak/sesi.ts (aksi: mulai | kuis | jawab | masih_kuat | selesai).
//
// Keputusan memakai ATURAN TETAP dari lib/sesi dan lib/bkt (bukan LLM):
//   level & isi sesi    -> tentukanLevel()        cek "Masih kuat?" -> evaluasiCekMasihKuat()
//   pembaruan status TP -> jawabFormatif()        tindakan pilihan  -> tindakanMasihKuat()
// Sesi yang dihentikan di tengah tidak dihitung gagal. Status TP tercapai tidak pernah diturunkan.
// Sesi materi baru TIDAK berakhir karena jatah soal habis: jatah level = jumlah minimal, lalu soal tambahan
// sampai TP tercapai (keputusan tim, PANDUAN 7.1). Anak tetap bisa berhenti kapan saja (aksi selesai, atau
// "Masih kuat?" -> istirahat), dan cek "Masih kuat?" tetap muncul. Sesi mengulang tetap berhenti di jatahnya.

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { perbaruiSesi, type KeadaanSesiBelajar } from "@/lib/auth/sesi";
import { benarLagiUntukTercapai, jawabFormatif } from "@/lib/bkt/engine";
import { susunPeta } from "@/lib/bkt/peta";
import { denganTransaksi } from "@/lib/db";
import {
  ambilAnak,
  ambilCheckinHariIni,
  ambilProgres,
  ambilTpMapel,
  simpanProgresTp,
  tambahKeluhanHariIni,
  type ProfilAnakLengkap,
} from "@/lib/db/anak";
import { ambilKurikulum, ambilPilihan, ambilTpBerkonten, simpanJawaban } from "@/lib/db/asesmen";
import { ambilNarasi } from "@/lib/db/materi";
import { wajibModeAnak } from "@/lib/db/rbac";
import {
  ambilJawabanSesi,
  ambilKonten,
  ambilPembahasan,
  buatSesiBelajar,
  hitungJawabanBelajarTp,
  hitungSisaBenar,
  pilihSoalSesi,
  tutupSesi,
  tutupSesiBelajarTerbuka,
  wajibSesiBelajarTerbuka,
} from "@/lib/db/sesi-belajar";
import { PermintaanSesi, type ResponsSesi, type UmpanBalikJawaban } from "@/lib/kontrak/sesi";
import { ambilPengaturanAktif, keParameterSesi, type ParameterSesiLengkap } from "@/lib/pengaturan";
import { evaluasiCekMasihKuat, jumlahSoalKuis, tentukanLevel, tindakanMasihKuat, type HasilLevel } from "@/lib/sesi/aturan";

// Kalimat Pijar (bingkai positif, tanpa kata "Salah", PANDUAN 13).
const PESAN = {
  santai: "Hari ini kita istirahat dulu, ya. Mau dengar cerita atau musik?",
  kartu: "Yuk, kenalan dulu dengan materinya. Baca pelan-pelan, ya.",
  kuis: "Pilih jawaban yang menurutmu tepat, ya.",
  tepat: "Hebat! Jawabanmu tepat.",
  cobaLagi: "Yuk, coba lihat lagi. Kak Pijar bisa bantu menjelaskan.",
  cekKuat: "Kamu sudah belajar dengan rajin. Masih kuat?",
  tawarkanSelesai: "Kamu hebat hari ini! Mau selesai sekarang, atau lanjut satu soal lagi?",
  lanjutSampaiKuasai: "Sedikit lagi! Yuk, kuasai materi ini supaya pos berikutnya terbuka.",
  tercapai: "Yeay! Kamu sudah menguasai materi ini. Pijar bangga sekali!",
  selesai: "Sesi selesai. Terima kasih sudah belajar hari ini!",
  berhenti: "Istirahat dulu, ya. Progresmu sudah tersimpan. Sampai nanti!",
  pusing: "Istirahat dulu, ya. Kak Pijar sudah kasih tahu pendampingmu. Progresmu tersimpan.",
};

type Konteks = {
  anak: ProfilAnakLengkap;
  atur: ParameterSesiLengkap;
  level: HasilLevel;
  keadaan: KeadaanSesiBelajar;
};

function respons(k: Konteks, isi: Partial<ResponsSesi> & Pick<ResponsSesi, "status" | "pesan">): ResponsSesi {
  return {
    sesi_id: k.keadaan.sesi_id,
    level: k.level.level,
    jenis_isi: k.level.jenis_isi,
    mode_audio: k.level.mode_audio,
    durasi_menit: k.level.durasi_menit,
    tp: null,
    kartu_belajar: null,
    narasi: null,
    konten: [],
    soal: null,
    nomor_soal: 0,
    jumlah_soal: jumlahSoalKuis(k.level.level, k.atur.jumlah_soal),
    umpan_balik: null,
    alasan_cek_kuat: null,
    tawarkan_selesai: false,
    tp_tercapai: false,
    benar_lagi_untuk_tercapai: null,
    ...isi,
  };
}

async function infoTp(mapelId: number, tpKode: string | null) {
  if (!tpKode) return null;
  const tp = (await ambilTpMapel(mapelId)).find((t) => t.kode === tpKode);
  return tp ? { tp_kode: tp.kode, deskripsi: tp.deskripsi } : null;
}

// Urutan jenis soal: sesi mengulang memakai soal santai dulu; sesi materi baru memakai soal formatif.
// Jika soal jenis itu belum disiapkan, dipakai soal diagnostik yang sudah terbit.
function urutanPenggunaan(ulang: boolean): ("formatif" | "diagnostik" | "santai")[] {
  return ulang ? ["santai", "formatif", "diagnostik"] : ["formatif", "diagnostik"];
}

async function soalBerikutnya(k: Konteks): Promise<ResponsSesi["soal"]> {
  const dipakai = (await ambilJawabanSesi(k.keadaan.sesi_id)).map((j) => j.soal_id);
  return pilihSoalSesi({
    anak_id: k.anak.id,
    tp_kode: k.keadaan.tp_kode!,
    penggunaan: urutanPenggunaan(k.keadaan.ulang),
    dipakai_di_sesi: dipakai,
  });
}

// Muat konteks sesi yang sedang berjalan dan pastikan cocok dengan cookie perangkat ini.
async function muatKonteks(sesi_id: number, cookie: KeadaanSesiBelajar | null, anakId: number): Promise<Konteks> {
  const sesiDb = await wajibSesiBelajarTerbuka(anakId, sesi_id);
  if (!cookie || cookie.sesi_id !== sesi_id) throw new GalatApi("BENTROK", "Sesi ini dibuka di perangkat lain. Mulai sesi baru, ya.");
  const [anak, checkin, nilai] = await Promise.all([ambilAnak(anakId), ambilCheckinHariIni(anakId), ambilPengaturanAktif()]);
  const atur = keParameterSesi(nilai);
  // Level sesi tetap seperti saat dibuka (SESI.level); isi lain dihitung ulang dari check-in hari ini.
  const level = checkin ? tentukanLevel(checkin, anak, atur.durasi) : null;
  if (!level) throw new GalatApi("BENTROK", "Check-in dulu, ya.");
  return { anak, atur, level: { ...level, level: sesiDb.level }, keadaan: cookie };
}

// ---------- aksi: mulai ----------

async function mulai(anakId: number, mapelId: number, tpDiminta: string | undefined): Promise<ResponsSesi> {
  const checkin = await ambilCheckinHariIni(anakId);
  if (!checkin) throw new GalatApi("BENTROK", "Check-in dulu, ya, supaya Pijar tahu kondisimu hari ini.");
  const [anak, nilai, kurikulum, daftarTp, progres, berkonten] = await Promise.all([
    ambilAnak(anakId),
    ambilPengaturanAktif(),
    ambilKurikulum(mapelId),
    ambilTpMapel(mapelId),
    ambilProgres(anakId, mapelId),
    ambilTpBerkonten(mapelId),
  ]);
  const atur = keParameterSesi(nilai);
  const level = tentukanLevel(checkin, anak, atur.durasi);

  // Pilih TP. Mengulang: TP yang sudah tercapai. Materi baru: TP yang diminta atau rekomendasi peta (tidak terkunci).
  let tpKode: string | null = null;
  const ulang = level.jenis_isi === "ulang";
  if (level.level !== "istirahat") {
    if (ulang) {
      const tercapai = daftarTp.filter((t) => progres.get(t.kode)?.status === "tercapai");
      const diminta = tercapai.find((t) => t.kode === tpDiminta);
      tpKode = diminta?.kode ?? tercapai.at(-1)?.kode ?? null; // default: TP tercapai yang paling akhir
    } else {
      const peta = susunPeta({
        daftar_tp: daftarTp,
        graf: kurikulum.graf,
        progres,
        kelas_seharusnya: anak.kelas_seharusnya,
        fase_intensif: anak.fase_pengobatan === "intensif",
        tp_dengan_konten: berkonten,
      });
      const semua = [...peta.pos_dasar, ...peta.kelasku];
      const target = semua.find((t) => t.kode === (tpDiminta ?? peta.rekomendasi_tp));
      if (!target) throw new GalatApi("TIDAK_DITEMUKAN", "Materi ini belum tersedia.");
      if (target.terkunci) throw new GalatApi("BENTROK", "Selesaikan pos dasarnya dulu, ya. Sedikit lagi!");
      if (target.status === "tercapai") throw new GalatApi("BENTROK", "Materi ini sudah kamu kuasai. Pilih materi lain, ya.");
      tpKode = target.kode;
    }
  }

  const sesiId = await denganTransaksi(async (kueri) => {
    await tutupSesiBelajarTerbuka(kueri, anakId);
    const id = await buatSesiBelajar(kueri, anakId, checkin.id, level.level);
    // TP Pos Dasar yang mulai dikejar: belum -> jembatan (PANDUAN 7.4).
    const lama = tpKode ? progres.get(tpKode) : undefined;
    const tp = daftarTp.find((t) => t.kode === tpKode);
    if (!ulang && tp && tp.kelas < anak.kelas_seharusnya && lama?.status === "belum") {
      await simpanProgresTp(kueri, anakId, tp.kode, { ...lama, status: "jembatan" });
    }
    return id;
  });

  const keadaan: KeadaanSesiBelajar = {
    sesi_id: sesiId,
    mapel_id: mapelId,
    tp_kode: tpKode,
    ulang,
    soal_sekarang: null,
    menunggu_cek_kuat: false,
    ceroboh_lelah: false,
    tanpa_materi_baru: false,
    sudah_cek_durasi: false,
    sudah_cek_tengah: false,
    salah_dihitung_sejak: 0,
  };
  const k: Konteks = { anak, atur, level, keadaan };
  const tp = await infoTp(mapelId, tpKode);

  // Istirahat (atau belum ada TP tercapai untuk diulang): hanya konten santai, tanpa kuis.
  if (!tpKode) {
    await perbaruiSesi({ sesi_belajar: keadaan });
    return respons(k, { status: "santai", konten: await ambilKonten(null, ["santai"], level.mode_audio), jumlah_soal: 0, pesan: PESAN.santai });
  }

  // Materi baru: TP baru atau p < ambang -> kartu belajar dulu (PANDUAN 7.2).
  if (!ulang) {
    const p = progres.get(tpKode)?.p_menguasai ?? atur.peluang_awal;
    const tpBaru = (await hitungJawabanBelajarTp(anakId, tpKode)) === 0;
    if (tpBaru || p < atur.ambang_kartu_belajar) {
      const kartu = await ambilKonten(tpKode, ["baru", "jembatan"], level.mode_audio);
      await perbaruiSesi({ sesi_belajar: keadaan });
      const narasi = await ambilNarasi(tpKode); // cerita kartu belajar dari database (bisa disunting admin)
      return respons(k, { status: "kartu_belajar", tp, kartu_belajar: kartu[0] ?? null, narasi, konten: kartu, pesan: PESAN.kartu });
    }
  }

  const soal = await soalBerikutnya(k);
  await perbaruiSesi({ sesi_belajar: { ...keadaan, soal_sekarang: soal!.soal_id } });
  const konten = ulang ? await ambilKonten(tpKode, ["ulang"], level.mode_audio) : [];
  return respons(k, { status: "kuis", tp, konten, soal, nomor_soal: 1, pesan: PESAN.kuis });
}

// ---------- aksi: kuis (setelah kartu belajar) ----------

async function mulaiKuis(k: Konteks): Promise<ResponsSesi> {
  if (!k.keadaan.tp_kode) throw new GalatApi("BENTROK", "Sesi istirahat tidak punya kuis.");
  const soal = await soalBerikutnya(k);
  const nomor = (await ambilJawabanSesi(k.keadaan.sesi_id)).length + 1;
  await perbaruiSesi({ sesi_belajar: { ...k.keadaan, soal_sekarang: soal!.soal_id } });
  return respons(k, { status: "kuis", tp: await infoTp(k.keadaan.mapel_id, k.keadaan.tp_kode), soal, nomor_soal: nomor, pesan: PESAN.kuis });
}

// ---------- aksi: jawab ----------

async function jawab(k: Konteks, minta: Extract<PermintaanSesi, { aksi: "jawab" }>): Promise<ResponsSesi> {
  const { keadaan, atur, anak } = k;
  if (keadaan.menunggu_cek_kuat) throw new GalatApi("BENTROK", "Jawab dulu pertanyaan Pijar: masih kuat?");
  if (keadaan.soal_sekarang !== minta.soal_id) throw new GalatApi("BENTROK", "Soal ini sudah dijawab. Muat ulang untuk melanjutkan.");
  const pilihan = await ambilPilihan(minta.pilihan_id);
  if (!pilihan || pilihan.soal_id !== minta.soal_id) throw new GalatApi("INPUT_TIDAK_VALID", "Pilihan jawaban tidak cocok dengan soal.");

  const tpKode = keadaan.tp_kode!;
  const tp = await infoTp(keadaan.mapel_id, tpKode);
  let tpTercapai = false;
  let sisaBenar: number | null = null; // untuk pesan "tinggal N jawaban benar lagi" (soal tambahan & layar akhir)

  // Dibaca SEBELUM jawaban ini disimpan: p lama dan jumlah soal formatif yang sudah dijawab untuk TP ini.
  const progres = (await ambilProgres(anak.id, keadaan.mapel_id)).get(tpKode);
  const jumlahSebelumnya = await hitungJawabanBelajarTp(anak.id, tpKode);

  await denganTransaksi(async (kueri) => {
    await simpanJawaban(kueri, { sesi_id: keadaan.sesi_id, pilihan_id: pilihan.pilihan_id, waktu_respons_ms: minta.waktu_respons_ms });
    // Mengulang materi yang sudah dikuasai tidak memengaruhi status TP (PANDUAN 7.1).
    if (keadaan.ulang) return;
    if (progres?.status === "tercapai") return; // tidak pernah diturunkan

    const hasil = jawabFormatif(progres?.p_menguasai ?? atur.peluang_awal, jumlahSebelumnya, pilihan.benar, {
      tebakan: atur.tebakan,
      ceroboh: keadaan.ceroboh_lelah ? atur.ceroboh_lelah : atur.ceroboh, // "Agak capek" -> ceroboh_lelah
      belajar_saat_sesi: atur.belajar_saat_sesi,
      ambang_tercapai_sesi: atur.ambang_tercapai_sesi,
      min_soal_tercapai: atur.min_soal_tercapai,
    });
    tpTercapai = hasil.tercapai;
    // Perkiraan memakai ceroboh biasa (sesi berikutnya dimulai tanpa status "Agak capek").
    if (!hasil.tercapai) {
      sisaBenar = benarLagiUntukTercapai(hasil.p_menguasai, hasil.jumlah_soal, {
        tebakan: atur.tebakan,
        ceroboh: atur.ceroboh,
        belajar_saat_sesi: atur.belajar_saat_sesi,
        ambang_tercapai_sesi: atur.ambang_tercapai_sesi,
        min_soal_tercapai: atur.min_soal_tercapai,
      });
    }
    await simpanProgresTp(kueri, anak.id, tpKode, {
      status: hasil.tercapai ? "tercapai" : (progres?.status ?? "belum"),
      sumber_status: hasil.tercapai ? "diuji" : (progres?.sumber_status ?? "diuji"),
      p_menguasai: hasil.p_menguasai,
    });
  });

  const umpanBalik: UmpanBalikJawaban = {
    benar: pilihan.benar,
    pesan: pilihan.benar ? PESAN.tepat : PESAN.cobaLagi,
    pembahasan: await ambilPembahasan(minta.soal_id),
    bisa_tanya_tutor: !pilihan.benar,
  };

  const jawabanSesi = await ambilJawabanSesi(keadaan.sesi_id);
  const nomor = jawabanSesi.length;
  const rencana = jumlahSoalKuis(k.level.level, atur.jumlah_soal);
  const selesaiDengan = async (pesan: string, tercapai: boolean) => {
    await denganTransaksi((kueri) => tutupSesi(kueri, keadaan.sesi_id));
    await perbaruiSesi({ sesi_belajar: null });
    return respons(k, {
      status: "selesai",
      tp,
      umpan_balik: umpanBalik,
      nomor_soal: nomor,
      tp_tercapai: tercapai,
      benar_lagi_untuk_tercapai: tercapai ? null : sisaBenar,
      pesan,
    });
  };

  if (tpTercapai) return selesaiDengan(PESAN.tercapai, true);
  // Hanya sesi mengulang yang berhenti di jatah soal: jawabannya tidak memengaruhi status TP (PANDUAN 7.1).
  // Sesi materi baru lanjut dengan soal tambahan sampai TP tercapai.
  if (keadaan.ulang && nomor >= rencana) return selesaiDengan(PESAN.selesai, false);
  const soalTambahan = nomor >= rencana;

  // Cek "Masih kuat?" (aturan tetap).
  let salahBeruntun = 0;
  for (const j of jawabanSesi.slice(keadaan.salah_dihitung_sejak).reverse()) {
    if (j.benar) break;
    salahBeruntun++;
  }
  const menit = (Date.now() - (await wajibSesiBelajarTerbuka(anak.id, keadaan.sesi_id)).mulai.getTime()) / 60000;
  const alasan = evaluasiCekMasihKuat({
    level: k.level.level,
    menit_berjalan: menit,
    durasi_menit: k.level.durasi_menit,
    salah_beruntun: salahBeruntun,
    batas_salah_beruntun: atur.salah_beruntun,
    sudah_cek_durasi: keadaan.sudah_cek_durasi,
    sudah_cek_tengah: keadaan.sudah_cek_tengah,
  });
  if (alasan) {
    await perbaruiSesi({
      sesi_belajar: {
        ...keadaan,
        soal_sekarang: null,
        menunggu_cek_kuat: true,
        sudah_cek_durasi: keadaan.sudah_cek_durasi || alasan === "durasi_tercapai",
        sudah_cek_tengah: keadaan.sudah_cek_tengah || alasan === "tengah_sesi_penuh",
        salah_dihitung_sejak: nomor,
      },
    });
    return respons(k, { status: "cek_kuat", tp, umpan_balik: umpanBalik, nomor_soal: nomor, alasan_cek_kuat: alasan, pesan: PESAN.cekKuat });
  }

  const soal = await soalBerikutnya(k);
  await perbaruiSesi({ sesi_belajar: { ...keadaan, soal_sekarang: soal!.soal_id } });
  return respons(k, {
    status: "kuis",
    tp,
    soal,
    umpan_balik: umpanBalik,
    nomor_soal: nomor + 1,
    benar_lagi_untuk_tercapai: sisaBenar,
    pesan: soalTambahan ? PESAN.lanjutSampaiKuasai : PESAN.kuis,
  });
}

// ---------- aksi: masih_kuat ----------

async function masihKuat(k: Konteks, pilihan: Extract<PermintaanSesi, { aksi: "masih_kuat" }>["pilihan"]): Promise<ResponsSesi> {
  const { keadaan } = k;
  if (!keadaan.menunggu_cek_kuat) throw new GalatApi("BENTROK", "Tidak ada pertanyaan yang perlu dijawab sekarang.");
  const t = tindakanMasihKuat(pilihan, keadaan.sudah_cek_durasi);
  const tp = await infoTp(keadaan.mapel_id, keadaan.tp_kode);

  if (t.berhenti) {
    // Dihentikan di tengah: progres tersimpan dan TIDAK dihitung gagal (PANDUAN 7.1).
    await denganTransaksi(async (kueri) => {
      await tutupSesi(kueri, keadaan.sesi_id);
      if (t.kabari_pendamping) await tambahKeluhanHariIni(kueri, k.anak.id, "pusing"); // kartu di dashboard pendamping
    });
    await perbaruiSesi({ sesi_belajar: null });
    return respons(k, { status: "berhenti", tp, pesan: t.kabari_pendamping ? PESAN.pusing : PESAN.berhenti });
  }

  const baru: KeadaanSesiBelajar = {
    ...keadaan,
    menunggu_cek_kuat: false,
    ceroboh_lelah: keadaan.ceroboh_lelah || t.pakai_ceroboh_lelah,
    tanpa_materi_baru: keadaan.tanpa_materi_baru || t.tanpa_materi_baru,
  };
  const konteksBaru = { ...k, keadaan: baru };
  const soal = await soalBerikutnya(konteksBaru);
  await perbaruiSesi({ sesi_belajar: { ...baru, soal_sekarang: soal!.soal_id } });
  const nomor = (await ambilJawabanSesi(keadaan.sesi_id)).length + 1;
  return respons(konteksBaru, {
    status: "kuis",
    tp,
    soal,
    nomor_soal: nomor,
    tawarkan_selesai: t.tawarkan_selesai,
    benar_lagi_untuk_tercapai: await sisaBenarSesi(k),
    pesan: t.tawarkan_selesai ? PESAN.tawarkanSelesai : PESAN.kuis,
  });
}

// ---------- aksi: selesai ----------

async function selesai(k: Konteks): Promise<ResponsSesi> {
  await denganTransaksi((kueri) => tutupSesi(kueri, k.keadaan.sesi_id));
  await perbaruiSesi({ sesi_belajar: null });
  const nomor = (await ambilJawabanSesi(k.keadaan.sesi_id)).length;
  return respons(k, {
    status: "selesai",
    tp: await infoTp(k.keadaan.mapel_id, k.keadaan.tp_kode),
    nomor_soal: nomor,
    benar_lagi_untuk_tercapai: await sisaBenarSesi(k),
    pesan: PESAN.selesai,
  });
}

// Sisa jawaban benar untuk TP sesi ini (null untuk sesi istirahat/mengulang atau TP yang sudah tercapai).
async function sisaBenarSesi(k: Konteks): Promise<number | null> {
  const { tp_kode, ulang, mapel_id } = k.keadaan;
  if (!tp_kode || ulang) return null;
  const progres = (await ambilProgres(k.anak.id, mapel_id)).get(tp_kode);
  if (progres?.status === "tercapai") return null;
  return hitungSisaBenar(k.anak.id, tp_kode, progres?.p_menguasai, k.atur);
}

export const POST = tanganiApi(async (req: Request) => {
  const { sesi, anak_id } = await wajibModeAnak();
  const minta = await bacaBody(req, PermintaanSesi);
  if (minta.aksi === "mulai") return Response.json(await mulai(anak_id, minta.mapel_id, minta.tp_kode));

  const k = await muatKonteks(minta.sesi_id, sesi.sesi_belajar, anak_id);
  switch (minta.aksi) {
    case "kuis":
      return Response.json(await mulaiKuis(k));
    case "jawab":
      return Response.json(await jawab(k, minta));
    case "masih_kuat":
      return Response.json(await masihKuat(k, minta.pilihan));
    case "selesai":
      return Response.json(await selesai(k));
  }
});
