---
description: Ingest a raw source into the memory-graph vault (project by default; --global for the machine-wide vault). Accepts a file path or URL.
argument-hint: <path-or-url> [--global]
---

Ingest the source described in `$ARGUMENTS` into the wiki.

1. Parse `$ARGUMENTS`:
   - extract `--global` if present (else target is the project vault)
   - the remaining token is the **input** — either a file path or a URL
2. Resolve the vault root:
   - project: `~/.memory-graph/<sanitized-cwd>/` (cwd with `/` → `-`)
   - global: `~/.memory-graph/global/`
   If `SCHEMA.md` is missing, stop and tell the user to run `/memory-graph:graph-init` (with `--global` if applicable).
3. **Read `<vault-root>/SCHEMA.md` before doing anything else.** It overrides this command if it specifies different page kinds, slug patterns, frontmatter fields, or workflows.
4. Read the bundled skill at `skills/wiki/SKILL.md` for the ingest discipline, page conventions, and the worked example.
5. Bring the input into `<vault-root>/raw/`:
   - File path → copy into `raw/<slug>.<ext>` per the SKILL's "Source intake" table.
   - URL → WebFetch → save the result as `raw/<slug>.md` (markdown if convertible) or `raw/<slug>.html`.
   - PDF → copy as-is; later steps use the Read tool's `pages` param.
   - Image → copy as-is; later steps use vision.
   - Folder → refuse, ask the user to ingest one source at a time.
   Compute the slug per SCHEMA's convention.
6. Read the source end-to-end. If it's non-trivial (>~2000 words, dense, or seems likely to contradict existing pages), surface the key takeaways to the user and confirm the angle before writing the wiki pages.
7. Execute the ingest pass exactly as in the SKILL's "Worked example": write `sources/<slug>.md`, touch affected entity/concept pages, create stub pages for new entities/concepts, update `index.md`, append to `log.md`.
8. **If a contradiction was raised** and SCHEMA enables the `conflict` page kind, *propose* a `wiki/conflicts/<slug>.md` page to the user. Do not auto-write it. If the user confirms, write it and add a line to `## ⚠ Open conflicts` and `## Conflicts` in `index.md`. If the user declines, the inline `> ⚠ contradicted by` marker stays as the only record.
9. Run any custom workflows SCHEMA's "Workflows" section requires (e.g. "extract one open question per paper").
10. Report: vault used, pages created, pages updated, contradictions raised, conflict-page proposals (accepted/declined). Suggest a useful follow-up.
