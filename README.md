# Monthly | para despachos

Plataforma para que despachos aliados envíen, desde su propio buzón y con su marca, una secuencia de 3 correos (días 0, 4 y 9) a sus clientes, y lleven el seguimiento de quién respondió. Implementa la *Especificación funcional v1* y el prototipo HTML.

Stack: Vite + React + TypeScript + Tailwind + React Query, con Supabase (Auth, Postgres + RLS, Storage, Edge Functions, pg_cron). Es el mismo stack de Lovable, así que el repo se puede seguir editando ahí.

## Estructura

```
src/                          Frontend
  pages/Login, Baja, Inicio
  pages/despacho/             Alta (5 pasos), Tablero, Correos
  pages/panel/                Despachos, Respuestas, Plantillas, Ajustes
  styles/monthly.css          Estilos portados del prototipo
supabase/
  migrations/                 Tablas, RLS, acciones (RPC), storage y cron
  functions/
    _shared/core/             Lógica pura compartida con el frontend (alias @core)
    _shared/                  Cifrado, Gmail/Graph, Resend, lecturas comunes
    invitar, oauth-iniciar, oauth-callback, desconectar-correo,
    avisar-respuesta, enviar-pendientes (+ correo de prueba), t, baja
public/email-assets/          Imágenes de los correos (URL pública para Gmail/Outlook)
tests/                        Pruebas de la lógica y de la base (PGlite)
```

`supabase/functions/_shared/core/` no depende de npm: el render de plantillas, los días hábiles, la validación del Excel, el motor de envío y la recomendación del tablero son los mismos en el navegador y en el servidor. Así, la vista previa y el correo que sale vienen de la misma función.

## Correr en local

```bash
npm install
cp .env.example .env      # llena VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev               # http://localhost:8080
npm test                  # 45 pruebas: lógica + migraciones/RLS en Postgres embebido
```

Pruebas de las Edge Functions (cifrado y MIME): `deno test --allow-env supabase/functions/_shared/pruebas`.

## Proyecto de Supabase actual

Ya existe y está configurado: `monthly-para-despachos` (ref `awynbjzuasiyrolgcaty`, región us-east-1). Migraciones aplicadas, bucket `logos`, cron programado (con `project_url` y `cron_secret` en Vault) y las 8 Edge Functions desplegadas. Falta cargar los secretos de las funciones (tabla de abajo) y configurar Auth/SMTP.

## Puesta en marcha de Supabase (desde cero)

1. Crea el proyecto y aplica las migraciones: `supabase link --project-ref <ref>` y `supabase db push`.
2. **Auth → URL configuration:** el *Site URL* es la URL de la app; agrega la misma en *Redirect URLs*.
3. **Auth → SMTP:** configura Resend (host `smtp.resend.com`, puerto 465, usuario `resend`, contraseña = API key) con el dominio monthly.la verificado. Así salen con tu dominio las invitaciones y los magic links.
4. **Secretos de las Edge Functions** (`supabase secrets set ...`):

| Secreto | Para qué |
|---|---|
| `APP_URL` | URL del frontend, sin barra final |
| `ASSETS_URL` | Opcional. Por defecto `APP_URL/email-assets` |
| `TOKENS_KEY` | 32 bytes en base64 para cifrar refresh tokens: `openssl rand -base64 32` |
| `FIRMA_SECRET` | Firma de state, tracking y bajas: `openssl rand -hex 32` |
| `CRON_SECRET` | Lo manda pg_cron al motor: `openssl rand -hex 24`. Debe ser igual al `cron_secret` de Vault |
| `MODO_SIMULADO` | `true` (por defecto): conecta buzones sin OAuth y no envía nada. `false` en producción |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth de Gmail |
| `MS_CLIENT_ID` / `MS_CLIENT_SECRET` / `MS_TENANT` | OAuth de Microsoft (`MS_TENANT=common`) |
| `RESEND_API_KEY` / `RESEND_FROM` | Aviso a Monthly cuando un despacho marca «Respondió» |

5. Despliega las funciones: `supabase functions deploy` (usa `supabase/config.toml`; `oauth-callback`, `enviar-pendientes`, `t` y `baja` van sin JWT).
6. **Cron:** en el SQL editor crea los secretos que usa la migración `_cron.sql`:
   ```sql
   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
   select vault.create_secret('<CRON_SECRET>', 'cron_secret');
   ```
7. **Primer admin:** entra con tu correo @monthly.la; el usuario se crea como admin automáticamente.

### OAuth (fase 3)

- **Google Cloud:** cliente OAuth web con *redirect URI* `https://<ref>.supabase.co/functions/v1/oauth-callback` y scopes `openid`, `email`, `gmail.send`. `gmail.send` es sensible: inicia ya la verificación de la app (tarda semanas). Mientras tanto, el modo prueba admite hasta 100 usuarios agregados a mano.
- **Microsoft Entra ID:** app registration con el mismo *redirect URI*, permisos delegados `Mail.Send`, `offline_access`, `openid` y `email`. Algunas organizaciones piden consentimiento del admin.

Solo se pide permiso de envío: Monthly no lee la bandeja del despacho.

## Probar de punta a punta sin correos reales

Con `MODO_SIMULADO=true`: invita un despacho desde el panel, entra con su enlace, completa el alta (el buzón se conecta al instante), programa y llama al motor a mano, fuera de horario incluso:

```bash
curl -X POST https://<ref>.supabase.co/functions/v1/enviar-pendientes \
  -H "x-cron-secret: $CRON_SECRET" -H "Content-Type: application/json" -d '{"forzar":true}'
```

Los envíos quedan en `envios` y `eventos` como si hubieran salido.

## Paso a Lovable

Lovable no importa repos existentes: al conectar GitHub siempre crea uno nuevo. El camino es:

1. Crea un proyecto en blanco en Lovable y conéctalo a GitHub (crea el repo).
2. Clona ese repo, reemplaza su contenido con este proyecto, haz commit y push a `main`. La sincronización lo trae a Lovable.
3. En Lovable conecta el proyecto de Supabase que ya configuraste (no Lovable Cloud), para conservar datos, funciones y secretos.

## Decisiones tomadas

Se siguieron las recomendaciones de la especificación:

- **Rebotes:** errores al enviar más validación del dominio (MX) antes de cada envío.
- **Festivos:** tabla `festivos` con los oficiales de México de 2026 a 2028, editable.
- **Correos 2 y 3:** salen como correos nuevos, no en el hilo del correo 1.
- **Aperturas:** se muestran como indicador, no como estatus de decisión.
- **Licencias:** se manejan fuera de la plataforma.

Además:

- **Inicio de la campaña:** arranca el siguiente día hábil.
- **Orden de envío:** los seguimientos salen antes que los correos 1, para que las secuencias no se atrasen con el tope de 150 al día.
- **Despachos sin logo:** se genera un logo provisional en PNG con las iniciales, porque Gmail y Outlook no muestran SVG.
- **Página de baja:** vive en el frontend (`/baja`), porque Supabase no sirve HTML desde Edge Functions. El botón de baja del cliente de correo pega directo a la función.
- **Cambios de estatus:** van por funciones `security definer`. El despacho no puede editar estatus directo.

## Pendientes conocidos

- El correo de prueba del alta se manda con `enviar-pendientes` y `{ prueba: true }` (así las plantillas, ~70 KB, se suben una sola vez).
- `xlsx` 0.18.5 de npm tiene vulnerabilidades conocidas. Instálalo desde el CDN de SheetJS: `npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.
- El bundle pesa ~1 MB. Conviene hacer code-splitting por ruta.
- La fase 3 necesita credenciales reales para probar Gmail y Graph. El envío por Graph usa MIME para conservar List-Unsubscribe.
