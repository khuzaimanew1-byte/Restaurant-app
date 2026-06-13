# Attendance App — Monorepo

A staff attendance management platform consisting of:
- **Flutter app** (`flutter_onboarding/`) — Mobile app with premium onboarding + full auth flow
- **React onboarding preview** (`artifacts/onboarding/`) — Web preview of the onboarding UI at `/`

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
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
- React + Vite (onboarding preview)

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
| `flutter_onboarding/lib/features/onboarding/` | 3-page onboarding flow |
| `flutter_onboarding/lib/features/auth/` | Login, Signup, OTP, Success |
| `artifacts/api-server/` | NestJS backend (auth, OTP, sessions) |
| `artifacts/onboarding/` | React web preview of the onboarding UI |
| `lib/db/` | Drizzle ORM schema + Neon/PG client |

## Architecture decisions

- **bcryptjs password hashing**: passwords hashed server-side with bcrypt (cost 12); OTPs hashed with cost 10
- **Email OTP via Nodemailer**: sent server-side using `GMAIL` + `GMAIL_APP_PASSWORD` env vars — credentials never in the Flutter app
- **Admin safety**: `ADMIN_GMAIL` from env; no user can ever self-assign the ADMIN role
- **First-launch detection**: `SharedPreferences` key `onboarding_complete` — set once, never shown again
- **Separate `employees` + `users` tables**: `employees` holds pre-registered records; a `users` row is created only after OTP verification

---

## Coding Standards — SSOT

These rules apply to **all code in this project** automatically, without needing to mention them per task.

### 0. Brand Theme — Restaurant-Premium

| Token | Value | Usage |
|-------|-------|-------|
| Primary Background | `#181A1F` Graphite Black | `--bg` / `AppColors.darkBg` |
| Secondary Surface  | `#2B3038` Slate Gray      | `--bg-surface` / `AppColors.darkSurface` |
| Accent             | `#C47A3A` Copper Bronze   | `--accent` / `AppColors.accent` |
| Accent Dark        | `#9B5B26` Deep Copper     | `--accent-end` / `AppColors.accentEnd` |
| Accent Highlight   | `#E8A86A` Light Gold      | `--illus-badge` / `AppColors.illustBadge` |

**Rules:**
- All colors live in CSS custom properties (React) or `AppColors` constants (Flutter). Never hardcode hex values outside these two SSOTs.
- React SSOT: `artifacts/onboarding/src/index.css` `:root` block.
- Flutter SSOT: `flutter_onboarding/lib/core/constants/app_colors.dart`.
- Light mode for React: `[data-dark="false"]` override uses warm parchment bg (`#F2EBE0`) and same Copper Bronze accent.
- Light mode for Flutter: `AppColors.lightBg` = `#F2EBE0`, same accent.

### 1. Styling

- **CSS classes first.** Always use CSS class names for styling. Inline `style` only for truly dynamic values: positions (`top`, `left`), computed heights, or CSS custom properties (e.g. `--bar-h`, `--ring-size`).
- **CSS variables for every color.** No hardcoded color values in components or Flutter widgets. Every color comes from a design token variable (`var(--accent)`, `--chip-a`, etc.) or `AppColors.*`.
- **Short, semantic variable names.** Prefer `--bg`, `--text-sub`, `--chip-a` over long descriptive names.
- **Dark mode via attribute.** Web: `:root` = dark default, `[data-dark="false"]` = light override, toggled by `data-dark` on `<html>`. Flutter: `ThemeData` pair driven by `Riverpod` state.
- **No dead CSS.** Remove any class, variable, or keyframe not referenced by a live component.

### 2. DRY — No Duplication

- Any visual pattern (style block, component, logic, color) that appears in 2+ places with ≥2 lines becomes a **shared CSS class** or **shared component/function**. Never copy-paste.
- Shared UI atoms: `Chip`, `GlassBubble`, `NotifBubble`, `BadgeLabel` — define once, reuse everywhere.
- Shared CSS utilities: `.glass-card`, `.chip`, `.notif-bubble`, `.badge-label`, `.bar`, `.ring`.

### 3. Modals & Overlays — Smart Hybrid Mount

Any element that opens/closes (modal, sheet, bottom-drawer, tooltip) **must** follow this lifecycle:

```
First trigger  →  mount
Close          →  start 60 s countdown before unmount
Reopen         →  cancel countdown, keep mounted (no re-mount cost)
Countdown ends →  unmount
```

Implement via a `useDelayedUnmount(isOpen: boolean, delayMs = 60_000)` hook that returns `shouldRender: boolean`.

### 4. Animations

| Intent | Easing | Duration |
|--------|--------|----------|
| Enter / spring in | `cubic-bezier(0.16, 1, 0.3, 1)` | 450–550 ms |
| Exit / snap out   | `cubic-bezier(0.4, 0, 1, 1)`    | 200–250 ms |
| Micro-interaction | `cubic-bezier(0.22, 1, 0.36, 1)` | 120–200 ms |
| Float / breathe   | `ease-in-out`                    | 3–5 s infinite |

All durations and easings live in CSS — never hardcoded in JS `setTimeout` logic (except the transition timeout that matches the CSS duration).

### 5. Design Principles (Apple-level)

- **Typography:** Inter 800, `clamp(32px, 9.5vw, 46px)`, tracking `-.04em`, line-height `1.06–1.10` for headlines.
- **Touch targets:** Minimum 44×44 px for all interactive elements.
- **Button press:** `transform: scale(0.96)` on `:active` via CSS — no JS pointer handlers for visual feedback.
- **Whitespace:** Generous; use `clamp()` for all padding/margin so layout breathes at every screen size.
- **Glassmorphism:** `backdrop-filter: blur(20–28px)` + `var(--glass)` bg + `var(--glass-bd)` border. Defined once in `.glass-card`, extended where needed.
- **Psychological flow:** One clear benefit per screen → progress dots (Zeigarnik effect) → premium CTA (Von Restorff). Never add friction before the user commits.

### 6. Code Hygiene

- Remove all `console.log`, `console.error`, commented-out blocks, and unused imports before committing.
- No dead variables or unreachable branches.
- TypeScript: no `any` unless unavoidable (e.g. CSS custom property casting `as React.CSSProperties`).

---

## User preferences

- **Never remove or touch secrets** (`GMAIL_APP_PASSWORD`, `JWT_SESSION`, `NEON_DATABASE_URL`, `GMAIL`, `ADMIN_GMAIL`). User manages them directly — do not request, overwrite, or clear them.
- **Onboarding workflow runs on port 5000** (webview) to avoid conflict with the artifact workflow on port 23165.

## Gotchas

- Pass secrets as `--dart-define` flags, not OS env vars (Flutter mobile can't read `Platform.environment` for build-time constants)
- `GMAIL` and `GMAIL_APP_PASSWORD` are Replit secrets on the API server — never put them in the Flutter app
- Run `flutter pub get` after any `pubspec.yaml` change
- API server requires `NEON_DATABASE_URL` (or `DATABASE_URL`) and `PORT` env vars to start
