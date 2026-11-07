// Check-in harian: energi -> cuaca hati -> keluhan -> level sesi dari server (PANDUAN 7.1, PRD 9.2).
// Anak yang belum punya progres sama sekali diarahkan ke Petualangan Pertama (asesmen) dulu.
// Pengecekan membaca sesi (cookie), jadi diletakkan di dalam <Suspense> (cacheComponents, Next 16).

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AlurCheckin } from "@/components/anak/checkin/AlurCheckin";
import { query } from "@/lib/db";
import { wajibModeAnak } from "@/lib/db/rbac";

export default function HalamanCheckin() {
  return (
    <Suspense>
      <ArahkanAnakBaruKeAsesmen />
      <AlurCheckin />
    </Suspense>
  );
}

async function ArahkanAnakBaruKeAsesmen() {
  await connection(); // dihitung per permintaan (membaca sesi dari cookie), bukan saat prerender
  const sesi = await wajibModeAnak().catch(() => null);
  if (sesi) {
    const progres = await query<{ count: number }[]>("SELECT COUNT(*) as count FROM progres_tp WHERE anak_id = ?", [sesi.anak_id]);
    if ((progres[0]?.count ?? 0) === 0) redirect("/anak/asesmen");
  }
  return null;
}
