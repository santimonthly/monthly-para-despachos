// Validación del Excel de contactos (las filas ya vienen leídas como arreglos).

export const ENCABEZADOS = ["Empresa*", "Nombre del contacto*", "Correo*", "Teléfono"];

export interface FilaImport {
  fila: number;
  empresa: string;
  nombre: string;
  correo: string;
  tel: string;
  motivo?: string;
  tipo?: "err" | "omit";
}

export type ResultadoImport =
  | { fatal: string }
  | { ok: FilaImport[]; err: FilaImport[]; omit: FilaImport[] };

export const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z ]/g, "")
    .trim();

export function validarFilas(
  rows: unknown[][],
  opts: { yaCargados: Iterable<string>; supresiones: Iterable<string> },
): ResultadoImport {
  let hi = -1;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    if ((rows[i] || []).map(norm).includes("empresa")) {
      hi = i;
      break;
    }
  }
  if (hi < 0) return { fatal: "No encontramos la columna «Empresa». Usa la plantilla para que las columnas coincidan." };

  const cab = rows[hi].map(norm);
  const col = (a: string[]) => {
    for (const k of a) {
      const p = cab.indexOf(k);
      if (p >= 0) return p;
    }
    return -1;
  };
  const ce = col(["empresa"]);
  const cn = col(["nombre del contacto", "nombre", "contacto"]);
  const cc = col(["correo", "email", "correo electronico"]);
  const ct = col(["telefono", "tel"]);
  const falt: string[] = [];
  if (cn < 0) falt.push("Nombre del contacto");
  if (cc < 0) falt.push("Correo");
  if (falt.length)
    return { fatal: "Faltan columnas en tu archivo: " + falt.join(" y ") + ". Descarga la plantilla y vuelve a intentarlo." };

  const ya = new Set([...opts.yaCargados].map((x) => x.toLowerCase()));
  const sup = new Set([...opts.supresiones].map((x) => x.toLowerCase()));
  const vistos = new Set<string>();
  const R = { ok: [] as FilaImport[], err: [] as FilaImport[], omit: [] as FilaImport[] };

  rows.slice(hi + 1).forEach((r0, i) => {
    const r = r0 || [];
    const e = String(r[ce] ?? "").trim();
    const n = String(r[cn] ?? "").trim();
    const c = String(r[cc] ?? "").trim();
    const t = ct >= 0 ? String(r[ct] ?? "").trim() : "";
    const fila = hi + i + 2;
    if (!e && !n && !c) return;
    const base: FilaImport = { fila, empresa: e, nombre: n, correo: c, tel: t };
    const k = c.toLowerCase();
    const m: string[] = [];
    if (!e) m.push("falta la empresa");
    if (!n) m.push("falta el nombre");
    if (!c) m.push("falta el correo");
    else if (!RE_CORREO.test(c)) m.push("el correo no es válido");
    if (m.length) {
      const motivo = m.join(", ");
      R.err.push({ ...base, tipo: "err", motivo: motivo[0].toUpperCase() + motivo.slice(1) });
      return;
    }
    if (vistos.has(k)) return void R.omit.push({ ...base, tipo: "omit", motivo: "Correo repetido en el archivo" });
    vistos.add(k);
    if (ya.has(k)) return void R.omit.push({ ...base, tipo: "omit", motivo: "Ya estaba cargado" });
    if (sup.has(k)) return void R.omit.push({ ...base, tipo: "omit", motivo: "Se dio de baja antes" });
    R.ok.push(base);
  });
  if (!R.ok.length && !R.err.length && !R.omit.length)
    return { fatal: "El archivo no tiene contactos. Agrega al menos una fila debajo de los encabezados." };
  return R;
}

/** Archivo de ejemplo con errores a propósito (botón «Probar con un archivo de ejemplo»). */
export const EJEMPLO: string[][] = [
  ENCABEZADOS,
  ["Grupo Industrial Apodaca", "Marcela Ríos", "marcela@giapodaca.mx", "81 5550 0201"],
  ["Distribuidora Las Torres", "Óscar Benavides", "oscar@lastorres.mx", ""],
  ["Hotel Valle Oriente", "Ana Paula Garza", "anapaula@valleoriente", "81 5550 0203"],
  ["Farmacias del Río", "", "compras@farmaciasdelrio.mx", ""],
  ["Distribuidora Las Torres", "Óscar Benavides", "oscar@lastorres.mx", ""],
  ["Papelera Contry", "Julio Sáenz", "julio@papeleracontry.mx", "81 5550 0206"],
  ["", "Rosa Ibarra", "rosa@serviciosibarra.mx", ""],
  ["Cliente que se dio de baja", "Mario Luna", "bajas@ejemplo.mx", ""],
  ["Autopartes Linda Vista", "Verónica Peña", "veronica@autoparteslv.mx", "81 5550 0209"],
  ["Estética Dental Carrizalejo", "Dr. Iván Flores", "ivan@edcarrizalejo.mx", ""],
];
