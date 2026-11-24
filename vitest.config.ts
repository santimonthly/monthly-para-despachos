import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./supabase/functions/_shared/core"),
    },
  },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
