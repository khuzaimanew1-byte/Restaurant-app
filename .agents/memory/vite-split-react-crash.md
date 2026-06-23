---
name: Vite split-React crash
description: "Invalid hook call" crash caused by Replit WebSocket drop + Vite dep re-optimisation creating two React instances in one page session.
---

## The bug

`TypeError: Cannot read properties of null (reading 'useState')` at `LoginFlow` (or any component).

Error stack shows **two different React chunk hashes** coexisting in the same session:
- Old chunk (loaded at page-load time): `chunk-Y6766AZC.js?v=ae08292f`
- New chunk (loaded after dep re-optimisation): `react.js?v=325306d3`

## Root cause chain

1. Replit's WebSocket proxy hard-drops every ~35 s.
2. `viteHmrReconnect` plugin in `vite.config.ts` patches Vite's `client.mjs` to call `transport.connect()` instead of `location.reload()` after reconnect (to prevent visible page flash).
3. While disconnected, Vite detected a lockfile change and re-optimised deps → React chunk renamed AND hash changed.
4. After reconnect (without reload), old React chunks remain in browser memory.
5. Newly lazy-loaded modules get the new React chunk.
6. Two React singletons → hooks break → crash.

**Key insight:** The `vite:full-reload` message Vite sent after dep re-optimisation was DROPPED because the WebSocket was down at that exact moment. After reconnect, Vite doesn't re-send it.

## The fix (in `artifacts/onboarding/vite.config.ts`)

`viteHmrReconnect` plugin now does a dep-hash check before deciding:

```
After waitForSuccessfulPing:
  1. fetch /node_modules/.vite/deps/_metadata.json (no-store)
  2. Compare serverHash (meta.browserHash) vs clientHash (window.__viteDepHash)
  3. If different → location.reload()   ← deps changed, MUST reload
  4. If same     → transport.connect()  ← safe fast reconnect, no flash
```

Initial hash is captured by Patch 2 appended to `client.mjs`: a fetch of `_metadata.json` that sets `window.__viteDepHash` when the module first evaluates (~page load time, long before any 35-s disconnect).

## Why

**Why:** Without this check, any code change that triggers Vite dep re-optimisation (e.g. adding a new npm import, pnpm lockfile update from running `pnpm typecheck`) will cause the next WebSocket-drop/reconnect to crash the whole app with an "Invalid hook call" error that looks like a React bug but is actually an infrastructure issue.

**How to apply:** The fix is self-contained in `viteHmrReconnect` in `vite.config.ts`. No other changes needed. If the regex pattern in client.mjs ever stops matching (Vite version bump), the plugin logs a warning and falls back to Vite's default `location.reload()` — safe fallback.

## Triggering condition

Any action that causes pnpm's lockfile to update will trigger Vite dep re-optimisation on next server start. Common triggers: `pnpm typecheck`, `pnpm build`, `pnpm add`, creating a new file that imports a previously unseen dep.
