import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../data/auth_storage.dart';

/// Mirrors React's SuccessScreen — shown after successful admin verification.
class SuccessPage extends StatelessWidget {
  const SuccessPage({super.key});

  Future<void> _logout(BuildContext context) async {
    await AuthStorage.clearToken();
    if (context.mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle.light,
        child: Stack(
          children: [
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment(0, -1.0),
                    radius: 1.8,
                    colors: [AppColors.accentBg, Colors.transparent],
                  ),
                ),
              ),
            ),
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 72, height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.accent, width: 1.8),
                      ),
                      child: const Icon(
                        Icons.check_rounded,
                        color: AppColors.accent,
                        size: 36,
                      ),
                    )
                    .animate()
                    .scale(
                      begin: const Offset(0.5, 0.5),
                      end: const Offset(1, 1),
                      duration: 600.ms,
                      delay: 100.ms,
                      curve: Curves.elasticOut,
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Admin Successfully Verified',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.headlineSm,
                    )
                    .animate()
                    .fadeIn(delay: 300.ms, duration: 500.ms)
                    .slideY(
                      begin: 0.15, end: 0,
                      delay: 300.ms, duration: 500.ms,
                      curve: Curves.easeOutCubic,
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => _logout(context),
                      child: Text(
                        'Log out',
                        style: AppTextStyles.bodyXsTer.copyWith(
                          color: AppColors.textTer.withValues(alpha: 0.80),
                        ),
                      ),
                    )
                    .animate()
                    .fadeIn(delay: 500.ms, duration: 400.ms),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
