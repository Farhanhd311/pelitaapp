// GET /api/peta?mapel_id=1: peta TP anak (Kelasku + Pos Dasar), PANDUAN 7.3. Mode anak.
// Kontrak: lib/kontrak/peta.ts

import { z } from "zod";
import { GalatApi, tanganiApi } from "@/lib/api/respons";
import { susunPeta } from "@/lib/bkt/peta";
import { ambilAnak, ambilProgres, ambilTpMapel } from "@/lib/db/anak";
import { ambilKurikulum, ambilTpBerkonten, asesmenSudahSelesai } from "@/lib/db/asesmen";
import { wajibModeAnak } from "@/lib/db/rbac";
import type { ResponsPeta } from "@/lib/kontrak/peta";

const Kueri = z.object({ mapel_id: z.coerce.number().int() });

export const GET = tanganiApi(async (req: Request) => {
  const { anak_id } = await wajibModeAnak();
  const kueri = Kueri.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!kueri.success) throw new GalatApi("INPUT_TIDAK_VALID", "mapel_id wajib diisi.");
  const mapelId = kueri.data.mapel_id;

  const [anak, kurikulum, daftarTp, progres, berkonten] = await Promise.all([
    ambilAnak(anak_id),
    ambilKurikulum(mapelId),
    ambilTpMapel(mapelId),
    ambilProgres(anak_id, mapelId),
    ambilTpBerkonten(mapelId),
  ]);

  const peta = susunPeta({
    daftar_tp: daftarTp,
    graf: kurikulum.graf,
    progres,
    kelas_seharusnya: anak.kelas_seharusnya,
    fase_intensif: anak.fase_pengobatan === "intensif",
    tp_dengan_konten: berkonten,
  });

  const keKotak = (k: (typeof peta.kelasku)[number]) => ({
    tp_kode: k.kode,
    kelas: k.kelas,
    urutan: k.urutan,
    deskripsi: k.deskripsi,
    status: k.status,
    sumber_status: k.sumber_status,
    tersedia: k.tersedia,
    terkunci: k.terkunci,
    esensial_transisi: k.esensial_transisi,
  });

  const sisa = peta.pos_wajib_tersisa;
  const respons: ResponsPeta = {
    mapel_id: mapelId,
    kelas_seharusnya: anak.kelas_seharusnya,
    asesmen_selesai: await asesmenSudahSelesai(anak_id, kurikulum),
    rekomendasi_tp: peta.rekomendasi_tp,
    hanya_esensial: peta.hanya_esensial,
    kelasku: peta.kelasku.map(keKotak),
    pos_dasar: peta.pos_dasar.map((p) => ({ ...keKotak(p), wajib: p.wajib })),
    // Bingkai positif untuk anak (PANDUAN 13): jarak ke tujuan, bukan "tertinggal".
    pesan_semangat:
      sisa > 0 ? `${sisa} pos lagi menuju Kelasku! Ayo, pelan-pelan saja.` : "Semua pos wajib sudah kamu lewati. Ayo jelajahi Kelasku!",
  };
  return Response.json(respons);
});
