// Alamat sesi belajar. Segmen "hari-ini" = server memilih TP sendiri (rekomendasi peta, atau TP yang
// sudah tercapai untuk sesi mengulang). Segmen lain = kode TP yang dipilih anak di peta, misalnya "B3".
export const TP_PILIHAN_SERVER = "hari-ini";
export const HREF_SESI_HARI_INI = `/anak/sesi/${TP_PILIHAN_SERVER}`;
export const hrefSesiTp = (tpKode: string) => `/anak/sesi/${encodeURIComponent(tpKode)}`;
