// Avisos (toasts) y ventanas modales con el estilo del prototipo.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface UiCtx {
  aviso: (texto: string) => void;
  abrir: (contenido: ReactNode, ancho?: boolean) => void;
  cerrar: () => void;
  confirmar: (titulo: string, texto: string, ok: string) => Promise<boolean>;
}

const Ui = createContext<UiCtx>(null as unknown as UiCtx);

export function UiProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; t: string } | null>(null);
  const [modal, setModal] = useState<{ c: ReactNode; ancho: boolean } | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const aviso = useCallback((t: string) => {
    const id = Date.now();
    setToast({ id, t });
    setTimeout(() => setToast((x) => (x?.id === id ? null : x)), 3600);
  }, []);
  const cerrar = useCallback(() => {
    setModal(null);
    if (resolver.current) {
      resolver.current(false);
      resolver.current = null;
    }
  }, []);
  const abrir = useCallback((c: ReactNode, ancho = false) => setModal({ c, ancho }), []);
  const confirmar = useCallback(
    (titulo: string, texto: string, ok: string) =>
      new Promise<boolean>((res) => {
        resolver.current = res;
        setModal({
          ancho: false,
          c: (
            <>
              <h2>{titulo}</h2>
              <p className="lead">{texto}</p>
              <div className="ft">
                <button className="btn" onClick={() => cerrarCon(false)}>
                  Cancelar
                </button>
                <button className="btn pri" onClick={() => cerrarCon(true)} autoFocus>
                  {ok}
                </button>
              </div>
            </>
          ),
        });
      }),
    [],
  );
  const cerrarCon = (v: boolean) => {
    setModal(null);
    resolver.current?.(v);
    resolver.current = null;
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [cerrar]);

  return (
    <Ui.Provider value={{ aviso, abrir, cerrar, confirmar }}>
      {children}
      {modal && (
        <div className="ov" onClick={(e) => e.target === e.currentTarget && cerrar()}>
          <div className={"md" + (modal.ancho ? " wide" : "")} role="dialog" aria-modal="true">
            {modal.c}
          </div>
        </div>
      )}
      <div className="toasts" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            {toast.t}
          </div>
        )}
      </div>
    </Ui.Provider>
  );
}

export const useUi = () => useContext(Ui);
