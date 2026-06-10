import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../constants/app_colors.dart';

class AppOtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isDark;
  final bool hasError;
  final ValueChanged<String> onChanged;
  final VoidCallback onBackspace;

  const AppOtpBox({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.isDark,
    required this.hasError,
    required this.onChanged,
    required this.onBackspace,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 44,
      height: 56,
      child: KeyboardListener(
        focusNode: FocusNode(),
        onKeyEvent: (event) {
          if (event is KeyDownEvent &&
              event.logicalKey == LogicalKeyboardKey.backspace) {
            onBackspace();
          }
        },
        child: TextFormField(
          controller:   controller,
          focusNode:    focusNode,
          textAlign:    TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
          onChanged: onChanged,
          style: TextStyle(
            fontSize:   22,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
          ),
          decoration: InputDecoration(
            counterText:    '',
            contentPadding: EdgeInsets.zero,
            filled:    true,
            fillColor: isDark ? AppColors.darkCard : AppColors.lightBg,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: hasError
                    ? AppColors.error
                    : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: hasError
                    ? AppColors.error.withValues(alpha: 0.6)
                    : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.indigo,
                width: 1.5,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
