import 'package:flutter/material.dart';
import 'illustration_shared.dart';
import '../../../../../core/constants/app_colors.dart';

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

    return Center(
      child: SizedBox(
        width: dim,
        height: dim,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Glow — copper
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.accent.withValues(alpha: 0.10),
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
                    ? AppColors.darkSurface.withValues(alpha: 0.80)
                    : Colors.white.withValues(alpha: 0.80),
                border: Border.all(
                  color: widget.isDark
                      ? AppColors.accentBd.withValues(alpha: 0.38)
                      : AppColors.accentBd.withValues(alpha: 0.22),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black
                        .withValues(alpha: widget.isDark ? 0.24 : 0.07),
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
                              ? AppColors.darkSecondary.withValues(alpha: 0.60)
                              : AppColors.lightSecondary.withValues(alpha: 0.55),
                        ),
                      ),
                      Text(
                        '94%',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: widget.isDark
                              ? AppColors.darkPrimary
                              : AppColors.lightPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 7),
                  // Progress bar
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
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [AppColors.accent, AppColors.accentEnd],
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
                                          ? AppColors.accent
                                              .withValues(alpha: 0.80)
                                          : widget.isDark
                                              ? Colors.white
                                                  .withValues(alpha: 0.13)
                                              : Colors.black
                                                  .withValues(alpha: 0.10),
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
                    children: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                        .map((d) => Expanded(
                              child: Text(
                                d,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 6,
                                  color: widget.isDark
                                      ? AppColors.darkSecondary
                                          .withValues(alpha: 0.35)
                                      : AppColors.lightSecondary
                                          .withValues(alpha: 0.35),
                                ),
                              ),
                            ))
                        .toList(),
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
                    color: AppColors.accent.withValues(alpha: 0.20),
                    border: Border.all(color: AppColors.accentBd),
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
                          color: AppColors.illustBadge,
                        ),
                      ),
                      Text(
                        'Rating',
                        style: TextStyle(
                          fontSize: 7,
                          color: widget.isDark
                              ? AppColors.darkSecondary.withValues(alpha: 0.45)
                              : AppColors.lightSecondary.withValues(alpha: 0.40),
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
                    color: AppColors.accent.withValues(alpha: 0.14),
                    border: Border.all(color: AppColors.accentBd),
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
                          color: AppColors.illustBadge,
                        ),
                      ),
                      Text(
                        'This week',
                        style: TextStyle(
                          fontSize: 7,
                          color: widget.isDark
                              ? AppColors.darkSecondary.withValues(alpha: 0.45)
                              : AppColors.lightSecondary.withValues(alpha: 0.42),
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
                    color: AppColors.accentEnd.withValues(alpha: 0.14),
                    border:
                        Border.all(color: AppColors.accentBd.withValues(alpha: 0.6)),
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
                          color: AppColors.accent,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        '100% Punctual',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color: AppColors.illustBadge,
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
