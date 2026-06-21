import 'package:flutter/material.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// Bottom-stroke floating-label input — mirrors React's TextInput / PasswordInput.
///
/// Dark-only. Uses AppColors tokens; never hardcodes colors.
class BottomStrokeInput extends StatefulWidget {
  final String label;
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final bool isPassword;
  final TextInputAction textInputAction;
  final VoidCallback? onSubmitted;
  final FocusNode? focusNode;
  final Iterable<String>? autofillHints;
  final TextInputType? keyboardType;

  const BottomStrokeInput({
    super.key,
    required this.label,
    required this.controller,
    this.onChanged,
    this.errorText,
    this.isPassword = false,
    this.textInputAction = TextInputAction.next,
    this.onSubmitted,
    this.focusNode,
    this.autofillHints,
    this.keyboardType,
  });

  @override
  State<BottomStrokeInput> createState() => _BottomStrokeInputState();
}

class _BottomStrokeInputState extends State<BottomStrokeInput> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    final hasErr = widget.errorText?.isNotEmpty == true;
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: widget.controller,
            focusNode: widget.focusNode,
            obscureText: widget.isPassword && _obscure,
            keyboardType: widget.keyboardType,
            textInputAction: widget.textInputAction,
            autofillHints: widget.autofillHints,
            onChanged: widget.onChanged,
            onSubmitted: (_) => widget.onSubmitted?.call(),
            autocorrect: false,
            enableSuggestions: !widget.isPassword,
            style: AppTextStyles.inputText,
            cursorColor: AppColors.accent,
            decoration: InputDecoration(
              labelText: widget.label,
              labelStyle: TextStyle(
                color: AppColors.text.withValues(alpha: 0.38),
                fontSize: 15,
              ),
              floatingLabelStyle: TextStyle(
                color: hasErr
                    ? AppColors.inputStrokeErr
                    : AppColors.inputStrokeFocus,
                fontSize: 11.5,
              ),
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: hasErr ? AppColors.inputStrokeErr : AppColors.inputStroke,
                  width: 1.5,
                ),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: hasErr
                      ? AppColors.inputStrokeErr
                      : AppColors.inputStrokeFocus,
                  width: 2,
                ),
              ),
              errorBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: AppColors.inputStrokeErr, width: 2),
              ),
              focusedErrorBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: AppColors.inputStrokeErr, width: 2),
              ),
              isDense: true,
              contentPadding: const EdgeInsets.only(bottom: 8, top: 16),
              suffixIcon: widget.isPassword
                  ? GestureDetector(
                      onTap: () => setState(() => _obscure = !_obscure),
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Icon(
                          _obscure
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          size: 18,
                          color: AppColors.textTer,
                        ),
                      ),
                    )
                  : null,
            ),
          ),
          if (hasErr) ...[
            const SizedBox(height: 5),
            Text(
              widget.errorText!,
              style: AppTextStyles.error,
            ),
          ],
        ],
      ),
    );
  }
}
