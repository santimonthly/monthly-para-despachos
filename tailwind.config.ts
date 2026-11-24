import type { Config } from "tailwindcss";

// La mayor parte del estilo viene de src/styles/monthly.css (portado del prototipo).
// Tailwind queda disponible para que Lovable pueda seguir editando con utilidades.
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        azul: "#5366ff",
        verde: "#10e8a0",
        teal: "#18ad86",
        coral: "#ff585d",
        ambar: "#ffb81c",
        navy: "#2d3590",
        gris: "#767c9c",
      },
      fontFamily: {
        display: ["Titillium Web", "system-ui", "sans-serif"],
        body: ["PT Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
