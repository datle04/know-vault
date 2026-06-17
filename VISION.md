# KnowVault — Product Vision v3

**Document Type:** Product Vision (NOT technical spec)
**Status:** Revised based on review feedback (v3)
**Author:** Đạt
**Date:** April 2026
**Changes from v2:**
- Reframed "Intentional Evolution" as "Multi-Perspective Exploration" (positive framing)
- Removed "use bad solutions first" mentality — replaced with "explore multiple approaches to understand trade-offs"
- Tests written from day one, with reactive additions for edge cases discovered
- Added Security Exploration as 7th evolution
- Observability evolution kept but marked optional/de-emphasized

---

## 0. The honest framing (read this first)

**KnowVault is two products at once:**

1. **A real application** that solves a real problem (knowledge retention for self-learning developers)
2. **A learning vehicle** that gives me realistic engineering problems to encounter and solve

Both matter, but **the learning is primary**. If I have to choose between "ship faster" and "encounter a problem worth solving", I choose the latter. The project succeeds when the codebase becomes a defensible portfolio piece demonstrating I can think and build like a real engineer.

**My approach: multi-perspective exploration**

I will not artificially write bad code to "experience pain". Instead, for each significant engineering challenge, I will **deliberately attempt multiple solution approaches** to develop perspective on trade-offs. The codebase will reflect genuine engineering judgment, with ADRs documenting why specific approaches were chosen for specific contexts.

The portfolio narrative is not "I made mistakes and fixed them" — it's "I attempted these approaches, here's what I learned about when each one fits."

This is **Learning-Driven Development with multi-perspective exploration**. It's honest, professional, and reflects how senior engineers actually develop judgment.

---

## 1. The problem KnowVault solves

Developers consume technical content constantly — blog posts, documentation, video tutorials, books. But reading does not equal learning. A developer who reads 200+ articles per year typically retains less than 20% after three months. The result is a paradox: we read more than ever, yet feel like we're forgetting faster.

Existing tools help us collect content (bookmarks, read-later) or take notes (Notion, Obsidian), but none close the loop between consumption and retention.

**KnowVault turns consumed content into retained, retrievable, applicable knowledge** through AI-assisted processing, automated review prompts, and concept-level connections across sources.

---

## 2. Who has this problem

### Primary user: Me

I read Prisma docs, NestJS patterns, system design blogs, AI papers daily. I bookmark them all. Three months later I Google the same problem and find the article I already read but forgot. I have a 14-pattern DSA repo, but cannot recall the Sliding Window pattern when I haven't solved one in two weeks.

### Secondary users (bonus, not required)

I will offer KnowVault to 2-5 developer friends. External users are bonus validation — not a success criterion. The project succeeds based on engineering quality and personal usage, regardless of external adoption.

---

## 3. The pain — quantified

Real problems I personally experience:

| Pain | Frequency | Cost | Current workaround |
|------|-----------|------|---------------------|
| Forgotten content (re-Googling articles I've read) | Multiple times per month | 30-60 min + frustration per occurrence | None |
| Bookmark graveyard (growing unread queue) | Daily anxiety | Cognitive overhead | Periodic bookmark bankruptcy |
| Cannot recall DSA patterns | Weekly during practice | 1-2 hours re-learning | Manually maintained cheatsheet |
| Knowledge fragmentation across sources | Constant | Cannot synthesize | None |

---

## 4. The vision — one sentence

**KnowVault turns every technical article you read into long-term retained knowledge through AI-assisted processing, active recall, and concept-level connections.**

---

## 5. MVP scope — what KnowVault does

### Story 1: Save (the entry point)

Click extension icon on any webpage → article saved in 200ms with full content extracted.

**Quality bar:** Must be faster than browser bookmark.

### Story 2: Process (AI value)

Within 60 seconds of save, in background:
- Article content extracted and cleaned
- Article chunked semantically
- Key concepts identified (3-7 per article)
- Concepts linked to existing concepts in user's knowledge graph
- Review questions generated (5-10 per article)

**Quality bar:** Questions must be useful. Concepts must connect meaningfully.

### Story 3: Annotate

While reading saved articles, user can:
- Highlight passages
- Write notes attached to highlights
- Tag notes with concepts
- AI suggests related concepts/articles based on note content

**Quality bar:** Minimal friction. AI reduces note-taking burden, not adds to it.

### Story 4: Connect

Concept-level knowledge graph:
- Each concept is a node
- Articles/notes connect to concepts they touch
- AI suggests connections between concepts
- User manually links or unlinks
- Visualization shows clusters and gaps

**Quality bar:** Graph leads to insights, not vanity feature.

### Story 5: Review (retention loop)

Daily routine:
- "You have 8 reviews today (5 min)"
- AI asks question → user answers → AI evaluates → next review scheduled (SM-2)
- Struggling concepts surface more often

**Quality bar:** <10 minutes/day total.

### Story 6: Recall (the payoff)

When working on a task:
- Search "caching strategies"
- See sources ranked by relevance
- AI synthesizes summary citing my own saves and notes
- Each fact links to original source

**Quality bar:** Must help apply knowledge to current work.

### Story 7: Reflect (dashboard)

Monthly insights:
- Articles saved vs. reviewed (intake/output ratio)
- Retention rate over time
- Concept clusters and growth
- Struggling areas
- AI cost per article

---

## 6. Success metrics — 6 tiers

### Tier 0: Learning Evidence (MOST IMPORTANT)

The metrics that prove this project is a genuine learning vehicle.

| Metric | Target | How measured |
|--------|--------|--------------|
| **ADRs documented** | 15+ Architecture Decision Records | Files in /docs/adr |
| **Approach comparisons** | 7+ documented comparisons of alternative approaches | Files in /docs/explorations |
| **Test coverage** | Domain 95%+, Application 80%+, Overall 75%+ | Codecov reports |
| **Performance benchmarks** | Before/after for 3+ optimizations | Documented in /docs/performance |
| **Skill demonstration** | Evidence for each claimed skill in CV | Mapping doc in /docs/skills.md |
| **Postmortem documents** | 3+ for genuine bugs/incidents/wrong decisions | Files in /docs/postmortems |

These are the artifacts recruiters and engineers will actually evaluate.

### Tier 1: Product Function

| Metric | Target | How measured |
|--------|--------|--------------|
| **AI question quality** | 80%+ rated useful (sample of 100+) | Per-question rating |
| **AI concept extraction quality** | 75%+ concepts manually approved | Approval flow |
| **Save → process completion** | 95%+ articles successfully processed | Job success rate |
| **Search relevance** | 80%+ "found what I needed" | Self-survey |

### Tier 2: Personal Usage

| Metric | Target | How measured |
|--------|--------|--------------|
| **Daily usage** | 30 day streak | Login tracking |
| **Articles saved** | 50+ | Save events |
| **Reviews completed** | 80%+ of scheduled | Review events |
| **Notes written** | 20+ across articles | Note events |

### Tier 3: AI Engineering

| Metric | Target | How measured |
|--------|--------|--------------|
| **Generation latency p95** | <60 seconds | Telemetry |
| **Cost per article** | <$0.05 | Billing logs |
| **AI failure rate** | <2% | Error tracking |
| **Cache hit rate** | >40% post-optimization | Cache metrics |

### Tier 4: Technical Health

| Metric | Target | How measured |
|--------|--------|--------------|
| **API uptime** | 99.5%+ | Uptime monitoring |
| **Save latency p95** | <500ms | Telemetry |
| **Search latency p95** | <300ms | Telemetry |
| **Test pass rate in CI** | 100% on main | GitHub Actions |
| **Security audit** | OWASP Top 10 verified | Documented in /docs/security |

### Tier 5: External Validation (BONUS, optional)

| Metric | Target | How measured |
|--------|--------|--------------|
| **Friends using weekly** | 2+ (bonus) | Active users |
| **Feedback received** | 5+ actionable items | Issue tracker |

---

## 7. Multi-Perspective Exploration

For each significant engineering challenge, I will **attempt multiple approaches** to develop genuine engineering judgment. Each exploration produces:

- Working implementation of each approach
- ADR documenting trade-offs
- Benchmarks where measurable (performance, cost)
- Final recommendation based on context

This is **not** "bad solutions first, then fix them". This is **professional exploration of design space** — the same way senior engineers develop intuition over years of practice, compressed into deliberate study.

### Tests written from day one

Unlike pure exploration, tests are professional discipline I commit to from the start. Tests are written for new features before considering them complete. Additional tests are added reactively when edge cases are discovered (and each such addition is documented as "test added for edge case discovered in [context]").

This is the one area I will NOT explore the "no tests" perspective. The cost of that exploration is too high and the lesson is already well-established in the industry.

### Exploration 1: Search

**Why explore:** Search is the most-used feature. Different approaches have wildly different trade-offs.

**Approaches to attempt:**

*Approach A — PostgreSQL Full-Text Search (Week 2-3)*
- Use `tsvector`/`tsquery` with built-in ranking
- Benchmark: relevance for keyword queries, performance
- Document: when does this win?

*Approach B — Vector Search (Week 5-6)*
- Add pgvector extension
- Implement embedding pipeline with chunking strategy
- Benchmark: relevance for semantic queries, cost per query
- Document: when does this win?

*Approach C — Hybrid Search with Reranking (Week 7-8)*
- Combine BM25 + vector similarity with weighted scoring
- Add cross-encoder reranking for top-K results
- Benchmark all three approaches with same query set
- **ADR output:** "Search architecture for KnowVault" comparing approaches with quantitative data

**Learning outcome:** Build intuition for when keyword vs semantic vs hybrid wins. Understand cost/quality trade-offs in retrieval systems.

### Exploration 2: Background Processing

**Why explore:** Many ways to handle async work, each with different reliability/complexity trade-offs.

**Approaches to attempt:**

*Approach A — Synchronous (Week 2)*
- API call blocks during AI processing
- Document: limits of synchronous approach (timeouts, UX impact)
- Performance benchmark: response times under realistic load

*Approach B — Fire-and-Forget with Promises (Week 3-4)*
- Background promises without persistence
- Document: where this works, where it fails (server restart, errors)
- Identify scenarios requiring persistence

*Approach C — BullMQ with Job Patterns (Week 5)*
- Persistent queues, retries with backoff, dead letter queue
- Workers with concurrency control
- **ADR output:** "Background processing patterns", runbook for queue operations

**Learning outcome:** Understand the spectrum of async patterns. Develop judgment for when each fits.

### Exploration 3: AI Cost & Quality Optimization

**Why explore:** AI engineering is as much economics as technology.

**Approaches to attempt:**

*Approach A — Baseline (Week 2-3)*
- Direct API call per save, single-shot prompting
- Track cost per article, quality scores
- Establish baseline metrics

*Approach B — Content Deduplication (Week 6)*
- Hash article content, reuse processing for duplicates
- Benchmark cost reduction
- Document: when does dedup save money?

*Approach C — Layered Optimization (Week 8)*
- Embedding caching, prompt caching
- Batch processing where applicable
- Few-shot prompts for better quality
- **ADR output:** "AI cost engineering" with cost reduction graph

**Learning outcome:** AI economics from first principles. When to optimize, when "good enough" is good enough.

### Exploration 4: Data Layer Architecture

**Why explore:** Multiple valid ways to structure data access, each with different testability/complexity trade-offs.

**Approaches to attempt:**

*Approach A — Service-Direct Prisma (Week 1-2)*
- Services call Prisma directly
- Quick to build, easy to understand
- Document: testability challenges, when this falls short

*Approach B — Repository Pattern (Week 4)*
- Domain layer with interfaces, infrastructure with implementations
- Document: increased testability, added complexity
- Measure: test execution speed difference

*Approach C — Query Optimization (Week 8)*
- Profile slow queries with EXPLAIN ANALYZE on realistic data (10K+ saves)
- Add indexes strategically (and document why)
- Materialized views for aggregations
- **ADR output:** "Data layer architecture and query optimization" with EXPLAIN outputs

**Learning outcome:** Understand database internals through profiling real workloads.

### Exploration 5: Frontend State Architecture

**Why explore:** State management is religion in frontend. Better to understand options than dogmatically follow patterns.

**Approaches to attempt:**

*Approach A — Local State with useState (Week 2-3)*
- React useState for everything, props for sharing
- Document: where this works (simple flows), where it breaks (cross-component sync)

*Approach B — Server State Separation (Week 5)*
- TanStack Query for server state
- Zustand for client-only state (auth, UI preferences)
- Document: why this separation matters, what bugs disappear

*Approach C — Design System (Week 7-8)*
- Extract reusable primitives
- Storybook documentation
- Visual regression tests
- **ADR output:** "Frontend state and component architecture"

**Learning outcome:** Develop opinions on state management based on real bugs encountered, not dogma.

### Exploration 6: Security (NEW based on your feedback)

**Why explore:** Security is a deep discipline you specifically want to learn. KnowVault has multiple realistic threat surfaces.

**Approaches to attempt:**

*Approach A — Default secure stack (Week 1-2)*
- Use NestJS guards, Prisma parameterized queries, basic JWT auth
- Document: what's protected by default, what's not
- Establish security baseline

*Approach B — Threat modeling and hardening (Week 6)*
- STRIDE threat modeling for save flow, AI processing, search
- Implement specific mitigations for identified threats
- Document each threat with mitigation rationale

*Approach C — Active validation (Week 9)*
- OWASP ZAP automated scanning against staging
- Manual penetration testing of authentication, authorization, input validation
- npm audit / Snyk for dependency vulnerabilities
- **ADR output:** "Security posture and threat model" with audit results

**Specific threat surfaces in KnowVault:**
- User content (article HTML, notes) → XSS risk if rendered unsafely
- Browser extension permissions → least-privilege scoping
- AI prompt injection (article content controls LLM behavior)
- API key exposure (multiple LLM providers)
- Cross-user data isolation (RLS or middleware)
- Webhook signatures (if implementing)

**Learning outcome:** Build security mindset, not just security knowledge. Recognize threats in real architecture, not just textbook examples.

### Exploration 7: Observability (OPTIONAL based on your feedback)

**Status:** Optional. Will implement if time permits and pain emerges.

**Trigger conditions to make it non-optional:**
- Hit a production bug I cannot debug without better observability
- AI cost anomaly that requires investigation
- Performance regression I cannot diagnose

If triggered, will explore: structured logging (Pino), distributed tracing (OpenTelemetry), error tracking (Sentry).

---

## 8. What KnowVault is NOT

- **NOT a competitor to Notion/Obsidian.** General workspace tools exist. KnowVault is specifically for learning retention; note-taking is concept-centric.
- **NOT a team tool.** No sharing, no spaces. Personal only.
- **NOT a content feed.** We don't recommend what to read.
- **NOT a Twitter/Reddit replacement.** We import from them.
- **NOT a comprehensive learning platform.** No courses or curriculum.
- **NOT trying to scale.** Built for me + a handful of friends.

---

## 9. The honesty section

Things I am not certain about:

**1. Will I actually use this daily?**
Existential question. Commit: save every technical article I read from week 1. If I skip it, that's a critical signal — write a postmortem.

**2. Will AI quality reach the bar?**
Hardest problem. Plan: rate first 100 questions manually, build evaluation framework, iterate prompts. If quality plateaus below 80%, document why in postmortem (learning still valid).

**3. Will spaced repetition work for technical content?**
SM-2 was designed for vocabulary. Plan: implement as baseline, track recall vs application separately, modify if needed.

**4. Will I find friends willing to use it?**
Maybe, maybe not. Not a success criterion. External users are bonus.

**5. Will I over-engineer to learn?**
Risk acknowledged. Mitigation: each Exploration has a recommended approach per context. I will not implement Approach C if Approach A is genuinely sufficient — but I will implement all approaches to develop perspective, even if the final recommended approach is A.

**6. Will the project actually finish?**
Realistic risk. Mitigation: Each Exploration's Approach A delivers a usable product. Even stopping mid-project leaves a working app.

---

## 10. What "done" looks like

Project is portfolio-ready when:

1. **Daily usage for 4 consecutive weeks** with 5+ saves per week
2. **Tier 0 Learning Evidence hit:** 15+ ADRs, 7+ approach comparisons, test coverage met, 3+ postmortems
3. **Tier 1 Product Function hit:** AI quality 80%+, processing success 95%+
4. **Tier 3 AI Engineering hit:** Cost <$0.05/article, latency <60s
5. **Tier 4 Technical Health hit:** Including OWASP Top 10 audit completed
6. **6 Explorations completed** with ADRs documenting trade-offs (Observability optional)
7. **Comprehensive README** documenting what was built and learned
8. **Public demo accessible** with my real data

Not required: external users, growth, hype.

---

## 11. The portfolio piece I want to write

> **KnowVault — Personal Learning Operating System for Developers**
>
> A web application that turns technical articles into retained knowledge through AI processing, concept linking, and spaced repetition. Built primarily as a learning-driven engineering project, deliberately exploring multiple approaches to develop genuine engineering judgment.
>
> **The problem:** As a self-learning developer, I was reading 200+ articles per year but retaining less than 20%. Existing tools collected content or helped take notes, but nothing closed the loop on retention.
>
> **The approach:** For each significant engineering challenge, I attempted multiple solution approaches and documented trade-offs. This was not "bad code then good code" — it was professional exploration of design space, the way senior engineers develop intuition over years of experience.
>
> **Engineering depth demonstrated:**
> - **Search:** Implemented and benchmarked PostgreSQL FTS, pgvector semantic search, and hybrid search with reranking. ADR documents when each approach wins.
> - **Background processing:** Compared synchronous, fire-and-forget, and BullMQ patterns. Final architecture uses BullMQ for AI processing with documented rationale.
> - **AI cost engineering:** Reduced cost-per-article from baseline $0.10 to optimized $0.034 through content deduplication, embedding caching, and prompt optimization.
> - **Data layer:** Started with service-direct Prisma, evolved to repository pattern with query optimization. EXPLAIN ANALYZE outputs documented before/after indexing decisions.
> - **Testing:** 95%+ domain layer coverage including property-based tests on SM-2 algorithm, mutation testing, integration tests with testcontainers.
> - **Frontend:** Compared local state, server/client state separation with TanStack Query + Zustand, and design system with Storybook documentation.
> - **Security:** STRIDE threat modeling, OWASP Top 10 verification, npm audit/Snyk integration in CI, documented threat surfaces specific to AI applications (prompt injection, content XSS).
> - **Browser extension:** Manifest V3 with sub-200ms save UX.
>
> **Self-honest assessment:**
> - **What I learned:** The exploration approach built judgment faster than reading articles. I now have informed opinions on search architectures, async patterns, and security models because I implemented them all.
> - **What didn't work:** Initial AI prompts produced low-quality questions. Required 3 iterations and evaluation framework before reaching 80% useful rate.
> - **What surprised me:** [filled in during retrospective]
>
> **Review artifacts:**
> - 15+ ADRs comparing approaches with quantitative data
> - 7+ exploration documents with benchmarks
> - 3+ postmortems on genuine issues encountered
> - Test coverage reports across project lifecycle
> - Git history showing genuine engineering progression
> - Public deployed instance with my real usage data

---

## 12. Decisions confirmed

Based on v2 feedback:

1. **Reframed Section 7** from "Intentional Evolution" (bad → good) to "Multi-Perspective Exploration" (multiple approaches)
2. **Tests from day one** — no "no tests" phase
3. **Security as Exploration 6** — explicitly added
4. **Observability as Exploration 7** — marked optional, trigger-based
5. **Note-taking and concept linking remain in MVP**
6. **External users remain bonus, not requirement**

---
