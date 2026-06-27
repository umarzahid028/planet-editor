import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"

/**
 * Library build — produces an importable React component package in dist/lib.
 * react / react-dom are externalized so the host app provides them.
 *
 *   npm run build:lib
 *   import { Editor } from "@you/editor"
 *   import "@you/editor/styles.css"
 */
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/lib", "src/components", "src/hooks"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.app.json",
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist/lib",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "PlanetEditor",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      // Externalize every bare npm dependency (react, react-dom, the editor
      // engine, radix, etc.) so the host app resolves a single React instance.
      // Bundling them breaks Next.js SSR (useSyncExternalStore reads from null
      // during prerender). Our own source (relative / "@/" alias) stays bundled.
      external: (id) =>
        !id.startsWith("@/") && !id.startsWith(".") && !path.isAbsolute(id),
      output: {
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "styles.css" : (info.name ?? "asset"),
      },
    },
  },
})
