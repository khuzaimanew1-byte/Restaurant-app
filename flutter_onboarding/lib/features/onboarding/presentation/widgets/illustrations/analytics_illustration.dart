import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'illustration_shared.dart';

class AnalyticsIllustration extends StatefulWidget {
  final bool isDark;
  const AnalyticsIllustration({super.key, required this.isDark});

  @override
  State<AnalyticsIllustration> createState() =>
      _AnalyticsIllustrationState();
}

class _AnalyticsIllustrationState extends State<AnalyticsIllustration>
    with TickerProviderStateMixin {
  late final AnimationController _bars;
  late final List<AnimationController> _floats;

  static const _barData = [0.65, 0.82, 0.58, 0.91, 0.74, 0.88, 0.96];

  @override
  void initState() {
    super.initState();
    _bars = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward();

    _floats = buildFloatControllers(
      vsync: this,
      count: 3,
      baseMs: 3000,
      stepMs: 600,
      startOffsetStep: 0.25,
    );
  }

  @override
  void dispose() {
    _bars.dispose();
    for (final c in _floats) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dim = illustrationDim(context);
    const indigo = Color(0xFF6366F1);
    const amber = Color(0xFFF59E0B);
    const emerald = Color(0xFF10B981);

    return Center(
      child: SizedBox(
        width: dim,
        height: dim,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Glow
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  amber.withValues(alpha: 0.07),
                  Colors.transparent,
                ], stops: const [0.4, 1]),
              ),
            ),

            // Main chart card
            Container(
              width: dim * 0.68,
              height: dim * 0.56,
              padding: const EdgeInsets.fromLTRB(14, 13, 14, 9),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                color: widget.isDark
                    ? Colors.white.withValues(alpha: 0.07)
                    : Colors.white.withValues(alpha: 0.8),
                border: Border.all(
                  color: widget.isDark
                      ? Colors.white.withValues(alpha: 0.09)
                      : Colors.black.withValues(alpha: 0.05),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(
                        alpha: widget.isDark ? 0.24 : 0.07),
                    blurRadius: 32,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Attendance Score',
                        style: TextStyle(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w500,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.46)
                              : Colors.black.withValues(alpha: 0.42),
                        ),
                      ),
                      Text(
                        '94%',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.9)
                              : Colors.black.withValues(alpha: 0.86),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 7),
                  // Progress bar track + fill
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: SizedBox(
                      height: 3,
                      child: Stack(children: [
                        Container(
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.08)
                              : Colors.black.withValues(alpha: 0.06),
                        ),
                        FractionallySizedBox(
                          widthFactor: 0.94,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  indigo.withValues(alpha: 0.88),
                                  indigo.withValues(alpha: 0.44),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ]),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Bar chart
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: _barData.asMap().entries.map((e) {
                        final i = e.key;
                        final h = e.value;
                        final isActive = i == _barData.length - 1;
                        return Expanded(
                          child: Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 1.5),
                            child: AnimatedBuilder(
                              animation: _bars,
                              builder: (_, __) {
                                final animH = h *
                                    Curves.easeOutCubic.transform(
                                      (_bars.value - i * 0.08).clamp(0.0, 1.0),
                                    );
                                return FractionallySizedBox(
                                  alignment: Alignment.bottomCenter,
                                  heightFactor: animH,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: isActive
                                          ? indigo.withValues(alpha: 0.72)
                                          : widget.isDark
                                              ? Colors.white
                                                  .withValues(alpha: 0.12)
                                              : Colors.black
                                                  .withValues(alpha: 0.1),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) =>
                      Expanded(
                        child: Text(
                          d,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 6,
                            color: widget.isDark
                                ? Colors.white.withValues(alpha: 0.22)
                                : Colors.black.withValues(alpha: 0.22),
                          ),
                        ),
                      ),
                    ).toList(),
                  ),
                ],
              ),
            ),

            // A+ badge (float 0)
            AnimatedBuilder(
              animation: _floats[0],
              builder: (_, child) => Transform.translate(
                offset: Offset(0, -6 * _floats[0].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(1.25, -0.95),
                child: Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: indigo.withValues(alpha: 0.17),
                    border: Border.all(color: indigo.withValues(alpha: 0.24)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.13),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'A+',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB4B8FF),
                        ),
                      ),
                      Text(
                        'Rating',
                        style: TextStyle(
                          fontSize: 7,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.38)
                              : Colors.black.withValues(alpha: 0.34),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Hours chip (float 1)
            AnimatedBuilder(
              animation: _floats[1],
              builder: (_, child) => Transform.translate(
                offset: Offset(0, -5 * _floats[1].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(1.28, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 11, vertical: 7),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: amber.withValues(alpha: 0.11),
                    border: Border.all(color: amber.withValues(alpha: 0.18)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.10),
                        blurRadius: 14,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '42h',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFFDE68A),
                        ),
                      ),
                      Text(
                        'This week',
                        style: TextStyle(
                          fontSize: 7,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.36)
                              : Colors.black.withValues(alpha: 0.34),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Punctuality chip (float 2)
            AnimatedBuilder(
              animation: _floats[2],
              builder: (_, child) => Transform.translate(
                offset: Offset(0, -5 * _floats[2].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(-1.28, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: emerald.withValues(alpha: 0.11),
                    border: Border.all(
                        color: emerald.withValues(alpha: 0.18)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.10),
                        blurRadius: 14,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF6EE7B7),
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        '100% Punctual',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6EE7B7),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
