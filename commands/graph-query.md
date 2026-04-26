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
   If `SCHEMA.md` is missing, stop and tell the user: "No `<project|global>` vault yet. Run `/memory-graph:graph-init` to bootstrap one (or `/memory-graph:graph-init --global` for the machine-wide vault), then re-run this query."
3. **Read `<vault-root>/SCHEMA.md`** for page kinds and any custom query workflows.
4. Read the bundled skill at `skills/wiki/SKILL.md` for the query discipline, page-selection order, citation format, and the worked query example.
5. Execute the query operation exactly as specified in the SKILL's "Query" section: read `index.md` (including any `## ⚠ Open conflicts` and `## Invariants` top sections), pick pages in synthesis → concept → entity → decision → source order, traverse typed-edge `{edge-type: target}` suffixes for ≤3 extra pages on comparative/traversal-shaped questions, cap at ~10 pages by default, read only those, synthesize with inline `[[wikilinks]]` and confidence-aware framing (qualify `inferred`/`stale` claims, lead with `verified`), close with the structured Vault / Sources read / Suggested follow-ups footer.

   *If SCHEMA enabled decay metadata:* after delivering the synthesis, bump `lastRetrieved` to today and increment `retrievalCount` on the frontmatter of every page actually cited (not opened-but-uncited). One Edit per cited page; cap is the same ~10 pages.
6. **No fabrication policy.** If the index has no relevant pages, say so plainly — do not fall back to general knowledge under the guise of vault knowledge.
7. If the user follows up with "file this", "save it", or similar, write the answer to `<vault-root>/wiki/synthesis/<slug>.md`, update `index.md`, and append a `query` entry to `log.md` per the SKILL's file-back rules.

If the user wants both vaults consulted, they run two queries — one with `--global`, one without. Don't auto-merge.
