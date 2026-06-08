---
name: Cross-platform sync rule
description: React Web ↔ Flutter synchronization policy for shared screens, including what is deliberately different vs. what must stay in sync.
---

## Rule
React is the reference implementation. Whenever a shared screen changes in either platform, apply the equivalent change to the other. Platform-specific UI adaptations are allowed; business logic and validation must stay identical.

## Shared screens
- Onboarding (3 slides)
- Login
- OTP Modal / Verification

## React locations
- `artifacts/onboarding/src/components/OnboardingFlow.tsx`
- `artifacts/onboarding/src/components/LoginPage.tsx`
- `artifacts/onboarding/src/components/OtpModal.tsx`

## Flutter locations
- `flutter_onboarding/lib/features/onboarding/presentation/pages/onboarding_page.dart`
- `flutter_onboarding/lib/features/onboarding/data/onboarding_data.dart`
- `flutter_onboarding/lib/features/auth/presentation/screens/login_screen.dart`
- `flutter_onboarding/lib/features/auth/presentation/widgets/otp_modal.dart`
- `flutter_onboarding/lib/features/auth/presentation/providers/auth_provider.dart`
- `flutter_onboarding/lib/features/auth/presentation/providers/otp_provider.dart`

## Deliberate platform differences (acceptable — do NOT sync away)
- **Dark mode toggle**: React has it; Flutter uses system theme. Mobile OS controls theme.
- **Terms of Service checkbox**: React has it on login; Flutter doesn't. Mobile ToS is accepted at app store install.
- **OTP session banner**: React shows "OTP session active" banner when returning to login with a live OTP. Flutter doesn't — not needed since Flutter state doesn't survive restarts.
- **Drag-to-dismiss OTP modal**: React uses swipe-to-dismiss. Flutter uses a "Back" button. Platform-native behavior.
- **Haptic feedback**: Flutter has `HapticFeedback` calls. React doesn't. Mobile-only API.
- **Countdown timer format**: React shows "1 min" / "45s". Flutter shows "MM:SS". Minor cosmetic difference.
- **Onboarding skip behavior**: Skip jumps to last slide on both platforms (not directly to login) — already in sync.

## Known functional gaps (need resolution)
1. **Email validation**: React uses full regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; Flutter uses `v.contains('@')` only — Flutter is weaker. Flutter should match React.
2. **OTP auto-submit**: Flutter auto-verifies when 6th digit is entered; React requires button press. User to decide reference direction.

**Why:** These gaps were discovered during the sync audit when the cross-platform rule was established (June 2026).
