---
kind: synthesis
title: When index-first retrieval stops working and what to switch to
question: how does index-first retrieval scale, and when do I need a real search engine?
derivedFrom:
  - wiki/concepts/index-first-retrieval
  - wiki/entities/qmd
  - wiki/sources/llm-knowledge-bases
filedAt: 2026-04-25
confidence: observed
halfLifeDays: 7
lastRetrieved: 2026-04-25
retrievalCount: 1
tags: []
---

# When index-first retrieval stops working and what to switch to

Index-first retrieval — reading `index.md` to pick pages and drilling in — works without embeddings at "moderate scale", which the source pegs at hundreds of pages [[wiki/concepts/index-first-retrieval]]. The breakdown signal isn't a hard page count but how often the model has to open more than ~10 pages to answer a typical question; once that becomes routine, the index has stopped doing useful narrowing. The recommended off-ramp is qmd, a local hybrid BM25 + on-device-vector search engine for markdown that exposes both a CLI and an MCP server [[wiki/entities/qmd]]. You can add it without abandoning the wiki — qmd just becomes the new "Step 1" of the query operation, and the rest of the discipline (cite-by-link, file-back, lint) carries over.

## Sources read
- [[wiki/concepts/index-first-retrieval]]
- [[wiki/entities/qmd]]
- [[wiki/sources/llm-knowledge-bases]]
