// Variables de entorno de las Edge Functions. Ver README → «Secretos».
export const env = (k: string, def?: string): string => {
  const v = Deno.env.get(k) ?? def;
  if (v === undefined) throw new Error(`Falta la variable de entorno ${k}`);
  return v;
};
export const opt = (k: string): string | undefined => Deno.env.get(k) || undefined;

export const SUPABASE_URL = () => env("SUPABASE_URL");
export const APP_URL = () => env("APP_URL").replace(/\/$/, "");
export const ASSETS_URL = () => (opt("ASSETS_URL") || APP_URL() + "/email-assets").replace(/\/$/, "");
/** true mientras no haya OAuth real: los buzones se «conectan» sin Google/Microsoft y no se envía nada. */
export const MODO_SIMULADO = () => (opt("MODO_SIMULADO") ?? "true") === "true";
