// Baja: POST desde la página /baja del frontend o desde el botón de baja del cliente de correo
// (List-Unsubscribe-Post: One-Click, RFC 8058). GET regresa a qué empresa corresponde el enlace.
// La página vive en el frontend porque Supabase no sirve HTML desde Edge Functions.
import { admin } from "../_shared/supabase.ts";
import { CORS, error, json, preflight } from "../_shared/http.ts";
import { leerTokenEnvio } from "../_shared/cripto.ts";
import { hoyMx } from "../_shared/core/fechas.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  const u = new URL(req.url);
  const envioId = await leerTokenEnvio(u.searchParams.get("e"));
  if (!envioId) return error("El enlace no es válido.", 404);
  const sb = admin();
  const { data: e } = await sb.from("envios").select("contacto_id, despacho_id").eq("id", envioId).maybeSingle();
  if (!e) return error("El enlace no es válido.", 404);
  const { data: c } = await sb.from("contactos").select("correo, empresa").eq("id", e.contacto_id).single();
  const { data: d } = await sb.from("despachos").select("nombre").eq("id", e.despacho_id).single();
  if (!c || !d) return error("El enlace no es válido.", 404);

  if (req.method === "GET") {
    const { data: s } = await sb.from("supresiones").select("correo").eq("correo", c.correo).maybeSingle();
    return json({ correo: c.correo, despacho: d.nombre, yaDeBaja: !!s });
  }
  if (req.method !== "POST") return new Response(null, { status: 405, headers: CORS });

  const { data: nueva } = await sb.from("supresiones").upsert({ correo: c.correo, origen: "enlace" }, { onConflict: "correo", ignoreDuplicates: true }).select();
  // Pausa al contacto en todos los despachos donde aparezca.
  const { data: todos } = await sb.from("contactos").select("id, despacho_id").eq("correo", c.correo);
  for (const x of todos || []) {
    await sb.from("contactos").update({ pausado: true, ultimo: hoyMx() }).eq("id", x.id);
    if (nueva?.length)
      await sb.from("eventos").insert({ contacto_id: x.id, despacho_id: x.despacho_id, tipo: "baja", texto: "Se dio de baja", actor: "sistema" });
  }
  return json({ ok: true, correo: c.correo, despacho: d.nombre });
});
