# SCHEMA

## Scope
Reference fixture for the memory-graph plugin — exercises every page kind and every Phase 1–5 feature in a single small vault.

## Source kinds
- `article` — slug: `<topic-slug>`
- `url` — slug: `<topic-slug>` (date-prefix if generic)

## Page kinds
- `source` — `wiki/sources/<slug>.md`
- `entity` — `wiki/entities/<slug>.md`
- `concept` — `wiki/concepts/<slug>.md`
- `synthesis` — `wiki/synthesis/<slug>.md`
- `decision` — `wiki/decisions/<slug>.md`
- `conflict` — `wiki/conflicts/<slug>.md`

## Entity types
- `person` — `wiki/entities/`
- `tool` — `wiki/entities/`

## Wikilink convention
- Explicit: `[[wiki/<path-without-extension>]]`
- Shorthand: `[[<slug>]]` resolved against page kinds

## Confidence tiers
`verified | observed | inferred | stale`. Default `observed`. `verified` pages never go stale. `inferred` claims must be phrased as such.

## Half-lives
- `source` 30d, `entity` 7d, `concept` 7d, `synthesis` 7d, `decision` 90d, `conflict` 7d.
- Pages tagged `error` auto-bump to 30d.

## Contradiction marker
```markdown
> ⚠ contradicted by [[wiki/sources/<slug>]]:
> <one-paragraph summary>
```
Recurring contradictions promote to `wiki/conflicts/<slug>.md`.

## Log entry format
`## [YYYY-MM-DD] <action> | <title> [auto|manual]` where action ∈ `init, ingest, query, lint, archive, consolidate, schema-update`.

## Workflows
- After every ingest, update `## Invariants` if the new claim is `verified`.
- Conflicts open against an `entity` of `entityType: tool` are higher priority than concept-level conflicts.

## Co-evolve
Amend this file as the fixture grows. Add new scenarios as sibling fixture directories rather than overloading this one.

_Last updated: 2026-04-26 by /memory-graph:graph-init._
