import 'package:flutter/material.dart';

class PageIndicator extends StatelessWidget {
  final int count;
  final int current;
  final bool isDark;
  final ValueChanged<int> onTap;

  const PageIndicator({
    super.key,
    required this.count,
    required this.current,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(count, (i) {
        final isActive = i == current;
        return GestureDetector(
          onTap: () => onTap(i),
          behavior: HitTestBehavior.opaque,
          child: Padding(
            padding: const EdgeInsets.only(right: 8),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 350),
              curve: Curves.easeInOutCubic,
              width: isActive ? 24.0 : 6.0,
              height: 6.0,
              decoration: BoxDecoration(
                color: isActive
                    ? (isDark
                        ? Colors.white.withValues(alpha: 0.85)
                        : Colors.black.withValues(alpha: 0.8))
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.18)
                        : Colors.black.withValues(alpha: 0.18)),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        );
      }),
    );
  }
}
