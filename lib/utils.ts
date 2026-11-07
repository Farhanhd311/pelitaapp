export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
export type ClassDictionary = Record<string, unknown>;
export type ClassArray = ClassValue[];

function toVal(mix: ClassValue): string {
  if (typeof mix === "string" || typeof mix === "number") return String(mix);
  if (typeof mix !== "object" || mix === null) return "";
  if (Array.isArray(mix)) {
    return mix.map(toVal).filter(Boolean).join(" ");
  }
  return Object.entries(mix)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
    .join(" ");
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toVal).filter(Boolean).join(" ");
}

