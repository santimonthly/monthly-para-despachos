// Los tres correos con la marca del despacho, solo lectura.
import { useActivo } from "./Layout";
import { Pasos } from "@/components/Basicos";
import { VistaCorreo } from "@/components/VistaCorreo";
import { CONTACTO_EJEMPLO } from "@core/render.ts";

export default function Correos() {
  const a = useActivo();
  const c0 = a.contactos[0];
  const d = a.despacho;
  return (
    <>
      <Pasos items={["Elige el correo", "Revisa el asunto y el texto previo", "Míralo en escritorio y en móvil"]} />
      <div className="sec">
        <p className="lead" style={{ margin: "0 0 14px" }}>
          Así los recibe {c0 ? c0.nombre || c0.empresa : CONTACTO_EJEMPLO.nombre + " (contacto de ejemplo)"}. El contenido lo define Monthly.
        </p>
        <VistaCorreo despacho={d} contacto={c0} config={a.config} overrides={a.overrides} remitente={`${d.firma || d.nombre} <${a.correo?.email || "tu correo"}>`} />
      </div>
    </>
  );
}
