import type { Config } from "./tipos.ts";

/** Extrae el número de un texto como «$4,500». */
export function numero(t: unknown): number {
  return parseInt(String(t ?? "").replace(/[^\d]/g, ""), 10) || 0;
}

/** 4500 → «$4,500» */
export function pesos(t: unknown): string {
  const n = numero(t);
  return n ? "$" + n.toLocaleString("en-US") : "";
}

/** Descuento redondeado contra el precio normal, como «25%». Vacío si no hay descuento. */
export function descuentoDe(precio: unknown, original: unknown): string {
  const a = numero(precio);
  const b = numero(original);
  return a && b && a < b ? Math.round((1 - a / b) * 100) + "%" : "";
}

/** Precio que ve el cliente: el del despacho si cumple el mínimo; si no, el sugerido. */
export function precioDe(d: { precio?: number | null }, cfg: Config): number {
  const n = numero(d.precio);
  return n >= cfg.minimo ? n : cfg.precio_sugerido;
}

export function gananciaPorEmpresa(precio: number, cfg: Config): number | null {
  return precio >= cfg.minimo ? precio - cfg.minimo : null;
}

/** Año de 4 dígitos que aparece en la frase de temporada, si hay. */
export function anioEnFrase(frase: string): string | null {
  return (frase.match(/\b20\d\d\b/) || [])[0] ?? null;
}
