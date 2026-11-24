// Arma un mensaje RFC 5322 en UTF-8 (HTML en base64) para Gmail API y Microsoft Graph.

const enc = new TextEncoder();
const b64 = (s: string) => {
  const bytes = enc.encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

/** Encabezado con caracteres no ASCII (RFC 2047). */
export const encabezado = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);

const direccion = (nombre: string, correo: string) =>
  nombre ? `${encabezado(nombre.replace(/["\\]/g, ""))} <${correo}>` : correo;

export interface Mensaje {
  de: { nombre: string; correo: string };
  para: { nombre: string; correo: string };
  asunto: string;
  html: string;
  /** URL de baja para List-Unsubscribe (RFC 8058). */
  baja?: string;
  enRespuestaA?: string;
}

export function armarMime(m: Mensaje): string {
  const dominio = m.de.correo.split("@")[1] || "monthly.la";
  const h = [
    `From: ${direccion(m.de.nombre, m.de.correo)}`,
    `To: ${direccion(m.para.nombre, m.para.correo)}`,
    `Subject: ${encabezado(m.asunto)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${dominio}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  if (m.baja) {
    h.push(`List-Unsubscribe: <${m.baja}>`);
    h.push("List-Unsubscribe-Post: List-Unsubscribe=One-Click");
  }
  if (m.enRespuestaA) h.push(`In-Reply-To: ${m.enRespuestaA}`, `References: ${m.enRespuestaA}`);
  const cuerpo = b64(m.html).replace(/.{76}/g, "$&\r\n");
  return h.join("\r\n") + "\r\n\r\n" + cuerpo;
}

export const mimeBase64 = (mime: string) => b64(mime);
export const mimeBase64Url = (mime: string) => b64(mime).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
