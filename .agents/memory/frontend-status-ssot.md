---
name: Frontend status SSOT
description: Where DB↔UI status mapping functions live and why they must never be inlined.
---

## Rule
`dbStatusToUi` and `uiStatusToDb` are exported from `artifacts/onboarding/src/services/employee.service.ts`. Every component and hook that maps between DB tokens (`"unauth"`, `"half"`) and UI display tokens (`"unauthorized-leave"`, `"half-day"`) must import these functions — never duplicate the mapping inline.

**Why:** Before this was enforced, the same mapping existed in three places: AdminDashboard (local `uiToDbSts`), `useUpdateEmployeeStatus` (inline ternary), and the backend `employees.types.ts`. Any change to a status value required touching all three. The backend copy is the server SSOT; the frontend copy in `employee.service.ts` is the client SSOT — these two are intentionally separate due to the frontend/backend boundary.

**How to apply:**
- Adding a new `UiStatus` value → update `UiStatus` type in `employee.service.ts`, update both mapping functions, add the `adm-status--<value>` CSS rule in `admin-dashboard.css`, add the label in `StatusTag.tsx`.
- Never import from `api-server/src/employees/employees.types.ts` in the frontend — that file is backend-only.

## Shared component
`StatusTag` (`artifacts/onboarding/src/components/ui/StatusTag.tsx`) is the SSOT for attendance status badge rendering. It takes `status: UiStatus` and renders `adm-status-label / adm-status--*` from `admin-dashboard.css`. All label text lives inside `StatusTag` — never render the badge div inline in other components.

## RefObject TS note
`useRef<HTMLInputElement>(null)` in React 19 returns `RefObject<HTMLInputElement | null>`. Prop types receiving these refs must use `RefObject<HTMLInputElement | null>`, not `RefObject<HTMLInputElement>`.
