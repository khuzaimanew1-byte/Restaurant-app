# Restaurant Attendance App — Monorepo

A staff attendance management platform for restaurants consisting of:
- **Flutter app** (`flutter_onboarding/`) — Mobile app with welcome flow + full auth
- **React web app** (`artifacts/onboarding/`) — Admin dashboard + auth web interface

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

### Flutter app
```bash
cd flutter_onboarding
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=https://$REPLIT_DEV_DOMAIN/api \
  --dart-define=ADMIN_GMAIL=$ADMIN_GMAIL
```

## Stack

### Web (React)
- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite (admin dashboard + auth)

### Mobile (Flutter)
- Flutter 3.x, Dart 3.3+
- Material 3 + Cupertino styling
- State management: Riverpod 2
- Navigation: go_router
- Backend: NestJS API (`artifacts/api-server`)
- Auth: bcryptjs password hashing
- Email OTP: Nodemailer + Gmail SMTP (server-side)

## Where things live

| Path | Purpose |
|------|---------|
| `flutter_onboarding/lib/core/` | Shared constants, router, widgets |
| `flutter_onboarding/lib/features/auth/` | Login, Signup, OTP, Success |
| `artifacts/api-server/` | NestJS backend (auth, OTP, sessions) |
| `artifacts/onboarding/src/components/` | React pages + shared components |
| `artifacts/onboarding/src/hooks/` | Custom React hooks |
| `lib/db/` | Drizzle ORM schema + Neon/PG client |

> **Note:** `artifacts/onboarding/` and `flutter_onboarding/` are workspace-bound legacy folder names. All internal code uses restaurant-appropriate naming — never use "onboarding" as a concept name in new code. The welcome/splash screens are `WelcomeFlow`, not "OnboardingFlow".

## Development Model — Per-Screen "Freeze Then Port"

**Rule (always enforced — no exceptions):**

1. **Web first, end-to-end.** Pehle ek screen/feature React web pe mukammal banao — UI, API aur DB sab real ho. Koi mock data ya placeholder na ho.
2. **Stabilise before porting.** Jab us screen ka design aur API contract 2–3 din stable rahe (koi major change na aaye), tab usi screen ko Flutter mein port karo.
3. **Parallel pipeline.** Agla feature React pe shuru karo jab tak pichla Flutter mein settle ho raha hai — dono tracks ek saath chaltay hain, lekin sequence maintain hoti hai.

**Why:** Web pe iterate karna tez aur sasta hai. Flutter port ek stable contract pe hona chahiye — warna dono sides simultaneously change hotay hain aur sync toot jaati hai.

**Applies to:** har naya screen, feature, aur API endpoint. Koi bhi Flutter code tab tak nahi likhna jab tak uska React counterpart production-ready aur design-frozen na ho.

---

## Architecture decisions

- **bcryptjs password hashing**: passwords hashed server-side with bcrypt (cost 12); OTPs hashed with cost 10
- **Email OTP via Nodemailer**: sent server-side using `GMAIL` + `GMAIL_APP_PASSWORD` env vars — credentials never in the Flutter app
- **Admin safety**: `ADMIN_GMAIL` from env; no user can ever self-assign the ADMIN role
- **First-launch detection**: `SharedPreferences` key `onboarding_complete` — set once, never shown again
- **Separate `employees` + `users` tables**: `employees` holds pre-registered records; a `users` row is created only after OTP verification

---

## Coding Standards — SSOT

**CRITICAL META-RULES (always enforced — no exceptions):**
1. These rules apply **automatically** to every change. Never wait to be told to follow them.
2. Whenever a new import, file, or pattern is introduced, re-read relevant rules first.
3. **Violating any rule below is itself a rule violation.** All rules are strictly enforced.
4. Not following a rule is treated the same as breaking code — it must be fixed.

---

### 0. Brand Theme — Restaurant-Premium

| Token | Value | Usage |
|-------|-------|-------|
| Primary Background | `#181A1F` Graphite Black | `--bg` / `AppColors.darkBg` |
| Secondary Surface  | `#2B3038` Slate Gray      | `--bg-surface` / `AppColors.darkSurface` |
| Accent             | `#C47A3A` Copper Bronze   | `--accent` / `AppColors.accent` |
| Accent Dark        | `#9B5B26` Deep Copper     | `--accent-end` / `AppColors.accentEnd` |
| Accent Highlight   | `#E8A86A` Light Gold      | `--illus-badge` / `AppColors.illustBadge` |

**Status / semantic colors (SSOT — never hardcode these anywhere):**

| Token | Value | Usage |
|-------|-------|-------|
| `--clr-present` | `#22C55E` | Arrival / present |
| `--clr-late`    | `#F59E0B` | Late arrival |
| `--clr-leave`   | `#94A3B8` | Approved leave |
| `--clr-unauth`  | `#FF5A5F` | Unauthorized leave |
| `--clr-half`    | `#14B8A6` | Half-day |
| `--clr-early`   | `#A78BFA` | Early departure |
| `--clr-att`     | `#E5E2E1` | Attendance bar |

**Color SSOT locations:**
- React → `artifacts/onboarding/src/index.css` `:root` block
- Flutter → `flutter_onboarding/lib/core/constants/app_colors.dart`
- **Never hardcode hex values anywhere else — in components, widgets, inline styles, or JS/Dart constants outside these two SSOTs.**

### 0a. Flutter SSOT Rules

Apply automatically to all Dart/Flutter code:

- **Colors:** Always `AppColors.*` — never hardcode hex in widgets or theme files.
- **Text styles:** Always `AppTextStyles.*` from `app_text_styles.dart` — never inline `TextStyle(...)` with raw values.
- **Navigation:** Always `go_router` (`context.go()`, `context.push()`, `context.pop()`). Never `Navigator.push` directly.
- **State:** Always Riverpod 2 (`ref.watch`, `ref.read`, `StateNotifierProvider`, `AsyncNotifierProvider`). Never `setState` in non-trivial widgets; never use the `Provider` package.
- **Theme:** `ThemeData` pair in `AppTheme` — light and dark both defined; switched via Riverpod state. No `Theme.of(context).copyWith(...)` scattered in widgets.
- **No `print()`:** Use `debugPrint()` only during development; never in production paths.

### 1. Styling

- **CSS classes first.** Always use CSS class names for styling. Inline `style` only for truly dynamic values: positions (`top`, `left`), computed heights, or CSS custom properties (e.g. `--bar-h`, `--ring-size`).
- **CSS variables for every color.** No hardcoded color values in components or Flutter widgets. Every color comes from a design token variable (`var(--accent)`, `--chip-a`, etc.) or `AppColors.*`.
- **Short, semantic variable names.** Prefer `--bg`, `--text-sub`, `--chip-a` over long descriptive names.
- **CSS class name length: max 5–6 characters** for new classes. Examples: `.chip`, `.bnav`, `.bn-i`, `.bn-a`, `.t-ttl`, `.t-sp`. Existing longer names (`.adm-*`, `.ae-*`) are grandfathered — do not rename them without a broader refactor.
- **Dark mode via attribute.** Web: `:root` = dark default, `[data-dark="false"]` = light override. Flutter: `ThemeData` pair driven by Riverpod.
- **No dead CSS.** Remove any class, variable, or keyframe not referenced by a live component.

### 1a. SEO-Semantic HTML (SSOT — auto-applied)

Use the correct semantic HTML element as the outer container for every UI region. Never use `<div>` when a semantic tag exists.

| Region | Tag |
|--------|-----|
| Primary navigation (sidebar, bottom nav) | `<nav>` with `aria-label` |
| Page topbar / header | `<header>` with `role="banner"` on the outermost (page-level) one |
| Page footer content | `<footer>` |
| Primary heading on a page | `<h1>` (one per page) |
| Secondary section title | `<h2>` |
| Card/section | `<article>` or `<section>` (with a heading) |
| Interactive trigger | `<button>` (never `<div onClick>`) |

Active nav item rule: always set `aria-current="page"` on the active `<button>` or `<a>` inside `<nav>`.

### 1b. Shared Element Threshold (SSOT — auto-applied)

| Reuse count | Action required |
|-------------|-----------------|
| Element used on **2+ pages** | Extract to a **React component** in `components/` |
| Styling used on **3+ pages** | Move to **`index.css`** as a global class |
| Styling used on **1–2 pages** | Keep in the page's own CSS file |

These rules apply automatically to every new element. Do not wait to be told.

### 2. DRY — No Duplication

- Any visual pattern (style block, component, logic, color) that appears in **2+ places with ≥2 lines** becomes a **shared CSS class** or **shared component/function**. Never copy-paste.
- **Same logic in 2+ places → extract to one shared function.** If behaviour is slightly different at each call site, add a parameter — never duplicate the body.
- Shared UI atoms: `Chip`, `GlassBubble`, `NotifBubble`, `BadgeLabel` — define once, reuse everywhere.
- Shared CSS utilities: `.glass-card`, `.chip`, `.notif-bubble`, `.badge-label`, `.bar`, `.ring`.

### 2a. Dual-Display Rule (Admin Dashboard)

Every new UI element added to the Admin Dashboard **must work on both mobile and desktop** by default.

- Mobile-first base style (no breakpoint) → `@media (min-width: 768px)` for desktop adjustments.
- Mark intentional exceptions: `/* mobile-only */` or `/* desktop-only */`.

### 3. Modals & Overlays — Smart Hybrid Mount

Any element that opens/closes (modal, sheet, bottom-drawer, tooltip, dropdown) **must** follow:

```
First trigger  →  mount immediately
Close          →  start 60 s countdown before unmount
Reopen         →  cancel countdown, keep mounted
Countdown ends →  unmount
```

Implement via `useDelayedUnmount(isOpen: boolean, delayMs = 60_000)` from `hooks/useDelayedUnmount.ts`.

### 4. Animations

| Intent | Easing | Duration |
|--------|--------|----------|
| Enter / spring in | `cubic-bezier(0.16, 1, 0.3, 1)` | 450–550 ms |
| Exit / snap out   | `cubic-bezier(0.4, 0, 1, 1)`    | 200–250 ms |
| Micro-interaction | `cubic-bezier(0.22, 1, 0.36, 1)` | 120–200 ms |
| Float / breathe   | `ease-in-out`                    | 3–5 s infinite |

All durations and easings live in CSS only — never hardcoded in JS `setTimeout` logic.

#### 4a. Page Navigation Animations (auto-applied to every new page/panel)

**Spatial model — left = shallow, right = deep:**

```
[Welcome /] ──fwd──▶ [Login /login] ──fwd──▶ [OTP (inline)] ──fwd──▶ [New Password /new-password]
                             └──────────────fwd──────────────▶ [Admin Dashboard /admin/dashboard]
Back is the exact reverse of each forward arrow.
```

**Direction rules (no exceptions):**

| Transition | Dir | Class |
|---|---|---|
| Welcome → Login | fwd | `.view-fwd` |
| Login → OTP | fwd | `.screen-fwd` |
| OTP → Login (back) | back | `.screen-back` |
| OTP → New Password | fwd | `.screen-fwd` + `.view-fwd` |
| New Password → Login | back | `.view-back` |
| Login → Admin Dashboard | fwd | `.view-fwd` |
| Admin Dashboard → Login (logout) | back | `.view-back` |
| Admin Dashboard → any sub-panel | fwd | `.view-fwd` (slide from right) |
| Sub-panel → Admin Dashboard | back | `.view-back` (slide to right) |

**Element settle animations (auto on every new screen):**
- Staggered elements use `settle-fwd` (translateX 28px→0) or `settle-back` (translateX -28px→0).
- Parent direction class drives settle direction automatically — never re-specify duration/easing.
- Flutter: `CustomTransitionPage` with `SlideTransition` — forward = right-to-left, back = left-to-right.

### 5. Design Principles (Apple-level)

- **Typography:** Inter 800, `clamp(32px, 9.5vw, 46px)`, tracking `-.04em`, line-height `1.06–1.10` for headlines.
- **Touch targets:** Minimum 44×44 px for all interactive elements.
- **Button press:** `transform: scale(0.96)` on `:active` via CSS — no JS pointer handlers for visual feedback.
- **Whitespace:** Generous; use `clamp()` for all padding/margin.
- **Glassmorphism:** `backdrop-filter: blur(20–28px)` + `var(--glass)` bg + `var(--glass-bd)` border. Defined once in `.glass-card`.

### 6. Routing — One Page, One URL

- Every distinct full-screen page **must have its own URL route**.
- React: use `window.history.pushState` (current) or `react-router-dom` — never simulate top-level pages with `useState` view toggles alone.
- Flutter: all top-level pages registered in `app_router.dart` with a named path (e.g. `/login`, `/otp`, `/admin`, `/admin/add-employee`).
- Sub-panels/overlays that slide over a page are **not** separate routes — they use URL sync via `pushState`/`popState`.

### 7. Performance — Always On (SSOT — no exceptions)

Apply automatically on every new component, page, or asset. Violations are treated the same as broken code.

#### 7a. React rendering

- Expensive derived data → `useMemo([deps])`
- Stable callbacks passed as props → `useCallback([deps])`
- Pure presentational components → `React.memo()`
- Heavy/rare components → `React.lazy()` + `<Suspense fallback={<div className="adm-lazy-fallback" />}>`
- **Every top-level route component in `App.tsx` must be lazy-imported.** Never eagerly import a page component at the top of `App.tsx`.
- Lists → stable `key` prop (never array index for dynamic lists)
- Search/resize inputs → debounce (`280–300 ms`)

#### 7b. Code splitting (Vite build)

- `vite.config.ts` `rollupOptions.output.manualChunks` must always have at minimum:
  ```
  "vendor-react":  ["react", "react-dom"]
  "vendor-motion": ["framer-motion"]
  "vendor-query":  ["@tanstack/react-query"]
  ```
- Adding a new heavy lib (>50 kB) → add it to `manualChunks` as its own entry.
- Never merge large vendor libs back into the main bundle.

#### 7c. Fonts

- Fonts are loaded **non-blocking** via `<link media="print" onload="this.media='all'">` in `index.html`.
- **No `@import url(...)` in any CSS file** — CSS `@import` is render-blocking.
- Only load font weights that are actually used in CSS. Adding a new weight → update the `index.html` `<link>` URL only.
- Currently used: Inter 400/500/600/700/800 · Geist 400/500/600/700 · Playfair Display 600/700 · DM Serif Display.

#### 7d. Images (SSOT — enforced at upload time)

- **Every uploaded image must be resized before storage.** Max height: **160 px**, aspect ratio preserved.
- Resize implementation: `canvas.toDataURL("image/webp", 0.82)` — always output WebP at 82% quality.
- Use `URL.createObjectURL` + `URL.revokeObjectURL` for the resize read step — never `FileReader` for images.
- Never store a full-resolution upload. Never scale images down with CSS alone.
- Always provide explicit `width` + `height` on `<img>` tags to prevent layout shift.
- Use `loading="lazy"` on every `<img>` not in the above-the-fold critical path.

#### 7e. Flutter performance

- Use `const` constructors everywhere possible
- Extract widgets and use `select()` on Riverpod providers to minimize rebuilds
- Images → `CachedNetworkImage` with placeholder
- Long lists → `ListView.builder` / `SliverList` — never `Column` + `.map()` for >10 items
- Heavy computation → `compute()` isolate

### 8. File & Folder Naming

- **React/Web:** Components in `PascalCase.tsx`, hooks in `camelCase.ts`, CSS in `kebab-case.css`. No generic names like `Utils.tsx` or `Helpers.ts` — name by responsibility.
- **Flutter/Dart:** All files in `snake_case.dart`. Widget files named after the widget (`employee_card.dart`, not `card.dart`).
- **Folders:** Feature-based grouping — `features/auth/`, `features/dashboard/`, `features/employees/`. No folders named after UI primitives (`components/`, `widgets/`) at the top level without a feature qualifier.
- **No "onboarding" naming** in restaurant app code — the welcome/splash screens are `WelcomeFlow`, employee forms are in `employees/`, dashboard in `dashboard/`.
- Workspace-level folder names (`artifacts/onboarding/`, `flutter_onboarding/`) are legacy constraints — internal code must not mirror them.

### 10. CSS Class Composition — Single-Class Rule

**If multiple classes always co-exist on the same element and neither is used independently elsewhere, merge them into one class.** Only keep separate classes when the same style block is genuinely reused independently across different elements.

```
WRONG: <header class="ae-topbar pg-topbar">   ← two classes always together
RIGHT: <header class="ae-topbar">             ← single class, vars carry SSOT
```

### 10a. Global UI Elements — SSOT Classes

Any repeated visual pattern must have one SSOT. For topbars the SSOT is the CSS variables; for icon buttons it is the shared class.

| Element | SSOT mechanism | Usage |
|---------|---------------|-------|
| Page topbar chrome | `.topbar` in `index.css` + `--topbar-*` vars in `:root` | `<header className="topbar">` — one shared global class used on every page |
| Topbar title | `.t-ttl` in `index.css` | `<h2 className="t-ttl">` — flex:1 title inside .topbar |
| Topbar spacer | `.t-sp` in `index.css` | `<div className="t-sp" />` — mirrors icon-btn width for symmetry |
| Chip / pill base | `.chip` in `index.css` | Structure only (no color). Add `.adm-chip-p`, `.adm-chip-h`, or context rules for color |
| 38×38 icon button | `.pg-icon-btn` in `index.css` GLOBAL section | Back arrows, close (×), toggle buttons — single class, no companion class |

**Topbar token SSOT** (in `:root` — never hardcode these per-page):
- `--topbar-bg` / `--topbar-bd` / `--topbar-shadow` / `--topbar-h`

**Rules:**
- New page with a topbar → use `<header className="topbar">` directly. No per-page topbar class in HTML.
- To hide the mobile topbar when a sidebar is present → add `@media (min-width: 768px) { .adm-main .topbar { display: none; } }` in the page's CSS.
- New icon button (back, close, toggle) → use `className="pg-icon-btn"`. Override only `border-radius` if a round shape is needed.
- Adding a new repeated element → ask: is it always used with another class, or truly standalone? If standalone → create one shared class. If always paired → merge and use CSS vars for shared values.

### 11. Shared Components — Mandatory Reuse

Whenever a UI pattern already exists as a shared React component or CSS class, you **must** import and reuse it. Never recreate it inline.

| Pattern | SSOT |
|---------|------|
| Primary CTA button | `<Button>` from `components/ui/Button.tsx` → `.cta-btn` |
| Text / email / tel input with floating label | `<TextInput>` from `components/ui/Input.tsx` → `.inp-wrap/.inp/.inp-label/.inp-line` |
| Password input with show/hide toggle | `<PasswordInput>` from `components/ui/Input.tsx` |
| Removable chip / pill tag | Inline `<span className="ae-lang-tag">…<span className="ae-lang-del">✕</span></span>` — no wrapper component needed |
| Attendance status badge | `<StatusTag status="...">` from `components/ui/StatusTag.tsx` → `.adm-status-label/.adm-status--*` |
| 38×38 icon button | `.pg-icon-btn` CSS class |
| Page topbar | `.topbar` global CSS class (index.css) — same class on every page, no per-page topbar class |
| Topbar title | `.t-ttl` global CSS class (index.css) |
| Desktop topbar + mobile topbar | `<Topbar>` from `components/ui/Topbar.tsx` — owns dropdown state; search state stays in dashboard |
| Sidebar + mobile nav + bottom nav | `<Navigation>` from `components/ui/Navigation.tsx` — exports `Navigation`, `RestaurantLogo`, `NavItem` |
| Chip / pill structure | `.chip` global CSS class (index.css) — add color via `.adm-chip-p`, `.adm-chip-h`, or context rules |

**Rule:** Before writing any `<button>`, `<input>`, or label/badge JSX inline, check `components/ui/` first. If a shared component exists for it, use that — do **not** duplicate the HTML or CSS.

### 9. Code Hygiene

- **`console.log` is forbidden** — remove before committing.
- **`console.error` is allowed** for genuine runtime errors (API failures, unexpected states). Keep messages concise.
- **Important comments are required** for non-obvious logic, SSOT pointers, intentional workarounds, `/* mobile-only */`, `/* desktop-only */`. Remove only trivially obvious comments.
- No dead variables, unused imports, or unreachable branches.
- TypeScript: no `any` unless unavoidable (e.g. CSS custom property casting).
- Flutter: no `dynamic` unless unavoidable; type all Riverpod providers explicitly.

### 13. Database — Folder & File SSOT

**All database-related code lives in its own layer — never scattered in services or frontend.**

| Concern | SSOT location |
|---------|---------------|
| Table definitions (schema) | `lib/db/src/schema/` — Drizzle schema is the single source of truth |
| DB client + pool | `lib/db/src/index.ts` — shared across all server packages |
| Seed / demo data | `artifacts/api-server/src/employees/seeds/index.ts` — server-side only, never import in UI |
| Repository (queries) | `artifacts/api-server/src/*/[module].repository.ts` |
| Runtime table creation | Allowed only as a boot-time safety net (`initTables()` in service `onModuleInit`). Must mirror the Drizzle schema exactly — the Drizzle schema is always considered authoritative. Future goal: migrate to `drizzle-kit push` only. |

**Forbidden:**
- Raw SQL `CREATE TABLE` statements outside `onModuleInit` safety nets
- Seed data arrays anywhere in the frontend (`src/data/`, `src/components/`, etc.)
- Importing `@workspace/db` (or `drizzle`/`pg`) in any UI package

### 14. File Size & Decomposition (SSOT)

| File type | Max lines | Action when exceeded |
|-----------|-----------|---------------------|
| React component | 400 | Extract sub-components to `components/ui/` or a feature subfolder |
| NestJS service | 300 | Extract helpers to a `[module].helpers.ts` file |
| Hook | 150 | Extract shared logic to a utility function |
| CSS file (per-component) | 300 | Split into logical sections or extract shared rules to `index.css` |

**Rules:**
- A reusable sub-component used by **2+ pages** → always extract to `components/ui/`
- A sub-component used only within one page → keep in that page's feature folder, not inline
- Inline SVG icon components (≤ 3 lines each) may stay in the same file
- Complex forms with many fields are exempt from the 400-line limit **only if** all sub-components are already extracted and the remaining lines are unavoidable field declarations

### 12. Dead Code — Mandatory Removal (SSOT)

**Any code or CSS that is not actively used must be deleted — no exceptions.**

Dead code includes:
- CSS classes defined in a stylesheet but never referenced in any JSX/TSX/HTML (grep before keeping).
- Duplicate CSS rule blocks — if the same property is set twice for the same selector (e.g. a fixed-px font-size overridden later by a clamp), merge into one rule at the original location.
- JS/TS functions, variables, types, or imports that are defined but never called or referenced.
- Logic that runs but has zero observable effect (e.g. a `useEffect` that sets state that is never read, a computed value that is never rendered).
- External resource fetches (fonts, images, textures via URL) that are not visually necessary — especially from third-party CDNs that add a network round-trip on every page load.

**How to audit before adding new code:**
1. Grep the codebase for every new CSS class before writing it — if it already exists, reuse it.
2. Before removing a class, grep all `.tsx`/`.ts`/`.html` files to confirm zero references.
3. For CSS, check for override blocks at the bottom of the file that duplicate rules from the top — merge the clamp/responsive value into the original rule and delete the override block.

**Performance corollary (enforced the same as dead code):**
- No `backdrop-filter: blur()` on elements that repeat more than 2–3 times on the same screen (e.g. employee cards). Each blurred layer is a separate GPU compositing pass.
- No external texture or image URLs in CSS `background-image` unless the asset is self-hosted. Third-party URLs add a blocking network request on every page load.
- Card/list item stagger animation delay must not exceed `index × 40ms` — last item must appear within 200 ms of first.
- `will-change: transform, opacity` must be set on any element that runs a CSS `animation` (cards, modals, overlays).
- `contain: layout style paint` must be set on repeated card/list-item components to isolate their layout pass from the rest of the document.

---

## User preferences

- **Never remove or touch secrets** (`GMAIL_APP_PASSWORD`, `JWT_SESSION`, `NEON_DATABASE_URL`, `GMAIL`, `ADMIN_GMAIL`). User manages them directly.
- **Onboarding workflow runs on port 5000** (webview).

## Gotchas

- Pass secrets as `--dart-define` flags, not OS env vars (Flutter mobile can't read `Platform.environment`)
- `GMAIL` and `GMAIL_APP_PASSWORD` are Replit secrets on the API server — never put them in Flutter
- Run `flutter pub get` after any `pubspec.yaml` change
- API server requires `NEON_DATABASE_URL` (or `DATABASE_URL`) and `PORT` env vars to start
