# KnowVault — Technical PRD

**Document Type:** Technical Product Requirements Document
**Version:** 1.0
**Status:** Ready for Implementation
**Companion document:** Product Vision v3 (read first)
**Target Audience:** Claude Code (AI pair programmer) + Đạt

---

## How to use this PRD

This PRD is comprehensive but designed for **incremental reading**. You don't need to read it all at once.

- **First read:** Sections 1-3 (overview, stack, structure)
- **Before each phase:** Re-read relevant Phase section + relevant Exploration section
- **When stuck:** Consult section 11 (Decisions Catalog) for similar precedents
- **Always:** Reference back to Product Vision v3 for the "why"

The Technical PRD constrains HOW we build. Product Vision constrains WHY and WHAT.

---

## 1. Project at a glance

**KnowVault** — Personal learning operating system for developers. Save technical articles → AI processes them into concepts and questions → Spaced repetition surfaces them for review → Knowledge graph connects related concepts → You actually retain what you read.

**Primary goal:** Learning vehicle. Codebase becomes portfolio evidence of engineering skills (testing, security, architecture, AI/RAG, performance).

**Secondary goal:** Real app I use daily to solve actual retention problem.

**Approach:** Multi-Perspective Exploration. Implement multiple solutions to same problem to develop genuine engineering judgment.

---

## 2. Stack (final, confirmed)

| Layer                 | Choice                                             | Rationale                                                  |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| **Frontend**          | Next.js 14 (App Router) + TailwindCSS              | Modern, SSR, ecosystem                                     |
| **State (server)**    | TanStack Query v5                                  | Cache, retry, optimistic updates                           |
| **State (client)**    | Zustand                                            | Minimal, no boilerplate                                    |
| **Forms**             | React Hook Form + Zod                              | Type-safe, performant                                      |
| **Backend**           | NestJS 10+                                         | Module-based, DDD-friendly, DI                             |
| **API style**         | REST (not tRPC, not GraphQL)                       | Explicit contract, easier to test independently            |
| **ORM**               | Prisma 6.x (latest stable)                         | Type-safe, migration management; pgvector support verified |
| **Database**          | PostgreSQL 15+ (Neon)                              | ACID, pgvector support, free tier                          |
| **Vector store**      | pgvector extension                                 | Native PostgreSQL, no separate service                     |
| **Queue**             | BullMQ                                             | Redis-backed, proven, NestJS integration                   |
| **Redis**             | Upstash                                            | Free tier, REST-based, serverless                          |
| **AI Generation**     | Google Gemini 2.0 Flash                            | 1500 free req/day, multimodal                              |
| **AI Embeddings**     | OpenAI text-embedding-3-small                      | $0.02/1M tokens, proven quality                            |
| **Auth**              | Custom JWT (NestJS)                                | Demonstrates auth skills, no vendor lock                   |
| **File storage**      | Cloudinary                                         | Free tier, CDN, image transforms                           |
| **Browser Extension** | Manifest V3 + vanilla JS/TS                        | Modern, future-proof                                       |
| **Web hosting**       | Vercel                                             | Free tier, optimized for Next.js                           |
| **API hosting**       | Render                                             | Free tier 750h/month                                       |
| **CI/CD**             | GitHub Actions                                     | Free for public repos                                      |
| **Error tracking**    | Sentry                                             | Free tier (5K errors/month)                                |
| **Testing**           | Vitest (unit), Vitest (frontend), Playwright (E2E) | Industry standard                                          |
| **Package manager**   | pnpm + workspaces                                  | Disk efficiency, monorepo support                          |
| **Linting**           | ESLint + Prettier                                  | Code quality                                               |
| **Type safety**       | TypeScript 5.3+ strict mode                        | Non-negotiable                                             |

### Stack decisions NOT to re-litigate

Once you start building, do not propose changing:

- Database from PostgreSQL to MongoDB ("NoSQL is simpler") — pgvector requires PostgreSQL
- ORM from Prisma to Drizzle/TypeORM — Prisma is proven and matches learning goals
- Gemini to Claude/OpenAI for generation — Gemini free tier covers MVP needs
- pgvector to Pinecone/Qdrant — native pgvector is the chosen exploration path
- REST to tRPC — already evaluated, NestJS backend with REST is the choice

If any of these become genuine pain points later, document them as findings in an ADR but do not switch mid-project without explicit user approval.

---

## 3. Repository structure

```
knowvault/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   ├── components/       # React components
│   │   │   ├── lib/              # API client, utilities
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   └── styles/           # Global styles
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api/                      # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules
│   │   │   ├── common/           # Decorators, guards, filters
│   │   │   ├── domain/           # Pure domain layer (DDD)
│   │   │   ├── infrastructure/   # Adapters (Prisma, AI providers, queue)
│   │   │   ├── prisma/           # PrismaService
│   │   │   └── config/           # Configuration
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── test/
│   │   └── package.json
│   └── extension/                # Browser extension (Manifest V3)
│       ├── src/
│       │   ├── background/       # Service worker
│       │   ├── content/          # Content scripts
│       │   ├── popup/            # Extension popup UI
│       │   └── shared/           # Shared utilities
│       ├── public/
│       │   └── manifest.json
│       └── package.json
├── packages/
│   ├── shared/                   # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── schemas/          # Zod schemas
│   │   │   └── constants/
│   │   └── package.json
│   └── eslint-config/            # Shared ESLint config
├── docs/
│   ├── adr/                      # Architecture Decision Records
│   ├── explorations/             # Multi-perspective explorations
│   ├── performance/              # Performance benchmarks
│   ├── postmortems/              # Incident postmortems
│   ├── runbooks/                 # Operational guides
│   ├── security/                 # Security audits, threat models
│   └── skills.md                 # Skill mapping to evidence
├── .github/
│   └── workflows/                # CI/CD pipelines
├── infra/
│   └── docker/                   # Dockerfile for production builds, NOT local dev databases
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── CLAUDE.md
└── PRD.md
```

### Workspace configuration

`pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Root `package.json` scripts:

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter='./apps/*' dev",
    "dev:web": "pnpm --filter @knowvault/web dev",
    "dev:api": "pnpm --filter @knowvault/api dev",
    "dev:ext": "pnpm --filter @knowvault/extension dev",
    "build": "pnpm --recursive build",
    "test": "pnpm --recursive test",
    "lint": "pnpm --recursive lint",
    "typecheck": "pnpm --recursive typecheck"
  }
}
```

### 3.3 Local Development Strategy (Hybrid: Cloud + Docker)

KnowVault uses a **hybrid local development model**: cloud databases for dev work, Docker for tests and production builds. This is documented in ADR-0002.

**Cloud-based local dev (primary):**

Local `pnpm dev` connects to cloud services, NOT local Docker containers:

- PostgreSQL: Neon `dev` branch (`DATABASE_URL` in `.env`)
- Redis: Upstash dev instance (`REDIS_URL` in `.env`)
- AI services: same Gemini + OpenAI keys as production

**Why cloud for local dev:**

- Match production behavior (PgBouncer pooling, network latency, pgvector version)
- No "works on my machine" pitfalls from version mismatches
- Onboard friends with just env vars, no Docker required for them
- Neon branching gives data isolation without Docker volumes complexity
- Eliminates 1 entire category of bugs (local vs prod database differences)

**Docker is still required, but ONLY for:**

1. **Integration tests** via testcontainers:
   - `apps/api/test/integration/*.spec.ts` uses ephemeral PostgreSQL + Redis containers
   - Each test suite spins up containers, runs, tears down
   - Ensures tests don't pollute dev databases

2. **Production image builds:**
   - `infra/docker/Dockerfile.api` for Render deployment
   - Multi-stage build for optimized production image

3. **NOT for routine `pnpm dev`** — that connects to Neon and Upstash directly

**Neon branch strategy:**

| Branch | Purpose            | Used by                | Reset frequency           |
| ------ | ------------------ | ---------------------- | ------------------------- |
| `main` | Production data    | Deployed app on Render | Never (production data)   |
| `dev`  | Active development | Local dev (`pnpm dev`) | Periodically as needed    |
| `test` | E2E tests          | CI pipeline            | Reset before each E2E run |

Branch creation in Phase 0 setup:

```bash
neonctl branches create --name dev --parent main
neonctl branches create --name test --parent main
```

**Connection strings per environment:**

```bash
# apps/api/.env (local development)
DATABASE_URL="postgresql://...@ep-dev-xxx.neon.tech/knowvault?sslmode=require&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://...@ep-dev-xxx.neon.tech/knowvault?sslmode=require"
REDIS_URL="redis://default:...@dev-xxx.upstash.io:6379"

# CI environment (test branch)
DATABASE_URL="postgresql://...@ep-test-xxx.neon.tech/..."

# Production (Render env vars)
DATABASE_URL="postgresql://...@ep-main-xxx.neon.tech/..."
```

**Schema migrations safety:**

- Migrations run against `dev` branch first
- If migration breaks `dev`, easy to recover by branching from `main`
- Production migrations only after `dev` proves stable
- See PRD Section "Database rules" for migration safety patterns

**Trade-offs accepted:**

- ❌ No offline development (requires internet)
- ❌ Network latency vs local DB (acceptable for free-tier project)
- ✅ Production parity
- ✅ Simpler onboarding (no Docker setup for dev)
- ✅ Built-in branching for data isolation

---

## 4. Domain Model

This is the heart of the application. Domain layer is pure — no Prisma imports, no NestJS imports.

### 4.1 Core Domain Concepts

```
Article (saved content from web)
├── has many Chunks (semantic sections after processing)
├── has many Concepts (extracted by AI)
├── has many Questions (generated for review)
├── has many Notes (user annotations)
└── has many Highlights (user-selected passages)

Concept (atomic unit of knowledge)
├── linked to many Articles (where it appears)
├── linked to many Concepts (knowledge graph relationships)
├── has many Notes (user thoughts about this concept)
└── tracked in Reviews (mastery level)

Question (AI-generated for review)
├── belongs to Article
├── linked to one or more Concepts
└── has many ReviewAttempts (user answers over time)

Note (user-generated)
├── belongs to User
├── optionally attached to Article + Highlight
├── linked to Concepts (tagged manually or by AI)
└── can reference other Notes

Highlight (user-selected text)
├── belongs to Article
├── has start/end position
└── optionally has Note attached

Review (spaced repetition state)
├── for each Question
├── tracks: easiness factor, interval, repetitions, next review date
└── follows SM-2 algorithm (or modified)
```

### 4.2 Prisma Schema

> **Note:** Schema below targets Prisma 6.x. The `postgresqlExtensions` preview feature enables pgvector integration. Prisma 6 schema syntax is compatible with this format. When upgrading to Prisma 7 (see Section 12 future exploration), datasource config will move to `prisma.config.ts`.

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// ─── User Domain ───

model User {
  id            String          @id @default(cuid())
  email         String          @unique
  passwordHash  String
  name          String
  avatarUrl     String?
  articles      Article[]
  notes         Note[]
  reviewAttempts ReviewAttempt[]
  refreshTokens RefreshToken[]
  preferences   UserPreference?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model RefreshToken {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
}

model UserPreference {
  id              String @id @default(cuid())
  user            User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String @unique
  reviewsPerDay   Int    @default(10)
  difficultyBias  Float  @default(0)  // -1 (easier) to 1 (harder)
  aiProvider      String @default("gemini")  // For future multi-provider exploration
  updatedAt       DateTime @updatedAt
}

// ─── Article Domain ───

model Article {
  id             String         @id @default(cuid())
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  url            String
  urlHash        String         // SHA-256 of normalized URL, for dedup
  title          String
  author         String?
  siteName       String?        // e.g., "dev.to", "medium.com"
  publishedAt    DateTime?
  savedAt        DateTime       @default(now())
  content        String         @db.Text  // Full cleaned article HTML/markdown
  contentHash    String         // SHA-256 of content, detect content updates
  wordCount      Int
  readingTimeMin Int            // Estimated reading time

  // Language handling (see Section 13 — Internationalization)
  // MVP (Phase 1-7): Always "en", reject non-English articles gracefully
  // Phase 8+: Auto-detected via AI/franc library
  language          String         @default("en")
  languageConfidence Float?        // Set in Phase 8+ when auto-detection added
  languageDetectedBy String?        // "default" | "ai" | "library" | "user"

  // Processing status
  status         ArticleStatus  @default(PENDING)
  processedAt    DateTime?
  processingError String?
  aiCost         Float          @default(0)  // Track per-article cost

  // Relationships
  chunks         ArticleChunk[]
  concepts       ArticleConcept[]
  questions      Question[]
  notes          Note[]
  highlights     Highlight[]

  @@unique([userId, urlHash])
  @@index([userId, savedAt])
  @@index([userId, status])
}

enum ArticleStatus {
  PENDING       // Just saved, awaiting processing
  PROCESSING    // Currently being processed
  PROCESSED     // Successfully processed
  FAILED        // Processing failed
}

model ArticleChunk {
  id        String  @id @default(cuid())
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId String
  order     Int     // Position in article
  content   String  @db.Text
  tokenCount Int
  embedding Unsupported("vector(1536)")?  // OpenAI text-embedding-3-small dimension

  @@index([articleId, order])
}

// ─── Concept Domain (Knowledge Graph) ───

model Concept {
  id          String           @id @default(cuid())
  // Concepts are user-scoped (not global) for MVP
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  name        String           // e.g., "React Server Components"
  nameSlug    String           // Normalized for matching
  description String?          @db.Text
  embedding   Unsupported("vector(1536)")?

  // Manual user metadata
  notes       Note[]
  customColor String?          // For visualization

  // Relationships
  articles    ArticleConcept[]
  questions   QuestionConcept[]

  // Concept-to-concept graph
  outgoingLinks ConceptLink[]  @relation("source")
  incomingLinks ConceptLink[]  @relation("target")

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@unique([userId, nameSlug])
  @@index([userId])
}

model ArticleConcept {
  article    Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId  String
  concept    Concept @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  conceptId  String
  confidence Float    // 0-1, how confident AI is about this link
  manualOverride Boolean @default(false)  // User confirmed/added

  @@id([articleId, conceptId])
  @@index([conceptId])
}

model ConceptLink {
  id          String       @id @default(cuid())
  source      Concept      @relation("source", fields: [sourceId], references: [id], onDelete: Cascade)
  sourceId    String
  target      Concept      @relation("target", fields: [targetId], references: [id], onDelete: Cascade)
  targetId    String
  relation    LinkRelation @default(RELATED)
  strength    Float        @default(0.5)  // 0-1
  source_type LinkSource   // AI suggested vs user created
  createdAt   DateTime     @default(now())

  @@unique([sourceId, targetId, relation])
  @@index([sourceId])
  @@index([targetId])
}

enum LinkRelation {
  RELATED       // General relationship
  PREREQUISITE  // A is prerequisite for B
  EXAMPLE_OF    // A is example of B
  CONTRADICTS   // A and B propose conflicting ideas
  EXTENDS       // A extends B
}

enum LinkSource {
  AI_SUGGESTED
  USER_CREATED
  USER_CONFIRMED  // AI suggested, user approved
}

// ─── Question & Review Domain ───

model Question {
  id           String            @id @default(cuid())
  article      Article           @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId    String
  text         String            @db.Text
  expectedAnswer String          @db.Text
  difficulty   Difficulty        @default(MEDIUM)

  // Concepts this question tests
  concepts     QuestionConcept[]

  // Review state per question
  review       Review?

  // User feedback on question quality
  userRating   Int?              // 1-5, set when user reviews
  ratedAt      DateTime?

  createdAt    DateTime          @default(now())

  @@index([articleId])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model QuestionConcept {
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  questionId String
  concept    Concept  @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  conceptId  String

  @@id([questionId, conceptId])
}

model Review {
  id              String   @id @default(cuid())
  question        Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  questionId      String   @unique

  // SM-2 algorithm state
  easinessFactor  Float    @default(2.5)
  interval        Int      @default(1)        // Days until next review
  repetitions     Int      @default(0)
  nextReviewAt    DateTime @default(now())

  // Attempts history
  attempts        ReviewAttempt[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([nextReviewAt])
}

model ReviewAttempt {
  id          String   @id @default(cuid())
  review      Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId    String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  quality     Int      // 0-5 SM-2 grade
  userAnswer  String?  @db.Text
  aiEvaluation String? @db.Text  // AI's assessment of user's answer
  attemptedAt DateTime @default(now())

  @@index([userId, attemptedAt])
}

// ─── Notes & Highlights ───

model Note {
  id          String     @id @default(cuid())
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String

  // Optional context (note can be standalone)
  article     Article?   @relation(fields: [articleId], references: [id], onDelete: SetNull)
  articleId   String?
  highlight   Highlight? @relation(fields: [highlightId], references: [id], onDelete: SetNull)
  highlightId String?    @unique

  content     String     @db.Text  // Markdown
  embedding   Unsupported("vector(1536)")?

  // Tagged concepts
  concepts    NoteConcept[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([userId, createdAt])
  @@index([articleId])
}

model NoteConcept {
  note      Note    @relation(fields: [noteId], references: [id], onDelete: Cascade)
  noteId    String
  concept   Concept @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  conceptId String
  source    LinkSource @default(USER_CREATED)

  @@id([noteId, conceptId])
}

model Highlight {
  id        String  @id @default(cuid())
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId String
  startPos  Int     // Character position in article content
  endPos    Int
  text      String  @db.Text  // Cached highlighted text
  color     String  @default("yellow")
  note      Note?

  createdAt DateTime @default(now())

  @@index([articleId])
}

// ─── Operational ───

model AICallLog {
  id            String   @id @default(cuid())
  userId        String
  provider      String   // 'gemini', 'openai'
  operation     String   // 'generate_questions', 'extract_concepts', 'embed'
  inputTokens   Int
  outputTokens  Int
  costUsd       Float
  latencyMs     Int
  success       Boolean
  errorMessage  String?
  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
  @@index([provider, createdAt])
}

model JobLog {
  id          String    @id @default(cuid())
  queueName   String
  jobId       String
  jobName     String
  status      JobStatus
  attempts    Int       @default(0)
  data        Json?
  result      Json?
  error       String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  @@index([queueName, status])
  @@index([createdAt])
}

enum JobStatus {
  WAITING
  ACTIVE
  COMPLETED
  FAILED
  DELAYED
}
```

### 4.3 Domain Layer Architecture (apps/api/src/domain)

Pure TypeScript classes, no framework dependencies.

```
domain/
├── article/
│   ├── article.entity.ts       // Article aggregate root
│   ├── article-status.vo.ts    // Value object
│   ├── article-content.vo.ts   // Encapsulates content + hash
│   └── article.events.ts       // ArticleSaved, ArticleProcessed events
├── concept/
│   ├── concept.entity.ts       // Concept aggregate root
│   ├── concept-link.entity.ts
│   └── knowledge-graph.service.ts  // Domain service
├── review/
│   ├── review.entity.ts        // Review aggregate root
│   ├── sm2.service.ts          // SM-2 algorithm (pure function)
│   └── review.events.ts
├── question/
│   ├── question.entity.ts
│   └── difficulty.vo.ts
└── shared/
    ├── identifier.vo.ts        // Base for typed IDs
    └── domain-event.ts         // Base event class
```

**Key principle:** Domain layer has zero `@Injectable()` decorators, zero Prisma imports, zero HTTP concerns. Repositories are interfaces here; implementations live in `infrastructure/`.

---

## 5. Module Structure (NestJS Backend)

```
apps/api/src/
├── modules/
│   ├── auth/                   # JWT auth, register, login, refresh
│   ├── users/                  # User profile, preferences
│   ├── articles/               # Article CRUD, save flow
│   ├── concepts/               # Concept management, knowledge graph
│   ├── questions/              # Question CRUD, ratings
│   ├── reviews/                # Daily review queue, SM-2 logic
│   ├── notes/                  # Note CRUD
│   ├── highlights/             # Highlight CRUD
│   ├── search/                 # Search across all content
│   ├── ai/                     # AI providers, processing
│   │   ├── providers/
│   │   │   ├── gemini.provider.ts
│   │   │   └── openai.provider.ts
│   │   ├── ai-orchestrator.service.ts
│   │   └── prompt-templates/
│   ├── jobs/                   # BullMQ queues
│   │   ├── article-processing.processor.ts
│   │   ├── concept-linking.processor.ts
│   │   └── embedding.processor.ts
│   ├── extraction/             # URL fetching, content parsing
│   └── analytics/              # Dashboard metrics
├── infrastructure/
│   ├── persistence/            # Prisma repositories
│   ├── ai/                     # External AI client wrappers
│   ├── queue/                  # BullMQ setup
│   └── http/                   # External HTTP clients
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
├── config/
└── main.ts
```

---

## 6. API Design (REST)

All endpoints prefixed `/api`. JWT authentication required except `@Public()`.

### 6.1 Authentication

```
POST   /api/auth/register         { email, password, name } → { user, accessToken }
POST   /api/auth/login            { email, password } → { user, accessToken }
POST   /api/auth/refresh          (cookie) → { accessToken }
POST   /api/auth/logout           (cookie) → { success }
```

### 6.2 Articles

```
GET    /api/articles                          ?status=&page=&limit=  → paginated
POST   /api/articles                          { url, content? }       → Article (sync save, async process)
GET    /api/articles/:id                      → Article with full content
PATCH  /api/articles/:id                      { title?, ... }         → Article
DELETE /api/articles/:id                      → { success }
GET    /api/articles/:id/status               → { status, progress }
POST   /api/articles/:id/reprocess            → { jobId }            (re-run AI processing)
```

### 6.3 Concepts

```
GET    /api/concepts                          ?search=               → Concept[]
GET    /api/concepts/:id                      → Concept with relationships
POST   /api/concepts                          { name, description? } → Concept
PATCH  /api/concepts/:id                      → Concept
DELETE /api/concepts/:id                      → { success }
GET    /api/concepts/:id/articles             → Article[] referencing this concept
GET    /api/concepts/:id/related              → Related concepts via knowledge graph
POST   /api/concepts/:id/link                 { targetId, relation } → ConceptLink
DELETE /api/concepts/:sourceId/link/:targetId → { success }
GET    /api/concepts/graph                    → Full graph data for visualization
```

### 6.4 Questions & Reviews

```
GET    /api/reviews/queue                     → Question[] due for review today
POST   /api/reviews/:questionId/attempt       { userAnswer } → { evaluation, nextReview }
POST   /api/questions/:id/rate                { rating: 1-5 } → Question
GET    /api/questions/:id                     → Question with concepts
DELETE /api/questions/:id                     → { success }
```

### 6.5 Notes

```
GET    /api/notes                             ?conceptId=&articleId= → Note[]
POST   /api/notes                             { content, articleId?, highlightId?, conceptIds? } → Note
GET    /api/notes/:id                         → Note
PATCH  /api/notes/:id                         → Note
DELETE /api/notes/:id                         → { success }
```

### 6.6 Highlights

```
POST   /api/articles/:id/highlights           { startPos, endPos, text, color? } → Highlight
DELETE /api/highlights/:id                    → { success }
```

### 6.7 Search

```
GET    /api/search                            ?q=&type=&limit=        → SearchResult[]
  type: 'all' | 'articles' | 'notes' | 'concepts'
```

### 6.8 Analytics

```
GET    /api/analytics/dashboard               → DashboardData
GET    /api/analytics/retention               ?period= → RetentionMetrics
GET    /api/analytics/costs                   → AICostBreakdown
```

### 6.9 Extension-specific

```
POST   /api/extension/quick-save              { url, html?, selection? } → Article
GET    /api/extension/status                  → { saved, count } for current URL
```

---

## 7. AI Processing Pipeline

This is the most complex part of the system. Detailed enough to implement, with hooks for Multi-Perspective Explorations.

### 7.1 Article Processing Flow

```
User saves article (POST /api/articles)
    ↓
Synchronous response:
  - Validate URL
  - Check dedup (urlHash)
  - Create Article with status=PENDING
  - Enqueue 'article-processing' job
  - Return Article immediately (HTTP 201)
    ↓
Background job: article-processing
  ├─ Stage 1: Content extraction
  │   - If content provided by extension → use it
  │   - Else → fetch URL, extract main content (Readability.js)
  │   - Save cleaned content to Article.content
  │   - Compute wordCount, readingTimeMin
  │   - Update status=PROCESSING
  │
  ├─ Stage 2: Chunking
  │   - Split content into semantic chunks (target 500-800 tokens)
  │   - Preserve markdown structure where possible
  │   - Create ArticleChunk records
  │
  ├─ Stage 3: Embedding (enqueue 'embedding' job)
  │   - For each chunk, generate embedding via OpenAI
  │   - Store in ArticleChunk.embedding
  │   - Log cost in AICallLog
  │
  ├─ Stage 4: Concept extraction
  │   - Send article to Gemini with extraction prompt
  │   - Parse JSON response: [{ name, description, confidence }]
  │   - For each concept:
  │     - Find similar existing concept (vector + name match)
  │     - If similar exists (>0.85 similarity) → link to existing
  │     - Else → create new Concept
  │   - Create ArticleConcept links
  │
  ├─ Stage 5: Question generation
  │   - Send article + concepts to Gemini with question prompt
  │   - Parse JSON: [{ text, expectedAnswer, difficulty, conceptIds }]
  │   - Create Question records with QuestionConcept links
  │   - Create Review records for each Question (initial state)
  │
  ├─ Stage 6: Concept linking (enqueue 'concept-linking' job)
  │   - For each new Concept created, find related concepts
  │   - Use vector similarity + co-occurrence in articles
  │   - Create ConceptLink with source=AI_SUGGESTED
  │
  └─ Final:
      - Update status=PROCESSED, processedAt=now
      - Aggregate total cost into Article.aiCost
      - Emit ArticleProcessedEvent
```

### 7.2 AI Provider Abstraction

```typescript
// apps/api/src/modules/ai/providers/ai-provider.interface.ts
export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: GenerationOptions): Promise<GenerationResult>;
  generateJSON<T>(prompt: string, schema?: object): Promise<T>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface GenerationResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}
```

Implementations:

- `GeminiProvider` (generation)
- `OpenAIProvider` (embeddings)

Orchestrator routes calls based on operation type. Future explorations can add Claude, local models, etc.

### 7.3 Prompt Templates (versioned)

Store prompts as code, version them in git.

```
apps/api/src/modules/ai/prompt-templates/
├── extract-concepts.v1.ts
├── extract-concepts.v2.ts        // After iteration
├── generate-questions.v1.ts
├── evaluate-answer.v1.ts
└── prompt.types.ts
```

Each template exports:

```typescript
export const extractConceptsV1: PromptTemplate = {
  version: 'v1',
  description: 'Initial concept extraction prompt',
  systemPrompt: '...',
  buildUserPrompt: (article: { title: string; content: string }) => `...`,
  parseResponse: (raw: string) => ExtractedConcept[],
  evaluationCriteria: {
    expectedFormat: 'JSON array',
    requiredFields: ['name', 'description', 'confidence'],
  },
};
```

This enables prompt versioning, A/B testing, and the AI quality evaluation framework.

### 7.4 AI Quality Evaluation Framework

Critical for the project's success. Build early.

**Manual evaluation flow:**

```
1. User reviews generated content (concepts, questions)
2. User rates each item: useful / partially / not useful
3. System logs rating with prompt version, input characteristics
4. Dashboard shows quality metrics per prompt version
5. Compare versions, iterate prompts based on data
```

**Automated evaluation (later):**

```
- Test set of 50 articles with manually-labeled "ideal" outputs
- Run each prompt version against test set
- Score based on:
  - Concept overlap (Jaccard similarity)
  - Question quality (LLM-as-judge with separate evaluation prompt)
  - Format compliance
- Regression test: new prompt versions must not score worse on test set
```

---

## 8. Search Architecture (Exploration 1)

### 8.1 Approach A — PostgreSQL Full-Text Search (Week 2-3)

**MVP scope (Phase 1-7):** Hardcoded English FTS configuration. All articles assumed English (rejected at save time if not).

**Phase 8+:** Will be made language-aware. Each article will use FTS config matching its detected language. Vietnamese will likely use `'simple'` config (PostgreSQL doesn't ship with great Vietnamese FTS support; this is a documented limitation, not a bug). See Section 13 for details.

Implementation:

```sql
-- Migration: Add full-text search support
ALTER TABLE "Article" ADD COLUMN search_vector tsvector;
CREATE INDEX article_search_idx ON "Article" USING GIN(search_vector);

-- Trigger to keep search_vector updated
-- MVP: hardcoded 'english'. Phase 8+: parameterize by article.language
CREATE FUNCTION article_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Search query:

```typescript
async searchArticles(query: string, userId: string) {
  // MVP: 'english' hardcoded. Phase 8+: take language from request or user preference
  return this.prisma.$queryRaw`
    SELECT *, ts_rank(search_vector, to_tsquery('english', ${query})) as rank
    FROM "Article"
    WHERE user_id = ${userId}
      AND search_vector @@ to_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `;
}
```

**Benchmark this approach:**

- Query latency for various query types (single word, phrase, boolean)
- Recall on test queries (am I finding the right articles?)
- Limitations: synonyms ("cache" vs "caching"), conceptual queries

### 8.2 Approach B — Vector Search with pgvector (Week 5-6)

Implementation:

```typescript
async semanticSearchArticles(query: string, userId: string) {
  // 1. Embed the query
  const queryEmbedding = await this.openai.generateEmbedding(query);

  // 2. Search chunks by similarity
  return this.prisma.$queryRaw`
    SELECT a.*, MIN(c.embedding <=> ${queryEmbedding}::vector) as distance
    FROM "Article" a
    JOIN "ArticleChunk" c ON c.article_id = a.id
    WHERE a.user_id = ${userId}
    GROUP BY a.id
    ORDER BY distance
    LIMIT 20
  `;
}
```

**Benchmark same queries as Approach A. Document where vector wins, where it loses.**

### 8.3 Approach C — Hybrid Search with Reranking (Week 7-8)

Implementation:

```typescript
async hybridSearch(query: string, userId: string) {
  // 1. Run both searches in parallel
  const [ftsResults, vectorResults] = await Promise.all([
    this.ftsSearch(query, userId, { limit: 50 }),
    this.semanticSearch(query, userId, { limit: 50 }),
  ]);

  // 2. Combine with Reciprocal Rank Fusion (RRF)
  const combined = this.reciprocalRankFusion(ftsResults, vectorResults);

  // 3. Rerank top 20 with cross-encoder (using LLM as reranker)
  const topResults = combined.slice(0, 20);
  return this.rerank(query, topResults);
}

private reciprocalRankFusion(...resultLists: SearchResult[][]): SearchResult[] {
  // Standard RRF algorithm
  const k = 60;
  const scoreMap = new Map<string, number>();

  for (const list of resultLists) {
    list.forEach((result, rank) => {
      const score = scoreMap.get(result.id) || 0;
      scoreMap.set(result.id, score + 1 / (k + rank));
    });
  }

  return Array.from(scoreMap.entries())
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
```

**Final ADR output:** Comparison of three approaches with quantitative data, recommended usage per query type.

---

## 9. Background Processing (Exploration 2)

### 9.1 Approach A — Synchronous (Week 2)

```typescript
// Naive initial implementation
@Post()
async saveArticle(@Body() dto: SaveArticleDto, @CurrentUser() user: User) {
  const article = await this.articlesService.create(dto, user.id);

  // BLOCKS for 30-60 seconds
  await this.aiOrchestrator.processArticle(article);

  return article;
}
```

Document:

- HTTP timeout issues
- Bad UX (long loading state)
- Cannot scale beyond 1 concurrent processing

### 9.2 Approach B — Fire-and-Forget (Week 3-4)

```typescript
@Post()
async saveArticle(@Body() dto: SaveArticleDto, @CurrentUser() user: User) {
  const article = await this.articlesService.create(dto, user.id);

  // Don't await - background work
  this.aiOrchestrator.processArticle(article).catch(err => {
    console.error('Processing failed:', err);
  });

  return article;
}
```

Document:

- Work lost on server restart
- No retry on failure
- No visibility into job state
- Cannot resume mid-pipeline

### 9.3 Approach C — BullMQ with Job Patterns (Week 5)

```typescript
@Post()
async saveArticle(@Body() dto: SaveArticleDto, @CurrentUser() user: User) {
  const article = await this.articlesService.create(dto, user.id);

  await this.articleQueue.add('process-article', {
    articleId: article.id,
    userId: user.id,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: false,  // Keep for debugging
  });

  return article;
}
```

Queue worker:

```typescript
@Processor('article-processing')
export class ArticleProcessor extends WorkerHost {
  async process(job: Job<ArticleProcessingData>): Promise<void> {
    const { articleId } = job.data;

    // Update progress at each stage for visibility
    await job.updateProgress(10);
    await this.extractContent(articleId);

    await job.updateProgress(30);
    await this.chunkArticle(articleId);

    // Each sub-job can be its own queue
    const embeddingJob = await this.embeddingQueue.add('embed-article', { articleId });

    await job.updateProgress(50);
    // ... continues
  }
}
```

**Document:**

- Reliability: jobs survive restart
- Observability: BullMQ UI shows job state
- Concurrency control: configure workers per CPU
- Dead letter queue for repeatedly failed jobs

**ADR output:** Background processing patterns with concrete decision criteria.

---

## 10. Browser Extension

### 10.1 Architecture

Manifest V3, modern Chrome extension.

```
apps/extension/src/
├── background/
│   ├── service-worker.ts        // Main background script
│   ├── api-client.ts            // Talks to NestJS API
│   └── auth.ts                  // Token management
├── content/
│   ├── content-script.ts        // Injected into pages
│   ├── highlight-handler.ts     // Capture selections
│   └── reader-mode.ts           // Detect article content
├── popup/
│   ├── popup.html
│   ├── popup.tsx                // Mini React app for popup
│   └── components/
└── shared/
    ├── messages.ts              // Type-safe message passing
    └── storage.ts               // Extension storage wrapper
```

### 10.2 Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "KnowVault",
  "version": "0.1.0",
  "description": "Save and learn from technical articles",
  "permissions": ["storage", "activeTab", "contextMenus"],
  "host_permissions": ["https://*.knowvault.app/*"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon-32.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### 10.3 Save Flow

```
User clicks extension icon → popup opens
  ↓
Popup checks: is user logged in?
  ├─ No → Show login link
  └─ Yes → Show "Save this article" button
       ↓
User clicks Save
  ↓
Popup sends message to background script
  ↓
Background script:
  1. Get current tab URL via chrome.tabs.query
  2. Inject content script if not already (extract article HTML)
  3. POST to /api/extension/quick-save with { url, html }
  4. Show success notification
  ↓
Popup updates: "Saved. Processing... (estimated 30s)"
  ↓
Popup polls /api/articles/:id/status every 5 seconds
  ↓
On status=PROCESSED → show "Open in KnowVault" link
```

### 10.4 Content Extraction

Use Mozilla's Readability.js (used by Firefox Reader Mode). Battle-tested for article extraction.

```typescript
// content-script.ts
import { Readability } from '@mozilla/readability';

function extractArticle(): ExtractedArticle | null {
  const documentClone = document.cloneNode(true) as Document;
  const reader = new Readability(documentClone);
  const article = reader.parse();

  if (!article) return null;

  return {
    title: article.title,
    byline: article.byline,
    content: article.content,
    textContent: article.textContent,
    length: article.length,
    excerpt: article.excerpt,
    siteName: article.siteName,
  };
}
```

---

## 11. Decisions Catalog

Quick reference for common decisions. Use when uncertain.

### Architecture decisions

- **Sync API operations:** Auth, user CRUD, simple reads. p95 < 500ms.
- **Async via queue:** Anything involving AI calls, embeddings, scraping. Return job ID, poll for status.
- **Streaming:** AI chat responses (later feature). Use Server-Sent Events.

### Data access

- **Read-heavy queries:** Direct Prisma in service.
- **Complex domain logic:** Repository pattern with interface in domain layer.
- **Multi-step transactions:** Use Prisma `$transaction`.
- **Aggregations:** Try Prisma `groupBy` first; raw SQL if needed; materialized view if frequently queried.

### Caching

- **AI responses:** Hash input + prompt version → cache for 24 hours.
- **Embeddings:** Permanent cache (embeddings don't change).
- **User preferences:** In-memory cache with TTL 5 minutes.
- **Search results:** No cache (user-specific, real-time expectations).

### Error handling

- **User-facing errors:** Catch in controller, return structured `{ errorCode, context }` for UI to translate via next-intl. See Section 12 (i18n) for full pattern. NEVER return localized strings from backend.
- **Internal errors:** Log full stack, return generic 500 with errorCode `INTERNAL_ERROR`.
- **AI errors:** Wrap with `AIProcessingError`, retry up to 3 times.
- **External service down:** Circuit breaker pattern (open after 5 consecutive failures).

### Testing depth

- **Domain entities:** 95%+ coverage with edge cases.
- **Services with logic:** Unit tests for branches.
- **Controllers:** Integration tests (request → response).
- **AI integration:** Mock provider in tests; use record/replay for occasional real tests.
- **E2E:** Critical flows only (save → process → review).

---

## 12. Internationalization (i18n)

This section was added in v1.1 to clarify language strategy after architectural review. It supersedes any conflicting guidance elsewhere in the PRD.

### 12.1 Strategy summary

**UI language:**

- Library: **next-intl** (Next.js App Router native, type-safe, Server Component compatible)
- Default locale: **English (`en`)**
- MVP delivers English UI only
- Vietnamese locale (`vi`) added in Phase 10 (Frontend Maturity) as polish work
- All UI strings externalized from day one — NO hardcoded strings in components

**Content language:**

- MVP (Phase 1-7): **English-only article support**
- Non-English articles rejected gracefully at save time with clear warning
- Phase 8+: Multi-language with auto-detection
- AI prompts assume English in MVP; localized prompts added in Phase 8+

### 12.2 Why this strategy

- **Portfolio-friendly:** English UI accessible to international recruiters/engineers
- **Aligns with dev tool conventions:** GitHub, Linear, Notion all default to English
- **Learning evidence:** i18n-ready architecture demonstrates real skill, not a "later" afterthought
- **Phased complexity:** Single-language MVP is simpler; multi-language as a deliberate exploration phase adds learning value
- **Honest scope:** No fake "10 languages supported" — just what's actually built

### 12.3 MVP implementation (Phase 1 onward)

**Setup:**

- Install next-intl per official App Router guide
- Configure locale routing: `/en/dashboard`, future `/vi/dashboard`
- Create `messages/en.json` with all UI strings
- Server Components fetch translations via `getTranslations()`
- Client Components use `useTranslations()` hook

**Conventions (enforced by CLAUDE.md):**

- NEVER hardcode user-facing strings
- All keys follow pattern: `<feature>.<element>.<variant>`, e.g., `articles.saveButton.label`, `auth.errors.invalidCredentials`
- Keys defined in TypeScript declaration file for type safety
- Pluralization via ICU MessageFormat: `{count, plural, =0 {No articles} =1 {1 article} other {# articles}}`

**Article language handling (MVP):**

```typescript
async saveArticle(dto: SaveArticleDto, userId: string) {
  // Quick language detection (cheap, local — using franc library)
  const detectedLang = detectLanguage(dto.content); // returns ISO 639-1

  if (detectedLang !== 'en') {
    throw new UnsupportedLanguageError(
      `Article appears to be in ${detectedLang}. ` +
      `Multi-language support is planned for Phase 8.`
    );
  }

  // Proceed with English-only pipeline
  return this.repository.save(/* ... */);
}
```

User sees friendly error: "Bài viết này không phải tiếng Anh. KnowVault hiện chỉ hỗ trợ tiếng Anh — đa ngôn ngữ sẽ được thêm trong Phase 8."

### 12.4 Phase 8+ multi-language plan

**Scope additions:**

- Article language auto-detected and stored in `Article.language` field
- AI prompts have language-specific versions (`extract-concepts.en.v1.ts`, `extract-concepts.vi.v1.ts`)
- PostgreSQL FTS configuration dynamic per article (`'english'`, `'simple'` for Vietnamese)
- Search results can span languages; UI shows article language badge
- Concept extraction prompts include language directive: "Respond in same language as input"

**Known limitations to document:**

- Vietnamese FTS uses `'simple'` config (no stemming) — accepted trade-off
- Cross-language concept matching is hard (Vietnamese "Bộ nhớ đệm" vs English "Cache") — Phase 8 explores embedding similarity for this
- Mixed-language articles (code-switched VN/EN) handled best-effort

### 12.5 i18n keys structure

`apps/web/messages/en.json`:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading..."
  },
  "auth": {
    "login": {
      "title": "Welcome back",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "submitButton": "Log in"
    },
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "tooManyAttempts": "Too many attempts. Try again in {minutes} minutes."
    }
  },
  "articles": {
    "list": {
      "empty": "No articles yet. Save your first article to get started!",
      "count": "{count, plural, =0 {No articles} =1 {1 article} other {# articles}}"
    },
    "save": {
      "success": "Article saved. Processing in background.",
      "errors": {
        "unsupportedLanguage": "Article appears to be in {language}. KnowVault currently supports English only — multi-language coming in Phase 8."
      }
    }
  }
}
```

### 12.6 Type safety

Generate TypeScript types from `en.json` so that `t('articles.list.empty')` is type-checked. Misspelled keys → compile error, not runtime.

```typescript
// apps/web/src/types/i18n.d.ts (auto-generated)
type Messages = typeof import('@/messages/en.json');
declare interface IntlMessages extends Messages {}
```

### 12.7 Backend i18n

NestJS backend largely doesn't need i18n in MVP because:

- API responses use machine-readable error codes (not human strings)
- UI translates error codes to localized messages
- Logs are English-only (standard practice)

Example pattern:

```typescript
// Backend returns:
{ errorCode: 'ARTICLE_LANGUAGE_UNSUPPORTED', context: { language: 'vi' } }

// Frontend translates:
const t = useTranslations('articles.save.errors');
t('unsupportedLanguage', { language: getLanguageName(errorCode.context.language) });
```

This separation keeps backend simple and pushes localization to where it belongs (UI layer).

### 12.8 Phase Plan integration

- **Phase 1:** Setup next-intl, externalize all strings, English `messages/en.json` complete
- **Phase 2-7:** Continue adding English keys as features are built; reject non-English articles gracefully
- **Phase 8:** Multi-language content support (article detection, localized AI prompts, multi-language FTS)
- **Phase 10:** Vietnamese UI locale (`messages/vi.json`), locale switcher in UI, locale persistence per user

---

## 13. Phase Plan (timing approximate)

Each phase has clear deliverables and Exploration touchpoints.

### Phase 0: Project Setup (Week 1)

- Initialize pnpm monorepo
- Setup Next.js, NestJS, Prisma, Neon
- Configure ESLint, Prettier, Husky
- Setup GitHub repo, Actions skeleton
- Create initial README, CLAUDE.md adapted
- Setup Sentry, basic logging
- **Deliverable:** Empty but well-configured monorepo with working dev environment

### Phase 1: Foundation (Week 2-3)

- Implement domain model (entities, value objects)
- Implement Prisma schema, run migrations
- Implement Auth module (register, login, refresh, JWT)
- Implement basic Article CRUD (no AI processing yet)
- Implement basic Next.js app (login, register, articles list page)
- Setup testing framework, write first unit tests
- **Exploration 1 — Approach A:** PostgreSQL FTS search
- **Exploration 4 — Approach A:** Service-direct Prisma
- **Exploration 5 — Approach A:** Local state with useState
- **Deliverable:** Can register, login, save articles (manually paste content), search articles

### Phase 2: AI Processing Pipeline (Week 4-5)

- Implement AI provider abstractions (Gemini, OpenAI)
- Implement BullMQ setup with Redis
- Implement article processing pipeline (stages 1-5)
- Implement prompt templates with versioning
- Implement AI quality evaluation framework (manual rating)
- Build dashboard showing processing status, costs
- **Exploration 2 — Approach A → B:** Synchronous → Fire-and-forget
- **Exploration 3 — Approach A:** Baseline AI costs
- **Deliverable:** Articles processed end-to-end. Concepts extracted. Questions generated. Costs tracked.

### Phase 3: Browser Extension + Save UX (Week 6)

- Implement browser extension (Manifest V3)
- Implement content extraction (Readability.js)
- Implement quick-save endpoint
- Polish save UX in main app
- **Deliverable:** 1-click save from any webpage with sub-200ms confirmation

### Phase 4: Review System + Concept Linking (Week 7-8)

- Implement SM-2 algorithm in domain layer with property-based tests
- Implement review queue API
- Implement review UI flow
- Implement AI answer evaluation
- Implement concept linking (AI suggestions + manual)
- Implement knowledge graph visualization (basic)
- **Exploration 4 — Approach B:** Migrate to Repository pattern
- **Exploration 5 — Approach B:** TanStack Query + Zustand
- **Deliverable:** Daily review flow working. Concepts visible. Graph navigable.

### Phase 5: Notes + Highlights (Week 9)

- Implement Note CRUD with markdown rendering
- Implement Highlight feature in article reader
- Implement note-to-concept tagging
- AI-suggested concept tags for notes
- **Deliverable:** Can annotate articles. Notes searchable. Tags work.

### Phase 6: Search Evolution (Week 10-11)

- **Exploration 1 — Approach B:** Implement vector search with pgvector
- Benchmark vs Approach A
- **Exploration 1 — Approach C:** Hybrid search + reranking
- Final ADR with benchmarks
- **Deliverable:** Best-in-class search with documented trade-offs

### Phase 7: Background Processing Maturity (Week 12)

- **Exploration 2 — Approach C:** Migrate to BullMQ with proper patterns
- Implement job monitoring dashboard
- Implement retry policies, dead letter queues
- Document operational patterns
- **Deliverable:** Production-grade async processing

### Phase 8: AI Cost Optimization (Week 13)

- **Exploration 3 — Approach B:** Content deduplication
- **Exploration 3 — Approach C:** Layered caching, batch processing, few-shot prompts
- Measure cost reduction, document
- **Deliverable:** Cost per article reduced significantly with data

### Phase 9: Data Layer Optimization (Week 14)

- **Exploration 4 — Approach C:** EXPLAIN ANALYZE profiling
- Add strategic indexes
- Implement materialized views for analytics
- Document query optimization with before/after
- **Deliverable:** Performance benchmarks showing improvements

### Phase 10: Frontend Maturity (Week 15)

- **Exploration 5 — Approach C:** Design system + Storybook
- Visual regression tests
- Accessibility audit
- Performance audit (Lighthouse)
- **Deliverable:** Polished UI with component library

### Phase 11: Security Hardening (Week 16-17)

- **Exploration 6 — All Approaches**
- STRIDE threat modeling for save flow, AI processing
- OWASP Top 10 verification
- Manual pen-testing of auth, authz, input validation
- Snyk/npm audit integration in CI
- Security headers, CSP
- Document security posture
- **Deliverable:** Comprehensive security audit document, automated security checks in CI

### Phase 12: Polish + Portfolio Prep (Week 18)

- Write comprehensive README
- Create demo video/walkthrough
- Write portfolio article based on Vision Section 11
- Anonymize and prepare public demo
- Final ADR review, postmortem of project
- **Deliverable:** Project ready for portfolio presentation

---

### Future explorations (post-MVP, optional)

These are documented as known opportunities, not committed work. Implement only if value is clear and current state is stable.

#### Future Exploration A: Prisma 7 Upgrade

**Timing:** Post-Phase 12, after MVP completion and stability proven

**Why considered:**

- Rust-free, ESM-first, generally faster than Prisma 6
- Better TypeScript integration
- Stays current with ORM evolution
- Documents migration learnings for portfolio

**Why deferred from MVP:**

- pgvector + Prisma 7 had compatibility issues at project start (verified via GitHub issues)
- Breaking changes require architectural shift (prisma.config.ts, ESM-only, explicit env loading)
- Driver adapter pattern requires PrismaService refactor
- Scope creep risk for Phase 0/1 — would delay core feature work

**Required artifacts when undertaken:**

- ADR documenting Prisma 6 → 7 decision
- Pre-migration benchmark (query performance, build times, bundle size)
- Migration plan with rollback strategy
- Post-migration benchmark comparison
- Postmortem of any issues encountered
- Updates to all schema files, prisma.config.ts setup
- Verify pgvector still works (current blocker for early migration)
- Update CLAUDE.md stack constants

**Skill evidenced:** Major version upgrade workflow, breaking change management, dependency risk assessment

**Estimated effort:** 1-2 weeks if pgvector works, indefinitely if pgvector issue persists

#### Future Exploration B: Multi-language Content Pipeline

(See Section 12.4 — already planned for Phase 8+)

#### Future Exploration C: Open-source release polish

Possible work to make KnowVault genuinely usable by other developers:

- Comprehensive contributing guide
- Docker-compose for full local stack (deviation from current strategy, documented in ADR)
- Hosted demo environment
- API documentation via OpenAPI
- npm package for `@knowvault/shared` types

---

## 14. Testing Strategy

Tests written from day one. No "no tests" phase.

### 13.1 Test Pyramid

**Unit tests (largest layer):**

- All domain entities and value objects
- All domain services (SM-2 algorithm, knowledge graph)
- All pure functions in services
- Run on every save (watch mode)
- Target: < 5 seconds total

**Property-based tests:**

- SM-2 algorithm (critical correctness)
- Embedding similarity computations
- Knowledge graph traversals
- Use `fast-check` library

**Integration tests:**

- Repository layer against real database (testcontainers)
- Module controllers with full module loaded
- BullMQ workers with real Redis
- Run in CI on every PR
- Target: < 2 minutes total

**E2E tests:**

- Critical flows: register → save → process → review
- Run nightly + on release branches
- Use Playwright

**Mutation testing:**

- Run weekly on domain layer
- Use Stryker
- Catch tests that pass without actually testing

### 13.2 Coverage Targets

| Layer                  | Target | Measurement                |
| ---------------------- | ------ | -------------------------- |
| Domain                 | 95%+   | Strict, including branches |
| Application (services) | 80%+   | Line coverage              |
| Infrastructure         | 60%+   | Integration tests dominate |
| Controllers            | 70%+   | Integration tests          |
| Overall                | 75%+   | Codecov in CI              |

### 13.3 Test Patterns

**Example: SM-2 property test**

```typescript
import { fc } from 'fast-check';
import { calculateSM2 } from '@/domain/review/sm2.service';

describe('SM-2 algorithm', () => {
  it('always produces interval >= 1 day', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.float({ min: 1.3, max: 2.5 }),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 0, max: 100 }),
        (quality, easiness, interval, repetitions) => {
          const result = calculateSM2({ quality, easiness, interval, repetitions });
          expect(result.interval).toBeGreaterThanOrEqual(1);
        }
      )
    );
  });

  it('quality 0 always resets repetitions', () => {
    fc.assert(
      fc.property(/* generators */, (state) => {
        const result = calculateSM2({ ...state, quality: 0 });
        expect(result.repetitions).toBe(0);
      })
    );
  });
});
```

---

## 15. Security Baseline (Phase 1 onward)

Even before Exploration 6, these are non-negotiable from day one:

- **Passwords:** bcrypt 12 rounds, never logged
- **JWT:** Access 15m, Refresh 7d (httpOnly cookie, hashed in DB)
- **Refresh rotation:** Each use invalidates old token
- **HTTPS only:** In production, enforce via headers
- **CORS:** Whitelist specific frontend domain
- **Helmet:** Default secure headers
- **Input validation:** class-validator on every DTO
- **SQL injection:** Prisma parameterizes by default
- **userId from JWT:** Never from request body/params
- **Rate limiting:** Per-IP for auth, per-user for AI endpoints
- **Secrets:** Never in code, only in env vars
- **No PII in logs:** Use structured logging with PII redaction

---

## 16. Environment Variables

`apps/api/.env.example`:

```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL="postgresql://...?sslmode=require&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://...?sslmode=require"

# Redis (Upstash)
REDIS_URL="redis://..."

# Auth
JWT_ACCESS_SECRET=<256-bit>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<256-bit-different>
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# AI Providers
GEMINI_API_KEY=<from-aistudio>
OPENAI_API_KEY=<from-openai>

# File storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Observability
SENTRY_DSN=
LOG_LEVEL=info

# Rate limits
RATE_LIMIT_AUTH_PER_MIN=5
RATE_LIMIT_AI_PER_DAY=100
```

`apps/web/.env.local.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SENTRY_DSN=
```

`apps/extension/.env.example`:

```bash
API_BASE_URL=http://localhost:3001/api
```

---

## 17. Definition of Done (per feature)

A feature is "done" when ALL of these hold:

1. **Implemented per spec** in this PRD
2. **Tests written:** Unit tests for logic, integration tests for endpoints
3. **Test coverage targets** met for the layer
4. **TypeScript strict mode** passing, no `any` without justification comment
5. **Linted** (ESLint passing)
6. **Input validation** via DTO with class-validator
7. **Authentication enforced** unless explicitly `@Public()`
8. **userId from JWT** never from request body
9. **Rate limit applied** if endpoint touches AI
10. **Error handling:** Backend returns structured `{ errorCode, context }`, frontend renders user-friendly English message via next-intl. NO hardcoded strings in components.
11. **Logged appropriately:** Structured logs at INFO for business events, ERROR for failures
12. **Documented:** If decision was made, ADR written
13. **Frontend:** Loading states, error states, empty states
14. **Frontend:** Mobile responsive (tested at 375px)
15. **Frontend:** Accessibility (keyboard nav, ARIA where needed)

---

## 18. What this PRD does NOT cover

Intentionally out of scope for this document:

- **Detailed UI designs** — that's the role of the Design Brief (separate doc)
- **Specific prompt templates** — versioned in code, evolved during builds
- **Detailed phase-by-phase tasks** — too granular; phase plan above suffices
- **Operational runbooks** — written during build as needed in `/docs/runbooks/`
- **Architecture Decision Records** — written during build in `/docs/adr/`

---

## 19. Next Steps After PRD Approval

1. **Create CLAUDE.md** adapted for this learning-driven project
2. **Initialize repository** with monorepo structure
3. **Begin Phase 0** (project setup)
4. **First Exploration**: Choose between starting with Phase 1 features OR Exploration 6 (Security baseline)

---

## Appendix A: Quick Reference for Claude Code

### Critical conventions

- Domain layer in `apps/api/src/domain/` is PURE — no NestJS, no Prisma imports
- Repository interfaces in domain, implementations in `infrastructure/`
- DTOs for ALL API input with class-validator
- All endpoints behind JwtAuthGuard except `@Public()`
- userId from `@CurrentUser()` decorator, never from request
- All AI calls go through provider abstraction (no direct Gemini/OpenAI imports outside `modules/ai/`)
- Tests in same folder as code (`*.spec.ts` next to source)
- ADRs in `/docs/adr/NNNN-title.md` format with template

### File structure quick reference

- New feature → `apps/api/src/modules/<feature>/`
- New domain concept → `apps/api/src/domain/<concept>/`
- New AI provider → `apps/api/src/modules/ai/providers/`
- New shared type → `packages/shared/src/types/`
- New ADR → `docs/adr/NNNN-decision-title.md`

### Stack constants (do not change without ADR)

- `nestjs: 10.x`
- `prisma: 6.x` (Prisma 7 considered — see Phase 8+ exploration note in Section 12)
- `next: 14.x`
- `pnpm: 9.x`
- `node: 20.x LTS`

---

**End of Technical PRD**

When implementing, always reference Product Vision v3 for the "why" and this PRD for the "how". When uncertain, ask before deviating.
