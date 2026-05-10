# Change: Fix folder note creation and defer startup checks

## Why

Creating a note while a folder is selected currently writes the file at the vault root. The editor opens the new note, but the folder-filtered note list stays empty, which makes the note look missing.

Tolaria also performs nonessential integration checks during initial mount. Those checks compete with the first vault/editor paint even though AI agent readiness, MCP registration status, and update availability are not needed to show the local notes UI.

## What Changes

- Route note-list create actions from folder selections through the selected folder path.
- Persist immediate untitled notes inside the selected folder when a folder context is supplied.
- Keep type-section note creation behavior unchanged.
- Defer AI agent, MCP, and updater startup checks until after the initial render has had time to settle.
- Keep manual refresh/connect/update actions immediate when the user explicitly asks for them.
- Disable official upstream self-updates by default in local fork builds so the installed fork is not silently replaced by the official release channel.

## Impact

- Affects note creation hooks and note-list interaction wiring.
- Affects startup-only timing for AI agent status, MCP status, and update checks.
- Affects local fork updater behavior; official updates can be explicitly re-enabled at build time.
- Adds regression coverage for folder-scoped note creation and deferred startup checks.
