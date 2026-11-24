// Página pública de baja (el enlace «Darme de baja» de cada correo).
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logoAzul from "@/assets/monthly-blue.png";

export default function Baja() {
  const [q] = useSearchParams();
  const e = q.get("e") || "";
  const [info, setInfo] = useState<{ correo: string; despacho: string; yaDeBaja: boolean } | null>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "hecho" | "invalido">("cargando");

  useEffect(() => {
    supabase.functions
      .invoke(`baja?e=${encodeURIComponent(e)}`, { method: "GET" })
      .then(({ data, error }) => {
        if (error || !data) return setEstado("invalido");
        setInfo(data);
        setEstado(data.yaDeBaja ? "hecho" : "listo");
      });
  }, [e]);

  const confirmar = async () => {
    const { error } = await supabase.functions.invoke(`baja?e=${encodeURIComponent(e)}`, { method: "POST", body: {} });
    setEstado(error ? "invalido" : "hecho");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="sec" style={{ maxWidth: 460, width: "100%" }}>
        <img alt="monthly" src={logoAzul} style={{ width: 110, marginBottom: 18 }} />
        {estado === "cargando" && <p className="muted">Cargando…</p>}
        {estado === "invalido" && (
          <>
            <h2>El enlace no es válido</h2>
            <p className="lead">Copia el enlace completo desde el correo o responde al correo pidiendo tu baja.</p>
          </>
        )}
        {estado === "listo" && info && (
          <>
            <h2>¿Dejar de recibir estos correos?</h2>
            <p className="lead">
              {info.correo} no volverá a recibir correos sobre Monthly de {info.despacho} ni de ningún otro despacho.
            </p>
            <div className="row mt2">
              <button className="btn pri" onClick={confirmar}>
                Darme de baja
              </button>
            </div>
          </>
        )}
        {estado === "hecho" && (
          <>
            <h2>Listo, te dimos de baja</h2>
            <p className="lead">{info?.correo ? info.correo + " ya no" : "Ya no"} recibirá estos correos.</p>
          </>
        )}
      </div>
    </div>
  );
}
