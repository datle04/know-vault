# ADR-0001: Initial Stack Choices

**Status:** Accepted
**Date:** 2026-06-19
**Deciders:** Đạt
**Context:** Phase 0 (Project Setup)
**Related:** ADR-0002 (Local Development Strategy)

---

## Context

KnowVault requires a full-stack setup for a personal learning OS: a web
frontend, a REST API backend, a browser extension, background job
processing, vector search, and AI integration. Stack choices must satisfy
three constraints simultaneously:

1. **Cost:** Entirely free tier for MVP (no paid services)
2. **Learning:** Each choice should demonstrate or develop engineering skills
3. **Practicality:** Stack must be production-capable, not toy-grade

These constraints ruled out many otherwise reasonable choices (e.g.,
Firebase for simplicity, Supabase for speed) in favor of choices that
require genuine engineering but remain free.

---

## Decision

Adopt the following stack (full rationale per layer below):

| Layer           | Choice                                |
| --------------- | ------------------------------------- |
| Frontend        | Next.js 14 (App Router) + TailwindCSS |
| Server state    | TanStack Query v5                     |
| Client state    | Zustand                               |
| Forms           | React Hook Form + Zod                 |
| Backend         | NestJS 10                             |
| API style       | REST                                  |
| ORM             | Prisma 6.x                            |
| Database        | PostgreSQL 15+ (Neon)                 |
| Vector store    | pgvector extension                    |
| Queue           | BullMQ + Upstash Redis                |
| AI generation   | Google Gemini 2.0 Flash               |
| AI embeddings   | OpenAI text-embedding-3-small         |
| Auth            | Custom JWT (NestJS)                   |
| Hosting         | Vercel + Render + Neon                |
| Package manager | pnpm workspaces                       |

---

## Rationale by layer

### Database: PostgreSQL (Neon) + pgvector

pgvector requires PostgreSQL — this is the single strongest constraint
driving the entire database decision. Once PostgreSQL is chosen, Neon is
the obvious free-tier cloud option with a key differentiator: database
branching (dev/test/prod isolation without Docker volumes).

Rejected: MongoDB (no native vector support, no ACID for review state),
Supabase (would abstract away the engineering we want to demonstrate).

### ORM: Prisma 6.x

Type-safe schema-first ORM with excellent migration tooling. The
repository pattern exploration (Exploration 4) works better with Prisma
than with raw SQL because the type-generated client is the artifact being
abstracted.

Pinned to 6.x (not 7.x): Prisma 7 moved datasource config to
`prisma.config.ts`, which changes the schema patterns documented in PRD
Section 4.2. Prisma 7 migration is a future exploration opportunity
(see PRD Section 12). Prisma 6.x has verified pgvector support via
`postgresqlExtensions` preview feature.

Rejected: Drizzle (less mature tooling at project start, fewer NestJS
examples), TypeORM (decorator-heavy, diverges from DDD repository
interfaces).

### Backend: NestJS 10

DDD-friendly architecture: module system maps to bounded contexts,
dependency injection enables the repository pattern, decorators
(`@Injectable`, `@Controller`) are explicit about infrastructure
concerns. The learning goal requires encountering real complexity around
DI, guards, interceptors, and pipes.

Rejected: Express (too unopinionated for DDD demonstration), Fastify
(similar issue), Hono (excellent for edge but not DDD-friendly).

### Frontend: Next.js 14 App Router

Server Components by default + route groups for auth/dashboard layout
separation. The App Router's RSC model is the direction the React
ecosystem is heading — demonstrating understanding of server/client
component boundaries is a valuable skill signal.

Rejected: Remix (excellent choice but smaller ecosystem for portfolio
visibility), Vite + React SPA (loses SSR/RSC learning opportunity).

### AI: Gemini Flash (generation) + OpenAI embeddings

Gemini Flash: 1500 free requests/day covers MVP scale. Flash variant
balances speed and quality for structured extraction tasks.

OpenAI text-embedding-3-small: $0.02/1M tokens — the cheapest
high-quality embedding model available. Embeddings are cached
permanently, so real cost is near-zero for personal use.

Split providers (not single provider for both): demonstrates
multi-provider AI architecture, a real production pattern where
generation and embedding are decoupled for cost and quality reasons.

### Auth: Custom JWT (not NextAuth, not Clerk)

This is the most deliberate "harder choice." NextAuth or Clerk would be
faster but would hide the engineering. Custom JWT with dual-token
rotation (access + refresh), bcrypt hashing, and httpOnly cookies
demonstrates understanding of auth security that matters in interviews.

The cost: ~2 extra days of Phase 1 work. The benefit: a defensible
portfolio artifact and genuine security understanding.

### Queue: BullMQ + Upstash Redis

BullMQ is the de-facto standard for Node.js background jobs. Upstash
provides Redis free tier with REST API (no persistent connection
required, important for serverless-adjacent hosting).

The queue exploration (Exploration 2) starts synchronous and evolves
to BullMQ — having BullMQ configured from Phase 0 means the
infrastructure is ready when the exploration reaches it.

---

## Alternatives considered but rejected at portfolio level

**The "just use Supabase" option:** Would reduce backend to ~20% of
planned complexity. Rejected because auth, queue, and AI pipeline
implementation are core portfolio artifacts, not implementation details
to abstract away.

**The "tRPC for type safety" option:** Excellent DX, but the NestJS REST
approach generates more artifacts (DTOs, guards, pipes, filters) that
individually demonstrate engineering decisions. Also: NestJS + tRPC
integration is less mature than NestJS + REST.

**The "Turso/LibSQL for SQLite simplicity" option:** No pgvector support.
Ruled out immediately.

---

## Consequences

**What becomes easier:**

- NestJS DI makes the repository pattern natural to implement
- Prisma types flow from schema to domain without manual mapping
- pgvector in the same database as relational data enables hybrid search
  without a separate vector service
- Neon branching makes database migration safety testable

**What becomes harder:**

- Custom JWT requires more security attention than auth providers
- BullMQ + Redis adds operational complexity vs synchronous processing
- Multi-provider AI adds abstraction layer vs direct SDK usage
- pnpm workspace monorepo has a steeper learning curve than single repo

**What this commits us to:**

- PostgreSQL-only for the lifetime of this project
- NestJS module system for feature organization
- Prisma 6.x until explicit Prisma 7 migration exploration
- Neon + Upstash free tier limits (0.5GB DB, 10K Redis commands/day)

---

## References

- PRD Section 2: Stack decisions table
- PRD Section 3.3: Local development strategy
- PRD Section 4.2: Prisma schema (Prisma 6.x format)
- ADR-0002: Local development strategy (Neon branching vs Docker)
- docs/skills.md: Skills this stack is designed to demonstrate
