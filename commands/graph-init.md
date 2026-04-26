---
description: Co-author a SCHEMA.md and bootstrap a memory-graph vault (project by default; --global for the machine-wide vault)
argument-hint: [--global]
---

Bootstrap a memory-graph vault. **Interactive — sit down with the user. Do not template.**

1. Parse `$ARGUMENTS`. If it contains `--global`, the target is `~/.memory-graph/global/`. Otherwise the target is `~/.memory-graph/<sanitized-cwd>/`, where the slug is the absolute cwd with `/` replaced by `-` (e.g. `/Users/x/Projects/foo` → `-Users-x-Projects-foo`).

2. If the target already contains a `SCHEMA.md`, stop and report its location. Do not overwrite. Suggest `/memory-graph:graph-status` instead.

3. Otherwise, **interview the user** before writing anything. Ask, one question at a time, in plain prose:
   - What's this vault for? (one-line scope: e.g. "research notes for the auth rewrite", "everything I read about ML training")
   - What kinds of sources will end up here? (papers, articles, transcripts, internal docs, code snippets, screenshots — pick what's actually expected)
   - What entity types matter? (people, companies, technologies, concepts, products, datasets — the user picks)
   - Any workflows that should run on every ingest? (e.g. "always extract one open question per paper", "tag every source with a confidence level", "if it's about a person, also update their `entities/people/<name>.md` timeline")
   - Anything else the wiki should always do or never do?

   Listen and reflect back briefly between questions. If the user gives short answers, don't push for length — the SCHEMA is meant to evolve, not be finished today.

4. Once you have their answers, write the vault:
   - `<vault-root>/raw/` (empty)
   - `<vault-root>/wiki/entities/` (empty)
   - `<vault-root>/wiki/concepts/` (empty)
   - `<vault-root>/wiki/sources/` (empty)
   - `<vault-root>/wiki/synthesis/` (empty)
   - `<vault-root>/wiki/index.md` — `# Index\n\n_Empty. First entry will appear here after the first ingest._\n`
   - `<vault-root>/wiki/log.md` — `# Log\n\n## [YYYY-MM-DD] init\nVault bootstrapped.\n`
   - `<vault-root>/SCHEMA.md` — see structure below.

5. The `SCHEMA.md` you write must contain, in this order:
   - **Scope** — the user's one-line answer to "what's this vault for".
   - **Source kinds** — list of source types the user mentioned, with the slug pattern for each.
   - **Page kinds** — at minimum `source`, `entity`, `concept`, `synthesis`. Add anything custom the user named (e.g. `decision`, `person`, `dataset`).
   - **Entity types** — the categories the user gave, each with the directory it lives in.
   - **Wikilink convention** — `[[wiki/<path>]]` for explicit, `[[<slug>]]` shorthand resolved against page kinds.
   - **Contradiction marker** — the `> ⚠ contradicted by [[sources/<slug>]]:` block; explain that contradictions must be surfaced, never silently rewritten.
   - **Log entry format** — `## [YYYY-MM-DD] <action> | <title>` where action ∈ `ingest, query, lint, archive, init`.
   - **Workflows** — the user's custom rules from question 4, written as imperatives ("After every ingest, ...").
   - **Co-evolve** — a closing paragraph explicitly inviting the user to come back and amend this file as the vault grows. End with: `_Last updated: YYYY-MM-DD by /memory-graph:graph-init._`

6. Report: vault path, what was created, and the first thing to try (`/memory-graph:graph-ingest <path>`).
