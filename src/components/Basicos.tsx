import type { ReactNode } from "react";
import { COLOR_ESTATUS, type Estatus } from "@core/tipos.ts";

/** Encabezado de sección: número de paso, título, texto y acciones a la derecha. */
export function Hd({ n, titulo, lead, children }: { n?: number; titulo: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="hd">
      <div className="ph">
        {n ? <span className="pn num">{n}</span> : null}
        <div>
          <h2>{titulo}</h2>
          {lead ? <p className="lead">{lead}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Pasos({ items }: { items: string[] }) {
  return (
    <div className="pasos">
      {items.map((t, i) => (
        <span key={t}>
          <i className="pn sm num">{i + 1}</i>
          {t}
        </span>
      ))}
    </div>
  );
}

const EMOJI: Partial<Record<Estatus, string>> = { Confirmado: "✅", Perdido: "❌" };

export function ChipEstatus({ e }: { e: Estatus }) {
  return (
    <span className="stb" style={{ ["--c" as string]: COLOR_ESTATUS[e] || "#767c9c" }}>
      {EMOJI[e] ? <span className="se">{EMOJI[e]}</span> : <i />}
      {e}
    </span>
  );
}

export const emojiEstatus = (e: Estatus) => EMOJI[e];

export function Vacio({ titulo, texto, children }: { titulo: string; texto: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="t">{titulo}</div>
      <p>{texto}</p>
      {children}
    </div>
  );
}

export function Cargando() {
  return <p className="muted small" style={{ padding: 24 }}>Cargando…</p>;
}
