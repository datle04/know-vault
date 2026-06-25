# Skills Evidence Mapping

> **Purpose:** This document maps each engineering skill claimed in my CV and portfolio to specific evidence in this codebase. If you're a recruiter or engineer evaluating my work, this is your guide to "show me the code."
>
> **Status:** Living document. Updated as features are implemented.
> **Last updated:** [Will be updated each phase]

---

## How to read this document

For each skill, you'll find:

- **Evidence locations** — Specific files, folders, or commits
- **What to look for** — Concrete things demonstrating the skill
- **Related documents** — ADRs, postmortems, or explorations that elaborate

If a skill is listed but evidence shows "⏳ Planned for Phase X", that means I'm being honest about what isn't built yet rather than overclaiming.

---

## Category 1: Backend Engineering

### Skill: Domain-Driven Design (DDD)

**Status:** ✅ Evidenced (Phase 1) — entities, value objects, domain events, invariants

**Evidence locations:**

- `apps/api/src/domain/` — Pure domain layer with no framework dependencies
- `apps/api/src/domain/article/article.entity.ts` — Aggregate root with invariants and domain events
- `apps/api/src/domain/review/sm2.service.ts` — Domain service with pure business logic
- `apps/api/src/domain/shared/domain-event.ts` — Domain event infrastructure

**What to look for:**

- `article.entity.ts` — `markAsProcessing()` throws if not PENDING (invariant enforcement)
- `pullEvents()` pattern — clears array after return (prevents double-dispatch)
- `ArticleUrl.create()` vs `reconstitute()` — two factory methods with different semantics
- `article-status.vo.ts` — static singletons, private constructor, equality by value
- Zero `@Injectable()` decorators in `apps/api/src/domain/` (verified)
- Zero Prisma imports in `apps/api/src/domain/` (verified)

**Related ADRs:**

- `docs/adr/0001-initial-stack-choices.md` — Stack rationale including NestJS (DDD-friendly module system)
- `docs/adr/0003-vitest-over-jest.md` — Testing framework for domain layer tests

---

### Skill: REST API Design with NestJS

**Status:** ✅ Evidenced (Phase 1)

**Evidence locations:**

- `apps/api/src/modules/` — Feature modules organized by domain
- `apps/api/src/modules/articles/articles.controller.ts` — Example RESTful controller
- `apps/api/src/common/decorators/current-user.decorator.ts` — Custom decorator
- `apps/api/src/common/filters/http-exception.filter.ts` — Global exception handling
- `apps/api/src/common/pipes/validation.pipe.ts` — Input validation

**What to look for:**

- Consistent REST conventions (GET/POST/PATCH/DELETE)
- Thin controllers, business logic in services
- DTOs with class-validator at every endpoint
- Global ValidationPipe with whitelist + forbidNonWhitelisted
- HTTP status codes used correctly
- Error responses formatted consistently
- userId always from JWT via @CurrentUser() — never from request body.

---

### Skill: Authentication & JWT Implementation

**Status:** ✅ Evidenced (Phase 1)

**Evidence locations:**

- `apps/api/src/modules/auth/` — Auth module
- `apps/api/src/modules/auth/auth.service.ts` — Login, register, refresh logic
- `apps/api/src/modules/auth/strategies/jwt.strategy.ts` — Passport strategy
- `apps/api/src/common/guards/jwt-auth.guard.ts` — Global guard

**What to look for:**

- Dual token system (access + refresh)
- Refresh token rotation (each use invalidates old token)
- Refresh tokens hashed in database, not stored plaintext
- HttpOnly cookies for refresh tokens
- bcrypt with 12 salt rounds
- Generic 401 messages (no info leak about user existence)
- Tests covering refresh rotation edge cases

**Related ADRs:**

- `docs/adr/0007-jwt-vs-session-auth.md` — Auth strategy decision ⏳

---

### Skill: Background Job Processing with BullMQ

**Status:** ⏳ Evolution across Phases 1, 2, 7

**Evidence locations (after Phase 7):**

- `apps/api/src/modules/jobs/` — All queue processors
- `apps/api/src/infrastructure/queue/` — BullMQ setup
- `apps/api/src/modules/jobs/article-processing.processor.ts` — Main pipeline
- `docs/runbooks/queue-operations.md` — Operational guide ⏳

**What to look for:**

- Exponential backoff retry strategies
- Dead letter queue for failed jobs
- Job progress tracking with `updateProgress()`
- Worker concurrency control
- Idempotency keys for at-least-once delivery
- BullMQ board integration for monitoring

**Multi-perspective evidence:**

- `docs/explorations/02-background-processing.md` ⏳ — Sync vs fire-and-forget vs BullMQ comparison
- Git history showing evolution across phases

---

### Skill: Database Design & Optimization (PostgreSQL)

**Status:** 🟡 Partially evidenced (Phase 1 — schema + migrations; optimization in Phase 9)

**Evidence locations:**

- `apps/api/prisma/schema.prisma` — Complete schema with indexes
- `apps/api/prisma/migrations/` — Migration history showing schema evolution
- `apps/api/src/infrastructure/persistence/` — Repository implementations
- `docs/performance/database-benchmarks.md` ⏳ — Before/after query optimization

**What to look for:**

- Composite indexes on `(userId, timestampField)` patterns
- Strategic use of `select` to avoid over-fetching
- Eager loading with `include` to prevent N+1
- Use of `findUnique` over `findFirst` where appropriate
- Migration safety (backward compatible, no destructive changes)
- pgvector extension for semantic search
- Materialized views for analytics aggregations

**Related ADRs:**

- `docs/adr/0010-indexing-strategy.md` ⏳ — Index decisions with EXPLAIN data
- `docs/adr/0015-materialized-views.md` ⏳ — When to use materialized views
- `docs/adr/0002-local-development-strategy.md` — Migration safety workflow (dev → test → main)

---

## Category 2: AI & Machine Learning Engineering

### Skill: RAG (Retrieval-Augmented Generation)

**Status:** ⏳ Core feature, Phases 2, 6, 8

**Evidence locations:**

- `apps/api/src/modules/ai/` — Complete AI module
- `apps/api/src/modules/ai/providers/` — Provider abstractions
- `apps/api/src/modules/search/` — Hybrid search implementation
- `apps/api/src/modules/articles/article-chunking.service.ts` — Chunking strategy

**What to look for:**

- Semantic chunking strategy (not naive character splits)
- Embedding pipeline with deterministic caching
- Hybrid search combining BM25 + vector similarity
- Reciprocal Rank Fusion for result merging
- Cross-encoder reranking for top-K results
- Context injection into LLM prompts with citations

**Multi-perspective evidence:**

- `docs/explorations/01-search.md` ⏳ — Three search approaches compared with benchmarks

---

### Skill: Vector Search (pgvector)

**Status:** ⏳ Planned for Phase 6

**Evidence locations:**

- `apps/api/prisma/schema.prisma` — Vector columns with `vector(1536)` type
- `apps/api/src/modules/search/semantic-search.service.ts` ⏳
- `apps/api/prisma/migrations/` — Migration adding pgvector extension
- `docs/performance/vector-search-benchmarks.md` ⏳

**What to look for:**

- pgvector extension enabled correctly
- Use of `<=>` operator for cosine distance
- IVFFlat or HNSW index configuration
- Embedding dimension matched to model (1536 for OpenAI text-embedding-3-small)
- Query patterns: WHERE userId AND ORDER BY embedding distance
- Cache hit ratio tracking for embeddings

---

### Skill: Prompt Engineering & Versioning

**Status:** ⏳ Planned for Phase 2, iterated throughout

**Evidence locations:**

- `apps/api/src/modules/ai/prompt-templates/` — All prompts as versioned code
- `apps/api/src/modules/ai/prompt-templates/extract-concepts.v1.ts`
- `apps/api/src/modules/ai/prompt-templates/extract-concepts.v2.ts` — Iteration after evaluation
- `apps/api/src/modules/ai/evaluation/` — AI quality evaluation framework

**What to look for:**

- Prompts stored as code with version tracking
- Each version preserved (no in-place edits)
- Structured prompt templates with system/user separation
- Few-shot examples in advanced prompts
- JSON schema enforcement for structured outputs
- Output parsers handling LLM response variations
- Evaluation framework comparing prompt versions

**Related explorations:**

- `docs/explorations/03-ai-quality.md` ⏳ — Quality evaluation across prompt versions

---

### Skill: AI Cost Optimization

**Status:** ⏳ Multi-phase, peaks at Phase 8

**Evidence locations:**

- `apps/api/src/modules/ai/cost-tracking/` ⏳
- `apps/api/src/modules/ai/cache/` ⏳ — Multi-layer caching
- `docs/performance/ai-cost-benchmarks.md` ⏳

**What to look for:**

- Cost tracked per call in `AICallLog` table
- Content hash for deduplication (same article URL → reuse processing)
- Permanent embedding cache (deterministic given input)
- Response caching for common prompt patterns
- Batch processing where API supports it
- Token counting before sending requests
- Cost dashboards showing optimization impact

**Multi-perspective evidence:**

- `docs/explorations/03-ai-quality.md` ⏳ — Cost vs quality trade-offs documented

---

### Skill: Multi-Provider AI Architecture

**Status:** ⏳ Planned for Phase 2

**Evidence locations:**

- `apps/api/src/modules/ai/providers/ai-provider.interface.ts` — Provider abstraction
- `apps/api/src/modules/ai/providers/gemini.provider.ts` — Gemini implementation
- `apps/api/src/modules/ai/providers/openai.provider.ts` — OpenAI implementation
- `apps/api/src/modules/ai/ai-orchestrator.service.ts` — Routes calls per operation

**What to look for:**

- Clean interface independent of any specific provider
- Easy to add new providers (Claude, local models) without changing consumers
- Configuration-driven provider selection
- Consistent error handling across providers
- Cost tracking abstracted to provider level

---

## Category 3: Testing & Quality

### Skill: Property-Based Testing

**Status:** ⏳ Planned for Phase 1, expanded in Phase 4

**Evidence locations:**

- `apps/api/src/domain/review/sm2.service.spec.ts` ⏳ — SM-2 algorithm tests
- `apps/api/src/domain/concept/knowledge-graph.service.spec.ts` ⏳

**What to look for:**

- Use of `fast-check` library
- Generators for domain types (quality, easiness, intervals)
- Properties verified for all valid inputs (not just examples)
- Shrinking to minimal failing case when tests fail
- Bugs caught by property tests that example tests missed

**Example property:**

```typescript
// Always-true property: SM-2 never produces interval < 1
fc.assert(
  fc.property(/* generators */, (input) => {
    expect(calculateSM2(input).interval).toBeGreaterThanOrEqual(1);
  })
);
```

---

### Skill: Integration Testing with Testcontainers

**Status:** ⏳ Planned for Phase 1

**Evidence locations:**

- `apps/api/test/integration/` — All integration tests
- `apps/api/test/setup/testcontainers.ts` — Container management
- `apps/api/test/integration/articles.integration-spec.ts` ⏳

**What to look for:**

- Real PostgreSQL containers, not mocks
- Real Redis containers for queue tests
- Container cleanup between tests
- Realistic test data setup
- Tests for cross-user data isolation (security-critical)

---

### Skill: E2E Testing with Playwright

**Status:** ⏳ Planned for Phase 4+

**Evidence locations:**

- `apps/web/e2e/` ⏳
- `apps/web/e2e/critical-flows/save-and-review.spec.ts` ⏳

**What to look for:**

- Page Object pattern for maintainability
- Tests focused on critical flows only (not exhaustive coverage)
- Visual regression where appropriate
- Network interception for AI calls (tests stable without spending API quota)
- Accessibility checks integrated

---

### Skill: Mutation Testing

**Status:** ⏳ Planned for Phase 5+

**Evidence locations:**

- `stryker.conf.json` ⏳
- `docs/performance/mutation-testing-report.md` ⏳

**What to look for:**

- Stryker configuration for domain layer
- Mutation score reports
- Tests improved after mutation testing revealed gaps
- Documented in commits: "test: improve coverage for X after mutation testing"

---

### Skill: AI Output Quality Evaluation

**Status:** ⏳ Planned for Phase 2

**Evidence locations:**

- `apps/api/src/modules/ai/evaluation/` ⏳
- `apps/api/test/ai-quality/` ⏳ — Test set with ground truth
- `docs/explorations/03-ai-quality.md` ⏳

**What to look for:**

- Manual rating workflow for AI outputs
- Test set of articles with manually-labeled ideal outputs
- Automated regression testing for prompt changes
- LLM-as-judge evaluation for subjective qualities
- Quality metrics tracked over time per prompt version

---

## Category 4: Security

### Skill: OWASP Top 10 Application

**Status:** ⏳ Concentrated in Phase 11, baseline from Day 1

**Evidence locations:**

- `docs/security/owasp-audit.md` ⏳ — Item-by-item verification
- `docs/security/threat-model.md` ⏳ — STRIDE analysis
- `apps/api/src/common/guards/` — Access control implementations
- `.github/workflows/security.yml` ⏳ — Automated scanning

**What to look for (per OWASP item):**

| OWASP Item                     | Evidence                                                           |
| ------------------------------ | ------------------------------------------------------------------ |
| A01: Broken Access Control     | `IsOwnerGuard`, integration tests verifying user isolation         |
| A02: Cryptographic Failures    | bcrypt for passwords, JWT secrets in env, TLS enforcement          |
| A03: Injection                 | Prisma parameterized queries, XSS protection in markdown rendering |
| A04: Insecure Design           | Threat model docs, security ADRs                                   |
| A05: Security Misconfiguration | Helmet headers, CORS whitelist, secure cookie flags                |
| A06: Vulnerable Components     | Dependabot, npm audit in CI, Snyk integration                      |
| A07: Authentication Failures   | JWT rotation, rate limiting on auth, account lockout               |
| A08: Data Integrity Failures   | AI call logs immutable, audit trail for sensitive changes          |
| A09: Logging Failures          | Structured logging, PII redaction                                  |
| A10: SSRF                      | URL validation for article fetching, allowlist patterns            |

---

### Skill: Threat Modeling (STRIDE)

**Status:** ⏳ Planned for Phase 11

**Evidence locations:**

- `docs/security/threat-model-save-flow.md` ⏳
- `docs/security/threat-model-ai-processing.md` ⏳
- `docs/security/threat-model-extension.md` ⏳

**What to look for:**

- STRIDE applied to each major flow
- Specific threats identified, not generic
- Mitigations linked to code
- Risk assessment (likelihood × impact)
- Residual risks acknowledged

---

### Skill: AI-Specific Security (Prompt Injection)

**Status:** ⏳ Planned for Phase 11

**Evidence locations:**

- `apps/api/src/modules/ai/sanitization/` ⏳
- `docs/security/prompt-injection-mitigation.md` ⏳

**What to look for:**

- Input sanitization before sending to LLMs
- Output validation (LLM shouldn't be able to make unauthorized API calls via "ignore previous instructions" attacks)
- Prompt segregation (system vs user content clearly delimited)
- Tests with adversarial article content

---

## Category 5: Frontend Engineering

### Skill: Next.js App Router

**Status:** 🟡 Partially evidenced (Phase 1 — basic routes, i18n, auth flow)

**Evidence locations:**

- `apps/web/src/app/` — App Router pages
- `apps/web/src/app/(auth)/` — Public route group
- `apps/web/src/app/(dashboard)/` — Authenticated route group
- `apps/web/src/app/layout.tsx` — Root layout

**What to look for:**

- Server Components by default, `'use client'` only when needed
- Route groups for layout separation
- Loading and error boundaries per route
- Metadata API for SEO
- Proper async patterns

---

### Skill: State Management Architecture

**Status:** 🟡 Partially evidenced (Exploration 5 Approach A — useState + useEffect intentionally)

**Evidence locations:**

- `apps/web/src/stores/auth-store.ts` — Zustand for auth state
- `apps/web/src/hooks/` — TanStack Query hooks for server state
- `apps/web/src/lib/api.ts` — Axios with auto-refresh interceptors

**What to look for:**

- Clear separation: server state (TanStack Query) vs client state (Zustand) vs local state (useState)
- Query keys following consistent patterns
- Mutations with proper cache invalidation
- Optimistic updates where UX benefits
- Auto-refresh of access tokens on 401

**Multi-perspective evidence:**

- `docs/explorations/05-frontend-state.md` ⏳ — Comparison of state management approaches

---

### Skill: Design System

**Status:** ⏳ Planned for Phase 10

**Evidence locations:**

- `apps/web/src/components/ui/` ⏳ — Base primitives
- `apps/web/.storybook/` ⏳ — Storybook configuration
- `apps/web/src/styles/tokens.css` ⏳ — Design tokens
- `docs/explorations/05-frontend-state.md` ⏳ — Final approach documentation

**What to look for:**

- Design tokens (colors, spacing, typography) as CSS variables
- Reusable primitives (Button, Input, Card, Modal)
- Storybook documentation for each component
- Variants and states documented
- Accessibility built-in (keyboard, ARIA, focus management)
- Dark mode support

---

### Skill: Browser Extension Development (Manifest V3)

**Status:** ⏳ Planned for Phase 3

**Evidence locations:**

- `apps/extension/` — Complete extension app
- `apps/extension/public/manifest.json` — Manifest V3
- `apps/extension/src/background/service-worker.ts` — Service worker
- `apps/extension/src/content/content-script.ts` — Content extraction

**What to look for:**

- Manifest V3 compliance (no `manifest_version: 2`)
- Service worker (not persistent background page)
- Mozilla Readability for article extraction
- Least-privilege permissions
- Message passing between background/content/popup
- Type-safe message contracts

---

## Category 6: DevOps & Production Engineering

### Skill: CI/CD with GitHub Actions

**Status:** 🟡 Partially evidenced (Phase 1 — test job added, prisma generate step, cross-platform lockfile)

**Evidence locations:**

- `.github/workflows/ci.yml` — Parallel typecheck/lint jobs, build gated on both passing
- `.github/workflows/security.yml` ⏳ — Security scanning
- `.github/workflows/deploy.yml` ⏳ — Deploy on merge

**What to look for:**

- Parallel jobs (typecheck, lint) with build depending on both — `needs: [typecheck, lint]`
- pnpm caching via `actions/setup-node` cache option
- Node version read from `.nvmrc` (single source of truth)
- `--frozen-lockfile` for reproducible CI installs
- Matrix builds for multiple Node versions ⏳
- Coverage uploaded to Codecov ⏳
- Deploy gates ⏳
- pnpm.json for cross-platform supportedArchitectures (win32 + linux x64)

---

### Skill: Monorepo Management (pnpm workspaces)

**Status:** 🟡 Partially evidenced (Phase 0 — foundation complete; cross-package imports evidenced in Phase 1+)

**Evidence locations:**

- `pnpm-workspace.yaml` — Workspace config + `allowBuilds` for approved packages
- Root `package.json` — Cross-workspace scripts (`--recursive`, `--filter`, `--parallel`)
- `packages/shared/` — Internal package referenced via `workspace:*` protocol
- `packages/eslint-config/` — Shared ESLint config consumed by both apps
- `tsconfig.base.json` — Shared TypeScript config inherited by all apps
- `.gitattributes` — Line ending normalization across workspace

**What to look for:**

- `pnpm-workspace.yaml` with `allowBuilds` entries (pnpm security model)
- `workspace:*` protocol in `apps/api/package.json` and `apps/web/package.json`
- `tsconfig.json` per app extends `../../tsconfig.base.json` — single source of truth for strict settings
- ESLint shared config package (`@knowvault/eslint-config`) consumed across apps

---

### Skill: Containerization & Deployment

**Status:** ⏳ Phase 0 (Dockerfile.api planned for Phase 12 — Polish)

**Evidence locations:**

- `infra/docker/Dockerfile.api` ⏳ — Multi-stage production image for Render deployment
- `apps/api/test/setup/testcontainers.ts` ⏳ — Integration test container management

**What to look for:**

- Multi-stage Dockerfile for production (build stage → runtime stage)
- Layer caching optimization in production image
- Non-root user in production images (security baseline)
- Health check endpoints
- Testcontainers setup for integration tests (PostgreSQL + Redis ephemeral containers)
- Explicit absence of docker-compose.yml for dev databases (cloud-first per ADR-0002)

**Related ADRs:**

- `docs/adr/0002-local-development-strategy.md` — Why Docker is NOT used for local dev databases

---

### Skill: Database Branching Workflows (Neon)

**Status:** ⏳ Phase 0 setup → 🟡 Partially evidenced after Phase 0 (ADR + setup done, ongoing throughout project)

**Evidence locations:**

- `docs/adr/0002-local-development-strategy.md` — Decision rationale for cloud-first dev
- `apps/api/.env.example` ⏳ — Per-branch connection string patterns (DATABASE_URL vs DIRECT_DATABASE_URL)
- `README.md` — Neon branch setup instructions (Getting Started section)
- `.github/workflows/ci.yml` ⏳ — CI uses `test` branch connection strings

**What to look for:**

- Three-branch strategy: `main` (production), `dev` (local dev), `test` (CI)
- Distinction between pooled URL (PgBouncer, runtime) vs direct URL (migrations only)
- Migration safety workflow: run against `dev` first, validate, then `test`, then `main`
- Never running untested migrations against production `main` branch
- Neon branching as isolation mechanism (replacing Docker volume resets)

**Related ADRs:**

- `docs/adr/0002-local-development-strategy.md` — Full rationale and alternatives considered

---

### Skill: Observability (when triggered)

**Status:** ⏳ OPTIONAL — Phase 12 if triggered by genuine need

**Evidence locations (if implemented):**

- `apps/api/src/common/logger/` ⏳ — Pino structured logging
- `apps/api/src/instrumentation.ts` ⏳ — OpenTelemetry setup
- `docs/runbooks/debugging-with-traces.md` ⏳

**What to look for:**

- Structured JSON logs (Pino)
- Correlation IDs for request tracing
- Sentry for error tracking with context
- OpenTelemetry for distributed traces (if implemented)
- Metrics exposed (Prometheus format)

**Note:** This skill is marked optional and only implemented if a real need emerges during the project. The decision will be documented in an ADR.

---

## Category 7: Architecture & Documentation

### Skill: Architecture Decision Records (ADRs)

**Status:** 🟡 Partially evidenced (3 ADRs: stack choices, local dev strategy, Vitest over Jest)

**Evidence locations:**

- `docs/adr/0001-initial-stack-choices.md` — Full stack rationale with alternatives rejected
- `docs/adr/0002-local-development-strategy.md` — Hybrid cloud/Docker dev strategy
- `docs/adr/0003-vitest-over-jest.md` — Testing framework decision with ESM rationale

**What to look for:**

- ADR-0001: Genuine alternatives section (Supabase, tRPC, Drizzle, Turso all considered and rejected with specific reasons)
- ADR-0002: Three patterns compared (Docker-only, Cloud-only, Hybrid) with pros/cons matrix
- Consistent format (Context, Decision, Alternatives, Consequences)
- Cross-references between related ADRs
- Consequences section honest about trade-offs (both easier AND harder)

**Target:** 15+ ADRs by project completion. Quality over quantity.

---

### Skill: Postmortem Writing

**Status:** ⏳ As incidents occur

**Evidence locations:**

- `docs/postmortems/` — All postmortems

**What to look for:**

- Blameless tone (focus on systems, not people)
- Clear timeline of events
- Root cause analysis (5 whys or similar)
- Specific action items
- Lessons learned articulated
- Updates if action items are completed/blocked

**Target:** 3+ postmortems by project completion. These are valuable artifacts — failures honestly examined are often more impressive than successes.

---

### Skill: Technical Writing

**Status:** ⏳ Ongoing

**Evidence locations:**

- `README.md` — Project overview
- `VISION.md` — Product vision
- `PRD.md` — Technical specifications
- `CLAUDE.md` — Working conventions
- `docs/runbooks/` — Operational guides
- `docs/explorations/` — Multi-approach comparisons

**What to look for:**

- Clear structure with appropriate headings
- Code examples that compile and run
- Honest acknowledgment of limitations
- Audience-appropriate (some docs for engineers, others for product context)
- Updated as project evolves (not stale)

---

## Cross-cutting evidence

### Git history quality

**Evidence:** Commit log

**What to look for:**

- Conventional commits (feat, fix, docs, test, refactor, chore)
- Atomic commits (one logical change per commit)
- Meaningful commit messages with context, not just "fix bug"
- No "WIP" or "asdf" commits in main branch
- Clean linear history (rebased, not merged from feature branches in messy ways)

### PR description quality

**Evidence:** Pull request history

**What to look for:**

- Detailed PR descriptions even on solo project
- Linked issues or ADRs
- Self-review comments highlighting concerns
- Before/after screenshots for UI changes
- Performance data for optimization changes

### Documentation evolution

**Evidence:** Documentation git history

**What to look for:**

- README updated as features ship
- ADRs marked Superseded when decisions change
- Postmortems added when failures occur
- No "TODO" stubs left in main branch documentation

---

## Honesty addendum

This document is a commitment, not a claim. Skills marked ⏳ are not yet demonstrated — I'm being transparent about what's planned vs delivered.

If you're evaluating this codebase before all skills are evidenced:

- Look at the **methodology** (Multi-Perspective Exploration, ADR discipline)
- Look at the **completed phases** for evidence of skills they covered
- Look at the **quality of in-progress work** vs the polish of completed work
- Look at **postmortems and ADRs** — they reveal how I think, not just what I built

If you find skills claimed without evidence, or evidence that doesn't actually demonstrate the skill, please open an issue. Honesty about gaps is more valuable to me than appearing complete.

---

## Update log

| Date          | What changed                                                                                                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project start | Initial document created                                                                                                                                                                                                                                                                     |
| 2026-06-18    | Renamed "Container & Local Development" → "Containerization & Deployment"; removed incorrect docker-compose.yml reference per ADR-0002 and PRD Section 3.3; added "Database Branching Workflows (Neon)" skill entry; added cross-reference from "Database Design & Optimization" to ADR-0002 |
| 2026-06-19    | Phase 0 complete — marked CI/CD, Monorepo Management, ADRs as 🟡 Partially evidenced with specific evidence locations from Phase 0 commits                                                                                                                                                   |
| 2026-06-24    | Phase 1 complete — marked DDD, REST API, Auth/JWT as ✅ Evidenced; updated CI/CD, Database, Next.js, State Management, ADRs                                                                                                                                                                  |

[Each phase completion will add an entry here documenting which skills moved from ⏳ to evidenced]
