---
type: ADR
id: "0115"
title: "Folder-scoped note creation and local fork startup guards"
status: active
date: 2026-05-10
---

## Context

Folder navigation and note creation used different mental models. The note list could be scoped to a folder, but the create action still wrote the new note at the vault root. That made the editor show the created note while the adjacent folder-filtered list remained empty.

Local fork builds also need to remain installed after the user chooses to run their own build. If the app continues to consume the official updater feed by default, a self-update can replace the fork with the upstream package and erase local behavior changes.

Startup has the same prioritization issue: AI agent detection, MCP status checks, updater requests, and the MCP WebSocket bridge are useful integrations, but they are not required to paint the local notes UI.

The fork also needs to build and install reliably on a local machine. The editor stack can pull in very large optional graphs at startup and during Vite bundling: full icon registries, all bundled syntax highlighters, calendar picker dependencies, live Mermaid/tldraw runtimes, collaboration helpers, and crash-reporting SDK code.

## Decision

Tolaria now treats folder-scoped note-list creation as a filesystem placement intent. The note remains typed by frontmatter, but when `selection.kind === "folder"` the immediate-create path receives that folder's relative path and writes the file below it.

Nonessential integration probes are deferred from app startup:

1. `scheduleStartupIntegrationCheck()` delays renderer-side AI agent, MCP status, and updater checks.
2. The initial desktop MCP WebSocket bridge spawn waits briefly inside its background thread before launching the Node bridge process.
3. Manual refresh/connect/check actions bypass startup deferral and still run immediately.
4. Local fork builds report no official update and reject official update installation unless built with `TOLARIA_ENABLE_OFFICIAL_UPDATES=1`.

This fork also keeps the initial editor/build graph smaller:

1. Common icon display paths use deep Phosphor imports plus a curated startup-safe icon registry.
2. Code block highlighting imports a limited Shiki language set.
3. Date property editing uses native date inputs in common property surfaces.
4. Mermaid and tldraw blocks keep their durable Markdown storage but render as placeholders in the main editor by default.
5. Unused local-fork collaboration and crash-reporting imports resolve to no-op shims.
6. AI-chat Markdown output uses a small local renderer instead of loading the full Markdown/highlight pipeline.
7. Vite production builds run through `scripts/build-vite-stable.mjs`, which uses Vite's Node API with constrained Rollup file parallelism and per-module memory progress logging. Minification is disabled by default for local fork builds and can be re-enabled with `TOLARIA_ENABLE_MINIFY=1`.

## Consequences

- Creating a note from a folder view makes the new note visible in the current folder list after refresh.
- Type-section creation still creates typed notes without implying a folder.
- Startup prioritizes local vault/editor rendering before integration probes and subprocess startup.
- A fork-installed app is not silently replaced by the official upstream release channel.
- Fork maintainers who want official updates must explicitly opt in at build time.
- This fork preserves Mermaid/tldraw source data but does not load their live renderer/editor by default.
- The curated icon registry and Shiki language set are intentionally smaller than upstream's full optional surface.
