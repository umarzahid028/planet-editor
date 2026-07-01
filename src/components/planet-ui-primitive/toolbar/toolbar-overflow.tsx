import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { Button } from "@/components/planet-ui-primitive/button"
import { ToolbarSeparator } from "@/components/planet-ui-primitive/toolbar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/planet-ui-primitive/popover"

export interface ToolbarSection {
  key: string
  node: ReactNode
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

const GAP = 6 // approx per-item spacing incl. separators
const MORE_BTN = 44 // reserved width for the ⋯ button

/**
 * Priority-plus toolbar: renders as many sections as fit on one row and
 * collapses the rest into a "⋯ More" popover. Responsive — the split is
 * recomputed whenever the toolbar is resized.
 */
export function ToolbarOverflow({ sections }: { sections: ToolbarSection[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(sections.length)

  const recompute = useCallback(() => {
    const wrap = wrapRef.current
    const measure = measureRef.current
    if (!wrap || !measure) return

    const available = wrap.clientWidth
    const items = Array.from(measure.children) as HTMLElement[]

    // Does everything fit without a More button?
    let total = 0
    for (const el of items) total += el.offsetWidth + GAP
    if (total <= available) {
      setVisibleCount(sections.length)
      return
    }

    // Otherwise fit as many as possible, reserving room for the ⋯ button.
    let used = 0
    let count = 0
    for (const el of items) {
      const next = used + el.offsetWidth + GAP
      if (next > available - MORE_BTN) break
      used = next
      count++
    }
    setVisibleCount(count)
  }, [sections.length])

  useLayoutEffect(() => {
    recompute()
    const ro = new ResizeObserver(recompute)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [recompute])

  const visible = sections.slice(0, visibleCount)
  const overflow = sections.slice(visibleCount)

  return (
    <div ref={wrapRef} className="planet-toolbar-overflow">
      {/* Hidden measurer — renders every section to read their widths. */}
      <div ref={measureRef} className="planet-toolbar-measure" aria-hidden="true">
        {sections.map((s) => (
          <div key={s.key} className="planet-toolbar-group">
            {s.node}
          </div>
        ))}
      </div>

      {visible.map((s, i) => (
        <Fragment key={s.key}>
          {i > 0 && <ToolbarSeparator />}
          <div className="planet-toolbar-group">{s.node}</div>
        </Fragment>
      ))}

      {overflow.length > 0 && (
        <>
          {visible.length > 0 && <ToolbarSeparator />}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" aria-label="More tools" title="More">
                <MoreIcon className="planet-button-icon" />
              </Button>
            </PopoverTrigger>
            <PopoverContent aria-label="More tools">
              <div className="planet-toolbar-overflow-menu">
                {overflow.map((s) => (
                  <div key={s.key} className="planet-toolbar-group">
                    {s.node}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  )
}
