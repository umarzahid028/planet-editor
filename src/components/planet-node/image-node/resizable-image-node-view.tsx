import { useRef } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@/planet-core/react"

const MIN_WIDTH = 64

/**
 * Node view for the image node: renders the image with a bottom-right resize
 * handle (drag to shrink/grow, aspect ratio preserved) and an editable caption
 * underneath.
 */
export function ResizableImageNodeView({
  node,
  updateAttributes,
  selected,
  editor,
}: NodeViewProps) {
  const { src, alt, title, width, caption } = node.attrs as {
    src: string
    alt?: string
    title?: string
    width?: number | string | null
    caption?: string
  }
  const imgRef = useRef<HTMLImageElement>(null)
  const editable = editor.isEditable

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = imgRef.current?.offsetWidth ?? 0
    const maxWidth =
      imgRef.current?.parentElement?.parentElement?.offsetWidth ?? Infinity

    const onMove = (ev: MouseEvent) => {
      const next = Math.min(
        Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX)),
        maxWidth
      )
      if (imgRef.current) imgRef.current.style.width = `${next}px`
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      const finalWidth = imgRef.current?.offsetWidth
      if (finalWidth) updateAttributes({ width: Math.round(finalWidth) })
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const widthStyle = width ? `${typeof width === "number" ? `${width}px` : width}` : undefined

  return (
    <NodeViewWrapper
      as="figure"
      className={`resizable-image${selected ? " is-selected" : ""}`}
      data-type="image"
    >
      <div className="resizable-image-frame" style={{ width: widthStyle ?? "fit-content" }}>
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          title={title ?? undefined}
          draggable={false}
          style={{ width: widthStyle }}
        />
        {editable && (
          <span
            className="resizable-image-handle"
            onMouseDown={startResize}
            role="presentation"
            aria-hidden="true"
          />
        )}
      </div>

      {editable ? (
        <figcaption>
          <input
            className="resizable-image-caption-input"
            value={caption ?? ""}
            placeholder="Add a caption…"
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </figcaption>
      ) : caption ? (
        <figcaption>{caption}</figcaption>
      ) : null}
    </NodeViewWrapper>
  )
}
