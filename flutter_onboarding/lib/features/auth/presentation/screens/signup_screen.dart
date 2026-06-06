import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/app_button.dart';
import '../providers/auth_provider.dart';
import '../providers/otp_provider.dart';
import '../widgets/otp_modal.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  late final AnimationController _entryCtrl;
  late final Animation<double> _entryOpacity;
  late final Animation<Offset> _entrySlide;

  // Tracks whether we've passed the pre-OTP validation stage.
  bool _pendingOtp = false;

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 540),
    );
    _entryOpacity = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _entrySlide = Tween<Offset>(
      begin: const Offset(0, 0.05),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOutCubic));
    _entryCtrl.forward();
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    FocusScope.of(context).unfocus();

    // Validate with Back4App first (employee check) via auth provider.
    // We call a lightweight employee lookup before sending OTP.
    final repo = ref.read(authRepositoryProvider);
    final normalEmail = _emailCtrl.text.trim().toLowerCase();

    final employee = await repo.findEmployee(normalEmail);
    if (!mounted) return;

    if (employee == null) {
      ref.read(authProvider.notifier).reset(); // ensure idle
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Your email has not been registered by the administrator.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (employee.isActivated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account already exists. Please log in.'),
          backgroundColor: AppColors.indigo,
        ),
      );
      return;
    }

    // Send OTP.
    setState(() => _pendingOtp = true);
    await ref.read(otpProvider.notifier).sendOtp(normalEmail);
    if (!mounted) return;

    final otpState = ref.read(otpProvider);
    if (otpState.error != null) {
      setState(() => _pendingOtp = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(otpState.error!),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // Show OTP modal.
    _showOtpModal(normalEmail);
  }

  void _showOtpModal(String email) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => OtpModal(
        email: email,
        onVerified: () {
          Navigator.of(context).pop();
          _completeSignup();
        },
        onBack: () {
          Navigator.of(context).pop();
          ref.read(otpProvider.notifier).reset();
          setState(() => _pendingOtp = false);
        },
      ),
    );
  }

  Future<void> _completeSignup() async {
    await ref
        .read(authProvider.notifier)
        .signup(_emailCtrl.text.trim(), _passwordCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<AuthState>(authProvider, (_, next) {
      if (next is AuthSuccess) {
        ref.read(authProvider.notifier).reset();
        context.go('/success');
      }
    });

    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading || _pendingOtp;
    final errorMsg = authState is AuthError ? authState.message : null;

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
                            const SizedBox(height: 16),
                            // Back
                            IconButton(
                              onPressed: () => context.pop(),
                              icon: Icon(
                                Icons.arrow_back_ios_new_rounded,
                                size: 18,
                                color: isDark ? AppColors.darkSecondary : AppColors.lightSecondary,
                              ),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                            const SizedBox(height: 32),
                            Text('Create account', style: AppTextStyles.displayMedium(isDark)),
                            const SizedBox(height: 8),
                            Text(
                              'Only pre-registered employee emails are accepted.',
                              style: AppTextStyles.bodyLarge(isDark),
                            ),
                            const SizedBox(height: 40),

                            if (errorMsg != null) ...[
                              _ErrorBanner(message: errorMsg, isDark: isDark),
                              const SizedBox(height: 20),
                            ],

                            _FieldLabel('Email', isDark),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _emailCtrl,
                              keyboardType: TextInputType.emailAddress,
                              autocorrect: false,
                              textInputAction: TextInputAction.next,
                              style: TextStyle(
                                fontSize: 15,
                                color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                              ),
                              decoration: const InputDecoration(
                                hintText: 'your.work@company.com',
                                prefixIcon: Icon(Icons.mail_outline_rounded, size: 18),
                              ),
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'Email is required.';
                                if (!v.contains('@')) return 'Enter a valid email.';
                                return null;
                              },
                            ),
                            const SizedBox(height: 18),

                            _FieldLabel('Password', isDark),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _passwordCtrl,
                              obscureText: _obscurePassword,
                              textInputAction: TextInputAction.next,
                              style: TextStyle(
                                fontSize: 15,
                                color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Min. 8 characters',
                                prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    size: 18,
                                  ),
                                  onPressed: () =>
                                      setState(() => _obscurePassword = !_obscurePassword),
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Password is required.';
                                if (v.length < 8) return 'Minimum 8 characters.';
                                return null;
                              },
                            ),
                            const SizedBox(height: 18),

                            _FieldLabel('Confirm Password', isDark),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _confirmCtrl,
                              obscureText: _obscureConfirm,
                              textInputAction: TextInputAction.done,
                              onFieldSubmitted: (_) => _requestOtp(),
                              style: TextStyle(
                                fontSize: 15,
                                color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Re-enter password',
                                prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscureConfirm
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    size: 18,
                                  ),
                                  onPressed: () =>
                                      setState(() => _obscureConfirm = !_obscureConfirm),
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Please confirm your password.';
                                if (v != _passwordCtrl.text) return 'Passwords do not match.';
                                return null;
                              },
                            ),
                            const Spacer(),
                            const SizedBox(height: 32),

                            AppButton(
                              label: 'Continue',
                              onPressed: isLoading ? null : _requestOtp,
                              isLoading: isLoading,
                            ),
                            const SizedBox(height: 14),
                            AppButton(
                              label: 'Already have an account? Log In',
                              variant: AppButtonVariant.ghost,
                              onPressed: isLoading ? null : () => context.pop(),
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

class _FieldLabel extends StatelessWidget {
  final String text;
  final bool isDark;
  const _FieldLabel(this.text, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
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
        color: AppColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.error),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.error,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
