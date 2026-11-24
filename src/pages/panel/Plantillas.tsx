// Panel · Plantillas: editar asunto, texto previo y HTML de los 3 correos (aplica a todos los despachos).
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Cargando, Hd } from "@/components/Basicos";
import { assetsUrl } from "@/components/VistaCorreo";
import { useUi } from "@/lib/ui";
import { useSesion } from "@/lib/sesion";
import { useConfig, useDespacho, useOverrides, useResumenDespachos } from "@/lib/consultas";
import { mensaje, supabase } from "@/integrations/supabase/client";
import { CADENCIA } from "@core/fechas.ts";
import { CONTACTO_EJEMPLO, MAPA_MARCA, plantilla, renderCorreo, TEXTO_FIJO } from "@core/render.ts";
import { PLANTILLAS_BASE } from "@core/plantillas-base.ts";
import type { DespachoMarca } from "@core/tipos.ts";

const DESPACHO_EJEMPLO: DespachoMarca = {
  nombre: "Garza y Asociados Contadores",
  corto: "Garza",
  sitio: "https://garzayasociados.mx",
  firma: "Laura Garza",
  color: "#14342B",
};

export default function Plantillas() {
  const { data: ov } = useOverrides();
  const { data: cfg } = useConfig();
  const { data: desp = [] } = useResumenDespachos();
  const { perfil } = useSesion();
  const { aviso, confirmar } = useUi();
  const qc = useQueryClient();
  const [i, setI] = useState(0);
  const [f, setF] = useState({ asunto: "", pre: "", html: "" });
  const [vista, setVista] = useState({ asunto: "", pre: "", html: "" });

  // Datos del primer despacho con perfil, como en el prototipo; si no hay, uno de ejemplo.
  const d0 = desp.find((d) => d.perfil_ok);
  const { data: completo } = useDespacho(d0?.id);
  const despacho: DespachoMarca = completo ?? DESPACHO_EJEMPLO;

  useEffect(() => {
    if (!ov) return;
    const t = plantilla(i, ov[i]);
    setF({ asunto: t.asunto, pre: t.pre, html: t.html });
    setVista({ asunto: t.asunto, pre: t.pre, html: t.html });
  }, [i, ov]);

  const m = useMemo(
    () => (cfg ? renderCorreo({ n: i, override: vista, despacho, contacto: CONTACTO_EJEMPLO, config: cfg, assetsUrl: assetsUrl() }) : null),
    [i, vista, cfg, despacho],
  );
  if (!ov || !cfg || !m) return <Cargando />;
  const t = plantilla(i, ov[i]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const b = PLANTILLAS_BASE[i];
    const igual = f.asunto === b.asunto && f.pre === b.pre && f.html === b.html;
    const { error } = igual
      ? await supabase.from("plantillas").delete().eq("n", i + 1)
      : await supabase.from("plantillas").upsert({ n: i + 1, ...f, editado_por: perfil?.user_id, editado_en: new Date().toISOString() });
    if (error) return aviso(mensaje(error));
    setVista(f);
    qc.invalidateQueries({ queryKey: ["plantillas"] });
    aviso("Plantilla guardada. Aplica a los correos que aún no salen.");
  };
  const restaurar = async () => {
    if (!(await confirmar(`Restaurar el correo ${i + 1}`, "Se pierden tus cambios y vuelve la versión original.", "Restaurar"))) return;
    const { error } = await supabase.from("plantillas").delete().eq("n", i + 1);
    if (error) return aviso(mensaje(error));
    qc.invalidateQueries({ queryKey: ["plantillas"] });
    aviso("Plantilla restaurada.");
  };
  const actualizar = () => {
    setVista(f);
    const r = renderCorreo({ n: i, override: f, despacho, contacto: CONTACTO_EJEMPLO, config: cfg, assetsUrl: assetsUrl() });
    aviso(r.faltantes.length ? "Variables sin valor: " + r.faltantes.join(", ") : "Vista previa actualizada.");
  };

  return (
    <>
      <div className="sec">
        <Hd n={1} titulo="Elige el correo" lead={`Correo ${i + 1} · día ${CADENCIA[i]} · ${t.angulo}.`}>
          <div className="seg">
            {[0, 1, 2].map((k) => (
              <button key={k} className={i === k ? "on" : ""} onClick={() => setI(k)}>
                Correo {k + 1}
                {plantilla(k, ov[k]).editada ? <span className="num">editado</span> : null}
              </button>
            ))}
          </div>
        </Hd>
      </div>
      <form onSubmit={guardar}>
        <div className="sec">
          <Hd n={2} titulo="Edita el asunto y el contenido" lead="Lo que cambies aquí cambia para todos los despachos.">
            <button type="button" className={"btn" + (t.editada ? "" : " dis")} onClick={restaurar}>
              Restaurar original
            </button>
          </Hd>
          <div className="grid g2">
            <div className="fld">
              <label htmlFor="t1">Asunto</label>
              <input className="inp" id="t1" value={f.asunto} onChange={(e) => setF({ ...f, asunto: e.target.value })} />
            </div>
            <div className="fld">
              <label htmlFor="t2">Texto de vista previa</label>
              <input className="inp" id="t2" value={f.pre} onChange={(e) => setF({ ...f, pre: e.target.value })} />
            </div>
          </div>
          <div className="fld mt">
            <label htmlFor="t3">HTML del correo</label>
            <textarea className="inp code" id="t3" spellCheck={false} value={f.html} onChange={(e) => setF({ ...f, html: e.target.value })} />
          </div>
          {m.faltantes.length > 0 && <p className="hint err mt">Variables sin valor: {m.faltantes.join(", ")}</p>}
        </div>
        <div className="sec">
          <Hd n={3} titulo="Revisa y guarda" lead={`Vista previa con los datos de ${despacho.nombre}.`}>
            <div className="row">
              <button type="button" className="btn" onClick={actualizar}>
                Actualizar vista previa
              </button>
              <button className="btn pri">Guardar plantilla</button>
            </div>
          </Hd>
          <div className="mailmeta">
            <div>
              <span>Asunto</span>
              <span style={{ width: "auto", color: "#2d3590" }}>{m.asunto}</span>
            </div>
          </div>
          <div className="frame">
            <iframe title="Vista previa de la plantilla" srcDoc={m.html} />
          </div>
        </div>
      </form>
      <div className="sec">
        <div className="hd">
          <div>
            <h2>Qué cambia con cada despacho</h2>
            <p className="lead">{TEXTO_FIJO}</p>
          </div>
        </div>
        <div className="tblw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Dónde aparece</th>
                <th>De dónde sale</th>
                <th>Variable</th>
              </tr>
            </thead>
            <tbody>
              {MAPA_MARCA.map((r) => (
                <tr key={r[0]}>
                  <td>
                    <b>{r[0]}</b>
                  </td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td className="small muted">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
