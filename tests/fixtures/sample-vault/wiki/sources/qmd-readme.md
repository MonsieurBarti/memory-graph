---
kind: source
title: qmd — Local Hybrid Search Engine for Markdown
sourceType: url
sourceFile: raw/qmd-readme.md
sourceUrl: https://example.invalid/qmd
addedAt: 2026-04-22
confidence: observed
halfLifeDays: 30
lastRetrieved: 2026-04-22
retrievalCount: 1
tags: []
---

# qmd — Local Hybrid Search Engine for Markdown

**TL;DR.** A local search engine for markdown vaults. Combines BM25 keyword scoring with on-device vector similarity. Exposes both a CLI and an MCP server, designed to be the "Step 1" replacement when index-first retrieval stops scaling.

## Key claims
- BM25 + on-device vectors run fully local; no cloud required. ^[raw:§"Local-first"]
- CLI and MCP server are first-class. ^[raw:§"Surfaces"]
- Designed for markdown-native vaults; treats files as the source of truth. ^[raw:"files as the source of truth"]

## Entities & concepts
- [[wiki/entities/qmd]] — the tool itself
- [[wiki/concepts/index-first-retrieval]] — what qmd replaces at scale

## Open questions
- At what page count does qmd's overhead beat naive index-first retrieval?
