"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@/planet-core/react"

// --- Planet Core Extensions ---
import { StarterKit } from "@/planet-core/starter-kit"
import { ResizableImage } from "@/components/planet-node/image-node/resizable-image-extension"
import { TaskItem, TaskList } from "@/planet-core/extension-list"
import { TextAlign } from "@/planet-core/extension-text-align"
import { Typography } from "@/planet-core/extension-typography"
import { Highlight } from "@/planet-core/extension-highlight"
import { Subscript } from "@/planet-core/extension-subscript"
import { Superscript } from "@/planet-core/extension-superscript"
import { TableKit } from "@/planet-core/extension-table"
import { TextStyle, FontSize } from "@/planet-core/extension-text-style"
import { Selection } from "@/planet-core/extensions"

// --- UI Primitives ---
import { Button } from "@/components/planet-ui-primitive/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarOverflow,
  type ToolbarSection,
} from "@/components/planet-ui-primitive/toolbar"

// --- Planet Node ---
import { ImageUploadNode } from "@/components/planet-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/planet-node/horizontal-rule-node/horizontal-rule-node-extension"
import { SearchExtension } from "@/components/planet-extension/search-extension"
import { TokenHighlightExtension } from "@/components/planet-extension/token-highlight-extension"
import "@/components/planet-node/blockquote-node/blockquote-node.scss"
import "@/components/planet-node/code-block-node/code-block-node.scss"
import "@/components/planet-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/planet-node/list-node/list-node.scss"
import "@/components/planet-node/image-node/image-node.scss"
import "@/components/planet-node/heading-node/heading-node.scss"
import "@/components/planet-node/paragraph-node/paragraph-node.scss"

// --- Planet UI ---
import { HeadingDropdownMenu } from "@/components/planet-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/planet-ui/image-upload-button"
import { FontSizeDropdownMenu } from "@/components/planet-ui/font-size-dropdown-menu"
import { ListDropdownMenu } from "@/components/planet-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/planet-ui/blockquote-button"
import { CodeBlockButton } from "@/components/planet-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/planet-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/planet-ui/link-popover"
import { MarkButton } from "@/components/planet-ui/mark-button"
import { TableDropdownMenu } from "@/components/planet-ui/table-dropdown-menu"
import { TextAlignButton } from "@/components/planet-ui/text-align-button"
import { UndoRedoButton } from "@/components/planet-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/planet-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/planet-icons/highlighter-icon"
import { LinkIcon } from "@/components/planet-icons/link-icon"
import { LineNumbersIcon } from "@/components/planet-icons/line-numbers-icon"
import { SearchIcon } from "@/components/planet-icons/search-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useLineNumbers } from "@/hooks/use-line-numbers"

// --- Components ---
import { ThemeToggle } from "@/components/planet-templates/simple/theme-toggle"
import { SearchBar } from "@/components/planet-ui/search-bar"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/planet-utils"

// --- Styles ---
import "@/components/planet-templates/simple/simple-editor.scss"

import content from "@/components/planet-templates/simple/data/content.json"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  lineNumbersActive,
  onToggleLineNumbers,
  onSearchClick,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  lineNumbersActive: boolean
  onToggleLineNumbers: () => void
  onSearchClick: () => void
}) => {
  const sections: ToolbarSection[] = [
    {
      key: "history",
      node: (
        <>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
          <Button
            variant="ghost"
            onClick={onSearchClick}
            aria-label="Search"
            title="Search (⌘F)"
          >
            <SearchIcon className="planet-button-icon" />
          </Button>
        </>
      ),
    },
    {
      key: "blocks",
      node: (
        <>
          <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
          <FontSizeDropdownMenu />
          <ListDropdownMenu
            modal={false}
            types={["bulletList", "orderedList", "taskList"]}
          />
          <BlockquoteButton />
          <CodeBlockButton />
        </>
      ),
    },
    {
      key: "marks",
      node: (
        <>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="strike" />
          <MarkButton type="code" />
          <MarkButton type="underline" />
          {!isMobile ? (
            <ColorHighlightPopover />
          ) : (
            <ColorHighlightPopoverButton onClick={onHighlighterClick} />
          )}
          {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        </>
      ),
    },
    {
      key: "script",
      node: (
        <>
          <MarkButton type="superscript" />
          <MarkButton type="subscript" />
        </>
      ),
    },
    {
      key: "align",
      node: (
        <>
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
          <TextAlignButton align="justify" />
        </>
      ),
    },
    {
      key: "image",
      node: <ImageUploadButton text="Add" />,
    },
    {
      key: "table",
      node: <TableDropdownMenu />,
    },
    {
      key: "view",
      node: (
        <>
          <Button
            variant="ghost"
            data-active-state={lineNumbersActive ? "on" : "off"}
            onClick={onToggleLineNumbers}
            aria-pressed={lineNumbersActive}
            aria-label="Toggle line numbers"
            title="Line numbers"
          >
            <LineNumbersIcon className="planet-button-icon" />
          </Button>
          <ThemeToggle />
        </>
      ),
    },
  ]

  return <ToolbarOverflow sections={sections} />
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="planet-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="planet-button-icon" />
        ) : (
          <LinkIcon className="planet-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

/** The live Tiptap editor instance created by SimpleEditor. */
export type PlanetEditorInstance = NonNullable<ReturnType<typeof useEditor>>

export interface SimpleEditorProps {
  /** Initial content as HTML string or Planet JSON. Defaults to demo content. */
  content?: string | Record<string, unknown>
  /** Whether the editor is editable. @default true */
  editable?: boolean
  /** Called on every change with both HTML and JSON representations. */
  onChange?: (value: { html: string; json: Record<string, unknown> }) => void
  /**
   * Fired once the editor instance is ready. Use it to run commands on the
   * editor from outside — e.g. `editor.chain().focus().insertContent("...").run()`.
   */
  onEditorReady?: (editor: PlanetEditorInstance) => void
  /**
   * Image upload handler. Receives the picked File and resolves to a URL/src.
   * Defaults to an offline base64 (data URL) handler. Pass your own to upload
   * to a backend when online.
   */
  uploadImage?: (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
  ) => Promise<string>
  /**
   * Show a line-number gutter down the left of the document, numbering each
   * top-level block. Off by default. @default false
   */
  lineNumbers?: boolean
}

/**
 * Inner editor — calls `useEditor` and all Planet hooks. This component is
 * rendered only on the client (see the SSR guard in `SimpleEditor`), so those
 * hooks never run during Next.js server prerender, which would otherwise crash
 * (`useSyncExternalStore` reads from null on the server).
 */
function SimpleEditorInner({
  content: contentProp,
  editable = true,
  onChange,
  onEditorReady,
  uploadImage,
  lineNumbers = false,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  // Runtime line-number toggle, seeded from the `lineNumbers` prop. The toolbar
  // button flips this so users can enable/disable line numbers in the editor.
  const [showLineNumbers, setShowLineNumbers] = useState(lineNumbers)
  const [showSearch, setShowSearch] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: true,
    editable,
    onUpdate: ({ editor }) =>
      onChange?.({
        html: editor.getHTML(),
        json: editor.getJSON() as Record<string, unknown>,
      }),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TableKit.configure({ table: { resizable: true } }),
      TextStyle,
      FontSize,
      ResizableImage,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: uploadImage ?? handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      SearchExtension,
      TokenHighlightExtension,
    ],
    content: contentProp ?? content,
  })

  // Expose the editor instance to the consumer once it's ready.
  useEffect(() => {
    if (editor) onEditorReady?.(editor)
  }, [editor, onEditorReady])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // Keep internal state in sync if the prop changes.
  useEffect(() => setShowLineNumbers(lineNumbers), [lineNumbers])

  const {
    wrapperRef,
    tops: lineTops,
    left: gutterLeft,
  } = useLineNumbers(editor, showLineNumbers)

  if (!editor) {
    return <div className="simple-editor-wrapper" />
  }

  return (
    <div
      ref={wrapperRef}
      className="simple-editor-wrapper"
      data-line-numbers={showLineNumbers ? "true" : undefined}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
          e.preventDefault()
          setShowSearch(true)
        }
      }}
    >
      {showSearch && (
        <SearchBar editor={editor} onClose={() => setShowSearch(false)} />
      )}
      {showLineNumbers && (
        <div
          className="planet-line-gutter"
          aria-hidden="true"
          style={{ left: gutterLeft }}
        >
          {lineTops.map((top, i) => (
            <span className="planet-line-number" key={i} style={{ top }}>
              {String(i + 1).padStart(5, "0")}
            </span>
          ))}
        </div>
      )}
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              lineNumbersActive={showLineNumbers}
              onToggleLineNumbers={() => setShowLineNumbers((v) => !v)}
              onSearchClick={() => setShowSearch(true)}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}

/**
 * Public editor component. SSR-safe: on the server (and the first client render
 * during hydration) it emits a stable empty wrapper, then mounts the real
 * editor on the client. This keeps every Planet hook off the server, so it
 * works in Next.js App Router without prerender/hydration errors.
 */
export function SimpleEditor(props: SimpleEditorProps = {}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="simple-editor-wrapper" />
  }

  return <SimpleEditorInner {...props} />
}
