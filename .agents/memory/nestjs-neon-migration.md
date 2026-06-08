---
name: NestJS + Neon migration
description: Architecture decisions and gotchas from migrating api-server from Express+Back4App to NestJS+Neon PostgreSQL.
---

## Data storage
- **All data is stored in Neon (cloud PostgreSQL).** No local storage of any persistent data. Never suggest or implement local file/SQLite storage.

## Build system
- esbuild bundles `src/main.ts` → `dist/main.mjs` (ESM). All `@nestjs/*`, `class-validator`, `class-transformer`, `reflect-metadata`, `helmet`, `nodemailer` are **externalized**; `@workspace/db` and `@workspace/api-zod` are **bundled**.
- `rxjs` must be listed in `dependencies` (NestJS peer dep) and `@nestjs/core` must be in `pnpm-workspace.yaml` `onlyBuiltDependencies` for its postinstall script to run.

**Why:** NestJS requires `rxjs` as a peer at runtime; skipping it causes module-not-found errors at startup.

## Decorators / DI
- No `emitDecoratorMetadata` in tsconfig — use **explicit `@Inject(TOKEN)` decorators** everywhere instead of relying on metadata reflection.

**Why:** esbuild does not support `emitDecoratorMetadata`; explicit injection is the only safe path.

## UUID columns in Drizzle
- Drizzle `uuid()` columns type as plain `string` in TypeScript. Do NOT cast to the template-literal UUID type when passing to `eq()` — it compiles but causes confusion and the cast is unnecessary.

## Auth flow
- `POST /api/auth/login`: if user has `passwordHash` → immediate session; if no `passwordHash` (first login) → OTP sent, returns `{scenario:'first-login', expiresAt, email}`.
- `POST /api/auth/verify-otp`: accepts `{email, otp, password}` — sets password hash and creates session in one step.
- Login and signup use the **same endpoint** (`POST /api/auth/login`). The server checks the employee table and user table to determine the scenario.
- **Logout redirect:** After logout, always redirect to `/signin` (not `/onboarding/0`).

## Flutter HTTP layer
- Removed `parse_server_sdk_flutter` and `crypto`; added `http: ^1.2.0`.
- `AuthRepository` returns a sealed `LoginResult` (`LoginSession` | `LoginOtpPending`).
- `AuthNotifier` has `AuthOtpPending` state carrying `{email, expiresAt, pendingPassword}`.
- OTP verification moved from `OtpNotifier.verifyOtp()` to `AuthNotifier.verifyOtp(email, otp, password)` — so password is available to set the hash on first login.
- `OtpNotifier.sendOtp()` now calls `POST /api/auth/resend-otp` (was local generate-and-send).
- `OtpNotifier.initCountdown(expiresAtMs)` initialises the countdown from a server-provided timestamp.
- `OtpModal` now requires a `password` parameter and watches `authProvider` for loading/error state.

## Admin bootstrap
- Server bootstraps the admin employee + user records on cold start (via `UsersRepository.ensureAdminAccount()`).
- Flutter `AuthRepository.ensureAdminEmployee()` is a no-op — kept for router compatibility, does nothing.

## API contract (unchanged from Express version)
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `GET  /api/auth/otp-status`
- `GET  /api/auth/session`
- `DELETE /api/auth/session`
- `GET  /api/healthz`
