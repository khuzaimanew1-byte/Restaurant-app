import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../data/repositories/auth_repository.dart';

class ForgotPasswordModal extends StatefulWidget {
  final String email;
  final VoidCallback onPasswordReset;
  final VoidCallback onClose;

  const ForgotPasswordModal({
    super.key,
    required this.email,
    required this.onPasswordReset,
    required this.onClose,
  });

  @override
  State<ForgotPasswordModal> createState() => _ForgotPasswordModalState();
}

class _ForgotPasswordModalState extends State<ForgotPasswordModal>
    with TickerProviderStateMixin {
  final _repo = AuthRepository();

  // ── Slide animation between steps ────────────────────────────────
  late final AnimationController _slideCtrl;
  late final Animation<Offset> _step0Slide;
  late final Animation<Offset> _step1Slide;

  // ── OTP state ────────────────────────────────────────────────────
  final List<TextEditingController> _otpCtls =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFoci = List.generate(6, (_) => FocusNode());

  // ── Shake animation ───────────────────────────────────────────────
  late final AnimationController _shakeCtrl;
  late final Animation<double> _shakeAnim;

  // ── Timer ─────────────────────────────────────────────────────────
  int _countdownSeconds = 0;
  Timer? _timer;
  bool _expired = false;

  // ── States ────────────────────────────────────────────────────────
  bool _step1Active  = false; // true after OTP locally confirmed
  bool _sendingOtp   = false;
  bool _resending    = false;
  bool _resetting    = false;
  bool _success      = false;
  String _otpError   = '';
  String? _sendError;

  // ── Password step state ───────────────────────────────────────────
  final _newPwCtrl   = TextEditingController();
  final _confPwCtrl  = TextEditingController();
  bool _showNewPw    = false;
  bool _showConfPw   = false;
  String? _newPwErr;
  String? _confPwErr;
  String? _generalErr;
  String _savedOtp   = '';

  @override
  void initState() {
    super.initState();

    _slideCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 420),
    );
    _step0Slide = Tween<Offset>(
      begin: Offset.zero,
      end:   const Offset(-1, 0),
    ).animate(CurvedAnimation(parent: _slideCtrl, curve: Curves.easeInOutCubic));
    _step1Slide = Tween<Offset>(
      begin: const Offset(1, 0),
      end:   Offset.zero,
    ).animate(CurvedAnimation(parent: _slideCtrl, curve: Curves.easeInOutCubic));

    _shakeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );
    _shakeAnim = Tween<double>(begin: 0, end: 1).animate(_shakeCtrl);

    _sendOtp();
  }

  @override
  void dispose() {
    _slideCtrl.dispose();
    _shakeCtrl.dispose();
    _timer?.cancel();
    for (final c in _otpCtls) c.dispose();
    for (final f in _otpFoci) f.dispose();
    _newPwCtrl.dispose();
    _confPwCtrl.dispose();
    super.dispose();
  }

  // ── Send/resend OTP ───────────────────────────────────────────────

  Future<void> _sendOtp() async {
    setState(() { _sendingOtp = true; _sendError = null; });
    try {
      final expiresAt = await _repo.forgotPassword(widget.email);
      _initCountdown(expiresAt);
      setState(() { _sendingOtp = false; });
      Future.delayed(const Duration(milliseconds: 350), () {
        if (mounted) _otpFoci[0].requestFocus();
      });
    } catch (e) {
      if (mounted) setState(() { _sendingOtp = false; _sendError = e.toString(); });
    }
  }

  Future<void> _resendOtp() async {
    setState(() { _resending = true; _otpError = ''; });
    try {
      final expiresAt = await _repo.forgotPassword(widget.email);
      _initCountdown(expiresAt);
      for (final c in _otpCtls) c.clear();
      setState(() { _resending = false; });
      _otpFoci[0].requestFocus();
    } catch (e) {
      if (mounted) setState(() { _resending = false; _otpError = e.toString(); });
    }
  }

  void _initCountdown(int expiresAtMs) {
    _timer?.cancel();
    final secs =
        ((expiresAtMs - DateTime.now().millisecondsSinceEpoch) / 1000)
            .round()
            .clamp(0, 600);
    setState(() { _countdownSeconds = secs; _expired = secs <= 0; });
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) { t.cancel(); return; }
      setState(() {
        _countdownSeconds = (_countdownSeconds - 1).clamp(0, 600);
        _expired = _countdownSeconds <= 0;
        if (_expired) t.cancel();
      });
    });
  }

  // ── OTP input handling ────────────────────────────────────────────

  String get _otp => _otpCtls.map((c) => c.text).join();

  void _distributePaste(String raw, {int startIndex = 0}) {
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return;
    for (int j = 0; j < 6; j++) {
      final srcIdx = j - startIndex;
      if (srcIdx >= 0 && srcIdx < digits.length) {
        _otpCtls[j].text = digits[srcIdx];
      }
    }
    final filled = startIndex + digits.length;
    if (filled < 6) {
      _otpFoci[filled].requestFocus();
    } else {
      FocusScope.of(context).unfocus();
    }
    if (_otp.length == 6) _handleVerifyOtp();
  }

  void _onOtpChanged(int index, String value) {
    if (value.length > 1) { _distributePaste(value, startIndex: index); return; }
    setState(() { _otpError = ''; });
    if (value.length == 1 && index < 5) {
      _otpFoci[index + 1].requestFocus();
    }
    if (_otp.length == 6) _handleVerifyOtp();
  }

  void _triggerShake() {
    _shakeCtrl.reset();
    _shakeCtrl.forward();
    HapticFeedback.heavyImpact();
  }

  void _handleVerifyOtp() {
    final code = _otp;
    if (code.length < 6) {
      setState(() { _otpError = 'Please enter the full 6-digit code.'; });
      _triggerShake();
      return;
    }
    if (_expired) {
      setState(() { _otpError = 'OTP expired. Request a new code to continue.'; });
      _triggerShake();
      return;
    }
    // Save OTP and advance to step 1
    setState(() { _savedOtp = code; _step1Active = true; });
    _slideCtrl.forward();
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) FocusScope.of(context).requestFocus(FocusNode());
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted) FocusScope.of(context).unfocus();
      });
    });
  }

  // ── Password validation ───────────────────────────────────────────

  static final _hasNum     = RegExp(r'[0-9]');
  static final _hasSpecial = RegExp(r'[!@#$%^&*()\-_=+\[\]{};\':"\\|,.<>/?]');

  String? _validateNewPw(String pw) {
    if (pw.isEmpty)         return 'Password is required.';
    if (pw.length < 8)      return 'Password must be at least 8 characters.';
    if (!_hasNum.hasMatch(pw))     return 'Password must contain at least one number.';
    if (!_hasSpecial.hasMatch(pw)) return 'Password must contain at least one special character.';
    return null;
  }

  Future<void> _handleSetPassword() async {
    final newPw  = _newPwCtrl.text;
    final confPw = _confPwCtrl.text;

    final newPwErr  = _validateNewPw(newPw);
    final confPwErr = newPw != confPw ? 'Passwords do not match.' : null;

    if (newPwErr != null || confPwErr != null) {
      setState(() { _newPwErr = newPwErr; _confPwErr = confPwErr; });
      return;
    }

    setState(() { _resetting = true; _generalErr = null; });
    try {
      await _repo.resetPassword(
        email:           widget.email,
        otp:             _savedOtp,
        newPassword:     newPw,
        confirmPassword: confPw,
      );
      if (!mounted) return;
      setState(() { _resetting = false; _success = true; });
      Future.delayed(const Duration(milliseconds: 1400), () {
        if (mounted) { widget.onPasswordReset(); Navigator.of(context).pop(); }
      });
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString();
      if (msg.contains('OTP') || msg.contains('session') || msg.contains('code')) {
        setState(() {
          _resetting = false;
          _generalErr = '$msg Please go back and request a new code.';
        });
      } else {
        setState(() { _resetting = false; _generalErr = msg; });
      }
    }
  }

  // ── Timer label ───────────────────────────────────────────────────

  String get _timerLabel {
    final m = _countdownSeconds ~/ 60;
    final s = _countdownSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  // ── Build ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36, height: 4,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.15)
                      : Colors.black.withValues(alpha: 0.1),
                ),
              ),
            ),

            // Sliding panels (clipped)
            ClipRect(
              child: SizedBox(
                width: double.infinity,
                child: Stack(
                  children: [
                    // Step 0: OTP panel
                    SlideTransition(
                      position: _step0Slide,
                      child: _buildOtpPanel(isDark),
                    ),
                    // Step 1: Password panel — only mounts after OTP confirmed
                    if (_step1Active)
                      SlideTransition(
                        position: _step1Slide,
                        child: _buildPasswordPanel(isDark),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Step 0: OTP ───────────────────────────────────────────────────

  Widget _buildOtpPanel(bool isDark) {
    final hasError = _otpError.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 8, 28, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Reset Password',
            style: TextStyle(
              fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5,
              color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _sendingOtp
                ? 'Sending OTP to your email…'
                : _sendError != null
                    ? _sendError!
                    : 'We sent a 6-digit code to\n${widget.email}',
            style: TextStyle(
              fontSize: 14, height: 1.5,
              color: _sendError != null
                  ? AppColors.error
                  : (isDark ? AppColors.darkSecondary : AppColors.lightSecondary),
            ),
          ),
          const SizedBox(height: 28),

          // OTP boxes with shake
          AnimatedBuilder(
            animation: _shakeAnim,
            builder: (context, child) {
              final dx = ((_shakeAnim.value * 6 * 3.14159).sin() * 8)
                  .clamp(-8.0, 8.0);
              return Transform.translate(
                offset: Offset(dx, 0),
                child: child,
              );
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (i) => _OtpBox(
                controller: _otpCtls[i],
                focusNode:  _otpFoci[i],
                isDark:     isDark,
                hasError:   hasError,
                onChanged:  (v) => _onOtpChanged(i, v),
                onBackspace: () {
                  if (_otpCtls[i].text.isEmpty && i > 0) {
                    _otpCtls[i - 1].clear();
                    _otpFoci[i - 1].requestFocus();
                  }
                },
              )),
            ),
          ),

          if (hasError) ...[
            const SizedBox(height: 12),
            Text(
              _otpError,
              style: const TextStyle(fontSize: 13, color: AppColors.error, fontWeight: FontWeight.w500),
            ),
          ],

          const SizedBox(height: 24),

          AppButton(
            label: 'Verify OTP →',
            onPressed: (_otp.length == 6 && !_expired) ? _handleVerifyOtp : null,
          ),
          const SizedBox(height: 14),

          // Timer / Resend
          Center(
            child: _expired
                ? TextButton(
                    onPressed: _resending ? null : _resendOtp,
                    child: Text(
                      _resending ? 'Sending…' : 'Resend OTP',
                      style: const TextStyle(fontSize: 14, color: AppColors.indigo, fontWeight: FontWeight.w500),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.timer_outlined, size: 14,
                        color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary),
                      const SizedBox(width: 5),
                      Text(
                        'Resend in $_timerLabel',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                        ),
                      ),
                    ],
                  ),
          ),

          const SizedBox(height: 6),
          Center(
            child: TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 1: New Password ───────────────────────────────────────────

  Widget _buildPasswordPanel(bool isDark) {
    if (_success) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(28, 8, 28, 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.emerald.withValues(alpha: 0.12),
                border: Border.all(color: AppColors.emerald.withValues(alpha: 0.28)),
              ),
              child: const Center(
                child: Icon(Icons.check_rounded, size: 36, color: AppColors.emerald),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Password Updated!',
              style: TextStyle(
                fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5,
                color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your password has been set. You can now sign in.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14, height: 1.5,
                color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 8, 28, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Set New Password',
            style: TextStyle(
              fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5,
              color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose a strong password with a number and special character.',
            style: TextStyle(
              fontSize: 14, height: 1.5,
              color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
            ),
          ),
          const SizedBox(height: 24),

          if (_generalErr != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color:        AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border:       Border.all(color: AppColors.error.withValues(alpha: 0.25)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.error),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _generalErr!,
                      style: const TextStyle(fontSize: 13, color: AppColors.error, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // New password field
          TextFormField(
            controller:      _newPwCtrl,
            obscureText:     !_showNewPw,
            textInputAction: TextInputAction.next,
            style: TextStyle(
              fontSize: 15,
              color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
            ),
            onChanged: (_) => setState(() { _newPwErr = null; }),
            decoration: InputDecoration(
              labelText:  'New Password',
              hintText:   '••••••••',
              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
              errorText:  _newPwErr,
              suffixIcon: IconButton(
                icon: Icon(
                  _showNewPw ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  size: 18,
                  color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                ),
                onPressed: () => setState(() => _showNewPw = !_showNewPw),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Confirm password field
          TextFormField(
            controller:      _confPwCtrl,
            obscureText:     !_showConfPw,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _handleSetPassword(),
            style: TextStyle(
              fontSize: 15,
              color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
            ),
            onChanged: (_) => setState(() { _confPwErr = null; }),
            decoration: InputDecoration(
              labelText:  'Confirm Password',
              hintText:   '••••••••',
              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
              errorText:  _confPwErr,
              suffixIcon: IconButton(
                icon: Icon(
                  _showConfPw ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  size: 18,
                  color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                ),
                onPressed: () => setState(() => _showConfPw = !_showConfPw),
              ),
            ),
          ),
          const SizedBox(height: 28),

          AppButton(
            label:     'Set Password',
            onPressed: _resetting ? null : _handleSetPassword,
            isLoading: _resetting,
          ),
        ],
      ),
    );
  }
}

// ── OTP Box widget (identical to otp_modal.dart) ─────────────────────

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
            counterText: '',
            contentPadding: EdgeInsets.zero,
            filled:    true,
            fillColor: isDark ? AppColors.darkCard : AppColors.lightBg,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: hasError ? AppColors.error : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
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
