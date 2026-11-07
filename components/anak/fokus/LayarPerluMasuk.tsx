// Ditampilkan di layar fokus anak saat server menolak karena belum login (BELUM_LOGIN) atau
// yang login pendamping tetapi belum memilih avatar anak (TIDAK_BERHAK).

import { MascotPijar } from "@/components/anak/MascotPijar";
import { TautanAnak } from "@/components/anak/fokus/TombolAnak";
import type { GalatKlien } from "@/lib/api/klien";

export function LayarPerluMasuk({ galat }: { galat: GalatKlien }) {
  const belumLogin = galat.kode === "BELUM_LOGIN";
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
      <MascotPijar ekspresi="mengintip" ukuran={150} />
      <h1 className="mt-3 text-[26px] font-extrabold">{belumLogin ? "Masuk dulu, ya" : "Pilih profilmu dulu, ya"}</h1>
      <p className="mt-1 text-[16px] text-teks-2">
        {belumLogin ? "Minta Ayah, Ibu, atau kakak pendamping untuk masuk, lalu ketuk avatarmu." : galat.message}
      </p>
      <TautanAnak href={belumLogin ? "/login" : "/pilih-profil"} className="mt-6 w-full sm:w-auto sm:min-w-56">
        {belumLogin ? "Ke halaman masuk" : "Pilih profil"}
      </TautanAnak>
    </div>
  );
}
