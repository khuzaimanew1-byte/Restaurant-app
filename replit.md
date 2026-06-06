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
  --dart-define=BACK4APP_APP_ID=$BACK4APP_APP_ID \
  --dart-define=BACK4APP_JS_KEY=$BACK4APP_JS_KEY \
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
- Backend: Back4App (Parse SDK)
- Auth: Custom password hashing (SHA-256)
- Email OTP: Back4App Cloud Code + Gmail SMTP

## Where things live

| Path | Purpose |
|------|---------|
| `flutter_onboarding/lib/core/` | Shared constants, router, widgets |
| `flutter_onboarding/lib/features/onboarding/` | 3-page onboarding flow |
| `flutter_onboarding/lib/features/auth/` | Login, Signup, OTP, Success |
| `flutter_onboarding/back4app_cloud_code/` | Server-side OTP email (Node.js) |
| `artifacts/onboarding/` | React web preview of the onboarding UI |

## Architecture decisions

- **Custom password hashing**: SHA-256 + app salt (not Parse's built-in User auth) for full control
- **Cloud Code for email**: OTP emails sent server-side via Back4App Cloud Code + nodemailer — Gmail credentials never leave the server
- **Admin safety**: `ADMIN_GMAIL` from env; no user can ever self-assign the ADMIN role
- **First-launch detection**: `SharedPreferences` key `onboarding_complete` — set once, never shown again
- **Separate Employee + AppUser classes**: Employee holds pre-registered records; AppUser is created only after OTP verification

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Pass secrets as `--dart-define` flags, not OS env vars (Flutter mobile can't read `Platform.environment` for build-time constants)
- `GMAIL` and `GMAIL_APP_PASSWORD` go in Back4App Cloud Code env variables only — never in the Flutter app
- Run `flutter pub get` after any `pubspec.yaml` change
- Back4App class names are case-sensitive: `Employee`, `AppUser`, `OTP`
