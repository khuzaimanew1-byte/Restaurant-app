import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';

enum AppButtonVariant { primary, secondary, ghost, destructive }

class AppButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final IconData? icon;
  final double height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.height = 56,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pressCtrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      reverseDuration: const Duration(milliseconds: 180),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.965).animate(
      CurvedAnimation(parent: _pressCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pressCtrl.dispose();
    super.dispose();
  }

  void _onDown(TapDownDetails _) {
    HapticFeedback.lightImpact();
    _pressCtrl.forward();
  }

  void _onUp(TapUpDetails _) {
    _pressCtrl.reverse();
    widget.onPressed?.call();
  }

  void _onCancel() => _pressCtrl.reverse();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final enabled = widget.onPressed != null && !widget.isLoading;

    return AnimatedBuilder(
      animation: _scale,
      builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
      child: GestureDetector(
        onTapDown: enabled ? _onDown : null,
        onTapUp: enabled ? _onUp : null,
        onTapCancel: enabled ? _onCancel : null,
        child: AnimatedOpacity(
          opacity: enabled ? 1.0 : 0.5,
          duration: const Duration(milliseconds: 200),
          child: Container(
            height: widget.height,
            decoration: _decoration(isDark),
            child: _child(isDark),
          ),
        ),
      ),
    );
  }

  BoxDecoration _decoration(bool dark) {
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return BoxDecoration(
          color: dark
              ? Colors.white.withValues(alpha: 0.93)
              : Colors.black.withValues(alpha: 0.87),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: dark
                  ? Colors.white.withValues(alpha: 0.06)
                  : Colors.black.withValues(alpha: 0.1),
              blurRadius: 24,
              offset: const Offset(0, 2),
            ),
          ],
        );
      case AppButtonVariant.secondary:
        return BoxDecoration(
          color: dark ? AppColors.darkCard : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: dark ? AppColors.darkBorder : AppColors.lightBorder,
          ),
        );
      case AppButtonVariant.ghost:
        return BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        );
      case AppButtonVariant.destructive:
        return BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
        );
    }
  }

  Widget _child(bool dark) {
    final textColor = switch (widget.variant) {
      AppButtonVariant.primary => dark ? AppColors.darkBg : AppColors.lightSurface,
      AppButtonVariant.secondary => dark ? AppColors.darkPrimary : AppColors.lightPrimary,
      AppButtonVariant.ghost => AppColors.indigo,
      AppButtonVariant.destructive => AppColors.error,
    };

    if (widget.isLoading) {
      return Center(
        child: SizedBox(
          width: 22,
          height: 22,
          child: CircularProgressIndicator(
            strokeWidth: 2.2,
            valueColor: AlwaysStoppedAnimation(textColor),
          ),
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.icon != null) ...[
          Icon(widget.icon, size: 18, color: textColor),
          const SizedBox(width: 8),
        ],
        Text(
          widget.label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.3,
            color: textColor,
          ),
        ),
      ],
    );
  }
}
