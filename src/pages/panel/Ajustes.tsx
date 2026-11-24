// Panel · Ajustes: precios, textos del año, correo de avisos y lista de bajas.
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Cargando, Hd } from "@/components/Basicos";
import { logoDe } from "@/components/Shell";
import { useUi } from "@/lib/ui";
import { useConfig, useResumenDespachos, useSupresiones } from "@/lib/consultas";
import { mensaje, supabase } from "@/integrations/supabase/client";
import { anioEnFrase, descuentoDe, numero, pesos } from "@core/precios.ts";
import { cortoDe, marca } from "@core/marca.ts";
import { fmtCorto } from "@core/fechas.ts";

export default function Ajustes() {
  const { data: cfg } = useConfig();
  const { data: bajas = [] } = useSupresiones();
  const { data: desp = [] } = useResumenDespachos();
  const { aviso } = useUi();
  const qc = useQueryClient();
  const [f, setF] = useState({ minimo: "", precio: "", precio_original: "", anio: "", frase_temporada: "", notif: "" });

  useEffect(() => {
    if (cfg)
      setF({
        minimo: pesos(cfg.minimo),
        precio: pesos(cfg.precio_sugerido),
        precio_original: pesos(cfg.precio_original),
        anio: cfg.anio,
        frase_temporada: cfg.frase_temporada,
        notif: cfg.notif,
      });
  }, [cfg]);
  if (!cfg) return <Cargando />;

  const d = desp[0] ?? { nombre: "Garza y Asociados Contadores", logo_url: null, color: "#14342B" };
  const m = marca(d);
  const desc = descuentoDe(f.precio, f.precio_original);
  const yy = anioEnFrase(f.frase_temporada);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const mn = numero(f.minimo);
    const a = numero(f.precio);
    const b = numero(f.precio_original);
    if (!mn || !a || !b) return aviso("Escribe los precios con números.");
    if (a < mn) return aviso("El precio sugerido no puede ser menor a lo que Monthly cobra.");
    const { error } = await supabase
      .from("config")
      .update({ minimo: mn, precio_sugerido: a, precio_original: b, anio: f.anio.trim(), frase_temporada: f.frase_temporada.trim(), notif: f.notif.trim() })
      .eq("id", true);
    if (error) return aviso(mensaje(error));
    qc.invalidateQueries({ queryKey: ["config"] });
    aviso("Ajustes guardados.");
  };

  const campo = (id: keyof typeof f, label: string, hint: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input className="inp" id={id} required value={f[id]} onChange={set(id)} {...extra} />
      <span className="hint">{hint}</span>
    </div>
  );

  return (
    <>
      <form onSubmit={guardar}>
        <div className="sec">
          <Hd n={1} titulo="Define los precios" lead="Cada despacho elige lo que cobra a sus clientes, desde el mínimo." />
          <div className="cfg">
            <div className="grid">
              {campo("minimo", "Lo que Monthly cobra al despacho, al mes", "Es el precio mínimo que un despacho puede poner a sus clientes.", { inputMode: "numeric" })}
              {campo("precio", "Precio sugerido para los clientes, al mes", "Es el valor inicial que ve cada despacho; lo puede cambiar.", { inputMode: "numeric" })}
              {campo("precio_original", "Precio normal de Monthly, al mes", "Se muestra tachado para que se vea el ahorro. El descuento se calcula solo.", { inputMode: "numeric" })}
            </div>
            <div>
              <p className="small muted">Así se ve en el correo</p>
              <div style={{ marginTop: 8 }}>
                <div className="pv-of big">
                  <div style={{ background: m.color, color: m.tenue }}>
                    <span style={{ fontSize: 20 }}>🎁</span>
                    <img alt="" src={logoDe(d)} />
                    <span>Exclusivo clientes</span>
                  </div>
                  <div>
                    <b>1er mes gratis.</b>
                    <span>Después</span>
                    <span className="pr">
                      <strong>{pesos(f.precio) || "–"}</strong> + IVA/mes
                      {desc ? (
                        <>
                          {" "}
                          <s>{pesos(f.precio_original)}</s> <em>{desc} OFF</em>
                        </>
                      ) : null}
                    </span>
                  </div>
                </div>
                {!desc && <p className="hint">Sin descuento: el precio tachado no aparece en el correo.</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="sec">
          <Hd n={2} titulo="Actualiza los textos del año" lead="Dos textos mencionan el año. Cámbialos juntos cuando cambie la temporada." />
          <div className="cfg">
            <div className="grid">
              {campo("anio", "Año del beneficio", "Va en el asunto de los correos 1 y 3.", { inputMode: "numeric", maxLength: 4 })}
              {campo("frase_temporada", "Frase con la que abre el correo 1", "Es el inicio del primer párrafo, antes del nombre del despacho.")}
            </div>
            <div>
              <p className="small muted">Así queda el asunto</p>
              <div className="quote" style={{ margin: "8px 0 14px" }}>
                {cortoDe({ nombre: d.nombre })} - Activa tu nuevo beneficio para {f.anio || "–"}
              </div>
              <p className="small muted">Así abre el correo 1</p>
              <div className="quote" style={{ marginTop: 8 }}>
                {f.frase_temporada}, en {d.nombre} queremos que, además de tener tu contabilidad en orden…
              </div>
              {yy && f.anio && yy !== f.anio.trim() && (
                <p className="hint err">
                  La frase dice {yy} y el año del beneficio dice {f.anio}. Deja el mismo en los dos.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="sec">
          <Hd n={3} titulo="Elige quién recibe los avisos y guarda" lead="Cuando un despacho marca a un cliente como respondió, le avisamos a tu equipo." />
          <div className="cfg">
            <div className="grid">
              {campo("notif", "Correo de Monthly que recibe el aviso", "Llega un correo cada vez que un despacho marca a un cliente, con el despacho y la empresa.", { type: "email" })}
            </div>
            <div />
          </div>
          <div className="row mt2">
            <span className="sp" />
            <button className="btn pri">Guardar ajustes</button>
          </div>
        </div>
      </form>
      <div className="sec">
        <div className="hd">
          <div>
            <h2>Lista de bajas</h2>
            <p className="lead">Quien se da de baja no vuelve a recibir correos de ningún despacho.</p>
          </div>
        </div>
        {bajas.length ? (
          <div className="row">
            {bajas.map((x) => (
              <span key={x.correo} className="chip" title={"Desde el " + fmtCorto(x.fecha.slice(0, 10))}>
                {x.correo}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted small">Nadie se ha dado de baja.</p>
        )}
      </div>
    </>
  );
}
