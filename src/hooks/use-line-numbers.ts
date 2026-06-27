import { useEffect, useRef, useState } from "react"
import type { Editor } from "@/planet-core/core"

/**
 * Measures the vertical position of every *visual* line in the editor (so a
 * wrapped paragraph yields one number per wrapped row, not one per block) and
 * returns the tops to render in a left gutter.
 *
 * Pure measurement via Range.getClientRects(); re-runs on edit, resize, and
 * font load. Returns a ref to attach to the positioned wrapper, the line tops
 * (relative to that wrapper), and the editor's left edge within it.
 */
export function useLineNumbers(editor: Editor | null, enabled: boolean) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [tops, setTops] = useState<number[]>([])
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (!enabled || !editor) {
      setTops([])
      return
    }
    const dom = editor.view.dom as HTMLElement
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let raf = 0
    let cancelled = false

    const run = () => {
      const wrapRect = wrapper.getBoundingClientRect()
      const domRect = dom.getBoundingClientRect()

      // Cluster threshold: rects on the same visual line share a top within a
      // few px (sub/superscript shift it slightly), while real rows are a full
      // line-height apart. Use ~60% of the line height to separate them.
      const lh = parseFloat(getComputedStyle(dom).lineHeight)
      const threshold = Number.isFinite(lh) ? lh * 0.6 : 12

      const candidates: number[] = []
      const range = document.createRange()
      const walker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT)
      let node: Node | null
      while ((node = walker.nextNode())) {
        if (!node.textContent || node.textContent.length === 0) continue
        range.selectNodeContents(node)
        const rects = range.getClientRects()
        for (let i = 0; i < rects.length; i++) {
          const r = rects[i]
          if (r.height === 0) continue
          candidates.push(r.top - wrapRect.top)
        }
      }
      // Blocks with no text (empty paragraph, image, hr) still get one number.
      Array.from(dom.children).forEach((child) => {
        const el = child as HTMLElement
        if ((el.textContent ?? "").trim().length > 0) return
        const r = el.getBoundingClientRect()
        if (r.height === 0) return
        candidates.push(r.top - wrapRect.top)
      })

      candidates.sort((a, b) => a - b)
      const clustered: number[] = []
      for (const t of candidates) {
        if (
          clustered.length === 0 ||
          t - clustered[clustered.length - 1] > threshold
        ) {
          clustered.push(t)
        }
      }

      if (cancelled) return
      setLeft(domRect.left - wrapRect.left)
      setTops(clustered)
    }

    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(run)
    }

    measure()
    editor.on("update", measure)
    const ro = new ResizeObserver(measure)
    ro.observe(dom)
    window.addEventListener("resize", measure)
    document.fonts?.ready.then(() => !cancelled && measure())

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      editor.off("update", measure)
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [editor, enabled])

  return { wrapperRef, tops, left }
}
