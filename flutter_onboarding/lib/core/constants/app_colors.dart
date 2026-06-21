import 'package:flutter/material.dart';

/// Single Source of Truth for all colors — dark-only, permanent.
///
/// Palette: Slate + Amber Premium (mirrors React index.css :root tokens)
///   --bg          #20242B   Charred Oak    — primary background
///   --bg-surface  #313842   Walnut Slate   — secondary surface
///   --bg-card     #3A424D   Elevated Card  — cards / elevated
///   --accent      #C4820A   Amber Gold     — primary accent
///   --text        F5E6C8@93 Warm Cream     — primary text
///
/// Mirror rule: every token here maps 1-to-1 with a CSS var in index.css.
/// Never use hardcoded Color() values outside this file.
class AppColors {
  AppColors._();

  // ── Surfaces (mirrors --bg, --bg-surface, --bg-card) ────────
  static const bg       = Color(0xFF20242B); // --bg
  static const surface  = Color(0xFF313842); // --bg-surface
  static const card     = Color(0xFF3A424D); // --bg-card

  // ── Accent / Brand (mirrors --accent … --accent-glow) ───────
  static const accent     = Color(0xFFC4820A); // --accent
  static const accentEnd  = Color(0xFF8A5B08); // --accent-end
  static const accentLt   = Color(0x29C4820A); // --accent-lt  16%
  static const accentBd   = Color(0x51C4820A); // --accent-bd  32%
  static const accentFg   = Color(0xFFFFF8F0); // --accent-fg
  static const accentGlow = Color(0x6BC4820A); // --accent-glow 42%
  static const accentBg   = Color(0x1CC4820A); // --accent-bg    11% (radial background glow)

  // ── Text (mirrors --text, --text-sub, --text-ter) ───────────
  static const text    = Color(0xEDF5E6C8); // --text    93%
  static const textSub = Color(0x80F5E6C8); // --text-sub 50%
  static const textTer = Color(0x47F5E6C8); // --text-ter 28%

  // ── Chip backgrounds (mirrors --chip-a/b/c) ─────────────────
  static const chipA = Color(0x2EC4820A); // --chip-a 18%
  static const chipB = Color(0x1EC4820A); // --chip-b 12%
  static const chipC = Color(0x12C4820A); // --chip-c  7%

  // ── Glass / card border (mirrors --glass-bd) ────────────────
  static const glassBd = Color(0x5CC4820A); // --glass-bd 36%
  static const glassHi = Color(0x12FFFFFF); // --glass-hi  7%

  // ── Illustration (mirrors --illus-badge, --illus-sub) ───────
  static const illustBadge = Color(0xFFE8B060); // --illus-badge
  static const illustSub   = Color(0x70F5E6C8); // --illus-sub  44%

  // ── Input — bottom-stroke (mirrors --inp-stroke*) ───────────
  static const inputStroke      = Color(0x38C4820A); // --inp-stroke      22%
  static const inputStrokeFocus = Color(0xFFC4820A); // --inp-stroke-focus
  static const inputStrokeErr   = Color(0xFFE05252); // --inp-stroke-err

  // ── Error / destructive (mirrors --err, --err-sub, --err-glow)
  static const err     = Color(0xFFE05252); // --err
  static const errSub  = Color(0x8CE05252); // --err-sub  55%
  static const errGlow = Color(0x3DE05252); // --err-glow 24%

  // ── Semantic ─────────────────────────────────────────────────
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);

  // ── ThemeData ────────────────────────────────────────────────
  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          brightness: Brightness.dark,
          surface: surface,
        ),
        fontFamily: '.SF Pro Display',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          foregroundColor: text,
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
        inputDecorationTheme: _inputTheme(),
        elevatedButtonTheme: _buttonTheme(),
      );

  // Bottom-stroke style — mirrors React --inp-stroke system
  static InputDecorationTheme _inputTheme() => InputDecorationTheme(
        filled: false,
        border: const UnderlineInputBorder(
          borderSide: BorderSide(color: inputStroke, width: 1.5),
        ),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: inputStroke, width: 1.5),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: inputStrokeFocus, width: 2),
        ),
        errorBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: inputStrokeErr, width: 2),
        ),
        focusedErrorBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: inputStrokeErr, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 12),
        hintStyle: const TextStyle(
          color: Color(0x66F5E6C8),
          fontSize: 15,
          fontWeight: FontWeight.w400,
        ),
        labelStyle: const TextStyle(color: inputStroke, fontSize: 14),
        floatingLabelStyle: const TextStyle(color: inputStrokeFocus, fontSize: 12),
      );

  static ElevatedButtonThemeData _buttonTheme() => ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: accentFg,
          minimumSize: const Size.fromHeight(56),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 0,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.3,
          ),
        ),
      );
}
