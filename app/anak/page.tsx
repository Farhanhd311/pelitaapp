// Beranda Anak: sapaan, petualangan hari ini, peta jalur belajar, dan kartu pendukung.
// Alur: "Mulai Belajar!" → check-in harian (PANDUAN 6.2), bukan langsung ke materi.

import { BookOpen, HelpCircle } from "lucide-react";
import { DialogPanduan } from "@/components/anak/beranda/DialogAnak";
import { KartuSamping } from "@/components/anak/beranda/KartuSamping";
import { PetaPetualangan } from "@/components/anak/beranda/PetaPetualangan";
import { BERANDA_CONTOH } from "./data-contoh";

const HREF_MULAI = "/anak/checkin";

export default function BerandaAnak() {
  const data = BERANDA_CONTOH;
  const sapaan = `Halo, ${data.namaAnak}!`;
  const ajakan = "Yuk, lanjutkan belajarmu hari ini!";

  return (
    // Layar lebar (xl): halaman setinggi layar; header, banner, dan kartu samping diam,
    // hanya peta yang bergulir. Layar lebih kecil: seluruh halaman bergulir seperti biasa.
    <div className="flex flex-col xl:h-dvh">
      <header className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-7">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-extrabold text-teks sm:text-[28px]">{sapaan} 👋</h1>
          <p className="text-[15px] text-teks-2">{ajakan}</p>
        </div>
        <DialogPanduan
          className="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-garis bg-pasir-muda font-heading text-sm font-bold text-bata transition hover:bg-pasir sm:px-5"
          pemicu={
            <>
              {/* ponsel: ikon saja agar sapaan tidak terjepit */}
              <HelpCircle className="size-5" aria-hidden /> <span className="sr-only sm:not-sr-only">Butuh bantuan?</span>
            </>
          }
        />
      </header>

      <section className="flex flex-wrap items-center gap-3 bg-pasir px-4 py-2.5 text-teks sm:px-7">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.12em] text-bata uppercase">Petualangan hari ini</p>
          <h2 className="text-xl font-extrabold">{data.judulPetualangan}</h2>
        </div>
        <DialogPanduan
          className="flex min-h-14 items-center gap-2 rounded-full border border-jingga bg-pasir-muda px-5 font-heading text-sm font-bold transition hover:bg-krem"
          pemicu={
            <>
              <BookOpen className="size-5" aria-hidden /> Lihat panduan
            </>
          }
        />
      </section>

      <div className="flex flex-col xl:min-h-0 xl:flex-1 xl:flex-row">
        <div className="min-w-0 flex-1 xl:overflow-y-auto xl:overscroll-contain">
          <PetaPetualangan
            namaAnak={data.namaAnak}
            sebelumnya={data.sebelumnya}
            sekarang={data.sekarang}
            berikutnya={data.berikutnya}
            hrefMulai={HREF_MULAI}
          />
        </div>

        <aside className="grid gap-4 p-4 sm:grid-cols-2 sm:px-7 lg:grid-cols-3 xl:flex xl:w-[340px] xl:shrink-0 xl:flex-col xl:overflow-y-auto xl:px-4 xl:py-5">
          <KartuSamping mekarMingguIni={data.mekarMingguIni} />
        </aside>
      </div>
    </div>
  );
}
