import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../utils/pw_validator.dart';

class PwRequirementsRow extends StatelessWidget {
  final String password;
  const PwRequirementsRow({super.key, required this.password});

  Widget _chip(String label, bool met) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Text(
        met ? '✓' : '✗',
        style: TextStyle(fontSize: 13, height: 1,
          color: met ? AppColors.emerald : AppColors.error),
      ),
      const SizedBox(width: 4),
      Text(label,
        style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500,
          color: met ? AppColors.emerald : AppColors.error),
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    if (password.isEmpty) return const SizedBox.shrink();
    return Row(
      children: [
        _chip('8+ chars',  password.length >= 8),
        const SizedBox(width: 10),
        _chip('Uppercase', PwValidator.hasUpper.hasMatch(password)),
        const SizedBox(width: 10),
        _chip('Number',    PwValidator.hasNum.hasMatch(password)),
        const SizedBox(width: 10),
        _chip('Special',   PwValidator.hasSpecial.hasMatch(password)),
      ],
    );
  }
}
