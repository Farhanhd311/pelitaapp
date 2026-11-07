// Beranda Anak: peta petualangan satu mapel sesuai hasil penempatan asesmen. Isi dan logika di AlurBeranda.
// Alur: "Mulai Belajar!" → check-in harian (PANDUAN 6.2), bukan langsung ke materi.
// Suspense: AlurBeranda membaca ?mapel= dari URL (useSearchParams).

import { Suspense } from "react";
import { AlurBeranda } from "@/components/anak/beranda/AlurBeranda";

export default function BerandaAnak() {
  return (
    <Suspense>
      <AlurBeranda />
    </Suspense>
  );
}
