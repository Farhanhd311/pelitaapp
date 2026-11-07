// GET  /api/teman-cerita: sapaan, aturan kerahasiaan, pilihan chip. Mode anak.
// POST /api/teman-cerita: skrining (PANDUAN 8.2, PRD 9.10). Kontrak: lib/kontrak/teman-cerita.ts
//   1. Teks bebas (jika ada) dicek kata kunci krisis DULU dengan aturan tetap (lib/krisis), lalu dibuang.
//   2. Level rujukan dari tabel aturan PENGATURAN_SISTEM (bukan LLM).
//   3. Krisis -> rujukan darurat langsung masuk antrean eskalasi + kartu di dashboard orang tua (tanpa menunggu izin).
//      Level 1-3 -> rujukan menunggu persetujuan orang tua/wali ("Keputusan Menunggu").
//   4. Yang disimpan hanya SKRINING (kategori). Transkrip tidak disimpan.
// LLM tidak dipakai di MVP (PANDUAN 5 B11: "LLM hanya jika sempat"); balasan memakai kalimat yang sudah disiapkan.

import { z } from "zod";
import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { denganTransaksi } from "@/lib/db";
import { ambilRiwayatCheckin } from "@/lib/db/anak";
import { wajibModeAnak } from "@/lib/db/rbac";
import { cekKataKunciKrisis, tentukanLevelRujukan, type AturanLevel } from "@/lib/krisis/detektor";
import {
  PermintaanTemanCerita,
  type PilihanChip,
  type ResponsSapaanTemanCerita,
  type ResponsTemanCerita,
} from "@/lib/kontrak/teman-cerita";
import { ambilPengaturanAktif } from "@/lib/pengaturan";
import { cuacaTurunBeruntun } from "@/lib/sesi/aturan";

const SAPAAN = "Hai, aku Kak Pijar. Kamu boleh cerita apa saja ke aku, pelan-pelan saja.";
const ATURAN_KERAHASIAAN =
  "Ceritamu aman di sini. Tapi kalau kamu dalam bahaya, kakak harus kasih tahu ayah atau ibumu supaya kamu dibantu.";

const PILIHAN: ResponsSapaanTemanCerita["pilihan"] = {
  perasaan: [
    { kode: "cerah", label: "Senang", emoji: "☀️" },
    { kode: "berawan", label: "Biasa saja", emoji: "⛅" },
    { kode: "hujan", label: "Sedih", emoji: "🌧️" },
    { kode: "badai", label: "Sedih sekali / marah", emoji: "⛈️" },
  ],
  sumber: [
    { kode: "badan", label: "Badanku", emoji: "🧸" },
    { kode: "teman", label: "Teman", emoji: "🧒" },
    { kode: "keluarga", label: "Keluarga", emoji: "🏠" },
    { kode: "sekolah", label: "Sekolah", emoji: "🎒" },
    { kode: "bosan", label: "Bosan", emoji: "🥱" },
    { kode: "lainnya", label: "Lainnya", emoji: "💭" },
  ],
  kebutuhan: [
    { kode: "teman", label: "Aku ingin teman bermain", emoji: "🤝" },
    { kode: "cerita", label: "Aku ingin bercerita ke kakak", emoji: "💬" },
    { kode: "tidak_ada", label: "Cukup begini saja", emoji: "🌱" },
    { kode: "tidak_aman", label: "Aku merasa tidak aman", emoji: "🆘" },
  ] satisfies PilihanChip[],
};

const BALASAN = {
  darurat:
    "Terima kasih sudah berani cerita. Kamu tidak sendirian. Kakak sudah kasih tahu orang dewasa yang sayang kamu supaya segera menemanimu. Tarik napas pelan-pelan bersama Pijar, ya.",
  teman: "Terima kasih sudah cerita. Kakak akan bantu carikan teman bermain yang seru. Ayah atau ibumu akan ikut memilih, ya.",
  cerita: "Terima kasih sudah cerita. Kakak akan bantu carikan kakak pendamping yang siap mendengarkanmu. Ayah atau ibumu akan ikut memilih, ya.",
  distres: "Terima kasih sudah cerita. Beberapa hari ini sepertinya berat, ya. Kakak akan bantu carikan orang yang bisa menemanimu bercerita.",
  biasa: "Terima kasih sudah cerita ke Kak Pijar. Kapan pun kamu mau cerita lagi, aku ada di sini.",
};

const SkemaAtur = z.object({
  "rujukan.aturan_level": z.array(
    z.object({ level: z.number(), kebutuhan: z.string(), rujukan: z.string(), butuh_persetujuan_orang_tua: z.boolean() }),
  ),
  "rujukan.kode_kebutuhan": z.record(z.string(), z.number()),
  "sesi.hari_mood_turun_pemicu_chatbot": z.number(),
  "krisis.daftar_kata_kunci": z.array(z.string()).optional(), // belum diisi tim -> teks bebas dimatikan
});

async function bacaAtur() {
  const hasil = SkemaAtur.safeParse(await ambilPengaturanAktif());
  if (!hasil.success) throw new Error("PENGATURAN_SISTEM Teman Cerita tidak lengkap. Jalankan Reset demo untuk melengkapi.");
  const daftar = (hasil.data["krisis.daftar_kata_kunci"] ?? []).filter((k) => k.trim().length > 0);
  return { ...hasil.data, daftarKrisis: daftar };
}

export const GET = tanganiApi(async () => {
  const { anak_id } = await wajibModeAnak();
  const atur = await bacaAtur();
  const riwayat = await ambilRiwayatCheckin(anak_id);
  const respons: ResponsSapaanTemanCerita = {
    sapaan: SAPAAN,
    aturan_kerahasiaan: ATURAN_KERAHASIAAN,
    pilihan: PILIHAN,
    teks_bebas_aktif: atur.daftarKrisis.length > 0,
    menyapa_proaktif: cuacaTurunBeruntun(riwayat, atur["sesi.hari_mood_turun_pemicu_chatbot"]),
  };
  return Response.json(respons);
});

export const POST = tanganiApi(async (req: Request) => {
  const { anak_id } = await wajibModeAnak();
  const minta = await bacaBody(req, PermintaanTemanCerita);
  const atur = await bacaAtur();

  // 1. Cek krisis dengan aturan tetap. Teks tidak disimpan di mana pun setelah baris ini.
  let krisisDariTeks = false;
  if (minta.teks?.trim()) {
    if (atur.daftarKrisis.length === 0) {
      // Tanpa daftar kata kunci, teks bebas tidak bisa dicek dengan aman -> ditolak, bukan diloloskan.
      throw new GalatApi("INPUT_TIDAK_VALID", "Untuk sekarang, pilih gambarnya saja, ya.");
    }
    krisisDariTeks = cekKataKunciKrisis(minta.teks, atur.daftarKrisis).terdeteksi;
  }
  const sinyalKrisis = krisisDariTeks || minta.kebutuhan === "tidak_aman";

  // 2. Distres berulang: cuaca hati turun beberapa hari berturut-turut DAN hari ini sedih.
  const riwayat = await ambilRiwayatCheckin(anak_id);
  const distresBerulang =
    (minta.perasaan === "hujan" || minta.perasaan === "badai") &&
    cuacaTurunBeruntun(riwayat, atur["sesi.hari_mood_turun_pemicu_chatbot"]);

  const hasil = tentukanLevelRujukan(
    { kebutuhan: minta.kebutuhan, sinyal_krisis: sinyalKrisis, distres_berulang: distresBerulang },
    { kode_kebutuhan: atur["rujukan.kode_kebutuhan"], aturan_level: atur["rujukan.aturan_level"] as AturanLevel[] },
  );

  // 3. Simpan SKRINING (kategori saja) dan rujukan.
  const skriningId = await denganTransaksi(async (kueri) => {
    const s = await kueri<{ insertId: number }>(
      "INSERT INTO skrining (anak_id, perasaan, sumber, kebutuhan, level, sinyal_krisis) VALUES (?, ?, ?, ?, ?, ?)",
      [anak_id, minta.perasaan, minta.sumber, minta.kebutuhan, hasil.aturan?.level ?? null, sinyalKrisis ? 1 : 0],
    );
    const namaLayanan = hasil.darurat ? "layanan darurat" : hasil.aturan?.rujukan;
    if (namaLayanan) {
      const layanan = await kueri<{ id: number }[]>("SELECT id FROM layanan_dukungan WHERE LOWER(nama) = LOWER(?) LIMIT 1", [
        namaLayanan,
      ]);
      await kueri("INSERT INTO rujukan (skrining_id, layanan_id, status) VALUES (?, ?, ?)", [
        s.insertId,
        layanan[0]?.id ?? null,
        hasil.darurat ? "eskalasi" : "menunggu_persetujuan", // darurat tidak menunggu izin (PANDUAN 8.2)
      ]);
    }
    return s.insertId;
  });

  const balasan = hasil.darurat
    ? BALASAN.darurat
    : distresBerulang && hasil.aturan
      ? BALASAN.distres
      : minta.kebutuhan === "teman" || minta.kebutuhan === "cerita"
        ? BALASAN[minta.kebutuhan]
        : BALASAN.biasa;

  const respons: ResponsTemanCerita = {
    skrining_id: skriningId,
    balasan,
    rujukan_disiapkan: !hasil.darurat && hasil.aturan !== null,
    darurat: hasil.darurat,
  };
  return Response.json(respons);
});
