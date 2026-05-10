# Design: Folder create visibility and local-fork startup latency

## Goals

- Creating a note from a folder-scoped note list must place the backing Markdown file under that folder so the note appears beside the editor after reload.
- Type-driven creation must remain frontmatter-driven and must not infer type from folder location.
- Local fork installs must not be silently replaced by the official upstream updater.
- Startup should prioritize the Tauri shell, vault UI, and editor paint before optional integration checks and large editor-adjacent modules.

## Non-Goals

- Do not redesign vault scanning or folder move semantics.
- Do not introduce a new note database or shadow index for folder creation.
- Do not preserve official self-update behavior in this fork unless the build explicitly opts in.

## Approach

`useNoteCreation` accepts an optional relative `folderPath` for immediate note creation. The hook normalizes separators, rejects parent-directory traversal, and uses that relative path only for the filesystem target. The note's `type:` frontmatter remains the only source of entity type.

The note list passes the selected folder path only when `selection.kind === "folder"`. Other creation surfaces keep their existing behavior, including type-section creation and generic untitled-note creation at the default workspace root.

Startup probes are split from manual actions. AI-agent status, MCP status, and update checks schedule their first automatic check through `scheduleStartupIntegrationCheck()`, while explicit refresh/connect/check calls keep the immediate code path. The Rust startup path also delays the initial persisted MCP WebSocket bridge sync before launching the Node bridge process.

The local fork updater defaults to "official updates disabled." Rust updater commands return no available update and reject install attempts unless the binary is built with `TOLARIA_ENABLE_OFFICIAL_UPDATES=1`.

The Vite build graph is also narrowed for the local fork:

- Common note/type icons use deep Phosphor imports and a curated startup-safe registry.
- Code-block highlighting uses a limited Shiki language set instead of importing every bundled grammar.
- Date editing uses native date inputs instead of loading the calendar picker into common property cells.
- Mermaid and tldraw blocks remain Markdown-durable but render as editor placeholders by default in this fork.
- Collaboration and crash-reporting libraries that are unused in the local fork are aliased to no-op shims.
- AI-chat Markdown rendering uses a small local renderer instead of the full unified/highlight pipeline.
- `scripts/build-vite-stable.mjs` builds through Vite's Node API with single-file Rollup parallelism and per-module memory progress logging. Local fork builds skip minification by default; `TOLARIA_ENABLE_MINIFY=1` opts back in.

## Risks

- The local fork trades optional visual/editor integrations for startup and build reliability. Mermaid diagrams and tldraw whiteboards keep their Markdown data, but the main editor no longer loads their live runtimes by default.
- The curated icon registry reduces picker breadth. Existing stored icon names outside the curated set may fall back to a neutral display until the full picker is reintroduced behind an explicit lazy boundary.
- The Yjs/prosemirror collaboration shim is suitable only while collaborative editing remains disabled in this fork.

## Verification

- Folder creation regression tests cover folder-scoped placement and unsafe path rejection.
- Note-list rendering tests cover passing the selected folder path to creation.
- Startup-hook tests cover deferred automatic checks while preserving manual actions.
- Vite production build must pass before packaging and install.
