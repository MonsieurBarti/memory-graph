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
   - Should pages track freshness (last retrieved, half-life, confidence tiers)? Optional — useful for vaults where information goes out of date (research, infra), less useful for stable reference vaults. If no, skip; if yes, the SCHEMA gets a "Confidence tiers" and "Half-lives" section.
   - Do you want first-class `decision` and `conflict` page kinds? Useful for engineering vaults (decisions live in `wiki/decisions/` with reasoning + alternatives + consequences; conflicts surface contradictions as navigable pages with an `## ⚠ Open conflicts` mirror at the top of the index). Probably overkill for pure research vaults.
   - Are there any vault-wide invariants the agent should treat as load-bearing context on every query? (e.g. "scope is X", "we use Y not Z", "decisions are owned by team T".) These seed an `## Invariants` section at the top of `wiki/index.md`. Optional — leave empty if nothing comes to mind.
   - Is this a coding-shaped vault? If yes, pages can carry an optional `relatedPaths:` frontmatter listing the file paths each page is "about." Enables git-aware consolidation: when you run `/graph-consolidate` inside a git repo, it surfaces pages whose `relatedPaths` overlap with files changed since the last consolidate — never auto-mutates, just suggests re-verification. Skip if this is a pure research / non-code vault.
   - Anything else the wiki should always do or never do?

   Listen and reflect back briefly between questions. If the user gives short answers, don't push for length — the SCHEMA is meant to evolve, not be finished today.

4. Once you have their answers, write the vault:
   - `<vault-root>/raw/` (empty)
   - `<vault-root>/wiki/entities/` (empty)
   - `<vault-root>/wiki/concepts/` (empty)
   - `<vault-root>/wiki/sources/` (empty)
   - `<vault-root>/wiki/synthesis/` (empty)
   - `<vault-root>/wiki/decisions/` (empty) — only if the user opted into the `decision` kind
   - `<vault-root>/wiki/conflicts/` (empty) — only if the user opted into the `conflict` kind
   - `<vault-root>/wiki/index.md` — start with `# Index\n\n` followed by an `## Invariants` section seeded with the user's answers (one bullet per invariant, citing the relevant verified page if it exists, otherwise leaving the citation as a placeholder). If the user gave no invariants, omit the section. End with `_Empty. First entry will appear here after the first ingest._\n`.
   - `<vault-root>/wiki/log.md` — `# Log\n\n## [YYYY-MM-DD] init\nVault bootstrapped.\n`
   - `<vault-root>/SCHEMA.md` — see structure below.

5. The `SCHEMA.md` you write must contain, in this order:
   - **Scope** — the user's one-line answer to "what's this vault for".
   - **Source kinds** — list of source types the user mentioned, with the slug pattern for each.
   - **Page kinds** — at minimum `source`, `entity`, `concept`, `synthesis`. Add `decision` and/or `conflict` if the user opted in (each gets its own `wiki/<kind>s/` directory and its own template — see SKILL). Add anything else custom the user named (e.g. `person`, `dataset`).
   - **Entity types** — the categories the user gave, each with the directory it lives in.
   - **Wikilink convention** — `[[wiki/<path>]]` for explicit, `[[<slug>]]` shorthand resolved against page kinds.
   - **Contradiction marker** — the `> ⚠ contradicted by [[sources/<slug>]]:` block; explain that contradictions must be surfaced, never silently rewritten.
   - **Log entry format** — `## [YYYY-MM-DD] <action> | <title>` where action ∈ `ingest, query, lint, archive, init`.
   - **Workflows** — the user's custom rules from question 4, written as imperatives ("After every ingest, ...").
   - **Confidence tiers** — *only if the user opted into freshness tracking.* `verified | observed | inferred | stale`. Default `observed`. `verified` pages never go stale. `inferred` claims must be phrased as such ("appears to", "consistent with").
   - **Half-lives** — *only if the user opted into freshness tracking.* Default per-kind: `source` 30d, `entity` 7d, `concept` 7d, `synthesis` 7d. Pages tagged `error` auto-bump to 30d. SCHEMA may set a vault-wide override.
   - **Related paths** — *only if the user opted into coding-shaped vault.* Entity / concept / decision / conflict pages may carry `relatedPaths: [...]` listing the file paths a page is "about." Trailing-slash entries match a directory and its descendants; glob patterns work per shell semantics. Enables git-aware consolidation in `/graph-consolidate` and the `RELATEDPATHS-MISSING` lint check. Optional code-path regex extension for the lint check goes here too — default pattern catches `src/`, `lib/`, `tests/`, `app/`, `pages/`, `components/`, `hooks/`, `utils/`, `services/`, `api/`.
   - **Co-evolve** — a closing paragraph explicitly inviting the user to come back and amend this file as the vault grows. End with: `_Last updated: YYYY-MM-DD by /memory-graph:graph-init._`

6. Report: vault path, what was created, and the first thing to try (`/memory-graph:graph-ingest <path>`).
