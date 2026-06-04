import 'package:flutter/material.dart';

class LeaveIllustration extends StatefulWidget {
  final bool isDark;
  const LeaveIllustration({super.key, required this.isDark});

  @override
  State<LeaveIllustration> createState() => _LeaveIllustrationState();
}

class _LeaveIllustrationState extends State<LeaveIllustration>
    with TickerProviderStateMixin {
  late final List<AnimationController> _floatControllers;

  @override
  void initState() {
    super.initState();
    _floatControllers = List.generate(
      3,
      (i) => AnimationController(
        duration: Duration(milliseconds: 3200 + i * 500),
        vsync: this,
      )..repeat(reverse: true),
    );
    for (var i = 0; i < _floatControllers.length; i++) {
      Future.delayed(Duration(milliseconds: i * 300), () {
        if (mounted) _floatControllers[i].value = i * 0.33;
      });
    }
  }

  @override
  void dispose() {
    for (final c in _floatControllers) c.dispose();
    super.dispose();
  }

  static const _leaveDays = {10, 11, 12, 13, 14};
  static const _todayDay = 6;

  @override
  Widget build(BuildContext context) {
    final emerald = const Color(0xFF10B981);
    final indigo = const Color(0xFF6366F1);

    return Center(
      child: SizedBox(
        width: 280,
        height: 280,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Subtle glow
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    emerald.withValues(alpha: 0.08),
                    Colors.transparent,
                  ],
                  stops: const [0.4, 1.0],
                ),
              ),
            ),

            // Calendar card (center)
            Container(
              width: 168,
              height: 168,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: widget.isDark
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.white.withValues(alpha: 0.75),
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
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'June 2025',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.55)
                              : Colors.black.withValues(alpha: 0.5),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: emerald.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Approved',
                          style: TextStyle(
                            fontSize: 7,
                            fontWeight: FontWeight.w600,
                            color: emerald,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Day headers
                  Row(
                    children: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                        .map((d) => Expanded(
                              child: Text(
                                d,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 6.5,
                                  fontWeight: FontWeight.w600,
                                  color: widget.isDark
                                      ? Colors.white.withValues(alpha: 0.25)
                                      : Colors.black.withValues(alpha: 0.25),
                                ),
                              ),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 4),

                  // Days grid
                  Expanded(
                    child: GridView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 7,
                        mainAxisSpacing: 2,
                        crossAxisSpacing: 1,
                      ),
                      itemCount: 30,
                      itemBuilder: (context, i) {
                        final day = i + 1;
                        final isLeave = _leaveDays.contains(day);
                        final isToday = day == _todayDay;
                        return Container(
                          decoration: BoxDecoration(
                            color: isLeave
                                ? emerald.withValues(alpha: 0.25)
                                : isToday
                                    ? indigo.withValues(alpha: 0.3)
                                    : Colors.transparent,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Center(
                            child: Text(
                              '$day',
                              style: TextStyle(
                                fontSize: 6.5,
                                fontWeight: isLeave || isToday
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                                color: isLeave
                                    ? emerald.withValues(alpha: 0.9)
                                    : isToday
                                        ? const Color(0xFFB4B8FF)
                                        : widget.isDark
                                            ? Colors.white.withValues(alpha: 0.38)
                                            : Colors.black.withValues(alpha: 0.38),
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

            // Approval chip — top right
            AnimatedBuilder(
              animation: _floatControllers[0],
              builder: (context, child) => Transform.translate(
                offset: Offset(0, -6 * _floatControllers[0].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(1.2, -0.95),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: widget.isDark
                        ? Colors.white.withValues(alpha: 0.07)
                        : Colors.white.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: widget.isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.14),
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
                          color: emerald.withValues(alpha: 0.2),
                        ),
                        child: Icon(Icons.check,
                            size: 8, color: emerald),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Leave Approved',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color: widget.isDark
                              ? Colors.white.withValues(alpha: 0.8)
                              : Colors.black.withValues(alpha: 0.75),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Timeline pill — bottom left
            AnimatedBuilder(
              animation: _floatControllers[2],
              builder: (context, child) => Transform.translate(
                offset: Offset(0, -6 * _floatControllers[2].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(-1.3, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: widget.isDark
                        ? Colors.white.withValues(alpha: 0.06)
                        : Colors.white.withValues(alpha: 0.75),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: widget.isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
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
                        height: 28,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(2),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              indigo.withValues(alpha: 0.7),
                              emerald.withValues(alpha: 0.5),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
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
                                  ? Colors.white.withValues(alpha: 0.32)
                                  : Colors.black.withValues(alpha: 0.32),
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
