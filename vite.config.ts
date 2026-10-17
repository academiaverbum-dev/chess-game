import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  // Caminhos relativos permitem servir o jogo em /chess-game/ no GitHub Pages.
  base: "./",
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: "./src/test-setup.ts" },
});
