# ADR-0004: Use Gemini text-embedding-004 Instead of OpenAI for Embeddings

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** Đạt
**Context:** Phase 2, AI Pipeline setup

## Context

PRD originally specified OpenAI text-embedding-3-small for vector embeddings.
During Phase 2 setup, the requirement to add billing credentials to OpenAI
conflicts with Rule #5 (free tier only for MVP). While the per-token cost is
negligible (~$0.001 for 100 articles), requiring a credit card creates a
hard blocker for zero-cost operation.

Google's text-embedding-004 model is available under the same free-tier
API key as Gemini Flash, with no billing requirement.

## Decision

Replace OpenAI text-embedding-3-small with Google text-embedding-004 for
all vector embeddings in KnowVault MVP.

## Alternatives Considered

### Alternative A: OpenAI text-embedding-3-small (original PRD spec)

- Pros: 1536 dimensions (higher expressiveness), widely used
- Cons: Requires credit card even on free tier; violates Rule #5

### Alternative B: Google text-embedding-004 (chosen)

- Pros: Free tier (same key as Gemini), no billing required, good multilingual quality
- Cons: 768 dimensions vs 1536 (lower expressiveness); less documented in community

### Alternative C: Groq (considered, rejected)

- Pros: Very fast inference
- Cons: No embedding support; would require a third provider for embeddings

## Consequences

- Prisma schema: `vector(1536)` → `vector(768)` in ArticleChunk, Concept, Note models
- `openai.provider.ts` replaced by `gemini-embedding.provider.ts`
- Single API key for all AI operations (simplification)
- Future exploration: OpenAI or Groq providers can be added as Exploration approaches
  without touching processor code (provider abstraction handles this)

## References

- PRD Section 7.2 — AI Provider Abstraction
- Rule #5 — Free tier only for MVP
