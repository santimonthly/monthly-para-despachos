// Regreso de Google o Microsoft: guarda el refresh token cifrado y vuelve al alta.
// Configura esta URL como «redirect URI» en Google Cloud y en Entra ID:
//   https://<ref>.supabase.co/functions/v1/oauth-callback
import { admin } from "../_shared/supabase.ts";
import { APP_URL } from "../_shared/env.ts";
import { cifrar, desempaquetar } from "../_shared/cripto.ts";
import { canjearCodigo, type Proveedor } from "../_shared/correo/proveedores.ts";

const volver = (q: string) => Response.redirect(APP_URL() + "/alta?paso=2&" + q, 302);

Deno.serve(async (req) => {
  const u = new URL(req.url);
  if (u.searchParams.get("error")) return volver("correo=cancelado");
  const st = await desempaquetar<{ d: string; u: string; p: Proveedor; exp: number }>(u.searchParams.get("state") || "");
  const code = u.searchParams.get("code");
  if (!st || st.exp < Date.now() || !code) return volver("correo=error");
  try {
    const { refresh, email } = await canjearCodigo(st.p, code);
    await admin().from("tokens_correo").upsert({
      despacho_id: st.d,
      proveedor: st.p,
      email,
      refresh_token: await cifrar(refresh),
      estado: "conectado",
      error: null,
      actualizado: new Date().toISOString(),
    });
    return volver("correo=ok");
  } catch (e) {
    console.error(e);
    return volver("correo=error");
  }
});
