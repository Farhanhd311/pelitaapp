// Layout mode anak: latar krem hangat, tanpa sidebar/menu. Anak cukup melihat peta di Beranda;
// layar check-in, sesi, dan asesmen tampil penuh di atasnya (LayarFokus).

import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-krem text-teks">{children}</main>;
}
