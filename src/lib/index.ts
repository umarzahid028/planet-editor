// Public package entry point.
//
// Usage in another React project:
//   import { Editor, base64Upload } from "planet-editor"
//   import "planet-editor/styles.css"
//
//   <Editor value={html} onChange={({ html }) => save(html)} />

export {
  SimpleEditor as Editor,
  type SimpleEditorProps as EditorProps,
} from "@/components/planet-templates/simple/simple-editor"

export { base64Upload } from "./upload"
