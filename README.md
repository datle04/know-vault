<div align="center">

# KnowVault

**Personal learning operating system for developers.**

Turn the technical articles you read into knowledge you actually remember.

[Live Demo](#) · [Documentation](#documentation) · [Architecture](#architecture) · [About](#about-this-project)

![Status](https://img.shields.io/badge/status-in_development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tests](https://img.shields.io/badge/tests-passing-green)
![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey)

</div>

---

## The problem

I read 200+ technical articles per year. I retain less than 20% after three months.

This isn't an organization problem. Bookmarks pile up. Notion gets messy. Anki flashcards are too tedious to create. Most "second brain" tools collect content but don't help you remember it.

**KnowVault is built for one specific job: turn consumed content into retained knowledge through AI-assisted processing, spaced repetition, and concept-level connections.**

---

## Features

### Core MVP

- **One-click save** via browser extension on any technical article
- **AI-powered processing**: concept extraction, question generation, knowledge graph building
- **Spaced repetition** with the SM-2 algorithm, optimized for technical content
- **Semantic search** across your entire reading history (hybrid keyword + vector search)
- **Concept graph** showing relationships between what you've learned
- **Notes & highlights** attached to concepts, not just documents
- **Daily review queue** that takes less than 10 minutes
- **Cost transparency** — see exactly how much AI processing each article costs

### What this means in practice

```
You read an article about React Server Components.

→ Click extension. Article saved in <200ms.
→ AI extracts concepts: "Server Components", "Streaming", "Suspense"
→ AI generates 5-8 review questions of varying difficulty
→ Concepts linked to your existing knowledge: "Component Architecture"
→ Tomorrow, KnowVault asks you the easiest question
→ A week later, the harder ones
→ Three months later, you actually remember Server Components
```

---

## Tech stack

**Frontend**

- Next.js 14 (App Router) + TypeScript
- TailwindCSS for styling
- TanStack Query for server state
- Zustand for client state
- React Hook Form + Zod for forms

**Backend**

- NestJS 10 with module-based architecture
- Prisma 6.x ORM with PostgreSQL
- pgvector for semantic search
- BullMQ + Redis for background processing
- Custom JWT authentication

**AI**

- Google Gemini 2.0 Flash for generation
- OpenAI `text-embedding-3-small` for embeddings
- Versioned prompt templates
- Custom evaluation framework for AI output quality

**Browser Extension**

- Manifest V3
- Mozilla Readability for content extraction
- Service Worker architecture

**Infrastructure**

- Vercel (frontend) + Render (backend) + Neon (database) + Upstash (Redis)
- All on free tiers — total cost: $0/month
- GitHub Actions for CI/CD
- Sentry for error tracking

**Testing**

- Vitest for backend unit and integration tests
- Vitest + React Testing Library for frontend component tests
- Playwright for E2E tests
- fast-check for property-based tests
- Testcontainers for integration tests

[See full architecture →](./docs/architecture.md)

---

## About this project

This is a deliberately constructed learning project. I'm building it to:

1. **Solve a real problem I personally have** — knowledge retention as a self-learning developer
2. **Develop engineering depth** across testing, security, architecture, AI/RAG, and production patterns
3. **Build a portfolio piece** that demonstrates engineering skills through code, not claims

### What makes it different

Most portfolio projects show you can build something that works. This one is structured to show **how I think about engineering trade-offs**.

For seven major problem areas, I implement multiple approaches and document the comparisons:

| Problem area          | Approaches explored                                     |
| --------------------- | ------------------------------------------------------- |
| Search                | PostgreSQL FTS → Vector search → Hybrid + reranking     |
| Background processing | Synchronous → Fire-and-forget → BullMQ patterns         |
| AI cost optimization  | Baseline → Content dedup → Layered caching              |
| Data layer            | Direct Prisma → Repository pattern → Query optimization |
| Frontend state        | Local state → Server/client split → Design system       |
| Security              | Default secure → Threat modeling → Active validation    |
| Observability         | Triggered by genuine need, not premature                |

Each exploration produces:

- Working code for each approach
- Performance/cost benchmarks where measurable
- An [Architecture Decision Record](./docs/adr/) explaining the trade-offs
- An [Exploration write-up](./docs/explorations/) with the comparison data

This isn't "bad code then good code." Each approach is valid for some context. The point is developing genuine engineering judgment by implementing and comparing real alternatives.

[Read the full project vision →](./VISION.md)

---

## Documentation

The project has three primary documents, designed to be read together:

| Document                 | Purpose                                              | When to read                 |
| ------------------------ | ---------------------------------------------------- | ---------------------------- |
| [VISION.md](./VISION.md) | Product intent, problem definition, success criteria | First — understand the WHY   |
| [PRD.md](./PRD.md)       | Technical specifications, architecture, phase plan   | Second — understand the WHAT |
| [CLAUDE.md](./CLAUDE.md) | Working conventions and patterns                     | Third — understand the HOW   |

### Supporting documentation

- **[Architecture Decision Records](./docs/adr/)** — Why specific technical decisions were made
- **[Explorations](./docs/explorations/)** — Multi-approach comparisons with data
- **[Performance benchmarks](./docs/performance/)** — Before/after measurements
- **[Postmortems](./docs/postmortems/)** — Honest analysis of failures and incidents
- **[Security audits](./docs/security/)** — Threat models and OWASP verification
- **[Skills mapping](./docs/skills.md)** — Evidence in code for each claimed skill

---

## Architecture

KnowVault is a pnpm monorepo with three deployable apps and shared packages.

```
knowvault/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # NestJS backend
│   └── extension/    # Browser extension (Manifest V3)
├── packages/
│   └── shared/       # Shared types and Zod schemas
└── docs/             # All project documentation
```

### High-level data flow

```
User saves article via extension
        ↓
Backend creates Article record (status: PENDING)
        ↓
Returns immediately (HTTP 201, ~200ms)
        ↓
Background job picks up the article
        ↓
├─ Extract clean content (Mozilla Readability)
├─ Chunk semantically (target 500-800 tokens)
├─ Generate embeddings (OpenAI)
├─ Extract concepts (Gemini)
├─ Link to existing concepts (vector similarity)
├─ Generate review questions (Gemini)
└─ Schedule SM-2 reviews
        ↓
Article ready for reading and review
```

### Domain-Driven Design

The backend follows DDD principles with strict separation:

- **Domain layer** (`apps/api/src/domain/`) — Pure TypeScript, no framework dependencies. Entities, value objects, domain services, repository interfaces.
- **Infrastructure layer** (`apps/api/src/infrastructure/`) — Adapters for Prisma, AI providers, queues, external services.
- **Application layer** (`apps/api/src/modules/`) — NestJS modules orchestrating domain operations.

This separation makes the domain testable without spinning up databases, frameworks, or external services.

---

## Getting started

### Prerequisites

- Node.js 20+ LTS
- pnpm 9+
- Docker (for integration tests via testcontainers and production image builds)

> **Note on local development:** KnowVault uses cloud databases (Neon + Upstash) for development, not local Docker containers. This matches production behavior and avoids "works on my machine" pitfalls. Docker is required only for integration tests and production image builds. See [ADR-0002 on local development strategy](./docs/adr/0002-local-development-strategy.md) for the full rationale.

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/knowvault.git
cd knowvault

# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
# Edit the .env files with your Neon and Upstash credentials (see "Required external services" below)

# Run database migrations against your Neon dev branch
pnpm --filter @knowvault/api prisma:migrate dev

# Seed the database with initial data
pnpm --filter @knowvault/api prisma:seed

# Start everything in development mode
pnpm dev
```

### Required external services

| Service                                         | Purpose                              | Free tier sufficient?           |
| ----------------------------------------------- | ------------------------------------ | ------------------------------- |
| [Neon](https://neon.tech)                       | PostgreSQL database (with branching) | Yes (0.5GB, unlimited branches) |
| [Upstash](https://upstash.com)                  | Redis for BullMQ                     | Yes (10K commands/day)          |
| [Google AI Studio](https://aistudio.google.com) | Gemini API key                       | Yes (1500 req/day)              |
| [OpenAI](https://platform.openai.com)           | Embedding API                        | ~$1-2/month for personal use    |
| [Cloudinary](https://cloudinary.com)            | Image storage                        | Yes (25K images/month)          |

### Neon branches setup

KnowVault uses Neon's branching feature for environment isolation:

| Branch | Purpose                     | Used by                |
| ------ | --------------------------- | ---------------------- |
| `main` | Production data             | Deployed app on Render |
| `dev`  | Active development          | Local dev (`pnpm dev`) |
| `test` | E2E and integration testing | CI pipeline            |

Create branches via Neon console or CLI:

```bash
# Install Neon CLI
npm install -g neonctl

# Create branches
neonctl branches create --name dev --parent main
neonctl branches create --name test --parent main

# Get connection string for each branch
neonctl connection-string dev
neonctl connection-string test
```

Each branch has independent data — destructive operations in `dev` don't affect `main`.

### Development commands

```bash
# Start all apps in dev mode
pnpm dev

# Run specific app
pnpm dev:web        # Next.js only
pnpm dev:api        # NestJS only
pnpm dev:ext        # Extension only

# Testing
pnpm test           # All tests
pnpm test:unit      # Unit tests only
pnpm test:e2e       # End-to-end tests

# Code quality
pnpm typecheck      # TypeScript across all packages
pnpm lint           # ESLint
pnpm format         # Prettier

# Database
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
pnpm db:seed        # Seed development data
```

---

## Project status

| Phase                              | Status         | Highlights                                      |
| ---------------------------------- | -------------- | ----------------------------------------------- |
| 0 — Project Setup                  | ⏳ Not started | Monorepo, CI/CD skeleton, tooling               |
| 1 — Foundation                     | ⏳ Pending     | Auth, basic article CRUD, PostgreSQL FTS search |
| 2 — AI Pipeline                    | ⏳ Pending     | Concept extraction, question generation, BullMQ |
| 3 — Browser Extension              | ⏳ Pending     | One-click save flow                             |
| 4 — Review System                  | ⏳ Pending     | SM-2 algorithm, daily reviews                   |
| 5 — Notes & Highlights             | ⏳ Pending     | Annotation features                             |
| 6 — Search Evolution               | ⏳ Pending     | Vector + hybrid search                          |
| 7 — Background Processing Maturity | ⏳ Pending     | Production-grade queues                         |
| 8 — AI Cost Optimization           | ⏳ Pending     | Caching, deduplication                          |
| 9 — Data Layer Optimization        | ⏳ Pending     | EXPLAIN ANALYZE profiling                       |
| 10 — Frontend Maturity             | ⏳ Pending     | Design system, Storybook                        |
| 11 — Security Hardening            | ⏳ Pending     | OWASP audit, pen-testing                        |
| 12 — Polish & Portfolio            | ⏳ Pending     | Demo prep, retrospective                        |

[See detailed phase plan →](./PRD.md#12-phase-plan-timing-approximate)

---

## What you can expect to find in this codebase

If you're a recruiter or fellow engineer evaluating this code, here's what to look at:

**For testing depth:**

- [`apps/api/src/domain/review/sm2.service.spec.ts`](./apps/api/src/domain/review/) — property-based tests on SM-2
- [`apps/api/test/`](./apps/api/test/) — integration tests with testcontainers
- [`apps/web/src/components/`](./apps/web/src/components/) — component tests

**For architecture:**

- [`apps/api/src/domain/`](./apps/api/src/domain/) — pure domain layer with DDD patterns
- [`apps/api/src/infrastructure/`](./apps/api/src/infrastructure/) — clean separation of concerns
- [`docs/adr/`](./docs/adr/) — every significant decision documented

**For AI/RAG engineering:**

- [`apps/api/src/modules/ai/`](./apps/api/src/modules/ai/) — provider abstraction, prompt templates
- [`apps/api/src/modules/ai/prompt-templates/`](./apps/api/src/modules/ai/prompt-templates/) — versioned prompts
- [`docs/explorations/01-search.md`](./docs/explorations/) — search architecture comparison

**For security:**

- [`docs/security/`](./docs/security/) — threat models and audits
- [`apps/api/src/common/guards/`](./apps/api/src/common/guards/) — auth implementation
- [`.github/workflows/security.yml`](./.github/workflows/) — automated security scans

**For evidence of specific skills:**

- See [`docs/skills.md`](./docs/skills.md) for a mapping of each claimed skill to specific code evidence.

---

## Honest disclaimers

**This is a learning project.** The codebase deliberately implements multiple approaches to the same problem to develop engineering judgment. Some files and folders show intentional evolution from simple to sophisticated solutions.

**It's not a polished SaaS product.** While I use it personally, it's not optimized for adoption by many users. Architecture decisions favor learning depth over production scalability.

**External users are bonus, not the goal.** If you find KnowVault useful, that's wonderful — but the project succeeds based on engineering quality, not user count.

**AI-generated content quality varies.** I document quality metrics transparently. See [`docs/explorations/03-ai-quality.md`](./docs/explorations/) for evaluation data.

---

## Contributing

This is primarily a personal learning project. I'm not actively seeking contributions, but I welcome:

- **Issues** pointing out bugs, security concerns, or architectural questions
- **Discussions** about engineering decisions or alternative approaches
- **Feedback** on documentation clarity

If you want to use KnowVault as a base for your own project, fork freely.

---

## License

[MIT](./LICENSE) — Free to use, modify, and learn from.

---

## Acknowledgments

This project would not exist without:

- The Mozilla Readability project for battle-tested article extraction
- The SuperMemo team for the SM-2 spaced repetition algorithm
- The pgvector contributors for making semantic search in PostgreSQL trivial
- The NestJS, Next.js, and Prisma communities for excellent documentation
- Every developer who has written about RAG architecture and AI engineering — your blog posts are the textbooks of this era

---

## Contact

**Đạt** — frontend developer at WeGrowth, transitioning to full-stack

- GitHub: [@username](https://github.com/datle04)
- LinkedIn: [profile](https://linkedin.com/in/datle04)
- Email: contact@example.com

Building in public. Following the journey from junior to senior, one exploration at a time.

---

<div align="center">

**⭐ If this project inspires your own learning journey, a star is appreciated.**

</div>
