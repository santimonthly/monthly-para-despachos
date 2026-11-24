import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;

export const configurado = !!url && !!key;

// Con la sesión en el navegador; el magic link regresa con el token en la URL.
export const supabase = createClient(url || "http://localhost:54321", key || "sin-configurar", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

/** Llama una Edge Function y regresa su JSON, o lanza el mensaje de error en español. */
export async function funcion<T = unknown>(nombre: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(nombre, { body: body ?? {} });
  if (error) {
    let msg = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      const j = ctx ? await ctx.json() : null;
      if (j?.error) msg = j.error;
    } catch {
      /* sin cuerpo */
    }
    throw new Error(msg);
  }
  return data as T;
}

/** Mensaje legible de un error de Postgres/RPC. */
export const mensaje = (e: unknown) => (e instanceof Error ? e.message : (e as { message?: string })?.message || String(e));
