// Kolom isian bulat bergaya PELITA, dipakai halaman masuk dan daftar.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Isian({
  id,
  label,
  ikon,
  type,
  autoComplete,
  value,
  onChange,
  placeholder,
  galat = false,
  tambahan,
  opsional = false,
  inputMode,
  max,
}: {
  id: string;
  label: string;
  ikon: ReactNode;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  galat?: boolean;
  tambahan?: ReactNode;
  opsional?: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
  max?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-bold text-teks">
        {label}
        {opsional && <span className="ml-1 font-semibold text-teks-2">(boleh dikosongkan)</span>}
      </label>
      <div
        className={cn(
          "flex min-h-13 items-center gap-2.5 rounded-full border-2 bg-[#FCECD7]/65 pr-2 pl-4 transition-[border-color,box-shadow,background-color] focus-within:border-jingga focus-within:bg-white focus-within:ring-4 focus-within:ring-emas/35",
          galat ? "border-emas" : "border-[#E5B97F]/80",
        )}
      >
        <span className="text-bata/85">{ikon}</span>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={galat}
          required={!opsional}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-semibold text-teks outline-none placeholder:font-normal placeholder:text-teks-2/60"
        />
        {tambahan}
      </div>
    </div>
  );
}
