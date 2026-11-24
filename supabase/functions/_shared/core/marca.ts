import type { DespachoMarca } from "./tipos.ts";

/** Luminancia relativa simple (0 = negro, 1 = blanco). */
export function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

export interface Marca {
  color: string;
  texto: string;
  tenue: string;
  oscuro: boolean;
}

/** Color de marca y colores de texto encima (blanco si el fondo es oscuro, azul si es claro). */
export function marca(d: Pick<DespachoMarca, "color">): Marca {
  const c = /^#[0-9a-f]{6}$/i.test(d.color || "") ? (d.color as string).toUpperCase() : "#393939";
  const oscuro = lum(c) < 0.6;
  return { color: c, texto: oscuro ? "#FFFFFF" : "#2D3590", tenue: oscuro ? "#E4E4E4" : "#6A7392", oscuro };
}

/** Nombre corto: el que escribió el despacho, o su nombre sin «Contadores», «Despacho», etc. */
export function cortoDe(d: Pick<DespachoMarca, "nombre" | "corto">): string {
  return (
    (d.corto || "").trim() ||
    d.nombre
      .replace(/(^|\s)(Contadores Públicos|Contadores|Despacho|Consultores|Asesores)(?=\s|$)/gi, " ")
      .replace(/\s+/g, " ")
      .trim() ||
    d.nombre
  );
}

export function sitioTexto(sitio?: string | null): string {
  return (sitio || "tu sitio web").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function iniciales(nombre: string): string {
  return (
    (nombre || "D")
      .split(/\s+/)
      .filter((w) => /^[A-Za-zÁÉÍÓÚÑ]/.test(w) && w.length > 2)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "D"
  );
}

/** Logo provisional con iniciales (SVG). En producción se convierte a PNG antes de subirlo,
 *  porque Gmail y Outlook no muestran SVG. */
export function logoProvisionalSvg(nombre: string, color?: string): string {
  const c = !color || color.toUpperCase() === "#FFFFFF" ? "#2d3590" : color;
  const esc = (s: string) => s.replace(/[&<>'"]/g, "");
  const n = esc(nombre || "Despacho");
  const l1 = n.length > 16 ? n.slice(0, 16) : n;
  return (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 80' width='160' height='80'>" +
    "<rect width='160' height='80' rx='10' fill='#fff'/>" +
    `<rect x='10' y='14' width='52' height='52' rx='12' fill='${c}'/>` +
    `<text x='36' y='49' text-anchor='middle' font-family='Arial,sans-serif' font-size='24' font-weight='700' fill='#fff'>${iniciales(nombre)}</text>` +
    `<text x='72' y='45' font-family='Arial,sans-serif' font-size='11' font-weight='700' fill='#2d3590'>${l1}</text>` +
    "</svg>"
  );
}

export function logoProvisionalDataUri(nombre: string, color?: string): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(logoProvisionalSvg(nombre, color));
}

/**
 * Detección del color de fondo a partir de los píxeles del logo (RGBA, como ImageData.data).
 * No es IA: lee las 4 esquinas y el brillo promedio.
 */
export function analizarLogo(
  data: ArrayLike<number>,
  w: number,
  h: number,
): { color: string; nota: string } {
  const px = (i: number, j: number) => {
    const k = (j * w + i) * 4;
    return [data[k], data[k + 1], data[k + 2], data[k + 3]];
  };
  const cs = [px(1, 1), px(w - 2, 1), px(1, h - 2), px(w - 2, h - 2)];
  const hex = (c: number[]) =>
    "#" + c.slice(0, 3).map((v) => ("0" + Math.round(v).toString(16)).slice(-2)).join("").toUpperCase();
  if (
    cs.every(
      (c) =>
        c[3] > 240 &&
        Math.abs(c[0] - cs[0][0]) + Math.abs(c[1] - cs[0][1]) + Math.abs(c[2] - cs[0][2]) < 40,
    )
  )
    return { color: hex(cs[0]), nota: "Tu logo trae fondo: usamos ese mismo color para que se integre." };
  const t = [0, 0, 0];
  let n = 0;
  for (let k = 0; k < data.length; k += 16) {
    if (data[k + 3] > 128) {
      t[0] += data[k];
      t[1] += data[k + 1];
      t[2] += data[k + 2];
      n++;
    }
  }
  if (!n) return { color: "#393939", nota: "" };
  return (0.299 * t[0] + 0.587 * t[1] + 0.114 * t[2]) / n / 255 > 0.6
    ? { color: "#393939", nota: "Tu logo es claro y sin fondo: usamos un fondo oscuro para que se lea." }
    : { color: "#FFFFFF", nota: "Tu logo es oscuro o de color y sin fondo: usamos fondo blanco para que se lea." };
}
