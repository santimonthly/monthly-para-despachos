// Render de los correos. La misma función se usa en la vista previa (navegador)
// y en el envío (Edge Function), para que lo que ve el despacho sea lo que sale.
import type { Config, ContactoBase, DespachoMarca, Plantilla, PlantillaBase } from "./tipos.ts";
import { PLANTILLAS_BASE } from "./plantillas-base.ts";
import { cortoDe, logoProvisionalDataUri, marca, sitioTexto } from "./marca.ts";
import { descuentoDe, pesos, precioDe } from "./precios.ts";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

/** Variables que se resaltan en amarillo en la vista previa. */
const PERSONALIZADAS = [
  "despacho_nombre",
  "despacho_corto",
  "contacto_nombre",
  "empresa",
  "firma_nombre",
  "despacho_sitio_texto",
];

export type Override = Partial<Pick<PlantillaBase, "asunto" | "pre" | "html">> | null | undefined;

/** Plantilla efectiva: la base con el override del panel encima. n = 0, 1 o 2. */
export function plantilla(n: number, override?: Override): Plantilla {
  const b = PLANTILLAS_BASE[n];
  const g = (k: "asunto" | "pre" | "html") => (override && override[k] != null ? (override[k] as string) : b[k]);
  return {
    dia: b.dia,
    angulo: b.angulo,
    asunto: g("asunto"),
    pre: g("pre"),
    html: g("html"),
    editada: !!override && (["asunto", "pre", "html"] as const).some((k) => override[k] != null && override[k] !== b[k]),
  };
}

export interface RenderOpciones {
  n: number; // 0, 1 o 2
  override?: Override;
  despacho: DespachoMarca;
  contacto: ContactoBase;
  config: Config;
  /** URL pública de las imágenes del correo, sin la barra final. */
  assetsUrl: string;
  enlaceBaja?: string;
  /** Resalta lo que cambia con la marca del despacho (solo vista previa). */
  resaltar?: boolean;
}

export interface CorreoRenderizado {
  asunto: string;
  pre: string;
  html: string;
  /** Variables que quedaron sin valor, como «{{foo}}». */
  faltantes: string[];
  dia: number;
  angulo: string;
}

export function variablesDe(o: RenderOpciones): Record<string, string> {
  const d = o.despacho;
  const m = marca(d);
  const precio = precioDe(d, o.config);
  return {
    despacho_nombre: d.nombre,
    despacho_corto: cortoDe(d),
    anio: o.config.anio || "2027",
    despacho_logo_url: d.logo_url || logoProvisionalDataUri(d.nombre, m.color),
    despacho_sitio_web: d.sitio || "#",
    despacho_sitio_texto: sitioTexto(d.sitio),
    despacho_color: m.color,
    despacho_color_texto: m.texto,
    despacho_color_tenue: m.tenue,
    contacto_nombre: o.contacto.nombre,
    empresa: o.contacto.empresa,
    firma_nombre: d.firma || d.nombre,
    enlace_baja: o.enlaceBaja || "#baja",
    frase_temporada: o.config.frase_temporada,
    precio: pesos(precio),
    precio_original: pesos(o.config.precio_original),
    descuento: descuentoDe(precio, o.config.precio_original),
    assets_url: o.assetsUrl.replace(/\/$/, ""),
  };
}

export function renderCorreo(o: RenderOpciones): CorreoRenderizado {
  const t = plantilla(o.n, o.override);
  const v = variablesDe(o);
  const hl = !!o.resaltar;

  // modo 0: texto plano (asunto) · 1: atributo HTML · 2: texto HTML
  const rep = (s: string, modo: 0 | 1 | 2) =>
    s.replace(/\{\{([a-z_]+)\}\}/g, (x, k: string) => {
      if (!(k in v)) return x;
      const e = modo && k !== "despacho_logo_url" ? esc(v[k]) : v[k];
      return modo === 2 && hl && PERSONALIZADAS.includes(k)
        ? '<span style="background:#FFE9A8;box-shadow:0 0 0 2px #FFE9A8;border-radius:3px;color:#2D3590;">' + e + "</span>"
        : e;
    });

  let h = t.html;
  if (!o.contacto.nombre) h = h.replace("Hola, {{contacto_nombre}}:", "Hola:");
  if (!v.descuento) {
    h = h
      .replace(
        /&nbsp; <span style="color:#9AA1AB;text-decoration:line-through;">\{\{precio_original\}\}<\/span>&nbsp; <span[^>]*>\{\{descuento\}\} OFF<\/span>/g,
        "",
      )
      .replace(" (precio original {{precio_original}} + IVA)", "");
  }
  if (hl) {
    h = h
      .replace(/style="background:\{\{despacho_color\}\};/g, 'style="box-shadow:inset 0 0 0 3px #FFB81C;background:{{despacho_color}};')
      .replace(
        /alt="\{\{despacho_nombre\}\}" style="/g,
        'alt="{{despacho_nombre}}" style="outline:3px solid #FFB81C;outline-offset:2px;',
      );
  }
  const asunto = rep(t.asunto, 0);
  const pre = rep(t.pre, 0);
  h = h
    .replace("{{asunto}}", esc(asunto))
    .replace("{{preheader}}", esc(pre))
    .split(/(<[^>]+>)/)
    .map((seg) => (seg[0] === "<" ? rep(seg, 1) : rep(seg, 2)))
    .join("");
  const faltantes = (h.match(/\{\{[a-z_]+\}\}/g) || []).filter((x, i, a) => a.indexOf(x) === i);
  return { asunto, pre, html: h, faltantes, dia: t.dia, angulo: t.angulo };
}

/**
 * Agrega el pixel de apertura y envuelve los enlaces http(s) para registrar clicks.
 * El enlace de baja no se envuelve.
 */
export function instrumentar(
  html: string,
  opts: { pixelUrl: string; clickUrl: (destino: string) => string; enlaceBaja?: string },
): string {
  let h = html.replace(/href="(https?:\/\/[^"]+)"/g, (x, url: string) => {
    const destino = url.replace(/&amp;/g, "&");
    if (opts.enlaceBaja && destino === opts.enlaceBaja) return x;
    return 'href="' + esc(opts.clickUrl(destino)) + '"';
  });
  const pixel = '<img src="' + esc(opts.pixelUrl) + '" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;">';
  h = h.includes("</body>") ? h.replace("</body>", pixel + "</body>") : h + pixel;
  return h;
}

/** Contacto de ejemplo para la vista previa cuando aún no hay contactos. */
export const CONTACTO_EJEMPLO: ContactoBase = {
  nombre: "Ricardo Treviño",
  empresa: "Aceros del Norte",
  correo: "ricardo@acerosdelnorte.mx",
};

/** Qué cambia con la marca de cada despacho (tabla de ayuda en el alta y en Plantillas). */
export const MAPA_MARCA: [string, string, string, string][] = [
  ["Logo", "Franja bajo el encabezado, tarjeta del beneficio y pie del correo", "El logo que subes en tu perfil", "{{despacho_logo_url}}"],
  ["Color de marca", "Fondo de la franja y del panel del beneficio. El texto encima cambia solo a blanco o azul oscuro para que se lea", "Se detecta de tu logo y lo puedes ajustar", "{{despacho_color}} · {{despacho_color_texto}} · {{despacho_color_tenue}}"],
  ["Nombre corto", "Inicio de los asuntos y texto de vista previa, por ejemplo «RMZ - Activa tu nuevo beneficio para 2027»", "Tu perfil; si lo dejas vacío usamos tu nombre sin «Contadores»", "{{despacho_corto}}"],
  ["Nombre del despacho", "Introducción, firma y texto legal", "Tu perfil", "{{despacho_nombre}}"],
  ["Remitente y firma", "El «De» del correo y la firma al final", "Quien firma y el correo que conectas", "{{firma_nombre}}"],
  ["Sitio web", "Liga en la firma", "Tu perfil", "{{despacho_sitio_web}} · {{despacho_sitio_texto}}"],
  ["Tu cliente", "Saludo, asunto e introducción", "El Excel de contactos", "{{contacto_nombre}} · {{empresa}}"],
];

export const TEXTO_FIJO =
  "El encabezado azul, la ilustración, los textos, los botones, el precio y el descuento los define Monthly y son iguales para todos los despachos.";
