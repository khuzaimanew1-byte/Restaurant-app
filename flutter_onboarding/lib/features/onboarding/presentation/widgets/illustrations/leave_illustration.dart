import 'dart:math' as math;
import 'package:flutter/material.dart';

class LeaveIllustration extends StatefulWidget {
  final bool isDark;
  const LeaveIllustration({super.key, required this.isDark});

  @override
  State<LeaveIllustration> createState() => _LeaveIllustrationState();
}

class _LeaveIllustrationState extends State<LeaveIllustration>
    with TickerProviderStateMixin {
  late final List<AnimationController> _floats;

  static const _leaveDays = {10, 11, 12, 13, 14};

  @override
  void initState() {
    super.initState();
    _floats = List.generate(3, (i) {
      final c = AnimationController(
        vsync: this,
        duration: Duration(milliseconds: 3200 + i * 550),
      )..repeat(reverse: true);
      if (i > 0) c.value = i * 0.3;
      return c;
    });
  }

  @override
  void dispose() {
    for (final c in _floats) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final dim = math.min(size.width * 0.72, 280.0);
    const emerald = Color(0xFF10B981);
    const indigo = Color(0xFF6366F1);

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
                  emerald.withValues(alpha: 0.08),
                  Colors.transparent,
                ], stops: const [0.4, 1]),
              ),
            ),

            // Calendar card
            Container(
              width: dim * 0.58,
              height: dim * 0.58,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                color: widget.isDark
                    ? Colors.white.withValues(alpha: 0.07)
                    : Colors.white.withValues(alpha: 0.78),
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
              padding: const EdgeInsets.all(13),
              child: Column(
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'June 2025',
                        style: TextStyle(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w600,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.52)
                              : Colors.black.withValues(alpha: 0.46),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: emerald.withValues(alpha: 0.2),
                        ),
                        child: const Text(
                          'Approved',
                          style: TextStyle(
                            fontSize: 7,
                            fontWeight: FontWeight.w700,
                            color: emerald,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  // Day labels
                  Row(
                    children: ['M','T','W','T','F','S','S'].map((d) =>
                      Expanded(
                        child: Text(
                          d,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 6.5,
                            fontWeight: FontWeight.w600,
                            color: widget.isDark
                                ? Colors.white.withValues(alpha: 0.24)
                                : Colors.black.withValues(alpha: 0.24),
                          ),
                        ),
                      ),
                    ).toList(),
                  ),
                  const SizedBox(height: 3),
                  // Grid
                  Expanded(
                    child: GridView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 7,
                        mainAxisSpacing: 1.5,
                        crossAxisSpacing: 1,
                      ),
                      itemCount: 30,
                      itemBuilder: (_, i) {
                        final day = i + 1;
                        final isLeave = _leaveDays.contains(day);
                        const isToday = 6;
                        final isT = day == isToday;
                        return Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: isLeave
                                ? emerald.withValues(alpha: 0.24)
                                : isT
                                    ? indigo.withValues(alpha: 0.28)
                                    : Colors.transparent,
                          ),
                          child: Center(
                            child: Text(
                              '$day',
                              style: TextStyle(
                                fontSize: 6.5,
                                fontWeight: (isLeave || isT)
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                                color: isLeave
                                    ? Colors.greenAccent.shade200
                                        .withValues(alpha: 0.9)
                                    : isT
                                        ? const Color(0xFFB4B8FF)
                                        : widget.isDark
                                            ? Colors.white.withValues(alpha: 0.36)
                                            : Colors.black.withValues(alpha: 0.36),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Approval chip
            AnimatedBuilder(
              animation: _floats[0],
              builder: (_, child) => Transform.translate(
                offset: Offset(0, -6 * _floats[0].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(1.25, -0.9),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: widget.isDark
                        ? Colors.white.withValues(alpha: 0.07)
                        : Colors.white.withValues(alpha: 0.82),
                    border: Border.all(
                      color: widget.isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.13),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: emerald.withValues(alpha: 0.22),
                        ),
                        child: const Icon(
                          Icons.check_rounded,
                          size: 9,
                          color: emerald,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Leave Approved',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.78)
                              : Colors.black.withValues(alpha: 0.72),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Timeline pill
            AnimatedBuilder(
              animation: _floats[2],
              builder: (_, child) => Transform.translate(
                offset: Offset(0, -6 * _floats[2].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(-1.3, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: widget.isDark
                        ? Colors.white.withValues(alpha: 0.06)
                        : Colors.white.withValues(alpha: 0.78),
                    border: Border.all(
                      color: widget.isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.11),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 3,
                        height: 26,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(2),
                          gradient: const LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Color(0xFF6366F1),
                              Color(0xFF10B981),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '2 requests',
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.w600,
                              color: widget.isDark
                                  ? Colors.white.withValues(alpha: 0.7)
                                  : Colors.black.withValues(alpha: 0.65),
                            ),
                          ),
                          Text(
                            'pending review',
                            style: TextStyle(
                              fontSize: 7,
                              color: widget.isDark
                                  ? Colors.white.withValues(alpha: 0.3)
                                  : Colors.black.withValues(alpha: 0.3),
                            ),
                          ),
                        ],
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
