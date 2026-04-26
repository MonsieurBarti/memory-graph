---
kind: concept
title: LLM Knowledge Base
sources: [sources/llm-knowledge-bases]
updatedAt: 2026-04-26
confidence: verified
halfLifeDays: 7
lastRetrieved: 2026-04-26
retrievalCount: 5
tags: []
---

# LLM Knowledge Base

A persistent, LLM-maintained wiki built on top of raw sources, with three layers (raw / wiki / schema) and three operations (ingest, query, lint). Counters the failure modes of pure RAG (re-derivation, no accumulation) and bag-of-facts memory (no structure, no cross-references).

## Key points
- Three layers: raw is immutable, wiki is LLM-owned, schema is co-evolved. [[wiki/sources/llm-knowledge-bases]]
- Three operations: ingest, query, lint. [[wiki/sources/llm-knowledge-bases]]
- The wiki compounds — every ingest strengthens existing pages or adds new ones. [[wiki/sources/llm-knowledge-bases]]

## Related
- [[wiki/concepts/index-first-retrieval]] — the query strategy this pattern relies on
- [[wiki/entities/andrej-karpathy]] — author of the pattern
