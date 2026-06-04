import 'dart:math' as math;
import 'package:flutter/material.dart';

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

    _floats = List.generate(3, (i) {
      final c = AnimationController(
        vsync: this,
        duration: Duration(milliseconds: 3000 + i * 500),
      )..repeat(reverse: true);
      if (i > 0) {
        c.value = i * 0.28;
      }
      return c;
    });
  }

  @override
  void dispose() {
    _pulse.dispose();
    for (final c in _floats) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final dim = math.min(size.width * 0.72, 280.0);
    const indigo = Color(0xFF6366F1);

    return Center(
      child: SizedBox(
        width: dim,
        height: dim,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Radial glow
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  indigo.withValues(alpha: 0.13),
                  indigo.withValues(alpha: 0.04),
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
                          color: indigo.withValues(alpha: 0.6),
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

            // Center glass card
            _GlassCard(
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
                      color: indigo.withValues(alpha: 0.22),
                    ),
                    child: const Icon(
                      Icons.person_outline_rounded,
                      size: 19,
                      color: Color(0xFFB4B7FF),
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
                      color: indigo.withValues(alpha: 0.3),
                    ),
                    child: const Text(
                      'CHECK IN',
                      style: TextStyle(
                        fontSize: 7,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.7,
                        color: Color(0xFFC8CAFF),
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
              color: const Color(0xFF6366F1),
            ),
            _FloatChip(
              controller: _floats[1],
              isDark: widget.isDark,
              value: '12',
              label: 'Checked in',
              alignment: const Alignment(1.45, -0.55),
              color: const Color(0xFF10B981),
            ),
            _FloatChip(
              controller: _floats[2],
              isDark: widget.isDark,
              value: '✓',
              label: 'Synced',
              alignment: const Alignment(-1.35, 1.15),
              color: const Color(0xFFF59E0B),
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
  final Color color;

  const _FloatChip({
    required this.controller,
    required this.isDark,
    required this.value,
    required this.label,
    required this.alignment,
    required this.color,
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
        child: _GlassCard(
          isDark: isDark,
          width: 62,
          height: 52,
          radius: 16,
          borderColor: color.withValues(alpha: 0.22),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.9)
                      : Colors.black.withValues(alpha: 0.82),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 7,
                  fontWeight: FontWeight.w500,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.4)
                      : Colors.black.withValues(alpha: 0.38),
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

class _GlassCard extends StatelessWidget {
  final bool isDark;
  final double width;
  final double height;
  final double radius;
  final Widget child;
  final Color? borderColor;

  const _GlassCard({
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
                  ? Colors.white.withValues(alpha: 0.1)
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
