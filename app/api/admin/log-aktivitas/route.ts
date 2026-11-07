// GET /api/admin/log-aktivitas?user_id=&jenis=&dari=&sampai=[&format=csv]: log aktivitas akun (PANDUAN 8.7, PRD 9.14).
// Hanya baca: tidak ada route untuk mengubah/menghapus log. Log tidak berisi data sensitif. Admin saja.
// Kontrak: lib/kontrak/admin.ts

import { GalatApi, tanganiApi } from "@/lib/api/respons";
import { bacaJson, query } from "@/lib/db";
import { wajibAdmin } from "@/lib/db/rbac";
import { FilterLog, type ResponsLog } from "@/lib/kontrak/admin";

// Batas baris per permintaan supaya halaman tetap ringan (pilihan tampilan, bukan aturan bisnis).
const BATAS_BARIS = 1000;

function selCsv(nilai: unknown): string {
  const teks = nilai === null || nilai === undefined ? "" : typeof nilai === "string" ? nilai : JSON.stringify(nilai);
  return /[",\n\r]/.test(teks) ? `"${teks.replace(/"/g, '""')}"` : teks;
}

export const GET = tanganiApi(async (req: Request) => {
  await wajibAdmin();
  const f = FilterLog.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!f.success) throw new GalatApi("INPUT_TIDAK_VALID", "Filter tidak valid.");

  const syarat: string[] = [];
  const nilai: unknown[] = [];
  if (f.data.user_id !== undefined) {
    syarat.push("l.user_id = ?");
    nilai.push(f.data.user_id);
  }
  if (f.data.jenis) {
    syarat.push("l.jenis_tindakan = ?");
    nilai.push(f.data.jenis);
  }
  if (f.data.dari) {
    syarat.push("l.created_at >= ?");
    nilai.push(new Date(f.data.dari));
  }
  if (f.data.sampai) {
    syarat.push("l.created_at <= ?");
    nilai.push(new Date(f.data.sampai));
  }

  const baris = await query<
    { id: number; created_at: Date; user_id: number | null; nama: string | null; jenis_tindakan: string; entitas: string | null; entitas_id: string | null; detail_json: string | null }[]
  >(
    `SELECT l.id, l.created_at, l.user_id, u.nama, l.jenis_tindakan, l.entitas, l.entitas_id, l.detail_json
     FROM log_aktivitas l LEFT JOIN users u ON u.id = l.user_id
     ${syarat.length ? `WHERE ${syarat.join(" AND ")}` : ""}
     ORDER BY l.id DESC LIMIT ?`,
    [...nilai, BATAS_BARIS],
  );
  const log: ResponsLog["log"] = baris.map((b) => ({
    id: b.id,
    waktu: b.created_at.toISOString(),
    user_id: b.user_id,
    nama: b.nama,
    jenis_tindakan: b.jenis_tindakan,
    entitas: b.entitas,
    entitas_id: b.entitas_id,
    detail: bacaJson(b.detail_json),
  }));

  if (f.data.format === "csv") {
    const kepala = ["id", "waktu_utc", "user_id", "nama", "jenis_tindakan", "entitas", "entitas_id", "detail"];
    const isi = log.map((l) => [l.id, l.waktu, l.user_id, l.nama, l.jenis_tindakan, l.entitas, l.entitas_id, l.detail].map(selCsv).join(","));
    return new Response([kepala.join(","), ...isi].join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="log-aktivitas-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  const respons: ResponsLog = { log };
  return Response.json(respons);
});
