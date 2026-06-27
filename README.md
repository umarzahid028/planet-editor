# planet-editor

A batteries-included [Planet](https://planet.dev) rich-text editor that works in **React**, **Next.js**, and **standalone HTML** — with a ready-made toolbar, font sizing, tables, and resizable images with captions. No backend required (images embed as base64 by default).

## Features

- Find-in-document search (toolbar button or ⌘F / Ctrl+F) with match count + next/prev
- Bold / italic / underline / strike, headings, lists, task lists, blockquotes, code blocks
- Font-size dropdown (presets + custom px) and text alignment
- Tables (insert, add/remove rows & columns, merge/split, header toggles)
- Resizable images with editable captions
- Link popover, highlight colors, sub/superscript
- Light/dark mode, mobile toolbar, keyboard shortcuts
- SSR-safe (renders cleanly in Next.js App Router)

## Install

```bash
npm install planet-editor
```

`react` and `react-dom` (v18 or v19) are peer dependencies — your app provides them.

---

## 1. React

```tsx
import { Editor } from "planet-editor"
import "planet-editor/styles.css"

export default function App() {
  return (
    <Editor
      content="<p>Hello world</p>"
      editable
      onChange={({ html, json }) => console.log(html, json)}
    />
  )
}
```

## 2. Next.js (App Router)

The editor is a client component. Import it from a client component or disable SSR:

```tsx
"use client"

import { Editor } from "planet-editor"
import "planet-editor/styles.css"

export default function EditorPage() {
  return <Editor content="<p>Start writing…</p>" onChange={({ html }) => save(html)} />
}
```

> Import `planet-editor/styles.css` once (e.g. in `app/layout.tsx` or the page).

## 3. Standalone HTML (no build step)

Drop in the web component from a CDN — it registers a `<planet-editor>` element:

```html
<link rel="stylesheet" href="https://unpkg.com/planet-editor/dist/web-component/planet-editor.css" />
<script src="https://unpkg.com/planet-editor/dist/web-component/planet-editor.js"></script>

<planet-editor content="<p>Hello</p>"></planet-editor>

<script>
  document
    .querySelector("planet-editor")
    .addEventListener("change", (e) => console.log(e.detail.html, e.detail.json))
</script>
```

Attributes: `content` (initial HTML), `editable` (`"false"` for read-only), `line-numbers` (present = on). Event: `change` → `{ html, json }`.

```html
<planet-editor line-numbers content="<p>Numbered</p>"></planet-editor>
```

Prefer **one self-contained file**? Run `npm run build:standalone` to generate
`dist/web-component/planet-editor.html` — JS and CSS inlined, no external files,
no iframe. Open it directly, host it anywhere, or embed its markup in any page.

---

## Props (React / Next.js)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| object` | demo content | Initial HTML string or Planet JSON |
| `editable` | `boolean` | `true` | Read-only when `false` |
| `onChange` | `({ html, json }) => void` | — | Fires on every change |
| `uploadImage` | `(file, onProgress?, signal?) => Promise<string>` | base64 | Upload handler; return the stored image URL |
| `lineNumbers` | `boolean` | `false` | Show a line-number gutter numbering each top-level block |

```tsx
<Editor lineNumbers />   {/* start with the line-number gutter on */}
```

The `lineNumbers` prop sets the **initial** state. Users can also toggle line
numbers on/off at any time with the line-numbers button in the toolbar. Every
visual row is numbered (wrapped lines included).

### Uploading images to a backend

By default images are embedded as base64 data URLs (no network). To store them on a server, pass `uploadImage`:

```tsx
import { Editor } from "planet-editor"

<Editor
  uploadImage={async (file) => {
    const body = new FormData()
    body.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body })
    const { url } = await res.json()
    return url
  }}
/>
```

`base64Upload` (the default handler) is also exported if you want to compose with it.

## License

MIT
