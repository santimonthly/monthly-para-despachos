// Tipos compartidos entre el frontend (Vite) y las Edge Functions (Deno).
// Este directorio no puede importar nada de npm: solo TypeScript puro.

export type Estatus =
  | "Pendiente"
  | "Enviado"
  | "Abierto"
  | "Respondió"
  | "Confirmado"
  | "Perdido"
  | "Rebotado";

export const ESTATUS: Estatus[] = [
  "Pendiente",
  "Enviado",
  "Abierto",
  "Respondió",
  "Confirmado",
  "Perdido",
  "Rebotado",
];

/** Estatus que detienen la secuencia de un contacto. */
export const DETIENEN: Estatus[] = ["Respondió", "Confirmado", "Perdido", "Rebotado"];

export const COLOR_ESTATUS: Record<Estatus, string> = {
  Pendiente: "#767c9c",
  Enviado: "#5366ff",
  Abierto: "#ffb81c",
  "Respondió": "#18ad86",
  Confirmado: "#10e8a0",
  Perdido: "#767c9c",
  Rebotado: "#ff585d",
};

/** Colores de los correos 1, 2 y 3 en las gráficas. */
export const COLOR_CORREO = ["#283ff3", "#6f80ff", "#b3bdff"];

export type EstadoCampana = "sin" | "activa" | "pausada" | "terminada";

export interface PlantillaBase {
  dia: number;
  angulo: string;
  asunto: string;
  pre: string;
  html: string;
}

export interface Plantilla extends PlantillaBase {
  editada: boolean;
}

export interface DespachoMarca {
  nombre: string;
  corto?: string | null;
  sitio?: string | null;
  firma?: string | null;
  logo_url?: string | null;
  color?: string | null;
  precio?: number | null;
}

export interface ContactoBase {
  empresa: string;
  nombre: string;
  correo: string;
}

export interface ContactoMotor {
  id: string;
  correo: string;
  paso: number; // 0–3
  estatus: Estatus;
  pausado: boolean;
  inicio: string | null; // fecha (YYYY-MM-DD) en que salió el correo 1
  ultimo_envio: string | null; // fecha del último correo enviado
}

export interface Config {
  minimo: number;
  precio_sugerido: number;
  precio_original: number;
  anio: string;
  frase_temporada: string;
  notif: string;
}

export const CONFIG_INICIAL: Config = {
  minimo: 3500,
  precio_sugerido: 4500,
  precio_original: 6000,
  anio: "2027",
  frase_temporada: "Para este inicio de 2027",
  notif: "alianzas@monthly.la",
};
