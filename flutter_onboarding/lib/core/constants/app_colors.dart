import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand
  static const indigo = Color(0xFF6366F1);
  static const indigoLight = Color(0xFFB4B8FF);
  static const emerald = Color(0xFF10B981);
  static const amber = Color(0xFFF59E0B);

  // Surfaces (dark)
  static const darkBg = Color(0xFF0C0C14);
  static const darkSurface = Color(0xFF14141F);
  static const darkCard = Color(0xFF1C1C2A);
  static const darkBorder = Color(0xFF2A2A3D);

  // Surfaces (light)
  static const lightBg = Color(0xFFF5F5F9);
  static const lightSurface = Color(0xFFFFFFFF);
  static const lightCard = Color(0xFFFAFAFD);
  static const lightBorder = Color(0xFFE8E8EF);

  // Text
  static const darkPrimary   = Color(0xFFF0F0F8);
  static const darkSecondary = Color(0xFF8888AA);
  static const lightPrimary  = Color(0xFF0D0D1A);
  static const lightSecondary = Color(0xFF6B6B88);
  static const darkBtnText   = Color(0xFF0A0A14);

  // Semantic
  static const error = Color(0xFFEF4444);
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);

  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: lightBg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: indigo,
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
          seedColor: indigo,
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
      fillColor: dark ? darkCard : lightSurface,
      border: border,
      enabledBorder: border,
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: indigo, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
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
        backgroundColor: dark ? darkPrimary : lightPrimary,
        foregroundColor: dark ? darkBg : lightSurface,
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
