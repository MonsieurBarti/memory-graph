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
   - Are there any vault-wide invariants the agent should treat as load-bearing context on every query? (e.g. "scope is X", "we use Y not Z", "decisions are owned by team T".) These seed an `## Invariants` section at the top of `wiki/index.md`. Optional — leave empty if nothing comes to mind.
   - Anything else the wiki should always do or never do?

   Listen and reflect back briefly between questions. If the user gives short answers, don't push for length — the SCHEMA is meant to evolve, not be finished today.

   **All optional features are enabled by default** — decay metadata + confidence tiers, decision + conflict page kinds, related-paths + git-aware consolidation. They cost nothing on a vault that doesn't use them (an empty `wiki/decisions/` is just an empty directory; pages without `relatedPaths` are simply ignored by the git-aware sweep). If the user explicitly says they want a feature off — e.g. "I don't want decay tracking, this is a stable reference vault" — honor that and omit the corresponding SCHEMA section. Otherwise, ship with everything on; the user can edit `SCHEMA.md` later to disable any feature by removing its section.

4. Once you have their answers, write the vault. Create all six page-kind directories by default; if the user opted out of `decision` or `conflict`, skip that directory and omit its kind from SCHEMA's "Page kinds" section.
   - `<vault-root>/raw/` (empty)
   - `<vault-root>/wiki/entities/` (empty)
   - `<vault-root>/wiki/concepts/` (empty)
   - `<vault-root>/wiki/sources/` (empty)
   - `<vault-root>/wiki/synthesis/` (empty)
   - `<vault-root>/wiki/decisions/` (empty) — *unless the user opted out*
   - `<vault-root>/wiki/conflicts/` (empty) — *unless the user opted out*
   - `<vault-root>/wiki/index.md` — start with `# Index\n\n` followed by an `## Invariants` section seeded with the user's answers (one bullet per invariant, citing the relevant verified page if it exists, otherwise leaving the citation as a placeholder). If the user gave no invariants, omit the section. End with `_Empty. First entry will appear here after the first ingest._\n`.
   - `<vault-root>/wiki/log.md` — `# Log\n\n## [YYYY-MM-DD] init\nVault bootstrapped.\n`
   - `<vault-root>/SCHEMA.md` — see structure below.

5. The `SCHEMA.md` you write must contain, in this order. **All feature sections are included by default**; omit a section only when the user explicitly opted out during the interview.
   - **Scope** — the user's one-line answer to "what's this vault for".
   - **Source kinds** — list of source types the user mentioned, with the slug pattern for each.
   - **Page kinds** — `source`, `entity`, `concept`, `synthesis`, `decision`, `conflict` by default (each gets its own `wiki/<kind>s/` directory and template — see SKILL). Drop `decision` and/or `conflict` only if the user opted out. Add anything else custom the user named (e.g. `person`, `dataset`).
   - **Entity types** — the categories the user gave, each with the directory it lives in.
   - **Wikilink convention** — `[[wiki/<path>]]` for explicit, `[[<slug>]]` shorthand resolved against page kinds.
   - **Contradiction marker** — the `> ⚠ contradicted by [[sources/<slug>]]:` block; explain that contradictions must be surfaced, never silently rewritten.
   - **Log entry format** — `## [YYYY-MM-DD] <action> | <title>` where action ∈ `ingest, query, lint, archive, consolidate, init`.
   - **Workflows** — the user's custom rules from question 4, written as imperatives ("After every ingest, ...").
   - **Confidence tiers** — `verified | observed | inferred | stale`. Default `observed`. `verified` pages never go stale. `inferred` claims must be phrased as such ("appears to", "consistent with"). *Omit this section only if the user explicitly opted out of freshness tracking.*
   - **Half-lives** — Default per-kind: `source` 30d, `entity` 7d, `concept` 7d, `synthesis` 7d, `decision` 90d, `conflict` 7d. Pages tagged `error` auto-bump to 30d. SCHEMA may set a vault-wide override. *Omit this section only if the user explicitly opted out of freshness tracking.*
   - **Related paths** — Entity / concept / decision / conflict pages may carry `relatedPaths: [...]` listing the file paths a page is "about." Trailing-slash entries match a directory and its descendants; glob patterns work per shell semantics. Enables git-aware consolidation in `/graph-consolidate` and the `RELATEDPATHS-MISSING` lint check. Default code-path regex catches `src/`, `lib/`, `tests/`, `app/`, `pages/`, `components/`, `hooks/`, `utils/`, `services/`, `api/`. *Omit this section only if the user explicitly opted out (e.g. pure-research vault that won't link to code).*
   - **Co-evolve** — a closing paragraph explicitly inviting the user to come back and amend this file as the vault grows. End with: `_Last updated: YYYY-MM-DD by /memory-graph:graph-init._`

6. Report: vault path, what was created, and the first thing to try (`/memory-graph:graph-ingest <path>`).
