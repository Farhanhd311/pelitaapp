// Kirim pesan WhatsApp lewat gateway Fonnte (https://docs.fonnte.com/api-send-message/). HANYA di server.
//   POST https://api.fonnte.com/send, header Authorization: <token> (tanpa "Bearer"), isian form: target, message.
//   Respons: { status: true, ... } atau { status: false, reason: "..." } (kadang ditulis "Status").
// Token dari environment FONNTE_TOKEN (tidak pernah di kode atau di browser). Tanpa token -> tidak mengirim.

const URL_FONNTE = "https://api.fonnte.com/send";
const BATAS_WAKTU_MS = 10_000; // jangan biarkan pendaftaran menunggu gateway terlalu lama

export type HasilKirimWa = { terkirim: true } | { terkirim: false; alasan: string };

/** noWa dalam bentuk baku "62xxxxxxxxx" (lihat normalisasiNoWa di lib/auth/daftar.ts). */
export async function kirimWhatsApp(noWa: string, pesan: string): Promise<HasilKirimWa> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return { terkirim: false, alasan: "FONNTE_TOKEN belum diisi" };

  const form = new FormData();
  form.append("target", noWa);
  form.append("message", pesan);
  form.append("countryCode", "62");
  try {
    const res = await fetch(URL_FONNTE, {
      method: "POST",
      headers: { Authorization: token },
      body: form,
      signal: AbortSignal.timeout(BATAS_WAKTU_MS),
    });
    const isi = (await res.json().catch(() => null)) as { status?: boolean; Status?: boolean; reason?: string } | null;
    if (res.ok && (isi?.status === true || isi?.Status === true)) return { terkirim: true };
    return { terkirim: false, alasan: isi?.reason ?? `HTTP ${res.status}` };
  } catch (galat) {
    return { terkirim: false, alasan: galat instanceof Error ? galat.message : "galat jaringan" };
  }
}
