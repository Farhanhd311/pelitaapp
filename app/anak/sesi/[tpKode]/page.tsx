// Sesi belajar satu TP: kartu belajar -> kuis formatif -> AI tutor -> cek "Masih kuat?" (PANDUAN 7.1-7.4).
// Segmen "hari-ini" berarti server yang memilih TP (lihat components/anak/sesi/jalur.ts).

import { Suspense } from "react";
import { AlurSesi } from "@/components/anak/sesi/AlurSesi";

export default function HalamanSesi({ params }: PageProps<"/anak/sesi/[tpKode]">) {
  return (
    <Suspense>
      <AlurSesi params={params} />
    </Suspense>
  );
}
