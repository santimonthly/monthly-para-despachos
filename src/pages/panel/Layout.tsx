// Marco del panel de Monthly.
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Shell, type ItemNav } from "@/components/Shell";
import { useSesion } from "@/lib/sesion";
import { useResumenDespachos } from "@/lib/consultas";

export default function LayoutPanel() {
  const { perfil } = useSesion();
  const loc = useLocation();
  const ir = useNavigate();
  const { data: r = [] } = useResumenDespachos();
  if (perfil?.rol !== "admin") return <Navigate to="/" replace />;

  const pend = r.reduce((s, d) => s + d.sin_atender, 0);
  const act = r.filter((d) => d.campana === "activa").length;
  const nav: ItemNav[] = [
    { ruta: "/panel/despachos", icono: "desp", texto: "Despachos" },
    { ruta: "/panel/respuestas", icono: "reply", texto: "Respuestas", badge: pend },
    { ruta: "/panel/plantillas", icono: "mail", texto: "Plantillas" },
    { ruta: "/panel/ajustes", icono: "gear", texto: "Ajustes" },
  ];
  const activa = nav.find((n) => loc.pathname.startsWith(n.ruta))?.ruta ?? "";
  const pildora = (
    <span className="agp">
      <i className="pd" style={{ background: act ? "#18ad86" : "#767c9c" }} />
      <b>
        {act} de {r.length} despachos
      </b>
      <span>con campaña activa</span>
      <i />
      <span>{pend ? (pend === 1 ? "1 respuesta sin atender" : `${pend} respuestas sin atender`) : "Sin respuestas pendientes"}</span>
      {pend > 0 && activa !== "/panel/respuestas" && (
        <button className="btn sm pri" onClick={() => ir("/panel/respuestas")}>
          Ver respuestas
        </button>
      )}
    </span>
  );
  return (
    <Shell nav={nav} activa={activa} pildora={pildora}>
      <Outlet />
    </Shell>
  );
}
