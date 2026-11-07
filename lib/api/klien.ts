// Pemanggil API dari browser (komponen "use client"). Pasangan dari lib/api/respons.ts di server:
// galat dari server ({ galat, kode }) diubah menjadi GalatKlien supaya layar bisa menampilkan
// pesan ramahnya apa adanya.

import type { KodeGalat, ResponsGalat } from "@/lib/kontrak/umum";

export class GalatKlien extends Error {
  constructor(
    readonly kode: KodeGalat | "JARINGAN",
    pesan: string,
  ) {
    super(pesan);
  }
}

/** GET jika `body` tidak diisi, POST JSON jika diisi. */
export async function panggilApi<T>(url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(
      url,
      body === undefined
        ? { cache: "no-store" }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
  } catch {
    throw new GalatKlien("JARINGAN", "Sambungan internet terputus. Coba lagi, ya.");
  }
  const isi: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const galat = isi as ResponsGalat | null;
    throw new GalatKlien(galat?.kode ?? "GALAT_SERVER", galat?.galat ?? "Maaf, ada gangguan. Coba lagi sebentar lagi.");
  }
  return isi as T;
}

/** Galat karena belum login / belum memilih profil anak: layar harus mengarahkan ke halaman masuk. */
export const butuhMasuk = (galat: unknown): galat is GalatKlien =>
  galat instanceof GalatKlien && (galat.kode === "BELUM_LOGIN" || galat.kode === "TIDAK_BERHAK");

export const pesanGalat = (galat: unknown) =>
  galat instanceof GalatKlien ? galat.message : "Maaf, ada gangguan. Coba lagi sebentar lagi.";
