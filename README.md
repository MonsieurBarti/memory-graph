<div align="center">
  <img src="https://raw.githubusercontent.com/MonsieurBarti/The-Forge-Flow-CC/refs/heads/main/assets/forge-banner.png" alt="The Forge Flow - memory-graph" width="100%">

  <h1>🧠 memory-graph</h1>

  <p>
    <strong>Structured knowledge wiki on disk: LLM-maintained interlinked markdown vault that compounds over time — for both Claude Code and PI coding agent</strong>
  </p>

  <p>
    <a href="https://github.com/MonsieurBarti/memory-graph/actions/workflows/ci.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/MonsieurBarti/memory-graph/ci.yml?label=CI&style=flat-square" alt="CI Status">
    </a>
    <a href="https://www.npmjs.com/package/@the-forge-flow/memory-graph">
      <img src="https://img.shields.io/npm/v/@the-forge-flow/memory-graph?style=flat-square" alt="npm version">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/github/license/MonsieurBarti/memory-graph?style=flat-square" alt="License">
    </a>
  </p>
</div>

---

Implements the [Karpathy LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern. Default LLM memory has two failure modes:

1. **RAG-only systems** rediscover knowledge from raw documents on every question. Nothing accumulates.
2. **Bag-of-facts memory** (Settings → Memory, flat `MEMORY.md` files) has no structure, no cross-references, no notion of contradicting or superseding past entries.

`memory-graph` builds and maintains a _persistent, compounding artifact_ — a wiki the agent owns and you read, sitting between you and your raw sources. New sources get integrated, not just indexed. Contradictions are flagged. Cross-references are maintained. The knowledge is compiled once and kept current.

## ✨ Features

- **🧬 Karpathy three-layer architecture** — `raw/` (immutable sources), `wiki/` (LLM-owned interlinked markdown), `SCHEMA.md` (co-evolved configuration)
- **🗂️ Two vaults** — per-project (`~/.memory-graph/<sanitized-cwd>/`) and global (`~/.memory-graph/global/`); identical layout; no auto-merge
- **🪜 Co-authored SCHEMA** — `/graph-init` interviews you on scope, source kinds, entity types, workflows, and hard rules, then writes a personalized SCHEMA.md (not a template)
- **🔗 Index-first retrieval** — query reads `wiki/index.md` first, drills into selected pages, never scans the whole vault, never embed-searches; the perf contract is non-negotiable
- **📝 Proactive auto-ingest** — files URL/file shares, entity updates, and decision-shaped answers automatically (first-confirm-then-trust per session, `[auto]` / `[manual]` log marker for selective rollback)
- **🔍 9-check lint** — orphans, broken links, contradictions, stale sources, schema-drift, rule-drift, missing pages, uncited claims, index-drift; stable issue IDs; no auto-apply
- **📦 Archive snapshots** — `cp -a` to a parallel tree outside the vault root (`~/.memory-graph-archive/`); restore is manual by design
- **🤖 Dual distribution** — Claude Code plugin AND PI extension from the same repo, sharing one SKILL methodology and the same vaults on disk

## 🗄️ Two vaults

```
~/.memory-graph/
├── global/                              ← one per machine, cross-project knowledge
│   └── {raw, wiki, SCHEMA.md}
└── <sanitized-cwd>/                     ← one per project (cwd with `/` → `-`)
    └── {raw, wiki, SCHEMA.md}

~/.memory-graph-archive/                 ← snapshots, parallel tree outside vault
├── global/<label>-YYYYMMDD/
└── <sanitized-cwd>/<label>-YYYYMMDD/
```

Inside each vault root:

```
<vault-root>/
├── raw/          immutable source material — agent reads, never writes
├── wiki/         agent-owned interlinked markdown — you read, agent writes
│   ├── index.md  catalog, one line per page
│   ├── log.md    append-only chronological record
│   ├── entities/
│   ├── concepts/
│   ├── sources/
│   └── synthesis/
└── SCHEMA.md     conventions + workflows, co-authored on init
```

Slash commands default to the **project** vault. Pass `--global` to operate on the global vault. Archives live outside the vault root so `ingest` / `query` / `lint` can't reach them; restore is a manual shell procedure.

## 🛠️ Operations

Three core operations from Karpathy's pattern, exposed as both Claude Code slash commands and pi commands:

| Operation | What it does |
|---|---|
| **ingest** | Read a raw source, extract entities/concepts, write a summary page, update affected entity/concept pages, refresh the index, append to the log |
| **query** | Read `index.md` first, drill into the minimum set of relevant pages, synthesize an answer with `[[wikilinks]]` as citations; optionally file the answer back as a synthesis page |
| **lint** | 9-check health pass: orphans, broken links, contradictions, stale sources, schema-drift, rule-drift, missing pages, uncited claims, index-drift; report with stable issue IDs; no auto-apply |

Plus housekeeping: `init` (interactive vault bootstrap), `status` (vault stats from disk), `archive` (snapshot to parallel tree).

## 📦 Installation

### Claude Code (plugin)

```bash
/plugin marketplace add MonsieurBarti/memory-graph
/plugin install memory-graph
```

Plugin commands are namespaced as `/memory-graph:graph-*`.

### PI coding agent (extension)

**From npm:**

```bash
pi install npm:@the-forge-flow/memory-graph
```

**From GitHub (tracks `main`):**

```bash
pi install git:github.com/MonsieurBarti/memory-graph
```

**From a local checkout (no install — load each session):**

```bash
pi -e /path/to/memory-graph
```

Then reload pi with `/reload`.

## 🎯 Commands

Seven slash commands, identical surface across both runtimes:

| Command | Purpose |
|---|---|
| `graph-init [--global]` | Bootstrap a vault interactively (co-author SCHEMA.md) |
| `graph-status` | Show stats for both vaults (page counts, last log entries) |
| `graph-ingest <path-or-url> [--global]` | Ingest a source per the wiki SKILL's procedure |
| `graph-query <question> [--global]` | Index-first retrieval with citations; optionally `file this` |
| `graph-lint [--global]` | Run the cheap-first lint pass (up to 13 checks; depends on enabled SCHEMA features) |
| `graph-consolidate [--global]` | Stale-page sweep + near-duplicate sweep + open-conflict roll-up (report-only) |
| `graph-archive [label] [--global \| --all]` | Snapshot to parallel tree; `--list` shows existing snapshots |

The `wiki` skill auto-fires beyond explicit commands too — see "Proactive ingest" inside the SKILL for triggers, anti-triggers, and the first-confirm-then-trust flow.

## 🆚 Position vs. existing primitives

| Primitive | Lifetime | Owner | Best for |
|---|---|---|---|
| Settings → Memory (claude.ai) | session-spanning | claude.ai | preferences, role |
| `~/.claude/CLAUDE.md` | persistent | you | rules, conventions |
| Auto-memory (`~/.claude/projects/*/memory/`) | persistent, flat | Claude | accumulated learnings, no structure |
| **`memory-graph`** | **persistent, structured, compounding** | **agent (wiki) + you (raw)** | **knowledge that needs synthesis, citation, and consistency** |

## ⚡ Perf contract

- **No per-turn hooks.** Pure markdown SKILL + thin command handlers. Nothing runs unless you call a slash command or the proactive triggers fire on a real share.
- **Index-first retrieval.** Query opens `index.md` (small, authoritative), then opens only the pages it actually needs.
- **Heavy ops are opt-in.** Lint, archive, full re-ingest — explicit user actions, never automatic.

## 🪶 Status

Skeleton — six commands, the SKILL methodology with proactive ingest discipline, dual-distribution toolchain. Validated end-to-end against a real vault (the lumen-tracking one used during the dogfood).

## 🗺️ Roadmap

- [ ] M7: hybrid search via [`qmd`](https://github.com/karpathy/qmd) (BM25 + on-device vectors) when index-first breaks past ~hundreds of pages
- [ ] M8: visualization — render the wiki graph as an HTML view via [`@the-forge-flow/lumen`](https://github.com/MonsieurBarti/lumen)
- [ ] M9: misleading-citation detection in lint (semantic CONTRADICTION-tier check — wikilink resolves but source doesn't substantiate the claim)
- [ ] M10: deferred-entities registry so MISSING-PAGE doesn't keep flagging known-deferred names

## 🧪 Development

```bash
# Install dependencies
bun install

# Build (copies skills/ → dist/skills, then tsc)
bun run build

# Watch mode
bun run dev

# Lint & format (biome)
bun run lint
bun run lint:fix

# Type check
bun run typecheck

# Tests
bun run test
bun run test:watch
bun run test:coverage
```

Lefthook runs lint + typecheck + test on pre-commit and validates conventional-commit format on commit-msg. Set up with `bun run prepare` after first clone.

## 📁 Project structure

```
memory-graph/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code plugin manifest
│   └── marketplace.json         # Claude Code marketplace listing
├── skills/                       # Shared SKILL methodology (loaded by both runtimes)
│   └── wiki/SKILL.md
├── commands/                     # Claude Code slash commands (markdown prompt templates)
│   ├── graph-init.md
│   ├── graph-status.md
│   ├── graph-ingest.md
│   ├── graph-query.md
│   ├── graph-lint.md
│   └── graph-archive.md
├── src/                          # PI extension (TypeScript)
│   ├── index.ts                  # Default export factory; registers 6 commands
│   ├── utils/
│   │   ├── vault-paths.ts        # Vault path resolution (cwd-sanitized)
│   │   └── send-directive.ts     # Wraps pi.sendUserMessage with steer/idle handling
│   └── commands/
│       ├── types.ts              # Local structural types (no pi peer-dep)
│       ├── graph-init.ts         # Triggers interactive interview via sendUserMessage
│       ├── graph-status.ts       # Direct file IO — no LLM round-trip
│       ├── graph-ingest.ts
│       ├── graph-query.ts
│       ├── graph-lint.ts
│       └── graph-archive.ts      # --list mode short-circuits LLM; snapshot uses sendUserMessage
└── tests/                        # Vitest specs (placeholder; passWithNoTests)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit with conventional commits (`git commit -m "feat: add something"`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📜 License

MIT © [The Forge Flow](https://github.com/MonsieurBarti)

---

<div align="center">
  <sub>Built with ⚡ by <a href="https://github.com/MonsieurBarti">MonsieurBarti</a></sub>
</div>
