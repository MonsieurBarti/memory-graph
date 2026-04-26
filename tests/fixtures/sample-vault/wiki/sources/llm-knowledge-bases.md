---
kind: source
title: LLM Knowledge Bases
sourceType: url
sourceFile: raw/llm-knowledge-bases.md
sourceUrl: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
addedAt: 2026-04-26
author: Andrej Karpathy
confidence: observed
halfLifeDays: 30
lastRetrieved: 2026-04-26
retrievalCount: 3
tags: []
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

## Open questions
- What's the empirical breakdown point? The source says "moderate scale" but doesn't quantify.
