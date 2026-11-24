// deno test --allow-env supabase/functions/_shared/pruebas
import { deepStrictEqual as assertEquals, ok as assert } from "node:assert";

Deno.env.set("TOKENS_KEY", btoa(String.fromCharCode(...new Uint8Array(32).fill(7))));
Deno.env.set("FIRMA_SECRET", "secreto-de-prueba");

const { cifrar, descifrar, empaquetar, desempaquetar, tokenEnvio, leerTokenEnvio } = await import("../cripto.ts");
const { armarMime, encabezado } = await import("../correo/mime.ts");

Deno.test("refresh token: cifra y descifra", async () => {
  const c = await cifrar("1//refresh-token");
  assert(c.startsWith("v1.") && !c.includes("refresh"));
  assertEquals(await descifrar(c), "1//refresh-token");
});

Deno.test("state de OAuth y token de envío firmados", async () => {
  const s = await empaquetar({ d: "abc", exp: 1 });
  assertEquals(await desempaquetar(s), { d: "abc", exp: 1 });
  assertEquals(await desempaquetar(s.slice(0, -1) + "x"), null);
  const t = await tokenEnvio("11111111-2222-3333-4444-555555555555");
  assertEquals(await leerTokenEnvio(t), "11111111-2222-3333-4444-555555555555");
  assertEquals(await leerTokenEnvio("otro-id." + t.split(".")[1]), null);
});

Deno.test("MIME con acentos, baja de un click y HTML en base64", () => {
  const m = armarMime({
    de: { nombre: "Laura Garza · Garza y Asociados", correo: "laura@garza.mx" },
    para: { nombre: "Ricardo Treviño", correo: "r@aceros.mx" },
    asunto: "¿Cuánto ganó Aceros del Norte?",
    html: "<p>Hola, Ricardo</p>",
    baja: "https://x.supabase.co/functions/v1/baja?e=1",
  });
  assert(m.includes("Subject: =?UTF-8?B?"));
  assert(m.includes("List-Unsubscribe: <https://x.supabase.co/functions/v1/baja?e=1>"));
  assert(m.includes("List-Unsubscribe-Post: List-Unsubscribe=One-Click"));
  const cuerpo = m.split("\r\n\r\n")[1].replace(/\r\n/g, "");
  assertEquals(new TextDecoder().decode(Uint8Array.from(atob(cuerpo), (c) => c.charCodeAt(0))), "<p>Hola, Ricardo</p>");
  assertEquals(encabezado("Hola"), "Hola");
});
