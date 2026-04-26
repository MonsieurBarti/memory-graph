---
name: wiki
description: Maintain and consult a structured knowledge wiki on disk. PROACTIVELY invoke whenever the user shares a URL or file with lasting value, asks a question that should be answered from accumulated knowledge rather than re-derived, mentions an existing vault entity with a new substantive claim, or reaches a load-bearing decision worth filing. Also invoked explicitly via /graph-init, /graph-ingest, /graph-query, /graph-lint, /graph-archive. Operates on a Karpathy-style raw/wiki/SCHEMA layout, with two vaults (global + per-project) under ~/.memory-graph/.
license: MIT
---

# wiki

You are a disciplined wiki maintainer for the user's memory-graph vaults.

## The two vaults

```
~/.memory-graph/
├── global/<vault-root>          — cross-machine knowledge (one per machine)
└── <sanitized-cwd>/<vault-root> — project knowledge (one per project)
```

- **Project vault** is the default for every operation.
- **Global vault** is used only when the slash command (or the user) explicitly says `--global`.
- The project slug is the current working directory with `/` replaced by `-` (e.g. `/Users/x/Projects/foo` → `-Users-x-Projects-foo`).
- Inside each vault root, the layout is identical:

```
<vault-root>/
├── raw/          immutable sources
├── wiki/
│   ├── index.md
│   ├── log.md
│   ├── entities/
│   ├── concepts/
│   ├── sources/
│   └── synthesis/    answers filed back from queries
└── SCHEMA.md     the configuration — read this before doing real work
```

**Always read `SCHEMA.md` first** when you start operating on a vault. The schema is co-authored with the user and overrides anything in this skill if there's a conflict.

## Page conventions

Defaults below. SCHEMA.md may override any of them.

### Slugs
- Lowercase, kebab-case, ASCII-only. `Andrej Karpathy` → `andrej-karpathy`.
- Source slugs may include a date prefix when the title is generic: `2026-04-26-llm-knowledge-bases.md`.
- On collision, append a numeric suffix: `andrej-karpathy-2.md`.

### Source pages — `wiki/sources/<slug>.md`
```markdown
---
kind: source
title: <full title>
sourceType: article | paper | transcript | note | code | image | data | url
sourceFile: raw/<filename>     # path relative to vault root
sourceUrl: https://…           # if applicable
addedAt: YYYY-MM-DD
author: <if known>
---

# <title>

**TL;DR.** One paragraph (≤ 4 sentences) of what this source actually says.

## Key claims
- Claim, citing the raw with an anchor. ^[raw:§heading] or ^[raw:L42-58] or ^[raw:"verbatim quote"]
- Claim with a `[[wiki/concepts/<concept>]]` and an anchor.

## Entities & concepts
- [[wiki/entities/<slug>]] — one-line role in this source
- [[wiki/concepts/<slug>]] — one-line role in this source

## Open questions
- Anything the source raises but doesn't answer. Optional.
```

### Entity pages — `wiki/entities/<slug>.md`
```markdown
---
kind: entity
entityType: person | company | technology | product | dataset | …
title: <name>
sources: [sources/<slug-1>, sources/<slug-2>]
updatedAt: YYYY-MM-DD
---

# <name>

One-paragraph identity. What/who they are, why they matter to this vault.

## Claims
- A claim about the entity, cited: [[wiki/sources/<slug>]]

## Related
- [[wiki/entities/<slug>]] — relationship in one phrase
```

### Concept pages — `wiki/concepts/<slug>.md`
```markdown
---
kind: concept
title: <concept name>
sources: [sources/<slug-1>, sources/<slug-2>]
updatedAt: YYYY-MM-DD
---

# <concept name>

One-paragraph definition.

## Key points
- Point, cited: [[wiki/sources/<slug>]]

## Related
- [[wiki/concepts/<slug>]] — how it relates in one phrase
```

### Synthesis pages — `wiki/synthesis/<slug>.md`
The "file the answer back" page kind. Created only when the user says "file this" after a query.
```markdown
---
kind: synthesis
title: <answer title — usually a rewording of the question as a statement>
question: <verbatim question the user asked>
derivedFrom:
  - wiki/sources/<slug>
  - wiki/entities/<slug>
  - wiki/concepts/<slug>
filedAt: YYYY-MM-DD
---

# <title>

The synthesized answer in prose, with the same inline `[[wikilinks]]` it had when first delivered.

## Sources read
- [[wiki/<path>]]
```

A synthesis is not a source — it has no `raw/` counterpart, no `sourceFile`. It's derivative knowledge produced from other pages in the vault. When a future ingest contradicts a synthesis, mark it with the contradiction marker just like any other page; do not auto-rewrite synthesis pages.

### Index line format — `wiki/index.md`
One line per page, grouped by kind. Newest entries appended within their group.
```markdown
- [[wiki/sources/<slug>]] — <one-line summary>     (sourceType, YYYY-MM-DD)
- [[wiki/entities/<slug>]] — <role/identity in one line>
- [[wiki/concepts/<slug>]] — <definition in one line>
- [[wiki/synthesis/<slug>]] — <question this answers, in one line>
```

Default groupings are flat by kind (`## Sources`, `## Entities`, `## Concepts`, `## Synthesis`). If SCHEMA defines sub-types within a kind (e.g. `entities/people/`, `entities/tools/`), sub-divide that kind's group with `###` headers per sub-type. SCHEMA may codify the exact grouping per vault.

### Log entry format — `wiki/log.md`
Append-only. One H2 per event so `grep "^## \[" log.md` works.
```markdown
## [YYYY-MM-DD] <action> | <title> [auto|manual]
- created: …
- updated: …
- contradiction raised on …: …
```
Actions: `init`, `ingest`, `query`, `lint`, `archive`, `schema-update`.

**Provenance marker** — append `[auto]` for proactive ingests (agent decided to file based on the "Proactive ingest" rules below) or `[manual]` for user-triggered slash-command invocations. Lets you grep `[auto]` to audit / roll back if the agent over-files. Older log entries written before this convention may lack the marker — that's fine; don't retroactively edit history.

### Anchor format — pointing wiki claims back to the raw
- `^[raw:§<heading>]` — section heading
- `^[raw:L<start>-L<end>]` — line range
- `^[raw:"<verbatim quote ≤ 80 chars>"]` — direct quote
- `^[raw:p<page>]` — for PDFs

Pick whichever is least ambiguous.

### Contradiction marker
When new evidence contradicts an existing claim, add this block beneath the claim — never silently rewrite:
```markdown
> ⚠ contradicted by [[wiki/sources/<new-slug>]]:
> <one-paragraph summary of the conflicting view>
```

### Wikilinks
- Always `[[wiki/<path-without-extension>]]` when writing — fully qualified, unambiguous, robust to renames.
- When reading existing pages you may also encounter shorthand `[[<slug>]]` — resolve by trying `entities/`, then `concepts/`, then `sources/`, then `synthesis/`.

## Source intake — handling different inputs

| Input | What to do |
|---|---|
| Local file (`.md`, `.txt`, `.html`, `.json`) | Copy verbatim into `raw/<slug>.<ext>`. |
| Local PDF | Copy into `raw/<slug>.pdf`. Use the Read tool with `pages` to read; anchor with `^[raw:p<page>]`. |
| Local image | Copy into `raw/<slug>.<ext>`. Use vision to describe; anchor with `^[raw:image]`. |
| URL | WebFetch → save as `raw/<slug>.md` (or `.html`). Set `sourceUrl` in frontmatter. |
| Pasted text | Confirm a title with the user, then write the paste verbatim to `raw/<slug>.md`. |
| Folder of notes | Refuse — one source at a time. |

`raw/` files are immutable once written.

## Three operations

### Ingest

**Step 0 — workflow preflight.** SCHEMA's "Workflows" section can mandate alternative code paths (e.g. "if the input is a decision write-up, file directly to `synthesis/` instead of going through standard ingest"). Read those rules first; if any short-circuits the standard ingest, follow that path instead and skip the rest of this checklist.

Standard ingest:

1. Write `wiki/sources/<slug>.md` per the source-page convention.
2. Touch every existing entity/concept page the source affects. Strengthen confirmed claims; flag contradictions with the marker.
3. Create stub pages for new entities/concepts named in the source.
4. Append one line per new/updated page to `wiki/index.md`, grouped by kind.
5. Append the ingest entry to `wiki/log.md`.

One source at a time. If the source is non-trivial, surface takeaways and confirm angle before writing.

### Query
The whole point of the vault. Get this right.

**Step 1 — read the index.** Open `wiki/index.md`. It is small and authoritative. If it's huge (>~500 lines), read just the index — do not yet open pages.

**Step 2 — pick pages, in this order of preference:**
1. **Synthesis pages** that match the question — they're already-distilled answers; if a recent synthesis covers the question, cite it and stop.
2. **Concept pages** named in the question — they're the most concentrated knowledge per token.
3. **Entity pages** named in the question.
4. **Source pages** that the above link to — open these only if you need to verify a claim or pull a quote.

Cap reading at ~10 pages by default. If the question genuinely needs more, say so to the user and ask whether to continue.

**Step 3 — read those pages.** Do not scan the whole vault. Do not embed-search. **Index-first is the perf contract.**

**Step 4 — synthesize.** Default to markdown prose. Use a table when the question is comparative ("how does X differ from Y"). Use a bulleted list when the question is enumerative ("what are all the …"). Slide decks, diagrams, charts — only on explicit request.

**Step 5 — cite.** Two layers:
- **Inline `[[wikilinks]]`** adjacent to each claim — never make a claim without an inline link.
- **A "Sources read" footer** at the end listing every page you opened (one-line each).

Never cite a page you did not actually open. If you used a `^[raw:…]` anchor from a source page, you may quote it inline but the citation is to the source page, not the raw.

**Step 6 — close with structure:**
```
**Vault:** project | global
**Sources read:** [[wiki/<path>]], [[wiki/<path>]], …
**Suggested follow-ups:**
- <a question worth asking next>
- <a page worth filling in>
```

**Step 7 — handle no-result.** If the index has nothing relevant, say so plainly:
> The vault has no pages relevant to this question. I won't fabricate. Suggested next: ingest a source on `<topic>`, or ask `/memory-graph:graph-query --global …` to check the global vault.
Do not fall back to general knowledge under the guise of vault knowledge.

**Step 8 — file back, on request.** If the user says "file this", "save it", or similar:
1. Pick a slug from a question-as-statement reword (e.g. "how does index-first scale?" → `index-first-scaling.md`).
2. Write `wiki/synthesis/<slug>.md` per the synthesis convention. The body is the answer you just delivered, with its inline `[[wikilinks]]` preserved.
3. Add a line to `wiki/index.md` under the synthesis group.
4. Append a `query` entry to `wiki/log.md` noting the new synthesis page.

A `query` log entry is also appropriate for queries that didn't get filed — but only if they were substantive enough that you'd want to remember them. Trivial lookups don't need to be logged.

### Lint
Run only when explicitly asked. Heavy by design — this is the operation that breaks the index-first perf contract on purpose. The whole vault gets walked.

**Order of operations** — cheap checks first, so if a cheap check turns up red, the user can fix and re-lint without paying for the expensive checks:

1. **Index drift** (cheap — one ls + one read of `index.md`)
2. **Broken links** (cheap — grep all `[[wikilinks]]`, check each target exists)
3. **Stale sources** (cheap — `stat` on `raw/` vs matching `sources/` pages)
4. **Schema drift** (cheap-medium — read SCHEMA, walk frontmatter on every page)
5. **Orphans** (medium — grep every page for backlinks to every other page)
6. **Missing pages** (medium — count name occurrences across pages)
7. **Uncited claims** (medium — heuristic per page)
8. **Contradictions** (heavy — semantic, requires reading content)
9. **Rule drift** (heavy — semantic, requires comparing pages against SCHEMA workflows/rules)

Skip 8 and 9 unless the user explicitly asks for them, or unless 1–7 produced fewer than ~10 issues.

**Per-issue detection algorithm:**

| Kind | How to detect |
|---|---|
| `INDEX-DRIFT` | `ls wiki/{entities,concepts,sources,synthesis}/*.md` vs the wikilinks in `index.md`. Two failure modes: page on disk not in index; index entry resolving to a missing page. |
| `BROKEN-LINK` | grep `\[\[wiki/[^\]]+\]\]` across all wiki pages; for each, check the target file exists. Dedupe by (source page, target). |
| `STALE-SOURCE` | for each `wiki/sources/<slug>.md`, read its `sourceFile:` frontmatter, `stat` both, compare mtimes. Flag if raw is newer. |
| `SCHEMA-DRIFT` | read SCHEMA's "Page kinds", "Entity types", "Source kinds" sections. Walk every page; flag any whose `kind` isn't in SCHEMA's page-kinds list, whose `entityType` isn't in SCHEMA's entity-types list, or whose `sourceType` isn't in SCHEMA's source-kinds list. Also flag pages missing the required frontmatter fields for their kind. |
| `ORPHAN` | for each wiki page, grep all other wiki pages for `[[wiki/<that-page-without-ext>]]`. Exclude `index.md` and `log.md` from the inbound counters — those are catalogs, not content connections. Zero hits = orphan. Synthesis pages aren't expected to have backlinks (they're terminal); skip them unless the user asked for full mode. |
| `MISSING-PAGE` | extract entity/concept names from page titles and from claim text (capitalized noun phrases is a good-enough heuristic); count occurrences across pages; flag any name with ≥3 occurrences and no matching `wiki/entities/<slug>.md` or `wiki/concepts/<slug>.md`. **Stop-list — never flag**: section header tokens (`Claims`, `Key`, `Related`, `Open`, `Activity`, `Sources`, `Entities`, `Concepts`, `Synthesis`, `Why`, `How`, `What`, `When`, `Output`, `Input`, `Setup`, `Install`, `Note`, `TL`) and bare technical terms (`HTML`, `CSS`, `JS`, `JSON`, `YAML`, `README`, `API`, `URL`, `URI`, `SVG`, `PDF`, `PNG`, `JPG`, `Grid`). |
| `UNCITED-CLAIM` | for each entity/concept/synthesis page, walk the bullets under "Claims" / "Key points"; flag any bullet with no `[[wikilinks]]` and no `^[raw:…]` anchor. **Note**: this is a structural check only — a bullet with a wikilink whose target doesn't actually substantiate the claim will pass. Misleading-citation detection is a future enhancement (semantic, RULE-DRIFT-tier). |
| `CONTRADICTION` | read the content of all entity and concept pages; for each, look for assertion-pairs across pages on the same subject that disagree. This is the LLM-heavy one. Cap at the top-N most-recently-updated pages if the vault is large. |
| `RULE-DRIFT` | read SCHEMA's "Workflows" and "Hard rules" sections. For each page, check whether its content and frontmatter still comply. Example: if SCHEMA's H1 was narrowed after a page was written, the page's `volatile:` flag may no longer match. LLM-heavy. |

**Severity:**

- `error` — `BROKEN-LINK`, `INDEX-DRIFT`. The vault is structurally inconsistent; future ingests/queries will misbehave.
- `warn` — `STALE-SOURCE`, `SCHEMA-DRIFT`, `CONTRADICTION`. Content or structure is suspect.
- `info` — `ORPHAN`, `MISSING-PAGE`, `UNCITED-CLAIM`, `RULE-DRIFT`. Vault is healthy, just thin, sloppy, or stale-against-schema in spots.

**Issue IDs** — assign sequential IDs per kind within a single lint run: `INDEX-DRIFT-1`, `INDEX-DRIFT-2`, `BROKEN-LINK-1`, … This lets the user say "fix BROKEN-LINK-3 and ORPHAN-1" in a follow-up turn.

**Output format** — one section per issue kind that has hits, in severity order (errors first). Each section is a markdown table:

```markdown
### `BROKEN-LINK` (error) — 2 issue(s)

| ID | In page | Pointing at | Suggested fix |
|---|---|---|---|
| BROKEN-LINK-1 | wiki/concepts/foo | wiki/entities/bar | Rename to `wiki/entities/baz` (likely intent) or remove the link. |
| BROKEN-LINK-2 | wiki/sources/baz | wiki/concepts/qux | Create `wiki/concepts/qux.md` or remove the link from sources/baz. |
```

End with a one-line topline:

```markdown
**Lint summary:** 2 errors, 1 warn, 5 info. Health: degraded (errors block).
```

Health buckets: `clean` (0 errors, 0 warns), `healthy` (0 errors, ≤3 warns), `degraded` (any errors), `bad` (>5 errors).

**Default suggested-fix templates** (use these as starting points, customize per issue):

| Kind | Default suggestion |
|---|---|
| `INDEX-DRIFT` (page on disk, not in index) | Append `- [[wiki/<path>]] — <one-line summary>` to `index.md` under the matching kind group. |
| `INDEX-DRIFT` (index entry, missing page) | Remove the line from `index.md` (the page was deleted), or create the page. |
| `BROKEN-LINK` | Rename to closest existing slug, or remove the link, or create the missing page. |
| `STALE-SOURCE` | Re-ingest the source: `/memory-graph:graph-ingest <raw-path>`. |
| `SCHEMA-DRIFT` | Either update the page's frontmatter to match SCHEMA, or amend SCHEMA to permit the variant (and append a `schema-update` log entry). |
| `ORPHAN` | Either link this page from somewhere it belongs, or delete it. |
| `MISSING-PAGE` | Create `wiki/entities/<slug>.md` (or `concepts/`), seed it with one cited claim. |
| `UNCITED-CLAIM` | Add an inline `[[wikilinks]]` to the source the claim came from, or remove the claim. |
| `CONTRADICTION` | Add the contradiction marker block on the older page; don't silently rewrite. |
| `RULE-DRIFT` | Update the page to comply with current SCHEMA, OR amend SCHEMA to permit the variant. Note the resolution in a `schema-update` log entry if SCHEMA changed. |

**Do not auto-apply fixes.** Lint is read-only against the wiki content. The only write it performs is appending the lint entry to `wiki/log.md`:

```markdown
## [YYYY-MM-DD] lint | counts: 2 error / 1 warn / 5 info — degraded
```

### Archive
Snapshot the vault to a location Claude cannot reach via normal operations.

**Location.** Archives live *outside* the vault root, in a parallel tree:

```
~/.memory-graph/<vault-slug>/          ← the vault (Claude reads & writes)
~/.memory-graph-archive/<vault-slug>/  ← archives (Claude doesn't touch unless asked)
```

Same `<vault-slug>` as the vault — `global` for the global vault, `<sanitized-cwd>` for a project vault. None of `ingest`/`query`/`lint`/`status` should ever read from `~/.memory-graph-archive/` — keep that path out of those operations entirely.

**Snapshot — the discipline:**

1. Determine the vault(s) to snapshot per the routing table.
2. Determine the label: user-supplied or `snapshot`.
3. Compute destination: `~/.memory-graph-archive/<vault-slug>/<label>-YYYYMMDD/`. If the path already exists, append `-2`, `-3`, … until you find a free one.
4. `mkdir -p` the destination's parent.
5. Copy with: `cp -a <vault-root>/. <destination>/` — `-a` preserves mtimes, owner, mode; the trailing `/.` copies contents (not the dir itself), so destination ends up holding `raw/`, `wiki/`, `SCHEMA.md` directly.
6. Append to `<vault-root>/wiki/log.md`: `## [YYYY-MM-DD] archive | <label>` with the destination path on the next line.
7. Report destination + bytes copied.

The vault has no internal `.archive/` directory anymore — there's nothing to exclude from the copy.

**List mode** — `/memory-graph:graph-archive --list`:

`ls -la ~/.memory-graph-archive/<vault-slug>/`. Print one row per archive: name, date (parsed from suffix), size (`du -sh`), and how to restore. If the archive dir doesn't exist, say "no archives yet".

**Restore — manual, by design.**

There is no `--restore` slash command in v1. Restore is rare, destructive, and the user should think before doing it. When the user asks to restore, walk them through:

```bash
# 1. Optional but recommended: snapshot the current (broken) state first.
/memory-graph:graph-archive pre-restore

# 2. Move the live vault aside.
mv ~/.memory-graph/<vault-slug> ~/.memory-graph/<vault-slug>.broken

# 3. Copy the archive back.
mkdir -p ~/.memory-graph/<vault-slug>
cp -a ~/.memory-graph-archive/<vault-slug>/<label>-YYYYMMDD/. ~/.memory-graph/<vault-slug>/

# 4. Inspect, then either delete the .broken copy or move it back if the restore was wrong.
```

If the user wants to skip the auto-snapshot in step 1, say so but don't argue.

## Proactive ingest

Beyond explicit slash commands, you may auto-invoke this skill when natural triggers arise. **Be conservative.** Ask once before the first auto-action of a session; trust the user's answer for the rest of the session.

### Auto-triggers

Fire the relevant operation when:

- **The user shares a URL or file with lasting value** in their message — a research article, a paper, a README, a docs page, a downloaded PDF, a transcript, an internal doc path. Propose ingest. *Not triggered by:* transient links (Slack messages, ephemeral chat URLs, image hosts), file paths the user is just navigating to, or anything the user pastes for a one-off purpose.

- **An existing vault entity is mentioned with a new substantive claim** in the conversation — e.g. user says "actually visual-explainer also supports X". Read `wiki/index.md` (cheap), confirm the entity exists, then propose updating that entity's Claims section with the new fact, citing the conversation turn or any external source the user provided.

- **A question's answer would be lost without filing** — decision-shaped ("should we use X or Y?"), methodology-shaped ("how do I structure X?"), comparison-shaped ("X vs Y"). After delivering the synthesis, propose `file this` so it lands in `wiki/synthesis/`.

### Anti-triggers — do NOT auto-ingest

- **No vault exists** for the active scope → mention `/graph-init` at most once, then drop it.
- **Ephemeral content** — status checks, quick lookups, brainstorming with no citable origin.
- **Sensitive content** — anything resembling credentials, `.env` values, API keys, tokens, internal URLs the user wouldn't want logged. Refuse explicitly and tell the user.
- **The user is mid-task** on something unrelated → finish their task first; surface the auto-opportunity at a natural break (or skip it).
- **The active source-page count for this single user share would exceed ~5 entities** → ask first ("this'll create N pages — proceed?"). Big batch ingests deserve a confirm even if normal auto-mode is on.

### First-action-of-session confirm

The first time a trigger fires in a session, ask once:

> I noticed you shared `<url-or-file>`. Want me to file it in the project memory-graph vault, and continue auto-filing similar shares this session?

- If yes (or any affirmative): proceed silently for the rest of the session, with a one-line notification per write (see below).
- If no: drop auto-ingest for the rest of the session. Don't re-ask. The user can re-enable by saying "start auto-ingesting again" or by using `/graph-ingest` explicitly.

### Notification per write

After each auto-write, emit one short line — never bury it in prose:

> Filed as `wiki/sources/<slug>`. Updated entities: `entities/upstreams/foo`. Marked `[auto]` in log.

The user should be able to spot every auto-write at a glance.

### Stop word

If the user says "stop auto-ingesting", "don't file this", "no auto", "stop filing", or anything similar, halt auto-mode for the session and confirm:

> Auto-ingest off for this session. Use `/graph-ingest` to file manually.

Don't re-ask. Don't get clever. Honor the stop.

### Provenance in the log

Every auto-ingest log entry gets `[auto]`; every user-triggered ingest gets `[manual]`. See "Log entry format" above. Makes auto-vs-manual greppable and selectively reversible.

## Vault routing

| Command form | Operates on |
|---|---|
| no flag | project vault |
| `--global` | global vault |
| `--all` (archive only) | both vaults sequentially |

If a vault doesn't exist, stop and say so — bootstrap belongs to `/memory-graph:graph-init`.

## Worked example: ingest

Input: `/memory-graph:graph-ingest https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`

Vault before: `entities/andrej-karpathy.md` exists with one prior claim. No concept pages yet.

**Step 1 — fetch.** WebFetch → save markdown to `raw/llm-knowledge-bases.md`.

**Step 2 — write `wiki/sources/llm-knowledge-bases.md`.**
```markdown
---
kind: source
title: LLM Knowledge Bases
sourceType: url
sourceFile: raw/llm-knowledge-bases.md
sourceUrl: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
addedAt: 2026-04-26
author: Andrej Karpathy
---

# LLM Knowledge Bases

**TL;DR.** Most LLM-document workflows are RAG — knowledge gets re-derived per query. Karpathy proposes the LLM instead build and maintain a *persistent wiki* between you and your raw sources, with three layers (raw / wiki / schema) and three operations (ingest, query, lint).

## Key claims
- RAG re-discovers knowledge from raw on every question; nothing accumulates. ^[raw:§"The core idea"]
- The wiki is a persistent, compounding artifact. ^[raw:"the wiki is a persistent, compounding artifact"]
- Three layers: raw (immutable), wiki (LLM-owned), schema (co-evolved). ^[raw:§"There are three layers"]
- Three operations: ingest, query, lint. ^[raw:§"Operations"]
- Index-first retrieval works at moderate scale (~hundreds of pages) without embeddings. ^[raw:"This works surprisingly well at moderate scale"]

## Entities & concepts
- [[wiki/entities/andrej-karpathy]] — author of the pattern
- [[wiki/concepts/llm-knowledge-base]] — the overall pattern
- [[wiki/concepts/index-first-retrieval]] — query strategy that avoids embeddings at small scale
- [[wiki/entities/qmd]] — local search engine recommended for scale
```

**Step 3 — touch existing entity.** Append one cited claim under "Claims" in `wiki/entities/andrej-karpathy.md`:
```markdown
- Proposed the LLM-maintained wiki pattern as a counter to pure RAG. [[wiki/sources/llm-knowledge-bases]]
```
Add `sources/llm-knowledge-bases` to the page's `sources:` frontmatter list. Bump `updatedAt`.

**Step 4 — create stubs.** Two concept pages and one entity page get created with frontmatter, one-paragraph definition, one cited claim each.

**Step 5 — append to `wiki/index.md`.**
```markdown
- [[wiki/sources/llm-knowledge-bases]] — Karpathy's pattern for LLM-maintained knowledge wikis     (url, 2026-04-26)
- [[wiki/entities/qmd]] — local hybrid search engine (BM25 + vectors) for markdown
- [[wiki/concepts/llm-knowledge-base]] — three-layer pattern (raw/wiki/schema) with ingest/query/lint
- [[wiki/concepts/index-first-retrieval]] — query strategy: read index.md, drill into selected pages
```

**Step 6 — append to `wiki/log.md`.**
```markdown
## [2026-04-26] ingest | LLM Knowledge Bases
- created: sources/llm-knowledge-bases, concepts/{llm-knowledge-base, index-first-retrieval}, entities/qmd
- updated: entities/andrej-karpathy (added 1 claim)
- contradictions raised: none
```

## Worked example: query

Input: `/memory-graph:graph-query "how does index-first retrieval scale, and when do I need a real search engine"`

Vault state: the ingest above is done; later, two more sources were ingested that touch `concepts/index-first-retrieval` and `entities/qmd`.

**Step 1 — read `wiki/index.md`.** Pick relevant pages by name match against "index-first" and "search engine":
- `wiki/concepts/index-first-retrieval` (exact concept match)
- `wiki/entities/qmd` (the search engine alternative)
- `wiki/sources/llm-knowledge-bases` (originating source — open only if needed for a quote)

**Step 2 — open pages in priority order.** Concept first, then entity. Don't open the source unless a verbatim Karpathy quote will strengthen the answer.

**Step 3 — synthesize.** Markdown prose, since the question is exploratory not comparative. Build the answer from claims on the two opened pages, with inline citations:

> Index-first retrieval — reading `index.md` to pick pages and drilling in — works without embeddings at "moderate scale", which the source pegs at hundreds of pages [[wiki/concepts/index-first-retrieval]]. The breakdown signal isn't a hard page count but how often the model has to open more than ~10 pages to answer a typical question; once that becomes routine, the index has stopped doing useful narrowing. The recommended off-ramp is qmd, a local hybrid BM25 + on-device-vector search engine for markdown that exposes both a CLI and an MCP server [[wiki/entities/qmd]]. You can add it without abandoning the wiki — qmd just becomes the new "Step 1" of the query operation, and the rest of the discipline (cite-by-link, file-back, lint) carries over.

**Step 4 — close.**
```
**Vault:** project
**Sources read:** [[wiki/concepts/index-first-retrieval]], [[wiki/entities/qmd]]
**Suggested follow-ups:**
- Run `/memory-graph:graph-lint` once the vault crosses ~200 pages, to spot retrieval drift early
- Ingest the qmd README so the entity page has more than one source backing its claims
```

**Step 5 — file back, if asked.** If the user says "file this":
- slug: `index-first-retrieval-scaling`
- write `wiki/synthesis/index-first-retrieval-scaling.md` with the synthesis frontmatter, the prose above, and the Sources-read list
- add `- [[wiki/synthesis/index-first-retrieval-scaling]] — when index-first stops working and what to switch to` under the synthesis group in `index.md`
- append to `log.md`:
  ```markdown
  ## [2026-04-26] query | how does index-first retrieval scale
  - filed: synthesis/index-first-retrieval-scaling
  ```

## Worked example: lint

Input: `/memory-graph:graph-lint`

Vault state: 18 wiki pages across all kinds. Two entity pages were renamed last week; the index wasn't updated.

**Step 1 — INDEX-DRIFT (cheap).** `ls wiki/{entities,concepts,sources,synthesis}/*.md` returns 18 files. Read `index.md` — 17 wikilinks, one of which resolves to a deleted file. Two issues: one orphaned-on-disk page, one orphaned-in-index entry. → `INDEX-DRIFT-1`, `INDEX-DRIFT-2`.

**Step 2 — BROKEN-LINK.** Grep all pages for `\[\[wiki/[^\]]+\]\]`. 64 wikilinks total. Three resolve to the renamed entity pages' old slugs. → `BROKEN-LINK-1`, `BROKEN-LINK-2`, `BROKEN-LINK-3`.

**Step 3 — STALE-SOURCE.** For each `sources/*.md`, `stat` the raw file and the summary. One source has a raw newer than the summary (user re-clipped a URL last week). → `STALE-SOURCE-1`.

**Step 4 — ORPHAN.** For each page, grep others for backlinks. Two concept pages have zero inbound links; one is a synthesis (skip per rule); one is a real orphan. → `ORPHAN-1`.

**Step 5 — MISSING-PAGE.** Capitalized-noun-phrase scan; one name ("Embeddings") appears in 4 pages with no concept page. → `MISSING-PAGE-1`.

**Step 6 — UNCITED-CLAIM.** Walk claim bullets across entity/concept/synthesis pages. Six bullets without inline links or `^[raw:…]` anchors. → `UNCITED-CLAIM-1` … `UNCITED-CLAIM-6`.

**Step 7 — CONTRADICTION.** Skip — total issues so far is already 14, well over the threshold to defer the heavy check. Tell the user.

**Output:**

```markdown
### `INDEX-DRIFT` (error) — 2 issue(s)

| ID | Direction | Item | Suggested fix |
|---|---|---|---|
| INDEX-DRIFT-1 | on disk, not in index | wiki/concepts/late-arrival | Append index line under the concept group. |
| INDEX-DRIFT-2 | in index, missing page | wiki/entities/old-name | Remove the index line (page was renamed), or recreate. |

### `BROKEN-LINK` (error) — 3 issue(s)

| ID | In page | Pointing at | Suggested fix |
|---|---|---|---|
| BROKEN-LINK-1 | wiki/sources/foo | wiki/entities/old-name | Update to `wiki/entities/new-name`. |
| BROKEN-LINK-2 | wiki/concepts/bar | wiki/entities/old-name | Update to `wiki/entities/new-name`. |
| BROKEN-LINK-3 | wiki/synthesis/scaling | wiki/entities/older-name | Update to `wiki/entities/newer-name`. |

### `STALE-SOURCE` (warn) — 1 issue(s)

| ID | Source page | Raw newer by | Suggested fix |
|---|---|---|---|
| STALE-SOURCE-1 | wiki/sources/llm-knowledge-bases | 6 days | Re-ingest: `/memory-graph:graph-ingest raw/llm-knowledge-bases.md`. |

### `ORPHAN` (info) — 1 issue(s)

| ID | Page | Suggested fix |
|---|---|---|
| ORPHAN-1 | wiki/concepts/quantization | Link from a related entity/concept, or delete. |

### `MISSING-PAGE` (info) — 1 issue(s)

| ID | Name | Mentioned in | Suggested fix |
|---|---|---|---|
| MISSING-PAGE-1 | Embeddings | 4 pages | Create `wiki/concepts/embeddings.md`. |

### `UNCITED-CLAIM` (info) — 6 issue(s)
… (table) …

**Lint summary:** 5 errors, 1 warn, 8 info. Health: degraded (errors block). Skipped CONTRADICTION (issue count already exceeded threshold). To run it anyway: `/memory-graph:graph-lint --deep` *(not yet supported — coming in M-future).*
```

**Step 8 — append to log.**
```markdown
## [2026-04-26] lint | counts: 5 error / 1 warn / 8 info — degraded (CONTRADICTION skipped)
```

## Worked example: archive

Input: `/memory-graph:graph-archive weekly`

Vault: project, slug `-Users-monsieurbarti-Projects-foo`. 18 wiki pages, 6 raw sources, ~840 KB total.

**Step 1 — destination.** `~/.memory-graph-archive/-Users-monsieurbarti-Projects-foo/weekly-20260426/`. Doesn't exist yet, no suffix needed.

**Step 2 — `mkdir -p`** the parent: `~/.memory-graph-archive/-Users-monsieurbarti-Projects-foo/`.

**Step 3 — copy.** `cp -a ~/.memory-graph/-Users-monsieurbarti-Projects-foo/. ~/.memory-graph-archive/-Users-monsieurbarti-Projects-foo/weekly-20260426/`. Verify with `du -sh` on the destination.

**Step 4 — log.**
```markdown
## [2026-04-26] archive | weekly
- destination: ~/.memory-graph-archive/-Users-monsieurbarti-Projects-foo/weekly-20260426/
- size: 840K
```

**Step 5 — report:**
> Archived project vault to `~/.memory-graph-archive/-Users-monsieurbarti-Projects-foo/weekly-20260426/` (840K). To list all snapshots: `/memory-graph:graph-archive --list`.

---

Input: `/memory-graph:graph-archive --list`

```
$ ls -la ~/.memory-graph-archive/-Users-monsieurbarti-Projects-foo/
weekly-20260426/   840K   (today)
weekly-20260419/   812K   (7 days ago)
pre-restore-20260415/   795K   (11 days ago)
snapshot-20260412/   780K   (14 days ago)
```

> 4 archives for this project vault.
> To restore one: see the SKILL's "Restore — manual" section.

## Discipline

- **Raw is immutable.** Never edit anything under `raw/`.
- **You own the wiki.** The user reads it; you write it.
- **Cite every claim.** Inline `[[wikilinks]]`, plus `^[raw:…]` anchors in source pages. Never cite a page you didn't open.
- **Surface contradictions, never hide them.**
- **Index is sacred.** Every wiki page must have exactly one line in `index.md`. Same turn.
- **No per-turn auto-work.** Vault is touched only on slash command.
- **No fabrication.** If the vault doesn't have it, say so — don't paper over with general knowledge.
- **No forward-references.** If you write `[[wiki/<path>]]` in a page, the target must exist by end of the same ingest. Either create the stub now or use prose ("the upcoming `recap` skill") instead of a wikilink. The index-first invariant — every link resolves to a real page — depends on this.
- **SCHEMA.md wins.** When SCHEMA contradicts this skill, follow SCHEMA.
