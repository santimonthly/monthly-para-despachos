// Cuando un despacho marca a un cliente como «Respondió», avisamos a Monthly (config.notif).
import { admin, comoUsuario, quien } from "../_shared/supabase.ts";
import { error, json, preflight } from "../_shared/http.ts";
import { APP_URL } from "../_shared/env.ts";
import { cargarConfig } from "../_shared/datos.ts";
import { enviarTransaccional } from "../_shared/resend.ts";
import { esc } from "../_shared/core/esc.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  const yo = await quien(req);
  if (yo?.rol !== "despacho") return error("Inicia sesión como despacho.", 403);
  const { contacto_id } = await req.json().catch(() => ({}));
  // Lectura con la sesión del despacho: RLS garantiza que el contacto es suyo.
  const { data: c } = await comoUsuario(req).from("contactos").select("*").eq("id", contacto_id).maybeSingle();
  if (!c || c.estatus !== "Respondió") return error("Ese contacto no está marcado como respondió.");
  const sb = admin();
  const { data: d } = await sb.from("despachos").select("nombre, email").eq("id", c.despacho_id).single();
  if (!d) return error("No encontramos el despacho.", 404);
  const cfg = await cargarConfig(sb);
  const html =
    `<p style="font-family:Arial,sans-serif;font-size:15px;color:#3F467E">` +
    `<b>${esc(d.nombre)}</b> marcó a <b>${esc(c.empresa)}</b> como respondió.</p>` +
    `<p style="font-family:Arial,sans-serif;font-size:14px;color:#6A7392">` +
    `Contacto: ${esc(c.nombre || "–")} · ${esc(c.correo)}${c.tel ? " · " + esc(c.tel) : ""}<br>` +
    `Despacho: ${esc(d.email)}</p>` +
    `<p><a href="${APP_URL()}/panel/respuestas" style="font-family:Arial,sans-serif;color:#5366FF">Ver respuestas</a></p>`;
  const ok = await enviarTransaccional(cfg.notif, `${d.nombre} · ${c.empresa} respondió`, html);
  return json({ ok });
});
