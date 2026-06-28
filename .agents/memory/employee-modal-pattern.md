---
name: EmployeeModal pattern
description: How the reusable EmployeeModal component is structured, how demo data connects to it, and the SSOT rules for pills and data.
---

## The pattern

`EmployeeModal` lives in `components/ui/EmployeeModal/`. It is self-contained (JSX + 2 CSS files). It receives `profile: EmployeeProfile | null`, `isOpen: boolean`, `onClose: () => void`.

## Data flow

- `EmployeeProfile` type in `services/employee.service.ts` mirrors `employee_profile` + `employee_status` DB tables exactly (SSOT).
- `data/demo-employees.ts` exports `getDemoProfile(id: number): EmployeeProfile | null` — 6 entries matching server seeds.
- `AdminDashboard` holds `profileModalId` state; clicking the ℹ️ button on `EmployeeCard` calls `handleDetails(emp.id)` → `setProfileModalId(id)`.
- A `profileDataRef` retains the last loaded profile for the 220 ms exit animation window.

**Why:** Switching from demo data to a real API only requires swapping the `getDemoProfile` call — the modal component is transparent to the data source.

## Pill SSOT

All pills in the modal use `.stat-pill` (index.css) as the base class. Modifier classes: `em-pill-role` (amber), `em-pill-sal` (prominent amber), `em-pill-tag` (muted). Never redefine the base `.stat-pill` properties in component CSS.

## CSS split

Background/overlay → `employee-modal-bg.css`. All content layout/typography → `employee-modal.css`. Both imported by `EmployeeModal.tsx`.

## Animation

Open: `em-panel-in` (spring 320 ms) + `em-ovr-in` (260 ms). Close: `data-closing` attr triggers `em-panel-out` / `em-ovr-out` (200 ms snap exit). `useDelayedUnmount(profileModalId !== null, 220)` controls DOM presence.
