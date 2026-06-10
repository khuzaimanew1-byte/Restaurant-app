# SSOT — Staff Attendance App

Single Source of Truth for all platforms (React Web + Flutter).
Code follows this file. Platforms sync with this file, not with each other.

---

## Pages & Flows

### Onboarding
- 3 slides, skip jumps to last slide
- After last slide → Login

### Login
- Email + Password fields
- Password show/hide toggle
- Terms of Service checkbox (must agree before login)
- "Forgot password?" link (blocked if any OTP banner active)
- On submit: email validation → terms check → sign-in guard → API call
- On success: OTP Modal (first login) or Success page (returning user)

### OTP Verification (First Login)
- Triggered after first successful login attempt
- 6-digit code sent to registered email
- Auto-submit ~60ms after 6th digit or full-6-digit paste
- OTP expiry countdown shown; "Resend OTP" shown when expired
- Error/expired banner shown below OTP boxes
- Email masked: `te***@example.com`
- **No extra navigation button** — dismiss only via swipe (React) / Back button (Flutter)

### Forgot Password (Two-step modal)
- Step 0: OTP entry — same OTP sheet UI, title "Reset Password"
  - Footer: "Change email" button (closes modal)
- Step 1: New Password + Confirm Password inputs
  - Mounts only after OTP locally confirmed (no extra API call at this point)
  - Slide-up animation for step 1

### Success Page
- Shown after OTP verified (returning users) or after registration flow

---

## Validation

### Email
```
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Password Complexity
- Min 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character: `!@#$%^&*()-_=+[]{};':"\\|,.<>/?`

Applied on: first-login OTP verify, forgot-password reset.

---

## Business Rules

- Admin role cannot be self-assigned; comes from `ADMIN_GMAIL` env var only
- OTP sessions: server-side, hashed (bcrypt cost 10)
- Passwords: hashed server-side (bcrypt cost 12)
- First-launch detection: `onboarding_complete` key (Flutter SharedPreferences)
- Sign-in guard: blocked when any OTP banner is active (shake the banner instead)
- Forgot-password guard: blocked when any OTP banner is active
- Email blur → `GET /api/auth/otp-status?email=` → show/hide banner

---

## API Contracts

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Login; returns sessionToken or OTP trigger |
| POST | `/api/auth/verify-otp` | Verify first-login OTP |
| POST | `/api/auth/resend-otp` | Resend first-login OTP |
| POST | `/api/auth/forgot-password` | Send forgot-password OTP |
| POST | `/api/auth/reset-password` | Verify OTP + set new password |
| GET  | `/api/auth/otp-status` | Check active OTP session for email |

---

## Design Tokens

### Colors (React — inline style vars)
```
accent      indigo-500  #6366F1 / #4F46E5
accentBtn   gradient or flat accent
dark bg     rgba(12,10,35,0.97)
light bg    rgba(255,255,255,0.98)
dark text   rgba(242,241,255,0.97)
light text  #09071E
dark sub    rgba(200,197,245,0.46)
light sub   rgba(13,11,30,0.46)
error dark  #F87171
error light #DC2626
success d   #34D399
success l   #059669
```

### Flutter (AppColors)
```dart
AppColors.indigo         // primary accent
AppColors.darkSurface    // modal background dark
AppColors.lightSurface   // modal background light
AppColors.darkPrimary    // heading dark
AppColors.lightPrimary   // heading light
AppColors.darkSecondary  // subtext dark
AppColors.lightSecondary // subtext light
AppColors.error          // red error
```

---

## Modal / Sheet System

### Pattern: Hybrid open/close (BottomSheet)
All modals use a two-phase mount:
1. Component mounts → `visible = false` (card below viewport, backdrop transparent)
2. After 20ms → `visible = true` → CSS transition fires (slide-up + fade-in backdrop)
3. On close: animate out before unmounting (caller controls unmount timing)

```tsx
// shared.tsx — BottomSheet
visible={true}  → transform: translateY(0), opacity: 1
visible={false} → transform: translateY(100%), opacity: 0
transition: transform 0.46s cubic-bezier(0.22,1,0.36,1)
```

Applied to:
- `OtpSheet` → `sheetVisible` state (self-managed) or `externalVisible` prop (lifecycle-managed)
- `ForgotPasswordModal` step 1 → `step1Visible` state, delay 80ms; respects `externalVisible`
- `ForgotPasswordModal` step 0 → rendered via `OtpSheet` with `externalVisible` passed through

Flutter equivalent: `showModalBottomSheet` with `isScrollControlled: true`.

### Lifecycle Manager — `useSoftMount` (`lib/shared.tsx`)
Single hook for modal mount/visible lifecycle. Replaces bare `useState(false)` for any modal that may be reopened.

```ts
const sheet = useSoftMount(120_000); // softDelay default: 120 s
sheet.open()          // mounts → 20ms → visible (CSS transition fires)
sheet.close()         // visible=false → stays mounted 120s → unmounts
sheet.close(true)     // visible=false + unmount immediately
sheet.mounted         // use as render guard: {sheet.mounted && <Modal />}
sheet.visible         // pass as externalVisible prop to OtpSheet/modal
```

Currently applied to: `ForgotPasswordModal` in `LoginPage` (`forgotSheet`).
`OtpModal` uses simple mount/unmount (single-use per session — soft-mount adds no value).

---

## Shared Components (React — `lib/shared.tsx`)

| Export | Purpose |
|--------|---------|
| `BottomSheet` | Backdrop + slide-up card + handle bar |
| `AlertBox` | Red error banner with icon |
| `FieldError` | Inline field error text |
| `PasswordToggle` | Eye icon show/hide button |
| `PwRequirements` | 4-pill password complexity indicator |
| `Spinner` | CSS spin animation |
| `formField()` | Label + underline + sweep-line style factory |
| `useFormColors()` | Semantic colors (head, sub, success) |
| `useDarkMode()` | System dark mode + toggle |
| `useCountdown()` | ms countdown from epoch |
| `useShake()` | CSS shake animation trigger |
| `validatePwComplexity()` | Returns error string or null |
| `formatTimer()` | `M:SS` string from ms |
| `formatCountdown()` | `Ns` / `N min` from ms |

### OtpSheet (`components/OtpSheet.tsx`)
Shared OTP UI used by both `OtpModal` and `ForgotPasswordModal`.
Props: `email, dark, accent, accentBtn, btnShadow, expiresAt, title, verifyLabel, verifying, resending, error, onVerify, onResend, onClose, footer?`

---

## Cross-Platform Sync

**Direction**: React → Flutter only. Never Flutter → React.
**Trigger**: Any shared screen change in React must be mirrored in Flutter without separate instruction.

### Deliberate Platform Differences (do NOT sync away)
| Feature | React | Flutter |
|---------|-------|---------|
| Dark mode toggle | Manual toggle button | System theme only |
| OTP modal dismiss | Swipe-to-dismiss (no button) | "Back" TextButton |
| Haptic feedback | None | `HapticFeedback.*` calls |
| Countdown format | `M:SS` via `formatTimer` | Same `MM:SS` padLeft |

---

## Page Load Optimization

Rules: never change UI, behavior, output, or logic. Only code/technique/method changes.

### Lazy loading
- Any screen/page NOT shown on initial render → `React.lazy()` + `Suspense`
- Always preload lazy chunks immediately (module-level `void import(...)`) so chunks are ready before user navigates — no spinner flash
- First screen shown (Onboarding) → eager import (cannot be lazy)
- Suspense fallback → reuse the existing loading/checking screen component

```tsx
// Pattern for lazy screen with immediate preload
const LoginPage = lazy(() => import("./components/LoginPage").then(m => ({ default: m.LoginPage })));
void import("./components/LoginPage"); // preload immediately
```

### Vendor chunk splitting (Vite build)
Split stable vendor code into separate cacheable chunks via `rollupOptions.output.manualChunks`:
```ts
manualChunks: {
  "react-vendor": ["react", "react-dom"],
  "query-vendor": ["@tanstack/react-query"],
}
```
App code changes often; vendor code rarely — separate chunks = better browser caching.

### Font loading
- `preconnect` to font provider origin (already in `index.html`)
- Load font CSS non-blocking: `rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"`
- `<noscript>` fallback for no-JS environments
- Always include `display=swap` in font URL

### Color scheme hint
Add `<meta name="color-scheme" content="light dark">` so browser renders scrollbars and system UI correctly before CSS loads.

---

## Reuse Rules

Before creating new code:
1. Reuse existing implementation
2. Extend with props/parameters
3. Parameterize differences
4. Create new only if truly different

No duplicate: logic, UI, validation, styles, services, helpers.
Same cheez 2 jagah use ho → extract to shared module.

---

## Security Rules

- Plain text passwords: never stored, never logged
- bcrypt: passwords cost 12, OTPs cost 10
- Input sanitization on all API endpoints
- RBAC: role checked server-side only
- Rate limiting on all auth endpoints
- Sensitive data (tokens, passwords): never in logs or client-visible errors

---

## Performance Rules

- Pagination everywhere, lazy load lists
- Only actively used data in memory
- Stream data instead of full load where possible
- Modal lifecycle: mount on trigger, auto-destroy when not needed

---

## Dead Code Policy

- No unused imports
- No unused variables or functions
- No commented-out production code
- Remove immediately when feature is removed
