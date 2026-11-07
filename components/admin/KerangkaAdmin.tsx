"use client";

// Kerangka semua halaman admin: menu samping (susunan ditentukan tim), profil, dan keluar.
// Eskalasi dan Log Aktivitas tidak di menu: ringkasannya ada di laporan Beranda (halamannya tetap bisa dibuka dari sana).
// Tampilan menu sama dengan menu samping mode anak (components/anak/NavAnak.tsx).
// Reset demo sengaja TIDAK di sini (mudah tertekan, menghapus progres Raka): ada di Beranda, bagian Persiapan demo.
// Pemeriksaan peran di sini hanya untuk tampilan; hak akses SEBENARNYA dicek di setiap API route (wajibAdmin).
// Halaman selalu dirender di dalam kerangka (Next 16 memvalidasi navigasi instan per segmen); pesan
// "khusus admin" menggantikannya hanya setelah profil terbukti bukan admin.

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import { BookOpenCheck, ChartColumn, ChevronUp, House, Library, LogOut, SlidersHorizontal } from "lucide-react";
import { cn } from "cn";
import { LogoPelita } from "@/components/LogoPelita";
import { PenyediaAdmin } from "@/components/admin/konteks";
import { panggilApi } from "@/lib/api/klien";
import type { ResponsProfil } from "@/lib/kontrak/auth";

const MENU = [
  { href: "/admin", label: "Beranda", ikon: House },
  { href: "/admin/bank-soal", label: "Bank Soal", ikon: BookOpenCheck },
  { href: "/admin/materi", label: "Materi", ikon: Library },
  { href: "/admin/aturan-ai", label: "Aturan AI", ikon: SlidersHorizontal },
  { href: "/admin/evaluasi-ai", label: "Evaluasi AI", ikon: ChartColumn },
];

type Status = "memuat" | "admin" | "bukan_admin";

export function KerangkaAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("memuat");
  const [nama, setNama] = useState("");

  useEffect(() => {
    panggilApi<ResponsProfil>("/api/auth/profil")
      .then((p) => {
        setNama(p.nama);
        setStatus(p.role === "admin" ? "admin" : "bukan_admin");
      })
      .catch(() => setStatus("bukan_admin"));
  }, []);

  async function keluar() {
    await panggilApi("/api/auth/logout", {}).catch(() => null);
    router.replace("/login");
  }

  if (status === "bukan_admin") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-krem p-6 text-center">
        <LogoPelita />
        <h1 className="text-xl font-extrabold">Halaman ini khusus admin</h1>
        <p className="text-sm text-teks-2">Masuk dengan akun admin untuk mengelola PELITA.</p>
        <Link href="/login" className="rounded-xl bg-bata px-5 py-2.5 font-bold text-white hover:bg-bata-tua">
          Ke halaman masuk
        </Link>
      </main>
    );
  }

  return (
    <PenyediaAdmin>
      <div className="flex min-h-dvh flex-col bg-krem text-teks lg:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-garis bg-pasir-muda px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-[220px] lg:border-r lg:border-b-0 lg:py-6">
          <div className="flex items-center justify-between gap-3 lg:mb-6">
            <Link href="/admin" className="flex items-center" aria-label="PELITA, ke Beranda admin">
              <LogoPelita ukuran={40} />
            </Link>
            {/* Ponsel: avatar saja di pojok kanan atas */}
            <div className="lg:hidden">
              <MenuProfil nama={nama} ringkas onKeluar={keluar} />
            </div>
          </div>
          <Navigasi />
          <div className="mt-auto hidden pt-4 lg:block">
            <MenuProfil nama={nama} onKeluar={keluar} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </PenyediaAdmin>
  );
}

// Profil admin = tombol. Keluar hanya ada di menu yang muncul setelah profil ditekan (tidak tertekan tanpa sengaja).
function MenuProfil({ nama, ringkas = false, onKeluar }: { nama: string; ringkas?: boolean; onKeluar: () => void }) {
  const inisial = (nama || "A").charAt(0);
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`Menu profil ${nama || "Admin"}`}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-[14px] text-left transition outline-none hover:bg-pasir focus-visible:ring-4 focus-visible:ring-emas/50 data-[popup-open]:bg-pasir",
          ringkas ? "p-1" : "min-h-14 w-full px-2",
        )}
      >
        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-merah-muda font-heading text-lg font-bold text-teks">
          {inisial}
        </span>
        {!ringkas && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-sm font-bold text-teks">{nama || "Admin"}</span>
              <span className="block text-[11px] text-teks-2">Administrator</span>
            </span>
            <ChevronUp className="size-4 shrink-0 text-teks-2" aria-hidden />
          </>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side={ringkas ? "bottom" : "top"} align={ringkas ? "end" : "start"} sideOffset={8} className="z-[80]">
          <Popover.Popup className="w-56 rounded-2xl border border-garis bg-white p-1.5 shadow-[0_12px_32px_rgba(46,11,7,0.14)] outline-none">
            <div className="border-b border-garis px-3 py-2">
              <p className="truncate font-heading text-sm font-bold">{nama || "Admin"}</p>
              <p className="text-xs text-teks-2">Administrator</p>
            </div>
            <button
              type="button"
              onClick={onKeluar}
              className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-heading text-sm font-semibold text-teks transition outline-none hover:bg-pasir-muda focus-visible:bg-pasir-muda"
            >
              <LogOut className="size-4.5 text-bata" aria-hidden /> Keluar
            </button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Navigasi() {
  const pathname = usePathname() ?? ""; // bisa kosong saat Next memvalidasi render di server
  return (
    <nav className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 lg:mt-0 lg:flex-col lg:overflow-visible" aria-label="Menu admin">
      {MENU.map(({ href, label, ikon: Ikon }) => {
        // Eskalasi dan Log dibuka dari Beranda, jadi menu Beranda tetap aktif di sana.
        const aktif =
          href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/eskalasi") || pathname.startsWith("/admin/log-aktivitas") : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={aktif ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-[14px] px-4 font-heading text-[15px] whitespace-nowrap transition lg:min-h-14",
              aktif ? "bg-bata font-bold text-white" : "font-semibold text-teks-2 hover:bg-pasir hover:text-teks",
            )}
          >
            <Ikon className="size-5 shrink-0" strokeWidth={aktif ? 2 : 1.75} aria-hidden />
            <span className="flex-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
