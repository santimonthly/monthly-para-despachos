// Acceso por magic link. Solo entran correos @monthly.la y despachos invitados.
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase, configurado } from "@/integrations/supabase/client";
import { useSesion } from "@/lib/sesion";
import logoAzul from "@/assets/monthly-blue.png";
import captura from "@/assets/login-tablero.jpg";

export default function Login() {
  const { sesion, perfil, cargando } = useSesion();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"form" | "enviado" | "sin-invitacion" | "error">("form");
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!cargando && sesion && perfil) return <Navigate to="/" replace />;

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const correo = email.trim().toLowerCase();
    setEnviando(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: correo,
      options: {
        // Solo el equipo de Monthly puede crear su usuario al entrar; los despachos ya existen por invitación.
        shouldCreateUser: correo.endsWith("@monthly.la"),
        emailRedirectTo: window.location.origin,
      },
    });
    setEnviando(false);
    if (!error) return setEstado("enviado");
    if (/signups not allowed|not found|otp_disabled/i.test(error.message)) return setEstado("sin-invitacion");
    setDetalle(error.message);
    setEstado("error");
  };

  return (
    <div className="lg3">
      <section className="l">
        <div className="tp">
          <img alt="monthly" src={logoAzul} />
          <i />
          <span>para despachos</span>
        </div>
        <div className="f">
          {!configurado ? (
            <>
              <h1>Falta conectar Supabase</h1>
              <p className="lead">Agrega VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en el archivo .env (ver README).</p>
            </>
          ) : sesion && !perfil && !cargando ? (
            <>
              <h1>Tu acceso no tiene despacho</h1>
              <p className="lead">Este correo no tiene una invitación activa. Pide al equipo de Monthly que te invite de nuevo.</p>
              <div className="row mt2">
                <button className="btn" onClick={() => supabase.auth.signOut()}>
                  Usar otro correo
                </button>
              </div>
            </>
          ) : estado === "enviado" ? (
            <>
              <h1>Revisa tu correo</h1>
              <p className="lead">Te enviamos un enlace de acceso a {email.trim()}. Ábrelo en este mismo navegador.</p>
              <div className="row mt2">
                <button className="btn" onClick={() => setEstado("form")}>
                  Usar otro correo
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Bienvenido de vuelta</h1>
              <p className="lead">Escribe el correo de tu despacho y te enviamos un enlace de acceso.</p>
              <form onSubmit={entrar}>
                <div className="fld">
                  <label htmlFor="lg">Correo</label>
                  <input
                    className={"inp" + (estado !== "form" ? " err" : "")}
                    id="lg"
                    type="email"
                    placeholder="tu@despacho.mx"
                    required
                    value={email}
                    onChange={(e) => (setEmail(e.target.value), setEstado("form"))}
                  />
                  {estado === "sin-invitacion" && (
                    <span className="hint err">Ese correo no tiene invitación. El acceso es solo por invitación de Monthly.</span>
                  )}
                  {estado === "error" && <span className="hint err">No pudimos enviar el enlace: {detalle}</span>}
                </div>
                <button className={"btn pri" + (enviando ? " dis" : "")}>{enviando ? "Enviando…" : "Enviarme el enlace"}</button>
              </form>
              <p className="hint">¿Aún no tienes cuenta? El acceso es por invitación de Monthly.</p>
            </>
          )}
        </div>
        <p className="ft">monthly.la · Aviso de privacidad</p>
      </section>
      <section className="r">
        <h2>
          Controla la <em>secuencia de correos</em>
          <br />a tus clientes.
        </h2>
        <p>Programa tres correos con tu marca, ve quién los abre y lleva el seguimiento de cada cliente.</p>
        <img className="sh" src={captura} alt="Tablero de la secuencia de correos de un despacho" />
        <div className="bub">
          <span className="d" />
          <div>
            <b>Aceros del Norte abrió tus 3 correos</b>Buen momento para llamarle.
          </div>
        </div>
      </section>
    </div>
  );
}
