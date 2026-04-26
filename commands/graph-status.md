---
description: Show stats for the project vault and the global vault
---

Report the current state of both memory-graph vaults.

1. Compute paths:
   - project vault: `~/.memory-graph/<sanitized-cwd>/` (cwd with `/` → `-`)
   - global vault: `~/.memory-graph/global/`

2. For each vault, in this order (project first, then global):
   - If `SCHEMA.md` is missing, mark it as "not initialized" and move on.
   - Otherwise report:
     - vault path
     - count of files under `raw/`
     - count of pages under `wiki/`, broken down by `entities/`, `concepts/`, `sources/` (and any custom kinds you find)
     - last 3 entries from `wiki/log.md`
     - quick health flags from a fast scan (no full lint): wiki pages not present in `index.md`, raw files with no matching `sources/` page

3. Keep the two reports clearly separated with a header per vault.

4. If neither vault exists, suggest `/memory-graph:graph-init` (project) and `/memory-graph:graph-init --global` (machine-wide).

This command stays cheap. For real diagnostics, the user runs `/memory-graph:graph-lint`.
