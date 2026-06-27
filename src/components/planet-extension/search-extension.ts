import { Extension } from "@/planet-core/core"
import type { Node as ProseMirrorNode } from "@/planet-core/pm/model"
import { Plugin, PluginKey } from "@/planet-core/pm/state"
import { Decoration, DecorationSet } from "@/planet-core/pm/view"

/**
 * Planet Search — find-in-document for the editor.
 *
 * A ProseMirror plugin that finds all occurrences of a search term, highlights
 * them with decorations (with a distinct style for the active match), and
 * exposes commands to navigate between matches. Pure client-side, no network.
 */

export interface SearchMatch {
  from: number
  to: number
}

export interface SearchPluginState {
  searchTerm: string
  caseSensitive: boolean
  matches: SearchMatch[]
  currentIndex: number
  decorations: DecorationSet
}

export const searchPluginKey = new PluginKey<SearchPluginState>("planetSearch")

/**
 * Find every occurrence of `term` in the document. Matching is done per text
 * block (so matches can span multiple marks, e.g. partly-bold words) but never
 * across block boundaries, and positions map back to exact document offsets.
 */
function findMatches(
  doc: ProseMirrorNode,
  term: string,
  caseSensitive: boolean
): SearchMatch[] {
  const matches: SearchMatch[] = []
  if (!term) return matches

  const needle = caseSensitive ? term : term.toLowerCase()

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return

    // Build the block's text with a doc-position for each character.
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

    const haystack = caseSensitive ? text : text.toLowerCase()
    let index = 0
    while ((index = haystack.indexOf(needle, index)) !== -1) {
      const from = positions[index]
      const to = positions[index + needle.length - 1] + 1
      if (from != null && to != null) matches.push({ from, to })
      index += needle.length
    }
  })

  return matches
}

function buildDecorations(
  doc: ProseMirrorNode,
  matches: SearchMatch[],
  currentIndex: number
): DecorationSet {
  const decorations = matches.map((match, i) =>
    Decoration.inline(match.from, match.to, {
      class:
        i === currentIndex
          ? "planet-search-match planet-search-match--current"
          : "planet-search-match",
    })
  )
  return DecorationSet.create(doc, decorations)
}

const emptyState: SearchPluginState = {
  searchTerm: "",
  caseSensitive: false,
  matches: [],
  currentIndex: -1,
  decorations: DecorationSet.empty,
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    planetSearch: {
      /** Set the search term (and reset to the first match). */
      setSearchTerm: (term: string) => ReturnType
      /** Toggle case-sensitive matching. */
      setSearchCaseSensitive: (value: boolean) => ReturnType
      /** Move to the next match (wraps around). */
      nextSearchMatch: () => ReturnType
      /** Move to the previous match (wraps around). */
      previousSearchMatch: () => ReturnType
      /** Clear the search and remove all highlights. */
      clearSearch: () => ReturnType
    }
  }
}

export const SearchExtension = Extension.create({
  name: "planetSearch",

  addCommands() {
    return {
      setSearchTerm:
        (term: string) =>
        ({ tr, dispatch }) => {
          if (dispatch)
            dispatch(
              tr.setMeta(searchPluginKey, { searchTerm: term, currentIndex: 0 })
            )
          return true
        },

      setSearchCaseSensitive:
        (value: boolean) =>
        ({ tr, dispatch }) => {
          if (dispatch)
            dispatch(
              tr.setMeta(searchPluginKey, {
                caseSensitive: value,
                currentIndex: 0,
              })
            )
          return true
        },

      nextSearchMatch:
        () =>
        ({ tr, state, dispatch }) => {
          const ps = searchPluginKey.getState(state)
          if (!ps || ps.matches.length === 0) return false
          const next = (ps.currentIndex + 1) % ps.matches.length
          if (dispatch)
            dispatch(tr.setMeta(searchPluginKey, { currentIndex: next }))
          return true
        },

      previousSearchMatch:
        () =>
        ({ tr, state, dispatch }) => {
          const ps = searchPluginKey.getState(state)
          if (!ps || ps.matches.length === 0) return false
          const prev =
            (ps.currentIndex - 1 + ps.matches.length) % ps.matches.length
          if (dispatch)
            dispatch(tr.setMeta(searchPluginKey, { currentIndex: prev }))
          return true
        },

      clearSearch:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch)
            dispatch(
              tr.setMeta(searchPluginKey, { searchTerm: "", currentIndex: -1 })
            )
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<SearchPluginState>({
        key: searchPluginKey,
        state: {
          init: () => emptyState,
          apply(tr, value, _oldState, newState) {
            const meta = tr.getMeta(searchPluginKey) as
              | Partial<SearchPluginState>
              | undefined

            if (!meta && !tr.docChanged) return value

            const searchTerm = meta?.searchTerm ?? value.searchTerm
            const caseSensitive = meta?.caseSensitive ?? value.caseSensitive
            const matches = findMatches(newState.doc, searchTerm, caseSensitive)

            let currentIndex = meta?.currentIndex ?? value.currentIndex
            if (matches.length === 0) currentIndex = -1
            else if (currentIndex < 0 || currentIndex >= matches.length)
              currentIndex = 0

            return {
              searchTerm,
              caseSensitive,
              matches,
              currentIndex,
              decorations: buildDecorations(newState.doc, matches, currentIndex),
            }
          },
        },
        props: {
          decorations(state) {
            return searchPluginKey.getState(state)?.decorations
          },
        },
      }),
    ]
  },
})
