import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../providers/auth_provider.dart';
import '../providers/otp_provider.dart';

class OtpModal extends ConsumerStatefulWidget {
  final String email;
  final String password;
  final VoidCallback onVerified;
  final VoidCallback onBack;

  const OtpModal({
    super.key,
    required this.email,
    required this.password,
    required this.onVerified,
    required this.onBack,
  });

  @override
  ConsumerState<OtpModal> createState() => _OtpModalState();
}

class _OtpModalState extends ConsumerState<OtpModal> {
  final List<TextEditingController> _ctls =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _foci = List.generate(6, (_) => FocusNode());

  @override
  void dispose() {
    for (final c in _ctls) c.dispose();
    for (final f in _foci) f.dispose();
    super.dispose();
  }

  String get _otp => _ctls.map((c) => c.text).join();

  void _onChanged(int index, String value) {
    if (value.length == 1 && index < 5) {
      _foci[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _foci[index - 1].requestFocus();
    }
    if (_otp.length == 6) _verify();
  }

  Future<void> _verify() async {
    if (_otp.length < 6) return;
    FocusScope.of(context).unfocus();
    await ref
        .read(authProvider.notifier)
        .verifyOtp(widget.email, _otp, widget.password);
    if (!mounted) return;
    final authState = ref.read(authProvider);
    if (authState is AuthSuccess) {
      widget.onVerified();
    } else {
      for (final c in _ctls) c.clear();
      _foci[0].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final otpState  = ref.watch(otpProvider);
    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading;
    final hasError  = authState is AuthError;
    final errorMsg  = hasError ? (authState as AuthError).message : null;

    final mins       = otpState.countdownSeconds ~/ 60;
    final secs       = otpState.countdownSeconds % 60;
    final timerLabel =
        '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';

    return Container(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.12),
            blurRadius: 40,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 12, 28, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(2),
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.15)
                        : Colors.black.withValues(alpha: 0.1),
                  ),
                ),
              ),

              Text(
                'Verify your email',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                  color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Enter the 6-digit code sent to\n${widget.email}',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                ),
              ),
              const SizedBox(height: 32),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) => _OtpBox(
                  controller: _ctls[i],
                  focusNode:  _foci[i],
                  isDark:     isDark,
                  hasError:   hasError,
                  onChanged:  (v) => _onChanged(i, v),
                  onBackspace: () {
                    if (_ctls[i].text.isEmpty && i > 0) {
                      _ctls[i - 1].clear();
                      _foci[i - 1].requestFocus();
                    }
                  },
                )),
              ),

              if (errorMsg != null) ...[
                const SizedBox(height: 14),
                Text(
                  errorMsg,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.error,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],

              const SizedBox(height: 28),

              AppButton(
                label: 'Verify OTP',
                onPressed: isLoading ? null : _verify,
                isLoading: isLoading,
              ),
              const SizedBox(height: 14),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (otpState.countdownSeconds > 0) ...[
                    Icon(
                      Icons.timer_outlined,
                      size: 14,
                      color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'Resend in $timerLabel',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                      ),
                    ),
                  ] else
                    TextButton(
                      onPressed: otpState.isSending
                          ? null
                          : () => ref.read(otpProvider.notifier).sendOtp(widget.email),
                      child: Text(
                        otpState.isSending ? 'Sending…' : 'Resend OTP',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.indigo,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 6),
              Center(
                child: TextButton(
                  onPressed: isLoading ? null : widget.onBack,
                  child: Text(
                    'Back',
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isDark;
  final bool hasError;
  final ValueChanged<String> onChanged;
  final VoidCallback onBackspace;

  const _OtpBox({
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
      child: RawKeyboardListener(
        focusNode: FocusNode(),
        onKey: (event) {
          if (event is RawKeyDownEvent &&
              event.logicalKey == LogicalKeyboardKey.backspace) {
            onBackspace();
          }
        },
        child: TextFormField(
          controller: controller,
          focusNode:  focusNode,
          maxLength:  1,
          textAlign:  TextAlign.center,
          keyboardType:    TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onChanged: onChanged,
          style: TextStyle(
            fontSize:   22,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
          ),
          decoration: InputDecoration(
            counterText: '',
            contentPadding: EdgeInsets.zero,
            filled: true,
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
