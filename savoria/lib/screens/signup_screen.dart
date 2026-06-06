import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../widgets/press_button.dart';
import '../widgets/otp_modal.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen>
    with SingleTickerProviderStateMixin {
  final _nameCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl  = TextEditingController();

  final _nameFocus    = FocusNode();
  final _emailFocus   = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();

  bool _showPassword  = false;
  bool _showConfirm   = false;
  bool _isFormValid   = false;
  bool _loading       = false;

  String? _nameError;
  String? _emailError;
  String? _passwordError;
  String? _confirmError;

  // OTP modal — created once on first submit, shown/hidden thereafter
  bool _otpModalCreated  = false;
  bool _otpModalVisible  = false;

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

    // Blur listeners for on-blur validation
    _nameFocus.addListener(() {
      if (!_nameFocus.hasFocus) _validateName(onBlur: true);
    });
    _emailFocus.addListener(() {
      if (!_emailFocus.hasFocus) _validateEmail(onBlur: true);
    });
    _passwordFocus.addListener(() {
      if (!_passwordFocus.hasFocus) _validatePassword(onBlur: true);
    });
    _confirmFocus.addListener(() {
      if (!_confirmFocus.hasFocus) _validateConfirm(onBlur: true);
    });

    // Live form-validity check
    for (final c in [_nameCtrl, _emailCtrl, _passwordCtrl, _confirmCtrl]) {
      c.addListener(_recheckFormValid);
    }
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    for (final c in [_nameCtrl, _emailCtrl, _passwordCtrl, _confirmCtrl]) {
      c.dispose();
    }
    for (final f in [_nameFocus, _emailFocus, _passwordFocus, _confirmFocus]) {
      f.dispose();
    }
    super.dispose();
  }

  // ── Validation helpers ────────────────────────────────────────────────

  bool _validateName({bool onBlur = false}) {
    final v = _nameCtrl.text.trim();
    final err = v.isEmpty ? 'Full name is required' : null;
    setState(() => _nameError = err);
    return err == null;
  }

  bool _validateEmail({bool onBlur = false}) {
    final v = _emailCtrl.text.trim();
    final err = v.isEmpty
        ? 'Email is required'
        : !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v)
            ? 'Enter a valid email address'
            : null;
    setState(() => _emailError = err);
    return err == null;
  }

  bool _validatePassword({bool onBlur = false}) {
    final v = _passwordCtrl.text;
    final err = v.isEmpty
        ? 'Password is required'
        : v.length < 8
            ? 'At least 8 characters required'
            : null;
    setState(() => _passwordError = err);
    // Re-validate confirm if it has a value
    if (_confirmCtrl.text.isNotEmpty) _validateConfirm();
    return err == null;
  }

  bool _validateConfirm({bool onBlur = false}) {
    final v = _confirmCtrl.text;
    final err = v.isEmpty
        ? 'Please confirm your password'
        : v != _passwordCtrl.text
            ? 'Passwords do not match'
            : null;
    setState(() => _confirmError = err);
    return err == null;
  }

  void _recheckFormValid() {
    final name  = _nameCtrl.text.trim().isNotEmpty;
    final email = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
        .hasMatch(_emailCtrl.text.trim());
    final pass  = _passwordCtrl.text.length >= 8;
    final conf  = _confirmCtrl.text == _passwordCtrl.text &&
        _confirmCtrl.text.isNotEmpty;

    final valid = name && email && pass && conf;
    if (valid != _isFormValid) setState(() => _isFormValid = valid);
  }

  // ── Submit ────────────────────────────────────────────────────────────

  Future<void> _onSubmit() async {
    final nameOk    = _validateName();
    final emailOk   = _validateEmail();
    final passOk    = _validatePassword();
    final confOk    = _validateConfirm();
    if (!nameOk || !emailOk || !passOk || !confOk) return;

    setState(() => _loading = true);
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() => _loading = false);

    // Show OTP modal — create it the first time, just reveal otherwise
    if (!_otpModalCreated) {
      setState(() {
        _otpModalCreated = true;
        _otpModalVisible = true;
      });
    } else {
      setState(() => _otpModalVisible = true);
    }
  }

  void _closeOtpModal() {
    setState(() => _otpModalVisible = false);
    // Re-check form (inputs untouched — just re-hide modal)
  }

  // ── UI builders ───────────────────────────────────────────────────────

  Widget _buildLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            gradient: AppColors.logoGradient,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: AppColors.accent.withOpacity(0.3),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.restaurant, color: Colors.white, size: 18),
        ),
        const SizedBox(width: 10),
        Text(
          'Savoria',
          style: GoogleFonts.inter(
            fontSize: 20,
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
    return ListenableBuilder(
      listenable: focusNode,
      builder: (_, __) {
        final isFocused = focusNode.hasFocus;
        final hasError  = error != null;

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
                        : isFocused
                            ? AppColors.accent
                            : AppColors.inputUnderline,
                    width: isFocused || hasError ? 1.5 : 1,
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
                          : isFocused
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
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 10),
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
                              size: 12,
                              color: AppColors.error.withOpacity(0.8)),
                          const SizedBox(width: 5),
                          Text(
                            error,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.error.withOpacity(0.85),
                            ),
                          ),
                        ],
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        );
      },
    );
  }

  Widget _buildPrimaryButton() {
    final enabled = _isFormValid && !_loading;

    return PressButton(
      onTap: enabled ? _onSubmit : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          gradient: enabled ? AppColors.accentGradient : null,
          color: enabled ? null : AppColors.textDisabled,
          borderRadius: BorderRadius.circular(14),
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: AppColors.accent.withOpacity(0.28),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        alignment: Alignment.center,
        child: _loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : Text(
                'Create Account',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.2,
                  color: enabled ? Colors.white : AppColors.textSecondary,
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
      body: Stack(
        children: [
          // ── Main form ───────────────────────────────────────────────
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: GestureDetector(
                  onTap: () => FocusScope.of(context).unfocus(),
                  behavior: HitTestBehavior.opaque,
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(28, 0, 28, bottomPad + 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),

                        // ── Nav row ────────────────────────────────────
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: AppColors.card,
                                  borderRadius: BorderRadius.circular(10),
                                  border:
                                      Border.all(color: AppColors.cardBorder),
                                ),
                                child: Icon(Icons.arrow_back_ios_new,
                                    size: 15,
                                    color: AppColors.textSecondary),
                              ),
                            ),
                            const Spacer(),
                            _buildLogo(),
                          ],
                        ),

                        const SizedBox(height: 40),

                        // ── Heading ────────────────────────────────────
                        Text(
                          'Join Savoria.',
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
                          'Create your account and start\nyour culinary experience.',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w400,
                            letterSpacing: -0.1,
                            height: 1.5,
                            color: AppColors.textSecondary,
                          ),
                        ),

                        const SizedBox(height: 44),

                        // ── Full name ──────────────────────────────────
                        _buildUnderlineField(
                          controller: _nameCtrl,
                          focusNode: _nameFocus,
                          label: 'Full name',
                          icon: Icons.person_outline_rounded,
                          error: _nameError,
                          onClearError: () {
                            if (_nameError != null) {
                              setState(() => _nameError = null);
                            }
                          },
                          inputAction: TextInputAction.next,
                          onSubmitted: () => _emailFocus.requestFocus(),
                        ),

                        const SizedBox(height: 30),

                        // ── Email ──────────────────────────────────────
                        _buildUnderlineField(
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

                        const SizedBox(height: 30),

                        // ── Password ───────────────────────────────────
                        _buildUnderlineField(
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
                          inputAction: TextInputAction.next,
                          onSubmitted: () => _confirmFocus.requestFocus(),
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

                        // ── Password strength indicator ─────────────────
                        if (_passwordCtrl.text.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          _PasswordStrengthBar(password: _passwordCtrl.text),
                        ],

                        const SizedBox(height: 30),

                        // ── Confirm password ───────────────────────────
                        _buildUnderlineField(
                          controller: _confirmCtrl,
                          focusNode: _confirmFocus,
                          label: 'Confirm password',
                          icon: Icons.lock_outline_rounded,
                          error: _confirmError,
                          onClearError: () {
                            if (_confirmError != null) {
                              setState(() => _confirmError = null);
                            }
                          },
                          obscure: !_showConfirm,
                          inputAction: TextInputAction.done,
                          onSubmitted: _isFormValid ? _onSubmit : null,
                          suffix: GestureDetector(
                            onTap: () =>
                                setState(() => _showConfirm = !_showConfirm),
                            child: Padding(
                              padding: const EdgeInsets.only(left: 8),
                              child: Icon(
                                _showConfirm
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 18,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 44),

                        // ── Submit button ──────────────────────────────
                        _buildPrimaryButton(),

                        const SizedBox(height: 32),

                        // ── Login link ─────────────────────────────────
                        Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Already have an account? ',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Text(
                                  'Sign in',
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    color: AppColors.accent,
                                    fontWeight: FontWeight.w700,
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

          // ── OTP modal overlay ────────────────────────────────────────
          // Created once on first submit; hidden (Offstage) when closed —
          // never removed from the tree, exactly mirroring the spec's
          // "create with JS, hide with display:none" contract.
          if (_otpModalCreated)
            Offstage(
              offstage: !_otpModalVisible,
              child: OtpModal(
                email: _emailCtrl.text,
                onClose: _closeOtpModal,
                onVerified: () {
                  _closeOtpModal();
                  // TODO: navigate to home / success
                },
              ),
            ),
        ],
      ),
    );
  }
}

// ── Password strength bar ──────────────────────────────────────────────────

class _PasswordStrengthBar extends StatelessWidget {
  final String password;
  const _PasswordStrengthBar({required this.password});

  int get _strength {
    int s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (RegExp(r'[A-Z]').hasMatch(password)) s++;
    if (RegExp(r'[0-9]').hasMatch(password)) s++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(password)) s++;
    return s.clamp(1, 4);
  }

  String get _label => const ['', 'Weak', 'Fair', 'Good', 'Strong'][_strength];

  Color get _color => [
        AppColors.error,
        const Color(0xFFF59E0B),
        const Color(0xFF3B82F6),
        AppColors.success,
      ][_strength - 1];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Row(
            children: List.generate(4, (i) {
              return Expanded(
                child: Container(
                  margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                  height: 2.5,
                  decoration: BoxDecoration(
                    color: i < _strength ? _color : AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: 10),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: Text(
            _label,
            key: ValueKey(_label),
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: _color,
            ),
          ),
        ),
      ],
    );
  }
}
