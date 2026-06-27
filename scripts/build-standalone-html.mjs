// Generates a single, fully self-contained HTML file with the editor inlined
// (JS + CSS embedded). The output works anywhere — open it directly, host it,
// or paste its markup into another page — with no iframe and no external files.
//
//   npm run build:standalone   (builds the web component, then this)
//
// Output: dist/web-component/planet-editor.html

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const wcDir = resolve(root, "dist/web-component")
const jsPath = resolve(wcDir, "planet-editor.js")
const cssPath = resolve(wcDir, "planet-editor.css")
const outPath = resolve(wcDir, "planet-editor.html")

if (!existsSync(jsPath) || !existsSync(cssPath)) {
  console.error(
    "Web-component build not found. Run `npm run build:wc` first " +
      "(or use `npm run build:standalone`)."
  )
  process.exit(1)
}

const js = readFileSync(jsPath, "utf8")
const css = readFileSync(cssPath, "utf8")

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Planet Editor</title>
    <style>
      html, body { margin: 0; padding: 0; }
      planet-editor { display: block; min-height: 100vh; }
    </style>
    <style>${css}</style>
  </head>
  <body>
    <!-- Initial content via the "content" attribute (HTML). Remove
         "line-numbers" to start without the gutter; add "editable=\\"false\\""
         for read-only. Listen for the "change" event to read { html, json }. -->
    <planet-editor content="<h1>Planet Editor</h1><p>Start typing…</p>"></planet-editor>

    <script>${js}</script>
  </body>
</html>
`

writeFileSync(outPath, html)
const kb = (Buffer.byteLength(html) / 1024).toFixed(1)
console.log(`✓ standalone HTML written: dist/web-component/planet-editor.html (${kb} kB)`)
