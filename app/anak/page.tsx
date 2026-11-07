// Beranda Anak: peta petualangan satu mapel sesuai hasil penempatan asesmen. Isi dan logika di AlurBeranda.
// Alur: "Mulai Belajar!" → check-in harian (PANDUAN 6.2), bukan langsung ke materi.
// Suspense: AlurBeranda membaca ?mapel= dari URL (useSearchParams), dan pengecekan anak baru membaca sesi (cookie).

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AlurBeranda } from "@/components/anak/beranda/AlurBeranda";
import { query } from "@/lib/db";
import { wajibModeAnak } from "@/lib/db/rbac";

export default function BerandaAnak() {
  return (
    <Suspense>
      <ArahkanAnakBaruKeAsesmen />
      <AlurBeranda />
    </Suspense>
  );
}

// Anak yang belum punya progres sama sekali (akun baru, atau setelah Reset demo) langsung ke Petualangan Pertama.
async function ArahkanAnakBaruKeAsesmen() {
  await connection(); // dihitung per permintaan (membaca sesi dari cookie), bukan saat prerender
  const sesi = await wajibModeAnak().catch(() => null);
  if (sesi) {
    const progres = await query<{ count: number }[]>("SELECT COUNT(*) as count FROM progres_tp WHERE anak_id = ?", [sesi.anak_id]);
    if ((progres[0]?.count ?? 0) === 0) redirect("/anak/asesmen");
  }
  return null;
}
