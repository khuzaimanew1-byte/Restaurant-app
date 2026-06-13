import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Typography SSOT — dark-only, mirrors React login/onboarding font scale.
/// All colors from AppColors; never hardcoded.
class AppTextStyles {
  AppTextStyles._();

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
}
