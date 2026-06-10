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

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Pass secrets as `--dart-define` flags, not OS env vars (Flutter mobile can't read `Platform.environment` for build-time constants)
- `GMAIL` and `GMAIL_APP_PASSWORD` are Replit secrets on the API server — never put them in the Flutter app
- Run `flutter pub get` after any `pubspec.yaml` change
- API server requires `NEON_DATABASE_URL` (or `DATABASE_URL`) and `PORT` env vars to start
