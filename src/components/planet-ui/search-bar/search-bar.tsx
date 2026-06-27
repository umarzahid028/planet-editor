import { useEffect, useRef, useState } from "react"
import type { Editor } from "@/planet-core/core"
import { searchPluginKey } from "@/components/planet-extension/search-extension"
import { Button } from "@/components/planet-ui-primitive/button"
import { ChevronDownIcon } from "@/components/planet-icons/chevron-down-icon"
import { CloseIcon } from "@/components/planet-icons/close-icon"

export interface SearchBarProps {
  editor: Editor
  onClose: () => void
}

/**
 * Find-in-document bar. Drives the Planet Search extension and reflects its
 * live match count / current position. Enter = next, Shift+Enter = previous,
 * Escape = close.
 */
export function SearchBar({ editor, onClose }: SearchBarProps) {
  const [term, setTerm] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [info, setInfo] = useState({ count: 0, current: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when the bar opens.
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Reflect the extension's match count / current index.
  useEffect(() => {
    const update = () => {
      const ps = searchPluginKey.getState(editor.state)
      setInfo({
        count: ps?.matches.length ?? 0,
        current: ps && ps.currentIndex >= 0 ? ps.currentIndex + 1 : 0,
      })
    }
    update()
    editor.on("transaction", update)
    return () => {
      editor.off("transaction", update)
    }
  }, [editor])

  // Push the term / case option into the extension.
  useEffect(() => {
    editor.commands.setSearchCaseSensitive(caseSensitive)
    editor.commands.setSearchTerm(term)
  }, [editor, term, caseSensitive])

  // Clear highlights when the bar unmounts.
  useEffect(() => {
    return () => {
      editor.commands.clearSearch()
    }
  }, [editor])

  // Scroll the active match into view.
  useEffect(() => {
    const el = editor.view.dom.querySelector(".planet-search-match--current")
    el?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [editor, info.current])

  const goNext = () => editor.commands.nextSearchMatch()
  const goPrev = () => editor.commands.previousSearchMatch()

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (e.shiftKey) goPrev()
      else goNext()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div className="planet-search-bar" role="search">
      <input
        ref={inputRef}
        className="planet-search-input"
        type="text"
        placeholder="Search…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Search in document"
      />

      <span className="planet-search-count">
        {info.count > 0 ? `${info.current}/${info.count}` : term ? "0/0" : ""}
      </span>

      <Button
        variant="ghost"
        data-active-state={caseSensitive ? "on" : "off"}
        onClick={() => setCaseSensitive((v) => !v)}
        aria-pressed={caseSensitive}
        aria-label="Match case"
        title="Match case"
      >
        <span className="planet-search-case">Aa</span>
      </Button>

      <Button
        variant="ghost"
        onClick={goPrev}
        disabled={info.count === 0}
        aria-label="Previous match"
        title="Previous (Shift+Enter)"
      >
        <ChevronDownIcon
          className="planet-button-icon"
          style={{ transform: "rotate(180deg)" }}
        />
      </Button>

      <Button
        variant="ghost"
        onClick={goNext}
        disabled={info.count === 0}
        aria-label="Next match"
        title="Next (Enter)"
      >
        <ChevronDownIcon className="planet-button-icon" />
      </Button>

      <Button variant="ghost" onClick={onClose} aria-label="Close search">
        <CloseIcon className="planet-button-icon" />
      </Button>
    </div>
  )
}
