import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const background    = Color(0xFF0A0806);
  static const surface       = Color(0xFF13100C);
  static const card          = Color(0xFF1C1710);
  static const cardBorder    = Color(0xFF2A2218);

  static const accent        = Color(0xFFF59E0B);
  static const accentDeep    = Color(0xFFD97706);
  static const accentGlow    = Color(0x22F59E0B);
  static const accentDim     = Color(0xFF78490A);

  static const textPrimary   = Color(0xFFF0E6CC);
  static const textSecondary = Color(0xFF8A7A62);
  static const textMuted     = Color(0xFF4A3F2E);
  static const textDisabled  = Color(0xFF3A3020);

  static const divider       = Color(0xFF231D13);
  static const inputUnderline = Color(0xFF2E2618);
  static const inputFocused  = Color(0xFFF59E0B);

  static const error         = Color(0xFFEF4444);
  static const errorDim      = Color(0x22EF4444);
  static const success       = Color(0xFF10B981);

  static const overlay       = Color(0xCC000000);

  static LinearGradient get accentGradient => const LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient get logoGradient => const LinearGradient(
    colors: [Color(0xFFFBBF24), Color(0xFFD97706)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
