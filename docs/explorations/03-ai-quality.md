# Exploration 3: AI Cost & Quality

## Status: In Progress (Phase 2 — Approach A)

## Approaches Planned

### Approach A: Baseline (Phase 2) — CURRENT

**Implementation:** Commit `6d497c3`

- Cost tracking via `AICallLog` table per AI call
- `aiCost` field aggregated on `Article` model
- Prompt templates versioned (v1) in `apps/api/src/modules/ai/prompt-templates/`

**Characteristics:**

- Zero optimization — every article triggers full pipeline
- Costs visible in dashboard UI
- No quality measurement yet

**Decision — evaluation framework deferred:**
Quality evaluation framework (manual rating) was originally planned for Phase 2.
Deferred to Phase 8 because:

- No ground truth data exists yet (app not used in production)
- Comparing v1 vs v2 prompts requires v2 to exist first
- Framework built before data = untestable framework

Will implement when: (a) v2 prompts are needed based on observed quality issues,
(b) enough processed articles exist to form a meaningful test set.

### Approach B: Deduplication (Phase 8) — PLANNED

- Content hash dedup: same article URL → skip re-processing
- Embedding cache: deterministic, cache forever

### Approach C: Layered Cache (Phase 8) — PLANNED

- Response caching for common prompt patterns
- Token counting before send

## References

- `docs/adr/0004-gemini-embeddings-over-openai.md`
- PRD Section 7 (AI Module)
