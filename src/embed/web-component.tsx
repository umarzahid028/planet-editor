import { createElement } from "react"
import { createRoot, type Root } from "react-dom/client"

import { Editor, base64Upload } from "@/lib"
import "@/index.css"

/**
 * Web component wrapper: <planet-editor></planet-editor>
 *
 * Attributes:
 *   content="<p>hello</p>"   initial HTML content
 *   editable="false"          read-only mode
 *
 * Events:
 *   addEventListener("change", e => e.detail) // { html, json }
 *
 * Uses light DOM (not shadow DOM) so the editor's global stylesheet applies.
 * Include the emitted style.css on the page alongside this script.
 */
class PlanetEditorElement extends HTMLElement {
  private root?: Root

  connectedCallback() {
    const mount = document.createElement("div")
    this.appendChild(mount)
    this.root = createRoot(mount)
    this.renderEditor()
  }

  disconnectedCallback() {
    this.root?.unmount()
    this.root = undefined
  }

  static get observedAttributes() {
    return ["content", "editable", "line-numbers"]
  }

  attributeChangedCallback() {
    this.renderEditor()
  }

  private renderEditor() {
    if (!this.root) return
    this.root.render(
      createElement(Editor, {
        content: this.getAttribute("content") ?? "",
        editable: this.getAttribute("editable") !== "false",
        lineNumbers: this.hasAttribute("line-numbers")
          ? this.getAttribute("line-numbers") !== "false"
          : false,
        uploadImage: base64Upload,
        onChange: (value) =>
          this.dispatchEvent(new CustomEvent("change", { detail: value })),
      })
    )
  }
}

if (!customElements.get("planet-editor")) {
  customElements.define("planet-editor", PlanetEditorElement)
}
