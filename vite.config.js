import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./assets/js/routes",
      generatedRouteTree: "./assets/js/routeTree.gen.js",
      disableTypes: true,
    }),
    react(),
  ],
  base: "/static/",
  build: {
    outDir: path.resolve(__dirname, "./static"),
    emptyOutDir: false,
    manifest: "manifest.json",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "./assets/js/main.jsx"),
      },
      output: {
        entryFileNames: `js/[name]-bundle.js`,
      },
    },
  },
});
