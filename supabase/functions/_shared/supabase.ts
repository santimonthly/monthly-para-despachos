import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { env } from "./env.ts";

/** Cliente con service role: salta RLS. Solo dentro de Edge Functions. */
export const admin = (): SupabaseClient =>
  createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

/** Cliente con la sesión de quien llama: respeta RLS. */
export const comoUsuario = (req: Request): SupabaseClient =>
  createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

export interface Quien {
  userId: string;
  email: string;
  rol: "admin" | "despacho";
  despachoId: string | null;
}

/** Usuario y rol de quien llama, o null si no hay sesión válida. */
export async function quien(req: Request): Promise<Quien | null> {
  const sb = comoUsuario(req);
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await admin().from("perfiles").select("rol, despacho_id, email").eq("user_id", data.user.id).maybeSingle();
  if (!p) return null;
  return { userId: data.user.id, email: p.email, rol: p.rol, despachoId: p.despacho_id };
}
