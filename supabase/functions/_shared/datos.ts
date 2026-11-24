// Lecturas comunes con service role.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { CONFIG_INICIAL, type Config, type Override } from "./core/index.ts";
import { descifrar } from "./cripto.ts";
import type { Proveedor } from "./correo/proveedores.ts";

export async function cargarConfig(sb: SupabaseClient): Promise<Config> {
  const { data } = await sb.from("config").select("*").maybeSingle();
  return data ? { ...CONFIG_INICIAL, ...data } : CONFIG_INICIAL;
}

/** Overrides de plantillas indexados 0–2. */
export async function cargarOverrides(sb: SupabaseClient): Promise<Override[]> {
  const { data } = await sb.from("plantillas").select("n, asunto, pre, html");
  const o: Override[] = [null, null, null];
  for (const r of data || []) o[r.n - 1] = { asunto: r.asunto, pre: r.pre, html: r.html };
  return o;
}

export async function cargarFestivos(sb: SupabaseClient): Promise<Set<string>> {
  const { data } = await sb.from("festivos").select("fecha");
  return new Set((data || []).map((r: { fecha: string }) => r.fecha));
}

export async function cargarToken(
  sb: SupabaseClient,
  despachoId: string,
): Promise<{ proveedor: Proveedor; email: string; refresh: string; estado: string } | null> {
  const { data } = await sb.from("tokens_correo").select("*").eq("despacho_id", despachoId).maybeSingle();
  if (!data) return null;
  return { proveedor: data.proveedor, email: data.email, refresh: await descifrar(data.refresh_token), estado: data.estado };
}
