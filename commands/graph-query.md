---
description: Ask a question against the memory-graph vault — index-first retrieval with citations (project by default; --global for the machine-wide vault)
argument-hint: <question> [--global]
---

Answer the question in `$ARGUMENTS` using the vault.

1. Parse `$ARGUMENTS`:
   - extract `--global` if present (else target is the project vault)
   - the remaining text is the question
2. Resolve the vault root:
   - project: `~/.memory-graph/<sanitized-cwd>/` (cwd with `/` → `-`)
   - global: `~/.memory-graph/global/`
   If `SCHEMA.md` is missing, stop and say which vault is uninitialized.
3. **Read `<vault-root>/SCHEMA.md`** for page kinds and any custom query workflows.
4. Read the bundled skill at `skills/wiki/SKILL.md` for the query discipline, page-selection order, citation format, and the worked query example.
5. Execute the query operation exactly as specified in the SKILL's "Query" section: read `index.md`, pick pages in synthesis → concept → entity → source order, cap at ~10 pages by default, read only those, synthesize with inline `[[wikilinks]]`, close with the structured Vault / Sources read / Suggested follow-ups footer.
6. **No fabrication policy.** If the index has no relevant pages, say so plainly — do not fall back to general knowledge under the guise of vault knowledge.
7. If the user follows up with "file this", "save it", or similar, write the answer to `<vault-root>/wiki/synthesis/<slug>.md`, update `index.md`, and append a `query` entry to `log.md` per the SKILL's file-back rules.

If the user wants both vaults consulted, they run two queries — one with `--global`, one without. Don't auto-merge.
