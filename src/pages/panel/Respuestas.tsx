// Panel · Respuestas: clientes que cada despacho marcó como respondió.
import { useQueryClient } from "@tanstack/react-query";
import { ChipEstatus, Cargando, Pasos, Vacio } from "@/components/Basicos";
import { useUi } from "@/lib/ui";
import { useConfig, useRespuestas } from "@/lib/consultas";
import { mensaje, supabase } from "@/integrations/supabase/client";
import { fmtCorto } from "@core/fechas.ts";

export default function Respuestas() {
  const { data: r, isLoading } = useRespuestas();
  const { data: cfg } = useConfig();
  const { aviso } = useUi();
  const qc = useQueryClient();
  if (isLoading || !r) return <Cargando />;

  // Primero los no atendidos; luego por fecha, más recientes arriba.
  const lista = [...r].sort(
    (a, b) => Number(a.atendido_monthly) - Number(b.atendido_monthly) || (b.respondio_en || b.ultimo || "").localeCompare(a.respondio_en || a.ultimo || ""),
  );
  const atender = async (id: string, empresa: string) => {
    const { data, error } = await supabase.rpc("marcar_atendido", { p_contacto: id });
    if (error) return aviso(mensaje(error));
    qc.invalidateQueries({ queryKey: ["respuestas"] });
    qc.invalidateQueries({ queryKey: ["resumen"] });
    aviso(data ? `${empresa} marcado como atendido.` : `${empresa} regresó a pendiente.`);
  };

  return (
    <>
      <Pasos items={["Revisa quién respondió", "Contacta al cliente junto con su despacho", "Márcalo como atendido"]} />
      <div className="sec">
        <p className="lead" style={{ margin: "0 0 14px" }}>
          Aquí aparecen los clientes que cada despacho marca como respondió. Le avisamos a {cfg?.notif} cada vez que pasa.
        </p>
        {lista.length ? (
          <div className="tblw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Despacho</th>
                  <th>Empresa y contacto</th>
                  <th>Estatus</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista.map((x) => (
                  <tr key={x.id}>
                    <td>{fmtCorto((x.respondio_en || x.ultimo || "").slice(0, 10))}</td>
                    <td>
                      <b>{x.despachos?.nombre}</b>
                    </td>
                    <td>
                      <b>{x.empresa}</b>
                      <div className="small muted">
                        {x.nombre} · {x.correo}
                        {x.tel ? " · " + x.tel : ""}
                      </div>
                    </td>
                    <td>
                      <ChipEstatus e={x.estatus} />
                    </td>
                    <td>
                      <div className="row" style={{ justifyContent: "flex-end" }}>
                        <button
                          className={"btn sm" + (x.atendido_monthly ? " at" : "")}
                          title={x.atendido_monthly ? "Click para regresarlo a pendiente" : ""}
                          onClick={() => atender(x.id, x.empresa)}
                        >
                          {x.atendido_monthly ? "✓ Atendido" : "Marcar atendido"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio titulo="Aún no hay respuestas" texto="Cuando un despacho marque a un cliente como respondió, aparece aquí." />
        )}
      </div>
    </>
  );
}
