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
  late final AnimationController _pulseController;
  late final AnimationController _floatController;
  late final List<AnimationController> _cardControllers;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2400),
      vsync: this,
    )..repeat(reverse: true);

    _floatController = AnimationController(
      duration: const Duration(milliseconds: 3000),
      vsync: this,
    )..repeat(reverse: true);

    _cardControllers = List.generate(
      3,
      (i) => AnimationController(
        duration: Duration(milliseconds: 3200 + i * 400),
        vsync: this,
      )..repeat(reverse: true),
    );

    for (var i = 0; i < _cardControllers.length; i++) {
      Future.delayed(Duration(milliseconds: i * 200), () {
        if (mounted) _cardControllers[i].forward();
      });
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _floatController.dispose();
    for (final c in _cardControllers) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final indigo = widget.isDark
        ? const Color(0xFF6366F1)
        : const Color(0xFF4F46E5);

    return Center(
      child: SizedBox(
        width: 280,
        height: 280,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Radial glow
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    indigo.withValues(alpha: 0.12),
                    indigo.withValues(alpha: 0.04),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.5, 1.0],
                ),
              ),
            ),

            // Pulsing rings
            ...List.generate(3, (i) {
              return AnimatedBuilder(
                animation: _pulseController,
                builder: (context, _) {
                  final t = (_pulseController.value + i * 0.25) % 1.0;
                  final size = 88.0 + i * 56.0;
                  return Opacity(
                    opacity: (0.18 - i * 0.04) *
                        (0.6 + 0.4 * math.sin(t * math.pi)),
                    child: Container(
                      width: size,
                      height: size,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: indigo.withValues(alpha: 0.6),
                          width: 1,
                        ),
                      ),
                    ),
                  );
                },
              );
            }),

            // Center glassmorphism card
            _GlassCard(
              width: 110,
              height: 152,
              isDark: widget.isDark,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: indigo.withValues(alpha: 0.2),
                    ),
                    child: Icon(
                      Icons.person_outline_rounded,
                      size: 20,
                      color: indigo.withValues(alpha: 0.9),
                    ),
                  ),
                  const SizedBox(height: 10),
                  _shimmerLines(widget.isDark),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: indigo.withValues(alpha: 0.28),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'CHECK IN',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.6,
                        color: indigo.withValues(alpha: 0.9),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Floating stat cards
            _FloatingStatCard(
              controller: _cardControllers[0],
              alignment: const Alignment(-1.4, -1.1),
              value: '98%',
              label: 'On-Time',
              accentColor: indigo,
              isDark: widget.isDark,
            ),
            _FloatingStatCard(
              controller: _cardControllers[1],
              alignment: const Alignment(1.3, -0.6),
              value: '12',
              label: 'Checked in',
              accentColor: const Color(0xFF10B981),
              isDark: widget.isDark,
            ),
            _FloatingStatCard(
              controller: _cardControllers[2],
              alignment: const Alignment(-1.2, 1.1),
              value: '✓',
              label: 'Synced',
              accentColor: const Color(0xFFF59E0B),
              isDark: widget.isDark,
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmerLines(bool isDark) {
    return Column(
      children: [
        _line(isDark, 0.9),
        const SizedBox(height: 4),
        _line(isDark, 0.65),
        const SizedBox(height: 4),
        _line(isDark, 0.8),
      ],
    );
  }

  Widget _line(bool isDark, double width) {
    return FractionallySizedBox(
      widthFactor: width,
      child: Container(
        height: 4,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(2),
          color: isDark
              ? Colors.white.withValues(alpha: 0.14)
              : Colors.black.withValues(alpha: 0.1),
        ),
      ),
    );
  }
}

class _FloatingStatCard extends StatelessWidget {
  final AnimationController controller;
  final Alignment alignment;
  final String value;
  final String label;
  final Color accentColor;
  final bool isDark;

  const _FloatingStatCard({
    required this.controller,
    required this.alignment,
    required this.value,
    required this.label,
    required this.accentColor,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: AnimatedBuilder(
        animation: controller,
        builder: (context, child) => Transform.translate(
          offset: Offset(0, -6 * controller.value),
          child: child,
        ),
        child: _GlassCard(
          width: 64,
          height: 52,
          isDark: isDark,
          borderColor: accentColor.withValues(alpha: 0.2),
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
                      : Colors.black.withValues(alpha: 0.85),
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

class _GlassCard extends StatelessWidget {
  final double width;
  final double height;
  final bool isDark;
  final Widget child;
  final Color? borderColor;

  const _GlassCard({
    required this.width,
    required this.height,
    required this.isDark,
    required this.child,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: isDark
            ? Colors.white.withValues(alpha: 0.07)
            : Colors.white.withValues(alpha: 0.7),
        border: Border.all(
          color: borderColor ??
              (isDark
                  ? Colors.white.withValues(alpha: 0.1)
                  : Colors.black.withValues(alpha: 0.06)),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.25)
                : Colors.black.withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: child,
      ),
    );
  }
}
