---
kind: decision
title: memory-graph v1 ships markdown-only — no code, no MCP, no embeddings
decidedAt: 2026-04-26
deciders: [tff]
supersedes: [decisions/embed-search-v1]
status: active
sources: [sources/llm-knowledge-bases]
confidence: verified
halfLifeDays: 90
lastRetrieved: 2026-04-26
retrievalCount: 4
tags: []
relatedPaths:
  - skills/wiki/SKILL.md
  - commands/
  - src/
---

# memory-graph v1 ships markdown-only — no code, no MCP, no embeddings

## Context
The sibling project `hippo-memory-pi` was archived because per-turn hooks, BM25+embedding scoring, and sleep-time consolidation didn't scale on large codebases. `memory-graph` is the replacement, and its v1 contract has to make perf-on-large-vaults a hard constraint, not an afterthought.

## Decision
v1 is a markdown-only Claude Code plugin (plus a thin pi-coding-agent wrapper). No embeddings, no BM25, no MCP server, no per-turn hooks. Retrieval is index-first: read `wiki/index.md`, drill into ≤10 pages.

## Reasoning
- Hippo's own perf history (see [[wiki/sources/llm-knowledge-bases]]) shows that every clever scoring multiplier is computed per-query against the full memory set — that's what makes the model unscalable.
- Index-first retrieval works at "moderate scale" without any of that machinery [[wiki/concepts/index-first-retrieval]].
- We can borrow hippo's *vocabulary* (decay metadata, confidence tiers, supersession) as YAML frontmatter the agent reasons about on read, without re-introducing the machinery.

## Alternatives considered
- Hybrid search via qmd in v1 — deferred to roadmap M7. Premature given the moderate-scale guarantee.
- MCP server for cross-tool reuse — deferred. Can be added without breaking the markdown contract.

## Consequences
- Every "make it more seamless" idea has to answer: does this run per-turn, per-session, or per-vault-write? If yes, it's the trap that got hippo archived.
- We can never claim parity with hippo's lifecycle features without re-evaluating perf.

## Revisit triggers
- If a single vault crosses ~500 pages and routine queries open >10 pages, revisit the qmd off-ramp.
- If users routinely want cross-tool memory sharing, reconsider MCP.
