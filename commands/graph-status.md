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
     - count of pages under `wiki/`, broken down by `entities/`, `concepts/`, `sources/`, `decisions/`, `conflicts/` (and any custom kinds you find)
     - last 3 entries from `wiki/log.md`
     - quick health flags from a fast scan (no full lint): wiki pages not present in `index.md`, raw files with no matching `sources/` page
     - **consolidation hint** (cheap signal — no new pass): if `wiki/log.md` shows the last `consolidate` entry was >30 days ago AND the last `lint` entry reported ≥5 stale-page or open-conflict warnings, append a one-line "Consolidation suggested — run `/memory-graph:graph-consolidate`." Skip silently if the log has never seen a consolidate entry on a fresh vault, or if neither lint nor consolidate has run yet.

3. Keep the two reports clearly separated with a header per vault.

4. If neither vault exists, suggest `/memory-graph:graph-init` (project) and `/memory-graph:graph-init --global` (machine-wide).

This command stays cheap. For real diagnostics, the user runs `/memory-graph:graph-lint`. For stale-page / near-duplicate / open-conflict roll-up, `/memory-graph:graph-consolidate`.
