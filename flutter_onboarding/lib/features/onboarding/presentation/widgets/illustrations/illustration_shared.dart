import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Returns the canonical illustration square dimension for the current screen.
double illustrationDim(BuildContext context) =>
    math.min(MediaQuery.sizeOf(context).width * 0.72, 280.0);

/// Creates [count] looping float controllers with staggered initial offsets.
///
/// [baseMs]          — duration of the first controller in milliseconds.
/// [stepMs]          — additional milliseconds per subsequent controller.
/// [startOffsetStep] — how far apart the initial `.value` offsets are,
///                     so chips don't all start at the same float position.
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

/// Shared glassmorphism card used by all three illustrations.
class IllusGlassCard extends StatelessWidget {
  final bool isDark;
  final double width;
  final double height;
  final double radius;
  final Widget child;
  final Color? borderColor;

  const IllusGlassCard({
    super.key,
    required this.isDark,
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
        color: isDark
            ? Colors.white.withValues(alpha: 0.07)
            : Colors.white.withValues(alpha: 0.72),
        border: Border.all(
          color: borderColor ??
              (isDark
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.055)),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.26)
                : Colors.black.withValues(alpha: 0.065),
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
