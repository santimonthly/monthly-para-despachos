// Monthly invita a un despacho: crea la fila y manda el enlace de acceso (Supabase Auth).
import { admin, quien } from "../_shared/supabase.ts";
import { error, json, preflight } from "../_shared/http.ts";
import { APP_URL } from "../_shared/env.ts";
import { RE_CORREO } from "../_shared/core/excel.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  const yo = await quien(req);
  if (yo?.rol !== "admin") return error("Solo el equipo de Monthly puede invitar despachos.", 403);

  const { nombre, email } = await req.json().catch(() => ({}));
  const correo = String(email || "").trim().toLowerCase();
  if (!String(nombre || "").trim() || !RE_CORREO.test(correo)) return error("Escribe el nombre y un correo válido.");
  if (correo.endsWith("@monthly.la")) return error("Ese correo es del equipo de Monthly.");

  const sb = admin();
  const { data: d, error: e1 } = await sb.from("despachos").insert({ nombre: String(nombre).trim(), email: correo }).select().single();
  if (e1) return error(e1.code === "23505" ? "Ese correo ya tiene una invitación." : e1.message, e1.code === "23505" ? 409 : 400);

  const { error: e2 } = await sb.auth.admin.inviteUserByEmail(correo, { redirectTo: APP_URL() });
  if (e2) {
    // Si el usuario ya existía (por ejemplo, se borró su despacho antes), lo ligamos y entra con magic link.
    const { data: lista } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const u = lista?.users.find((x) => x.email?.toLowerCase() === correo);
    if (!u) {
      await sb.from("despachos").delete().eq("id", d.id);
      return error("No se pudo mandar la invitación: " + e2.message, 500);
    }
    await sb.from("perfiles").upsert({ user_id: u.id, email: correo, rol: "despacho", despacho_id: d.id });
  }
  return json({ ok: true, despacho: d });
});
