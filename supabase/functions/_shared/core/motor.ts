// Motor de envío: decide qué correos salen hoy. Es una función pura; la Edge Function
// enviar-pendientes la ejecuta, manda los correos y guarda los resultados.
import type { ContactoMotor, EstadoCampana } from "./tipos.ts";
import { DETIENEN } from "./tipos.ts";
import { esHabil, fechaDebida, type Festivos } from "./fechas.ts";

export const TOPE_DIARIO = 150;

export interface PlanEntrada {
  hoy: string;
  festivos?: Festivos;
  campana: { estado: EstadoCampana; inicio: string | null };
  contactos: ContactoMotor[];
  /** Correos que este despacho ya envió hoy. */
  enviadosHoy: number;
  /** Correos dados de baja (en minúsculas). */
  supresiones: ReadonlySet<string>;
  tope?: number;
}

export interface Plan {
  enviar: { contactoId: string; paso: number }[]; // paso = número del correo (1–3)
  pausarPorBaja: string[];
  /** Contactos que ya tocaba enviar pero no cupieron hoy. */
  pospuestos: number;
}

/** ¿El contacto sigue en la secuencia? */
export const activo = (c: Pick<ContactoMotor, "estatus" | "pausado" | "paso">) =>
  !DETIENEN.includes(c.estatus) && !c.pausado && c.paso < 3;

export function planearEnvios(e: PlanEntrada): Plan {
  const plan: Plan = { enviar: [], pausarPorBaja: [], pospuestos: 0 };
  if (e.campana.estado !== "activa" || !e.campana.inicio || !esHabil(e.hoy, e.festivos)) return plan;
  const tope = e.tope ?? TOPE_DIARIO;
  let usados = e.enviadosHoy;

  // Primero los seguimientos (correos 2 y 3) para que las secuencias en curso no se atrasen.
  const orden = [...e.contactos].sort((a, b) => b.paso - a.paso);
  for (const c of orden) {
    if (!activo(c)) continue;
    if (e.supresiones.has(c.correo.toLowerCase())) {
      plan.pausarPorBaja.push(c.id);
      continue;
    }
    if (c.ultimo_envio === e.hoy) continue; // nunca dos correos el mismo día
    const debida = fechaDebida(c, e.campana.inicio, e.festivos);
    if (!debida || debida > e.hoy) continue; // si ya pasó, sale hoy
    if (usados >= tope) {
      plan.pospuestos++;
      continue;
    }
    plan.enviar.push({ contactoId: c.id, paso: c.paso + 1 });
    usados++;
  }
  return plan;
}

/** Próximo envío de un contacto (para el tablero), o null si ya no recibe más. */
export function proximoEnvio(
  c: ContactoMotor,
  campana: { estado: EstadoCampana; inicio: string | null },
  hoy: string,
  festivos?: Festivos,
): string | null {
  if (campana.estado === "sin" || campana.estado === "terminada" || !campana.inicio) return null;
  if (!activo({ ...c, pausado: false })) return null;
  const f = fechaDebida(c, campana.inicio, festivos);
  if (!f) return null;
  if (f > hoy) return f;
  // Ya toca: sale hoy si es hábil y aún no recibe nada hoy; si no, el siguiente hábil.
  let x = hoy;
  if (c.ultimo_envio === hoy || !esHabil(x, festivos)) {
    do {
      x = new Date(Date.parse(x + "T00:00:00Z") + 86400000).toISOString().slice(0, 10);
    } while (!esHabil(x, festivos));
  }
  return x;
}
