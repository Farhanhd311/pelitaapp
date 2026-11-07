// POST /api/auth/pin: verifikasi PIN pendamping di server -> masuk mode pendamping (PRD F-AUTH-3).
// Percobaan dibatasi (lihat cekPin di lib/auth/sesi.ts). PIN tidak pernah dicatat di log.
// Kontrak: lib/kontrak/auth.ts

import { bacaBody, GalatApi, tanganiApi } from "@/lib/api/respons";
import { cekPin } from "@/lib/auth/sesi";
import { query } from "@/lib/db";
import { wajibLogin } from "@/lib/db/rbac";
import { PermintaanPin, type ResponsPin } from "@/lib/kontrak/auth";
import { catatAktivitas } from "@/lib/log";

export const POST = tanganiApi(async (req: Request) => {
  const sesi = await wajibLogin();
  if (sesi.role !== "pendamping") throw new GalatApi("TIDAK_BERHAK", "PIN hanya untuk akun pendamping.");
  const { pin } = await bacaBody(req, PermintaanPin);

  const baris = await query<{ pin_pendamping_hash: string | null }[]>(
    "SELECT pin_pendamping_hash FROM users WHERE id = ?",
    [sesi.user_id],
  );
  const hasil = await cekPin(pin, baris[0]?.pin_pendamping_hash ?? null);

  if (hasil.hasil === "terkunci") {
    const menit = Math.ceil((hasil.sampai - Date.now()) / 60000);
    throw new GalatApi("TIDAK_BERHAK", `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`);
  }
  if (hasil.hasil === "salah") {
    await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "gagal_pin" });
    throw new GalatApi("TIDAK_BERHAK", `PIN belum cocok. Sisa ${hasil.sisa} kali percobaan.`);
  }

  await catatAktivitas({ user_id: sesi.user_id, jenis_tindakan: "masuk_mode_pendamping" });
  const respons: ResponsPin = { mode: "pendamping" };
  return Response.json(respons);
});
