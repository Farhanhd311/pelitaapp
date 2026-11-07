// Halaman masuk pendamping/admin (PRD F-AUTH-1). Layar lebar: panel sambutan di kiri, formulir di kanan.

import { FormMasuk } from "@/components/auth/FormMasuk";
import { PanelSambut } from "@/components/auth/PanelSambut";

export const metadata = { title: "Masuk · PELITA" };

export default function HalamanMasuk() {
  return (
    <main className="flex min-h-dvh flex-1 bg-krem p-3 text-teks sm:p-4">
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="hidden lg:block">
          <PanelSambut />
        </div>
        <div className="flex items-center justify-center px-3 py-8 sm:px-8">
          <FormMasuk />
        </div>
      </div>
    </main>
  );
}
