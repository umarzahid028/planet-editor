import { mergeAttributes } from "@/planet-core/core"
import type { DOMOutputSpec } from "@/planet-core/pm/model"
import { Image as BaseImage, type ImageOptions } from "@/planet-core/extension-image"
import { ReactNodeViewRenderer } from "@/planet-core/react"

import { ResizableImageNodeView } from "./resizable-image-node-view"

/**
 * The default Image extension with:
 *  - base64 (data URL) sources allowed (our demo uploads embed data URLs)
 *  - a `width` attribute that survives round-trips (for resizing)
 *  - a `caption` attribute, rendered as a <figcaption>
 *  - a React node view providing a drag-to-resize handle + editable caption
 */
export const ResizableImage = BaseImage.extend({
  addOptions(): ImageOptions {
    return {
      ...(this.parent?.() as ImageOptions),
      allowBase64: true,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("width")
          return value ? parseInt(value, 10) : null
        },
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },
      caption: {
        default: "",
        // Caption is rendered as a <figcaption>, not as an attribute on <img>.
        renderHTML: () => ({}),
        parseHTML: (element) =>
          element.getAttribute("data-caption") ??
          element.parentElement?.querySelector("figcaption")?.textContent ??
          "",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-type='image']",
        getAttrs: (element) => {
          const el = element as HTMLElement
          const img = el.querySelector("img")
          if (!img) return false
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width")
              ? parseInt(img.getAttribute("width")!, 10)
              : null,
            caption: el.querySelector("figcaption")?.textContent ?? "",
          }
        },
      },
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const img: DOMOutputSpec = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ]
    if (node.attrs.caption) {
      return [
        "figure",
        { "data-type": "image" },
        img,
        ["figcaption", {}, node.attrs.caption],
      ] as DOMOutputSpec
    }
    return img
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView)
  },
})

export default ResizableImage
