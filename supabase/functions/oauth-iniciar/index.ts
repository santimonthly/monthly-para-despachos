// Paso 2 del alta: regresa la URL de Google o Microsoft para autorizar el envío.
// En MODO_SIMULADO conecta el buzón al instante con el correo que escribió el despacho.
import { admin, quien } from "../_shared/supabase.ts";
import { error, json, preflight } from "../_shared/http.ts";
import { APP_URL, MODO_SIMULADO } from "../_shared/env.ts";
import { cifrar, empaquetar } from "../_shared/cripto.ts";
import { urlAutorizacion, type Proveedor } from "../_shared/correo/proveedores.ts";
import { RE_CORREO } from "../_shared/core/index.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  const yo = await quien(req);
  if (yo?.rol !== "despacho" || !yo.despachoId) return error("Inicia sesión como despacho.", 403);

  const { proveedor, email } = await req.json().catch(() => ({}));
  if (proveedor !== "gmail" && proveedor !== "outlook") return error("Proveedor no válido.");

  if (MODO_SIMULADO()) {
    const correo = String(email || yo.email).trim().toLowerCase();
    if (!RE_CORREO.test(correo)) return error("Escribe un correo válido.");
    await admin().from("tokens_correo").upsert({
      despacho_id: yo.despachoId,
      proveedor,
      email: correo,
      refresh_token: await cifrar("simulado"),
      estado: "conectado",
      error: null,
      actualizado: new Date().toISOString(),
    });
    return json({ simulado: true, url: APP_URL() + "/alta?paso=2&correo=ok" });
  }

  const state = await empaquetar({ d: yo.despachoId, u: yo.userId, p: proveedor, exp: Date.now() + 15 * 60_000 });
  return json({ url: urlAutorizacion(proveedor as Proveedor, state, yo.email) });
});
