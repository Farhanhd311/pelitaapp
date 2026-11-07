// GET /api/pendamping/dashboard?anak_id=1: dashboard pendamping (PANDUAN 7.1, PRD 9.8).
// Wajib mode pendamping + relasi PENDAMPINGAN. Akses guru tercatat di LOG_AKTIVITAS (lewat rbac).
// Progres ditampilkan sebagai status, bukan persen. Skrining hanya ringkasan kategori.
// Kontrak: lib/kontrak/pendamping.ts

import { tanganiApi } from "@/lib/api/respons";
import { query } from "@/lib/db";
import { ambilAnak, ambilDaftarMapel, ambilProgres, ambilRiwayatCheckin, ambilTpMapel, awalHariLokal, geserTanggal, tanggalLokal } from "@/lib/db/anak";
import { ambilKeputusan, ambilPenjelasanAiTerbaru, bacaAnakId, hitungKuisGagal, wajibPendampingAnak } from "@/lib/db/pendamping";
import type { KartuPerhatian, ResponsDashboard } from "@/lib/kontrak/pendamping";
import { ambilPengaturanAktif, keParameterSesi } from "@/lib/pengaturan";
import { perluPerhatian, tentukanLevel } from "@/lib/sesi/aturan";

// Panjang tren di grafik dan jumlah item terbaru: pilihan tampilan, bukan aturan bisnis.
const HARI_TREN = 28;
const JUMLAH_SKRINING = 5;
const JUMLAH_PENJELASAN_AI = 5;

// Senin minggu ini (WIB), karena target dihitung per minggu (PANDUAN 7.1).
function awalMinggu(hariIni: string): string {
  const hari = new Date(`${hariIni}T00:00:00Z`).getUTCDay(); // 0 = Minggu
  return geserTanggal(hariIni, -((hari + 6) % 7));
}

export const GET = tanganiApi(async (req: Request) => {
  const anakId = bacaAnakId(req);
  const { sesi, hubungan } = await wajibPendampingAnak(anakId, "dashboard");

  const hariIni = tanggalLokal();
  const senin = awalMinggu(hariIni);
  const [anak, nilai, riwayat, mapel] = await Promise.all([
    ambilAnak(anakId),
    ambilPengaturanAktif(),
    ambilRiwayatCheckin(anakId, geserTanggal(hariIni, -HARI_TREN)),
    ambilDaftarMapel(),
  ]);
  const atur = keParameterSesi(nilai);

  // ---- Minggu ini: hari istirahat yang dilaporkan lewat check-in tetap dihitung hari aktif.
  const mingguIni = riwayat.filter((c) => c.tanggal >= senin);
  const hariIstirahat = mingguIni.filter((c) => tentukanLevel(c, anak, atur.durasi).level === "istirahat").length;
  const [sesiMinggu] = await query<{ jumlah: number }[]>(
    `SELECT COUNT(DISTINCT se.id) AS jumlah FROM sesi se JOIN jawaban j ON j.sesi_id = se.id
     WHERE se.anak_id = ? AND se.jenis = 'belajar' AND se.mulai >= ?`,
    [anakId, awalHariLokal(senin)],
  );
  const [tercapaiMinggu] = await query<{ jumlah: number }[]>(
    "SELECT COUNT(*) AS jumlah FROM progres_tp WHERE anak_id = ? AND status = 'tercapai' AND sumber_status = 'diuji' AND diperbarui_at >= ?",
    [anakId, awalHariLokal(senin)],
  );

  // ---- Kartu "perlu perhatian" (amber). Isinya saran, bukan diagnosis.
  const kartu: KartuPerhatian[] = [];
  const nama = anak.nama_panggilan;
  if (perluPerhatian(riwayat, atur.hari_lemas)) {
    kartu.push({
      jenis: "lemas_beruntun",
      judul: `${nama} lemas atau mengeluh beberapa hari berturut-turut`,
      isi: "Sesi belajar sudah otomatis dibuat lebih ringan. Pertimbangkan untuk berkonsultasi dengan tim medis yang merawat.",
    });
  }
  const checkinHariIni = riwayat.find((c) => c.tanggal === hariIni);
  if (checkinHariIni?.keluhan.includes("sakit_sekali")) {
    kartu.push({ jenis: "sakit_sekali", judul: `${nama} merasa sakit sekali hari ini`, isi: "Hari ini sesi diganti istirahat. Pertimbangkan untuk menghubungi tim medis." });
  } else if (checkinHariIni?.keluhan.includes("pusing")) {
    kartu.push({ jenis: "pusing_saat_sesi", judul: `${nama} merasa pusing hari ini`, isi: "Sesi dihentikan dan progres tersimpan. Pastikan ia beristirahat; hubungi tim medis bila berlanjut." });
  }
  const gagal = await hitungKuisGagal(anakId, atur.jumlah_soal);
  for (const [tp, jumlah] of gagal) {
    if (jumlah >= atur.gagal_sebelum_ditinjau) {
      kartu.push({
        jenis: "tp_perlu_ditinjau",
        tp_kode: tp,
        judul: `Materi ${tp} perlu ditinjau guru pendamping`,
        isi: "Kuis materi ini belum tuntas beberapa kali. Anak tidak akan dipaksa mengulang terus; guru pendamping bisa membantu dengan cara lain.",
      });
    }
  }
  const darurat = await query<{ jumlah: number }[]>(
    `SELECT COUNT(*) AS jumlah FROM rujukan r JOIN skrining s ON s.id = r.skrining_id WHERE s.anak_id = ? AND r.status = 'eskalasi'`,
    [anakId],
  );
  if (Number(darurat[0].jumlah) > 0) {
    kartu.push({
      jenis: "eskalasi_darurat",
      judul: `${nama} butuh ditemani sekarang`,
      isi: "Dari Teman Cerita, ada tanda ia merasa tidak aman. Tim PELITA sudah diberi tahu. Temani dan ajak ia bicara dengan tenang.",
    });
  }

  // ---- Progres per mapel (status saja).
  const progres = await Promise.all(
    mapel.map(async (m) => {
      const [daftar, peta] = await Promise.all([ambilTpMapel(m.mapel_id), ambilProgres(anakId, m.mapel_id)]);
      return {
        mapel_id: m.mapel_id,
        mapel: m.nama,
        tp: daftar.map((t) => ({
          tp_kode: t.kode,
          kelas: t.kelas,
          deskripsi: t.deskripsi,
          status: peta.get(t.kode)?.status ?? "belum_diketahui",
          sumber_status: peta.get(t.kode)?.sumber_status ?? null,
        })),
      };
    }),
  );

  const skrining = await query<{ waktu: Date; perasaan: string | null; sumber: string | null; kebutuhan: string | null; level: number | null }[]>(
    "SELECT waktu, perasaan, sumber, kebutuhan, level FROM skrining WHERE anak_id = ? ORDER BY waktu DESC LIMIT ?",
    [anakId, JUMLAH_SKRINING],
  );

  const respons: ResponsDashboard = {
    anak: {
      anak_id: anak.id,
      nama_panggilan: anak.nama_panggilan,
      kelas_seharusnya: anak.kelas_seharusnya,
      fase_pengobatan: anak.fase_pengobatan,
      mode_jeda: anak.mode_jeda,
      batas_layar_menit: anak.batas_layar_menit,
    },
    hubungan,
    minggu_ini: {
      hari_aktif: mingguIni.length,
      hari_istirahat: hariIstirahat,
      sesi_belajar: Number(sesiMinggu.jumlah),
      tp_tercapai_baru: Number(tercapaiMinggu.jumlah),
    },
    tren_checkin: [...riwayat].reverse().map((c) => ({ tanggal: c.tanggal, energi: c.energi, cuaca_hati: c.cuaca_hati, keluhan: c.keluhan })),
    perlu_perhatian: kartu,
    progres,
    ringkasan_skrining: skrining.map((s) => ({ ...s, waktu: s.waktu.toISOString() })),
    keputusan_menunggu: await ambilKeputusan(anakId, hubungan, true),
    penjelasan_ai_terbaru: await ambilPenjelasanAiTerbaru(anakId, sesi.user_id, JUMLAH_PENJELASAN_AI),
  };
  return Response.json(respons);
});
