"use client";

// Layar fokus anak (check-in, sesi belajar): menutupi sidebar dan bar bawah supaya anak hanya melihat
// satu tugas. Latar krem dengan lingkaran lembut (desain asesmen). Gerak mengikuti setelan
// "kurangi gerak" di perangkat (reducedMotion="user").

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

export function LayarFokus({ kiri, tengah, kanan, children }: { kiri?: ReactNode; tengah?: ReactNode; kanan?: ReactNode; children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 overflow-y-auto bg-krem text-teks">
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <span className="absolute -top-28 -left-28 size-80 rounded-full bg-pasir/60" />
          <span className="absolute top-[22%] -right-20 size-56 rounded-full bg-merah-muda/25" />
          <span className="absolute -right-24 -bottom-32 size-96 rounded-full bg-pasir/50" />
          <span className="absolute bottom-28 left-[8%] size-20 rounded-full bg-merah-muda/20" />
        </div>

        <div className="relative mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pt-4 pb-10 sm:px-8 sm:pt-6">
          <header className="flex min-h-14 items-center gap-3 sm:gap-5">
            {kiri}
            <div className="min-w-0 flex-1">{tengah}</div>
            {kanan}
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </MotionConfig>
  );
}
