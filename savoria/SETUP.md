# Savoria — Setup Guide

## Quick start

```bash
# 1. Bootstrap the Flutter project (creates android/ ios/ etc.)
cd savoria
flutter create . --project-name=savoria --org=com.savoria

# 2. Install dependencies
flutter pub get

# 3. Run on your device/emulator
flutter run
```

## File structure

```
savoria/
├── pubspec.yaml
└── lib/
    ├── main.dart                  ← Entry point, theme, custom page transition
    ├── theme/
    │   └── app_colors.dart        ← All color constants (amber palette)
    ├── widgets/
    │   ├── press_button.dart      ← Reusable animated press-scale button
    │   └── otp_modal.dart         ← OTP overlay widget (5-box, auto-advance)
    └── screens/
        ├── login_screen.dart      ← Login: underline fields, validation, sign in
        └── signup_screen.dart     ← Signup: full form + OTP modal integration
```

## OTP demo

The OTP modal simulates verification. Code `12345` succeeds. Any other code shows an error and resets the inputs.

## Key behaviors

| Behavior | Implementation |
|---|---|
| OTP modal created only on first submit | `_otpModalCreated` flag + `Offstage` |
| OTP modal hidden (not destroyed) on close | `Offstage(offstage: !_otpModalVisible)` |
| Sign-in button disabled until form valid | `_isFormValid` rechecked on every `onChanged` |
| Inline errors shown on blur, cleared on input | `FocusNode.addListener` + `onChanged` |
| Underline inputs — light, airy feel | `UnderlineInputBorder` via `InputDecoration` |
| Password strength bar | Live analysis: length + upper + number + special |
| Press animation on all buttons | `PressButton` widget with `AnimationController` |
| Page slide-fade transition | Custom `PageTransitionsBuilder` in `main.dart` |
