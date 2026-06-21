import 'package:flutter/material.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';

final _rules = <({String key, String label, bool Function(String) test})>[
  (key: 'len',     label: '8+ chars',     test: (p) => p.length >= 8),
  (key: 'number',  label: 'Number',       test: (p) => RegExp(r'[0-9]').hasMatch(p)),
  (key: 'special', label: 'Special char', test: (p) => RegExp(r'[!@#\$%^&*()\-_=+\[\]{};:\'",.<>/?`~\\|]').hasMatch(p)),
];

/// Returns true when all password rules pass.
bool isPwValid(String pw) => _rules.every((r) => r.test(pw));

/// Visual password strength indicators — mirrors React's PasswordRules.
class PasswordRulesWidget extends StatelessWidget {
  final String password;
  const PasswordRulesWidget({super.key, required this.password});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 16),
      child: Wrap(
        spacing: 16,
        runSpacing: 8,
        children: _rules.map((r) {
          final met = r.test(password);
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 8, height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: met ? AppColors.accent : Colors.transparent,
                  border: Border.all(
                    color: met ? AppColors.accent : AppColors.textTer,
                    width: 1.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                r.label,
                style: AppTextStyles.label.copyWith(
                  fontWeight: FontWeight.w400,
                  color: met ? AppColors.accent : AppColors.textTer,
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
