import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../widgets/press_button.dart';
import 'signup_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey       = GlobalKey<FormState>();
  final _emailCtrl     = TextEditingController();
  final _passwordCtrl  = TextEditingController();
  final _emailFocus    = FocusNode();
  final _passwordFocus = FocusNode();

  bool _showPassword  = false;
  bool _loading       = false;
  String? _emailError;
  String? _passwordError;

  late final AnimationController _entryCtrl;
  late final Animation<double>   _fadeAnim;
  late final Animation<Offset>   _slideAnim;

  @override
  void initState() {
    super.initState();

    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnim  = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));

    _entryCtrl.forward();

    _emailFocus.addListener(() {
      if (!_emailFocus.hasFocus) _validateEmail();
    });
    _passwordFocus.addListener(() {
      if (!_passwordFocus.hasFocus) _validatePassword();
    });
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  // ── Validation ───────────────────────────────────────────────────────
  bool _validateEmail() {
    final v = _emailCtrl.text.trim();
    final err = v.isEmpty
        ? 'Email is required'
        : !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v)
            ? 'Enter a valid email address'
            : null;
    setState(() => _emailError = err);
    return err == null;
  }

  bool _validatePassword() {
    final v = _passwordCtrl.text;
    final err = v.isEmpty
        ? 'Password is required'
        : v.length < 6
            ? 'At least 6 characters required'
            : null;
    setState(() => _passwordError = err);
    return err == null;
  }

  Future<void> _onSignIn() async {
    final emailOk    = _validateEmail();
    final passwordOk = _validatePassword();
    if (!emailOk || !passwordOk) return;

    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;
    setState(() => _loading = false);
    // TODO: navigate to home on success
  }

  // ── Widgets ──────────────────────────────────────────────────────────

  Widget _buildLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            gradient: AppColors.logoGradient,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppColors.accent.withOpacity(0.35),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(Icons.restaurant, color: Colors.white, size: 22),
        ),
        const SizedBox(width: 12),
        Text(
          'Savoria',
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildUnderlineField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String label,
    required IconData icon,
    required String? error,
    required VoidCallback onClearError,
    bool obscure = false,
    Widget? suffix,
    TextInputType keyboardType = TextInputType.text,
    TextInputAction inputAction = TextInputAction.next,
    VoidCallback? onSubmitted,
  }) {
    final hasFocus = focusNode.hasFocus;
    final hasError = error != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.only(bottom: 4),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: hasError
                    ? AppColors.error
                    : hasFocus
                        ? AppColors.accent
                        : AppColors.inputUnderline,
                width: hasFocus || hasError ? 1.5 : 1,
              ),
            ),
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                child: Icon(
                  icon,
                  size: 18,
                  color: hasError
                      ? AppColors.error.withOpacity(0.7)
                      : hasFocus
                          ? AppColors.accent
                          : AppColors.textMuted,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: TextField(
                  controller: controller,
                  focusNode: focusNode,
                  obscureText: obscure,
                  keyboardType: keyboardType,
                  textInputAction: inputAction,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w400,
                  ),
                  onChanged: (_) => onClearError(),
                  onSubmitted: (_) => onSubmitted?.call(),
                  decoration: InputDecoration(
                    hintText: label,
                    hintStyle: GoogleFonts.inter(
                      fontSize: 16,
                      color: AppColors.textMuted,
                      fontWeight: FontWeight.w400,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
              if (suffix != null) suffix,
            ],
          ),
        ),
        AnimatedSize(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
          child: hasError
              ? Padding(
                  padding: const EdgeInsets.only(top: 7),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline,
                          size: 12, color: AppColors.error.withOpacity(0.8)),
                      const SizedBox(width: 5),
                      Text(
                        error,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.error.withOpacity(0.85),
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                )
              : const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _buildPrimaryButton({
    required String label,
    required VoidCallback? onTap,
    bool loading = false,
  }) {
    return PressButton(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          gradient: onTap != null
              ? AppColors.accentGradient
              : null,
          color: onTap == null ? AppColors.textDisabled : null,
          borderRadius: BorderRadius.circular(14),
          boxShadow: onTap != null
              ? [
                  BoxShadow(
                    color: AppColors.accent.withOpacity(0.3),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        alignment: Alignment.center,
        child: loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.2,
                  color: Colors.white,
                ),
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SlideTransition(
            position: _slideAnim,
            child: GestureDetector(
              onTap: () => FocusScope.of(context).unfocus(),
              behavior: HitTestBehavior.opaque,
              child: SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(28, 0, 28, bottomPad + 32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 56),

                      // ── Logo ──────────────────────────────────────────
                      _buildLogo(),

                      const SizedBox(height: 52),

                      // ── Heading ───────────────────────────────────────
                      Text(
                        'Welcome back.',
                        style: GoogleFonts.inter(
                          fontSize: 34,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -1.2,
                          height: 1.1,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Sign in to continue your\nculinary journey.',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                          letterSpacing: -0.1,
                          height: 1.5,
                          color: AppColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: 52),

                      // ── Email field ───────────────────────────────────
                      ListenableBuilder(
                        listenable: _emailFocus,
                        builder: (_, __) => _buildUnderlineField(
                          controller: _emailCtrl,
                          focusNode: _emailFocus,
                          label: 'Email address',
                          icon: Icons.mail_outline_rounded,
                          error: _emailError,
                          onClearError: () {
                            if (_emailError != null) {
                              setState(() => _emailError = null);
                            }
                          },
                          keyboardType: TextInputType.emailAddress,
                          inputAction: TextInputAction.next,
                          onSubmitted: () => _passwordFocus.requestFocus(),
                        ),
                      ),

                      const SizedBox(height: 32),

                      // ── Password field ────────────────────────────────
                      ListenableBuilder(
                        listenable: _passwordFocus,
                        builder: (_, __) => _buildUnderlineField(
                          controller: _passwordCtrl,
                          focusNode: _passwordFocus,
                          label: 'Password',
                          icon: Icons.lock_outline_rounded,
                          error: _passwordError,
                          onClearError: () {
                            if (_passwordError != null) {
                              setState(() => _passwordError = null);
                            }
                          },
                          obscure: !_showPassword,
                          inputAction: TextInputAction.done,
                          onSubmitted: _onSignIn,
                          suffix: GestureDetector(
                            onTap: () =>
                                setState(() => _showPassword = !_showPassword),
                            child: Padding(
                              padding: const EdgeInsets.only(left: 8),
                              child: Icon(
                                _showPassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 18,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // ── Forgot password ───────────────────────────────
                      Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: () {},
                          child: Text(
                            'Forgot password?',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.accent,
                              letterSpacing: -0.1,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 44),

                      // ── Sign in button ────────────────────────────────
                      _buildPrimaryButton(
                        label: 'Sign In',
                        onTap: _loading ? null : _onSignIn,
                        loading: _loading,
                      ),

                      const SizedBox(height: 48),

                      // ── Sign up link ──────────────────────────────────
                      Center(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              "Don't have an account? ",
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const SignupScreen(),
                                  ),
                                );
                              },
                              child: Text(
                                'Sign up',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  color: AppColors.accent,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: -0.1,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
