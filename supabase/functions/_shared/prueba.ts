// «Enviarme una prueba»: manda el correo 1 al propio buzón del despacho con datos de ejemplo.
// Se llama a través de enviar-pendientes con { prueba: true } para no duplicar las plantillas.
import { admin, quien } from "./supabase.ts";
import { error, json } from "./http.ts";
import { ASSETS_URL, MODO_SIMULADO } from "./env.ts";
import { cargarConfig, cargarOverrides, cargarToken } from "./datos.ts";
import { accessToken, enviar } from "./correo/proveedores.ts";
import { CONTACTO_EJEMPLO, renderCorreo } from "./core/render.ts";

export async function correoPrueba(req: Request): Promise<Response> {
  const yo = await quien(req);
  if (yo?.rol !== "despacho" || !yo.despachoId) return error("Inicia sesión como despacho.", 403);
  const sb = admin();
  const t = await cargarToken(sb, yo.despachoId);
  if (!t) return error("Conecta tu correo primero.");
  const { data: d } = await sb.from("despachos").select("*").eq("id", yo.despachoId).single();
  const [config, overrides] = await Promise.all([cargarConfig(sb), cargarOverrides(sb)]);
  const m = renderCorreo({ n: 0, override: overrides[0], despacho: d, contacto: CONTACTO_EJEMPLO, config, assetsUrl: ASSETS_URL() });
  try {
    const { access } = await accessToken(t.proveedor, t.refresh);
    await enviar(t.proveedor, access, {
      de: { nombre: `${d.firma || d.nombre} · ${d.nombre}`, correo: t.email },
      para: { nombre: d.firma || d.nombre, correo: t.email },
      asunto: "[Prueba] " + m.asunto,
      html: m.html,
    });
  } catch (e) {
    return error((e as Error).message, 502);
  }
  return json({ ok: true, para: t.email, simulado: MODO_SIMULADO() });
}
