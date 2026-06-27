# Project Rules — ENFORCED ON EVERY ACTION

> These rules apply to every file, line, and decision. No exceptions. No rule may be violated — not even once.
> Before writing any code: search the codebase for existing implementations. Reuse. Never duplicate.

---

## COLORS & TOKENS

```
✅ var(--clr-acc)        ❌ #C47A3A
✅ var(--font-main)      ❌ font-family: 'Inter'
```
- Global colors → `colors.css` only. Local-only color (1 file only) → top of that file only.
- Font-family, colors: never hardcoded anywhere, ever.
- CSS var names, JS vars, functions, DB fields → max 5–6 chars, recognizable short forms.
  - `empId`, `attSt`, `fmtDt()`, `emp_id`, `--clr-acc`, `.t-ttl`

---

## COMPONENTS & FILES

- Component used 2+ places → `ui/` folder, one self-contained file (JSX + CSS + logic together — nothing left outside).
- Organize by feature: `features/auth/`, `features/emp/`. Related code, styles, types, assets stay together.
- Avoid both: oversized files AND unnecessary splitting/nesting/single-file folders.
- File obviously too long to scroll → split. No fixed limit — use judgment.
- One file = one responsibility.
- Folders and files → logical, short names.

---

## CSS & STYLES

- CSS classes first. Inline `style` only for truly dynamic values (computed px, positions).
- Style block **5+ lines** repeated **2+ places** → extract to its own `.css` file, import where needed.
- Single property repeated **5+ times** across project → utility class in `index.css`.
- `index.css` = truly global only:
  - Used on **zyadatar (most) pages** ✅
  - Under **7 lines** ✅
  - 7+ lines → own `.css` file
  - Styles of **same type used together** → keep in same page file, don't split to index.css
- No duplicate, no override, no dead CSS — anywhere in the project.
- Max **5% unused styles** per page load.

---

## COMMENTS

```
❌ // This function calculates the total attendance for an employee
✅ /* calc att */
```
- Almost no comments. Only truly non-obvious logic gets one.
- Max **3 words** per comment. Self-explanatory code is always preferred.

---

## NO DUPLICATION — ZERO TOLERANCE

```
❌ Same logic in 2 files       ✅ Shared function, called from both
❌ Same 2 CSS lines anywhere   ✅ Utility class or shared file
❌ Same component rebuilt       ✅ Import from ui/
```
- Before creating anything: search entire codebase. Similar = duplicate.
- No duplicate logic, styles, types, utilities, validations, configs — anywhere.
- No 2 identical lines anywhere in the project.

---

## DEAD CODE — REMOVE IMMEDIATELY

- Unused imports, variables, functions, CSS classes, keyframes → delete
- Overridden styles (same property declared twice) → merge, delete duplicate
- `console.log` → **forbidden**, remove before commit
- `console.error` → only genuine runtime errors, never sensitive data

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

- Smooth transitions everywhere. Easing/duration in `index.css` as CSS vars — never hardcoded in JS.
- Navigation animations reflect direction:
  - Forward/deep → slide from right
  - Back → slide from left
  - Bottom nav → slide from bottom
- Components animate on enter/exit. User must feel navigation happened.

---

## CODE QUALITY

- No unnecessary conditions. If default logic works → use it, don't re-implement.
- No verbose "working" code. Shortest correct implementation wins.
- `key` in lists → unique ID only, never array index.
- `useEffect` → clean deps array, no unnecessary dependencies.
- Heavy compute → `useMemo` mandatory.
- Search/input fields → debounce **300ms**.
- `React.memo` on pure components. `useMemo`/`useCallback` on expensive ops.

---

## UI FREEZE ON UPDATES

When updating existing code:
```
✅ Internal logic, backend, efficiency   → optimize freely
❌ Visual output, layout, behavior, animations → must not change even 1%
```
User-visible result stays identical. Only efficiency improves.

---

## SOURCE OF TRUTH

| What | Where |
|------|-------|
| Colors | `colors.css` `:root` |
| Global styles | `index.css` |
| Shared components | `ui/` |
| DB structure | Database schema (authoritative) |
| API contracts | OpenAPI spec (authoritative) |
| Frontend types / hooks / Zod schemas | Generated from OpenAPI spec — never manual duplicates |

---

## BLUEPRINT

- Project has one `BLUEPRINT.md` at root.
- Every new feature, component, API, DB table, config → add to blueprint immediately.
- If it's not in blueprint → it doesn't officially exist.

---

## LOAD BUDGET — MAX 5% UNUSED

- Per page: max 5% unused JS, CSS, or assets may load.
- Route-based code splitting. Each page = its own chunk. Bundle max **150kb gzipped**.
- Lazy load everything not needed on first screen. `React.lazy()` + `<Suspense>`.
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
- `will-change` → animated elements only; forbidden everywhere else (memory waste)
- Service Worker → asset caching + offline support

**Backend**
- Lists → paginated, default page size 20
- Response → needed fields only. `SELECT *` forbidden.
- N+1 queries forbidden. Foreign keys → indexed.
- Frequent query fields → composite index.
- Static/config data → cached. `Cache-Control` headers set.
- DB connection pooling mandatory. DB timeout set.
- Long tasks → background queue (never block API response).
- `gzip`/`brotli` compression on all responses.
- Passwords, tokens, cards → never logged anywhere, not even in `console.error`.

**Network**
- Multiple API calls → batch where possible
- `ETag`/`Last-Modified` on cacheable responses
- HTTP/2 enabled
- `<link rel="dns-prefetch">` for third-party domains
- Critical CSS inlined in `<head>`

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
- Payload 50kb+ → 50kb chunks, send parallel.
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
- 5 errors → OPEN (10s)
- 1 probe → success: CLOSED / fail: OPEN (20s)
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
- Never log sensitive data (passwords, tokens, card numbers) — anywhere.

---

## META RULE

**Every implementation must automatically use the best possible approach — performance, security, maintainability. If a better way exists, use it. "It works" is never enough.**
