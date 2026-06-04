import 'package:flutter/material.dart';

class AnalyticsIllustration extends StatefulWidget {
  final bool isDark;
  const AnalyticsIllustration({super.key, required this.isDark});

  @override
  State<AnalyticsIllustration> createState() => _AnalyticsIllustrationState();
}

class _AnalyticsIllustrationState extends State<AnalyticsIllustration>
    with TickerProviderStateMixin {
  late final AnimationController _barController;
  late final List<AnimationController> _floatControllers;

  static const _bars = [0.65, 0.82, 0.58, 0.91, 0.74, 0.88, 0.96];

  @override
  void initState() {
    super.initState();
    _barController = AnimationController(
      duration: const Duration(milliseconds: 900),
      vsync: this,
    )..forward();

    _floatControllers = List.generate(
      3,
      (i) => AnimationController(
        duration: Duration(milliseconds: 3000 + i * 600),
        vsync: this,
      )..repeat(reverse: true),
    );
    for (var i = 0; i < _floatControllers.length; i++) {
      Future.delayed(Duration(milliseconds: i * 180), () {
        if (mounted) _floatControllers[i].value = i * 0.25;
      });
    }
  }

  @override
  void dispose() {
    _barController.dispose();
    for (final c in _floatControllers) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final indigo = const Color(0xFF6366F1);
    final amber = const Color(0xFFF59E0B);
    final emerald = const Color(0xFF10B981);

    return Center(
      child: SizedBox(
        width: 280,
        height: 280,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Glow
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    amber.withValues(alpha: 0.07),
                    Colors.transparent,
                  ],
                  stops: const [0.4, 1.0],
                ),
              ),
            ),

            // Main analytics card
            Container(
              width: 188,
              height: 156,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: widget.isDark
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.white.withValues(alpha: 0.8),
                border: Border.all(
                  color: widget.isDark
                      ? Colors.white.withValues(alpha: 0.09)
                      : Colors.black.withValues(alpha: 0.05),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: widget.isDark ? 0.22 : 0.07),
                    blurRadius: 32,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Attendance Score',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w500,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.48)
                              : Colors.black.withValues(alpha: 0.42),
                        ),
                      ),
                      Text(
                        '94%',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.9)
                              : Colors.black.withValues(alpha: 0.85),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Progress bar
                  Container(
                    height: 3,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: widget.isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.06),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: 0.94,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(2),
                          gradient: LinearGradient(
                            colors: [
                              indigo.withValues(alpha: 0.85),
                              indigo.withValues(alpha: 0.45),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Bar chart
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: _bars.asMap().entries.map((entry) {
                        final i = entry.key;
                        final h = entry.value;
                        final isActive = i == _bars.length - 1;
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 1.5),
                            child: AnimatedBuilder(
                              animation: _barController,
                              builder: (context, _) {
                                final animH = h *
                                    Curves.easeOutCubic.transform(
                                      (_barController.value -
                                              i * 0.08)
                                          .clamp(0.0, 1.0),
                                    );
                                return FractionallySizedBox(
                                  alignment: Alignment.bottomCenter,
                                  heightFactor: animH,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: isActive
                                          ? indigo.withValues(alpha: 0.7)
                                          : widget.isDark
                                              ? Colors.white.withValues(alpha: 0.12)
                                              : Colors.black.withValues(alpha: 0.1),
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
                  const SizedBox(height: 4),
                  Row(
                    children: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                        .map((d) => Expanded(
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
                            ))
                        .toList(),
                  ),
                ],
              ),
            ),

            // Score badge — top right
            AnimatedBuilder(
              animation: _floatControllers[0],
              builder: (context, child) => Transform.translate(
                offset: Offset(0, -6 * _floatControllers[0].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(1.2, -1.0),
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: indigo.withValues(alpha: 0.16),
                    border: Border.all(
                      color: indigo.withValues(alpha: 0.22),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'A+',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFB4B8FF),
                        ),
                      ),
                      Text(
                        'Rating',
                        style: TextStyle(
                          fontSize: 7,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.38)
                              : Colors.black.withValues(alpha: 0.35),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Hours card — bottom right
            AnimatedBuilder(
              animation: _floatControllers[1],
              builder: (context, child) => Transform.translate(
                offset: Offset(0, -5 * _floatControllers[1].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(1.25, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: amber.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: amber.withValues(alpha: 0.16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 14,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '42h',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFDE68A),
                        ),
                      ),
                      Text(
                        'This week',
                        style: TextStyle(
                          fontSize: 7,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.38)
                              : Colors.black.withValues(alpha: 0.35),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Punctuality pill — bottom left
            AnimatedBuilder(
              animation: _floatControllers[2],
              builder: (context, child) => Transform.translate(
                offset: Offset(0, -5 * _floatControllers[2].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(-1.25, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: emerald.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: emerald.withValues(alpha: 0.16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
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
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: emerald,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '100% Punctual',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color: emerald.withValues(alpha: 0.9),
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
