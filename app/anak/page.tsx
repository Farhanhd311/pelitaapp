// Beranda Anak: peta petualangan satu mapel sesuai hasil penempatan asesmen. Isi dan logika di AlurBeranda.
// Alur: "Mulai Belajar!" → check-in harian (PANDUAN 6.2), bukan langsung ke materi.
// Suspense: AlurBeranda membaca ?mapel= dari URL (useSearchParams).

<<<<<<< HEAD
import { redirect } from "next/navigation";
import { BookOpen, HelpCircle } from "lucide-react";
import { DialogPanduan } from "@/components/anak/beranda/DialogAnak";
import { KartuSamping } from "@/components/anak/beranda/KartuSamping";
import { PetaPetualangan } from "@/components/anak/beranda/PetaPetualangan";
import { wajibModeAnak } from "@/lib/db/rbac";
import { query } from "@/lib/db";
import { BERANDA_CONTOH } from "./data-contoh";

const HREF_MULAI = "/anak/checkin";

export default async function BerandaAnak() {
  const sesi = await wajibModeAnak().catch(() => null);
  if (sesi) {
    const progres = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM progres_tp WHERE anak_id = ?",
      [sesi.anak_id],
    );
    if ((progres[0]?.count ?? 0) === 0) {
      redirect("/anak/asesmen");
    }
  }

  const data = BERANDA_CONTOH;
  const sapaan = `Halo, ${data.namaAnak}!`;
  const ajakan = "Yuk, lanjutkan belajarmu hari ini!";

=======
import { Suspense } from "react";
import { AlurBeranda } from "@/components/anak/beranda/AlurBeranda";

export default function BerandaAnak() {
>>>>>>> 8fa8747a4e8c9c9837290b48e123bf04e371a288
  return (
    <Suspense>
      <AlurBeranda />
    </Suspense>
  );
}
