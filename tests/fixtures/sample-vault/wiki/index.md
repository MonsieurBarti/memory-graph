# Index

## Invariants
- Vault scope is the LLM-knowledge-base pattern. [[wiki/concepts/llm-knowledge-base]]
- Index-first retrieval is the perf contract; no embeddings in v1. [[wiki/concepts/index-first-retrieval]]

## ⚠ Open conflicts
- [[wiki/conflicts/embeddings-vs-index-first]] — between [[wiki/concepts/index-first-retrieval]] and [[wiki/entities/qmd]] — open since 2026-04-20

## Sources
- [[wiki/sources/llm-knowledge-bases]] — Karpathy's pattern for LLM-maintained knowledge wikis     (url, 2026-04-26)
- [[wiki/sources/qmd-readme]] — qmd local hybrid search engine for markdown     (url, 2026-04-22)

## Entities
- [[wiki/entities/andrej-karpathy]] — author of the LLM knowledge base pattern     {cites: sources/llm-knowledge-bases}
- [[wiki/entities/qmd]] — local hybrid search engine for markdown     {alternative-to: concepts/index-first-retrieval}

## Concepts
- [[wiki/concepts/llm-knowledge-base]] — three-layer pattern (raw/wiki/schema) with ingest/query/lint
- [[wiki/concepts/index-first-retrieval]] — query strategy: read index.md, drill into selected pages     {prerequisite-of: concepts/llm-knowledge-base}

## Synthesis
- [[wiki/synthesis/index-first-retrieval-scaling]] — when index-first stops working and what to switch to     {derived-from: concepts/index-first-retrieval, entities/qmd}

## Decisions
- [[wiki/decisions/markdown-only-v1]] — markdown-only plugin in v1, no code or MCP     (active, 2026-04-26)     {supersedes: decisions/embed-search-v1}

## Conflicts
- [[wiki/conflicts/embeddings-vs-index-first]] — index-first vs embeddings for query — status: open
