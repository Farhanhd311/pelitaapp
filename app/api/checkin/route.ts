// GET  /api/checkin: check-in hari ini (null jika belum).
// POST /api/checkin: simpan check-in -> tentukanLevel() (lib/sesi) -> balas level dan isi sesi (PANDUAN 7.1).
// Kontrak: lib/kontrak/checkin.ts. Mode anak (pendamping boleh membantu mengisi di perangkat yang sama).

import { bacaBody, tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { ambilAnak, ambilCheckinHariIni, ambilRiwayatCheckin, tanggalLokal, type ProfilAnakLengkap } from "@/lib/db/anak";
import { wajibModeAnak } from "@/lib/db/rbac";
import { PermintaanCheckin, type ResponsCheckin, type ResponsCheckinHariIni } from "@/lib/kontrak/checkin";
import { ambilPengaturanAktif, keParameterSesi } from "@/lib/pengaturan";
import { cuacaTurunBeruntun, tentukanLevel, type RingkasCheckin } from "@/lib/sesi/aturan";

async function hasilCheckin(anak: ProfilAnakLengkap, checkinId: number, checkin: RingkasCheckin): Promise<ResponsCheckin> {
  const atur = keParameterSesi(await ambilPengaturanAktif());
  const level = tentukanLevel(checkin, anak, atur.durasi);
  const riwayat = await ambilRiwayatCheckin(anak.id);
  return {
    checkin_id: checkinId,
    level: level.level,
    jenis_isi: level.jenis_isi,
    durasi_menit: level.durasi_menit,
    mode_audio: level.mode_audio,
    tawarkan_teman_cerita: level.tawarkan_teman_cerita,
    teman_cerita_menyapa: cuacaTurunBeruntun(riwayat, atur.hari_mood_turun),
    tawarkan_beri_tahu_pendamping: level.tawarkan_beri_tahu_pendamping,
    alasan: level.alasan,
  };
}

export const GET = tanganiApi(async () => {
  const { anak_id } = await wajibModeAnak();
  const hariIni = await ambilCheckinHariIni(anak_id);
  const respons: ResponsCheckinHariIni = {
    checkin: hariIni ? await hasilCheckin(await ambilAnak(anak_id), hariIni.id, hariIni) : null,
  };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const { anak_id } = await wajibModeAnak();
  const isi = await bacaBody(req, PermintaanCheckin);
  const anak = await ambilAnak(anak_id);
  const keluhan = isi.keluhan.length > 0 ? isi.keluhan.join(",") : null;

  // Satu check-in per hari: check-in ulang di hari yang sama mengganti yang lama (kondisi bisa berubah).
  const hariIni = await ambilCheckinHariIni(anak_id);
  let checkinId: number;
  if (hariIni) {
    await query("UPDATE checkin SET energi = ?, cuaca_hati = ?, keluhan = ? WHERE id = ?", [
      isi.energi,
      isi.cuaca_hati,
      keluhan,
      hariIni.id,
    ]);
    checkinId = hariIni.id;
  } else {
    const hasil = await query<{ insertId: number }>(
      "INSERT INTO checkin (anak_id, tanggal, energi, cuaca_hati, keluhan) VALUES (?, ?, ?, ?, ?)",
      [anak_id, tanggalLokal(), isi.energi, isi.cuaca_hati, keluhan],
    );
    checkinId = hasil.insertId;
  }

  return Response.json(await hasilCheckin(anak, checkinId, { tanggal: tanggalLokal(), ...isi }));
});
