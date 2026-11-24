// Alta del despacho en 5 pasos: Perfil, Correo, Contactos, Vista previa y Programar.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { perfilOk, useActivo } from "./Layout";
import { Hd } from "@/components/Basicos";
import { Icono } from "@/components/Icono";
import { logoDe } from "@/components/Shell";
import { VistaCorreo } from "@/components/VistaCorreo";
import { useUi } from "@/lib/ui";
import { descargarXlsx, leerFilas } from "@/lib/excel";
import { colorDesdeUrl, logoProvisionalPng, procesarLogo } from "@/lib/logo";
import { n0 } from "@/lib/utils";
import { funcion, mensaje, supabase } from "@/integrations/supabase/client";
import { CADENCIA, fmtCorto, siguienteHabil, sumarDias } from "@core/fechas.ts";
import { cortoDe, marca } from "@core/marca.ts";
import { numero, pesos, precioDe } from "@core/precios.ts";
import { CONTACTO_EJEMPLO, MAPA_MARCA, renderCorreo, TEXTO_FIJO } from "@core/render.ts";
import { EJEMPLO, ENCABEZADOS, validarFilas, type ResultadoImport } from "@core/excel.ts";
import { TOPE_DIARIO } from "@core/motor.ts";
import { assetsUrl } from "@/components/VistaCorreo";
import logoAzul from "@/assets/monthly-blue.png";

export default function Alta() {
  const a = useActivo();
  const [q, setQ] = useSearchParams();
  const listo = [
    ["Perfil", perfilOk(a.despacho)],
    ["Correo", !!a.correo && a.correo.estado === "conectado"],
    ["Contactos", a.contactos.length > 0],
    ["Vista previa", a.despacho.confirmo_contactos || a.campana.estado !== "sin"],
    ["Programar", a.campana.estado !== "sin"],
  ] as [string, boolean][];
  const primero = Math.max(1, listo.findIndex((x) => !x[1]) + 1) || 1;
  const pasoUrl = Number(q.get("paso"));
  const [paso, setPasoState] = useState<number>(pasoUrl >= 1 && pasoUrl <= 5 ? pasoUrl : primero);
  const setPaso = (n: number) => {
    setPasoState(n);
    setQ({}, { replace: true });
    window.scrollTo(0, 0);
  };
  const hechos = listo.filter((x) => x[1]).length;
  const faltan = listo.filter((x) => !x[1]).map((x) => x[0]);

  return (
    <>
      <div className="prog">
        <div className="pgh">
          <b>Configuración de tu despacho</b>
          <span className="num">{hechos} de 5 pasos listos</span>
          <span className="sp" />
          <span className="pgf">{faltan.length ? "Te falta: " + faltan.join(", ") : "Todo listo. Tus correos ya están programados."}</span>
        </div>
        <div className="pgt">
          <i style={{ width: (hechos / 5) * 100 + "%" }} />
        </div>
        <div className="pgs">
          {listo.map(([t, ok], i) => {
            const cur = paso === i + 1;
            return (
              <button key={t} className={"pg" + (ok ? " done" : "") + (cur ? " on" : "")} onClick={() => setPaso(i + 1)} aria-current={cur ? "step" : undefined}>
                <span className="nd num">{ok ? "✓" : i + 1}</span>
                <span className="pt">
                  <b>{t}</b>
                  <small>{ok ? "Listo" : cur ? "En curso" : "Pendiente"}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {paso === 1 && <PasoPerfil siguiente={() => setPaso(2)} />}
      {paso === 2 && <PasoCorreo setPaso={setPaso} />}
      {paso === 3 && <PasoContactos setPaso={setPaso} />}
      {paso === 4 && <PasoPrevia setPaso={setPaso} />}
      {paso === 5 && <PasoProgramar setPaso={setPaso} />}
    </>
  );
}

/* ───────────── Paso 1 · Perfil ───────────── */

function PasoPerfil({ siguiente }: { siguiente: () => void }) {
  const a = useActivo();
  const { aviso } = useUi();
  const d = a.despacho;
  const [f, setF] = useState({
    nombre: d.nombre,
    sitio: d.sitio,
    precio: pesos(d.precio ?? a.config.precio_sugerido),
    firma: d.firma,
    corto: d.corto,
    color: marca(d).color,
    color_nota: d.color_nota,
  });
  const [guardando, setGuardando] = useState(false);
  const archivo = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const borrador = { ...d, nombre: f.nombre || d.nombre, corto: f.corto, color: f.color, precio: numero(f.precio) || null };
  const m = marca(borrador);
  const lg = logoDe(borrador);
  const precioN = numero(f.precio);
  const bajo = precioN < a.config.minimo;

  const subir = async (blob: Blob, provisional: boolean) => {
    const ruta = `${d.id}/logo-${Date.now()}.png`;
    const { error } = await supabase.storage.from("logos").upload(ruta, blob, { contentType: "image/png", upsert: true });
    if (error) throw error;
    return { logo_url: supabase.storage.from("logos").getPublicUrl(ruta).data.publicUrl, logo_provisional: provisional };
  };

  const alSubirLogo = async (file?: File) => {
    if (!file) return;
    try {
      const r = await procesarLogo(file);
      const logo = await subir(r.blob, false);
      const { error } = await supabase.from("despachos").update({ ...logo, color: r.color, color_nota: r.nota }).eq("id", d.id);
      if (error) throw error;
      setF({ ...f, color: r.color, color_nota: r.nota });
      a.refrescar();
      aviso("Logo actualizado. Ajustamos el color de tu marca.");
    } catch (e) {
      aviso(mensaje(e));
    }
  };

  const detectar = async () => {
    if (!d.logo_url || d.logo_provisional) return aviso("Sube tu logo para detectar el color.");
    try {
      const r = await colorDesdeUrl(d.logo_url);
      setF({ ...f, color: r.color, color_nota: r.nota });
    } catch (e) {
      aviso(mensaje(e));
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bajo) return aviso(`El precio mínimo es ${pesos(a.config.minimo)} + IVA al mes.`);
    setGuardando(true);
    try {
      const cambios: Record<string, unknown> = {
        nombre: f.nombre.trim(),
        sitio: f.sitio.trim(),
        firma: f.firma.trim(),
        corto: f.corto.trim(),
        precio: precioN,
        color: f.color,
        color_nota: f.color_nota,
      };
      // Sin logo propio: guardamos uno provisional en PNG con las iniciales (los correos no muestran SVG).
      if (!d.logo_url || d.logo_provisional) Object.assign(cambios, await subir(await logoProvisionalPng(f.nombre.trim(), f.color), true));
      const { error } = await supabase.from("despachos").update(cambios).eq("id", d.id);
      if (error) throw error;
      a.refrescar();
      aviso("Perfil guardado.");
      siguiente();
    } catch (err) {
      aviso(mensaje(err));
    } finally {
      setGuardando(false);
    }
  };

  const ro = a.soloLectura;
  return (
    <form onSubmit={guardar}>
      <fieldset disabled={ro} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="sec">
          <Hd n={1} titulo="Escribe tus datos y tu precio" lead="Así te identifican tus clientes, y lo que pagarán después de su mes gratis." />
          <div className="grid g2">
            <div className="fld">
              <label htmlFor="p1">Nombre comercial</label>
              <input className="inp" id="p1" required value={f.nombre} onChange={set("nombre")} />
            </div>
            <div className="fld">
              <label htmlFor="p2">Sitio web</label>
              <input className="inp" id="p2" type="url" required placeholder="https://tudespacho.mx" value={f.sitio} onChange={set("sitio")} />
            </div>
            <div className="fld">
              <label htmlFor="pp">Precio para tus clientes, al mes</label>
              <input className={"inp" + (bajo ? " err" : "")} id="pp" inputMode="numeric" required value={f.precio} onChange={set("precio")} onBlur={() => setF({ ...f, precio: pesos(f.precio) })} />
              <span className="hint">
                {bajo ? (
                  <>
                    <span className="dotc" />
                    El mínimo es {pesos(a.config.minimo)} + IVA al mes, lo que Monthly te cobra por empresa.
                  </>
                ) : (
                  <>
                    Monthly te cobra {pesos(a.config.minimo)}. Ganas <b className="navy">{pesos(precioN - a.config.minimo) || "$0"}</b> al mes por cada empresa que contrate.
                  </>
                )}
              </span>
            </div>
            <div className="fld">
              <label htmlFor="p3">Nombre de quien firma</label>
              <input className="inp" id="p3" required placeholder="Nombre y apellido" value={f.firma} onChange={set("firma")} />
            </div>
            <div className="fld">
              <label htmlFor="p4">Nombre corto para los asuntos</label>
              <input className="inp" id="p4" maxLength={24} placeholder={cortoDe({ nombre: f.nombre || d.nombre })} value={f.corto} onChange={set("corto")} />
              <span className="hint">
                Así empieza el asunto: {cortoDe(borrador)} - Activa tu nuevo beneficio para {a.config.anio}
              </span>
            </div>
          </div>
        </div>

        <div className="sec">
          <Hd n={2} titulo="Sube tu logo y elige tu color" lead="El color es el fondo donde va tu logo dentro del correo." />
          <div className="grid g2">
            <div className="fld">
              <label>Logo (PNG, JPG o SVG)</label>
              <div className="row">
                <button type="button" className="btn" onClick={() => archivo.current?.click()}>
                  <Icono n="up" />
                  {d.logo_url && !d.logo_provisional ? "Cambiar logo" : "Subir logo"}
                </button>
                {d.logo_url && !d.logo_provisional ? null : <span className="hint">Mientras tanto usamos uno provisional.</span>}
                <input ref={archivo} type="file" accept="image/png,image/jpeg,image/svg+xml" hidden onChange={(e) => (alSubirLogo(e.target.files?.[0]), (e.target.value = ""))} />
              </div>
            </div>
            <div className="fld">
              <label htmlFor="pc">Color de tu marca en el correo</label>
              <div className="row">
                <input
                  type="color"
                  id="pc"
                  className="sw"
                  value={m.color}
                  aria-label="Elegir color"
                  onChange={(e) => setF({ ...f, color: e.target.value.toUpperCase(), color_nota: "Color elegido por ti." })}
                />
                <span className="chip num">{m.color}</span>
                <button type="button" className="btn sm" onClick={detectar}>
                  Detectar del logo
                </button>
              </div>
              <span className="hint">{f.color_nota || "Es el fondo donde va tu logo. Lo detectamos de tu logo y lo puedes ajustar."}</span>
            </div>
          </div>
        </div>

        <div className="sec">
          <Hd n={3} titulo="Revisa cómo se ve y guarda" lead="Tu marca aparece en tres lugares de cada correo." />
          <div className="grid g3 pvm">
            <div>
              <div className="pv-fr" style={{ background: m.color, color: m.texto }}>
                <span>Te presentamos, en alianza con</span>
                <img alt="" src={lg} />
              </div>
              <p className="hint">Franja bajo el encabezado</p>
            </div>
            <div>
              <div className="pv-of">
                <div style={{ background: m.color, color: m.tenue }}>
                  <span style={{ fontSize: 20 }}>🎁</span>
                  <img alt="" src={lg} />
                  <span>Exclusivo clientes</span>
                </div>
                <div>
                  <b>1er mes gratis.</b>
                  <span>Después {pesos(precioDe(borrador, a.config))} + IVA/mes</span>
                </div>
              </div>
              <p className="hint">Tarjeta del beneficio</p>
            </div>
            <div>
              <div className="pv-ft">
                <img alt="monthly" src={logoAzul} />
                <span>×</span>
                <img alt="" src={lg} />
              </div>
              <p className="hint">Pie del correo</p>
            </div>
          </div>
          <h3 className="mt2">Qué cambia con tu marca</h3>
          <div className="mapa">
            {MAPA_MARCA.slice(0, 6).map((r) => (
              <div key={r[0]}>
                <b>{r[0]}</b>
                <span>{r[1]}.</span>
              </div>
            ))}
          </div>
          <p className="hint mt">{TEXTO_FIJO}</p>
          <div className="row mt2">
            <span className="sp" />
            <button className={"btn pri" + (guardando ? " dis" : "")}>{guardando ? "Guardando…" : "Guardar y continuar"}</button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

/* ───────────── Paso 2 · Correo ───────────── */

function PasoCorreo({ setPaso }: { setPaso: (n: number) => void }) {
  const a = useActivo();
  const { aviso } = useUi();
  const [q] = useSearchParams();
  const [ocupado, setOcupado] = useState(false);
  const ok = !!a.correo && a.correo.estado === "conectado";

  useEffect(() => {
    const r = q.get("correo");
    if (r === "ok") aviso("Correo conectado.");
    if (r === "error") aviso("No se pudo conectar el correo. Vuelve a intentarlo.");
    if (r === "cancelado") aviso("Cancelaste la conexión del correo.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conectar = async (proveedor: "gmail" | "outlook") => {
    setOcupado(true);
    try {
      const r = await funcion<{ url: string; simulado?: boolean }>("oauth-iniciar", { proveedor });
      if (r.simulado) {
        a.refrescar();
        aviso("Correo conectado en modo simulado: no se envían correos reales.");
      } else window.location.href = r.url;
    } catch (e) {
      aviso(mensaje(e));
    } finally {
      setOcupado(false);
    }
  };
  const desconectar = async () => {
    try {
      await funcion("desconectar-correo");
      a.refrescar();
    } catch (e) {
      aviso(mensaje(e));
    }
  };
  const prueba = async () => {
    setOcupado(true);
    try {
      const r = await funcion<{ para: string; simulado: boolean }>("enviar-pendientes", { prueba: true });
      aviso(r.simulado ? `Prueba registrada para ${r.para} (modo simulado, no se envió).` : `Te enviamos el correo 1 a ${r.para}.`);
    } catch (e) {
      aviso(mensaje(e));
    } finally {
      setOcupado(false);
    }
  };
  const ro = a.soloLectura;
  const nombreProv = a.correo?.proveedor === "outlook" ? "Outlook" : "Gmail";

  return (
    <>
      <div className="sec">
        <Hd n={1} titulo="Elige tu correo" lead="Los correos salen de tu propio buzón y las respuestas te llegan a ti.">
          {a.correo ? <span className={"st " + (ok ? "fav" : "pau")}>{nombreProv}</span> : null}
        </Hd>
        {a.correo ? (
          <div className="tint row">
            <span className="navy">{a.correo.email}</span>
            {!ok && <span className="hint err">Perdimos el acceso a este buzón. Vuelve a conectarlo.</span>}
            <span className="sp" />
            <button className={"btn sm" + (ro ? " dis" : "")} onClick={desconectar}>
              Usar otro correo
            </button>
          </div>
        ) : (
          <div className="row">
            <button className={"btn pri" + (ocupado || ro ? " dis" : "")} onClick={() => conectar("gmail")}>
              Gmail o Google Workspace
            </button>
            <button className={"btn pri" + (ocupado || ro ? " dis" : "")} onClick={() => conectar("outlook")}>
              Outlook o Microsoft 365
            </button>
          </div>
        )}
      </div>
      <div className={"sec" + (ok ? "" : " off")}>
        <Hd n={2} titulo="Autoriza el envío" lead="Solo pedimos permiso para enviar. No leemos tu bandeja.">
          {ok ? <span className="st fav">Autorizado</span> : <span className="chip">Pendiente</span>}
        </Hd>
      </div>
      <div className={"sec" + (ok ? "" : " off")}>
        <Hd n={3} titulo="Envíate una prueba" lead="Recibe el correo 1 en tu bandeja para verlo como lo verá tu cliente.">
          <button className={"btn" + (ok && !ocupado && !ro ? "" : " dis")} onClick={prueba}>
            Enviarme una prueba
          </button>
        </Hd>
      </div>
      <div className="row navr">
        <button className="btn" onClick={() => setPaso(1)}>
          Atrás
        </button>
        <span className="sp" />
        <button className={"btn pri" + (ok ? "" : " dis")} onClick={() => setPaso(3)}>
          Continuar
        </button>
      </div>
    </>
  );
}

/* ───────────── Paso 3 · Contactos ───────────── */

function PasoContactos({ setPaso }: { setPaso: (n: number) => void }) {
  const a = useActivo();
  const { aviso } = useUi();
  const [im, setIm] = useState<ResultadoImport | null>(null);
  const [sobre, setSobre] = useState(false);
  const [importando, setImportando] = useState(false);
  const archivo = useRef<HTMLInputElement>(null);

  const validar = async (rows: unknown[][]) => {
    const correos = rows.flat().map(String).filter((x) => x.includes("@"));
    const { data } = await supabase.rpc("correos_suprimidos", { p_correos: correos });
    setIm(validarFilas(rows, { yaCargados: a.contactos.map((c) => c.correo), supresiones: (data as string[]) || [] }));
  };
  const leer = async (file?: File) => {
    if (!file) return;
    try {
      await validar(await leerFilas(file));
    } catch {
      setIm({ fatal: "No pudimos leer el archivo. Verifica que sea .xlsx, .xls o .csv." });
    }
  };
  const importar = async () => {
    if (!im || "fatal" in im) return;
    setImportando(true);
    try {
      const filas = im.ok.map((r) => ({ despacho_id: a.id, empresa: r.empresa, nombre: r.nombre, correo: r.correo.toLowerCase(), tel: r.tel }));
      for (let i = 0; i < filas.length; i += 500) {
        const { error } = await supabase
          .from("contactos")
          .upsert(filas.slice(i, i + 500), { onConflict: "despacho_id,correo", ignoreDuplicates: true });
        if (error) throw error;
      }
      setIm(null);
      a.refrescar();
      aviso(`${n0(filas.length)} contactos importados.`);
    } catch (e) {
      aviso(mensaje(e));
    } finally {
      setImportando(false);
    }
  };
  const plantilla = () =>
    descargarXlsx("plantilla-contactos-monthly.xlsx", [
      ["Contactos", [ENCABEZADOS, ["Aceros del Norte", "Ricardo Treviño", "ricardo@acerosdelnorte.mx", "81 5550 0100"]]],
      [
        "Instrucciones",
        [
          ["Cómo llenar la plantilla"],
          ["1. Una fila por contacto. No cambies los encabezados."],
          ["2. Las columnas con asterisco son obligatorias."],
          ["3. Borra la fila de ejemplo antes de subir el archivo."],
          ["4. Solo incluye clientes de tu despacho con los que tengas relación."],
        ],
      ],
    ]);
  const ro = a.soloLectura;

  return (
    <>
      <div className="sec">
        <Hd n={1} titulo="Descarga la plantilla" lead="Un archivo de Excel con las columnas listas.">
          <button className="btn" onClick={plantilla}>
            <Icono n="down" />
            Descargar plantilla
          </button>
        </Hd>
      </div>
      <div className="sec">
        <Hd n={2} titulo="Llénala con tus clientes" lead="Una fila por contacto. Solo clientes de tu despacho con los que tengas relación." />
        <div className="row">
          {["Empresa", "Nombre del contacto", "Correo"].map((c) => (
            <span key={c} className="st az">
              {c}
            </span>
          ))}
          <span className="chip">Teléfono, opcional</span>
        </div>
      </div>
      <div className="sec">
        <Hd n={3} titulo="Sube el archivo" lead="Validamos todo antes de guardar y te decimos qué filas corregir.">
          {a.contactos.length ? <span className="st fav">{n0(a.contactos.length)} contactos cargados</span> : null}
        </Hd>
        {!im ? (
          <>
            <label
              className={"drop" + (sobre ? " over" : "") + (ro ? " off" : "")}
              onDragOver={(e) => (e.preventDefault(), setSobre(true))}
              onDragLeave={() => setSobre(false)}
              onDrop={(e) => {
                e.preventDefault();
                setSobre(false);
                if (!ro) leer(e.dataTransfer.files[0]);
              }}
              onClick={(e) => {
                e.preventDefault();
                if (!ro) archivo.current?.click();
              }}
            >
              <h3>Sube tu archivo de Excel</h3>
              <p className="small muted" style={{ marginTop: 4 }}>
                Arrástralo aquí o haz click para elegirlo (.xlsx, .xls o .csv)
              </p>
            </label>
            <input ref={archivo} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => (leer(e.target.files?.[0]), (e.target.value = ""))} />
            <div className="row mt">
              <span className="small muted">¿Sin archivo a la mano?</span>
              <button className={"btn sm" + (ro ? " dis" : "")} onClick={() => validar(EJEMPLO)}>
                Probar con un archivo de ejemplo
              </button>
            </div>
            <div className="row mt2">
              <button className="btn" onClick={() => setPaso(2)}>
                Atrás
              </button>
              <span className="sp" />
              <button className={"btn pri" + (a.contactos.length ? "" : " dis")} onClick={() => setPaso(4)}>
                Continuar
              </button>
            </div>
          </>
        ) : "fatal" in im ? (
          <>
            <p className="hint err">{im.fatal}</p>
            <div className="row mt">
              <button className="btn" onClick={() => setIm(null)}>
                Subir otro archivo
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid g3">
              <div className="card kpi">
                <div className="k">Válidos</div>
                <div className="v">{n0(im.ok.length)}</div>
                <div className="s">Se importan</div>
              </div>
              <div className="card kpi">
                <div className="k">Con error</div>
                <div className="v">{n0(im.err.length)}</div>
                <div className="s">No se importan</div>
              </div>
              <div className="card kpi">
                <div className="k">Omitidos</div>
                <div className="v">{n0(im.omit.length)}</div>
                <div className="s">Duplicados o dados de baja</div>
              </div>
            </div>
            {im.err.length + im.omit.length > 0 && (
              <div className="tblw mt">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Empresa</th>
                      <th>Correo</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...im.err, ...im.omit]
                      .sort((x, y) => x.fila - y.fila)
                      .map((r) => (
                        <tr key={r.fila}>
                          <td className="num">{r.fila}</td>
                          <td>
                            <b>{r.empresa || "–"}</b>
                          </td>
                          <td>{r.correo || "–"}</td>
                          <td>
                            {r.tipo === "err" && <span className="dotc" />}
                            {r.motivo}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="row mt2">
              <button className="btn" onClick={() => setIm(null)}>
                Cancelar
              </button>
              {im.err.length > 0 && (
                <button
                  className="btn"
                  onClick={() =>
                    descargarXlsx("contactos-con-error.xlsx", [
                      ["Contactos", [[...ENCABEZADOS, "Fila", "Motivo"], ...im.err.map((r) => [r.empresa, r.nombre, r.correo, r.tel, r.fila, r.motivo])]],
                    ])
                  }
                >
                  <Icono n="down" />
                  Descargar filas con error
                </button>
              )}
              <span className="sp" />
              <button className={"btn pri" + (im.ok.length && !importando && !ro ? "" : " dis")} onClick={importar}>
                {importando ? "Importando…" : `Importar ${n0(im.ok.length)} contactos`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ───────────── Paso 4 · Vista previa ───────────── */

function PasoPrevia({ setPaso }: { setPaso: (n: number) => void }) {
  const a = useActivo();
  const { aviso } = useUi();
  const d = a.despacho;
  const [ok, setOk] = useState(d.confirmo_contactos);
  const programada = a.campana.estado !== "sin";
  const c0 = a.contactos[0];

  const continuar = async () => {
    if (!d.confirmo_contactos && !a.soloLectura) {
      const { error } = await supabase.from("despachos").update({ confirmo_contactos: true }).eq("id", d.id);
      if (error) return aviso(mensaje(error));
      a.refrescar();
    }
    setPaso(5);
  };

  return (
    <>
      <div className="sec">
        <Hd
          n={1}
          titulo="Revisa los tres correos"
          lead={`Así los recibe ${c0 ? c0.nombre || c0.empresa : CONTACTO_EJEMPLO.nombre + " (contacto de ejemplo)"}. El contenido lo define Monthly.`}
        />
        <VistaCorreo despacho={d} contacto={c0} config={a.config} overrides={a.overrides} remitente={`${d.firma || d.nombre} <${a.correo?.email || "tu correo"}>`} />
      </div>
      <div className="sec">
        <Hd n={2} titulo="Confirma tus contactos" lead="Los correos salen a nombre de tu despacho.">
          {d.confirmo_contactos ? <span className="st fav">Confirmado</span> : null}
        </Hd>
        {!d.confirmo_contactos && (
          <label className="chk">
            <input type="checkbox" checked={ok} disabled={a.soloLectura} onChange={(e) => setOk(e.target.checked)} />
            <span className="bx" />
            <span>Confirmo que estos contactos son clientes de mi despacho y que tengo relación con ellos.</span>
          </label>
        )}
      </div>
      <div className={"sec" + (ok || programada ? "" : " off")}>
        <Hd n={3} titulo="Continúa a programar" lead="En el siguiente paso ves el calendario de envío.">
          <button className={"btn pri" + (ok || programada ? "" : " dis")} onClick={continuar}>
            Continuar
          </button>
        </Hd>
      </div>
      <div className="row navr">
        <button className="btn" onClick={() => setPaso(3)}>
          Atrás
        </button>
      </div>
    </>
  );
}

/* ───────────── Paso 5 · Programar ───────────── */

function PasoProgramar({ setPaso }: { setPaso: (n: number) => void }) {
  const a = useActivo();
  const { aviso } = useUi();
  const ir = useNavigate();
  const d = a.despacho;
  const prog = a.campana.estado !== "sin";
  const ini = prog && a.campana.inicio ? a.campana.inicio : siguienteHabil(sumarDias(a.hoy, 1), a.festivos);
  const c0 = a.contactos[0] || CONTACTO_EJEMPLO;
  const falta: string[] = [];
  if (!perfilOk(d)) falta.push("completar tu perfil");
  if (!a.correo || a.correo.estado !== "conectado") falta.push("conectar tu correo");
  if (!a.contactos.length) falta.push("cargar contactos");
  if (!d.confirmo_contactos) falta.push("confirmar la vista previa");

  const programar = async () => {
    const { data, error } = await supabase.rpc("programar_campana");
    if (error) return aviso(mensaje(error));
    a.refrescar();
    ir(a.base + "/tablero");
    aviso(`Campaña programada. El primer envío sale el ${fmtCorto(data as string)}.`);
  };

  return (
    <>
      <div className="sec">
        <Hd n={1} titulo="Revisa el calendario" lead="Los correos salen en días hábiles, entre 9:00 y 11:00, hora del centro de México." />
        <div className="grid g3">
          {[0, 1, 2].map((i) => (
            <div className="card kpi" key={i}>
              <div className="k">
                Correo {i + 1} · día {CADENCIA[i]}
              </div>
              <div className="v" style={{ fontSize: 19 }}>
                {fmtCorto(siguienteHabil(sumarDias(ini, CADENCIA[i]), a.festivos))}
              </div>
              <div className="s">
                {renderCorreo({ n: i, override: a.overrides[i], despacho: d, contacto: c0, config: a.config, assetsUrl: assetsUrl() }).asunto}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sec">
        <Hd n={2} titulo="Revisa las reglas de envío" lead="Se aplican solas; no tienes que hacer nada." />
        <div className="mapa">
          <div>
            <b>{n0(a.contactos.length)} contactos en la lista</b>
            <span>Salen máximo {TOPE_DIARIO} correos por día.</span>
          </div>
          <div>
            <b>Tú marcas quién respondió</b>
            <span>Al marcarlo, su secuencia se detiene. También se detiene si su correo rebota.</span>
          </div>
        </div>
      </div>
      <div className="sec">
        <Hd
          n={3}
          titulo={prog ? "Tu campaña ya está programada" : "Programa el envío"}
          lead={prog ? "Sigue los resultados en tu tablero." : "Puedes pausarla cuando quieras desde tu tablero."}
        >
          {prog ? <span className="st fav">Programada</span> : null}
        </Hd>
        {prog ? (
          <div className="row">
            <span className="sp" />
            <button className="btn pri" onClick={() => ir(a.base + "/tablero")}>
              Ir al tablero
            </button>
          </div>
        ) : (
          <>
            {falta.length > 0 && (
              <p className="hint err" style={{ marginBottom: 12 }}>
                Te falta {falta.join(", ")}.
              </p>
            )}
            <div className="row">
              <button className="btn" onClick={() => setPaso(4)}>
                Atrás
              </button>
              <span className="sp" />
              <button className={"btn pri" + (falta.length || a.soloLectura ? " dis" : "")} onClick={programar}>
                Programar envío
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
