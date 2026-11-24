// Cifrado de refresh tokens (AES-GCM) y firmas cortas (HMAC-SHA256) para state, tracking y bajas.
import { env } from "./env.ts";

const enc = new TextEncoder();
const dec = new TextDecoder();

export const b64url = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const deB64url = (s: string) => {
  const p = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(p), (c) => c.charCodeAt(0));
};

let llaveAes: CryptoKey | null = null;
async function aes(): Promise<CryptoKey> {
  if (!llaveAes) {
    const raw = Uint8Array.from(atob(env("TOKENS_KEY")), (c) => c.charCodeAt(0));
    if (raw.length !== 32) throw new Error("TOKENS_KEY debe ser de 32 bytes en base64");
    llaveAes = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  }
  return llaveAes;
}

export async function cifrar(texto: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aes(), enc.encode(texto)));
  return "v1." + b64url(iv) + "." + b64url(ct);
}

export async function descifrar(s: string): Promise<string> {
  const [v, iv, ct] = s.split(".");
  if (v !== "v1") throw new Error("Formato de token desconocido");
  return dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: deB64url(iv) }, await aes(), deB64url(ct)));
}

let llaveHmac: CryptoKey | null = null;
async function hmac(): Promise<CryptoKey> {
  if (!llaveHmac)
    llaveHmac = await crypto.subtle.importKey("raw", enc.encode(env("FIRMA_SECRET")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return llaveHmac;
}

export async function firmar(datos: string, largo = 16): Promise<string> {
  const s = new Uint8Array(await crypto.subtle.sign("HMAC", await hmac(), enc.encode(datos)));
  return b64url(s).slice(0, largo);
}

export async function verificar(datos: string, firma: string, largo = 16): Promise<boolean> {
  const esperada = await firmar(datos, largo);
  if (esperada.length !== firma.length) return false;
  let r = 0;
  for (let i = 0; i < firma.length; i++) r |= esperada.charCodeAt(i) ^ firma.charCodeAt(i);
  return r === 0;
}

/** Token firmado para un objeto pequeño (state de OAuth). */
export async function empaquetar(obj: unknown): Promise<string> {
  const p = b64url(enc.encode(JSON.stringify(obj)));
  return p + "." + (await firmar(p, 32));
}
export async function desempaquetar<T>(tok: string): Promise<T | null> {
  const [p, f] = tok.split(".");
  if (!p || !f || !(await verificar(p, f, 32))) return null;
  return JSON.parse(dec.decode(deB64url(p))) as T;
}

/** Token de un envío para pixel, click y baja: <envio_id>.<firma>. */
export const tokenEnvio = async (envioId: string) => envioId + "." + (await firmar("e:" + envioId));
export async function leerTokenEnvio(tok: string | null): Promise<string | null> {
  if (!tok) return null;
  const [id, f] = tok.split(".");
  return id && f && (await verificar("e:" + id, f)) ? id : null;
}
