import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SesionProvider, useSesion } from "@/lib/sesion";
import { UiProvider } from "@/lib/ui";
import { Cargando } from "@/components/Basicos";
import Login from "@/pages/Login";
import Baja from "@/pages/Baja";
import Inicio from "@/pages/Inicio";
import LayoutDespacho from "@/pages/despacho/Layout";
import Alta from "@/pages/despacho/Alta";
import Tablero from "@/pages/despacho/Tablero";
import Correos from "@/pages/despacho/Correos";
import LayoutPanel from "@/pages/panel/Layout";
import Despachos from "@/pages/panel/Despachos";
import Respuestas from "@/pages/panel/Respuestas";
import Plantillas from "@/pages/panel/Plantillas";
import Ajustes from "@/pages/panel/Ajustes";

const qc = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: true, staleTime: 15_000, retry: 1 } } });

function ConSesion({ children }: { children: JSX.Element }) {
  const { cargando, sesion, perfil } = useSesion();
  if (cargando) return <Cargando />;
  if (!sesion || !perfil) return <Navigate to="/login" replace />;
  return children;
}

const rutasDespacho = (
  <>
    <Route path="alta" element={<Alta />} />
    <Route path="tablero" element={<Tablero />} />
    <Route path="correos" element={<Correos />} />
  </>
);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <SesionProvider>
        <UiProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/baja" element={<Baja />} />
              {/* Despacho */}
              <Route element={<ConSesion><LayoutDespacho /></ConSesion>}>{rutasDespacho}</Route>
              {/* Monthly viendo como un despacho (solo lectura) */}
              <Route path="/ver/:id" element={<ConSesion><LayoutDespacho /></ConSesion>}>{rutasDespacho}</Route>
              {/* Panel Monthly */}
              <Route path="/panel" element={<ConSesion><LayoutPanel /></ConSesion>}>
                <Route index element={<Navigate to="despachos" replace />} />
                <Route path="despachos" element={<Despachos />} />
                <Route path="respuestas" element={<Respuestas />} />
                <Route path="plantillas" element={<Plantillas />} />
                <Route path="ajustes" element={<Ajustes />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UiProvider>
      </SesionProvider>
    </QueryClientProvider>
  );
}
