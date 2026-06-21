import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// 6-digit OTP input row — mirrors React's OtpRow.
class OtpInputRow extends StatefulWidget {
  final List<String> digits;
  final ValueChanged<List<String>> onChange;
  final VoidCallback? onComplete;
  final bool hasError;

  const OtpInputRow({
    super.key,
    required this.digits,
    required this.onChange,
    this.onComplete,
    this.hasError = false,
  });

  @override
  State<OtpInputRow> createState() => _OtpInputRowState();
}

class _OtpInputRowState extends State<OtpInputRow> {
  late final List<TextEditingController> _ctrls;
  late final List<FocusNode> _nodes;

  @override
  void initState() {
    super.initState();
    _ctrls = List.generate(6, (i) => TextEditingController(text: widget.digits[i]));
    _nodes = List.generate(6, (_) => FocusNode());
  }

  @override
  void didUpdateWidget(OtpInputRow old) {
    super.didUpdateWidget(old);
    for (int i = 0; i < 6; i++) {
      if (_ctrls[i].text != widget.digits[i]) {
        _ctrls[i].text = widget.digits[i];
        _ctrls[i].selection = TextSelection.collapsed(offset: widget.digits[i].length);
      }
    }
  }

  @override
  void dispose() {
    for (final c in _ctrls) c.dispose();
    for (final f in _nodes) f.dispose();
    super.dispose();
  }

  void _onChanged(int i, String val) {
    final ch = val.replaceAll(RegExp(r'\D'), '');
    final d  = ch.isEmpty ? '' : ch[ch.length - 1];
    final next = List<String>.from(widget.digits)..[i] = d;
    widget.onChange(next);
    if (d.isNotEmpty) {
      if (i < 5) _nodes[i + 1].requestFocus();
      if (i == 5 && next.every((x) => x.isNotEmpty)) widget.onComplete?.call();
    }
  }

  void _onKey(int i, KeyEvent e) {
    if (e is KeyDownEvent && e.logicalKey == LogicalKeyboardKey.backspace) {
      if (widget.digits[i].isEmpty && i > 0) {
        final next = List<String>.from(widget.digits)..[i - 1] = '';
        widget.onChange(next);
        _nodes[i - 1].requestFocus();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(6, _buildBox),
    );
  }

  Widget _buildBox(int i) {
    final filled      = widget.digits[i].isNotEmpty;
    final borderColor = widget.hasError
        ? AppColors.inputStrokeErr
        : filled ? AppColors.accent : AppColors.inputStroke;

    return SizedBox(
      width: 44,
      height: 52,
      child: KeyboardListener(
        focusNode: FocusNode(skipTraversal: true),
        onKeyEvent: (e) => _onKey(i, e),
        child: TextField(
          controller: _ctrls[i],
          focusNode: _nodes[i],
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [
            LengthLimitingTextInputFormatter(1),
            FilteringTextInputFormatter.digitsOnly,
          ],
          onChanged: (v) => _onChanged(i, v),
          style: AppTextStyles.otpDigit.copyWith(
            color: widget.hasError ? AppColors.err : AppColors.text,
          ),
          cursorColor: AppColors.accent,
          decoration: InputDecoration(
            filled: true,
            fillColor: filled
                ? AppColors.accent.withValues(alpha: 0.10)
                : AppColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.accent, width: 2),
            ),
            contentPadding: EdgeInsets.zero,
          ),
        ),
      ),
    );
  }
}
