// Tablero del despacho: resultados, recomendación y la lista de contactos con sus acciones.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivo } from "./Layout";
import { ChipEstatus, emojiEstatus, Hd, Vacio } from "@/components/Basicos";
import { Chispa, Icono } from "@/components/Icono";
import { useUi } from "@/lib/ui";
import { descargarXlsx } from "@/lib/excel";
import { n0 } from "@/lib/utils";
import { useAccionContacto, useEnviosDesde, useEventos } from "@/lib/consultas";
import { funcion, mensaje } from "@/integrations/supabase/client";
import type { Contacto } from "@/integrations/supabase/tipos";
import { COLOR_CORREO, COLOR_ESTATUS, DETIENEN, ESTATUS, type Estatus } from "@core/tipos.ts";
import { diaDelMes, fmtCorto, mesCorto, sumarDias } from "@core/fechas.ts";
import { proximoEnvio } from "@core/motor.ts";
import { recomendacion, resumen } from "@core/tablero.ts";

type Accion = "respondio" | "confirmado" | "perdido" | "reabrir" | "pausar" | "reanudar";

/** Confirmación, RPC y aviso para cada acción manual. Compartido por la tabla y el detalle. */
function useAcciones(despachoId: string) {
  const { confirmar, aviso, cerrar } = useUi();
  const m = useAccionContacto(despachoId);
  return async (c: Contacto, accion: Accion) => {
    const textos: Partial<Record<Accion, [string, string, string]>> = {
      respondio: [`¿${c.empresa} respondió?`, "Su secuencia se detiene y le avisamos al equipo de Monthly.", "Sí, respondió"],
      confirmado: [`Confirmar ${c.empresa}`, "Activó su mes gratis. Ya no recibe más correos.", "✅ Confirmado"],
      perdido: [`Marcar ${c.empresa} como perdido`, "No le interesó. Ya no recibe más correos.", "❌ Perdido"],
      reabrir: [`Reabrir ${c.empresa}`, "Regresa a «Respondió» para que lo vuelvas a cerrar.", "Reabrir"],
    };
    const t = textos[accion];
    if (t && !(await confirmar(t[0], t[1], t[2]))) return;
    cerrar();
    try {
      const r = await m.mutateAsync({ id: c.id, accion });
      if (accion === "respondio") funcion("avisar-respuesta", { contacto_id: c.id }).catch(() => {});
      const msg: Record<Accion, string> = {
        respondio: `${c.empresa} marcado como respondió. Su secuencia se detuvo y le avisamos a Monthly.`,
        confirmado: `${c.empresa} confirmado.`,
        perdido: `${c.empresa} marcado como perdido.`,
        reabrir: `${c.empresa} regresó a respondió.`,
        pausar: `${c.empresa} en pausa. No recibe más correos hasta que lo reanudes.`,
        reanudar: `${c.empresa} reanudado.`,
      };
      aviso(msg[accion]);
      return r;
    } catch (e) {
      aviso(mensaje(e));
    }
  };
}

export default function Tablero() {
  const a = useActivo();
  const ir = useNavigate();
  const { abrir } = useUi();
  const accion = useAcciones(a.id);
  const [q, setQ] = useState("");
  const s = resumen(a.contactos);
  const camp = { estado: a.campana.estado, inicio: a.campana.inicio };

  const filas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return a.contactos.filter(
      (c) => (!a.filtro || c.estatus === a.filtro) && (!t || `${c.empresa} ${c.nombre} ${c.correo}`.toLowerCase().includes(t)),
    );
  }, [a.contactos, a.filtro, q]);

  if (!a.contactos.length)
    return (
      <div className="sec">
        <Vacio titulo="Todavía no hay contactos" texto="Completa tu alta y sube la lista de tus clientes para empezar.">
          <button className="btn pri" onClick={() => ir(a.base + "/alta")}>
            Continuar con el alta
          </button>
        </Vacio>
      </div>
    );

  const exportar = () =>
    descargarXlsx(`contactos-${a.hoy}.xlsx`, [
      [
        "Contactos",
        [
          ["Empresa", "Contacto", "Correo", "Teléfono", "Paso", "Estatus", "Último evento"],
          ...a.contactos.map((c) => [c.empresa, c.nombre, c.correo, c.tel, c.paso, c.estatus, c.ultimo || ""]),
        ],
      ],
    ]);

  const rec = recomendacion(a.contactos, camp, a.hoy, a.festivos);
  const ro = a.soloLectura;

  return (
    <>
      <Graficas />
      <div className="insr">
        <div className="ins">
          <span className="sp2">
            <Chispa />
          </span>
          <div>
            <p>
              <span className="it">{rec.titulo}.</span> {rec.dato}
            </p>
            <p className="rec">
              Recomendado: {rec.accion} · {rec.responsable} · {rec.plazo}
            </p>
          </div>
        </div>
      </div>
      <div className="sec" id="tabla">
        <Hd titulo="Contactos" lead={`${n0(a.contactos.length)} clientes en tu lista. Haz click en uno para ver su historial.`}>
          <div className="row">
            <button className="btn" onClick={exportar}>
              <Icono n="down" />
              Exportar a Excel
            </button>
          </div>
        </Hd>
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="seg">
            {ESTATUS.map((e) => {
              const n = a.contactos.filter((c) => c.estatus === e).length;
              const on = a.filtro === e;
              return (
                <button key={e} className={on ? "on" : ""} onClick={() => a.setFiltro(on ? null : e)} title={on ? "Quitar filtro" : "Ver solo " + e.toLowerCase()}>
                  {emojiEstatus(e) ? <span className="se">{emojiEstatus(e)}</span> : <i className="sd" style={{ background: COLOR_ESTATUS[e] }} />}
                  {e}
                  <span className="num">{n}</span>
                </button>
              );
            })}
          </div>
          <span className="sp" />
          <input className="inp buscar" type="search" placeholder="Buscar empresa o contacto" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {!filas.length ? (
          <Vacio titulo="Sin contactos con ese filtro" texto="Prueba con otro estatus o borra la búsqueda." />
        ) : (
          <div className="tblw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Paso</th>
                  <th>Estatus</th>
                  <th>Último evento</th>
                  <th>Siguiente envío</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filas.map((c) => {
                  const p = c.pausado ? null : proximoEnvio(c, camp, a.hoy, a.festivos);
                  const detenido = DETIENEN.includes(c.estatus);
                  const abrirDetalle = () =>
                    abrir(<Detalle c={c} despachoId={a.id} soloLectura={ro} accion={accion} />, true);
                  const stop = (e: React.MouseEvent) => e.stopPropagation();
                  return (
                    <tr key={c.id} className="click" tabIndex={0} onClick={abrirDetalle} onKeyDown={(e) => e.key === "Enter" && abrirDetalle()}>
                      <td>
                        <b>{c.empresa}</b>
                      </td>
                      <td>
                        {c.nombre}
                        <div className="small muted">{c.correo}</div>
                      </td>
                      <td className="num">{c.paso} de 3</td>
                      <td>
                        <ChipEstatus e={c.estatus} />
                      </td>
                      <td>{fmtCorto(c.ultimo)}</td>
                      <td>
                        {c.pausado ? (
                          <span className="st pau">En pausa</span>
                        ) : p && a.campana.estado === "activa" ? (
                          `${fmtCorto(p)} · correo ${c.paso + 1}`
                        ) : (
                          "–"
                        )}
                      </td>
                      <td className="ac" onClick={stop}>
                        {ro ? null : c.estatus === "Respondió" ? (
                          <>
                            <button className="btn sm ok" onClick={() => accion(c, "confirmado")}>
                              ✅ Confirmado
                            </button>
                            <button className="btn sm" onClick={() => accion(c, "perdido")}>
                              ❌ Perdido
                            </button>
                          </>
                        ) : !detenido && c.paso > 0 ? (
                          <>
                            <button className="btn sm" onClick={() => accion(c, "respondio")}>
                              ✉️ Respondió
                            </button>
                            {c.paso < 3 && (
                              <button className="btn sm" onClick={() => accion(c, c.pausado ? "reanudar" : "pausar")}>
                                {c.pausado ? "Reanudar" : "Pausar"}
                              </button>
                            )}
                          </>
                        ) : !detenido && c.paso < 3 ? (
                          <button className="btn sm" onClick={() => accion(c, c.pausado ? "reanudar" : "pausar")}>
                            {c.pausado ? "Reanudar" : "Pausar"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Graficas() {
  const a = useActivo();
  const s = resumen(a.contactos);
  const desde = sumarDias(a.hoy, -9);
  const { data: envios = [] } = useEnviosDesde(a.id, desde);
  const filas: [string, number, number, string, string][] = [
    ["Enviados", s.enviados, s.total, COLOR_ESTATUS.Enviado, "de tu lista"],
    ["Abiertos", s.abiertos, s.enviados, COLOR_ESTATUS.Abierto, "de enviados"],
    ["Respondieron", s.respondieron, s.enviados, COLOR_ESTATUS["Respondió"], "de enviados"],
    ["Confirmados", s.confirmados, s.respondieron, COLOR_ESTATUS.Confirmado, "de respuestas"],
  ];
  let mes = "";
  const dias = Array.from({ length: 10 }, (_, k) => {
    const f = sumarDias(a.hoy, k - 9);
    const seg = [0, 0, 0];
    for (const e of envios) if (e.fecha === f && !e.error) seg[e.paso - 1]++;
    const m = mesCorto(f);
    const r = { l: String(diaDelMes(f)), l2: m !== mes ? m : "", seg, v: seg[0] + seg[1] + seg[2], on: k === 9 };
    mes = m;
    return r;
  });
  const max = Math.max(...dias.map((x) => x.v)) || 1;

  return (
    <div className="res">
      {filas.map(([t, v, de, color, cap]) => (
        <div className="rk" key={t} style={{ ["--c" as string]: color }}>
          <div className="k">
            {t === "Confirmados" ? <span className="se">✅</span> : <i />}
            {t}
          </div>
          <div className="v num">{n0(v)}</div>
          <span className="cap num">{de && v ? `${Math.round((v / de) * 100)}% ${cap}` : "Sin datos"}</span>
        </div>
      ))}
      <div className="rk gch">
        <div className="k">
          <span>
            Correos por día<small>Últimos 10 días</small>
          </span>
          <span className="sp" />
          <span className="leg">
            {["1", "2", "3"].map((t, k) => (
              <span key={t}>
                <i style={{ background: COLOR_CORREO[k] }} />
                Correo {t}
              </span>
            ))}
          </span>
        </div>
        {dias.some((x) => x.v) ? (
          <>
            <div className="bars" role="img" aria-label={dias.map((x) => `${x.l}: ${x.v}`).join(", ")} style={{ gridTemplateColumns: `repeat(${dias.length},1fr)` }}>
              {dias.map((x, i) => (
                <div className={"bc" + (x.on ? " on" : "")} key={i}>
                  <span className="bv num">{x.v ? x.v.toLocaleString("es-MX") : "–"}</span>
                  {x.v ? (
                    <div className="bb" style={{ height: Math.max(5, (x.v / max) * 78) + "%" }}>
                      {x.seg.map((v, k) => (v ? <i key={k} style={{ flex: v, background: COLOR_CORREO[k] }} /> : null))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="bl" style={{ gridTemplateColumns: `repeat(${dias.length},1fr)` }}>
              {dias.map((x, i) => (
                <span key={i} className={x.on ? "on" : ""}>
                  {x.l}
                  {x.l2 ? <small>{x.l2}</small> : null}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="hint" style={{ marginTop: 14 }}>
            Aún no sale ningún correo. Aquí verás cuántos salen cada día.
          </p>
        )}
      </div>
    </div>
  );
}

function Detalle({
  c,
  despachoId,
  soloLectura,
  accion,
}: {
  c: Contacto;
  despachoId: string;
  soloLectura: boolean;
  accion: (c: Contacto, a: Accion) => Promise<unknown>;
}) {
  const { cerrar } = useUi();
  const { data: eventos, isLoading } = useEventos(c.id);
  const detenido = DETIENEN.includes(c.estatus as Estatus);
  void despachoId;
  return (
    <>
      <div className="row">
        <div>
          <h2>{c.empresa}</h2>
          <p className="lead">
            {c.nombre} · {c.correo}
            {c.tel ? " · " + c.tel : ""}
          </p>
        </div>
        <span className="sp" />
        <ChipEstatus e={c.estatus} />
      </div>
      <p className="small muted mt2">
        Paso {c.paso} de 3{c.pausado ? " · en pausa" : ""}
      </p>
      <p className="small muted mt">Historial</p>
      <ul className="tl">
        {isLoading ? (
          <li>
            <span>–</span>Cargando…
          </li>
        ) : eventos?.length ? (
          eventos.map((x) => (
            <li key={x.id}>
              <span>{fmtCorto(x.fecha.slice(0, 10))}</span>
              {x.texto}
            </li>
          ))
        ) : (
          <li>
            <span>–</span>Sin eventos todavía
          </li>
        )}
      </ul>
      <div className="ft">
        {!soloLectura && (
          <>
            {(c.estatus === "Confirmado" || c.estatus === "Perdido") && (
              <button className="btn" onClick={() => accion(c, "reabrir")}>
                Reabrir
              </button>
            )}
            {c.estatus === "Respondió" && (
              <>
                <button className="btn" onClick={() => accion(c, "confirmado")}>
                  ✅ Marcar confirmado
                </button>
                <button className="btn" onClick={() => accion(c, "perdido")}>
                  ❌ Marcar perdido
                </button>
              </>
            )}
            {!detenido && (
              <button className="btn" onClick={() => accion(c, "respondio")}>
                ✉️ Marcar respondió
              </button>
            )}
            {!detenido && c.paso < 3 && (
              <button className="btn" onClick={() => accion(c, c.pausado ? "reanudar" : "pausar")}>
                {c.pausado ? "Reanudar" : "Pausar"}
              </button>
            )}
          </>
        )}
        <button className="btn pri" onClick={cerrar}>
          Cerrar
        </button>
      </div>
    </>
  );
}
