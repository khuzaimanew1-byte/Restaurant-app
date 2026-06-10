import 'dart:math';

import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

class OtpBanner extends StatelessWidget {
  final bool isDark;
  final String label;
  final int remainingMs;
  final String actionLabel;
  final VoidCallback onAction;
  final AnimationController? shakeCtrl;

  const OtpBanner({
    super.key,
    required this.isDark,
    required this.label,
    required this.remainingMs,
    required this.actionLabel,
    required this.onAction,
    this.shakeCtrl,
  });

  static String _fmt(int ms) {
    final s = (ms / 1000).ceil().clamp(0, 599);
    final m = s ~/ 60;
    return '$m:${(s % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final bg      = isDark ? const Color(0xFF100E44) : const Color(0xFFEDE9FF);
    final border  = isDark ? const Color(0x427F78F2) : const Color(0x2E4F46E5);
    final txtClr  = isDark ? const Color(0xE0C8C5F5) : const Color(0xFF3730A3);
    final actClr  = isDark ? const Color(0xFF9992F5) : const Color(0xFF4F46E5);

    final content = Container(
      height: 38,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: bg,
        border: Border(bottom: BorderSide(color: border)),
      ),
      child: Row(
        children: [
          Icon(Icons.lock_outline_rounded, size: 13, color: actClr),
          const SizedBox(width: 8),
          Expanded(
            child: Text.rich(
              TextSpan(
                text: '$label · ',
                style: TextStyle(
                  fontSize: 12.5, fontWeight: FontWeight.w600,
                  color: txtClr, letterSpacing: -0.01 * 12.5,
                ),
                children: [
                  TextSpan(
                    text: _fmt(remainingMs),
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              actionLabel,
              style: TextStyle(
                color: actClr, fontWeight: FontWeight.w700,
                fontSize: 12.5, letterSpacing: -0.01 * 12.5,
              ),
            ),
          ),
        ],
      ),
    );

    if (shakeCtrl == null) return content;

    return AnimatedBuilder(
      animation: shakeCtrl!,
      builder: (_, child) {
        final dx = sin(shakeCtrl!.value * pi * 5) * 7;
        return Transform.translate(offset: Offset(dx, 0), child: child);
      },
      child: content,
    );
  }
}
