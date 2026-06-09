# Attendance App — Monorepo

A staff attendance management platform consisting of:
- **Flutter app** (`flutter_onboarding/`) — Mobile app with premium onboarding + full auth flow
- **React onboarding preview** (`artifacts/onboarding/`) — Web preview of the onboarding UI at `/`

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

### Flutter app
```bash
cd flutter_onboarding
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=https://$REPLIT_DEV_DOMAIN/api \
  --dart-define=ADMIN_GMAIL=$ADMIN_GMAIL
```

## Stack

### Web (React)
- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite (onboarding preview)

### Mobile (Flutter)
- Flutter 3.x, Dart 3.3+
- Material 3 + Cupertino styling
- State management: Riverpod 2
- Navigation: go_router
- Backend: NestJS API (`artifacts/api-server`)
- Auth: bcryptjs password hashing
- Email OTP: Nodemailer + Gmail SMTP (server-side)

## Where things live

| Path | Purpose |
|------|---------|
| `flutter_onboarding/lib/core/` | Shared constants, router, widgets |
| `flutter_onboarding/lib/features/onboarding/` | 3-page onboarding flow |
| `flutter_onboarding/lib/features/auth/` | Login, Signup, OTP, Success |
| `artifacts/api-server/` | NestJS backend (auth, OTP, sessions) |
| `artifacts/onboarding/` | React web preview of the onboarding UI |
| `lib/db/` | Drizzle ORM schema + Neon/PG client |

## Architecture decisions

- **bcryptjs password hashing**: passwords hashed server-side with bcrypt (cost 12); OTPs hashed with cost 10
- **Email OTP via Nodemailer**: sent server-side using `GMAIL` + `GMAIL_APP_PASSWORD` env vars — credentials never in the Flutter app
- **Admin safety**: `ADMIN_GMAIL` from env; no user can ever self-assign the ADMIN role
- **First-launch detection**: `SharedPreferences` key `onboarding_complete` — set once, never shown again
- **Separate `employees` + `users` tables**: `employees` holds pre-registered records; a `users` row is created only after OTP verification

## User preferences

### Architectural Rules (Governing Principles)

**Sync direction**: React Web → Flutter only. Flutter se React sync NAHI karna.

**Flutter Mirror Rule**: Login page aur Onboarding page React ka exact mirror hona chahiye — same structure, same validation, same flow. Agar React mein change ho to bina alag instruction ke Flutter mein bhi apply karo.

**SSOT (Single Source of Truth)**: System configuration .md files mein store honi chahiye. Jo .md mein nahi hai woh exist nahi karta.

**DRY (Don't Repeat Yourself)**: Same logic kabhi twice nahi likhna. Reuse hone wali logic ko function/module mein extract karo. Variation ko duplication nahi, parameterization samjho.

**Dead Code**: Unused functions, variables, imports, styles immediately hatao. Production mein commented unused blocks allowed nahi.

**Style Tokens**: Sab colors, spacing, fonts short variables mein hone chahiye (1–4 chars: c1, bg1, t1, s1 etc). Hardcoded styling allowed nahi.

**Reusable Components**: Agar style/component 2+ baar repeat ho to class/component banao. Class names short rakho (2–4 chars: btn, inp, crd, mdl).

**Performance**: Sirf jo actively use ho woh memory mein rakho. Pagination everywhere, lazy load, stream data instead of full load.

**Security**: Plain text passwords never. bcrypt hashing. Input sanitization. RBAC. Rate limiting on auth endpoints. Sensitive data never log karo.

**Popup/Modal Lifecycle**: Mount when triggered, soft-mount 120s while recently used, auto-destroy if unused. Single lifecycle manager.

**Minification (Production only)**: Short identifiers allowed — local scope: 1–2 chars, module: 2–3, global: 3+. Development mein readable names.

## Gotchas

- Pass secrets as `--dart-define` flags, not OS env vars (Flutter mobile can't read `Platform.environment` for build-time constants)
- `GMAIL` and `GMAIL_APP_PASSWORD` are Replit secrets on the API server — never put them in the Flutter app
- Run `flutter pub get` after any `pubspec.yaml` change
- API server requires `NEON_DATABASE_URL` (or `DATABASE_URL`) and `PORT` env vars to start
