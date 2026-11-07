"use client";

// Daftar Keputusan Menunggu (PRD 9.8 F-DASH-4 & PRD 9.10 F-TC-6).
// Menampilkan rujukan yang butuh persetujuan orang tua/wali (misal rujukan komunitas Teman Cerita).
// Orang tua hanya melihat ringkasan kategori (bukan isi percakapan privat anak).

import { useState } from "react";
import { Check, Clock, HandHeart, MessageSquareHeart, ShieldAlert, X } from "lucide-react";
import { panggilApi, pesanGalat } from "@/lib/api/klien";
import type { ItemKeputusan, ResponsKeputusan } from "@/lib/kontrak/pendamping";

export function DaftarKeputusanMenunggu({
  daftarAwal,
  onKeputusanDiperbarui,
}: {
  daftarAwal: ItemKeputusan[];
  onKeputusanDiperbarui?: () => void;
}) {
  const [daftar, setDaftar] = useState<ItemKeputusan[]>(daftarAwal);
  const [memprosesId, setMemprosesId] = useState<number | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const yangMenunggu = daftar.filter(
    (item) => item.status === "menunggu_persetujuan",
  );

  async function tanganiKeputusan(rujukanId: number, keputusan: "setujui" | "tolak") {
    setMemprosesId(rujukanId);
    setGalat(null);
    try {
      const respons = await panggilApi<ResponsKeputusan>(
        "/api/pendamping/keputusan",
        {
          rujukan_id: rujukanId,
          keputusan,
        },
      );
      setDaftar(respons.keputusan);
      onKeputusanDiperbarui?.();
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setMemprosesId(null);
    }
  }

  if (yangMenunggu.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5B97F]/60 bg-white p-5 text-center shadow-xs">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
          <HandHeart className="size-5" />
        </div>
        <h3 className="font-heading text-sm font-extrabold text-teks">
          Tidak Ada Keputusan Menunggu
        </h3>
        <p className="mt-1 text-xs text-teks-2">
          Semua rujukan dukungan dan persetujuan telah terselesaikan.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="judul-keputusan" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="size-5 text-bata" />
          <h2 id="judul-keputusan" className="font-heading text-base font-black text-teks">
            Keputusan Menunggu Persetujuan
          </h2>
        </div>
        <span className="rounded-full bg-bata px-2.5 py-0.5 text-xs font-black text-white">
          {yangMenunggu.length} Perlu Tindakan
        </span>
      </div>

      {galat && (
        <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
          {galat}
        </p>
      )}

      <div className="space-y-3">
        {yangMenunggu.map((item) => {
          const kategori = item.ringkasan_kategori;
          const waktuStr = new Date(item.waktu).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.rujukan_id}
              className="flex flex-col gap-3 rounded-2xl border-2 border-[#E5B97F] bg-[#FFFDF9] p-4 sm:p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2D7B3]/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emas/30 border border-emas px-2.5 py-0.5 text-[10px] font-heading font-black uppercase text-bata">
                    Rujukan Teman Cerita (Level {item.level ?? 1})
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-teks-2">
                    <Clock className="size-3" />
                    <span>{waktuStr}</span>
                  </span>
                </div>
                <span className="text-xs font-black text-bata bg-pasir-muda px-2.5 py-1 rounded-lg">
                  {item.layanan ?? "Dukungan Komunitas"}
                </span>
              </div>

              {/* Ringkasan Kategori Emosi / Kebutuhan (Tanpa Membuka Cerita Privat) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-krem/50 rounded-xl p-3 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teks-2">
                    Kondisi Emosi
                  </span>
                  <span className="font-extrabold capitalize text-teks">
                    {kategori.perasaan ?? "Belum ada data"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teks-2">
                    Fokus Kebutuhan
                  </span>
                  <span className="font-extrabold capitalize text-teks">
                    {kategori.kebutuhan ?? "Teman sebaya"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teks-2">
                    Sumber Cerita
                  </span>
                  <span className="font-extrabold capitalize text-teks">
                    {kategori.sumber ?? "Interaksi mandiri"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-teks-2 leading-relaxed">
                Rujukan ini menghubungkan anak ke {item.layanan ?? "layanan dukungan pendamping"}. 
                Transkrip cerita anak tetap terlindungi secara privat sesuai prinsip etika.
              </p>

              {/* Tombol Aksi Persetujuan Orang Tua */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {item.bisa_memutuskan ? (
                  <>
                    <button
                      type="button"
                      disabled={memprosesId === item.rujukan_id}
                      onClick={() => tanganiKeputusan(item.rujukan_id, "tolak")}
                      className="flex items-center gap-1.5 rounded-xl border border-garis bg-white px-4 py-2 text-xs font-extrabold text-teks-2 hover:bg-rose-50 hover:text-bata transition disabled:opacity-50 cursor-pointer"
                    >
                      <X className="size-3.5" />
                      <span>Tolak</span>
                    </button>
                    <button
                      type="button"
                      disabled={memprosesId === item.rujukan_id}
                      onClick={() => tanganiKeputusan(item.rujukan_id, "setujui")}
                      className="flex items-center gap-1.5 rounded-xl bg-bata px-4 py-2 text-xs font-extrabold text-white hover:bg-bata-tua shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      <span>{memprosesId === item.rujukan_id ? "Memproses…" : "Setujui Rujukan"}</span>
                    </button>
                  </>
                ) : (
                  <p className="flex items-center gap-1 text-[11px] font-bold text-teks-2">
                    <ShieldAlert className="size-3.5 text-emas" />
                    <span>Hanya orang tua/wali yang dapat menyetujui rujukan.</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
