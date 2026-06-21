---
name: Per-page CSS splitting
description: How CSS is split per route so each page only loads its own styles.
---

## Rule
CSS is split into per-component files, imported inside each lazy-loaded React component. Vite auto-extracts those imports into separate `.css` chunks loaded only when the route is first visited.

## File layout
| File | Imported in | What it covers |
|------|-------------|----------------|
| `src/index.css` | `main.tsx` (global) | Tokens (`:root`), reset, `.pg-icon-btn`, `.cta-btn`, `arrow-nudge`, `.cta-btn:disabled`, `@keyframes spin`, `.spin-icon`, `.screen-fwd/back`, `settle-fwd/back`, `.adm-lazy-fallback`, `.view-fwd/back` |
| `src/styles/welcome-flow.css` | `WelcomeFlow.tsx` | All `.ob__*`, `.illus*`, `.chip*`, `.ring*`, `.att-card*`, `.cal-*`, `.chart-*`, `.notif-*`, `.badge-label`, `.dot--*`, illustration animations |
| `src/styles/login-flow.css` | `LoginFlow.tsx` | All `.login`, `.login__*`, `.inp-*`, `.pw-*`, `.terms-*`, `.otp-*`, `.countdown`, `.err-text`, `si-s*`, `otp-s*`, `rp-s*`, `shake`, `err-in` |
| `src/styles/admin-dashboard.css` | `AdminDashboard.tsx` | All `.adm-*` including context menu (`.adm-ctx-*`), edit modal (`.adm-edit-*`), office timing (`.adm-office-timing`, `.adm-timing-*`) |
| `src/styles/add-employee.css` | `AddEmployeePage.tsx` | All `.ae-*` classes only |

## Key architecture decision
`ResetPasswordScreen` (exported from `LoginFlow.tsx`, lazy-imported separately in `App.tsx`) owns its own `.login` / `.ob__bg-glow` / `.login__inner` shell wrapper internally. This means App.tsx does NOT wrap it — avoiding a situation where those CSS classes are needed globally before the lazy chunk loads.

**Why:** If App.tsx kept the shell wrapper, `.login` and `.ob__bg-glow` would need to be global even though they're login-only styles. By moving the shell into `ResetPasswordScreen`, all login-specific CSS stays in `login-flow.css`.

## What stays global
- Design tokens (`:root`) — used on every page via `var()`
- `.pg-icon-btn` — shared icon button on AddEmployee and AdminDashboard topbars
- `.cta-btn` + `.cta-btn__arrow` + `arrow-nudge` — shared across WelcomeFlow, LoginFlow, AddEmployee
- `.cta-btn:disabled` — shared
- `spin` keyframe + `.spin-icon` — loading spinner used in LoginFlow and AddEmployee
- `.screen-fwd/back` + `settle` keyframes — Login sub-screen transitions (OTP → Login, etc.)
- `.adm-lazy-fallback` — used in App.tsx Suspense for all lazy routes
- `.view-fwd/back` — used in App.tsx for top-level page transitions
