---
name: Onboarding design system
description: CSS variable SSOT, class-first styling rules, Apple-level design conventions, and color palette for the React onboarding app.
---

## Color Palette — SSOT (as of June 2026)

| Token        | Name           | Value       |
|-------------|----------------|-------------|
| `--bg`       | Charred Oak    | `#20242B`   |
| `--bg-surface`| Walnut Slate  | `#313842`   |
| `--bg-card`  | Elevated Card  | `#3A424D`   |
| `--accent`   | Amber Gold     | `#C4820A`   |
| `--accent-end`| Deep Amber    | `#8A5B08`   |
| `--text`     | Warm Cream     | `#F5E6C8` @ .93 |
| `--text-sub` | Muted Cream    | `#F5E6C8` @ .50 |
| `--text-ter` | Faint Cream    | `#F5E6C8` @ .28 |
| `--illus-badge`| Bright Amber | `#E8B060`   |

**Why:** Cool blue-grey slate backgrounds create maximum perceptual contrast with Amber Gold accent — a premium, modern dark UI. Previous palette was warm brown/charcoal.

---

## Styling Rules

**Rule:** All styling in `artifacts/onboarding/` uses CSS classes + CSS variables. No JS color token files.

**Why:** Eliminates prop-drilling of colors, enables CSS-only dark mode, keeps transitions native.

**How to apply:**
- Dark mode is PERMANENT. No `[data-dark]` toggle. No light mode. Do not add one.
- New color tokens go into `:root` in `index.css` — short names: `--chip-a`, `--glass-bd`, `--accent-glow`.
- Dynamic values that cannot be a class (pixel positions, computed heights like `--bar-h`, `--ring-size`) stay inline via CSS custom properties cast as `React.CSSProperties`.
- SVG fill/stroke: use CSS classes (`att-icon-fill { fill: var(--illus-badge) }`) — not inline `fill` attributes.

---

## Apple-Level Design Rules (auto-apply on every change)

- **Surfaces:** Cool-slate layered — `bg` → `bg-surface` → `bg-card`, each ~8–10 pts lighter.
- **Accent:** Amber Gold on cool slate = maximum perceptual contrast. Never swap accent for cool color.
- **Glass (CRITICAL RULE — never break):** `--glass` must be `.96+` opacity, warm brown-toned (`rgba(74,64,52,.97)`), NOT the same color family as `--bg` (cool blue-grey). Backdrop-filter bleeds bg into card if opacity is low — so glass must be both near-opaque AND a distinctly different/warmer color than `--bg`. Tri-tone rule: cool bg → warm brown card → amber accent. Always add `--glass-tint: linear-gradient(145deg, rgba(196,130,10,.11) ...)` as a layered background on `.glass-card` for amber DNA. Top-edge inner shadow `inset 0 1px 0 rgba(255,255,255,.08)` is mandatory for depth.
- **Typography:** Only two weights for body — `400` (desc) and `700+` (headline). No `300` in body copy.
- **Spacing:** `clamp()` on every `font-size` and `padding`. No fixed px for layout dimensions.
- **Tap feedback:** `scale(.96)` on `:active`, never opacity alone. `will-change: transform` on animated elements.
- **Ambient mesh:** Two corner radial glows (top-right + bottom-left) at amber rgba `.13/.08`. Dark vignette fill at center.
- **Psychology layout:** Large bold headline → supporting micro-copy → progress dots ("almost there" cue) → full-width CTA at bottom thumb zone.
- **Glow CTA:** `box-shadow` with `var(--accent-glow)` for perceived "premium energy".

---

## Animation Easings (SSOT)

- Spring enter: `cubic-bezier(0.16, 1, 0.3, 1)` ~500 ms
- Snap exit:    `cubic-bezier(0.4, 0, 1, 1)`     ~220 ms
- Micro:        `cubic-bezier(0.22, 1, 0.36, 1)`  ~150 ms

---

## Shared CSS Atoms (do not recreate)

`.glass-card`, `.chip`, `.chip--{a|b|c}`, `.chip__val`, `.chip__sub`,
`.notif-bubble`, `.notif-bubble--top-right`, `.notif-bubble--bottom-left`,
`.badge-label`, `.bar`, `.bar--active`, `.ring`, `.ring--{1|2|3}`,
`.progress-track`, `.progress-fill`, `.dot`, `.dot--on`, `.dot--off`.

---

## Modal mount rule

Any open/close element: mount on first trigger, unmount after 60 s idle.
Hook signature: `useDelayedUnmount(isOpen: boolean, delayMs = 60_000): boolean`.
