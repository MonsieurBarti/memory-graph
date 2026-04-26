# Fixture vaults

Hand-built vaults used to manually smoke-test memory-graph commands. Not run by vitest — these are reference vaults for humans (and future AI sessions) to exercise the plugin end-to-end without polluting `~/.memory-graph/`.

## How to use

```bash
# Copy fixture into your real vault location for a temporary smoke session.
slug=$(pwd | tr / -)
mkdir -p ~/.memory-graph-test/"$slug"
cp -a tests/fixtures/sample-vault/. ~/.memory-graph-test/"$slug"/

# Point the slash commands at it (the plugin reads ~/.memory-graph/<slug>/, so
# you'll need to either temporarily relocate ~/.memory-graph/ or test from a
# cwd whose sanitized slug matches one in the fixture).
```

## What `sample-vault/` contains

A small but complete vault exercising every page kind shipped through Phases 1–5:

- 2 sources, 2 entities, 2 concepts, 1 synthesis, 1 decision, 1 conflict (with `status: open`).
- An `## Invariants` section in `wiki/index.md` (Phase 4 feature).
- A `## ⚠ Open conflicts` section mirroring the open conflict (Phase 2 + Phase 4).
- Decay metadata (`confidence`, `halfLifeDays`, `lastRetrieved`, `retrievalCount`) on a representative sample of pages — Phase 1.
- Typed-edge `{edge-type: target}` suffixes on a few index lines — Phase 4.
- `supersedes` / `supersededBy` linkage on the decision pair — Phase 2.
- `wiki/log.md` with init + ingest + query entries reflecting the page set.

## Scenarios this fixture supports

| To test | Run |
|---|---|
| `/graph-status` reports correct counts | `/memory-graph:graph-status` |
| `/graph-lint` finds zero issues on a clean vault | `/memory-graph:graph-lint` |
| `/graph-query` traverses typed edges + invariants | `/memory-graph:graph-query "how does index-first scale"` |
| `/graph-consolidate` surfaces the open conflict | `/memory-graph:graph-consolidate` |
| Confidence-aware synthesis qualifies inferred claims | `/memory-graph:graph-query "what is qmd"` |

## Adding a new fixture

For a regression scenario (e.g. "vault with broken supersession" to verify Phase 3 lint), add a sibling directory `tests/fixtures/<scenario-name>-vault/` and document it in this README. Keep each fixture small — one or two pages per scenario, not a comprehensive vault.
