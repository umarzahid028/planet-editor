import { useEffect, useState } from "react"
import type { Editor } from "@/planet-core/react"
import { useEditorState } from "@/planet-core/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-planet-editor"

// --- Icons ---
import { ChevronDownIcon } from "@/components/planet-icons/chevron-down-icon"

// --- UI Primitives ---
import { Button } from "@/components/planet-ui-primitive/button"
import { Input } from "@/components/planet-ui-primitive/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/planet-ui-primitive/dropdown-menu"

export interface FontSizeDropdownMenuProps {
  editor?: Editor
}

const PRESET_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72]

// The editor's base font size (paragraph is 1rem === 16px). Shown when no
// explicit size is applied to the selection.
const DEFAULT_FONT_SIZE = 16

/** Strip a unit (e.g. "16px") down to its numeric value. */
function parseSize(value?: string | null): number | null {
  if (!value) return null
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

/**
 * Toolbar dropdown for setting the font size. Pick a preset or type a custom
 * value (in px) in the input at the top and press Enter to apply.
 */
export function FontSizeDropdownMenu({
  editor: providedEditor,
}: FontSizeDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState("")

  const currentSize = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor ? parseSize(editor.getAttributes("textStyle").fontSize) : null,
  })

  // The size shown in the UI: the explicit size, or the editor's default.
  const effectiveSize = currentSize ?? DEFAULT_FONT_SIZE

  // Seed the custom input with the active size whenever the menu opens.
  useEffect(() => {
    if (isOpen) {
      setDraft(String(effectiveSize))
    }
  }, [isOpen, effectiveSize])

  if (!editor) {
    return null
  }

  // Guard against a stale editor instance (e.g. mid-HMR) that hasn't loaded the
  // FontSize extension yet, so a click can never throw.
  const hasFontSize =
    typeof (editor.commands as Record<string, unknown>).setFontSize === "function"

  const applySize = (size: number) => {
    if (!hasFontSize || !Number.isFinite(size) || size <= 0) return
    editor.chain().focus().setFontSize(`${size}px`).run()
    setIsOpen(false)
  }

  const resetSize = () => {
    if (!hasFontSize) return
    editor.chain().focus().unsetFontSize().run()
    setIsOpen(false)
  }

  const applyDraft = () => {
    const n = parseInt(draft, 10)
    if (Number.isFinite(n) && n > 0) {
      applySize(n)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={currentSize ? "on" : "off"}
          aria-label="Font size"
          tooltip="Font size"
        >
          <span className="planet-button-text" style={{ minWidth: "1.5ch", textAlign: "center" }}>
            {effectiveSize}
          </span>
          <ChevronDownIcon className="planet-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <div
          style={{ display: "flex", gap: "0.25rem", alignItems: "center", padding: "0.25rem" }}
          // Keep the menu's typeahead from stealing keystrokes while typing.
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            type="number"
            min={1}
            value={draft}
            placeholder="Custom"
            autoFocus
            style={{ width: "5rem" }}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyDraft()
              }
            }}
          />
          <Button type="button" data-style="ghost" showTooltip={false} onClick={applyDraft}>
            <span className="planet-button-text">Set</span>
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Button
              type="button"
              data-style="ghost"
              data-active-state={!currentSize ? "on" : "off"}
              showTooltip={false}
              onClick={resetSize}
            >
              <span className="planet-button-text">Default</span>
            </Button>
          </DropdownMenuItem>

          {PRESET_SIZES.map((size) => (
            <DropdownMenuItem key={size} asChild>
              <Button
                type="button"
                data-style="ghost"
                data-active-state={effectiveSize === size ? "on" : "off"}
                showTooltip={false}
                onClick={() => applySize(size)}
              >
                <span className="planet-button-text">{size}</span>
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FontSizeDropdownMenu
