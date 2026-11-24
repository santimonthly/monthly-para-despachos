// Cálculos del tablero: resumen y la franja de recomendación.
import type { EstadoCampana, Estatus } from "./tipos.ts";
import { fmtCorto, siguienteHabil, type Festivos } from "./fechas.ts";

export interface ContactoResumen {
  paso: number;
  estatus: Estatus;
  abrio: boolean;
  hizo_click: boolean;
}

export interface Resumen {
  total: number;
  enviados: number;
  abiertos: number;
  clicks: number;
  respondieron: number;
  confirmados: number;
  perdidos: number;
}

export function resumen(cs: ContactoResumen[]): Resumen {
  const f = (fn: (c: ContactoResumen) => boolean) => cs.filter(fn).length;
  return {
    total: cs.length,
    enviados: f((c) => c.paso > 0),
    abiertos: f((c) => c.abrio),
    clicks: f((c) => c.hizo_click),
    respondieron: f((c) => ["Respondió", "Confirmado", "Perdido"].includes(c.estatus)),
    confirmados: f((c) => c.estatus === "Confirmado"),
    perdidos: f((c) => c.estatus === "Perdido"),
  };
}

export interface Recomendacion {
  titulo: string;
  dato: string;
  accion: string;
  responsable: string;
  plazo: string;
}

/**
 * Las 5 reglas, en orden: 1) respondidos sin cerrar, 2) campaña en pausa, 3) clicks sin respuesta,
 * 4) aún no sale ningún correo, 5) secuencia en curso.
 */
export function recomendacion(
  cs: ContactoResumen[],
  campana: { estado: EstadoCampana; inicio: string | null },
  hoy: string,
  festivos?: Festivos,
): Recomendacion {
  const s = resumen(cs);
  const pend = cs.filter((c) => c.estatus === "Respondió").length;
  const clicSinResp = cs.filter((c) => c.hizo_click && !["Respondió", "Confirmado", "Perdido"].includes(c.estatus)).length;
  if (pend)
    return {
      titulo: "Clientes por cerrar",
      dato: pend + (pend === 1 ? " cliente respondió y está sin confirmar." : " clientes respondieron y están sin confirmar."),
      accion: "Llámales y márcalos como ✅ confirmado o ❌ perdido",
      responsable: "tú",
      plazo: "esta semana",
    };
  if (campana.estado === "pausada")
    return { titulo: "Campaña en pausa", dato: "Los correos pendientes no están saliendo.", accion: "Reanuda la campaña", responsable: "tú", plazo: "hoy" };
  if (clicSinResp)
    return {
      titulo: "Clientes interesados",
      dato:
        clicSinResp +
        (clicSinResp === 1 ? " cliente visitó la página de Monthly y no ha respondido." : " clientes visitaron la página de Monthly y no han respondido."),
      accion: "Llámales y, si te contestan, márcalos como respondió",
      responsable: "tú",
      plazo: "esta semana",
    };
  if (!s.enviados)
    return {
      titulo: "Campaña programada",
      dato: "El primer correo sale el " + fmtCorto(siguienteHabil(campana.inicio || hoy, festivos)) + ".",
      accion: "No tienes que hacer nada",
      responsable: "Monthly",
      plazo: "automático",
    };
  return {
    titulo: campana.estado === "terminada" ? "Secuencia terminada" : "Secuencia en curso",
    dato: s.enviados + " de " + s.total + " clientes ya recibieron tu correo.",
    accion: campana.estado === "terminada" ? "Revisa quién abrió y llámale" : "Espera al siguiente envío",
    responsable: campana.estado === "terminada" ? "tú" : "Monthly",
    plazo: campana.estado === "terminada" ? "esta semana" : "automático",
  };
}
