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
- **Dark mode via attribute.** Web: `:root` = dark default, `[data-dark="false"]` = light override. Flutter: `ThemeData` pair driven by Riverpod.
- **No dead CSS.** Remove any class, variable, or keyframe not referenced by a live component.

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

### 7. Performance — Always On

Apply automatically on every new component or page:

**React:**
- Expensive derived data → `useMemo([deps])`
- Stable callbacks passed as props → `useCallback([deps])`
- Pure presentational components → `React.memo()`
- Heavy/rare components → `React.lazy()` + `<Suspense>`
- Images → `loading="lazy"` + explicit `width`/`height`
- Lists → stable `key` prop (never array index for dynamic lists)
- Search/resize inputs → debounce (`280–300 ms`)

**Flutter:**
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
| Page topbar chrome | `--topbar-bg` / `--topbar-bd` / `--topbar-shadow` / `--topbar-h` in `:root` | Each page's topbar class copies the "shared chrome" comment block and uses these vars directly — **single class per element, no `.pg-topbar` class in HTML** |
| 38×38 icon button | `.pg-icon-btn` in `index.css` GLOBAL section | Back arrows, close (×), toggle buttons — single class, no companion class |

**Topbar token SSOT** (in `:root` — never hardcode these per-page):
- `--topbar-bg` / `--topbar-bd` / `--topbar-shadow` / `--topbar-h`

**Rules:**
- New page with a topbar → define `.<page>-topbar` in CSS with the `/* shared topbar chrome */` comment block using `--topbar-*` vars. Use only that one class in HTML.
- New icon button (back, close, toggle) → use `className="pg-icon-btn"`. Override only `border-radius` if a round shape is needed.
- Adding a new repeated element → ask: is it always used with another class, or truly standalone? If standalone → create one shared class. If always paired → merge and use CSS vars for shared values.

### 11. Shared Components — Mandatory Reuse

Whenever a UI pattern already exists as a shared React component or CSS class, you **must** import and reuse it. Never recreate it inline.

| Pattern | SSOT |
|---------|------|
| Primary CTA button | `<Button>` from `components/ui/Button.tsx` → `.cta-btn` |
| Text / email / tel input with floating label | `<TextInput>` from `components/ui/Input.tsx` → `.inp-wrap/.inp/.inp-label/.inp-line` |
| Password input with show/hide toggle | `<PasswordInput>` from `components/ui/Input.tsx` |
| Removable chip / pill tag | `<Tag onRemove={...}>` from `components/ui/Tag.tsx` → `.ae-lang-tag` |
| Attendance status badge | `<StatusTag status="...">` from `components/ui/Tag.tsx` → `.adm-status-label/.adm-status--*` |
| 38×38 icon button | `.pg-icon-btn` CSS class |
| Page topbar | `.<page>-topbar` CSS class using `--topbar-*` vars |

**Rule:** Before writing any `<button>`, `<input>`, or label/badge JSX inline, check `components/ui/` first. If a shared component exists for it, use that — do **not** duplicate the HTML or CSS.

### 9. Code Hygiene

- **`console.log` is forbidden** — remove before committing.
- **`console.error` is allowed** for genuine runtime errors (API failures, unexpected states). Keep messages concise.
- **Important comments are required** for non-obvious logic, SSOT pointers, intentional workarounds, `/* mobile-only */`, `/* desktop-only */`. Remove only trivially obvious comments.
- No dead variables, unused imports, or unreachable branches.
- TypeScript: no `any` unless unavoidable (e.g. CSS custom property casting).
- Flutter: no `dynamic` unless unavoidable; type all Riverpod providers explicitly.

---

## User preferences

- **Never remove or touch secrets** (`GMAIL_APP_PASSWORD`, `JWT_SESSION`, `NEON_DATABASE_URL`, `GMAIL`, `ADMIN_GMAIL`). User manages them directly.
- **Onboarding workflow runs on port 5000** (webview).

## Gotchas

- Pass secrets as `--dart-define` flags, not OS env vars (Flutter mobile can't read `Platform.environment`)
- `GMAIL` and `GMAIL_APP_PASSWORD` are Replit secrets on the API server — never put them in Flutter
- Run `flutter pub get` after any `pubspec.yaml` change
- API server requires `NEON_DATABASE_URL` (or `DATABASE_URL`) and `PORT` env vars to start
