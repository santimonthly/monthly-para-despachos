// Tracking: /t/open?e=… (pixel) y /t/click?e=…&u=… (redirect).
// Solo la primera apertura y el primer click quedan en el historial.
import { admin } from "../_shared/supabase.ts";
import { leerTokenEnvio } from "../_shared/cripto.ts";
import { hoyMx } from "../_shared/core/index.ts";

const GIF = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));
const pixel = () =>
  new Response(GIF, { headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" } });

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const esClick = u.pathname.endsWith("/click");
  const destino = u.searchParams.get("u") || "";
  const envioId = await leerTokenEnvio(u.searchParams.get("e"));
  // El destino solo se acepta si es http(s); el token firmado identifica el envío.
  const destinoOk = /^https?:\/\//i.test(destino);

  if (envioId) {
    const sb = admin();
    const { data: e } = await sb.from("envios").select("contacto_id, despacho_id").eq("id", envioId).maybeSingle();
    if (e) {
      const { data: c } = await sb.from("contactos").select("estatus, abrio, hizo_click").eq("id", e.contacto_id).single();
      const hoy = hoyMx();
      const ev = (tipo: string, texto: string) =>
        sb.from("eventos").insert({ contacto_id: e.contacto_id, despacho_id: e.despacho_id, tipo, texto, actor: "sistema" });
      if (c && !c.abrio) {
        // Un click implica apertura (muchos clientes bloquean imágenes).
        await sb.from("contactos").update({ abrio: true, ultimo: hoy, estatus: c.estatus === "Enviado" ? "Abierto" : c.estatus }).eq("id", e.contacto_id);
        await ev("apertura", "Abrió el correo");
      }
      if (esClick && c && !c.hizo_click) {
        await sb.from("contactos").update({ hizo_click: true, ultimo: hoy }).eq("id", e.contacto_id);
        await ev("click", "Hizo click en un enlace");
      }
    }
  }
  if (esClick) return Response.redirect(destinoOk ? destino : "https://monthly.la/", 302);
  return pixel();
});
