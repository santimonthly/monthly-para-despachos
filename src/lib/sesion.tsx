import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Perfil } from "@/integrations/supabase/tipos";

interface Ctx {
  cargando: boolean;
  sesion: Session | null;
  perfil: Perfil | null;
  salir: () => Promise<void>;
}

const SesionCtx = createContext<Ctx>({ cargando: true, sesion: null, perfil: null, salir: async () => {} });

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async (s: Session | null) => {
      setSesion(s);
      if (!s) {
        setPerfil(null);
        setCargando(false);
        return;
      }
      const { data } = await supabase.from("perfiles").select("*").eq("user_id", s.user.id).maybeSingle();
      setPerfil((data as Perfil) ?? null);
      setCargando(false);
    };
    supabase.auth.getSession().then(({ data }) => cargarPerfil(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      // Diferido para no llamar a Supabase dentro del callback (recomendación de supabase-js).
      setTimeout(() => cargarPerfil(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const salir = async () => {
    await supabase.auth.signOut();
    setPerfil(null);
    setSesion(null);
  };

  return <SesionCtx.Provider value={{ cargando, sesion, perfil, salir }}>{children}</SesionCtx.Provider>;
}

export const useSesion = () => useContext(SesionCtx);
