// Panel · Despachos: invitar, acompañar el alta y medir resultados.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hd, Cargando } from "@/components/Basicos";
import { logoDe } from "@/components/Shell";
import { useUi } from "@/lib/ui";
import { n0 } from "@/lib/utils";
import { useConfig, useResumenDespachos } from "@/lib/consultas";
import { funcion, mensaje, supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { pesos, precioDe } from "@core/precios.ts";
import type { ResumenDespacho } from "@/integrations/supabase/tipos";

export default function Despachos() {
  const { data: r, isLoading } = useResumenDespachos();
  const { data: cfg } = useConfig();
  const { abrir, aviso } = useUi();
  const qc = useQueryClient();
  const ir = useNavigate();
  if (isLoading || !r || !cfg) return <Cargando />;

  const pausar = async (d: ResumenDespacho) => {
    const { error } = await supabase.rpc("pausar_campana", { p_despacho: d.id });
    if (error) return aviso(mensaje(error));
    qc.invalidateQueries({ queryKey: ["resumen"] });
    qc.invalidateQueries({ queryKey: ["campana", d.id] });
  };
  const tot = r.reduce((a, d) => [a[0] + d.total, a[1] + d.enviados, a[2] + d.abiertos, a[3] + d.respondieron, a[4] + d.confirmados], [0, 0, 0, 0, 0]);
  const chip = (t: string, ok: boolean) => (
    <span key={t} className={ok ? "st fav" : "chip"}>
      {t}
    </span>
  );

  return (
    <>
      <div className="sec">
        <Hd n={1} titulo="Invita a un despacho" lead="Le llega un enlace de acceso para completar su alta.">
          <button className="btn pri" onClick={() => abrir(<Invitar />)}>
            Invitar despacho
          </button>
        </Hd>
      </div>
      <div className="sec">
        <Hd n={2} titulo="Acompaña su alta" lead="Los pasos en verde ya están completos. Entra como el despacho para ayudarle." />
        <div className="tblw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Despacho</th>
                <th>Avance del alta</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {r.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <span className="av">
                        <img alt="" src={logoDe(d)} />
                      </span>
                      <div>
                        <b>{d.nombre}</b>
                        <div className="small muted">{d.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {chip("Perfil", d.perfil_ok)}
                      {chip("Correo", d.correo_ok)}
                      {chip("Contactos", d.total > 0)}
                      {chip("Campaña", d.campana !== "sin")}
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                      <button className="btn sm" onClick={() => ir(`/ver/${d.id}/${d.campana === "sin" ? "alta" : "tablero"}`)}>
                        Ver como despacho
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!r.length && (
                <tr>
                  <td colSpan={3} className="muted">
                    Aún no hay despachos. Invita al primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="sec">
        <Hd n={3} titulo="Mide los resultados" lead="Correos enviados y respuestas de cada campaña." />
        <div className="tblw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Despacho</th>
                <th>Campaña</th>
                <th>Precio al cliente</th>
                <th>Contactos</th>
                <th>Enviados</th>
                <th>Abiertos</th>
                <th>Respondieron</th>
                <th>Confirmados</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {r.map((d) => (
                <tr key={d.id}>
                  <td>
                    <b>{d.nombre}</b>
                  </td>
                  <td>
                    {d.campana === "sin" ? (
                      <span className="chip">Sin programar</span>
                    ) : (
                      <span className={"st " + (d.campana === "activa" ? "fav" : d.campana === "pausada" ? "pau" : "az")}>
                        {{ activa: "Activa", pausada: "En pausa", terminada: "Terminada", sin: "" }[d.campana]}
                      </span>
                    )}
                  </td>
                  <td className="num">{pesos(precioDe(d, cfg))}</td>
                  <td className="num">{n0(d.total)}</td>
                  <td className="num">{n0(d.enviados)}</td>
                  <td className="num">{n0(d.abiertos)}</td>
                  <td className="num">{n0(d.respondieron)}</td>
                  <td className="num">{n0(d.confirmados)}</td>
                  <td>
                    {(d.campana === "activa" || d.campana === "pausada") && (
                      <div className="row" style={{ justifyContent: "flex-end" }}>
                        <button className="btn sm" onClick={() => pausar(d)}>
                          {d.campana === "activa" ? "Pausar" : "Reanudar"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="tot">
                <td>
                  <b>Total</b>
                </td>
                <td />
                <td />
                {tot.map((v, i) => (
                  <td key={i} className="num">
                    {n0(v)}
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Invitar() {
  const { cerrar, aviso } = useUi();
  const qc = useQueryClient();
  const [f, setF] = useState({ nombre: "", email: "" });
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await funcion("invitar", f);
      qc.invalidateQueries({ queryKey: ["resumen"] });
      cerrar();
      aviso(`Invitación enviada a ${f.email}.`);
    } catch (err) {
      aviso(mensaje(err));
    } finally {
      setEnviando(false);
    }
  };
  return (
    <>
      <h2>Invitar despacho</h2>
      <p className="lead">Le llega un enlace de acceso para completar su alta.</p>
      <form className="mt2" onSubmit={enviar}>
        <div className="grid">
          <div className="fld">
            <label htmlFor="i1">Nombre del despacho</label>
            <input className="inp" id="i1" required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          </div>
          <div className="fld">
            <label htmlFor="i2">Correo del contacto</label>
            <input className="inp" id="i2" type="email" required placeholder="socio@despacho.mx" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
        </div>
        <div className="ft">
          <button type="button" className="btn" onClick={cerrar}>
            Cancelar
          </button>
          <button className={"btn pri" + (enviando ? " dis" : "")}>{enviando ? "Enviando…" : "Enviar invitación"}</button>
        </div>
      </form>
    </>
  );
}
