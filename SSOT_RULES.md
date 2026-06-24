# SSOT RULES — PROJECT LAW
> Every single line of code across the entire project must follow these rules.
> Violating even one rule is strictly forbidden — no exceptions, no workarounds.
> These rules apply automatically to every file, component, style, function, and query — without being told.

---

## 🔴 CRITICAL META-RULE
**Har implementation mein automatically best practice apply karo — performance, security, aur maintainability ke liye. Koi cheez explicitly mention na ho tab bhi optimal solution choose karo. Mediocre ya "working" solution kabhi acceptable nahi — hamesha best possible approach use karo.**

**Ye rules poore project ke codes pe apply karna — jahaan kahaan bhi hota hai — aik bhi line in rules ko violate nahi kare. Strictly forbidden hai.**

---

## 🎨 COLORS

- **Global colors** → sirf `colors.css` (ya `index.css` `:root`) mein define hon
- **Local-only color** (sirf 1 file mein use ho) → usi file ke top mein define karo
- **Hardcoded color values forbidden** — `#fff`, `rgba(...)` direct components mein kabhi nahi
- Hamesha `var(--clr-x)` use karo
- `font-family` bhi same rule — sirf ek jagah define, `var(--font-main)` se use
- Font-family aur colors strictly restricted hain ke wo hardcoded na hon — kabhi bhi, kahin bhi

---

## ✂️ NAMING — MAX 5–6 CHARACTERS

Yeh rule **sirf custom names** pe apply hota hai:

| Type | Example |
|------|---------|
| CSS variable | `--bg`, `--acc`, `--txt`, `--brd` |
| CSS class | `.chip`, `.bnav`, `.t-ttl`, `.modal` |
| JS variable | `empId`, `attSt`, `usrNm` |
| Function name | `fmtDt()`, `calcAtt()`, `getEmp()` |
| DB field | `emp_id`, `att_st`, `usr_nm` |

Recognizable abbreviations use karo — `att` = attendance, `emp` = employee, `st` = status, `acc` = accent.

---

## 🧩 COMPONENTS

- Koi bhi component jo **2+ jagah use ho** → `ui/` folder mein alag `.jsx` file mein nikalo
- Nikaalte waqt **teeno cheezein saath** rakho:
  1. **JSX/HTML** — component structure
  2. **CSS** — component ki styling (same folder mein `.css`)
  3. **Logic/JS** — agar koi logic hai toh woh bhi usi file mein
- Ek component = ek self-contained file — kuch bahar nahi chootna chahiye

---

## 🖌️ CSS & STYLING

- **CSS classes first** — inline `style` sirf truly dynamic values ke liye (positions, computed heights)
- **Repeat style rule:**
  - Style block **5+ lines** ho aur **2+ jagah repeat** ho → alag `.css` file banao, wahan se import karo
  - **Ek line property jo 5+ baar repeat ho** → `index.css` mein utility class banao (e.g. `.flex-c`)
- **Duplicate ya override styles forbidden** — same property same selector pe 2 baar nahi
- **Dead CSS forbidden** — unreferenced class, variable, keyframe delete karo

### index.css Rules (Strict)
- `index.css` mein **sirf truly global styles** — jo zyadatar pages pe apply hon
- Style `index.css` mein tabhi jayegi jab:
  1. Zyadatar pages mein use ho
  2. Choti ho (7 lines se kam)
  3. Agar **7+ lines** ki style hai → alag `.css` file banao
- Agar styles **ek hi type ki hain** aur **saath mein use hoti hain** → usi page ki CSS file mein rakho
- Project load pe **max 5% unused styles** allowed — index.css se

---

## 💬 COMMENTS

- **Almost no comments** — sirf bohot zaruri aur non-obvious logic pe
- Max **3 words** per comment — `/* fallback only */`, `/* SSOT ref */`
- Self-explanatory code likhna preferred hai comment se

---

## 🪟 MODALS & OVERLAYS

- **Normal modals** → trigger pe mount, close pe immediately unmount
- **Large/heavy modals** (jab explicitly specify kiya jaye):

```
First open  → immediately mount
Close       → 30s countdown, phir unmount
Reopen      → countdown cancel, mounted rahe
```

---

## ✨ ANIMATIONS

- **Smooth animation poore app pe** — consistent easing/duration system `index.css` mein define karo
- **Creative navigation animations** har page par — navigation ki position ke hisaab se animate ho:
  - Deep page → right se slide in
  - Back → left se slide out
  - Bottom nav → bottom se up
  - User ko clearly feel ho ke navigate hua hai
- Components ke enter/exit pe bhi animation ho
- JS mein duration/easing hardcode forbidden — sirf CSS variables

---

## 🗑️ DEAD / DUPLICATE / OVERRIDE CODE

**Poore project mein kahin bhi exist nahi karna chahiye:**
- Unused code, dead code, unreferenced imports
- Duplicate logic — ek function banao, dono jagah call karo
- Override styles — merge karo, duplicate block delete karo
- Same 2 lines bhi poore project mein repeat nahi hongi
- Unnecessary conditions — agar default logic kaam karta hai toh custom condition mat lagao
- Aisa code jo zyada ho magar result same de — forbidden

---

## ⚡ LOGIC OPTIMIZATION

- Agar koi part same hai → function ya class use karo
- Default logics reuse karo — custom element pe wahi default logic lagana forbidden
- Code kam ho magar result same — verbose "working" solution acceptable nahi
- `console.log` → **forbidden**, commit se pehle remove
- `console.error` → sirf genuine runtime errors pe allowed

---

## 🎯 UI FREEZE RULE — CODE UPDATE KARTE WAQT

- Jab bhi code update karo → **user ko dikhne wala UI/UX bilkul change nahi hona chahiye**
- Internal code, backend, frontend logic freely optimize karo
- Visual output, layout, animations, behavior — **1% bhi change nahi**
- Sirf efficiency improve ho, result wahi rahe

---

## 📄 FILE SIZE & STRUCTURE

- Ek file mein sirf **page-specific code** ho
- Agar file obviously badi lagey aur scroll bahut ho → component nikalo alag file mein
- Koi fixed line limit nahi — judgement se karo jab zaroorat ho
- **Page load pe max 5% unused code/styles** allowed — baaki sab lazy/conditional load

---

## 📁 FOLDERS & FILES

- **Logical, chote names** — `auth/`, `emp/`, `att/`, `ui/`
- Feature-based structure — `features/auth/`, `features/emp/`, `features/att/`
- Ek file ek kaam kare
- React: `PascalCase.tsx` components, `camelCase.ts` hooks, `kebab-case.css`

---

## 🔑 REACT SPECIFIC

- `key` → kabhi array index nahi — unique ID use karo
- `useEffect` → clean dependencies array, unnecessary deps nahi
- Heavy computation → `useMemo` mandatory
- Search/input fields → debounce 300ms
- `React.memo` pure components pe
- `useMemo`/`useCallback` expensive ops pe

---

---

# ⚡ OPTIMIZATION RULES

## Frontend

- Lists **50+ items** → virtual scroll (`react-window`)
- Images → `loading="lazy"` default
- First screen → sirf zaroori JS/CSS load ho
- Har page apna chunk, bundle **max 150kb gzipped**
- Library partial import — `import {fn} from 'lib'`, full import forbidden
- 3rd party scripts → `defer`/`async` only
- `will-change` sirf animated elements pe
- Heavy computation → Web Workers, main thread block na ho
- `<link rel="preload">` fonts aur hero images ke liye
- Service Worker — asset caching + offline support
- Elements viewport mein aayein tab hi render/animate — `IntersectionObserver`

---

## 🔧 Backend

- Har list API paginated, default size **20**
- Response mein sirf needed fields — extra data forbidden
- N+1 queries forbidden
- Bulk operations support karo
- Har foreign key pe index mandatory
- Frequent fields pe composite index
- `SELECT *` forbidden — sirf needed columns
- Static/config data cache karo — har baar DB mat jaao
- `Cache-Control` headers set karo same responses pe
- DB connection pooling mandatory — har request pe naya connection forbidden
- Long tasks → background queue — API response block na ho
- `gzip`/`brotli` compression mandatory
- DB queries timeout set karo
- Sensitive data kabhi log na ho — passwords, tokens, cards

### Request Management Strategy

**Queue & Memory**
- Requests IndexedDB mein store, RAM mein sirf **3 active requests**
- Request complete → foran RAM + IndexedDB se delete
- Tab close → RAM flush, IndexedDB persist, wapas aane pe resume
- Every 5min → completed purge; 1hr+ old cache purge; storage 80%+ → oldest low-priority delete

**Adaptive Batching**
| Request Count | Batch Size | Delay |
|--------------|-----------|-------|
| 1–3 | immediate | 100ms |
| 4–15 | 3 | 500ms |
| 16–40 | 8 | 1s |
| 41–100 | 15 | 2s |
| 100+ | 25 | 3s + backpressure |

**Chunking**
- Payload **50kb+** → 50kb chunks, parallel send
- Failed → sirf woh chunk retry, poora request nahi

**Deduplication + Cache**
- Same request queue/in-flight → drop, response share karo
- Response **30s cache** → same request → cache se return, API call nahi

**Priority**
| Level | Type | Behavior |
|-------|------|----------|
| P0 | Critical | Queue bypass (auth) |
| P1 | High | Next batch (user actions) |
| P2 | Normal | Normal queue |
| P3 | Low | Idle time; flood → silently drop |

**Circuit Breaker**
- 5 errors → OPEN, 10s band
- 1 test req → success → CLOSED / fail → OPEN 20s
- Retry: `1s → 2s → 4s → 8s`, max 3 retries, 30s timeout

**Compression**
- Payload **1kb+** → gzip; JSON se nulls/undefined strip
- Binary → ArrayBuffer; base64 forbidden

**Account Isolation**
- Har account ki apni IndexedDB keys: `acc_{id}_queue/cache/failed`
- Memory mein sirf active account ka data

---

## 🌐 Network

- Images WebP, max **200kb**
- SVG agar **2kb se chota** → inline karo
- Sirf used font weights load hon
- Multiple API calls → batch karo jahan possible
- `ETag`/`Last-Modified` support karo
- HTTP/2 enable karo
- `<link rel="dns-prefetch">` third party domains ke liye
- Critical CSS inline karo `<head>` mein

---

## 🔒 Security

- Input sanitize karo **frontend pe bhi** — bad data server tak na jaye
- Rate limiting API pe mandatory
- HTTPS only, HTTP redirect karo
- JWT short expiry + refresh token pattern
- CORS strictly configured — `*` forbidden production mein
- Sensitive data kabhi log nahi — nahi `console.error` mein bhi nahi

---

> **FINAL RULE:** Ye document project ka law hai. Koi bhi PR, commit, ya code change jo kisi bhi rule ko violate kare — rejected hai. No exceptions.
