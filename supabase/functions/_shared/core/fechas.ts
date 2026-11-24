// Fechas como texto YYYY-MM-DD (fecha civil de la Ciudad de México).
// Toda la aritmética se hace en UTC para que la zona del servidor no la mueva.

export const ZONA = "America/Mexico_City";
/** Días (naturales) desde el correo 1 para los correos 1, 2 y 3. */
export const CADENCIA = [0, 4, 9];
/** Ventana de envío, hora del centro de México: [inicio, fin). */
export const VENTANA = { inicio: 9, fin: 11 };

const aFecha = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const aIso = (d: Date) => d.toISOString().slice(0, 10);

export function sumarDias(s: string, n: number): string {
  const d = aFecha(s);
  d.setUTCDate(d.getUTCDate() + n);
  return aIso(d);
}

export type Festivos = ReadonlySet<string> | readonly string[];
const tiene = (f: Festivos | undefined, s: string) =>
  !!f && ("has" in f ? (f as ReadonlySet<string>).has(s) : (f as readonly string[]).includes(s));

export function esHabil(s: string, festivos?: Festivos): boolean {
  const w = aFecha(s).getUTCDay();
  return w > 0 && w < 6 && !tiene(festivos, s);
}

/** El mismo día si es hábil; si no, el siguiente hábil. */
export function siguienteHabil(s: string, festivos?: Festivos): string {
  let x = s;
  for (let i = 0; i < 30 && !esHabil(x, festivos); i++) x = sumarDias(x, 1);
  return x;
}

/** Fecha de hoy en la Ciudad de México. */
export function hoyMx(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

/** Hora (0–23) en la Ciudad de México. */
export function horaMx(ahora: Date = new Date()): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone: ZONA, hour: "numeric", hourCycle: "h23" }).format(ahora);
  return Number(h) % 24;
}

export function dentroDeVentana(ahora: Date = new Date(), festivos?: Festivos): boolean {
  const h = horaMx(ahora);
  return esHabil(hoyMx(ahora), festivos) && h >= VENTANA.inicio && h < VENTANA.fin;
}

/** Fecha en que le toca su siguiente correo a un contacto (sin considerar hoy). */
export function fechaDebida(
  c: { paso: number; inicio: string | null },
  inicioCampana: string,
  festivos?: Festivos,
): string | null {
  if (c.paso >= 3) return null;
  if (c.paso === 0) return siguienteHabil(inicioCampana, festivos);
  if (!c.inicio) return null;
  return siguienteHabil(sumarDias(c.inicio, CADENCIA[c.paso]), festivos);
}

/** «lun 24 nov» */
export function fmtCorto(s: string | null | undefined): string {
  if (!s) return "–";
  return aFecha(s.slice(0, 10))
    .toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
    .replace(/\./g, "");
}

export function mesCorto(s: string): string {
  const m = aFecha(s).toLocaleDateString("es-MX", { month: "short", timeZone: "UTC" }).replace(".", "");
  return m[0].toUpperCase() + m.slice(1);
}

export function diaDelMes(s: string): number {
  return aFecha(s).getUTCDate();
}
