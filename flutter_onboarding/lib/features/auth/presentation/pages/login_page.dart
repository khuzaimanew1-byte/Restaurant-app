import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../data/auth_service.dart';
import '../../data/auth_storage.dart';
import '../widgets/bottom_stroke_input.dart';
import '../widgets/otp_input_row.dart';
import '../widgets/password_rules_widget.dart';

// ── Internal screen state ─────────────────────────────────────────────
enum _Screen { signIn, otp, resetPassword }

String _maskEmail(String email) {
  final parts = email.split('@');
  if (parts.length < 2) return email;
  final local = parts[0];
  return '${local.substring(0, local.length.clamp(0, 3))}***@${parts[1]}';
}

int? _parseAlreadySent(String msg) {
  final lower = msg.toLowerCase();
  if (!lower.contains('otp already sent') && !lower.contains('already sent')) return null;
  final m = RegExp(r'Wait (\d+) seconds', caseSensitive: false).firstMatch(msg);
  return m != null ? int.parse(m.group(1)!) : 10 * 60;
}

// ── LoginPage — mirrors React's LoginFlow ─────────────────────────────
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  _Screen _screen    = _Screen.signIn;
  int     _screenKey = 0;

  String _email              = '';
  String _pendingPw          = '';
  String _otpPurpose         = 'login';
  int    _otpInitialCountdown = 10 * 60;
  bool   _otpNotSent         = false;

  void _goTo(_Screen s) => setState(() { _screen = s; _screenKey++; });

  Future<void> _handleLoggedIn(String token) async {
    await AuthStorage.setToken(token);
    if (mounted) context.go('/success');
  }

  void _handleOtpNeeded(String email, String pw, {int? countdown}) {
    setState(() {
      _email = email; _pendingPw = pw; _otpPurpose = 'login';
      _otpInitialCountdown = countdown ?? 10 * 60;
      _otpNotSent = countdown != null;
    });
    _goTo(_Screen.otp);
  }

  void _handleForgot(String email, {int? countdown}) {
    setState(() {
      _email = email; _otpPurpose = 'reset';
      _otpInitialCountdown = countdown ?? 10 * 60;
      _otpNotSent = countdown != null;
    });
    _goTo(_Screen.otp);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      resizeToAvoidBottomInset: true,
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle.light,
        child: Stack(
          children: [
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment(0, -1.0), radius: 1.8,
                    colors: [Color(0x1CC4820A), Colors.transparent],
                  ),
                ),
              ),
            ),
            SafeArea(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 360),
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: CurvedAnimation(parent: anim, curve: Curves.easeOut),
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0.04, 0), end: Offset.zero)
                        .animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
                    child: child,
                  ),
                ),
                child: switch (_screen) {
                  _Screen.signIn => _SignInScreen(
                    key: ValueKey('signin-$_screenKey'),
                    defaultEmail: _email,
                    onOtpNeeded: _handleOtpNeeded,
                    onLoggedIn: _handleLoggedIn,
                    onForgot: _handleForgot,
                  ),
                  _Screen.otp => _OtpScreen(
                    key: ValueKey('otp-$_screenKey'),
                    email: _email,
                    purpose: _otpPurpose,
                    pendingPw: _pendingPw,
                    initialCountdown: _otpInitialCountdown,
                    notSent: _otpNotSent,
                    onBack: () => _goTo(_Screen.signIn),
                    onChangeEmail: () => _goTo(_Screen.signIn),
                    onLoggedIn: _handleLoggedIn,
                    onResetReady: () => _goTo(_Screen.resetPassword),
                  ),
                  _Screen.resetPassword => _ResetPasswordScreen(
                    key: ValueKey('reset-$_screenKey'),
                    email: _email,
                    onBack: () => _goTo(_Screen.signIn),
                    onDone: () => _goTo(_Screen.signIn),
                  ),
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── SignIn Screen ─────────────────────────────────────────────────────
class _SignInScreen extends StatefulWidget {
  final String defaultEmail;
  final void Function(String email, String pw, {int? countdown}) onOtpNeeded;
  final Future<void> Function(String token) onLoggedIn;
  final void Function(String email, {int? countdown}) onForgot;

  const _SignInScreen({
    super.key,
    required this.defaultEmail,
    required this.onOtpNeeded,
    required this.onLoggedIn,
    required this.onForgot,
  });

  @override
  State<_SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<_SignInScreen> {
  late final TextEditingController _emailCtrl;
  final _pwCtrl    = TextEditingController();
  final _emailNode = FocusNode();
  final _pwNode    = FocusNode();

  String _emailErr = '', _pwErr = '', _generalErr = '';
  bool _agreed = false, _loading = false, _triedSubmit = false;

  bool get _canSubmit =>
      _emailCtrl.text.trim().isNotEmpty &&
      _pwCtrl.text.isNotEmpty &&
      _agreed &&
      !_loading;

  @override
  void initState() {
    super.initState();
    _emailCtrl = TextEditingController(text: widget.defaultEmail);
    _emailCtrl.addListener(() => setState(() {}));
    _pwCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _emailCtrl.dispose(); _pwCtrl.dispose();
    _emailNode.dispose(); _pwNode.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_canSubmit) return;
    setState(() { _emailErr = ''; _pwErr = ''; _generalErr = ''; _loading = true; });
    try {
      final scene = await AuthService.check(_emailCtrl.text.trim());
      if (scene == 'first-login') {
        if (!isPwValid(_pwCtrl.text)) {
          setState(() { _triedSubmit = true; _pwErr = 'Password must meet all requirements below'; });
          return;
        }
        await AuthService.sendOtp(_emailCtrl.text.trim(), 'login');
        widget.onOtpNeeded(_emailCtrl.text.trim(), _pwCtrl.text);
      } else {
        final token = await AuthService.signIn(_emailCtrl.text.trim(), _pwCtrl.text);
        await widget.onLoggedIn(token);
      }
    } catch (e) {
      final msg        = e.toString().replaceFirst('Exception: ', '');
      final lower      = msg.toLowerCase();
      final alreadySent = _parseAlreadySent(msg);
      if (alreadySent != null) {
        widget.onOtpNeeded(_emailCtrl.text.trim(), _pwCtrl.text, countdown: alreadySent);
        return;
      }
      setState(() {
        if (lower.contains('not registered') || lower.contains('not found')) {
          _emailErr = 'Email not registered';
        } else if (lower.contains('incorrect password') || lower.contains('invalid credentials')) {
          _pwErr = 'Incorrect password';
        } else if (lower.contains('gmail') || lower.contains('email sending') || lower.contains('unavailable')) {
          _generalErr = 'Could not send verification email. Please try again.';
        } else {
          _generalErr = msg;
        }
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleForgot() async {
    if (_emailCtrl.text.trim().isEmpty) {
      setState(() => _emailErr = 'Enter your email first');
      _emailNode.requestFocus();
      return;
    }
    setState(() { _emailErr = ''; _loading = true; });
    try {
      final scene = await AuthService.check(_emailCtrl.text.trim());
      if (scene == 'first-login') {
        setState(() => _emailErr = 'No password set yet — complete your account setup first');
        return;
      }
      await AuthService.sendOtp(_emailCtrl.text.trim(), 'reset');
      widget.onForgot(_emailCtrl.text.trim());
    } catch (e) {
      final msg        = e.toString().replaceFirst('Exception: ', '');
      final alreadySent = _parseAlreadySent(msg);
      if (alreadySent != null) {
        widget.onForgot(_emailCtrl.text.trim(), countdown: alreadySent);
        return;
      }
      setState(() => _emailErr = msg);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final showRules = _triedSubmit && !isPwValid(_pwCtrl.text);
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        28, MediaQuery.paddingOf(context).top + 52, 28, 32,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Welcome back',
            style: TextStyle(
              fontSize: 34, fontWeight: FontWeight.w800,
              letterSpacing: -1.4, height: 1.06, color: AppColors.text,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Sign in to your account',
            style: TextStyle(fontSize: 14, color: AppColors.textTer, letterSpacing: -0.2),
          ),
          const SizedBox(height: 36),
          BottomStrokeInput(
            label: 'Email address',
            controller: _emailCtrl,
            focusNode: _emailNode,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const [AutofillHints.email],
            errorText: _emailErr.isNotEmpty ? _emailErr : null,
            onChanged: (_) => setState(() { _emailErr = ''; _generalErr = ''; }),
            onSubmitted: () => _pwNode.requestFocus(),
          ),
          BottomStrokeInput(
            label: 'Password',
            controller: _pwCtrl,
            focusNode: _pwNode,
            isPassword: true,
            autofillHints: const [AutofillHints.password],
            textInputAction: TextInputAction.done,
            errorText: _pwErr.isNotEmpty ? _pwErr : null,
            onChanged: (_) => setState(() => _pwErr = ''),
            onSubmitted: _handleSubmit,
          ),
          if (showRules) PasswordRulesWidget(password: _pwCtrl.text),
          // Terms row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: () => setState(() => _agreed = !_agreed),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 20, height: 20,
                  decoration: BoxDecoration(
                    color: _agreed ? AppColors.accent : Colors.transparent,
                    border: Border.all(
                      color: _agreed ? AppColors.accent : AppColors.inputStroke,
                      width: 1.5,
                    ),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: _agreed
                      ? const Icon(Icons.check, size: 13, color: AppColors.accentFg)
                      : null,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    text: 'I agree to the ',
                    style: TextStyle(fontSize: 13, color: AppColors.textTer),
                    children: [
                      TextSpan(
                        text: 'Terms of Service',
                        style: const TextStyle(color: AppColors.accent),
                      ),
                      const TextSpan(text: ' and '),
                      TextSpan(
                        text: 'Privacy Policy',
                        style: const TextStyle(color: AppColors.accent),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (_generalErr.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(_generalErr, style: const TextStyle(fontSize: 11.5, color: AppColors.err)),
          ],
          const SizedBox(height: 24),
          _CtaButton(
            label: 'Sign In',
            isLoading: _loading,
            enabled: _canSubmit,
            onTap: _handleSubmit,
          ),
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: _loading ? null : _handleForgot,
              child: Text(
                'Forgot password?',
                style: TextStyle(
                  fontSize: 13.5,
                  color: AppColors.accent.withValues(alpha: 0.80),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── OTP Screen ────────────────────────────────────────────────────────
class _OtpScreen extends StatefulWidget {
  final String email, purpose, pendingPw;
  final int initialCountdown;
  final bool notSent;
  final VoidCallback onBack, onChangeEmail, onResetReady;
  final Future<void> Function(String token) onLoggedIn;

  const _OtpScreen({
    super.key,
    required this.email,
    required this.purpose,
    required this.pendingPw,
    required this.initialCountdown,
    required this.notSent,
    required this.onBack,
    required this.onChangeEmail,
    required this.onLoggedIn,
    required this.onResetReady,
  });

  @override
  State<_OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<_OtpScreen> {
  List<String> _digits    = List.filled(6, '');
  String       _otpErr    = '';
  bool         _loading   = false;
  bool         _emailNotSent = false;
  late int     _countdown;
  Timer?       _timer;

  @override
  void initState() {
    super.initState();
    _countdown    = widget.initialCountdown;
    _emailNotSent = widget.notSent;
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || _countdown <= 0) { _timer?.cancel(); return; }
      setState(() => _countdown--);
    });
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  Future<void> _handleVerify(List<String> completedDigits) async {
    final code = completedDigits.join();
    if (code.length < 6 || _loading) return;
    setState(() { _loading = true; _otpErr = ''; });
    try {
      final token = await AuthService.verifyOtp(
        widget.email, code, widget.purpose,
        password: widget.purpose == 'login' ? widget.pendingPw : null,
      );
      if (widget.purpose == 'login') {
        await widget.onLoggedIn(token!);
      } else {
        widget.onResetReady();
      }
    } catch (e) {
      final msg   = e.toString().replaceFirst('Exception: ', '');
      final lower = msg.toLowerCase();
      setState(() {
        _digits = List.filled(6, '');
        if (lower.contains('expired') || lower.contains('request a new')) {
          _otpErr = 'Code expired. Request a new one below.';
        } else if (lower.contains('incorrect code') || lower.contains('check your email')) {
          _otpErr = 'Incorrect code. Check your email and try again.';
        } else {
          _otpErr = 'Invalid code. Please try again.';
        }
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleResend() async {
    setState(() { _digits = List.filled(6, ''); _otpErr = ''; });
    try {
      await AuthService.resendOtp(widget.email, widget.purpose);
      setState(() { _countdown = 10 * 60; _emailNotSent = false; });
      _startTimer();
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      final m   = RegExp(r'Wait (\d+) seconds', caseSensitive: false).firstMatch(msg);
      if (m != null) { setState(() => _countdown = int.parse(m.group(1)!)); return; }
      setState(() => _otpErr = 'Failed to send code. Please try again.');
    }
  }

  String get _countdownLabel =>
      _countdown <= 0 ? '' : _countdown >= 60 ? '${_countdown ~/ 60}m' : '${_countdown}s';

  bool get _isLogin => widget.purpose == 'login';

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        28, MediaQuery.paddingOf(context).top + 16, 28, 32,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextButton.icon(
            onPressed: widget.onBack,
            icon: const Icon(Icons.arrow_back_rounded, size: 16),
            label: const Text('Back'),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.textSub,
              padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              _isLogin ? Icons.email_outlined : Icons.lock_outline_rounded,
              color: AppColors.accent, size: 26,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _isLogin ? 'Check your inbox' : 'Password reset',
            style: const TextStyle(
              fontSize: 30, fontWeight: FontWeight.w800,
              letterSpacing: -1.2, height: 1.06, color: AppColors.text,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _isLogin ? 'We sent a 6-digit code to' : 'Enter the reset code sent to',
            style: TextStyle(fontSize: 14, color: AppColors.textSub),
          ),
          const SizedBox(height: 10),
          // Email chip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.glassBd),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 6, height: 6,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.accent)),
                const SizedBox(width: 8),
                Text(_maskEmail(widget.email),
                  style: const TextStyle(fontSize: 13, color: AppColors.text, fontWeight: FontWeight.w500)),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: widget.onChangeEmail,
                  child: const Text('Change',
                    style: TextStyle(fontSize: 12, color: AppColors.accent, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          OtpInputRow(
            digits: _digits,
            onChange: (v) => setState(() { _digits = v; _otpErr = ''; }),
            onComplete: () => _handleVerify(_digits),
            hasError: _otpErr.isNotEmpty,
          ),
          if (_loading) ...[
            const SizedBox(height: 16),
            const Center(child: SizedBox(width: 22, height: 22,
              child: CircularProgressIndicator(strokeWidth: 2.2, color: AppColors.accent))),
          ],
          if (_otpErr.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(_otpErr, style: const TextStyle(fontSize: 11.5, color: AppColors.err)),
          ],
          if (_otpErr.isEmpty && _emailNotSent && _countdown > 0) ...[
            const SizedBox(height: 8),
            Text('OTP already sent. Please wait to resend.',
              style: TextStyle(fontSize: 11.5, color: AppColors.accent.withValues(alpha: 0.72))),
          ],
          const SizedBox(height: 20),
          if (_countdown > 0)
            Text.rich(TextSpan(
              text: 'Resend in ',
              style: TextStyle(fontSize: 13, color: AppColors.textSub),
              children: [TextSpan(
                text: _countdownLabel,
                style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w600),
              )],
            ))
          else
            Row(children: [
              Text("Didn't receive it? ",
                style: TextStyle(fontSize: 13, color: AppColors.textSub)),
              GestureDetector(
                onTap: _handleResend,
                child: const Text('Resend code',
                  style: TextStyle(fontSize: 13, color: AppColors.accent, fontWeight: FontWeight.w600)),
              ),
            ]),
          if (_isLogin && _countdown > 0) ...[
            const SizedBox(height: 6),
            Text('Check spam/junk if not received.',
              style: TextStyle(fontSize: 11.5, color: AppColors.textTer)),
          ],
        ],
      ),
    );
  }
}

// ── Reset Password Screen ─────────────────────────────────────────────
class _ResetPasswordScreen extends StatefulWidget {
  final String email;
  final VoidCallback onBack;
  final VoidCallback onDone;

  const _ResetPasswordScreen({
    super.key,
    required this.email,
    required this.onBack,
    required this.onDone,
  });

  @override
  State<_ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<_ResetPasswordScreen> {
  final _newPwCtrl   = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _confirmNode = FocusNode();

  String _newErr = '', _confErr = '';
  bool _loading = false, _triedReset = false;

  bool get _canSubmit => _newPwCtrl.text.isNotEmpty && _confirmCtrl.text.isNotEmpty && !_loading;

  @override
  void initState() {
    super.initState();
    _newPwCtrl.addListener(() => setState(() {}));
    _confirmCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _newPwCtrl.dispose(); _confirmCtrl.dispose(); _confirmNode.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    if (!_canSubmit) return;
    setState(() { _newErr = ''; _confErr = ''; _triedReset = true; });
    if (!isPwValid(_newPwCtrl.text)) {
      setState(() => _newErr = 'Password must meet all requirements below');
      return;
    }
    if (_newPwCtrl.text != _confirmCtrl.text) {
      setState(() => _confErr = 'Passwords do not match');
      return;
    }
    setState(() => _loading = true);
    try {
      await AuthService.resetPassword(
        widget.email, _newPwCtrl.text, _confirmCtrl.text,
      );
      widget.onDone();
    } catch (e) {
      setState(() => _newErr = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final showRules = _triedReset && !isPwValid(_newPwCtrl.text);
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        28, MediaQuery.paddingOf(context).top + 16, 28, 32,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextButton.icon(
            onPressed: widget.onBack,
            icon: const Icon(Icons.arrow_back_rounded, size: 16),
            label: const Text('Back'),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.textSub,
              padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.lock_outline_rounded, color: AppColors.accent, size: 26),
          ),
          const SizedBox(height: 20),
          const Text('New password',
            style: TextStyle(
              fontSize: 30, fontWeight: FontWeight.w800,
              letterSpacing: -1.2, height: 1.06, color: AppColors.text,
            )),
          const SizedBox(height: 6),
          Text('Create a strong password for your account',
            style: TextStyle(fontSize: 14, color: AppColors.textSub)),
          const SizedBox(height: 32),
          BottomStrokeInput(
            label: 'New password',
            controller: _newPwCtrl,
            isPassword: true,
            autofillHints: const [AutofillHints.newPassword],
            errorText: _newErr.isNotEmpty ? _newErr : null,
            onChanged: (_) => setState(() => _newErr = ''),
            onSubmitted: () => _confirmNode.requestFocus(),
          ),
          if (showRules) PasswordRulesWidget(password: _newPwCtrl.text),
          BottomStrokeInput(
            label: 'Confirm password',
            controller: _confirmCtrl,
            focusNode: _confirmNode,
            isPassword: true,
            autofillHints: const [AutofillHints.newPassword],
            textInputAction: TextInputAction.done,
            errorText: _confErr.isNotEmpty ? _confErr : null,
            onChanged: (_) => setState(() => _confErr = ''),
            onSubmitted: _handleReset,
          ),
          const SizedBox(height: 8),
          _CtaButton(
            label: 'Set Password',
            isLoading: _loading,
            enabled: _canSubmit,
            onTap: _handleReset,
          ),
        ],
      ),
    );
  }
}

// ── Shared CTA Button (mirrors React .cta-btn) ────────────────────────
class _CtaButton extends StatefulWidget {
  final String label;
  final bool isLoading, enabled;
  final VoidCallback onTap;
  const _CtaButton({
    required this.label,
    required this.isLoading,
    required this.enabled,
    required this.onTap,
  });
  @override State<_CtaButton> createState() => _CtaButtonState();
}

class _CtaButtonState extends State<_CtaButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      reverseDuration: const Duration(milliseconds: 180),
    );
    _scale = Tween<double>(begin: 1, end: 0.965)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scale,
      builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
      child: GestureDetector(
        onTapDown: widget.enabled
            ? (_) { HapticFeedback.lightImpact(); _ctrl.forward(); }
            : null,
        onTapUp: widget.enabled
            ? (_) { _ctrl.reverse(); widget.onTap(); }
            : null,
        onTapCancel: widget.enabled ? () => _ctrl.reverse() : null,
        child: AnimatedOpacity(
          opacity: widget.enabled ? 1.0 : 0.5,
          duration: const Duration(milliseconds: 200),
          child: Container(
            width: double.infinity, height: 58,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.accent, AppColors.accentEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: const [
                BoxShadow(
                  color: AppColors.accentGlow,
                  blurRadius: 28,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Center(
              child: widget.isLoading
                  ? const SizedBox(
                      width: 22, height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        color: AppColors.accentFg,
                      ),
                    )
                  : Text(
                      widget.label,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: AppColors.accentFg,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
