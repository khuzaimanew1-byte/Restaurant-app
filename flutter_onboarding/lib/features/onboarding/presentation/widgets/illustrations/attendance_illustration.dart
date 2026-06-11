import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'illustration_shared.dart';
import '../../../../../core/constants/app_colors.dart';

class AttendanceIllustration extends StatefulWidget {
  final bool isDark;
  const AttendanceIllustration({super.key, required this.isDark});

  @override
  State<AttendanceIllustration> createState() =>
      _AttendanceIllustrationState();
}

class _AttendanceIllustrationState extends State<AttendanceIllustration>
    with TickerProviderStateMixin {
  late final AnimationController _pulse;
  late final List<AnimationController> _floats;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _floats = buildFloatControllers(
      vsync: this,
      count: 3,
      baseMs: 3000,
      stepMs: 500,
      startOffsetStep: 0.28,
    );
  }

  @override
  void dispose() {
    _pulse.dispose();
    for (final c in _floats) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dim = illustrationDim(context);

    return Center(
      child: SizedBox(
        width: dim,
        height: dim,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Radial glow — copper-tinted
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.accent.withValues(alpha: 0.16),
                  AppColors.accent.withValues(alpha: 0.05),
                  Colors.transparent,
                ], stops: const [0, 0.5, 1]),
              ),
            ),

            // Pulsing rings
            for (int i = 0; i < 3; i++)
              AnimatedBuilder(
                animation: _pulse,
                builder: (_, __) => Opacity(
                  opacity: (0.22 - i * 0.055) *
                      (0.55 +
                          0.45 *
                              math.sin(
                                  (_pulse.value + i * 0.28) * math.pi)),
                  child: SizedBox.square(
                    dimension: dim * (0.31 + i * 0.21),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.accentBd,
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

            // Center glass card
            IllusGlassCard(
              isDark: widget.isDark,
              width: dim * 0.39,
              height: dim * 0.52,
              radius: 22,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.accentLt,
                    ),
                    child: const Icon(
                      Icons.person_outline_rounded,
                      size: 19,
                      color: AppColors.illustBadge,
                    ),
                  ),
                  const SizedBox(height: 9),
                  _ShimmerLines(isDark: widget.isDark),
                  const SizedBox(height: 9),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: AppColors.accent.withValues(alpha: 0.28),
                    ),
                    child: const Text(
                      'CHECK IN',
                      style: TextStyle(
                        fontSize: 7,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.7,
                        color: AppColors.illustBadge,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Float chips
            _FloatChip(
              controller: _floats[0],
              isDark: widget.isDark,
              value: '98%',
              label: 'On-Time',
              alignment: const Alignment(-1.55, -1.05),
            ),
            _FloatChip(
              controller: _floats[1],
              isDark: widget.isDark,
              value: '12',
              label: 'Checked in',
              alignment: const Alignment(1.45, -0.55),
            ),
            _FloatChip(
              controller: _floats[2],
              isDark: widget.isDark,
              value: '✓',
              label: 'Synced',
              alignment: const Alignment(-1.35, 1.15),
            ),
          ],
        ),
      ),
    );
  }
}

class _FloatChip extends StatelessWidget {
  final AnimationController controller;
  final bool isDark;
  final String value;
  final String label;
  final Alignment alignment;

  const _FloatChip({
    required this.controller,
    required this.isDark,
    required this.value,
    required this.label,
    required this.alignment,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: AnimatedBuilder(
        animation: controller,
        builder: (_, child) => Transform.translate(
          offset: Offset(0, -7 * controller.value),
          child: child,
        ),
        child: IllusGlassCard(
          isDark: isDark,
          width: 62,
          height: 52,
          radius: 16,
          borderColor: AppColors.accentBd,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.illustBadge,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 7,
                  fontWeight: FontWeight.w500,
                  color: isDark
                      ? AppColors.darkSecondary.withValues(alpha: 0.55)
                      : AppColors.lightSecondary.withValues(alpha: 0.55),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShimmerLines extends StatelessWidget {
  final bool isDark;
  const _ShimmerLines({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final w in [1.0, 0.7, 0.85]) ...[
          FractionallySizedBox(
            widthFactor: w * 0.75,
            child: Container(
              height: 4,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2),
                color: isDark
                    ? Colors.white.withValues(alpha: 0.15)
                    : Colors.black.withValues(alpha: 0.09),
              ),
            ),
          ),
          const SizedBox(height: 4),
        ],
      ],
    );
  }
}
