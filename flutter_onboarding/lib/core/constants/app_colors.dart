import 'package:flutter/material.dart';

/// Single Source of Truth for all colors.
///
/// Theme: Restaurant-Premium — Infinity Castle
///   Primary Background : #0D0907  (Charred Oak)
///   Secondary Surface  : #1C1409  (Dark Walnut)
///   Elevated Card      : #261C0E  (Rich Mahogany)
///   Accent             : #C4820A  (Amber Gold)
///
/// Never use hardcoded Color() values outside this file.
class AppColors {
  AppColors._();

  // ── Accent / Brand ──────────────────────────────────────────
  static const accent     = Color(0xFFC4820A); // Amber Gold
  static const accentEnd  = Color(0xFF8A5B08); // Deep Amber
  static const accentLt   = Color(0x29C4820A); // 16% amber
  static const accentBd   = Color(0x51C4820A); // 32% amber
  static const accentFg   = Color(0xFFFFF8F0); // warm white
  static const accentGlow = Color(0x66C4820A); // 40% amber

  // ── Surfaces ────────────────────────────────────────────────
  static const darkBg      = Color(0xFF0D0907); // Charred Oak
  static const darkSurface = Color(0xFF1C1409); // Dark Walnut
  static const darkCard    = Color(0xFF261C0E); // Rich Mahogany
  static const darkBorder  = Color(0xFF3A2B14); // warm dark border

  // ── Text ────────────────────────────────────────────────────
  static const darkPrimary   = Color(0xFFF5E6C8); // Warm Cream
  static const darkSecondary = Color(0xFFC4A878); // Warm Tan

  // ── Illustration ────────────────────────────────────────────
  static const illustBadge = Color(0xFFE8B060); // Bright Amber Gold

  // ── Semantic ────────────────────────────────────────────────
  static const error   = Color(0xFFEF4444);
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);

  // ── ThemeData ───────────────────────────────────────────────
  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: darkBg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          brightness: Brightness.dark,
          surface: darkSurface,
        ),
        fontFamily: '.SF Pro Display',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          foregroundColor: darkPrimary,
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
        inputDecorationTheme: _inputTheme(),
        elevatedButtonTheme: _buttonTheme(),
      );

  static InputDecorationTheme _inputTheme() {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: darkBorder, width: 1),
    );
    return InputDecorationTheme(
      filled: true,
      fillColor: darkCard,
      border: border,
      enabledBorder: border,
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: accent, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      hintStyle: TextStyle(
        color: darkSecondary.withValues(alpha: 0.55),
        fontSize: 15,
        fontWeight: FontWeight.w400,
      ),
    );
  }

  static ElevatedButtonThemeData _buttonTheme() {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: accent,
        foregroundColor: accentFg,
        minimumSize: const Size.fromHeight(56),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 0,
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.3,
        ),
      ),
    );
  }
}
