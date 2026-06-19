# ADR-0002: Local Development Strategy — Hybrid Cloud + Docker

**Status:** Accepted
**Date:** [TO BE FILLED — when actually committing this ADR in Phase 0]
**Deciders:** Đạt
**Context:** Phase 0 (Project Setup)
**Related:** ADR-0001 (Initial Stack Choices), PRD Section 3.3

---

## Context

KnowVault uses **Neon (cloud PostgreSQL)** and **Upstash (cloud Redis)** for production per stack decisions in PRD Section 2. A question arose during Phase 0 setup: how should local development connect to these services?

Three patterns were considered, each with significant trade-offs that affect onboarding, debugging, testing reliability, and production fidelity.

## Decision

**Hybrid approach (Pattern 3): Cloud databases for routine dev, Docker for tests and production builds.**

Specifically:
- `pnpm dev` connects to **Neon `dev` branch** and **Upstash dev instance** directly
- Docker is required ONLY for:
  - Integration tests via testcontainers (ephemeral containers)
  - Building production images for Render deployment
- No `docker-compose.yml` for routine local databases

Neon branches structured as:
- `main` — production data
- `dev` — local development
- `test` — CI / integration tests

## Alternatives Considered

### Alternative A: Local Docker Compose for everything

Run PostgreSQL + Redis in Docker containers locally. Cloud services only used in production.

**Pros:**
- Works offline (no internet required for dev)
- Fast (local network, no latency)
- Easy to reset (drop + recreate containers)
- Single source for both dev and integration tests

**Cons:**
- "Works on my machine" pitfalls — local PostgreSQL behaves differently than Neon (no PgBouncer pooling, different extension defaults)
- pgvector extension must be manually configured in Docker (one extra setup step)
- Doesn't validate Neon-specific behaviors (connection pooling, branch operations)
- Friend onboarding requires Docker installation + understanding compose

**Why rejected:** Production parity is more valuable than offline capability for this project. Hidden bugs from local-prod differences are common pitfalls that we'd rather avoid.

### Alternative B: Cloud direct for everything (no Docker)

Connect to Neon/Upstash for both dev AND integration tests.

**Pros:**
- Simplest possible setup (just env vars)
- Maximum production parity
- No Docker required at all for the developer

**Cons:**
- Integration tests against shared cloud databases create test data pollution
- Tests can't be guaranteed isolation (parallel runs conflict)
- Network latency in tests makes them slow
- Can't easily reset state mid-test
- Testcontainers pattern (industry standard for integration tests) is lost
- CI cost concerns — every test run hits real Upstash quota

**Why rejected:** Tests need true isolation and speed that only local containers provide. Production parity matters more for dev than for tests.

### Alternative C: Hybrid — Cloud for dev, Docker for tests (CHOSEN)

Combine strengths of both approaches.

**Pros:**
- Production parity for dev work (catches integration bugs early)
- Test isolation via testcontainers (no shared state)
- Onboarding friends only needs env vars for dev (Docker only for contributing tests)
- Neon branching gives natural data isolation for dev/test/prod
- Demonstrates understanding of both cloud development AND container patterns

**Cons:**
- Requires internet for routine development
- Two patterns to maintain (cloud connection logic + Docker testcontainers)
- More complex initial setup (Neon branches + Docker)

**Why chosen:** The trade-offs align well with project goals. Production parity for dev prevents the most common class of bugs (works locally, fails in production). Docker for tests ensures isolation. Both are valuable learning opportunities (cloud database branching workflows are a real skill).

## Consequences

**What becomes easier:**
- Catching production-specific bugs (pooling, latency, extension behavior) during dev
- Onboarding friends to use the app (no Docker required)
- Database state isolation via Neon branches (cleaner than Docker volumes)
- Demonstrating cloud database management skills in portfolio

**What becomes harder:**
- Working offline (laptop on a plane = no dev)
- Initial Phase 0 setup (need to create 3 Neon branches, configure connection strings per branch)
- Onboarding contributors who want to run tests (need Docker for testcontainers)

**What this commits us to:**
- All future "local development" instructions reference Neon dev branch, not local containers
- Integration tests must use testcontainers (not just "use the local Docker container")
- CI pipeline configures separate connection strings for test branch
- Any developer setup documentation explicitly notes this hybrid pattern
- Database migration workflow goes dev → test → main, never directly to main

**Operational impact:**
- Neon free tier (0.5 GB) shared across 3 branches — monitor usage
- Upstash free tier (10K commands/day) limits dev + test combined — plan accordingly
- If Neon free tier becomes a constraint, options: (1) upgrade Neon, (2) merge dev/test branches, (3) revisit Pattern A

## References

- PRD Section 3.3: Local Development Strategy detail
- PRD Section 2: Stack decisions (Neon + Upstash chosen)
- README.md: User-facing installation instructions
- CLAUDE.md Common mistakes #21, #22: Conventions enforcement
- [Neon docs: Branching](https://neon.tech/docs/introduction/branching)
- [Testcontainers Node.js](https://node.testcontainers.org/)
- [Render: Connecting to Neon](https://render.com/docs/deploy-postgres)

## Notes for future reference

If at any point this strategy becomes painful (e.g., consistent offline work needed, Neon free tier exhausted), revisit this ADR rather than silently switching patterns. The cost of inconsistent setup conventions is higher than the cost of one architectural pivot.
