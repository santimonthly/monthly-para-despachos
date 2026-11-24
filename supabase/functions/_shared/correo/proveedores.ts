// OAuth y envío por Gmail API (scope gmail.send) y Microsoft Graph (Mail.Send).
// Solo pedimos permiso de envío: Monthly no lee la bandeja del despacho.
import { env, MODO_SIMULADO, opt, SUPABASE_URL } from "../env.ts";
import { armarMime, mimeBase64, mimeBase64Url, type Mensaje } from "./mime.ts";

export type Proveedor = "gmail" | "outlook";

export const redirectUri = () => SUPABASE_URL() + "/functions/v1/oauth-callback";
const tenant = () => opt("MS_TENANT") || "common";

const GOOGLE_SCOPES = "openid email https://www.googleapis.com/auth/gmail.send";
const MS_SCOPES = "offline_access openid email https://graph.microsoft.com/Mail.Send";

export function urlAutorizacion(p: Proveedor, state: string, loginHint?: string): string {
  if (p === "gmail") {
    const q = new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      redirect_uri: redirectUri(),
      response_type: "code",
      scope: GOOGLE_SCOPES,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    });
    if (loginHint) q.set("login_hint", loginHint);
    return "https://accounts.google.com/o/oauth2/v2/auth?" + q;
  }
  const q = new URLSearchParams({
    client_id: env("MS_CLIENT_ID"),
    redirect_uri: redirectUri(),
    response_type: "code",
    response_mode: "query",
    scope: MS_SCOPES,
    state,
  });
  if (loginHint) q.set("login_hint", loginHint);
  return `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize?` + q;
}

const tokenUrl = (p: Proveedor) =>
  p === "gmail" ? "https://oauth2.googleapis.com/token" : `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`;

const credenciales = (p: Proveedor) =>
  p === "gmail"
    ? { client_id: env("GOOGLE_CLIENT_ID"), client_secret: env("GOOGLE_CLIENT_SECRET") }
    : { client_id: env("MS_CLIENT_ID"), client_secret: env("MS_CLIENT_SECRET") };

const claims = (idToken: string): Record<string, string> => {
  const p = idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(p + "===".slice((p.length + 3) % 4)), (c) => c.charCodeAt(0))));
};

export class ErrorProveedor extends Error {
  constructor(msg: string, public tipo: "auth" | "destinatario" | "temporal") {
    super(msg);
  }
}

/** Intercambia el code del callback por tokens. Devuelve el refresh token y el correo del buzón. */
export async function canjearCodigo(p: Proveedor, code: string): Promise<{ refresh: string; email: string }> {
  const body = new URLSearchParams({ ...credenciales(p), code, redirect_uri: redirectUri(), grant_type: "authorization_code" });
  if (p === "outlook") body.set("scope", MS_SCOPES);
  const r = await fetch(tokenUrl(p), { method: "POST", body });
  const j = await r.json();
  if (!r.ok || !j.refresh_token) throw new Error("No se pudo conectar el buzón: " + (j.error_description || j.error || r.status));
  const c = j.id_token ? claims(j.id_token) : {};
  const email = (c.email || c.preferred_username || c.upn || "").toLowerCase();
  if (!email) throw new Error("El proveedor no regresó el correo del buzón.");
  return { refresh: j.refresh_token, email };
}

/** Access token a partir del refresh token. Microsoft puede rotar el refresh token. */
export async function accessToken(p: Proveedor, refresh: string): Promise<{ access: string; nuevoRefresh?: string }> {
  if (MODO_SIMULADO()) return { access: "simulado" };
  const body = new URLSearchParams({ ...credenciales(p), refresh_token: refresh, grant_type: "refresh_token" });
  if (p === "outlook") body.set("scope", MS_SCOPES);
  const r = await fetch(tokenUrl(p), { method: "POST", body });
  const j = await r.json();
  if (!r.ok) {
    const tipo = j.error === "invalid_grant" || r.status === 400 || r.status === 401 ? "auth" : "temporal";
    throw new ErrorProveedor("No se pudo renovar el acceso al buzón: " + (j.error_description || j.error || r.status), tipo);
  }
  return { access: j.access_token, nuevoRefresh: j.refresh_token && j.refresh_token !== refresh ? j.refresh_token : undefined };
}

export async function revocar(p: Proveedor, refresh: string): Promise<void> {
  if (MODO_SIMULADO()) return;
  // Microsoft no tiene endpoint de revocación por token; el despacho puede quitar el acceso desde su cuenta.
  if (p === "gmail")
    await fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(refresh), { method: "POST" }).catch(() => {});
}

/** Envía un mensaje. Devuelve message_id y thread_id cuando el proveedor los da. */
export async function enviar(p: Proveedor, access: string, m: Mensaje): Promise<{ messageId: string | null; threadId: string | null }> {
  if (MODO_SIMULADO()) {
    console.log(`[simulado] ${p} ${m.de.correo} → ${m.para.correo}: ${m.asunto}`);
    return { messageId: "simulado-" + crypto.randomUUID(), threadId: null };
  }
  const mime = armarMime(m);
  const r =
    p === "gmail"
      ? await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: { Authorization: "Bearer " + access, "Content-Type": "application/json" },
          body: JSON.stringify({ raw: mimeBase64Url(mime) }),
        })
      : await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
          // Graph acepta el MIME completo en base64; así conservamos List-Unsubscribe.
          method: "POST",
          headers: { Authorization: "Bearer " + access, "Content-Type": "text/plain" },
          body: mimeBase64(mime),
        });
  if (r.ok) {
    const j = p === "gmail" ? await r.json() : {};
    return { messageId: j.id ?? null, threadId: j.threadId ?? null };
  }
  const t = await r.text();
  const tipo = r.status === 401 || r.status === 403 ? "auth" : r.status === 429 || r.status >= 500 ? "temporal" : "destinatario";
  throw new ErrorProveedor(`Error ${r.status} al enviar: ${t.slice(0, 300)}`, tipo);
}

/** Validación del dominio antes de enviar: ¿tiene registros MX? (DNS sobre HTTPS). Ante la duda, sí. */
const cacheMx = new Map<string, boolean>();
export async function dominioRecibeCorreo(correo: string): Promise<boolean> {
  const dom = correo.split("@")[1]?.toLowerCase();
  if (!dom) return false;
  if (cacheMx.has(dom)) return cacheMx.get(dom)!;
  let ok = true;
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(dom)}&type=MX`, {
      headers: { accept: "application/dns-json" },
    });
    const j = await r.json();
    if (j.Status === 3) ok = false; // NXDOMAIN
    else if (j.Status === 0 && !(j.Answer || []).some((a: { type: number }) => a.type === 15)) {
      // Sin MX: el correo puede ir al registro A (RFC 5321), pero casi siempre es un error de captura.
      ok = false;
    }
  } catch {
    ok = true;
  }
  cacheMx.set(dom, ok);
  return ok;
}
