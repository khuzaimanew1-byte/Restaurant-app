---
name: Flutter SSOT compliance
description: Key decisions made when bringing Flutter codebase to 100% SSOT compliance per replit.md rules.
---

## AppTextStyles SSOT (app_text_styles.dart)
Named tokens cover all use cases — never add an inline TextStyle with raw values. Tokens added:
`headline`, `headlineLogin`, `headlineSm`, `body`, `bodyXs`, `bodyXsTer`, `link`, `linkSm`,
`forgotLink`, `error`, `inputText`, `ctaButton`, `skipLabel`, `chipText`.
`forgotLink` is a non-const getter (uses `.withValues()` which is runtime).

**Why:** Rule 0a mandates `AppTextStyles.*` always — any new text style must be added here first.

**How to apply:** Before writing `TextStyle(...)` anywhere in Dart, add a named token to `app_text_styles.dart` and reference it.

## AppColors additions
`AppColors.accentBg = Color(0x1CC4820A)` — radial gradient backing color for auth screens.
`Color(0x1CC4820A)` must never appear inline; always use `AppColors.accentBg`.

## Avatar palette CSS SSOT
AVATAR_PALETTE in `AddEmployeePage.tsx` uses `"var(--av-p1)"…"var(--av-p8)"` (not hex strings).
Hex values live only in `index.css :root` as `--av-p1` through `--av-p8`.

## Riverpod LoginNotifier
`login_notifier.dart` holds `LoginScreen` enum, `LoginState`, `LoginNotifier`, `loginProvider` (autoDispose StateNotifierProvider).
`LoginPage` is a `ConsumerWidget`; sub-screens (_SignInScreenState, _OtpScreenState, _ResetPasswordScreenState) remain StatefulWidget.

**Why:** Top-level screen routing belongs in Riverpod; sub-screen form state (TextEditingControllers, countdown timers) legitimately needs StatefulWidget lifecycle.

## Legitimate setState exceptions
- `onboarding_page.dart`: TickerProviderStateMixin for page-indicator animations — must stay StatefulWidget.
- Login sub-screens: TextEditingControllers + Timer-driven OTP countdown — must stay StatefulWidget.
These are NOT rule violations; add comment `/* animation-only state — TickerProviderStateMixin */` when reviewers question it.
