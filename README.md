# memory-graph

Structured knowledge wiki on disk — an LLM-maintained, interlinked markdown vault that compounds over time instead of being re-derived on every query.

Dual-distributed: **Claude Code plugin** AND **pi-coding-agent extension** from one repo, sharing the same SKILL methodology and the same vaults on disk.

Implements the [Karpathy LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern.

## Why

Default LLM memory has two failure modes:

1. **RAG-only systems** rediscover knowledge from raw documents on every question. Nothing accumulates.
2. **Bag-of-facts memory** (Settings → Memory, flat `MEMORY.md` files) has no structure, no cross-references, and no notion of contradicting or superseding past entries.

`memory-graph` builds and maintains a *persistent, compounding artifact* — a wiki Claude owns and you read, sitting between you and your raw sources. New sources get integrated, not just indexed. Contradictions are flagged. Cross-references are maintained. The knowledge is compiled once and kept current.

## Two vaults

```
~/.memory-graph/
├── global/                              ← one per machine
│   └── {raw, wiki, SCHEMA.md}
└── <sanitized-cwd>/                     ← one per project
    └── {raw, wiki, SCHEMA.md}

~/.memory-graph-archive/                 ← snapshots, parallel tree
├── global/<label>-YYYYMMDD/
└── <sanitized-cwd>/<label>-YYYYMMDD/
```

Archives live in a parallel tree, deliberately outside the vault root, so no `ingest`/`query`/`lint` can reach them. Restore is a manual shell procedure (documented in the skill) rather than a slash command — it's rare and destructive enough that thinking is cheap insurance.

- **Global vault** — cross-cutting knowledge that lives with you, not the project: life themes, methodology, research spanning multiple projects, reusable mental models.
- **Project vault** — knowledge that belongs to a specific repo: domain context, third-party docs you've digested, architectural decisions, the people/systems you interact with on this codebase.

Slash commands default to the **project** vault. Pass `--global` to operate on the global vault instead. There is no auto-merge — if you want both, run two queries.

The project slug is derived from the current working directory using Claude Code's auto-memory convention (full path, `/` → `-`). So `~/Projects/foo/bar` lives at `~/.memory-graph/-Users-you-Projects-foo-bar/`.

## Vault layout

```
<vault-root>/
├── raw/          immutable source material — Claude reads, never writes
├── wiki/         Claude-owned, interlinked markdown — you read, Claude writes
│   ├── index.md  catalog, one line per page
│   ├── log.md    append-only chronological record
│   ├── entities/
│   ├── concepts/
│   ├── sources/  one summary page per ingested raw source
│   └── synthesis/ answers filed back from queries
└── SCHEMA.md     conventions + workflows, co-authored on init, co-evolved over time
```

`SCHEMA.md` is the configuration. It's not templated — `/memory-graph:graph-init` interviews you about your domain, source kinds, entity types, and workflows, then writes a starter you can keep evolving with Claude.

## Operations

Three core operations exposed as slash commands:

- **`/memory-graph:graph-ingest <path> [--global]`** — read a source, extract entities/concepts, write a summary page, update the index, touch related pages, append to the log.
- **`/memory-graph:graph-query <question> [--global]`** — read `index.md` first, drill into relevant pages, synthesize an answer with citations. File the answer back as a new wiki page if useful.
- **`/memory-graph:graph-lint [--global]`** — detect orphans, broken links, contradictions, stale sources, missing pages. Heavy — call deliberately.

Plus housekeeping:

- **`/memory-graph:graph-init [--global]`** — interactive co-authoring of SCHEMA.md and bootstrap of the vault.
- **`/memory-graph:graph-status`** — show stats for both vaults.
- **`/memory-graph:graph-archive [label] [--global|--all]`** — dated snapshot to a path Claude won't touch.

The methodology lives in the bundled skill (`skills/wiki/SKILL.md`) — Claude reads it whenever a task touches the vault.

## Perf contract

- **No per-turn hooks.** Pure markdown plugin. Nothing runs unless you call a slash command.
- **Index-first retrieval.** Query reads `wiki/index.md` (small, authoritative), then opens only the pages it actually needs. No vault scan, no embeddings.
- **Heavy ops are opt-in.** Lint, archive, full re-ingest — all explicit user actions, never automatic.

## Install

### Claude Code (plugin)

```bash
# from the marketplace
/plugin install the-forge-flow/memory-graph

# or pin to a local checkout
/plugin install /path/to/memory-graph
```

Then in any project:

```
/memory-graph:graph-init
```

### pi-coding-agent (extension)

```bash
# from npm
pi install npm:@the-forge-flow/memory-graph

# from a local checkout (no install — load directly each session)
pi -e /path/to/memory-graph
```

Use `pi -e` for local development; `pi install` for persistent installs. Either way, reload pi (`/reload`) when changing extensions, then use:

```
/graph-init
```

The same six slash commands work in both runtimes (`/graph-init`, `/graph-status`, `/graph-ingest`, `/graph-query`, `/graph-lint`, `/graph-archive`). Both runtimes load `skills/wiki/SKILL.md` — the methodology is identical. Vaults are stored at the same locations (`~/.memory-graph/<slug>/`), so a vault written from Claude Code is readable from pi and vice versa.

## Position vs. existing primitives

| Primitive | Lifetime | Owner | Best for |
|---|---|---|---|
| Settings → Memory (claude.ai) | session-spanning | claude.ai | preferences, role |
| `~/.claude/CLAUDE.md` | persistent | you | rules, conventions |
| Auto-memory (`~/.claude/projects/*/memory/`) | persistent, flat | Claude | accumulated learnings, no structure |
| **`memory-graph`** | **persistent, structured, compounding** | **Claude (wiki) + you (raw)** | **knowledge that needs synthesis, citation, and consistency** |

## Status

Skeleton — slash commands and skill drafted, not yet exercised against real vaults.

## Roadmap

- [ ] M1: bootstrap (`/graph-init` interactively co-authors SCHEMA, writes vault skeleton)
- [ ] M2: ingest pipeline against a single source
- [ ] M3: query pipeline with index-first retrieval
- [ ] M4: lint pass
- [ ] M5: archive helper for weekly snapshots
- [ ] M6: pi-coding-agent extension parity (same vaults, same skill)

## Layout

```
memory-graph/
├── .claude-plugin/plugin.json     # Claude Code plugin manifest
├── package.json                    # npm package — also declares pi.extensions and pi.skills
├── tsconfig.json
├── README.md
├── skills/wiki/SKILL.md            # SHARED — both runtimes load this methodology
├── commands/                       # Claude Code slash commands (markdown prompts)
│   ├── graph-init.md
│   ├── graph-status.md
│   ├── graph-ingest.md
│   ├── graph-query.md
│   ├── graph-lint.md
│   └── graph-archive.md
└── src/                            # pi extension (TypeScript, builds to dist/)
    ├── index.ts                    # default export factory; registers 6 commands
    ├── utils/vault-paths.ts        # vault path resolution (cwd-sanitized)
    └── commands/
        ├── types.ts                # local structural types (no pi peer-dep)
        ├── graph-init.ts
        ├── graph-status.ts         # does real file IO — vault stats without LLM round-trip
        ├── graph-ingest.ts
        ├── graph-query.ts
        ├── graph-lint.ts
        └── graph-archive.ts        # supports --list mode without LLM round-trip
```

The pi command handlers do deterministic prep (parse args, resolve vault paths, validate vault exists), then call `pi.sendUserMessage(directive)` — which immediately triggers the agent to act on the directive. The actual ingest/query/lint logic is LLM-driven via the shared SKILL, same as the Claude Code commands; the user doesn't need to type a follow-up message after the slash command. Two exceptions answer directly from file IO without an LLM round-trip: `/graph-status` (walks the wiki tree, counts pages by kind) and `/graph-archive --list` (`ls` over the archive tree).
