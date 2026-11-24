// Filas de la base tal como las usa el frontend.
import type { EstadoCampana, Estatus } from "@core/tipos.ts";

export interface Perfil {
  user_id: string;
  email: string;
  rol: "admin" | "despacho";
  despacho_id: string | null;
}

export interface Despacho {
  id: string;
  nombre: string;
  email: string;
  sitio: string;
  firma: string;
  corto: string;
  logo_url: string | null;
  logo_provisional: boolean;
  color: string;
  color_nota: string;
  precio: number | null;
  confirmo_contactos: boolean;
  confirmo_en: string | null;
  creado: string;
}

export interface Campana {
  despacho_id: string;
  estado: EstadoCampana;
  inicio: string | null;
}

export interface Contacto {
  id: string;
  despacho_id: string;
  empresa: string;
  nombre: string;
  correo: string;
  tel: string;
  paso: number;
  estatus: Estatus;
  estatus_previo: string | null;
  abrio: boolean;
  hizo_click: boolean;
  pausado: boolean;
  inicio: string | null;
  ultimo: string | null;
  ultimo_envio: string | null;
  respondio_en: string | null;
  atendido_monthly: boolean;
  creado: string;
}

export interface Evento {
  id: number;
  contacto_id: string;
  fecha: string;
  tipo: string;
  texto: string;
  actor: "sistema" | "despacho" | "monthly";
}

export interface EstadoCorreo {
  proveedor: "gmail" | "outlook";
  email: string;
  estado: "conectado" | "error";
  error: string | null;
}

export interface ResumenDespacho {
  id: string;
  nombre: string;
  email: string;
  logo_url: string | null;
  color: string;
  precio: number | null;
  perfil_ok: boolean;
  correo_ok: boolean;
  campana: EstadoCampana;
  inicio: string | null;
  total: number;
  enviados: number;
  abiertos: number;
  respondieron: number;
  confirmados: number;
  sin_atender: number;
}
