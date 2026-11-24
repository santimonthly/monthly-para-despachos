// Lecturas y escrituras con React Query. RLS decide qué ve cada quien.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Campana, Contacto, Despacho, EstadoCorreo, Evento, ResumenDespacho } from "@/integrations/supabase/tipos";
import { CONFIG_INICIAL, type Config } from "@core/tipos.ts";
import type { Override } from "@core/render.ts";

const lanzar = <T,>(r: { data: T; error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message);
  return r.data;
};

export const useConfig = () =>
  useQuery({
    queryKey: ["config"],
    queryFn: async () => ({ ...CONFIG_INICIAL, ...(lanzar(await supabase.from("config").select("*").maybeSingle()) || {}) }) as Config,
  });

export const useOverrides = () =>
  useQuery({
    queryKey: ["plantillas"],
    queryFn: async () => {
      const rows = lanzar(await supabase.from("plantillas").select("n, asunto, pre, html")) || [];
      const o: Override[] = [null, null, null];
      for (const r of rows as { n: number; asunto: string; pre: string; html: string }[]) o[r.n - 1] = r;
      return o;
    },
  });

export const useFestivos = () =>
  useQuery({
    queryKey: ["festivos"],
    queryFn: async () => new Set(((lanzar(await supabase.from("festivos").select("fecha")) || []) as { fecha: string }[]).map((r) => r.fecha)),
    staleTime: 3600_000,
  });

export const useDespacho = (id?: string | null) =>
  useQuery({
    queryKey: ["despacho", id],
    enabled: !!id,
    queryFn: async () => lanzar(await supabase.from("despachos").select("*").eq("id", id!).single()) as Despacho,
  });

export const useCampana = (id?: string | null) =>
  useQuery({
    queryKey: ["campana", id],
    enabled: !!id,
    queryFn: async () =>
      (lanzar(await supabase.from("campanas").select("*").eq("despacho_id", id!).maybeSingle()) as Campana) ?? {
        despacho_id: id!,
        estado: "sin",
        inicio: null,
      },
  });

export const useContactos = (id?: string | null) =>
  useQuery({
    queryKey: ["contactos", id],
    enabled: !!id,
    queryFn: async () => {
      // PostgREST pagina de 1,000 en 1,000.
      const todos: Contacto[] = [];
      for (let desde = 0; ; desde += 1000) {
        const r = lanzar(
          await supabase.from("contactos").select("*").eq("despacho_id", id!).order("creado").order("id").range(desde, desde + 999),
        ) as Contacto[];
        todos.push(...r);
        if (r.length < 1000) break;
      }
      return todos;
    },
  });

export const useEstadoCorreo = (id?: string | null) =>
  useQuery({
    queryKey: ["correo", id],
    enabled: !!id,
    queryFn: async () => ((lanzar(await supabase.rpc("estado_correo", { p_despacho: id })) as EstadoCorreo[]) || [])[0] ?? null,
  });

export const useEventos = (contactoId?: string | null) =>
  useQuery({
    queryKey: ["eventos", contactoId],
    enabled: !!contactoId,
    queryFn: async () =>
      lanzar(await supabase.from("eventos").select("*").eq("contacto_id", contactoId!).order("fecha", { ascending: false })) as Evento[],
  });

/** Envíos de los últimos días, para la gráfica del tablero. */
export const useEnviosDesde = (id: string | null | undefined, desde: string) =>
  useQuery({
    queryKey: ["envios", id, desde],
    enabled: !!id,
    queryFn: async () =>
      lanzar(await supabase.from("envios").select("fecha, paso, error").eq("despacho_id", id!).gte("fecha", desde)) as {
        fecha: string;
        paso: number;
        error: string | null;
      }[],
  });

export const useResumenDespachos = () =>
  useQuery({
    queryKey: ["resumen"],
    queryFn: async () => (lanzar(await supabase.rpc("resumen_despachos")) as ResumenDespacho[]) || [],
  });

export interface Respuesta extends Contacto {
  despachos: { nombre: string } | null;
}
export const useRespuestas = () =>
  useQuery({
    queryKey: ["respuestas"],
    queryFn: async () =>
      (lanzar(
        await supabase
          .from("contactos")
          .select("*, despachos(nombre)")
          .in("estatus", ["Respondió", "Confirmado", "Perdido"])
          .order("respondio_en", { ascending: false, nullsFirst: false }),
      ) as Respuesta[]) || [],
  });

export const useSupresiones = () =>
  useQuery({
    queryKey: ["supresiones"],
    queryFn: async () =>
      (lanzar(await supabase.from("supresiones").select("*").order("fecha", { ascending: false })) as { correo: string; fecha: string }[]) || [],
  });

/** Invalida todo lo que depende de un despacho después de una acción. */
export function useRefrescar() {
  const qc = useQueryClient();
  return (id?: string | null) => {
    qc.invalidateQueries({ queryKey: ["despacho", id] });
    qc.invalidateQueries({ queryKey: ["campana", id] });
    qc.invalidateQueries({ queryKey: ["contactos", id] });
    qc.invalidateQueries({ queryKey: ["correo", id] });
    qc.invalidateQueries({ queryKey: ["eventos"] });
    qc.invalidateQueries({ queryKey: ["resumen"] });
    qc.invalidateQueries({ queryKey: ["respuestas"] });
  };
}

export const useAccionContacto = (despachoId?: string | null) => {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: async ({ id, accion }: { id: string; accion: string }) =>
      lanzar(await supabase.rpc("accion_contacto", { p_contacto: id, p_accion: accion })) as Contacto,
    onSuccess: () => refrescar(despachoId),
  });
};
