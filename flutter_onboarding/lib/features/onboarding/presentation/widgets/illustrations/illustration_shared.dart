import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../../core/constants/app_colors.dart';

/// Returns the canonical illustration square dimension for the current screen.
double illustrationDim(BuildContext context) =>
    math.min(MediaQuery.sizeOf(context).width * 0.72, 280.0);

/// Creates [count] looping float controllers with staggered initial offsets.
List<AnimationController> buildFloatControllers({
  required TickerProvider vsync,
  required int count,
  int baseMs = 3000,
  int stepMs = 500,
  double startOffsetStep = 0.25,
}) {
  return List.generate(count, (i) {
    final c = AnimationController(
      vsync: vsync,
      duration: Duration(milliseconds: baseMs + i * stepMs),
    )..repeat(reverse: true);
    if (i > 0) c.value = i * startOffsetStep;
    return c;
  });
}

/// Shared glassmorphism card — always dark.
class IllusGlassCard extends StatelessWidget {
  final double width;
  final double height;
  final double radius;
  final Widget child;
  final Color? borderColor;

  const IllusGlassCard({
    super.key,
    required this.width,
    required this.height,
    required this.radius,
    required this.child,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        color: AppColors.darkSurface.withValues(alpha: 0.75),
        border: Border.all(
          color: borderColor ?? AppColors.accentBd.withValues(alpha: 0.38),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.26),
            blurRadius: 28,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: child,
      ),
    );
  }
}
