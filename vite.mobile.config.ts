import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";

/** Renames index-mobile.html → index.html in the output so Capacitor can find it */
function renameMobileHtml() {
  return {
    name: "rename-mobile-html",
    closeBundle() {
      const outDir = path.resolve(__dirname, "capacitor-app");
      const src = path.join(outDir, "index-mobile.html");
      const dest = path.join(outDir, "index.html");
      if (fs.existsSync(src)) {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        fs.renameSync(src, dest);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    react(),
    renameMobileHtml(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: false,
  build: {
    outDir: "capacitor-app",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index-mobile.html"),
      },
    },
  },
});
