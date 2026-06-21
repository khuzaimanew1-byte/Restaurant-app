import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Typography SSOT — dark-only, mirrors React login/onboarding font scale.
/// All colors from AppColors; never hardcoded.
class AppTextStyles {
  AppTextStyles._();

  // ── Headlines ────────────────────────────────────────────────────────
  static const headline = TextStyle(
    fontSize: 30,
    fontWeight: FontWeight.w800,
    letterSpacing: -1.2,
    height: 1.06,
    color: AppColors.text,
  );

  static const headlineLarge = TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.w800,
    letterSpacing: -1.4,
    height: 1.06,
    color: AppColors.text,
  );

  /// Login "Welcome back" — 34px, mirrors headlineLarge at tighter size.
  static const headlineLogin = TextStyle(
    fontSize: 34,
    fontWeight: FontWeight.w800,
    letterSpacing: -1.4,
    height: 1.06,
    color: AppColors.text,
  );

  /// Success page / mid-size heading — 24px.
  static const headlineSm = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.8,
    color: AppColors.text,
  );

  // ── Sub-headings & body ──────────────────────────────────────────────
  static const subhead = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.2,
    color: AppColors.textTer,
  );

  static const body = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.1,
    height: 1.55,
    color: AppColors.textSub,
  );

  static const bodySmall = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.5,
    color: AppColors.textSub,
  );

  /// 13px muted — countdown text, supporting copy.
  static const bodyXs = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textSub,
  );

  /// 13px tertiary — terms text, dimmed copy.
  static const bodyXsTer = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textTer,
  );

  // ── Labels & captions ────────────────────────────────────────────────
  static const label = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.2,
    color: AppColors.textTer,
  );

  static const caption = TextStyle(
    fontSize: 11.5,
    color: AppColors.textTer,
  );

  /// Error message — 11.5px in destructive red.
  static const error = TextStyle(
    fontSize: 11.5,
    color: AppColors.err,
  );

  // ── Interactive / links ──────────────────────────────────────────────
  /// 13px accent semi-bold — resend code, inline links.
  static const link = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppColors.accent,
  );

  /// 12px accent semi-bold — "Change" email chip link.
  static const linkSm = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.accent,
  );

  /// Forgot password — 13.5px accent at 80% opacity (runtime color, non-const).
  static TextStyle get forgotLink => TextStyle(
    fontSize: 13.5,
    color: AppColors.accent.withValues(alpha: 0.80),
  );

  // ── Inputs & chips ───────────────────────────────────────────────────
  /// TextField body text — 15px regular.
  static const inputText = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AppColors.text,
  );

  /// Email chip label — 13px medium weight.
  static const chipText = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.text,
  );

  // ── Buttons ──────────────────────────────────────────────────────────
  /// CTA button label — 16px bold, matches React .cta-btn text.
  static const ctaButton = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.3,
    color: AppColors.accentFg,
  );

  // ── Onboarding ───────────────────────────────────────────────────────
  /// Skip / cancel buttons — 15px, tertiary colour.
  static const skipLabel = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.2,
    color: AppColors.textTer,
  );

  // ── OTP ──────────────────────────────────────────────────────────────
  /// OTP digit box text — 22px bold, default text colour.
  static const otpDigit = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: AppColors.text,
  );
}
