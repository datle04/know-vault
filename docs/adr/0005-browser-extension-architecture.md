# ADR-0005: Browser Extension Architecture

**Status:** Accepted  
**Date:** 2026-06-28  
**Deciders:** Đạt  
**Context:** Phase 3 — Browser Extension

## Context

KnowVault needs a browser extension so users can save articles directly from any webpage without switching to the web app. The extension must extract article content, authenticate with the NestJS backend, and trigger AI processing.

Key constraints:

- Chrome Manifest V3 (required for new extensions — MV3 is mandatory since June 2024)
- Service worker replaces persistent background page (MV3 breaking change)
- Content Security Policy: no inline scripts, no `eval`
- Auth token cannot live in `localStorage` (not accessible in service worker)

## Decision

**Manifest V3 with three separate execution contexts:**

1. **Popup** (React mini-app) — UI only, no direct API calls
2. **Service worker** (background) — owns auth token, makes all API calls
3. **Content script** — injected into page context, extracts DOM content only

All communication via `chrome.runtime.sendMessage` with type-safe discriminated union contracts (`shared/messages.ts`).

**Token storage:** `chrome.storage.session` — cleared on browser close, not accessible cross-origin.

**Content extraction:** Readability.js in content script (has DOM access), result sent to service worker which calls `/api/extension/quick-save`.

**Build:** Vite with multiple entry points — one bundle per execution context.

## Alternatives Considered

### Alternative A: Single content script does everything (API calls included)

- Pros: Simpler architecture, fewer message passing hops
- Cons: Content script runs in page context — CORS blocks API calls unless `host_permissions` broad. Token exposed to page's JS environment (XSS risk). Violates MV3 best practices.

### Alternative B: Popup calls API directly

- Pros: No service worker needed for simple saves
- Cons: Service worker dies between popup opens — token in memory would be lost. `chrome.storage` access from popup is possible but token would need to pass through popup context.

### Why chosen architecture

Separation matches MV3's intended model: service worker = trusted execution environment for auth/network, content script = untrusted page context for DOM only, popup = ephemeral UI. This minimizes attack surface and aligns with Chrome's security model.

## Consequences

**Easier:**

- Auth token never exposed to page JS context
- Each context has single responsibility
- Type-safe message contracts catch integration errors at compile time

**Harder:**

- Message passing adds async complexity
- Service worker lifecycle (dies after ~30s idle) means no in-memory state
- Debugging requires opening DevTools for each context separately

## References

- PRD Section 10 — Browser Extension specification
- `apps/extension/src/shared/messages.ts` — Message contracts
- `apps/extension/public/manifest.json` — MV3 manifest
- Chrome MV3 migration guide
