// Motor de envío. Lo llama pg_cron cada 15 minutos (ver migración _cron.sql).
// Con { prueba: true } y sesión de despacho, manda el correo de prueba del alta (_shared/prueba.ts).
// Por cada campaña activa: decide qué sale hoy (core/motor.ts), envía desde el buzón del
// despacho y registra envíos y eventos. Es idempotente gracias a envios(contacto_id, paso).
import { admin } from "../_shared/supabase.ts";
import { error, json, preflight } from "../_shared/http.ts";
import { correoPrueba } from "../_shared/prueba.ts";
import { APP_URL, ASSETS_URL, env, SUPABASE_URL } from "../_shared/env.ts";
import { cargarConfig, cargarFestivos, cargarOverrides, cargarToken } from "../_shared/datos.ts";
import { cifrar, firmar, tokenEnvio } from "../_shared/cripto.ts";
import { accessToken, dominioRecibeCorreo, enviar, ErrorProveedor } from "../_shared/correo/proveedores.ts";
import { dentroDeVentana, hoyMx } from "../_shared/core/fechas.ts";
import { instrumentar, renderCorreo } from "../_shared/core/render.ts";
import { activo, planearEnvios } from "../_shared/core/motor.ts";

const PRESUPUESTO_MS = 120_000; // el resto sale en la siguiente ejecución

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  const body = await req.json().catch(() => ({}));
  // «Enviarme una prueba» del alta: requiere sesión de despacho (se valida dentro).
  if (body.prueba) return correoPrueba(req);
  if (req.headers.get("x-cron-secret") !== env("CRON_SECRET")) return error("No autorizado.", 401);
  const t0 = Date.now();
  const sb = admin();
  const ahora = new Date();
  const hoy = hoyMx(ahora);
  const festivos = await cargarFestivos(sb);
  // forzar: solo para pruebas manuales (ignora la ventana de 9 a 11).
  if (!body.forzar && !dentroDeVentana(ahora, festivos)) return json({ ok: true, fuera_de_ventana: true });

  const [config, overrides] = await Promise.all([cargarConfig(sb), cargarOverrides(sb)]);
  const { data: sup } = await sb.from("supresiones").select("correo");
  const supresiones = new Set((sup || []).map((r: { correo: string }) => r.correo));
  const { data: campanas } = await sb.from("campanas").select("*").eq("estado", "activa");
  const informe: Record<string, unknown>[] = [];

  for (const camp of campanas || []) {
    if (Date.now() - t0 > PRESUPUESTO_MS) break;
    const r = { despacho: camp.despacho_id, enviados: 0, rebotes: 0, bajas: 0, pospuestos: 0, nota: "" };
    informe.push(r);

    const tok = await cargarToken(sb, camp.despacho_id).catch(() => null);
    if (!tok || tok.estado !== "conectado") {
      r.nota = "sin buzón conectado";
      continue;
    }
    const { data: d } = await sb.from("despachos").select("*").eq("id", camp.despacho_id).single();
    const { data: contactos } = await sb.from("contactos").select("*").eq("despacho_id", camp.despacho_id).order("creado");
    const { count: enviadosHoy } = await sb
      .from("envios")
      .select("id", { count: "exact", head: true })
      .eq("despacho_id", camp.despacho_id)
      .eq("fecha", hoy);

    const plan = planearEnvios({ hoy, festivos, campana: camp, contactos: contactos || [], enviadosHoy: enviadosHoy || 0, supresiones });
    r.pospuestos = plan.pospuestos;

    for (const id of plan.pausarPorBaja) {
      await sb.from("contactos").update({ pausado: true, ultimo: hoy }).eq("id", id);
      await sb.from("eventos").insert({ contacto_id: id, despacho_id: d.id, tipo: "baja", texto: "En pausa: se dio de baja", actor: "sistema" });
      r.bajas++;
    }
    if (!plan.enviar.length) {
      await cerrarSiTermino(sb, camp.despacho_id);
      continue;
    }

    let access: string;
    try {
      const a = await accessToken(tok.proveedor, tok.refresh);
      access = a.access;
      if (a.nuevoRefresh) await sb.from("tokens_correo").update({ refresh_token: await cifrar(a.nuevoRefresh) }).eq("despacho_id", d.id);
    } catch (e) {
      if (e instanceof ErrorProveedor && e.tipo === "auth")
        await sb.from("tokens_correo").update({ estado: "error", error: e.message }).eq("despacho_id", d.id);
      r.nota = (e as Error).message;
      continue;
    }

    const porId = new Map((contactos || []).map((c) => [c.id, c]));
    for (const { contactoId, paso } of plan.enviar) {
      if (Date.now() - t0 > PRESUPUESTO_MS) break;
      const c = porId.get(contactoId)!;
      // Reservar el envío. Si ya existe (cron repetido), no se vuelve a mandar.
      const { data: env_, error: eIns } = await sb
        .from("envios")
        .insert({ contacto_id: c.id, despacho_id: d.id, paso, fecha: hoy })
        .select("id")
        .single();
      if (eIns || !env_) continue;

      const evento = (tipo: string, texto: string) =>
        sb.from("eventos").insert({ contacto_id: c.id, despacho_id: d.id, tipo, texto, actor: "sistema" });

      if (!(await dominioRecibeCorreo(c.correo))) {
        await sb.from("envios").update({ error: "El dominio no recibe correo (sin MX)" }).eq("id", env_.id);
        await sb.from("contactos").update({ estatus: "Rebotado", ultimo: hoy }).eq("id", c.id);
        await evento("rebote", "El correo rebotó: el dominio no recibe correo");
        r.rebotes++;
        continue;
      }

      const tk = await tokenEnvio(env_.id);
      const fn = SUPABASE_URL() + "/functions/v1";
      const baja = `${fn}/baja?e=${encodeURIComponent(tk)}`;
      const m = renderCorreo({
        n: paso - 1,
        override: overrides[paso - 1],
        despacho: d,
        contacto: c,
        config,
        assetsUrl: ASSETS_URL(),
        enlaceBaja: `${APP_URL()}/baja?e=${encodeURIComponent(tk)}`,
      });
      // Cada destino se firma para que /t/click solo redirija a los enlaces del correo.
      const destinos = [...new Set([...m.html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((x) => x[1].replace(/&amp;/g, "&")))];
      const firmas = new Map(await Promise.all(destinos.map(async (u) => [u, await firmar(`u:${env_.id}|${u}`)] as const)));
      const html = instrumentar(m.html, {
        pixelUrl: `${fn}/t/open?e=${encodeURIComponent(tk)}`,
        clickUrl: (u) => `${fn}/t/click?e=${encodeURIComponent(tk)}&u=${encodeURIComponent(u)}&s=${firmas.get(u) ?? ""}`,
        enlaceBaja: `${APP_URL()}/baja?e=${encodeURIComponent(tk)}`,
      });

      try {
        const s = await enviar(tok.proveedor, access, {
          de: { nombre: `${d.firma || d.nombre} · ${d.nombre}`, correo: tok.email },
          para: { nombre: c.nombre, correo: c.correo },
          asunto: m.asunto,
          html,
          baja,
        });
        await sb.from("envios").update({ message_id: s.messageId, thread_id: s.threadId }).eq("id", env_.id);
        await sb
          .from("contactos")
          .update({
            paso,
            inicio: paso === 1 ? hoy : c.inicio,
            ultimo_envio: hoy,
            ultimo: hoy,
            estatus: c.estatus === "Pendiente" ? "Enviado" : c.estatus,
          })
          .eq("id", c.id);
        await evento("envio", `Correo ${paso} enviado`);
        r.enviados++;
      } catch (e) {
        const tipo = e instanceof ErrorProveedor ? e.tipo : "temporal";
        if (tipo === "destinatario") {
          await sb.from("envios").update({ error: (e as Error).message }).eq("id", env_.id);
          await sb.from("contactos").update({ estatus: "Rebotado", ultimo: hoy }).eq("id", c.id);
          await evento("rebote", "El correo rebotó");
          r.rebotes++;
          continue;
        }
        // Temporal o de acceso: liberamos la reserva para reintentar y dejamos este despacho por hoy.
        await sb.from("envios").delete().eq("id", env_.id);
        if (tipo === "auth") await sb.from("tokens_correo").update({ estado: "error", error: (e as Error).message }).eq("despacho_id", d.id);
        r.nota = (e as Error).message;
        break;
      }
    }
    await cerrarSiTermino(sb, camp.despacho_id);
  }
  return json({ ok: true, hoy, informe });
});

// Una campaña sin contactos activos pasa a «terminada».
// deno-lint-ignore no-explicit-any
async function cerrarSiTermino(sb: any, despachoId: string) {
  const { data } = await sb.from("contactos").select("estatus, pausado, paso").eq("despacho_id", despachoId);
  if ((data || []).length && !(data || []).some(activo))
    await sb.from("campanas").update({ estado: "terminada", actualizado: new Date().toISOString() }).eq("despacho_id", despachoId).eq("estado", "activa");
}
