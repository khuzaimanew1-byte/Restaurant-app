---
name: Onboarding design system
description: CSS variable SSOT, class-first styling rules, Apple-level design conventions, color palette, and all shared code rules for the React onboarding + login app and Flutter mirror.
---

## Color Palette — SSOT (Slate + Amber Premium)

| CSS Var            | Flutter token        | Value                     | Name           |
|--------------------|----------------------|---------------------------|----------------|
| `--bg`             | `AppColors.bg`       | `#20242B`                 | Charred Oak    |
| `--bg-surface`     | `AppColors.surface`  | `#313842`                 | Walnut Slate   |
| `--bg-card`        | `AppColors.card`     | `#3A424D`                 | Elevated Card  |
| `--accent`         | `AppColors.accent`   | `#C4820A`                 | Amber Gold     |
| `--accent-end`     | `AppColors.accentEnd`| `#8A5B08`                 | Deep Amber     |
| `--accent-fg`      | `AppColors.accentFg` | `#FFF8F0`                 | Warm White     |
| `--accent-glow`    | `AppColors.accentGlow`| `rgba(196,130,10,.42)`   | Amber Glow     |
| `--text`           | `AppColors.text`     | `rgba(245,230,200,.93)`   | Warm Cream     |
| `--text-sub`       | `AppColors.textSub`  | `rgba(245,230,200,.50)`   | Muted Cream    |
| `--text-ter`       | `AppColors.textTer`  | `rgba(245,230,200,.28)`   | Faint Cream    |
| `--err`            | `AppColors.err`      | `rgba(224,82,82,1)` = `#E05252` | Error Red |
| `--err-sub`        | `AppColors.errSub`   | `rgba(224,82,82,.55)`     | Error Muted    |
| `--err-glow`       | `AppColors.errGlow`  | `rgba(224,82,82,.24)`     | Error Glow     |
| `--inp-stroke`     | `AppColors.inputStroke`      | `rgba(196,130,10,.22)` | Input idle  |
| `--inp-stroke-focus`| `AppColors.inputStrokeFocus` | `#C4820A`             | Input focus |
| `--inp-stroke-err` | `AppColors.inputStrokeErr`   | `rgba(224,82,82,1)`   | Input error |
| `--inp-label`      | —                    | `rgba(245,230,200,.40)`   | Label idle     |
| `--inp-label-focus`| —                    | `rgba(196,130,10,.90)`    | Label focus    |
| `--inp-label-err`  | —                    | `rgba(224,82,82,.85)`     | Label error    |
| `--illus-badge`    | `AppColors.illustBadge`| `#E8B060`               | Bright Amber   |

**Rule:** Every color lives in a CSS var (React) or `AppColors` const (Flutter). Never hardcode `Color(0xFF...)` or `rgba(...)` directly in component code.

---

## Styling Rules — class-first

**Rule:** All styling uses CSS class names. Inline `style={}` only for values that cannot be a class: computed dimensions (`--bar-h`, `--ring-size`), dynamic `animationDelay`, pixel positions from JS.

**How to apply:**
- Dark mode is PERMANENT — no `[data-dark]` toggle, no light mode, never add one.
- New color tokens → `:root` in `index.css` (React) and `AppColors` (Flutter).
- SVG fill/stroke → CSS classes (`.att-icon-fill { fill: var(--illus-badge) }`), not inline attributes.
- Dynamic CSS custom properties cast as `React.CSSProperties` are the only accepted inline style.

---

## Apple-Level Design Rules (auto-apply on every change)

- **Surfaces:** Cool-slate layered — `bg` → `surface` → `card`, each ~8–10 pts lighter.
- **Accent:** Amber Gold on cool slate = maximum perceptual contrast. Never swap for cool/blue accent.
- **Glass (CRITICAL — never break):** `.glass-card` must use `background: var(--glass-tint), var(--glass)` — `--glass: rgba(56,54,58,.97)` near-opaque warm-neutral + amber-tinted gradient layer. `backdrop-filter: blur(24px)`. Always `border: 1px solid var(--glass-bd)` + `box-shadow: var(--glass-sh)`.
- **Typography:** Two body weights only — `400` (desc) and `700+` (headline). No `300` in body copy.
- **Spacing:** `clamp()` on every `font-size` and padding. No fixed px for layout.
- **Tap feedback:** `scale(.96)` on `:active`. `will-change: transform` on animated elements.
- **Ambient mesh:** `--bg-mesh` — two corner radial glows (amber .13/.08) + dark vignette center.
- **Psychology layout:** Bold headline → micro-copy → progress dots → full-width CTA (thumb zone).
- **Glow CTA:** `box-shadow: 0 4px 32px var(--accent-glow)` on primary button.

---

## Animation Easings — SSOT

- **Spring enter:** `cubic-bezier(0.16, 1, 0.3, 1)` ~500 ms — elements entering view
- **Snap exit:**   `cubic-bezier(0.4, 0, 1, 1)` ~220 ms — elements leaving
- **Micro:**       `cubic-bezier(0.22, 1, 0.36, 1)` ~150 ms — hover, focus, tap

**Login-specific:**
- Screen fade in/out: opacity 0→1 / 1→0, 200 ms, no slide
- Input focus stroke: 180 ms ease
- Button press: scale 0.97, 120 ms
- Wrong OTP shake: horizontal 300 ms
- Stagger load: 40 ms apart per element

---

## Rule 1 — DRY (shared components, no repetition)

Any element/logic/style used in **2+ places** must be extracted — not repeated.

### Login page shared components:

| Component / Class     | Used in                                     | What it is                          |
|-----------------------|---------------------------------------------|-------------------------------------|
| `PasswordRules`       | Screen 1 (Sign In) + Reset Password         | Live rule checklist (10+ chars etc) |
| `PasswordInput`       | Sign In pw, New pw, Confirm pw              | Bottom-stroke + floating label + eye |
| `OtpInput`            | OTP screen (first-login + reset flow)       | 6-box auto-advance + paste + shake  |
| `CountdownTimer`      | OTP screen                                  | Ring + text countdown               |
| `.err-text`           | All input error states                      | Red error text below input          |
| `.cta-btn`            | Onboarding CTA + Login button               | Already in `index.css`             |
| `.ob` shell           | Onboarding pages + Login page               | bg, mesh, font, overflow            |
| `@keyframes fade-*`   | All screen transitions                      | 200 ms opacity transition           |
| `glass-card`          | Onboarding illustrations + any login cards  | Already in `index.css`             |

**Rule for future:** Before writing any styled block or logic, grep for it. If it exists, import/reuse it. If it will be used again, extract before first use.

---

## Rule 2 — Modal Smart Hybrid Mount System

Any open/close element (modal, drawer, bottom sheet, tooltip, expandable) uses hybrid mounting:

```
mount  → on first trigger (lazy — not on page load)
open   → countdown paused/reset
close  → 60-second countdown starts
unmount → after 60 s of closed idle
```

**React hook signature:**
```typescript
useDelayedUnmount(isOpen: boolean, delayMs = 60_000): boolean
// returns: shouldRender (true during open + 60s after close)
```

**Usage:**
```tsx
const shouldRender = useDelayedUnmount(isOpen);
{shouldRender && <Modal />}
```

**Login page modals:** T&C expandable, any error overlay, any future sheet → all use this hook.

---

## Rule 3 — CSS Class-First Naming

Login page CSS class catalogue (all go in `login.css`, reuse from `index.css` where noted):

```
.login               — page wrapper (extends .ob concept)
.login__screen       — screen container
.login__back         — back arrow button
.login__head         — screen heading (h1)
.login__sub          — subtext / supporting copy
.login__app-name     — top app name label

.inp                 — bottom-stroke input field
.inp--focus          — focused state
.inp--error          — error state
.inp--filled         — has value
.inp-wrap            — label + input container
.inp-label           — floating label
.inp-label--up       — floated state (has value or focused)
.inp-label--err      — error label color
.inp-eye             — show/hide password toggle

.otp-row             — flex row of 6 boxes
.otp-box             — single digit box
.otp-box--filled     — has a digit
.otp-box--error      — shake + red border

.pw-rules            — password rule checklist
.pw-rule             — single rule item
.pw-rule--met        — green tick state
.pw-rule--unmet      — grey dot state

.err-text            — error message below input (reuse everywhere)

.terms-row           — checkbox + text row
.terms-cb            — the checkbox element

.countdown           — expiry timer text
.countdown--urgent   — red state (< 60 s)
```

---

## Rule 4 — No Dead / Duplicate / Console Code

- **No `console.log/warn/error`** in any committed file.
- **No commented-out code blocks.**
- **No unused imports.**
- **No dead files** — `shared.tsx` was deleted for this reason.
- Apply on every edit: grep for `console\.` before commit.

---

## Rule 5 & 6 — Colors Only via CSS Vars / AppColors

- React: every color value must be `var(--token-name)`. No `#hex`, `rgb()`, or `rgba()` in component CSS/TSX.
- Flutter: every color must be `AppColors.tokenName`. No `Color(0xFF...)` outside `app_colors.dart`.
- Exceptions: `Colors.transparent` is acceptable as a semantic value (not a brand color).

---

## Rule 7 — React → Flutter Mirror

**Pages that must mirror:** `onboarding` (✅ done), `login` (pending build).

**Mirror contract:**
- Same screens, same flow, same text/copy
- Same color tokens (React CSS var ↔ Flutter AppColors — table above)
- Same animations (Flutter `AnimationController` matching React CSS keyframes)
- Same component structure (1:1 widget ↔ component mapping)
- Any React login change → immediately apply same change in Flutter

**Allowed Flutter differences (platform-specific only):**
- `HapticFeedback.lightImpact()` instead of CSS `:active` scale
- `UnderlineInputBorder` instead of CSS `border-bottom`
- `FloatingLabelBehavior.auto` instead of CSS label float animation
- System font `.SF Pro Display` on iOS / `Roboto` on Android

---

## Shared CSS Atoms (do not recreate — already in `index.css`)

`.glass-card`, `.chip`, `.chip--{a|b|c}`, `.chip__val`, `.chip__sub`,
`.notif-bubble`, `.badge-label`, `.bar`, `.bar--active`, `.ring`, `.ring--{1|2|3}`,
`.progress-track`, `.progress-fill`, `.dot`, `.dot--on`, `.dot--off`,
`.cta-btn`, `.ob`, `.ob__bg-glow`, `.skip-btn`, `.top-enter`,
`@keyframes float-{a|b|c}`, `@keyframes glow-breathe`, `@keyframes pulse-ring`,
`@keyframes text-exit-up`, `@keyframes text-enter-up`,
`@keyframes illus-exit-{left|right}`, `@keyframes illus-enter-{left|right}`,
`.stagger-1`, `.stagger-2`
