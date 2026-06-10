---
name: Cross-platform sync rule
description: React Web ↔ Flutter synchronization policy for shared screens, including what is deliberately different vs. what must stay in sync.
---

## Rule
React is the reference implementation. Sync direction is **React → Flutter only**. Flutter se React sync NAHI karna (user-confirmed rule).

Whenever a shared screen changes in React, apply the equivalent change to Flutter **without needing to be asked**. Platform-specific UI adaptations are allowed; business logic and validation must stay identical.

## Shared screens (auto-sync required)
- Onboarding (3 slides)
- Login (entire page — form, validation, Terms checkbox, Forgot Password flow)
- OTP Modal / Verification (first-login OTP)
- Forgot Password Modal (two-step: OTP → new password)

## React locations
- `artifacts/onboarding/src/components/OnboardingFlow.tsx`
- `artifacts/onboarding/src/components/LoginPage.tsx`
- `artifacts/onboarding/src/components/OtpModal.tsx`
- `artifacts/onboarding/src/components/ForgotPasswordModal.tsx`
- `artifacts/onboarding/src/lib/api.ts`

## Flutter locations
- `flutter_onboarding/lib/features/onboarding/presentation/pages/onboarding_page.dart`
- `flutter_onboarding/lib/features/onboarding/data/onboarding_data.dart`
- `flutter_onboarding/lib/features/auth/presentation/screens/login_screen.dart`
- `flutter_onboarding/lib/features/auth/presentation/widgets/otp_modal.dart`
- `flutter_onboarding/lib/features/auth/presentation/widgets/forgot_password_modal.dart`
- `flutter_onboarding/lib/features/auth/presentation/providers/auth_provider.dart`
- `flutter_onboarding/lib/features/auth/presentation/providers/otp_provider.dart`
- `flutter_onboarding/lib/features/auth/data/repositories/auth_repository.dart`

## Password validation rule (both platforms)
- Minimum 8 characters
- At least 1 number
- At least 1 special character from: `!@#$%^&*()-_=+[]{};':"\\|,.<>/?`
- Applied on: first-login OTP verify, forgot-password reset. Login page shows same validation to guide user.

## Forgot Password flow (both platforms)
1. User must have email filled + valid on login page — else vibration/shake animation + error
2. Click "Forgot password?" → opens ForgotPasswordModal (bottom sheet)
3. Modal sends OTP to the registered email via `POST /api/auth/forgot-password`
4. User enters 6-digit OTP → clicks "Verify OTP →"
5. Slide animation within the same modal → Step 1 mounts (new password + confirm password inputs only mount AFTER OTP locally confirmed)
6. User enters new password + confirm → "Set Password" → calls `POST /api/auth/reset-password`

## Deliberate platform differences (acceptable — do NOT sync away)
- **Dark mode toggle**: React has it; Flutter uses system theme.
- **Drag-to-dismiss OTP modal**: React swipe-to-dismiss; Flutter has "Back" button.
- **Haptic feedback**: Flutter has `HapticFeedback` calls; React doesn't.
- **Countdown timer format**: React `"M:SS"` via `formatTimer(ms)`; Flutter OtpBanner uses same format `"M:SS"`.
- **Onboarding skip**: Both jump to last slide (already in sync).
- **Banner indentation in code**: Flutter's Column/Expanded structure looks visually odd (indentation mismatch) but is syntactically correct Dart.

## Terms of Service checkbox
Both platforms now have it on the login page. Flutter: `_agreedToTerms` bool with error state `_agreedError`. React: `agreed` state. Must agree before login proceeds.

## Resolved gaps (June 2026)
1. **Email validation regex**: Both use `^[^\s@]+@[^\s@]+\.[^\s@]+$`
2. **OTP auto-submit**: Both fire ~60ms after 6th digit entered or full-6-digit paste.
3. **OTP paste distribution**: Both spread pasted digits across boxes.
4. **Password complexity**: Both require 8+ chars, 1 number, 1 special char.
5. **Terms checkbox**: Now on both platforms (Flutter was missing it).
6. **Forgot Password**: Full two-step modal now on both platforms.
7. **Email shake on forgot-password with empty/invalid email**: Both platforms vibrate/shake.
8. **OTP session banner**: Both platforms now show banners for active login-OTP session and active forgot-password OTP (when modal closed). Flutter uses `OtpBanner` widget in `core/widgets/otp_banner.dart`.
14. **OTP Modal email masking**: Both now show `te***@example.com` format. Flutter `otp_modal.dart` uses `_maskEmail()` file-level helper; `forgot_password_modal.dart` uses `_maskEmail()` declared at top of its file.
15. **OTP Modal error/expired banner**: Both now show a red info banner below OTP boxes when `hasError` or timer expired. Flutter: `if (hasError || expired)` block in `otp_modal.dart`.
16. **ForgotPasswordModal description text**: Both now say "must include a number and special character" — "uppercase" was never a real requirement and has been removed from Flutter description.
9. **Email blur → OTP status check**: Both call `GET /api/auth/otp-status?email=...` on email field blur. Flutter uses `FocusNode` listener calling `_checkOtpSession()`.
10. **Sign-in guard**: Both block login when any OTP banner is active (shake the active banner instead).
11. **Forgot-password guard**: Both disable/block forgot-password when any OTP banner is active.
12. **ForgotPasswordModal `onNewExpiry`**: Both propagate new expiresAt to parent when OTP is resent, so parent banner timer resets.
13. **Dead `signup` method**: Removed from `auth_repository.dart`.

**Why:** User confirmed React as reference for all shared screens. Flutter must match without separate instruction.
