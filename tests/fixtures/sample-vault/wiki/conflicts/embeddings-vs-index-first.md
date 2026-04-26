---
kind: conflict
title: Embeddings vs index-first as the primary retrieval primitive
between: [wiki/concepts/index-first-retrieval, wiki/entities/qmd]
status: open
raisedAt: 2026-04-20
confidence: observed
halfLifeDays: 7
lastRetrieved: 2026-04-20
retrievalCount: 0
tags: []
---

# Embeddings vs index-first as the primary retrieval primitive

## The contradiction
The Karpathy source ([[wiki/sources/llm-knowledge-bases]]) frames index-first as sufficient at moderate scale; the qmd README ([[wiki/sources/qmd-readme]]) frames hybrid BM25+vector as the "real" answer because index-first inevitably degrades.

## Evidence
- A says: index-first works at moderate scale without embeddings; "this works surprisingly well at moderate scale". [[wiki/sources/llm-knowledge-bases]] ^[raw:"This works surprisingly well at moderate scale"]
- B says: as vaults grow, manually-curated index-first retrieval breaks down; hybrid scoring is the durable answer. [[wiki/sources/qmd-readme]] ^[raw:§"Why hybrid"]

## Status
Open. Both sources are sincere; the disagreement is about the breakdown threshold and whether to design around it preemptively.

Resolved by `decisions/markdown-only-v1` for v1 (deferred), but the underlying empirical question stays open — accept both as true in different vault-size regimes.
