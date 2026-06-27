// Planet Editor — core facade.
//
// The rest of the codebase imports the editor engine through these Planet
// modules instead of depending on the engine package directly. This keeps
// the source decoupled from the underlying implementation and makes it
// possible to evolve or replace the engine behind a stable Planet surface.
//
// Attribution for the underlying engine is in THIRD-PARTY-LICENSES.md.

export * from "@tiptap/extension-superscript"
