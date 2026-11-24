import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const n0 = (n: number | null | undefined) => (n ? Number(n).toLocaleString("es-MX") : "–");
