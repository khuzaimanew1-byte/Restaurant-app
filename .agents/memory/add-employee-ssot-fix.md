---
name: AddEmployeePage SSOT fix
description: Was completely broken — onSave required prop was never passed by App.tsx, so Create button threw runtime error. Also had seed data duplication and field data loss.
---

## The Problem

`AddEmployeePage` had `onSave: (data: NewEmployeeData) => void` as a **required** prop. `App.tsx` never passed it. Clicking "Create Employee" threw `TypeError: onSave is not a function`. Additionally, the old `NewEmployeeData` type only carried `name, role, salary, avatar, initials, color` — discarding all of: cnic, phone, email, dob, joiningDate, address, expYr, expMo, langs, tasks, caps, specs, gender.

## The Fix

- Removed `onSave` prop entirely.
- Component now calls `useCreateEmployee()` hook directly in `handleCreate`.
- Builds full `CreateEmployeePayload` with all 15 fields.
- CNIC: strip dashes before sending (raw 13 digits; DTO `@Length(13, 15)` accepts both).
- Salary: strip commas → parseInt → send as number.
- Experience: build `{ y?: number; m?: number }` object, omit zero values.
- On success: `localStorage.removeItem("emp_draft_v1")` then `onClose()`.
- On error: toast with API error message.

## Draft persistence

- Key: `emp_draft_v1` in localStorage.
- All text/array fields saved. `avatarUrl` excluded (data-URL too large).
- Debounced 400ms via `scheduleDraftSave()` using a ref-based timer.
- Draft read once via `readDraft()` lazy initializer on first render.
- Cleared only after confirmed DB write (onSuccess callback).

## Seed data SSOT fix

- Removed inline `PROFILE_SEEDS` / `STATUS_SEEDS` arrays from `employees.service.ts`.
- Moved to `artifacts/api-server/src/employees/seeds/index.ts` with typed interfaces.
- Deleted `artifacts/onboarding/src/data/employee-seeds.ts` (was "server-side only" but in frontend — violation).
- Service imports: `import { PROFILE_SEEDS, STATUS_SEEDS } from "./seeds/index.js"`.

## BulletList extraction

- Extracted to `artifacts/onboarding/src/components/ui/BulletList.tsx`.
- Includes its own inline TrashSVG / CheckSVG (small, single-use).
- Imported in AddEmployeePage as `import { BulletList } from "./ui/BulletList"`.

**Why:** onSave prop + App.tsx mismatch was a silent runtime crash. The fix makes API call ownership clear — form owns its own submission, not the parent.
