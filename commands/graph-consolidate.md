---
description: Surface stale pages, near-duplicates, and open conflicts in the vault — report only, no mutations (project by default; --global for the machine-wide vault)
argument-hint: [--global]
---

Consolidate the memory-graph vault. **Report-only. Never mutates a wiki page.**

1. Parse `$ARGUMENTS`. `--global` selects the global vault; otherwise the project vault.
2. Resolve the vault root:
   - project: `~/.memory-graph/<sanitized-cwd>/` (cwd with `/` → `-`)
   - global: `~/.memory-graph/global/`
   If `SCHEMA.md` is missing, stop and tell the user: "No `<project|global>` vault yet. Run `/memory-graph:graph-init` to bootstrap one (or `/memory-graph:graph-init --global` for the machine-wide vault)."
3. Read `<vault-root>/SCHEMA.md` — note which features are enabled (decay metadata, `conflict` kind, `relatedPaths`). Checks tied to disabled features are no-ops.
4. Read the bundled skill at `skills/wiki/SKILL.md` — the "Consolidate" section under "Three operations".
5. Execute the consolidate operation exactly as specified in the SKILL: stale-page sweep, near-duplicate sweep, open-conflict roll-up, and (if `relatedPaths` is enabled and the cwd is a git repo) the path-affected sweep. Produce a markdown report with three or four sections and a one-line topline.
6. Do NOT mutate any wiki page. Do NOT auto-resolve conflicts. Do NOT auto-supersede. The user reviews the report and decides what (if anything) to fix manually.
7. Append a `consolidate` entry to `<vault-root>/wiki/log.md` recording the counts. This is the only write the command performs.

Heavy by design — like lint, run on demand. Hippo-memory's "sleep" pass without the per-session machinery that makes it unscalable.
