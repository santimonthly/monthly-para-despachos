import { useMemo, useState } from "react";
import { CADENCIA } from "@core/fechas.ts";
import { CONTACTO_EJEMPLO, renderCorreo, type Override } from "@core/render.ts";
import type { Config, ContactoBase, DespachoMarca } from "@core/tipos.ts";

export const assetsUrl = () => window.location.origin + "/email-assets";

interface Props {
  despacho: DespachoMarca;
  contacto?: ContactoBase | null;
  config: Config;
  overrides: Override[];
  remitente: string;
}

/** Pestañas Correo 1/2/3, escritorio/móvil, resaltado y la vista previa en un iframe. */
export function VistaCorreo({ despacho, contacto, config, overrides, remitente }: Props) {
  const [tab, setTab] = useState(0);
  const [ancho, setAncho] = useState<"d" | "m">("d");
  const [hl, setHl] = useState(false);
  const c = contacto || CONTACTO_EJEMPLO;
  const m = useMemo(
    () => renderCorreo({ n: tab, override: overrides[tab], despacho, contacto: c, config, assetsUrl: assetsUrl(), resaltar: hl }),
    [tab, overrides, despacho, c, config, hl],
  );
  return (
    <>
      <div className="mailbar">
        <div className="seg">
          {[0, 1, 2].map((i) => (
            <button key={i} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>
              Correo {i + 1}
              <span className="num">día {CADENCIA[i]}</span>
            </button>
          ))}
        </div>
        <span className="sp" />
        <label className="chk" style={{ alignItems: "center" }}>
          <input type="checkbox" checked={hl} onChange={(e) => setHl(e.target.checked)} />
          <span className="bx" />
          <span>Resaltar lo que cambia con tu marca</span>
        </label>
        <div className="seg">
          <button className={ancho === "d" ? "on" : ""} onClick={() => setAncho("d")}>
            Escritorio
          </button>
          <button className={ancho === "m" ? "on" : ""} onClick={() => setAncho("m")}>
            Móvil
          </button>
        </div>
      </div>
      <div className="mailmeta">
        <div>
          <span>De</span>
          {remitente}
        </div>
        <div>
          <span>Asunto</span>
          {m.asunto}
        </div>
        <div>
          <span>Vista previa</span>
          {m.pre}
        </div>
        <div>
          <span>Enfoque</span>
          {m.angulo}
        </div>
      </div>
      <div className="frame">
        <iframe title={`Vista previa del correo ${tab + 1}`} srcDoc={m.html} style={{ width: ancho === "m" ? "375px" : "100%" }} />
      </div>
    </>
  );
}
