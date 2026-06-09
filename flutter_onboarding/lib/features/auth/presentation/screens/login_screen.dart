import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/app_button.dart';
import '../providers/auth_provider.dart';
import '../providers/otp_provider.dart';
import '../widgets/forgot_password_modal.dart';
import '../widgets/otp_modal.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey      = GlobalKey<FormState>();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword  = true;
  bool _agreedToTerms    = false;
  bool _agreedError      = false;
  bool _pendingOtp       = false;

  // ── Entry animation ───────────────────────────────────────────────
  late final AnimationController _entryCtrl;
  late final Animation<double> _entryOpacity;
  late final Animation<Offset>  _entrySlide;

  // ── Email shake animation ─────────────────────────────────────────
  late final AnimationController _shakeCtrl;
  late final Animation<double>   _shakeAnim;

  // ── Password regex ────────────────────────────────────────────────
  static final _hasNum     = RegExp(r'[0-9]');
  static final _hasSpecial = RegExp(r'[!@#$%^&*()\-_=+\[\]{};\':"\\|,.<>/?]');

  @override
  void initState() {
    super.initState();

    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 540),
    );
    _entryOpacity = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _entrySlide   = Tween<Offset>(
      begin: const Offset(0, 0.05),
      end:   Offset.zero,
    ).animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _entryCtrl.forward();

    _shakeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 480),
    );
    _shakeAnim = Tween<double>(begin: 0, end: 1).animate(_shakeCtrl);
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    _shakeCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  // ── Validation helpers ────────────────────────────────────────────

  String? _validateEmail(String? v) {
    if (v == null || v.trim().isEmpty) return 'Email is required.';
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(v.trim()))
      return 'Enter a valid email address.';
    return null;
  }

  String? _validatePassword(String? v) {
    if (v == null || v.isEmpty) return 'Password is required.';
    if (v.length < 8)           return 'Password must be at least 8 characters.';
    if (!_hasNum.hasMatch(v))     return 'Password must contain at least one number.';
    if (!_hasSpecial.hasMatch(v)) return 'Password must contain at least one special character.';
    return null;
  }

  bool get _emailValid {
    final v = _emailCtrl.text.trim();
    return v.isNotEmpty && RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(v);
  }

  // ── Login ─────────────────────────────────────────────────────────

  void _login() {
    final pwValid = _formKey.currentState?.validate() ?? false;
    if (!_agreedToTerms) setState(() => _agreedError = true);
    if (!pwValid || !_agreedToTerms) return;
    FocusScope.of(context).unfocus();
    ref.read(authProvider.notifier).login(_emailCtrl.text, _passwordCtrl.text);
  }

  // ── Forgot Password ───────────────────────────────────────────────

  void _handleForgotPassword() {
    if (!_emailValid) {
      _formKey.currentState?.validate();
      _triggerEmailShake();
      return;
    }
    showModalBottomSheet<void>(
      context:            context,
      isScrollControlled: true,
      backgroundColor:    Colors.transparent,
      builder: (_) => ForgotPasswordModal(
        email:           _emailCtrl.text.trim(),
        onPasswordReset: () {
          _passwordCtrl.clear();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content:         Text('Password updated! Please sign in.'),
              backgroundColor: AppColors.emerald,
              behavior:        SnackBarBehavior.floating,
            ),
          );
        },
        onClose: () => Navigator.of(context).pop(),
      ),
    );
  }

  void _triggerEmailShake() {
    HapticFeedback.heavyImpact();
    _shakeCtrl.reset();
    _shakeCtrl.forward();
  }

  // ── OTP modal ─────────────────────────────────────────────────────

  void _showOtpModal(String email, String password, int expiresAt) {
    ref.read(otpProvider.notifier).initCountdown(expiresAt);
    showModalBottomSheet<void>(
      context:            context,
      isScrollControlled: true,
      backgroundColor:    Colors.transparent,
      builder: (_) => OtpModal(
        email:      email,
        password:   password,
        onVerified: () => Navigator.of(context).pop(),
        onBack: () {
          Navigator.of(context).pop();
          ref.read(otpProvider.notifier).reset();
          ref.read(authProvider.notifier).reset();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark    = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authProvider);

    ref.listen<AuthState>(authProvider, (_, next) {
      if (next is AuthSuccess) {
        ref.read(authProvider.notifier).reset();
        setState(() => _pendingOtp = false);
      } else if (next is AuthOtpPending) {
        setState(() => _pendingOtp = false);
        _showOtpModal(next.email, next.pendingPassword, next.expiresAt);
      }
    });

    final isLoading = authState is AuthLoading || _pendingOtp;
    final errorMsg  = authState is AuthError ? authState.message : null;

    if (authState is AuthSuccess) {
      return _SuccessView(isDark: isDark);
    }

    return Scaffold(
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
        child: SafeArea(
          child: FadeTransition(
            opacity: _entryOpacity,
            child: SlideTransition(
              position: _entrySlide,
              child: CustomScrollView(
                slivers: [
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 52),
                            _AppIcon(isDark: isDark),
                            const SizedBox(height: 36),
                            Text('Welcome back', style: AppTextStyles.displayMedium(isDark)),
                            const SizedBox(height: 8),
                            Text(
                              'Sign in to your account to continue.',
                              style: AppTextStyles.bodyLarge(isDark),
                            ),
                            const SizedBox(height: 40),

                            if (errorMsg != null) ...[
                              _ErrorBanner(message: errorMsg, isDark: isDark),
                              const SizedBox(height: 20),
                            ],

                            // ── Email field with shake ────────────────
                            _FieldLabel('Email', isDark),
                            const SizedBox(height: 8),
                            AnimatedBuilder(
                              animation: _shakeAnim,
                              builder: (context, child) {
                                final dx = ((_shakeAnim.value * 6 * 3.14159).sin() * 9)
                                    .clamp(-9.0, 9.0);
                                return Transform.translate(
                                  offset: Offset(dx, 0),
                                  child: child,
                                );
                              },
                              child: TextFormField(
                                controller:      _emailCtrl,
                                keyboardType:    TextInputType.emailAddress,
                                autocorrect:     false,
                                textInputAction: TextInputAction.next,
                                style: TextStyle(
                                  fontSize: 15,
                                  color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                                ),
                                decoration: const InputDecoration(
                                  hintText:   'you@company.com',
                                  prefixIcon: Icon(Icons.mail_outline_rounded, size: 18),
                                ),
                                validator: _validateEmail,
                              ),
                            ),
                            const SizedBox(height: 18),

                            // ── Password field ────────────────────────
                            _FieldLabel('Password', isDark),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller:      _passwordCtrl,
                              obscureText:     _obscurePassword,
                              textInputAction: TextInputAction.done,
                              onFieldSubmitted: (_) => _login(),
                              style: TextStyle(
                                fontSize: 15,
                                color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                              ),
                              decoration: InputDecoration(
                                hintText:   '••••••••',
                                prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    size: 18,
                                    color: isDark
                                        ? AppColors.darkSecondary
                                        : AppColors.lightSecondary,
                                  ),
                                  onPressed: () =>
                                      setState(() => _obscurePassword = !_obscurePassword),
                                ),
                              ),
                              validator: _validatePassword,
                            ),

                            // ── Forgot password link ──────────────────
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: _handleForgotPassword,
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 4),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  'Forgot password?',
                                  style: TextStyle(
                                    fontSize:   12.5,
                                    fontWeight: FontWeight.w600,
                                    color:      AppColors.indigo,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),

                            // ── Terms & Conditions checkbox ────────────
                            GestureDetector(
                              onTap: () => setState(() {
                                _agreedToTerms = !_agreedToTerms;
                                if (_agreedToTerms) _agreedError = false;
                              }),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    width: 20, height: 20,
                                    margin: const EdgeInsets.only(top: 1),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: _agreedError
                                            ? AppColors.error
                                            : _agreedToTerms
                                                ? AppColors.indigo
                                                : (isDark
                                                    ? Colors.white.withValues(alpha: 0.2)
                                                    : Colors.black.withValues(alpha: 0.2)),
                                        width: 2,
                                      ),
                                      color: _agreedToTerms
                                          ? AppColors.indigo
                                          : Colors.transparent,
                                    ),
                                    child: _agreedToTerms
                                        ? const Icon(Icons.check_rounded,
                                            size: 13, color: Colors.white)
                                        : null,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        RichText(
                                          text: TextSpan(
                                            style: TextStyle(
                                              fontSize:   13.5,
                                              color: isDark
                                                  ? AppColors.darkSecondary
                                                  : AppColors.lightSecondary,
                                              height: 1.5,
                                            ),
                                            children: [
                                              const TextSpan(text: 'I agree to the '),
                                              TextSpan(
                                                text: 'Terms of Service',
                                                style: const TextStyle(
                                                  color:      AppColors.indigo,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        if (_agreedError)
                                          const Padding(
                                            padding: EdgeInsets.only(top: 4),
                                            child: Text(
                                              'You must agree to the Terms of Service to continue.',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color:    AppColors.error,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const Spacer(),
                            const SizedBox(height: 32),

                            AppButton(
                              label:     'Log In',
                              onPressed: isLoading ? null : _login,
                              isLoading: isLoading,
                            ),
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Inline success view ───────────────────────────────────────────────

class _SuccessView extends StatelessWidget {
  final bool isDark;
  const _SuccessView({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width:  72,
                  height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.emerald.withValues(alpha: 0.12),
                    border: Border.all(
                      color: AppColors.emerald.withValues(alpha: 0.28),
                    ),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.check_rounded,
                      size:  36,
                      color: AppColors.emerald,
                    ),
                  ),
                )
                    .animate()
                    .scale(
                      begin:    const Offset(0.6, 0.6),
                      end:      const Offset(1, 1),
                      curve:    Curves.elasticOut,
                      duration: 700.ms,
                    )
                    .fadeIn(duration: 300.ms),

                const SizedBox(height: 36),

                Text(
                  'Welcome to\nAttendance App',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize:      34,
                    fontWeight:    FontWeight.w800,
                    letterSpacing: -1.2,
                    height:        1.1,
                    color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                  ),
                )
                    .animate(delay: 220.ms)
                    .slideY(
                      begin:    0.15,
                      end:      0,
                      curve:    Curves.easeOutCubic,
                      duration: 500.ms,
                    )
                    .fadeIn(duration: 400.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────

class _AppIcon extends StatelessWidget {
  final bool isDark;
  const _AppIcon({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      width:  56,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color:  isDark ? AppColors.darkCard : AppColors.lightSurface,
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
            blurRadius: 20,
            offset:     const Offset(0, 4),
          ),
        ],
      ),
      child: const Center(
        child: Icon(Icons.schedule_rounded, size: 26, color: AppColors.indigo),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  final bool isDark;
  const _FieldLabel(this.text, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize:      13,
        fontWeight:    FontWeight.w600,
        letterSpacing: -0.1,
        color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  final bool isDark;
  const _ErrorBanner({required this.message, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color:        AppColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: AppColors.error.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.error),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                fontSize:   13,
                fontWeight: FontWeight.w500,
                color:      AppColors.error,
                height:     1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
