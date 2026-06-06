import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle displayLarge(bool dark) => TextStyle(
        fontSize: 36,
        fontWeight: FontWeight.w800,
        letterSpacing: -1.2,
        height: 1.1,
        color: dark ? AppColors.darkPrimary : AppColors.lightPrimary,
      );

  static TextStyle displayMedium(bool dark) => TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.8,
        height: 1.15,
        color: dark ? AppColors.darkPrimary : AppColors.lightPrimary,
      );

  static TextStyle titleLarge(bool dark) => TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
        height: 1.2,
        color: dark ? AppColors.darkPrimary : AppColors.lightPrimary,
      );

  static TextStyle titleMedium(bool dark) => TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.3,
        height: 1.3,
        color: dark ? AppColors.darkPrimary : AppColors.lightPrimary,
      );

  static TextStyle bodyLarge(bool dark) => TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: -0.1,
        height: 1.55,
        color: dark ? AppColors.darkSecondary : AppColors.lightSecondary,
      );

  static TextStyle bodyMedium(bool dark) => TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.5,
        color: dark ? AppColors.darkSecondary : AppColors.lightSecondary,
      );

  static TextStyle labelSmall(bool dark) => TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.2,
        color: (dark ? AppColors.darkSecondary : AppColors.lightSecondary)
            .withValues(alpha: 0.7),
      );
}
