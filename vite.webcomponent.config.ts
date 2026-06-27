import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

/**
 * Web-component build — a single self-contained IIFE script (React bundled in)
 * that registers <planet-editor>. Emits planet-editor.js + style.css.
 *
 *   npm run build:wc
 *   <link rel="stylesheet" href="dist/web-component/style.css" />
 *   <script src="dist/web-component/planet-editor.js"></script>
 *   <planet-editor></planet-editor>
 */
export default defineConfig({
  plugins: [react()],
  // This IIFE runs directly in the browser (no bundler), so inline the env
  // React checks for at runtime.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist/web-component",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/embed/web-component.tsx"),
      name: "PlanetEditorWC",
      formats: ["iife"],
      fileName: () => "planet-editor.js",
    },
  },
})
