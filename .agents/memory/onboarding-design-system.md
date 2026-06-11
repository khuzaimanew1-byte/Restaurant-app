---
name: Onboarding design system
description: CSS variable SSOT, class-first styling rules, and Apple-level design conventions for the React onboarding app.
---

## Rule
All styling in `artifacts/onboarding/` uses CSS classes + CSS variables. No JS color token files.

**Why:** `colors.ts` was deleted; replacing it with CSS custom properties in `index.css` eliminates the need to pass color objects as props, keeps dark-mode switching to a single attribute toggle, and lets CSS handle transitions natively.

**How to apply:**
- Dark mode default = `:root`, light override = `[data-dark="false"]` on `<html>`.
- New color tokens go into both blocks in `index.css` — short names: `--chip-a`, `--glass-bd`, `--accent-glow`.
- Dynamic values that cannot be a class (pixel positions, computed heights like `--bar-h`, `--ring-size`) stay inline via CSS custom properties cast as `React.CSSProperties`.
- SVG fill/stroke: use CSS classes (`att-icon-fill { fill: var(--illus-badge) }`) — not inline `fill` attributes.

## Shared CSS atoms (do not recreate)
`.glass-card`, `.chip`, `.chip--{a|b|c}`, `.chip__val`, `.chip__sub`,
`.notif-bubble`, `.notif-bubble--top-right`, `.notif-bubble--bottom-left`,
`.badge-label`, `.bar`, `.bar--active`, `.ring`, `.ring--{1|2|3}`,
`.progress-track`, `.progress-fill`, `.dot`, `.dot--on`, `.dot--off`.

## Animation easings (SSOT)
- Spring enter: `cubic-bezier(0.16, 1, 0.3, 1)` ~500 ms
- Snap exit:    `cubic-bezier(0.4, 0, 1, 1)`     ~220 ms
- Micro:        `cubic-bezier(0.22, 1, 0.36, 1)`  ~150 ms

## Modal mount rule
Any open/close element: mount on first trigger, unmount after 60 s idle.
Hook signature: `useDelayedUnmount(isOpen: boolean, delayMs = 60_000): boolean`.
