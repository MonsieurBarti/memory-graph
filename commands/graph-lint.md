---
description: Health-check the vault — orphans, broken links, contradictions, stale sources, missing pages (project by default; --global for the machine-wide vault)
argument-hint: [--global]
---

Lint the memory-graph vault.

1. Parse `$ARGUMENTS`. `--global` selects the global vault; otherwise the project vault.
2. Resolve the vault root:
   - project: `~/.memory-graph/<sanitized-cwd>/` (cwd with `/` → `-`)
   - global: `~/.memory-graph/global/`
   If `SCHEMA.md` is missing, stop.
3. Read `<vault-root>/SCHEMA.md` — it may declare custom page kinds or workflow rules that affect what counts as a violation.
4. Read the bundled skill at `skills/wiki/SKILL.md` — the "Lint" section and the worked lint example.
5. Execute the lint operation exactly as specified in the SKILL: run the seven checks in cheap-first order, stop before CONTRADICTION if 1–6 already produced ≥10 issues, assign sequential IDs (e.g. `BROKEN-LINK-1`), produce one markdown-table section per issue kind in severity order (errors first), close with a one-line `**Lint summary:**` and the health bucket.
6. Append a `lint` entry to `<vault-root>/wiki/log.md` with the counts and the health bucket. This is the only write lint performs.
7. **Do not auto-apply fixes.** Suggest them in the table; the user decides what to repair.

Heavy by design. Single explicit invocation, never automatic.
