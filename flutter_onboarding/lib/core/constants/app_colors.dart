import 'package:flutter/material.dart';

/// Single Source of Truth for all colors.
///
/// Theme: Restaurant-Premium
///   Primary Background : #181A1F  (Graphite Black)
///   Secondary Surface  : #2B3038  (Slate Gray)
///   Accent             : #C47A3A  (Copper Bronze)
///
/// Never use hardcoded Color() values outside this file.
class AppColors {
  AppColors._();

  // ── Accent / Brand ──────────────────────────────────────────
  static const accent    = Color(0xFFC47A3A); // Copper Bronze
  static const accentEnd = Color(0xFF9B5B26); // deep copper
  static const accentLt  = Color(0x2EC47A3A); // 18% copper
  static const accentBd  = Color(0x5CC47A3A); // 36% copper
  static const accentFg  = Colors.white;
  static const accentGlow = Color(0x84C47A3A); // 52% copper

  // ── Surfaces (dark) ─────────────────────────────────────────
  static const darkBg      = Color(0xFF181A1F); // Graphite Black
  static const darkSurface = Color(0xFF2B3038); // Slate Gray
  static const darkCard    = Color(0xFF343B45);
  static const darkBorder  = Color(0xFF3D4550);

  // ── Surfaces (light) ────────────────────────────────────────
  static const lightBg      = Color(0xFFF2EBE0); // warm parchment
  static const lightSurface = Color(0xFFE8DECE);
  static const lightCard    = Color(0xFFF7F2EA);
  static const lightBorder  = Color(0xFFD8CABB);

  // ── Text ────────────────────────────────────────────────────
  static const darkPrimary   = Color(0xFFFFF8F0); // warm white
  static const darkSecondary = Color(0xFFEBD7C0); // warm gray
  static const lightPrimary  = Color(0xFF1C1008);
  static const lightSecondary = Color(0xFF6B5040);

  // ── Illustration accents ────────────────────────────────────
  static const illustBadge = Color(0xFFE8A86A); // light copper/gold

  // ── Semantic (functional only — not brand) ──────────────────
  static const error   = Color(0xFFEF4444);
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);

  // ── ThemeData ───────────────────────────────────────────────
  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: lightBg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          brightness: Brightness.light,
          surface: lightSurface,
        ),
        fontFamily: _fontFamily,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          foregroundColor: lightPrimary,
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),
        inputDecorationTheme: _inputTheme(dark: false),
        elevatedButtonTheme: _buttonTheme(dark: false),
      );

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: darkBg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          brightness: Brightness.dark,
          surface: darkSurface,
        ),
        fontFamily: _fontFamily,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          foregroundColor: darkPrimary,
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
        inputDecorationTheme: _inputTheme(dark: true),
        elevatedButtonTheme: _buttonTheme(dark: true),
      );

  static InputDecorationTheme _inputTheme({required bool dark}) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: BorderSide(
        color: dark ? darkBorder : lightBorder,
        width: 1,
      ),
    );
    return InputDecorationTheme(
      filled: true,
      fillColor: dark ? darkCard : lightCard,
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
        color: (dark ? darkSecondary : lightSecondary).withValues(alpha: 0.7),
        fontSize: 15,
        fontWeight: FontWeight.w400,
      ),
    );
  }

  static ElevatedButtonThemeData _buttonTheme({required bool dark}) {
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

  static const _fontFamily = '.SF Pro Display';
}
