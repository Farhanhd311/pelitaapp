"use client";

// Navigasi mode anak: sidebar di layar lebar (lg ke atas), bar bawah di tablet kecil dan ponsel.
// Pos Dasar adalah tab di halaman peta (/anak/peta?tab=pos-dasar), sesuai ARSITEKTUR bagian 3.

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House, Map, MessagesSquare, Sparkles, Sprout, type LucideIcon } from "lucide-react";
import { cn } from "cn";

type Menu = { label: string; href: string; ikon: LucideIcon; aktif: (path: string, tab: string | null) => boolean };

const MENU: Menu[] = [
  { label: "Beranda", href: "/anak", ikon: House, aktif: (p) => p === "/anak" },
  { label: "Peta Kelasku", href: "/anak/peta", ikon: Map, aktif: (p, t) => p === "/anak/peta" && t !== "pos-dasar" },
  { label: "Pos Dasar", href: "/anak/peta?tab=pos-dasar", ikon: Sprout, aktif: (p, t) => p === "/anak/peta" && t === "pos-dasar" },
  { label: "Teman Cerita", href: "/anak/teman-cerita", ikon: MessagesSquare, aktif: (p) => p.startsWith("/anak/teman-cerita") },
];

// usePathname/useSearchParams butuh Suspense (Next 16, rute dinamis). Fallback = nav yang sama
// tanpa menu aktif, lalu langsung diganti begitu URL terbaca.
export function NavAnak({ namaAnak }: { namaAnak: string }) {
  return (
    <Suspense fallback={<NavTampilan namaAnak={namaAnak} path="" tab={null} />}>
      <NavDenganUrl namaAnak={namaAnak} />
    </Suspense>
  );
}

function NavDenganUrl({ namaAnak }: { namaAnak: string }) {
  return <NavTampilan namaAnak={namaAnak} path={usePathname()} tab={useSearchParams().get("tab")} />;
}

function NavTampilan({ namaAnak, path, tab }: { namaAnak: string; path: string; tab: string | null }) {
  return (
    <>
      {/* Sidebar: layar lebar */}
      <aside className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col border-r border-garis bg-pasir-muda px-4 py-6 lg:flex">
        <Link href="/anak" className="mb-6 flex items-center gap-2.5">
          <span className="flex size-[38px] items-center justify-center rounded-xl bg-bata text-white">
            <Sparkles className="size-5" strokeWidth={2.2} aria-hidden />
          </span>
          <span>
            <span className="block font-heading text-xl leading-5 font-extrabold text-teks">PELITA</span>
            <span className="block text-[9px] font-semibold tracking-wide text-teks-2 uppercase">Teman Bertumbuh</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1" aria-label="Menu utama">
          {MENU.map((m) => {
            const aktif = m.aktif(path, tab);
            return (
              <Link
                key={m.label}
                href={m.href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-[14px] px-4 font-heading text-[15px] transition",
                  aktif ? "bg-bata font-bold text-white" : "font-semibold text-teks-2 hover:bg-pasir hover:text-teks",
                )}
              >
                <m.ikon className="size-5" strokeWidth={aktif ? 2 : 1.75} aria-hidden />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/pilih-profil" className="mt-auto flex min-h-14 items-center gap-3 rounded-[14px] hover:bg-pasir">
          <span className="flex size-[38px] items-center justify-center rounded-xl bg-merah-muda font-heading text-lg font-bold text-teks">
            {namaAnak.charAt(0)}
          </span>
          <span>
            <span className="block font-heading text-sm font-bold text-teks">{namaAnak}</span>
            <span className="block text-[11px] text-teks-2">Profilku</span>
          </span>
        </Link>
      </aside>

      {/* Bar bawah: tablet kecil dan ponsel */}
      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-garis bg-pasir-muda pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {MENU.map((m) => {
          const aktif = m.aktif(path, tab);
          return (
            <Link
              key={m.label}
              href={m.href}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
                aktif ? "text-bata" : "text-teks-2",
              )}
            >
              <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", aktif && "bg-pasir")}>
                <m.ikon className="size-5" aria-hidden />
              </span>
              {m.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
