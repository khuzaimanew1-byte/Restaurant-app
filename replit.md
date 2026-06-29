# Project Rules — ENFORCED ON EVERY ACTION

> These rules apply to every file, line, and decision. No exceptions. No rule may be violated — not even once.
> Before writing any code: search the entire codebase for existing or similar implementations. Similar = duplicate. Reuse, extend, or centralize. Never duplicate logic, styles, patterns, utilities, validations, or configurations.

---

## ABSOLUTE: UI & OUTPUT NEVER CHANGES

```
✅ Internal logic, backend, efficiency   → optimize freely
❌ Visual output, layout, behavior, animations, results → must not change even 1%
```
Applying these rules must never alter what the user sees or experiences — not even slightly. Zero visual change. Zero output change.

---

## COLORS & TOKENS

```
✅ var(--clr-acc)        ❌ #C47A3A
✅ var(--font-main)      ❌ font-family: 'Inter'
```
- Global colors → `colors.css` only. Local-only color (1 file) → top of that file only.
- Font-family, colors: never hardcoded anywhere, ever.
- All custom names (CSS vars, JS vars, functions, DB fields) → max 5–6 chars, recognizable short forms:
  - `empId`, `attSt`, `fmtDt()`, `emp_id`, `--clr-acc`, `.t-ttl`

---

## COMPONENTS & FILE OWNERSHIP

- Component used 2+ places → `ui/` folder, one self-contained file. JSX + CSS + logic together — nothing left outside.
- Component's related logic existing in another page/file → move it into the component file. Exception: global styles, another UI file.
- Small separated code → do NOT combine if it's a UI component or its background style. Keep it separate and self-contained.
- Organize by feature: `features/auth/`, `features/emp/`. Related UI, logic, styles, types, assets stay together.
- Avoid both: oversized files AND unnecessary splitting, nesting, or single-file folders.
- File obviously too long → split. No fixed limit — judge by scrollability.
- Folders and files → logical, short names. One file = one responsibility.

---

## CSS & STYLES

- CSS classes first. Inline `style` only for truly dynamic values (computed px, positions).
- Style block **5+ lines**, repeated **2+ places** → extract to its own `.css` file, import where needed.
- Single property repeated **5+ times** across project → utility class in `index.css`.
- `index.css` rules:
  - Only truly global styles used on **most pages** ✅
  - Must be **under 7 lines** ✅
  - 7+ lines → own `.css` file ✅
  - Same-type styles used together → keep in same page file, not index.css ✅
  - Max **5% unused styles** per page load ✅
- No duplicate, no override, no dead CSS — anywhere in the project.

---

## COMMENTS

```
❌ // This calculates total attendance for employee
✅ /* calc att */
```
- Almost no comments. Only truly non-obvious logic.
- Max **3 words** per comment.

---

## DEAD CODE — REMOVE IMMEDIATELY

- Unused: imports, variables, functions, CSS classes, keyframes → delete
- Overridden styles (same property twice) → merge, delete duplicate
- `console.log` → **forbidden**, remove before commit
- `console.error` → only genuine runtime errors, never sensitive data

---

## NO DUPLICATION — ZERO TOLERANCE

```
❌ Same logic in 2 files       ✅ Shared function, called from both
❌ Same 2 CSS lines anywhere   ✅ Utility class or shared file
❌ Same component rebuilt       ✅ Import from ui/
```
- No 2 identical lines anywhere in the project.
- No duplicate logic, styles, types, utilities, validations, configs.

---

## MODALS

- Normal modal → mount on trigger, unmount on close immediately.
- Large modal (only when explicitly specified):
  ```
  Open        → mount immediately
  Close       → 30s countdown then unmount
  Reopen <30s → cancel countdown, stay mounted
  ```

---

## ANIMATIONS

- Smooth transitions everywhere. Easing/duration → `index.css` CSS vars only, never hardcoded in JS.
- Navigation animations reflect direction:
  - Forward/deep → slide from right | Back → slide from left | Bottom nav → slide from bottom
- Components animate on enter/exit. User must clearly feel navigation happened.

---

## CODE QUALITY

- No unnecessary conditions. Default logic works → use it, don't re-implement.
- Shortest correct implementation wins. Verbose "working" code → forbidden.
- `key` in lists → unique ID only, never array index.
- `useEffect` → clean deps array, no unnecessary dependencies.
- Heavy compute → `useMemo` mandatory. Search/input → debounce **300ms**.
- `React.memo` on pure components. `useMemo`/`useCallback` on expensive ops.

---

## SOURCE OF TRUTH

| What | Where |
|------|-------|
| Colors | `colors.css` `:root` |
| Global styles | `index.css` |
| Shared components | `ui/` |
| DB structure | Database schema (authoritative) |
| API contracts | OpenAPI spec (authoritative) |
| Frontend types / hooks / Zod | Generated from OpenAPI — never manual duplicates |

---

## BLUEPRINT

- One `BLUEPRINT.md` at project root.
- Every new feature, component, API, DB table, config → add to blueprint immediately.
- Not in blueprint → doesn't officially exist.

---

## LOAD BUDGET — MAX 5% UNUSED PER PAGE

- Route-based code splitting. Each page = its own chunk. Bundle max **150kb gzipped**.
- `React.lazy()` + `<Suspense>` for everything not needed on first screen.
- `<link rel="preload">` for fonts and hero images.
- 3rd party scripts → `defer`/`async` only.
- Library imports → partial only:
  ```
  ✅ import { debounce } from 'lodash'
  ❌ import _ from 'lodash'
  ```

---

## PERFORMANCE

**Frontend**
- Lists 50+ items → `react-window` (virtual scroll)
- Images → `loading="lazy"`, WebP, max 200kb, explicit `width`+`height`
- SVG under 2kb → inline (saves HTTP request)
- Only used font weights load
- Heavy compute → Web Workers (never block main thread)
- `IntersectionObserver` → render/animate only when in viewport
- `will-change` → animated elements only; forbidden everywhere else
- Service Worker → asset caching + offline support

**Backend**
- Lists → paginated, default page size 20
- Response → needed fields only. `SELECT *` forbidden.
- N+1 queries forbidden. Bulk operations supported. Foreign keys → indexed.
- Frequent query fields → composite index.
- Static/config data → cached. `Cache-Control` headers set.
- DB connection pooling mandatory. DB timeout set.
- Long tasks → background queue (never block API response).
- `gzip`/`brotli` compression on all responses.
- Passwords, tokens, cards → never logged anywhere.

**Network**
- Batch multiple API calls where possible
- `ETag`/`Last-Modified` on cacheable responses
- HTTP/2 enabled
- `<link rel="dns-prefetch">` for third-party domains
- Critical CSS inlined in `<head>`
- Images WebP, max 200kb. SVG under 2kb → inline.
- Only used font weights load.

---

## REQUEST MANAGEMENT

**Queue & Memory**
- Requests → IndexedDB. RAM holds max **3 active requests**.
- Complete → delete from RAM + IndexedDB immediately.
- Tab close → flush RAM, persist IndexedDB, resume on return.
- Every 5min: purge completed. Purge cache 1hr+. Storage >80% → delete oldest P3.

**Batching**
| Requests | Batch | Delay |
|----------|-------|-------|
| 1–3 | immediate | 100ms |
| 4–15 | 3 | 500ms |
| 16–40 | 8 | 1s |
| 41–100 | 15 | 2s |
| 100+ | 25 | 3s + backpressure |

**Chunking**
- Payload 50kb+ → 50kb chunks, parallel send.
- Retry failed chunk only — not whole request.

**Deduplication**
- Same request in-flight → drop new, share existing response.
- Response cached **30s** → return from cache, skip API call.

**Priority**
| Level | Type | Behavior |
|-------|------|----------|
| P0 | Critical | Bypass queue (auth) |
| P1 | High | Next batch (user actions) |
| P2 | Normal | Normal queue |
| P3 | Low | Idle only; flood → silently drop |

**Circuit Breaker**
- 5 errors → OPEN (10s). 1 probe → success: CLOSED / fail: OPEN (20s).
- Retry: `1s → 2s → 4s → 8s`. Max 3 retries. Timeout 30s.

**Compression & Isolation**
- Payload 1kb+ → gzip. Strip nulls/undefined from JSON.
- Binary → ArrayBuffer. base64 forbidden.
- Per account: `acc_{id}_queue`, `acc_{id}_cache`, `acc_{id}_failed`
- Memory: active account data only.

---

## SECURITY

- Sanitize input on frontend too — stop bad data before it travels.
- Rate limiting on all API endpoints.
- HTTPS only. Redirect HTTP.
- JWT: short expiry + refresh token pattern.
- CORS: `*` forbidden in production.
- Never log sensitive data (passwords, tokens, cards) — anywhere.

---

## META RULE

**Every implementation must automatically use the best possible approach — performance, security, maintainability. If a better way exists, use it. "It works" is never enough.**
