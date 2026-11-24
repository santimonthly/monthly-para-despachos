// Pruebas de la lógica pura (la misma que usan el navegador y las Edge Functions).
import { describe, expect, it } from "vitest";
import {
  analizarLogo,
  CONFIG_INICIAL,
  cortoDe,
  dentroDeVentana,
  descuentoDe,
  EJEMPLO,
  esHabil,
  fechaDebida,
  hoyMx,
  instrumentar,
  marca,
  numero,
  pesos,
  planearEnvios,
  precioDe,
  proximoEnvio,
  recomendacion,
  renderCorreo,
  resumen,
  siguienteHabil,
  validarFilas,
  type ContactoMotor,
} from "@core/index.ts";

const FEST = new Set(["2026-12-25", "2027-01-01"]);

describe("fechas", () => {
  it("salta fines de semana y festivos", () => {
    expect(esHabil("2026-11-28")).toBe(false); // sábado
    expect(siguienteHabil("2026-11-28")).toBe("2026-11-30");
    expect(siguienteHabil("2026-12-25", FEST)).toBe("2026-12-28");
    expect(siguienteHabil("2026-12-31", FEST)).toBe("2026-12-31");
    expect(siguienteHabil("2027-01-01", FEST)).toBe("2027-01-04");
  });
  it("cadencia 0 · 4 · 9 desde el correo 1, movida al siguiente hábil", () => {
    // Correo 1 el lunes 30 nov → correo 2 el viernes 4 dic → correo 3 el miércoles 9 dic.
    expect(fechaDebida({ paso: 1, inicio: "2026-11-30" }, "2026-11-30")).toBe("2026-12-04");
    expect(fechaDebida({ paso: 2, inicio: "2026-11-30" }, "2026-11-30")).toBe("2026-12-09");
    // Correo 1 el jueves 3 dic → día 4 cae domingo 7 → lunes 7... (3+4 = 7 dic, lunes)
    expect(fechaDebida({ paso: 1, inicio: "2026-12-03" }, "2026-12-03")).toBe("2026-12-07");
    // Correo 1 el martes 1 dic → día 4 = sábado 5 → lunes 7
    expect(fechaDebida({ paso: 1, inicio: "2026-12-01" }, "2026-12-01")).toBe("2026-12-07");
    expect(fechaDebida({ paso: 3, inicio: "2026-12-01" }, "2026-12-01")).toBeNull();
  });
  it("ventana 9:00–11:00 hora del centro de México (UTC−6)", () => {
    expect(dentroDeVentana(new Date("2026-11-24T15:00:00Z"))).toBe(true); // 9:00
    expect(dentroDeVentana(new Date("2026-11-24T16:59:00Z"))).toBe(true); // 10:59
    expect(dentroDeVentana(new Date("2026-11-24T17:00:00Z"))).toBe(false); // 11:00
    expect(dentroDeVentana(new Date("2026-11-24T14:59:00Z"))).toBe(false); // 8:59
    expect(dentroDeVentana(new Date("2026-11-28T15:30:00Z"))).toBe(false); // sábado
    expect(hoyMx(new Date("2026-11-25T03:00:00Z"))).toBe("2026-11-24"); // 21:00 del 24 en CDMX
  });
});

describe("marca y precios", () => {
  it("texto blanco sobre color oscuro y azul sobre claro", () => {
    expect(marca({ color: "#14342B" }).texto).toBe("#FFFFFF");
    expect(marca({ color: "#FFFFFF" }).texto).toBe("#2D3590");
    expect(marca({ color: "nada" }).color).toBe("#393939");
  });
  it("nombre corto", () => {
    expect(cortoDe({ nombre: "Garza y Asociados Contadores" })).toBe("Garza y Asociados");
    expect(cortoDe({ nombre: "Despacho Leal Treviño" })).toBe("Leal Treviño");
    expect(cortoDe({ nombre: "RMZ Contadores Públicos" })).toBe("RMZ");
    expect(cortoDe({ nombre: "X", corto: " Garza " })).toBe("Garza");
    expect(cortoDe({ nombre: "Despacho" })).toBe("Despacho");
  });
  it("precios y descuento", () => {
    expect(numero("$4,500")).toBe(4500);
    expect(pesos(4500)).toBe("$4,500");
    expect(descuentoDe(4500, 6000)).toBe("25%");
    expect(descuentoDe(6000, 6000)).toBe("");
    expect(precioDe({ precio: 3000 }, CONFIG_INICIAL)).toBe(4500); // menor al mínimo → sugerido
    expect(precioDe({ precio: 5000 }, CONFIG_INICIAL)).toBe(5000);
  });
  it("color del logo: con fondo, claro sin fondo, oscuro sin fondo", () => {
    const img = (w: number, h: number, f: (x: number, y: number) => number[]) => {
      const d = new Uint8ClampedArray(w * h * 4);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d.set(f(x, y), (y * w + x) * 4);
      return d;
    };
    const conFondo = img(20, 10, () => [20, 52, 43, 255]);
    expect(analizarLogo(conFondo, 20, 10).color).toBe("#14342B");
    const claro = img(20, 10, (x, y) => (x > 5 && x < 15 && y > 2 && y < 8 ? [250, 250, 250, 255] : [0, 0, 0, 0]));
    expect(analizarLogo(claro, 20, 10).color).toBe("#393939");
    const oscuro = img(20, 10, (x, y) => (x > 5 && x < 15 && y > 2 && y < 8 ? [20, 20, 90, 255] : [0, 0, 0, 0]));
    expect(analizarLogo(oscuro, 20, 10).color).toBe("#FFFFFF");
  });
});

describe("render de correos", () => {
  const despacho = { nombre: "Garza y Asociados Contadores", corto: "Garza", sitio: "https://garzayasociados.mx/", firma: "Laura Garza", color: "#14342B", logo_url: "https://x/logo.png", precio: 4500 };
  const contacto = { nombre: "Ricardo Treviño", empresa: "Aceros del Norte", correo: "r@a.mx" };
  const base = { despacho, contacto, config: CONFIG_INICIAL, assetsUrl: "https://app.monthly.la/email-assets/" };

  it("los 3 correos quedan sin variables pendientes", () => {
    for (const n of [0, 1, 2]) {
      const m = renderCorreo({ ...base, n });
      expect(m.faltantes).toEqual([]);
      expect(m.html).toContain("Laura Garza");
      expect(m.html).toContain("https://app.monthly.la/email-assets/monthly-blue.png");
      expect(m.html).toContain("garzayasociados.mx<");
    }
    expect(renderCorreo({ ...base, n: 0 }).asunto).toBe("Garza - Activa tu nuevo beneficio para 2027");
    expect(renderCorreo({ ...base, n: 1 }).asunto).toBe("¿Cuánto ganó Aceros del Norte el mes pasado?");
    expect(renderCorreo({ ...base, n: 2 }).asunto).toBe("Garza - Último aviso: tu beneficio 2027 sigue sin activar");
  });
  it("sin descuento quita el tachado y la píldora", () => {
    const m = renderCorreo({ ...base, n: 0, config: { ...CONFIG_INICIAL, precio_original: 4500 } });
    expect(m.html).not.toContain("line-through");
    expect(m.html).not.toContain("OFF");
    expect(m.html).not.toContain("precio original");
    expect(renderCorreo({ ...base, n: 0 }).html).toContain("25% OFF");
  });
  it("sin nombre de contacto el saludo queda «Hola:»", () => {
    const m = renderCorreo({ ...base, n: 0, contacto: { ...contacto, nombre: "" } });
    expect(m.html).toContain("Hola:</p>");
  });
  it("escapa el HTML de los datos del Excel", () => {
    const m = renderCorreo({ ...base, n: 1, contacto: { ...contacto, empresa: "<b>A&B</b>" } });
    expect(m.html).toContain("&lt;b&gt;A&amp;B&lt;/b&gt;");
    expect(m.asunto).toBe("¿Cuánto ganó <b>A&B</b> el mes pasado?"); // el asunto es texto plano
  });
  it("resaltado solo en la vista previa", () => {
    expect(renderCorreo({ ...base, n: 0, resaltar: true }).html).toContain("#FFE9A8");
    expect(renderCorreo({ ...base, n: 0 }).html).not.toContain("#FFE9A8");
  });
  it("un override del panel reemplaza el asunto y avisa variables desconocidas", () => {
    const m = renderCorreo({ ...base, n: 0, override: { asunto: "Hola {{empresa}} {{nada}}" } });
    expect(m.asunto).toBe("Hola Aceros del Norte {{nada}}");
  });
  it("instrumentar envuelve enlaces, respeta la baja y agrega el pixel", () => {
    const baja = "https://app/baja?e=1";
    const html = `<a href="https://monthly.la/">x</a><a href="${baja}">b</a><a href="mailto:x@y">m</a></body>`;
    const r = instrumentar(html, { pixelUrl: "https://f/t/open?e=1", clickUrl: (u) => "https://f/t/click?u=" + encodeURIComponent(u), enlaceBaja: baja });
    expect(r).toContain('href="https://f/t/click?u=https%3A%2F%2Fmonthly.la%2F"');
    expect(r).toContain(`href="${baja}"`);
    expect(r).toContain('href="mailto:x@y"');
    expect(r).toContain('<img src="https://f/t/open?e=1"');
  });
});

describe("validación del Excel", () => {
  it("el archivo de ejemplo produce errores y omitidos correctos", () => {
    const r = validarFilas(EJEMPLO, { yaCargados: ["papeleraquenoesta@x.mx"], supresiones: ["bajas@ejemplo.mx"] });
    if ("fatal" in r) throw new Error(r.fatal);
    expect(r.ok.map((x) => x.empresa)).toEqual([
      "Grupo Industrial Apodaca",
      "Distribuidora Las Torres",
      "Papelera Contry",
      "Autopartes Linda Vista",
      "Estética Dental Carrizalejo",
    ]);
    expect(r.err.map((x) => [x.fila, x.motivo])).toEqual([
      [4, "El correo no es válido"],
      [5, "Falta el nombre"],
      [8, "Falta la empresa"],
    ]);
    expect(r.omit.map((x) => [x.fila, x.motivo])).toEqual([
      [6, "Correo repetido en el archivo"],
      [9, "Se dio de baja antes"],
    ]);
  });
  it("encabezado en las primeras 5 filas, con sinónimos y acentos", () => {
    const r = validarFilas(
      [["Reporte"], [], ["EMPRESA", "Contacto", "Correo electrónico", "Tel"], ["A", "B", "b@a.mx", "1"], ["", "", "", ""]],
      { yaCargados: [], supresiones: [] },
    );
    expect("fatal" in r ? r.fatal : r.ok.length).toBe(1);
  });
  it("errores fatales", () => {
    expect(validarFilas([["Nombre", "Correo"]], { yaCargados: [], supresiones: [] })).toHaveProperty("fatal");
    expect(validarFilas([["Empresa", "Nombre"]], { yaCargados: [], supresiones: [] })).toHaveProperty("fatal");
    expect(validarFilas([["Empresa", "Nombre", "Correo"]], { yaCargados: [], supresiones: [] })).toHaveProperty("fatal");
    expect(validarFilas([], { yaCargados: [], supresiones: [] })).toHaveProperty("fatal");
  });
  it("ya cargados se omiten sin importar mayúsculas", () => {
    const r = validarFilas([["Empresa", "Nombre", "Correo"], ["A", "B", "B@A.mx"]], { yaCargados: ["b@a.mx"], supresiones: [] });
    expect("fatal" in r ? null : r.omit[0].motivo).toBe("Ya estaba cargado");
  });
});

describe("motor de envío", () => {
  const nuevo = (i: number, extra: Partial<ContactoMotor> = {}): ContactoMotor => ({
    id: "c" + i,
    correo: `c${i}@x.mx`,
    paso: 0,
    estatus: "Pendiente",
    pausado: false,
    inicio: null,
    ultimo_envio: null,
    ...extra,
  });
  const camp = { estado: "activa" as const, inicio: "2026-11-30" };
  const sinBajas = new Set<string>();

  it("no envía antes del inicio, en fin de semana ni con la campaña en pausa", () => {
    const cs = [nuevo(1)];
    expect(planearEnvios({ hoy: "2026-11-27", campana: camp, contactos: cs, enviadosHoy: 0, supresiones: sinBajas }).enviar).toEqual([]);
    expect(planearEnvios({ hoy: "2026-12-05", campana: camp, contactos: cs, enviadosHoy: 0, supresiones: sinBajas }).enviar).toEqual([]);
    expect(
      planearEnvios({ hoy: "2026-11-30", campana: { ...camp, estado: "pausada" }, contactos: cs, enviadosHoy: 0, supresiones: sinBajas }).enviar,
    ).toEqual([]);
  });
  it("tope de 150 por día; lo demás sale al día siguiente", () => {
    const cs = Array.from({ length: 200 }, (_, i) => nuevo(i));
    const p = planearEnvios({ hoy: "2026-11-30", campana: camp, contactos: cs, enviadosHoy: 0, supresiones: sinBajas });
    expect(p.enviar).toHaveLength(150);
    expect(p.pospuestos).toBe(50);
    expect(planearEnvios({ hoy: "2026-11-30", campana: camp, contactos: cs, enviadosHoy: 140, supresiones: sinBajas }).enviar).toHaveLength(10);
  });
  it("los seguimientos van primero y nadie recibe dos el mismo día", () => {
    const cs = [nuevo(1), nuevo(2, { paso: 1, inicio: "2026-11-26", estatus: "Enviado" }), nuevo(3, { paso: 1, inicio: "2026-11-26", ultimo_envio: "2026-11-30" })];
    const p = planearEnvios({ hoy: "2026-11-30", campana: camp, contactos: cs, enviadosHoy: 0, supresiones: sinBajas, tope: 1 });
    expect(p.enviar).toEqual([{ contactoId: "c2", paso: 2 }]);
  });
  it("detenidos, pausados y terminados no reciben; las bajas se pausan", () => {
    const cs = [
      nuevo(1, { estatus: "Respondió" }),
      nuevo(2, { estatus: "Rebotado" }),
      nuevo(3, { pausado: true }),
      nuevo(4, { paso: 3, inicio: "2026-11-01" }),
      nuevo(5),
      nuevo(6, { correo: "Baja@X.mx" }),
    ];
    const p = planearEnvios({ hoy: "2026-11-30", campana: camp, contactos: cs, enviadosHoy: 0, supresiones: new Set(["baja@x.mx"]) });
    expect(p.enviar).toEqual([{ contactoId: "c5", paso: 1 }]);
    expect(p.pausarPorBaja).toEqual(["c6"]);
  });
  it("si la fecha ya pasó, sale hoy", () => {
    const cs = [nuevo(1, { paso: 1, inicio: "2026-11-02", estatus: "Abierto" })];
    expect(planearEnvios({ hoy: "2026-11-30", campana: camp, contactos: cs, enviadosHoy: 0, supresiones: sinBajas }).enviar).toEqual([
      { contactoId: "c1", paso: 2 },
    ]);
  });
  it("secuencia completa: 3 correos en días 0, 4 y 9 sin duplicados", () => {
    let c = nuevo(1);
    const enviados: [string, number][] = [];
    for (let k = 0; k < 20; k++) {
      const hoy = new Date(Date.parse("2026-11-30T00:00:00Z") + k * 86400000).toISOString().slice(0, 10);
      const p = planearEnvios({ hoy, festivos: FEST, campana: camp, contactos: [c], enviadosHoy: 0, supresiones: sinBajas });
      for (const e of p.enviar) {
        enviados.push([hoy, e.paso]);
        c = { ...c, paso: e.paso, inicio: e.paso === 1 ? hoy : c.inicio, ultimo_envio: hoy, estatus: "Enviado" };
      }
    }
    expect(enviados).toEqual([
      ["2026-11-30", 1],
      ["2026-12-04", 2],
      ["2026-12-09", 3],
    ]);
  });
  it("próximo envío para el tablero", () => {
    expect(proximoEnvio(nuevo(1, { paso: 1, inicio: "2026-11-30" }), camp, "2026-11-30")).toBe("2026-12-04");
    expect(proximoEnvio(nuevo(1, { paso: 1, inicio: "2026-11-02", ultimo_envio: "2026-11-30" }), camp, "2026-11-30")).toBe("2026-12-01");
    expect(proximoEnvio(nuevo(1, { estatus: "Respondió" }), camp, "2026-11-30")).toBeNull();
  });
});

describe("tablero", () => {
  const c = (estatus: string, extra = {}) => ({ paso: 1, estatus: estatus as never, abrio: false, hizo_click: false, ...extra });
  it("resumen", () => {
    const s = resumen([c("Enviado"), c("Abierto", { abrio: true }), c("Respondió", { abrio: true }), c("Confirmado"), { ...c("Pendiente"), paso: 0 }]);
    expect(s).toMatchObject({ total: 5, enviados: 4, abiertos: 2, respondieron: 2, confirmados: 1 });
  });
  it("las 5 reglas de la recomendación, en orden", () => {
    const camp = { estado: "activa" as const, inicio: "2026-11-30" };
    expect(recomendacion([c("Respondió")], camp, "2026-12-01").titulo).toBe("Clientes por cerrar");
    expect(recomendacion([c("Enviado")], { ...camp, estado: "pausada" }, "2026-12-01").titulo).toBe("Campaña en pausa");
    expect(recomendacion([c("Abierto", { hizo_click: true })], camp, "2026-12-01").titulo).toBe("Clientes interesados");
    expect(recomendacion([{ ...c("Pendiente"), paso: 0 }], camp, "2026-11-27").titulo).toBe("Campaña programada");
    expect(recomendacion([c("Enviado")], camp, "2026-12-01").titulo).toBe("Secuencia en curso");
  });
});
