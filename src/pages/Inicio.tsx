import { Navigate } from "react-router-dom";
import { useSesion } from "@/lib/sesion";
import { useCampana } from "@/lib/consultas";
import { Cargando } from "@/components/Basicos";

/** Lleva a cada quien a su pantalla: Monthly al panel; el despacho al alta o a su tablero. */
export default function Inicio() {
  const { cargando, sesion, perfil } = useSesion();
  const c = useCampana(perfil?.rol === "despacho" ? perfil.despacho_id : null);
  if (cargando) return <Cargando />;
  if (!sesion || !perfil) return <Navigate to="/login" replace />;
  if (perfil.rol === "admin") return <Navigate to="/panel/despachos" replace />;
  if (!c.data) return <Cargando />;
  return <Navigate to={c.data.estado === "sin" ? "/alta" : "/tablero"} replace />;
}
