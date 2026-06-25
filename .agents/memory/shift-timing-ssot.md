---
name: Shift-timing SSOT refactor
description: Pattern for extracting shift logic, status maps, and shared SVG atoms out of AdminDashboard into a service file.
---

## Rule
All shift/attendance logic lives in `services/shift-timing.tsx`. No component file may define these inline.

## Exports from shift-timing.tsx
- `parseMins`, `to24h`, `to12h` — time parsing/formatting helpers
- `arrSts`, `depSts`, `dispSts`, `canHalf`, `sortEmp` — status derivation + employee sort
- `STATUS_CSS`, `STATUS_LABEL`, `SORT_*` — constant maps
- `IcoIn`, `IcoOut` — shared JSX SVG atoms (used in AdminDashboard AND AddEmployeePage)
- `OfficeTiming`, `DisplayStatus` — shared TypeScript types

## OfficeTiming component split
- Component: `components/ui/OfficeTiming.tsx` (imports from shift-timing.tsx)
- Styles: `styles/office-timing.css` (imported by OfficeTiming.tsx itself)
- CSS removed from admin-dashboard.css (tombstone comment left in place)

## CSS token pattern for rgba colors
- RGB triplet stored as CSS var: `--adm-red-rgb: 248, 113, 113` (in index.css)
- Used in rules as: `rgba(var(--adm-red-rgb), 0.15)` — allows opacity variation without repeating the hex

## Dead CSS removed
- `.adm-status-chip` — defined in CSS but never referenced in JSX; deleted
- Duplicate `@media (min-width: 768px)` font-size overrides — merged into original rules via `clamp()`
- Duplicate `.adm-notif-btn` block — merged transition + `:active` into original rule

**Why:** SSOT_RULES.md forbids any logic/constant/SVG defined in more than one place. `canHalf` and `sortEmp` are pure functions of employee data; keeping them in a service file makes them unit-testable independently of React.

**How to apply:** When adding new time/shift/status logic, add it to shift-timing.tsx first. Components import from there — never define inline.
