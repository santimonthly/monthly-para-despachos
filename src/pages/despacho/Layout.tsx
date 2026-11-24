// Marco de las pantallas del despacho. Sirve para el despacho y para Monthly en «Ver como despacho».
import { createContext, useContext, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Shell, type ItemNav } from "@/components/Shell";
import { Cargando } from "@/components/Basicos";
import { useSesion } from "@/lib/sesion";
import { useUi } from "@/lib/ui";
import {
  useCampana,
  useConfig,
  useContactos,
  useDespacho,
  useEstadoCorreo,
  useFestivos,
  useOverrides,
  useRefrescar,
} from "@/lib/consultas";
import { supabase, mensaje } from "@/integrations/supabase/client";
import type { Campana, Contacto, Despacho, EstadoCorreo } from "@/integrations/supabase/tipos";
import type { Config } from "@core/tipos.ts";
import type { Override } from "@core/render.ts";
import { fmtCorto, hoyMx } from "@core/fechas.ts";
import { proximoEnvio } from "@core/motor.ts";

export const perfilOk = (d: Despacho) => !!(d.nombre && d.sitio && d.firma);

interface Activo {
  id: string;
  base: string;
  soloLectura: boolean;
  despacho: Despacho;
  campana: Campana;
  contactos: Contacto[];
  correo: EstadoCorreo | null;
  config: Config;
  overrides: Override[];
  festivos: Set<string>;
  hoy: string;
  filtro: string | null;
  setFiltro: (f: string | null) => void;
  refrescar: () => void;
}

const Ctx = createContext<Activo>(null as unknown as Activo);
export const useActivo = () => useContext(Ctx);

export default function LayoutDespacho() {
  const { perfil } = useSesion();
  const params = useParams();
  const loc = useLocation();
  const ir = useNavigate();
  const comoAdmin = perfil?.rol === "admin";
  const id = comoAdmin ? params.id ?? null : perfil?.despacho_id ?? null;
  const base = comoAdmin ? `/ver/${id}` : "";
  const [filtro, setFiltro] = useState<string | null>(null);
  const refrescar = useRefrescar();

  const d = useDespacho(id);
  const c = useCampana(id);
  const cs = useContactos(id);
  const co = useEstadoCorreo(id);
  const cfg = useConfig();
  const ov = useOverrides();
  const fe = useFestivos();

  if (!perfil) return <Navigate to="/login" replace />;
  if (!id) return <Navigate to={comoAdmin ? "/panel/despachos" : "/login"} replace />;
  if (d.isError) return <p className="muted small" style={{ padding: 24 }}>No encontramos ese despacho.</p>;
  if (!d.data || !c.data || !cs.data || co.isLoading || !cfg.data || !ov.data || !fe.data) return <Cargando />;

  const valor: Activo = {
    id,
    base,
    soloLectura: comoAdmin,
    despacho: d.data,
    campana: c.data,
    contactos: cs.data,
    correo: co.data ?? null,
    config: cfg.data,
    overrides: ov.data,
    festivos: fe.data,
    hoy: hoyMx(),
    filtro,
    setFiltro,
    refrescar: () => refrescar(id),
  };

  const nav: ItemNav[] = [
    { ruta: base + "/alta", icono: "alta", texto: "Alta" },
    { ruta: base + "/tablero", icono: "chart", texto: "Tablero" },
    { ruta: base + "/correos", icono: "mail", texto: "Correos" },
  ];
  const activa = nav.find((n) => loc.pathname.startsWith(n.ruta))?.ruta ?? "";
  const enTablero = activa === base + "/tablero";
  const nr = cs.data.filter((x) => x.estatus === "Respondió").length;

  return (
    <Ctx.Provider value={valor}>
      <Shell
        nav={nav}
        activa={activa}
        despacho={d.data}
        volverAlPanel={comoAdmin}
        pildora={<Pildora a={valor} enAlta={activa === base + "/alta"} />}
        porContactar={{
          n: nr,
          on: enTablero && filtro === "Respondió",
          alClick: () => {
            const on = enTablero && filtro === "Respondió";
            setFiltro(on ? null : "Respondió");
            if (!enTablero) ir(base + "/tablero");
            setTimeout(() => {
              if (on) window.scrollTo({ top: 0, behavior: "smooth" });
              else document.getElementById("tabla")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50);
          },
        }}
      >
        <Outlet />
      </Shell>
    </Ctx.Provider>
  );
}

function Pildora({ a, enAlta }: { a: Activo; enAlta: boolean }) {
  const ir = useNavigate();
  const { aviso } = useUi();
  const dot = (c: string) => <i className="pd" style={{ background: c }} />;
  const e = a.campana.estado;

  const pausar = async () => {
    const { error } = await supabase.rpc("pausar_campana", { p_despacho: a.id });
    if (error) return aviso(mensaje(error));
    a.refrescar();
    aviso(e === "activa" ? "Campaña en pausa." : "Campaña reanudada.");
  };

  if (e === "sin") {
    const f = [!perfilOk(a.despacho), !a.correo, !a.contactos.length].filter(Boolean).length + 1;
    return (
      <span className="agp">
        {dot("#767c9c")}
        <b>Campaña sin programar</b>
        <i />
        <span>{f === 1 ? "Te falta 1 paso" : `Te faltan ${f} pasos`}</span>
        {!enAlta && (
          <button className="btn sm pri" onClick={() => ir(a.base + "/alta")}>
            Continuar alta
          </button>
        )}
      </span>
    );
  }
  let nx: string | null = null;
  let paso = 0;
  for (const c of a.contactos) {
    if (c.pausado) continue;
    const q = proximoEnvio(c, { estado: e === "pausada" ? "activa" : e, inicio: a.campana.inicio }, a.hoy, a.festivos);
    if (q && (!nx || q < nx)) {
      nx = q;
      paso = c.paso + 1;
    }
  }
  if (e === "pausada") {
    const pc = a.contactos.filter(
      (c) => !c.pausado && proximoEnvio(c, { estado: "activa", inicio: a.campana.inicio }, a.hoy, a.festivos),
    ).length;
    return (
      <span className="agp">
        {dot("#ffb81c")}
        <b>Campaña en pausa</b>
        <i />
        <span>{pc === 1 ? "1 correo pendiente" : `${pc} correos pendientes`}</span>
        <button className="btn sm" onClick={pausar}>
          Reanudar
        </button>
      </span>
    );
  }
  if (!nx || e === "terminada") {
    const r = a.contactos.filter((c) => ["Respondió", "Confirmado", "Perdido"].includes(c.estatus)).length;
    return (
      <span className="agp">
        {dot("#18ad86")}
        <b>Secuencia terminada</b>
        <i />
        <span>{r === 1 ? "1 cliente respondió" : `${r} clientes respondieron`}</span>
      </span>
    );
  }
  return (
    <span className="agp">
      {dot("#18ad86")}
      <b>Campaña activa</b>
      <i />
      <span>
        Siguiente envío <b className="nx">{fmtCorto(nx)}</b> · correo {paso}
      </span>
      <button className="btn sm" onClick={pausar}>
        Pausar
      </button>
    </span>
  );
}
