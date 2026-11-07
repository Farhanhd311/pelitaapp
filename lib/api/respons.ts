// Pembantu untuk semua API route: bentuk galat seragam (lihat lib/kontrak/umum.ts) dan validasi body.
// Pola di setiap route:
//   export const POST = tanganiApi(async (req) => {
//     const body = await bacaBody(req, SkemaPermintaan);   // 400 jika tidak sesuai kontrak
//     ...lempar new GalatApi(403, "TIDAK_BERHAK", "...") jika perlu...
//     return Response.json(hasil);
//   });

import type { z } from "zod";
import type { KodeGalat, ResponsGalat } from "@/lib/kontrak/umum";

const STATUS_HTTP: Record<KodeGalat, number> = {
  INPUT_TIDAK_VALID: 400,
  BELUM_LOGIN: 401,
  TIDAK_BERHAK: 403,
  TIDAK_DITEMUKAN: 404,
  BENTROK: 409,
  GALAT_SERVER: 500,
};

// Galat yang memang disengaja (bukan bug). Pesannya aman ditampilkan ke pengguna.
export class GalatApi extends Error {
  constructor(
    readonly kode: KodeGalat,
    pesan: string,
  ) {
    super(pesan);
  }
}

function balasGalat(kode: KodeGalat, pesan: string): Response {
  const isi: ResponsGalat = { galat: pesan, kode };
  return Response.json(isi, { status: STATUS_HTTP[kode] });
}

// Bungkus handler route: GalatApi -> respons galat sesuai kontrak; galat lain -> 500 tanpa detail
// (detail hanya di log server, tidak dikirim ke browser).
export function tanganiApi<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (galat) {
      if (galat instanceof GalatApi) return balasGalat(galat.kode, galat.message);
      console.error("Galat di API route:", galat);
      return balasGalat("GALAT_SERVER", "Maaf, ada gangguan. Coba lagi sebentar lagi.");
    }
  };
}

// Baca body JSON dan cocokkan dengan skema kontrak. Field yang tidak ada di skema dibuang.
export async function bacaBody<S extends z.ZodType>(req: Request, skema: S): Promise<z.infer<S>> {
  let isi: unknown;
  try {
    isi = await req.json();
  } catch {
    throw new GalatApi("INPUT_TIDAK_VALID", "Isi permintaan harus JSON.");
  }
  const hasil = skema.safeParse(isi);
  if (!hasil.success) {
    throw new GalatApi("INPUT_TIDAK_VALID", "Data yang dikirim tidak sesuai.");
  }
  return hasil.data;
}
