// Correo transaccional de Monthly (avisos al equipo). Las invitaciones y magic links los manda
// Supabase Auth; configura Resend como SMTP en Supabase (ver README).
import { opt } from "./env.ts";

export async function enviarTransaccional(para: string, asunto: string, html: string): Promise<boolean> {
  const key = opt("RESEND_API_KEY");
  if (!key) {
    console.log(`[resend sin configurar] → ${para}: ${asunto}`);
    return false;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from: opt("RESEND_FROM") || "Monthly <alianzas@monthly.la>", to: [para], subject: asunto, html }),
  });
  if (!r.ok) console.error("Resend", r.status, await r.text());
  return r.ok;
}
