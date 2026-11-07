// Check-in harian: energi -> cuaca hati -> keluhan -> level sesi dari server (PANDUAN 7.1, PRD 9.2).

import { redirect } from "next/navigation";
import { wajibModeAnak } from "@/lib/db/rbac";
import { query } from "@/lib/db";
import { AlurCheckin } from "@/components/anak/checkin/AlurCheckin";

export default async function HalamanCheckin() {
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

  return <AlurCheckin />;
}
