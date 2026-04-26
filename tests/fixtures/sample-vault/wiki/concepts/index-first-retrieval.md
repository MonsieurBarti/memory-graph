---
kind: concept
title: Index-First Retrieval
sources: [sources/llm-knowledge-bases, sources/qmd-readme]
updatedAt: 2026-04-22
confidence: verified
halfLifeDays: 7
lastRetrieved: 2026-04-26
retrievalCount: 8
tags: []
---

# Index-First Retrieval

Query strategy where the agent reads `wiki/index.md` first to pick relevant pages, then drills into a small number (≤10) of those pages. Avoids embeddings and full-vault scans by trusting the hand-curated index as the navigation primitive.

## Key points
- Reads `wiki/index.md` then a capped set of selected pages — never scans the whole vault. [[wiki/sources/llm-knowledge-bases]]
- Inferred: works without embeddings up to "moderate scale" (~hundreds of pages); breakdown signal is when answers routinely require >10 page reads. [[wiki/sources/llm-knowledge-bases]]
- qmd is the recommended off-ramp when index-first stops scaling. [[wiki/sources/qmd-readme]]

## Related
- [[wiki/entities/qmd]] — alternative for larger vaults
- [[wiki/concepts/llm-knowledge-base]] — the broader pattern this serves
