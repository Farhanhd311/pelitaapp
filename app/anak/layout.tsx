// Layout mode anak: latar krem hangat + navigasi anak (sidebar di layar lebar, bar bawah di ponsel).
// Nama anak sementara dari data contoh; nanti dari profil anak yang dipilih di sesi.

import type { ReactNode } from "react";
import { NavAnak } from "@/components/anak/NavAnak";
import { NAMA_ANAK_CONTOH } from "./data-contoh";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-krem text-teks">
      <NavAnak namaAnak={NAMA_ANAK_CONTOH} />
      {/* pb-20: ruang untuk bar bawah di layar kecil */}
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
    </div>
  );
}
