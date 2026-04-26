---
description: Snapshot a vault to ~/.memory-graph-archive/ (project by default; --global for machine-wide; --all for both). --list to see existing snapshots.
argument-hint: [label] [--global|--all] | --list [--global]
---

Archive the current vault state, or list existing archives.

1. Parse `$ARGUMENTS`:
   - `--list` → list mode (no snapshot taken)
   - `--all` → target both vaults (snapshot mode only)
   - `--global` → target the global vault
   - any other token → the snapshot label (default: `snapshot`)
2. Read the bundled skill at `skills/wiki/SKILL.md` — the "Archive" section and the worked archive example.
3. Resolve vault slug(s):
   - project: `<sanitized-cwd>` (cwd with `/` → `-`)
   - global: `global`
   - `--all`: both
4. **Snapshot mode** (default). For each target vault:
   - vault root: `~/.memory-graph/<slug>/`
   - if no `SCHEMA.md` there, skip with: "No `<slug>` vault to archive — run `/memory-graph:graph-init` (or `--global`) to bootstrap one first." Continue to the next target if `--all`.
   - destination: `~/.memory-graph-archive/<slug>/<label>-YYYYMMDD/` — append `-2`, `-3`, … if it exists
   - `mkdir -p` the parent
   - `cp -a <vault-root>/. <destination>/` (trailing `/.` copies contents, preserves mtimes)
   - append a `## [YYYY-MM-DD] archive | <label>` entry to `<vault-root>/wiki/log.md` with the destination path
   - report destination + bytes copied (`du -sh <destination>`)
5. **List mode** (`--list`). For each target vault (or just the project vault if no flag):
   - `ls -la ~/.memory-graph-archive/<slug>/`
   - print one row per archive: name, parsed date, size
   - if the archive dir doesn't exist, say "no archives yet for this vault"
   - end with: "to restore one, see the SKILL's `Restore — manual` section"

**Restore is intentionally not a flag here.** It's rare and destructive — see the SKILL's "Restore — manual" section for the shell procedure.
