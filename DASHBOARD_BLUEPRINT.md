# Restaurant Attendance Dashboard — Complete Blueprint

> **Purpose:** This document is a self-contained reference for any AI agent or developer to fully understand, review, and continue building the dashboard without needing to read the source code. It covers every layer of the system: UI, state, business logic, data flow, API, database, design tokens, and known gaps.

---

## 1. System Overview

A **restaurant staff attendance management platform** consisting of three tightly coupled apps in one pnpm monorepo:

| Layer | Tech | Port | Path |
|---|---|---|---|
| Admin Web (React) | Vite + React 18 + TypeScript | 5000 | `artifacts/onboarding/` |
| API Server | NestJS + Drizzle ORM | 8080 | `artifacts/api-server/` |
| Mobile App | Flutter 3 + Riverpod 2 | — | `flutter_onboarding/` |
| Database | Neon/PostgreSQL via Drizzle | — | `lib/db/` |

**Development Rule:** Web-first, stabilise for 2–3 days, then port to Flutter. Never write Flutter code for a feature that isn't production-ready on React.

---

## 2. URL Routing & App Shell (`App.tsx`)

The React app uses a **custom state-based router** — no react-router. Navigation is handled via `window.history.pushState`.

### Route Map

| URL | View State | Auth Required |
|---|---|---|
| `/` | `onboarding` | No |
| `/login` | `login` | No (redirects to dashboard if token valid) |
| `/new-password` | `new-password` | Needs `reset_token` in sessionStorage |
| `/admin/dashboard` | `admin-dashboard` | Yes — JWT in localStorage |
| `/admin/add-employee` | `add-employee` | Yes |

### Auth Guard Logic

```
getValidToken()
  → reads localStorage["auth_token"]
  → base64-decodes the JWT payload
  → checks payload.exp against Date.now()/1000
  → if expired: removes token, returns null
  → if valid: returns token string

getInitialView()
  → if valid token → admin-dashboard (or add-employee if path matches)
  → if path === "/login" → login
  → if path starts with "/admin/" but no token → replace path to /login, return login
  → if path === "/new-password" but no reset_token in sessionStorage → login
  → else → onboarding
```

### Page Transitions (Spatial Navigation)

All transitions use CSS class injection — no JS animation logic.

| Direction | Class | CSS |
|---|---|---|
| Forward (deeper) | `view-fwd` | slide left-to-right in (translateX 100%→0) |
| Backward (shallower) | `view-back` | slide right-to-left out |

**Transition matrix:**
```
Welcome → Login         : fwd (view-fwd)
Login   → OTP           : fwd (screen-fwd inline)
OTP     → Login         : back (screen-back)
OTP     → New Password  : fwd
Login   → Dashboard     : fwd
Dashboard → Add Employee: fwd
Add Employee → Dashboard: back
Dashboard → Login       : back (logout)
```

### Code Splitting

Every top-level view is `React.lazy()` wrapped in `<Suspense fallback={<div className="adm-lazy-fallback" />}>`. The fallback class is a visible loading state styled in CSS.

---

## 3. Component Architecture

### Tree (simplified)

```
App.tsx
├── WelcomeFlow          (/  — 3-slide carousel with SVG illustrations)
├── LoginFlow            (/login — handles sign-in + OTP + first-login password setup)
│   ├── SignInScreen
│   ├── OtpScreen
│   └── AuthBg
├── ResetPasswordScreen  (/new-password)
├── AdminDashboard       (/admin/dashboard)
│   ├── <nav> Sidebar       (desktop only — CSS @media(min-width:768px))
│   ├── <header> Desktop Header (topbar + search + notifications + avatar dropdown)
│   ├── <header> Mobile Topbar  (logo, search toggle, avatar button)
│   ├── StatsBar             (desktop: chips row / mobile: date + chips row)
│   ├── OfficeTimingHeader   (shown only when activeNav === "leave")
│   ├── EmployeeCard[]       (grid, sorted + filtered)
│   ├── FAB                  (+ button → navigates to /admin/add-employee)
│   ├── <nav> BottomNav      (mobile only — 5 tabs)
│   ├── ContextMenu          (right-click / long-press on any card)
│   ├── AvatarDropdown       (admin profile + sign out trigger)
│   └── LogoutModal          (confirmation dialog)
└── AddEmployeePage      (/admin/add-employee — full-screen slide-in)
    ├── BulletList (×3)      (Assigned Tasks, Work Capabilities, Speciality)
    └── Salary Pill          (auto-resizing input)
```

### Shared UI Atoms (`components/ui/`)

| Component | CSS Class | Notes |
|---|---|---|
| `Button` | `.cta-btn` | Primary action, full-width by default |
| `TextInput` | `.inp-wrap/.inp/.inp-label/.inp-line` | Floating-label (default) or compact (icon-led) |
| `PasswordInput` | Same as TextInput + eye toggle | |
| `EmployeeModal` | `.em-overlay / .em-panel / .em-*` | Full employee profile modal; props: `profile: EmployeeProfile \| null`, `isOpen: boolean`, `onClose: () => void`. Uses `.stat-pill` as base for all pills. CSS split: `employee-modal-bg.css` (overlay + panel background) + `employee-modal.css` (content). Opens via the ℹ️ Details button on every `EmployeeCard`. |

### Demo Data (`data/demo-employees.ts`)

`getDemoProfile(id: number): EmployeeProfile | null` — look up by employee ID.  
6 entries mirroring `artifacts/api-server/src/emp/seeds.ts` exactly, plus extra fields (`dob`, `ph`, `addr`, `hire`, `exp`, `email`) required by the modal.  
Switching to a real API endpoint requires only replacing the `getDemoProfile` call — the modal's interface is transparent to the data source.

### `EmployeeProfile` type (`services/employee.service.ts`)

Mirrors `employee_profile` + `employee_status` DB table columns exactly, plus derived fields `initials` and `color`. SSOT for everything the modal renders.

### Global CSS SSOT (`index.css` `:root`)

| CSS Token | Value | Usage |
|---|---|---|
| `--bg` | `#181A1F` | Primary background (Graphite Black) |
| `--bg-surface` | `#2B3038` | Cards, panels (Slate Gray) |
| `--accent` | `#C47A3A` | Copper Bronze — primary CTA |
| `--accent-end` | `#9B5B26` | Deep Copper — gradient end |
| `--illus-badge` | `#E8A86A` | Light Gold — illustration highlights |
| `--clr-present` | `#22C55E` | Arrival / present status |
| `--clr-late` | `#F59E0B` | Late arrival |
| `--clr-leave` | `#94A3B8` | Approved leave |
| `--clr-unauth` | `#FF5A5F` | Unauthorized leave |
| `--clr-half` | `#14B8A6` | Half-day |
| `--clr-early` | `#A78BFA` | Early departure |
| `--clr-att` | `#E5E2E1` | Attendance bar fill |
| `--adm-gold` | `#D4AF37` | Gold — admin dashboard accent |

**Rule:** No hex values anywhere except these two SSOT files: `index.css` `:root` and `flutter_onboarding/lib/core/constants/app_colors.dart`.

---

## 4. AdminDashboard — Full State Reference

```typescript
// ── Core data ─────────────────────────────────────────
employees: Employee[]          // full employee list; initialised from INITIAL_EMPLOYEES seed
officeTiming: OfficeTiming     // { start: "08:00 AM", end: "06:00 PM" }

// ── Navigation ─────────────────────────────────────────
activeNav: NavItem             // "dashboard" | "leave" | "analytics" | "settings" | "notifications"

// ── Search ─────────────────────────────────────────────
rawQuery: string               // live input value
debouncedQuery: string         // debounced at 280ms via useDebounce hook

// ── UI overlays ────────────────────────────────────────
mobileSearchOpen: boolean      // mobile search bar expansion
dropdownOpen: boolean          // admin avatar dropdown
logoutModalOpen: boolean       // logout confirmation modal
ctxMenu: CtxMenu | null        // { empId, x, y } — context menu position + target
editingId: number | null       // employee being inline-edited

// ── Lifecycle refs (hybrid mount pattern) ──────────────
shouldRenderLogout:   boolean  // useDelayedUnmount(logoutModalOpen, 60000ms)
shouldRenderDropdown: boolean  // useDelayedUnmount(dropdownOpen, 220ms)
shouldRenderCtx:      boolean  // useDelayedUnmount(!!ctxMenu, 220ms)
ctxMenuDataRef:       Ref      // sync ref — holds last non-null ctxMenu for exit animation
```

### Employee Interface

```typescript
interface Employee {
  id:          number;       // auto-increment (max existing + 1 on add)
  name:        string;
  role:        string;
  salary:      string;       // formatted e.g. "PKR 4,500" or "$4,500"
  checkIn:     string;       // "09:15 AM" | "" (empty = not checked in)
  checkOut:    string;       // "06:00 PM" | "" (empty = still in / on leave)
  leaveStatus: LeaveStatus;  // "leave" | "unauthorized-leave" | "half-day" | null
  att:         number;       // 0–100 attendance %
  perf:        number;       // 0–100 performance %
  avatar:      string;       // URL or WebP data URI (max 160px height)
  initials:    string;       // 1–2 uppercase chars (e.g. "AR")
  color:       string;       // CSS var (e.g. "var(--av-p1)") — avatar fallback bg
}
```

### Seed Data (6 employees at startup)

| # | Name | Role | Check-In | Check-Out | Leave Status | ATT% | PERF% |
|---|---|---|---|---|---|---|---|
| 1 | Alex Rivera | Senior Developer | 09:15 AM | — | null | 80 | 60 |
| 2 | Sarah Chen | UX Designer | 07:50 AM | 04:30 PM | null | 80 | 80 |
| 3 | James Wilson | Product Manager | 07:55 AM | 06:20 PM | null | 80 | 60 |
| 4 | Elena Rodriguez | Data Analyst | — | — | leave | 90 | 80 |
| 5 | Michael Chang | Sous Chef | — | — | unauthorized-leave | 95 | 85 |
| 6 | Olivia Smith | Restaurant Manager | 07:30 AM | 06:30 PM | null | 100 | 90 |

---

## 5. Business Logic — Status Calculations

### Time Parsing Helpers

All times stored as 12-hour strings: `"HH:MM AM/PM"`. All comparisons use `parseTimeMins()` which returns total minutes from midnight (or -1 for invalid input).

```
parseTimeMins("09:15 AM") → 555  (9*60+15)
parseTimeMins("06:00 PM") → 1080 (18*60+0)
parseTimeMins("")         → -1
```

Conversion functions:
- `to24h("09:15 AM")` → `"09:15"` — for `<input type="time">` value
- `to12h("09:15")` → `"09:15 AM"` — from `<input type="time">` back to storage format

### `getDisplayStatus(emp, officeTiming)` — Priority Chain

```
1. leaveStatus === "unauthorized-leave"  → "unauthorized-leave"
2. leaveStatus === "leave"               → "leave"
3. leaveStatus === "half-day"            → "half-day"
4. checkOut exists AND checkOut < officeEnd → "early-departure"
5. checkIn exists AND checkIn > officeStart → "late-arrival"
6. checkIn exists AND checkIn ≤ officeStart → "arrival"
7. (no checkIn, no leaveStatus)          → "normal"
```

> **Note:** Late-arrival check appears both with and without checkout (steps 4 vs 5). When checkout exists, step 4 fires first — an employee who left early AND arrived late is classified as "early-departure" only.

### `getArrivalStatus(emp, timing)` — Check-In Color

Returns `"late"` if `checkIn > officeStart`, else `null`. Used to colour the check-in time slot on the card (amber = late / default = normal).

### `getDepartureStatus(emp, timing)` — Check-Out Color

Returns `"early"` if `checkOut < officeEnd`, else `null`. Used to colour the check-out time slot (purple = early / default = normal).

### Status → CSS Mapping

| displayStatus | CSS suffix | Color token |
|---|---|---|
| `unauthorized-leave` | `unauth` | `--clr-unauth` (#FF5A5F) |
| `leave` | `leave` | `--clr-leave` (#94A3B8) |
| `half-day` | `half` | `--clr-half` (#14B8A6) |
| `early-departure` | `early` | `--clr-early` (#A78BFA) |
| `late-arrival` | `late` | `--clr-late` (#F59E0B) |
| `arrival` | `present` | `--clr-present` (#22C55E) |
| `normal` | `null` | default (dim) |

### Status Label → Human String

```
"unauthorized-leave" → "Unauthorized Leave"
"leave"              → "On Leave"
"half-day"           → "Half Day"
"early-departure"    → "Early Departure"
"late-arrival"       → "Late Arrival"
"arrival"            → "On Time"
"normal"             → "No Check-in"
```

---

## 6. Business Logic — Sorting Algorithm

Employees are sorted by urgency/severity. The sort key depends on whether the employee **has a checkout** yet.

### Sort Priority Tables

**No checkout (employee still in / hasn't checked out):**

| Priority | Status |
|---|---|
| 0 | unauthorized-leave |
| 1 | leave |
| 3 | late-arrival |
| 5 | arrival |
| 9 | normal (no check-in) |
| 99 | half-day / early-departure (shouldn't appear without checkout) |

**With checkout (employee has left):**

| Priority | Status |
|---|---|
| 0 | unauthorized-leave |
| 1 | leave |
| 2 | half-day |
| 4 | early-departure |
| 6 | late-arrival |
| 7 | arrival |
| 10 | normal (edge case) |

The interleaving of odd/even slots means an active late-arrival (priority 3) appears before a completed half-day (priority 2's neighbor is 3). This ensures "currently problematic" employees surface above "already resolved" ones.

### Search Filter Logic

After sorting, employees are filtered by `debouncedQuery` (280ms debounce):
- Matches against: `name`, `role`, `salary` (with `$` and `,` stripped via `normSalary()`)
- Case-insensitive `toLowerCase().includes()`
- Empty query = all employees shown

---

## 7. Business Logic — Actions & Mutations

### Context Menu Actions

**Triggered by:** right-click (desktop) or 600ms long-press (mobile) on any employee card.

Menu options: Edit | Leave | Unauthorized Leave | Half Day

**Half Day availability rule:**
```
canAssignHalfDay(emp, timing):
  → requires both checkIn AND checkOut
  → requires checkOut < officeEnd
  → OR emp.leaveStatus is already "half-day" (allows toggling off)
```

**Leave toggle logic (handleCtxAction):**
```
action === "edit"
  → toggle editingId: if already editing this emp, set null; else set empId

action is a LeaveStatus ("leave" | "unauthorized-leave" | "half-day")
  → newStatus = (current === action) ? null : action  (toggle)
  → if newStatus is "leave" or "unauthorized-leave":
      clear checkIn and checkOut to ""
  → if newStatus is null AND emp has no checkIn/checkOut:
      restore checkIn/checkOut from officeTiming.start/end
```

### Inline Edit Save (handleEditSave)

Triggered by the ✓ button on a card in editing mode.

```
Validation (in EmployeeCard.handleInlineSave):
  → if checkOut set but no checkIn: error "Check-in required first"
  → if both set and checkOut <= checkIn: error "Check-out must be after check-in"

On valid save:
  → update emp.checkIn and emp.checkOut with new 12h-formatted values
  → if emp.leaveStatus was "leave" or "unauthorized-leave": clear it to null
    (editing times implies presence — not a leave day)
  → set editingId = null
```

### Office Timing Update

`OfficeTimingHeader` maintains its own local state (`start`, `end`) that mirrors `officeTiming` prop. On Save it calls `onUpdate({ start, end })` which updates the parent's `officeTiming` state. This **immediately recalculates** all employee `getDisplayStatus()` results since they're derived from `officeTiming` via `useMemo`.

---

## 8. Business Logic — Add Employee Flow

### Data Transfer (sessionStorage Bus)

```
AddEmployeePage.onSave(data)
  → App.tsx.handleAddEmployeeSave(data)
    → sessionStorage.setItem("pending_employee", JSON.stringify(data))
    → goTo("admin-dashboard", "back")
    → AdminDashboard mounts / re-renders
    → useEffect reads sessionStorage["pending_employee"]
    → Parses data, creates new Employee object:
        id = max(existing ids) + 1
        name, role, salary from data
        checkIn = "", checkOut = ""
        leaveStatus = null
        att = 0, perf = 0
        avatar = data.avatar (WebP data URI, max 160px)
        initials, color from data
    → sessionStorage.removeItem("pending_employee")
```

**Why sessionStorage?** AddEmployeePage and AdminDashboard never co-exist in the DOM. The slide-in page is a separate top-level route, so they can't share React state directly. sessionStorage bridges the gap without a global store.

### Image Processing Pipeline

```
User selects / drops image
  → URL.createObjectURL(file)          (avoids FileReader)
  → new Image() → onload
  → scale = min(1, 160 / img.height)  (max 160px height)
  → canvas.drawImage(img, 0, 0, w, h)
  → canvas.toDataURL("image/webp", 0.82)  (WebP at 82%)
  → URL.revokeObjectURL(url)
  → setAvatarUrl(dataUrl)
```

### CNIC Formatter

`"42101" → "42101-"` at position 5, `"1234567890123"` → `"12345-6789012-3"`. Strips all non-digits first, slices to 13 digits, inserts dashes. Max display length: 15 chars (`XXXXX-XXXXXXX-X`).

### Salary Pill Auto-Resize

A hidden `<span ref={salSizerRef}>` mirrors the input value in the same font. `useLayoutEffect` reads its `offsetWidth` and sets the `<input>` width synchronously after every paint — prevents layout-flash while typing.

---

## 9. Dashboard UI Panels & Navigation

### Desktop Sidebar (≥768px)

Fixed left sidebar (`adm-sidebar`), `220px` wide. Contains:
1. `RestaurantLogo` SVG + brand name "MyRestaurant"
2. 4 nav buttons: Dashboard, Time & Leave, Analytics, Settings

### Mobile Bottom Nav (<768px)

Fixed bottom bar (`adm-bottom-nav`), 5 tabs:
Dashboard | Time | Alerts | Analytics | Settings

The **Alerts** tab has a notification dot (`adm-bnav-notif-dot`).

### Content Rendering by Tab

| `activeNav` | What renders inside `.adm-content` |
|---|---|
| `dashboard` | Employee grid only |
| `leave` | `OfficeTimingHeader` + employee grid |
| `analytics` | Employee grid only (Analytics UI not yet built) |
| `settings` | Employee grid only (Settings UI not yet built) |
| `notifications` | Employee grid only (Notifications UI not yet built) |

> **Gap:** Analytics, Settings, and Notifications tabs are wired for navigation but render no unique content yet.

### Content Enter Animation

`.adm-content-enter` class is applied to the content wrapper. `key={activeNav}` forces React to remount the div on tab change, retriggering the CSS enter animation.

---

## 10. Stats Calculations

All stats are `useMemo` derived from the `employees` array:

```typescript
presentCount = employees.filter(e => !e.leaveStatus && e.checkIn).length
halfDayCount = employees.filter(e => e.leaveStatus === "half-day").length
totalCount   = employees.length
```

**Displayed as:**
- Desktop: pill chips `"Present: N"` (green) and `"Half Day: N"` (teal, hidden if 0) + `"Total: N"` (plain text)
- Mobile: date + total on one row, chips on the next row

---

## 11. EmployeeCard Visual Logic

### Dot (status indicator)

Each card has a `<span className="adm-dot">` whose CSS modifier is determined by:

```
if emp.leaveStatus exists:
  dotCss = STATUS_CSS[displayStatus]   (unauth / leave / half / etc.)
else if emp.checkOut exists:
  dotCss = depStatus  ("early" | null) — null = normal departure
else:
  dotCss = arrStatus  ("late" | null)  — null = not yet in / on-time
```

Dot pulses (`adm-dot-pulse`) only when employee is **actively checked in** (has checkIn, no checkOut, no leaveStatus).

### Inline Edit Mode

When `editingId === emp.id`, the card renders two `<input type="time">` fields (24-hour format internally, 12-hour in storage). Checkout field is disabled until check-in has a value. Confirm button (✓) runs `handleInlineSave()`.

### Search Highlighting

The `Highlight` component wraps any text rendered inside cards. It finds the first case-insensitive match of `debouncedQuery` and wraps it in `<mark className="adm-card-mark">`. This applies to name, role, and salary fields.

### Card Stagger Animation

Cards animate in with `animationDelay: idx * 70ms` (inline style, since it's dynamic). The last card must appear within 200ms of the first — with a max of ~6 visible cards this produces `5 × 70ms = 350ms` total spread, which is slightly above the 200ms threshold. **TODO:** Should be `index × 40ms` per SSOT rule.

---

## 12. Context Menu — Complete Interaction Model

### Trigger

- **Desktop:** `onContextMenu` (right-click) on `.adm-card`
- **Mobile:** `onTouchStart` → 600ms timer → `onTongPress`. Timer clears on `touchEnd` or `touchMove`.

### Positioning (Viewport-Safe)

```
menuW = 196px, menuH = 184px
left = clamp(ctx.x, 8, window.innerWidth  - 196 - 8)
top  = clamp(ctx.y, 8, window.innerHeight - 184 - 8)
```

### Keyboard Navigation

Arrow keys move between 4 items (0=Edit, 1=Leave, 2=Unauth Leave, 3=Half Day). Half Day is disabled if `canAssignHalfDay()` is false. `Enter`/`Space` activates focused item. `Escape` closes.

### Close Triggers

- Click outside menu (`mousedown` on document)
- `Escape` key
- Window `blur` (tab switch / focus lost)
- Window `resize`
- Browser back/forward (`popstate`)

### Exit Animation

`useDelayedUnmount(!!ctxMenu, 220)` keeps the menu in the DOM for 220ms after `ctxMenu` is set to `null`. CSS reads `data-closing` attribute to trigger the exit animation.

---

## 13. Logout Modal — Hybrid Mount Pattern

```
logoutModalOpen: boolean → controls open/close
shouldRenderLogout = useDelayedUnmount(logoutModalOpen, 60_000ms)

60 second delay: user might click "Sign out" then cancel, 
then click again quickly. Keeping the modal mounted for 60s 
avoids paying remount cost for rapid open/close cycles.
```

Modal fires `onLogout` (App-level) which removes `auth_token` from localStorage and navigates to `/login` with direction `"back"`.

---

## 14. API Server — All Endpoints

**Base URL:** `/api`  
**Auth:** Bearer JWT in `Authorization` header (verified by `AuthGuard`).

### Health

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/healthz` | No | Returns `{ status: "ok" }` |

### Auth Flow

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/check` | No | Check if email is registered admin + has password |
| POST | `/api/auth/send-otp` | No | Generate + email 6-digit OTP (purpose: "login"\|"reset") |
| POST | `/api/auth/resend-otp` | No | Re-send OTP if expired/lost |
| POST | `/api/auth/sign-in` | No | Authenticate with email + password → JWT |
| POST | `/api/auth/verify-otp` | No | Verify 6-digit code; completes first-login password setup if `password` provided |
| POST | `/api/auth/reset-password` | No (uses resetToken) | Change password using 15-min resetToken |
| GET | `/api/auth/me` | **Yes** | Returns current user's email |
| DELETE | `/api/auth/session` | **Yes** | Virtual logout (client clears token) |

### Request / Response Shapes

**POST `/api/auth/check`**
```json
Request:  { "email": "admin@restaurant.com" }
Response: { "exists": true, "hasPassword": true }
```

**POST `/api/auth/send-otp`**
```json
Request:  { "email": "...", "purpose": "login" | "reset" }
Response: { "message": "OTP sent" }
```

**POST `/api/auth/sign-in`**
```json
Request:  { "email": "...", "password": "..." }
Response: { "token": "<JWT>" }   // 7-day expiry
```

**POST `/api/auth/verify-otp`**
```json
Request:  { "email": "...", "otp": "123456", "purpose": "login", "password"?: "..." }
// purpose=login, password provided → first-login setup → returns JWT
// purpose=reset → returns resetToken (15-min JWT)
Response: { "token": "<JWT>" } | { "resetToken": "<JWT>" }
```

**POST `/api/auth/reset-password`**
```json
Request:  { "resetToken": "...", "password": "...", "confirmPassword": "..." }
// password rules: min 8 chars, ≥1 digit, ≥1 special char
Response: { "message": "Password updated" }
```

### Security Details

| Mechanism | Implementation |
|---|---|
| Password hashing | bcryptjs, cost factor 12 (setup/reset) |
| OTP hashing | bcryptjs, cost factor 10 |
| OTP validity | 10 minutes |
| OTP re-send guard | Blocked if valid OTP already exists in DB |
| Rate limiting | In-memory Map: 5 failed attempts → 30-min lockout |
| JWT session | 7 days (HS256, secret from `JWT_SESSION` env var) |
| JWT reset | 15 minutes |
| Global throttle | `@nestjs/throttler`: 10 req/15 min (most routes skip via `@SkipThrottle`) |
| Admin seeding | `ADMIN_GMAIL` env var → seeds `admin_config` row on server startup |

---

## 15. Database Schema

**ORM:** Drizzle + Neon/PostgreSQL  
**Schema location:** `lib/db/src/schema/auth.ts`

### `admin_config` Table

```sql
CREATE TABLE admin_config (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

> `password_hash` is NULL until the admin completes first-login OTP verification with a new password.

### `otp_sessions` Table

```sql
CREATE TABLE otp_sessions (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  otp_hash   TEXT NOT NULL,
  purpose    VARCHAR(20) NOT NULL,    -- "login" | "reset"
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP,               -- set when OTP is consumed
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

OTPs are marked `used_at` atomically (DB-level update) to prevent concurrent replay attacks.

### Missing Tables (Next Development Phase)

The following tables **do not yet exist** and must be created to implement real data persistence:

| Table | Purpose |
|---|---|
| `employees` | Staff records (name, role, salary, avatar, CNIC, phone, etc.) |
| `attendance_records` | Daily check-in/out timestamps per employee |
| `leave_requests` | Leave applications (approved/unauthorized/half-day) |
| `office_settings` | Office timing configuration (currently in-memory only) |
| `employee_tasks` | Assigned tasks per employee |
| `employee_capabilities` | Work capabilities per employee |
| `employee_languages` | Spoken languages per employee |

---

## 16. Authentication Workflow (Full Flow)

### First-Time Login (Admin Has No Password Yet)

```
1. Admin enters email → POST /auth/check
   → { exists: true, hasPassword: false }
2. POST /auth/send-otp { purpose: "login" }
   → OTP emailed via Gmail SMTP (Nodemailer)
3. Admin enters 6-digit OTP + new password → POST /auth/verify-otp
   → OTP verified, password hashed (bcrypt 12), stored in admin_config
   → Returns JWT (7 days)
4. Frontend stores JWT in localStorage["auth_token"]
5. User navigates to /admin/dashboard
```

### Standard Login (Admin Has Password)

```
1. POST /auth/check → { exists: true, hasPassword: true }
2. POST /auth/sign-in { email, password }
   → bcrypt.compare(password, hash)
   → Returns JWT
3. Store JWT, navigate to dashboard
```

### Password Reset

```
1. POST /auth/send-otp { purpose: "reset" }
2. POST /auth/verify-otp { purpose: "reset" } (no password field)
   → Returns resetToken (15-min JWT stored in sessionStorage["reset_token"])
3. Navigate to /new-password
4. POST /auth/reset-password { resetToken, password, confirmPassword }
5. Clear sessionStorage["reset_token"], navigate back to /login
```

### Logout

```
1. AdminDashboard → AvatarDropdown → "Sign out" → LogoutModal confirm
2. App.tsx.handleLogout():
   → localStorage.removeItem("auth_token")
   → goTo("login", "back")
3. GET /api/auth/session (DELETE) — called for server-side audit (optional)
```

---

## 17. Design System — Animation Tokens

| Intent | Easing | Duration |
|---|---|---|
| Enter / spring in | `cubic-bezier(0.16, 1, 0.3, 1)` | 450–550ms |
| Exit / snap out | `cubic-bezier(0.4, 0, 1, 1)` | 200–250ms |
| Micro-interaction | `cubic-bezier(0.22, 1, 0.36, 1)` | 120–200ms |
| Float / breathe | `ease-in-out` | 3–5s infinite |

All durations live in CSS only — never in JS `setTimeout` for visual effects.

---

## 18. Responsive Breakpoint Strategy

**Mobile-first:** base styles (no breakpoint) → `@media (min-width: 768px)` for desktop.

| Element | Mobile | Desktop |
|---|---|---|
| Sidebar | hidden | visible (220px fixed left) |
| Bottom nav | visible (fixed bottom) | hidden |
| Mobile topbar (`.adm-topbar`) | visible | hidden |
| Desktop header (`.adm-header`) | hidden | visible |
| Desktop stats bar (`.adm-desktop-stats`) | hidden | visible |
| Mobile stats block (`.adm-mobile-stats`) | visible | hidden |
| Employee grid | 1 column | 2 columns |
| Add Employee layout | 2-column (fields) | 3-column with photo col |

---

## 19. Performance Rules (SSOT — Applied Everywhere)

| Rule | Mechanism |
|---|---|
| Expensive derivations | `useMemo([deps])` — sorted/filtered employee list, stat counts |
| Stable callbacks | `useCallback([deps])` — requestLogout, closeDropdown, handleCtxAction, etc. |
| Pure presentational | `React.memo()` — EmployeeCard, ProgressBar, AvatarImg, Highlight, BulletList |
| Heavy components | `React.lazy() + <Suspense>` — every top-level route |
| Dynamic lists | Stable `key={emp.id}` (never array index) |
| Search debounce | 280ms via `useDebounce` |
| Image storage | Max 160px height, WebP 82%, `canvas.toDataURL` |
| Card blur effect | **Not used** on cards (>2–3 repeated blur layers = GPU composite penalty) |
| Card animations | `will-change: transform, opacity` on `.adm-card` |
| Card isolation | `contain: layout style paint` on `.adm-card` |

### Vite Manual Chunks (vite.config.ts)

```
"vendor-react":  ["react", "react-dom"]
"vendor-motion": ["framer-motion"]          (if added)
"vendor-query":  ["@tanstack/react-query"]  (if added)
```

---

## 20. CSS Architecture

### File Structure

```
artifacts/onboarding/src/
├── index.css                  — Global tokens (:root), .topbar, .chip, .cta-btn, 
│                                .pg-icon-btn, .t-ttl, .t-sp, .view-fwd, .view-back
├── styles/
│   ├── admin-dashboard.css    — .adm-* classes (desktop header, cards, grid, modals, etc.)
│   ├── add-employee.css       — .ae-* classes (slide-in page, all form elements)
│   ├── navbar.css             — .adm-sidebar, .adm-bottom-nav, .adm-bnav-* classes
│   └── main-bg.css            — dashboard background texture
```

### Global SSOT Classes (index.css)

| Class | Purpose |
|---|---|
| `.topbar` | Page-level top bar chrome (bg, border, height, padding) |
| `.t-ttl` | Topbar title (flex:1, centred text) |
| `.t-sp` | Topbar spacer (mirrors icon-btn width for symmetry) |
| `.chip` | Pill/chip base structure (border-radius, padding, font) — no color |
| `.pg-icon-btn` | 38×38 icon button (back arrows, close, toggle) |
| `.cta-btn` | Primary CTA button |
| `.adm-lazy-fallback` | Suspense placeholder |

### CSS Naming Convention

| Namespace | Usage | Max length |
|---|---|---|
| `--token` | CSS variables (:root) | — |
| `.adm-*` | AdminDashboard page scope | Grandfathered (can be long) |
| `.ae-*` | AddEmployee page scope | Grandfathered (can be long) |
| New global classes | Short semantic names | **Max 5–6 characters** (e.g. `.chip`, `.bnav`) |

---

## 21. Hooks Reference

### `useDebounce<T>(value, delay = 300): T`

File: `hooks/useDebounce.ts`

Returns a debounced copy of `value` that only updates after `delay` ms of no changes. Used for the search input (280ms) to avoid re-filtering on every keystroke.

### `useDelayedUnmount(isOpen, delayMs = 60000): boolean`

File: `hooks/useDelayedUnmount.ts`

Implements the "Smart Hybrid Mount" pattern:
```
First trigger  → mount immediately
Close          → start countdown before unmount
Reopen         → cancel countdown, keep mounted
Countdown ends → unmount
```

Usage:
- LogoutModal: `delayMs = 60_000` (60 second re-open cache)
- ContextMenu: `delayMs = 220` (just enough for exit CSS animation)
- AvatarDropdown: `delayMs = 220`

---

## 22. Environment Variables

All managed as Replit Secrets — never hardcoded, never passed to Flutter app.

| Variable | Server | Notes |
|---|---|---|
| `NEON_DATABASE_URL` | API Server | Neon PostgreSQL connection string |
| `JWT_SESSION` | API Server | HS256 secret for session JWTs |
| `GMAIL` | API Server | Gmail account for OTP emails |
| `GMAIL_APP_PASSWORD` | API Server | Gmail app password (not account password) |
| `ADMIN_GMAIL` | API Server | Seeds the initial admin_config row on startup |
| `PORT` | Both | 5000 (web) / 8080 (API) |

Flutter receives `API_BASE_URL` and `ADMIN_GMAIL` via `--dart-define` flags at build time.

---

## 23. Known Gaps & Next Development Steps

### Critical (blocking real users)

1. **Employee data is not persisted** — all data lives in React `useState`. A page refresh resets to seed data. Need `employees`, `attendance_records`, `leave_requests` tables + CRUD API endpoints.

2. **Office timing is not persisted** — reset to `08:00 AM – 06:00 PM` on refresh. Need `office_settings` table + API.

3. **Attendance records are date-agnostic** — current check-in/out data has no date dimension. Dashboard shows "today" label but data has no date. Need timestamp columns.

4. **Auth token stored in localStorage** — acceptable for MVP but should move to httpOnly cookie for production security.

### Medium Priority

5. **Analytics tab** — No content. Needs: attendance trend charts, punctuality rates, leave frequency, performance heatmaps.

6. **Settings tab** — No content. Needs: office timing (move from Time & Leave), notification preferences, admin password change.

7. **Notifications tab** — No content. Needs: real-time alerts for unauthorized absences, late arrivals above threshold.

8. **Leave Requests workflow** — Employees can't submit leave requests via the mobile app. No approval workflow exists.

9. **ATT% and PERF%** — Currently static seed values. No calculation logic or source of truth.

10. **Card stagger delay** — Currently `idx × 70ms`. SSOT rule requires `idx × 40ms`. Should be fixed.

### Low Priority / Future

11. **Multiple admin roles** — System currently supports exactly one admin (seeded from `ADMIN_GMAIL`).

12. **Employee profile page** — No drill-down view for individual employee history.

13. **Export / reporting** — No CSV/PDF export functionality.

14. **Flutter sync** — Mobile app auth screens are complete and synced. Dashboard and attendance screens not yet ported (per the Freeze-Then-Port rule — React must stabilise first).

---

## 24. File Dependency Map

```
App.tsx
  ├── imports: components/WelcomeFlow    (lazy)
  ├── imports: components/LoginFlow      (lazy — exports WelcomeFlow + ResetPasswordScreen)
  ├── imports: components/AdminDashboard (lazy)
  └── imports: components/AddEmployeePage (lazy — also exports NewEmployeeData type)

AdminDashboard.tsx
  ├── imports: hooks/useDebounce
  ├── imports: hooks/useDelayedUnmount
  ├── imports: components/AddEmployeePage (type only: NewEmployeeData)
  ├── imports: styles/main-bg.css
  └── imports: styles/admin-dashboard.css

AddEmployeePage.tsx
  ├── imports: components/ui/Button
  ├── imports: components/ui/Input (TextInput)
  └── imports: styles/add-employee.css

LoginFlow.tsx
  ├── imports: components/ui/Button
  ├── imports: components/ui/Input (TextInput, PasswordInput)
  └── imports: components/backgrounds/AuthBg
```

---

## 25. Quick-Start Context for a New AI Agent

If you are continuing development on this codebase, here is what you need to know immediately:

1. **The dashboard has no real backend data yet.** All employee data is hardcoded in `INITIAL_EMPLOYEES` in `AdminDashboard.tsx`. Your first major task will likely be connecting it to a real database via new API endpoints.

2. **The authentication system is complete and production-ready.** Do not touch `AuthService`, `EmailService`, `JwtUtil`, or the DTOs unless adding a new auth feature. The OTP + bcrypt + rate-limiting system works correctly.

3. **No color values anywhere except two SSOT files.** All colors are CSS variables from `artifacts/onboarding/src/index.css` `:root` or `AppColors.*` in Dart. If you add a color somewhere else, that is a bug.

4. **Every new React component must be `React.memo()` if it appears in a list.** Every new callback must be `useCallback`. Every new derived value must be `useMemo`. Non-negotiable.

5. **Modals and overlays must use `useDelayedUnmount`.** Never unmount immediately. Delay 220ms for animation-only, 60s for user-accessible panels.

6. **New CSS classes must be max 5–6 characters** (applies to global/standalone classes, not page-scoped `adm-*` or `ae-*` which are grandfathered).

7. **The Navbar is inline in AdminDashboard.tsx.** It was refactored away in a previous session — the plan was to extract it to `Navbar.tsx` but it currently still lives inline in `AdminDashboard.tsx`.

8. **The `replit.md` file at the project root contains the full SSOT coding standards.** Always read it before making changes. It is the law.
