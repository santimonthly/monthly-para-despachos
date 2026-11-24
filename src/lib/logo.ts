// Logo del despacho: se redimensiona a 480 px de ancho, se convierte a PNG y se detecta su color.
import { analizarLogo, logoProvisionalSvg } from "@core/marca.ts";

const cargarImagen = (src: string) =>
  new Promise<HTMLImageElement>((ok, mal) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => ok(im);
    im.onerror = () => mal(new Error("No pudimos leer esa imagen."));
    im.src = src;
  });

const aBlob = (cv: HTMLCanvasElement) =>
  new Promise<Blob>((ok, mal) => cv.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo convertir la imagen."))), "image/png"));

function lienzo(im: HTMLImageElement, anchoMax = 480) {
  const w = im.naturalWidth || im.width || 160;
  const h = im.naturalHeight || im.height || 80;
  const k = Math.min(1, anchoMax / w);
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(w * k));
  cv.height = Math.max(1, Math.round(h * k));
  cv.getContext("2d")!.drawImage(im, 0, 0, cv.width, cv.height);
  return cv;
}

export async function procesarLogo(file: File): Promise<{ blob: Blob; color: string; nota: string }> {
  const url = URL.createObjectURL(file);
  try {
    const cv = lienzo(await cargarImagen(url));
    const px = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height);
    return { blob: await aBlob(cv), ...analizarLogo(px.data, cv.width, cv.height) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Recalcula el color desde un logo ya subido. */
export async function colorDesdeUrl(src: string): Promise<{ color: string; nota: string }> {
  const cv = lienzo(await cargarImagen(src));
  const px = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height);
  return analizarLogo(px.data, cv.width, cv.height);
}

/** Logo provisional con iniciales, en PNG (Gmail y Outlook no muestran SVG). */
export async function logoProvisionalPng(nombre: string, color: string): Promise<Blob> {
  const svg = logoProvisionalSvg(nombre, color).replace("width='160' height='80'", "width='320' height='160'");
  const im = await cargarImagen("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
  return aBlob(lienzo(im, 320));
}
