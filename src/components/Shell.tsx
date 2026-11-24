import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icono, type NombreIcono } from "./Icono";
import { useSesion } from "@/lib/sesion";
import { fmtCorto, hoyMx } from "@core/fechas.ts";
import { logoProvisionalDataUri, marca } from "@core/marca.ts";
import type { Despacho } from "@/integrations/supabase/tipos";
import logoIso from "@/assets/monthly-iso.png";
import logoBlanco from "@/assets/monthly-white.png";
import logoAzul from "@/assets/monthly-blue.png";

export interface ItemNav {
  ruta: string;
  icono: NombreIcono;
  texto: string;
  badge?: number;
}

export const logoDe = (d: Pick<Despacho, "logo_url" | "nombre" | "color">) => d.logo_url || logoProvisionalDataUri(d.nombre, marca(d).color);

interface Props {
  nav: ItemNav[];
  activa: string;
  despacho?: Despacho | null;
  pildora?: ReactNode;
  /** «⚡ Por contactar»: número y acción (solo vista de despacho). */
  porContactar?: { n: number; on: boolean; alClick: () => void };
  volverAlPanel?: boolean;
  children: ReactNode;
}

export function Shell({ nav, activa, despacho, pildora, porContactar, volverAlPanel, children }: Props) {
  const ir = useNavigate();
  const { salir } = useSesion();

  useEffect(() => {
    document.body.classList.add("inapp");
    return () => document.body.classList.remove("inapp");
  }, []);

  return (
    <div className="app">
      <nav className="rail" aria-label="Principal">
        <img className="wm" alt="monthly" src={logoIso} />
        {nav.map((n) => (
          <button key={n.ruta} className={"nv" + (activa === n.ruta ? " on" : "")} onClick={() => ir(n.ruta)} aria-current={activa === n.ruta ? "page" : undefined}>
            <span className="g">
              <Icono n={n.icono} />
            </span>
            {n.texto}
            {n.badge ? <span className="badge num">{n.badge}</span> : null}
          </button>
        ))}
        <button
          className="nv"
          onClick={async () => {
            await salir();
            ir("/login");
          }}
        >
          <span className="g">
            <Icono n="out" />
          </span>
          Salir
        </button>
      </nav>
      <main className="main">
        <header className="stage">
          <div className="r1">
            {despacho ? (
              <>
                <span className="co">
                  <img alt="" src={logoDe(despacho)} />
                </span>
                <span className="cn">{despacho.nombre}</span>
              </>
            ) : (
              <span className="cn ttl">
                <img alt="Monthly" src={logoBlanco} />
                <i />
                <span>para despachos</span>
              </span>
            )}
            <span className="sp" />
            {despacho ? (
              <span className="lockup">
                <img alt="monthly" src={logoBlanco} />
                <i />
                para despachos
              </span>
            ) : null}
            {volverAlPanel ? (
              <button className="cb" onClick={() => ir("/panel/despachos")}>
                Volver al panel
              </button>
            ) : null}
            {porContactar ? (
              <button
                className={"mv" + (porContactar.on ? " on" : "")}
                onClick={porContactar.alClick}
                title={porContactar.on ? "Ver todos los contactos" : "Ver quién respondió"}
              >
                ⚡ Por contactar <b className="num">{porContactar.n}</b>
              </button>
            ) : null}
          </div>
          <div className="r2">
            {pildora}
            <span className="sp" />
            <span className="per">
              <b>{fmtCorto(hoyMx())}</b>
              {volverAlPanel ? " · vista de solo lectura" : ""}
            </span>
          </div>
        </header>
        <div className="body">
          {children}
          <div className="foot2">
            <span>
              from <img alt="monthly" src={logoAzul} />
              <i />
              <b>para despachos</b>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
