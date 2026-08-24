import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Build du Web Component `<kre-configurateur>`.
 *
 * Second point d'entrée du même code source que le build Next : `components/` et
 * `lib/` ne dépendent d'aucune API Next (ni `next/font`, ni `next/image`, ni
 * `next/dynamic`, ni `process.env`), ils compilent donc à l'identique ici.
 *
 * `KRE_PUBLIC_BASE` : URL publique du dossier qui hébergera le bundle. Elle sert
 * de base aux chunks chargés dynamiquement — sans elle, ils seraient résolus
 * contre le domaine WordPress. En dev (`vite dev`) on reste en base relative.
 */
const publicBase = process.env.KRE_PUBLIC_BASE ?? "./";

export default defineConfig(({ command }) => ({
  base: command === "build" ? publicBase : "/",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },

  build: {
    outDir: "dist/wc",
    emptyOutDir: true,
    // N-2 sur Chrome/Firefox/Safari/Edge + iOS Safari 15 → ES2020 est le
    // dénominateur commun sûr (pas de `??=` non transpilé, pas de top-level await).
    target: "es2020",
    cssCodeSplit: false,
    // Un seul fichier livré : pas de chunk séparé à charger depuis WordPress.
    codeSplitting: false,
    sourcemap: true,
    rollupOptions: {
      input: fileURLToPath(new URL("./wc/element.ts", import.meta.url)),
      output: {
        format: "es",
        entryFileNames: "kre-configurateur.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },

  define: {
    // Élimine les branches de développement de React.
    "process.env.NODE_ENV": JSON.stringify(
      command === "build" ? "production" : "development",
    ),
  },
}));
