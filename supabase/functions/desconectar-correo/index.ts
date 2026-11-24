// «Usar otro correo»: revoca el acceso (Gmail) y borra el token.
import { admin, quien } from "../_shared/supabase.ts";
import { error, json, preflight } from "../_shared/http.ts";
import { cargarToken } from "../_shared/datos.ts";
import { revocar } from "../_shared/correo/proveedores.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  const yo = await quien(req);
  if (yo?.rol !== "despacho" || !yo.despachoId) return error("Inicia sesión como despacho.", 403);
  const sb = admin();
  const t = await cargarToken(sb, yo.despachoId).catch(() => null);
  if (t) await revocar(t.proveedor, t.refresh);
  await sb.from("tokens_correo").delete().eq("despacho_id", yo.despachoId);
  return json({ ok: true });
});
