import { Extension } from "@/planet-core/core"
import type { Node as ProseMirrorNode } from "@/planet-core/pm/model"
import { Plugin, PluginKey } from "@/planet-core/pm/state"
import { Decoration, DecorationSet } from "@/planet-core/pm/view"

/**
 * Planet Token Highlight — renders document-variable tokens like `[text:1]`
 * (format `[type:id]`) as inline chips while editing.
 *
 * Decoration-only: the token text stays plain in the document, so serialization
 * and resolution are unaffected — we merely wrap matches in a styled span
 * (`.planet-token`) that the consuming app can theme.
 */

const TOKEN_RE = /\[[a-z]+:\d+\]/gi

export const tokenHighlightKey = new PluginKey<DecorationSet>("planetTokenHighlight")

function buildDecorations(doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return

    // Build the block's text with a doc-position for each character (matches
    // can span marks, so we can't rely on individual text nodes).
    let text = ""
    const positions: number[] = []
    node.descendants((child, childPos) => {
      if (child.isText && child.text) {
        for (let i = 0; i < child.text.length; i++) {
          text += child.text[i]
          positions.push(pos + 1 + childPos + i)
        }
      }
    })

    TOKEN_RE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = TOKEN_RE.exec(text)) !== null) {
      const from = positions[match.index]
      const to = positions[match.index + match[0].length - 1]
      if (from != null && to != null) {
        decorations.push(Decoration.inline(from, to + 1, { class: "planet-token" }))
      }
    }
  })

  return DecorationSet.create(doc, decorations)
}

export const TokenHighlightExtension = Extension.create({
  name: "planetTokenHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: tokenHighlightKey,
        state: {
          init: (_config, state) => buildDecorations(state.doc),
          apply(tr, old) {
            return tr.docChanged ? buildDecorations(tr.doc) : old
          },
        },
        props: {
          decorations(state) {
            return tokenHighlightKey.getState(state)
          },
        },
      }),
    ]
  },
})
