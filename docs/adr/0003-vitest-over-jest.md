# ADR-0003: Vitest over Jest for Unit and Component Tests

**Status:** Accepted
**Date:** 2026-06-24
**Deciders:** Đạt
**Context:** Phase 1, Testing setup

## Context

PRD originally specified Jest for backend unit tests and Vitest for frontend.
During Phase 1 testing setup, encountered friction with Jest + Node16 moduleResolution.

## Decision

Use Vitest for both backend (NestJS) and frontend (Next.js). Keep Playwright for E2E.

## Alternatives Considered

### Jest (original plan)

- Pros: NestJS default, large ecosystem
- Cons: Requires ts-jest + moduleNameMapper workarounds for Node16 `.js` extensions

### Vitest (chosen)

- Pros: Native TypeScript/ESM, no workarounds needed, faster, consistent API across monorepo
- Cons: Less NestJS-specific documentation

## Consequences

- Consistent test tooling across the entire monorepo
- Single API to learn (`vi.mock()` everywhere)
- No `ts-jest` dependency or Babel transform needed
- E2E stays Playwright — no change
