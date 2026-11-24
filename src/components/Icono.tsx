const ICO = {
  desp: "M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3",
  reply: "M9 7 4 12l5 5M4 12h9a7 7 0 0 1 7 7",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  chart: "M5 20V11M12 20V4M19 20v-6",
  gear: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
  alta: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  out: "M10 5H5v14h5M14 8l4 4-4 4M18 12H9",
  down: "M12 4v11M7 11l5 5 5-5M5 20h14",
  up: "M12 16V5M7 9l5-5 5 5M5 20h14",
} as const;

export type NombreIcono = keyof typeof ICO;

export function Icono({ n }: { n: NombreIcono }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICO[n]} />
    </svg>
  );
}

export function Chispa() {
  return (
    <svg viewBox="-4 -4 108 108" width="16" height="16" aria-hidden="true">
      <defs>
        <linearGradient id="amg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5366FF" />
          <stop offset="1" stopColor="#10E8A0" />
        </linearGradient>
      </defs>
      <path d="M50 0C52.4 34 66 47.6 100 50C66 52.4 52.4 66 50 100C47.6 66 34 52.4 0 50C34 47.6 47.6 34 50 0Z" fill="url(#amg)" />
    </svg>
  );
}
