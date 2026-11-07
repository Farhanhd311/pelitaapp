// Alamat sesi belajar. Segmen "hari-ini" = server memilih TP sendiri (rekomendasi peta, atau TP yang
// sudah tercapai untuk sesi mengulang). Segmen lain = kode TP yang dipilih anak di peta, misalnya "B3".
export const TP_PILIHAN_SERVER = "hari-ini";
export const HREF_SESI_HARI_INI = `/anak/sesi/${TP_PILIHAN_SERVER}`;
export const hrefSesiTp = (tpKode: string) => `/anak/sesi/${encodeURIComponent(tpKode)}`;

// Peta Beranda. Mapel yang dipilih di Beranda dibawa lewat ?mapel= (Beranda -> check-in -> sesi/asesmen ->
// kembali ke peta), supaya sesi dan asesmen memakai mapel yang sama dengan peta.
export const HREF_PETA = "/anak";
export const denganMapel = (href: string, mapelId: number | null | undefined) => (mapelId ? `${href}?mapel=${mapelId}` : href);

// Dibaca di efek klien (window.location), jadi halaman tidak butuh <Suspense> untuk useSearchParams.
export function mapelDariUrl(): number | null {
  const n = Number(new URLSearchParams(window.location.search).get("mapel"));
  return Number.isInteger(n) && n > 0 ? n : null;
}
