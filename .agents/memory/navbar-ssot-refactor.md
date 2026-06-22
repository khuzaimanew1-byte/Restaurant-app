---
name: Navbar refactor + new SSOT rules
description: Navbar.tsx extracted from AdminDashboard; global .topbar/.chip in index.css; new CSS naming/semantic HTML/reuse-threshold rules.
---

## What changed

- `Navbar.tsx` — new component: exports `Navbar` (sidebar + mobile topbar + bottom nav), `AvatarDropdown`, `NavItem`. Imports `navbar.css`.
- `navbar.css` — sidebar CSS + bottom nav CSS (short class names: `.bnav`, `.bn-i`, `.bn-a`, `.bn-ico`, `.bn-dot`). Moved from admin-dashboard.css.
- `index.css` — added global: `.topbar` (chrome), `.t-ttl` (title), `.t-sp` (spacer), `.chip` (structure only, no color).
- `admin-dashboard.css` — sidebar + old `.adm-topbar` + bottom nav CSS removed; `.adm-desktop-chip` structure removed → only `.adm-chip-p` / `.adm-chip-h` color modifiers remain.
- `Tag.tsx` deleted — inlined in AddEmployeePage.tsx as `<span className="ae-lang-tag">`.

## Rules added to replit.md

- **CSS class name max 5–6 chars** for new classes (existing `.adm-*` / `.ae-*` grandfathered).
- **SEO-semantic HTML (§1a)**: `<nav aria-label>`, `<header role="banner">`, `<footer>`, `<h1>`/`<h2>`, `aria-current="page"` on active nav item.
- **Shared element threshold (§1b)**: element on 2+ pages → React component; styling on 3+ pages → index.css global class.
- **Topbar**: use `<header className="topbar">` globally — no per-page topbar class in HTML anymore.

## Why

**Why:**
- Long class names (`.adm-bottom-nav`, `.adm-topbar`) conflicted with the "short, semantic" CSS variable rule.
- Sidebar/topbar/bottom-nav all live in Navbar.tsx — single import, co-located CSS.
- `.topbar` as a global class eliminates the previous copy-paste pattern where each page defined its own topbar CSS block using `--topbar-*` vars.

## How to apply

- New nav: always use `<Navbar>` from `Navbar.tsx` inside admin layouts.
- New page with a topbar: `<header className="topbar">` + `.t-ttl` + `.t-sp`. No per-page topbar class.
- New pill/chip: `<span className="chip adm-chip-p">` (or whatever color modifier is needed).
- New bottom nav item: add to `BOTTOM_NAV_ITEMS` in Navbar.tsx and add the icon case in `NavIcon`.
