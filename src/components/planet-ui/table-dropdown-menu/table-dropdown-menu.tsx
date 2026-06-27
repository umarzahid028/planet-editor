import { useCallback, useState } from "react"
import type { Editor } from "@/planet-core/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-planet-editor"

// --- Icons ---
import { TableIcon } from "@/components/planet-icons/table-icon"
import { ChevronDownIcon } from "@/components/planet-icons/chevron-down-icon"

// --- UI Primitives ---
import { Button } from "@/components/planet-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/planet-ui-primitive/dropdown-menu"

export interface TableDropdownMenuProps {
  editor?: Editor
}

type TableAction = {
  label: string
  /** The chainable command name to run. */
  command: string
  /** Optional args passed to the command. */
  args?: unknown
  destructive?: boolean
}

const COLUMN_ACTIONS: TableAction[] = [
  { label: "Add column before", command: "addColumnBefore" },
  { label: "Add column after", command: "addColumnAfter" },
  { label: "Delete column", command: "deleteColumn", destructive: true },
]

const ROW_ACTIONS: TableAction[] = [
  { label: "Add row before", command: "addRowBefore" },
  { label: "Add row after", command: "addRowAfter" },
  { label: "Delete row", command: "deleteRow", destructive: true },
]

const CELL_ACTIONS: TableAction[] = [
  { label: "Merge or split cells", command: "mergeOrSplit" },
  { label: "Toggle header row", command: "toggleHeaderRow" },
  { label: "Toggle header column", command: "toggleHeaderColumn" },
]

/**
 * Toolbar dropdown that inserts a table and exposes all table-related
 * actions (rows, columns, cells, header toggles, delete) once the cursor is
 * inside a table. Actions are disabled when not applicable.
 */
export function TableDropdownMenu({
  editor: providedEditor,
}: TableDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const run = useCallback(
    (command: string, args?: unknown) => {
      if (!editor) return
      const chain = editor.chain().focus() as unknown as Record<
        string,
        (a?: unknown) => { run: () => boolean }
      >
      chain[command]?.(args)?.run?.()
    },
    [editor]
  )

  const can = useCallback(
    (command: string, args?: unknown) => {
      if (!editor) return false
      const chain = editor.can().chain().focus() as unknown as Record<
        string,
        undefined | ((a?: unknown) => { run?: () => boolean })
      >
      return Boolean(chain[command]?.(args)?.run?.())
    },
    [editor]
  )

  if (!editor) {
    return null
  }

  const isInTable = editor.isActive("table")

  const renderActions = (actions: TableAction[]) =>
    actions.map((action) => {
      const enabled = can(action.command, action.args)
      return (
        <DropdownMenuItem key={action.command} asChild disabled={!enabled}>
          <Button
            type="button"
            data-style="ghost"
            disabled={!enabled}
            showTooltip={false}
            onClick={() => run(action.command, action.args)}
          >
            <span
              className="planet-button-text"
              style={action.destructive ? { color: "var(--tt-color-text-red, #dc2626)" } : undefined}
            >
              {action.label}
            </span>
          </Button>
        </DropdownMenuItem>
      )
    })

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={isInTable ? "on" : "off"}
          aria-label="Table options"
          tooltip="Table"
        >
          <TableIcon className="planet-button-icon" />
          <ChevronDownIcon className="planet-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Button
              type="button"
              data-style="ghost"
              showTooltip={false}
              onClick={() =>
                run("insertTable", {
                  rows: 3,
                  cols: 3,
                  withHeaderRow: true,
                })
              }
            >
              <span className="planet-button-text">Insert table</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {isInTable && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>{renderActions(COLUMN_ACTIONS)}</DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>{renderActions(ROW_ACTIONS)}</DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>{renderActions(CELL_ACTIONS)}</DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {renderActions([
                {
                  label: "Delete table",
                  command: "deleteTable",
                  destructive: true,
                },
              ])}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableDropdownMenu
