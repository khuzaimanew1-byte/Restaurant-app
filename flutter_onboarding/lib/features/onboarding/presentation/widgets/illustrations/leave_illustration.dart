import 'package:flutter/material.dart';
import 'illustration_shared.dart';
import '../../../../../core/constants/app_colors.dart';

class LeaveIllustration extends StatefulWidget {
  const LeaveIllustration({super.key});

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
    _floats = buildFloatControllers(
      vsync: this,
      count: 2,
      baseMs: 3200,
      stepMs: 550,
      startOffsetStep: 0.30,
    );
  }

  @override
  void dispose() {
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
            // Glow
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [
                  AppColors.accent.withValues(alpha: 0.10),
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
                color: AppColors.darkSurface.withValues(alpha: 0.75),
                border: Border.all(
                    color: AppColors.accentBd.withValues(alpha: 0.40)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.24),
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
                          color: AppColors.darkSecondary
                              .withValues(alpha: 0.65),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: AppColors.accent.withValues(alpha: 0.22),
                        ),
                        child: const Text(
                          'Approved',
                          style: TextStyle(
                            fontSize: 7,
                            fontWeight: FontWeight.w700,
                            color: AppColors.illustBadge,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  // Day labels
                  Row(
                    children: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                        .map((d) => Expanded(
                              child: Text(
                                d,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 6.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.darkSecondary
                                      .withValues(alpha: 0.35),
                                ),
                              ),
                            ))
                        .toList(),
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
                        final day     = i + 1;
                        final isLeave = _leaveDays.contains(day);
                        final isToday = day == 6;
                        return Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: isLeave
                                ? AppColors.accent.withValues(alpha: 0.26)
                                : isToday
                                    ? AppColors.accent.withValues(alpha: 0.40)
                                    : Colors.transparent,
                          ),
                          child: Center(
                            child: Text(
                              '$day',
                              style: TextStyle(
                                fontSize: 6.5,
                                fontWeight: (isLeave || isToday)
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                                color: (isLeave || isToday)
                                    ? AppColors.illustBadge
                                    : AppColors.darkSecondary
                                        .withValues(alpha: 0.45),
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

            // Approval chip (float 0)
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
                    color: AppColors.darkSurface.withValues(alpha: 0.80),
                    border: Border.all(color: AppColors.accentBd),
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
                          color: AppColors.accentLt,
                        ),
                        child: const Icon(Icons.check_rounded,
                            size: 9, color: AppColors.accent),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Leave Approved',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color:
                              AppColors.darkPrimary.withValues(alpha: 0.80),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Pending review pill (float 1)
            AnimatedBuilder(
              animation: _floats[1],
              builder: (_, child) => Transform.translate(
                offset: Offset(0, -6 * _floats[1].value),
                child: child,
              ),
              child: Align(
                alignment: const Alignment(-1.3, 1.1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: AppColors.darkSurface.withValues(alpha: 0.75),
                    border: Border.all(
                        color: AppColors.accentBd.withValues(alpha: 0.50)),
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
                            colors: [AppColors.accent, AppColors.accentEnd],
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
                              color: AppColors.darkPrimary
                                  .withValues(alpha: 0.75),
                            ),
                          ),
                          Text(
                            'pending review',
                            style: TextStyle(
                              fontSize: 7,
                              color: AppColors.darkSecondary
                                  .withValues(alpha: 0.45),
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
