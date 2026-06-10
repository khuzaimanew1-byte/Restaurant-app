import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/email_utils.dart';
import '../../../../core/widgets/app_otp_box.dart';
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

  // ── Paste support ────────────────────────────────────────────────
  // Distribute digits starting at [startIndex] when the user pastes
  // a multi-digit string into any box.
  void _distributePaste(String raw, {int startIndex = 0}) {
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return;

    for (int j = 0; j < 6; j++) {
      final srcIdx = j - startIndex;
      if (srcIdx >= 0 && srcIdx < digits.length) {
        _ctls[j].text = digits[srcIdx];
      } else if (j >= startIndex + digits.length) {
        // leave boxes after the pasted range untouched
      }
    }

    final filled = startIndex + digits.length;
    if (filled < 6) {
      _foci[filled].requestFocus();
    } else {
      FocusScope.of(context).unfocus();
    }

    // Auto-submit if all 6 boxes now have a digit
    if (_otp.length == 6) _verify();
  }

  void _onChanged(int index, String value) {
    // Paste detected: more than one digit entered in a single box
    if (value.length > 1) {
      _distributePaste(value, startIndex: index);
      return;
    }

    // Single digit typed
    if (value.length == 1 && index < 5) {
      _foci[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _foci[index - 1].requestFocus();
    }

    // Auto-submit when 6th digit is entered
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
    final isDark    = Theme.of(context).brightness == Brightness.dark;
    final otpState  = ref.watch(otpProvider);
    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading;
    final hasError  = authState is AuthError;
    final errorMsg  = hasError ? (authState as AuthError).message : null;
    final expired   = otpState.countdownSeconds == 0;

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
                'Check your email',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                  color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                ),
              ),
              const SizedBox(height: 8),
              RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.5,
                    color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                  ),
                  children: [
                    const TextSpan(text: 'We sent a 6-digit code to '),
                    TextSpan(
                      text: EmailUtils.maskEmail(widget.email),
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // OTP boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) => AppOtpBox(
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

              const SizedBox(height: 20),

              // Error / Expired banner
              if (hasError || expired) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color:        AppColors.error.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border:       Border.all(color: AppColors.error.withValues(alpha: 0.20)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.info_outline_rounded, size: 13, color: AppColors.error),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          errorMsg ?? 'OTP expired. Request a new code to continue.',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.error,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              if (isLoading) ...[
                const Center(child: CircularProgressIndicator()),
                const SizedBox(height: 14),
              ] else
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

