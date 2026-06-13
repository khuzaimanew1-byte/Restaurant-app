import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../data/auth_service.dart';
import '../widgets/bottom_stroke_input.dart';
import '../widgets/password_rules_widget.dart';
import 'login_page.dart' show CtaButton;

class NewPasswordPage extends StatefulWidget {
  final String email;
  const NewPasswordPage({super.key, required this.email});

  @override
  State<NewPasswordPage> createState() => _NewPasswordPageState();
}

class _NewPasswordPageState extends State<NewPasswordPage> {
  final _newPwCtrl   = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _confirmNode = FocusNode();

  String _newErr = '', _confErr = '';
  bool _loading = false, _triedReset = false;

  bool get _canSubmit =>
      _newPwCtrl.text.isNotEmpty && _confirmCtrl.text.isNotEmpty && !_loading;

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
      if (mounted) context.go('/login');
    } catch (e) {
      setState(() => _newErr = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final showRules = _triedReset && !isPwValid(_newPwCtrl.text);
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(
          28, MediaQuery.paddingOf(context).top + 16, 28, 32,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextButton.icon(
              onPressed: () => context.go('/login'),
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
              child: const Icon(
                Icons.lock_outline_rounded, color: AppColors.accent, size: 26,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'New password',
              style: TextStyle(
                fontSize: 30, fontWeight: FontWeight.w800,
                letterSpacing: -1.2, height: 1.06, color: AppColors.text,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Create a strong password for your account',
              style: TextStyle(fontSize: 14, color: AppColors.textSub),
            ),
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
            CtaButton(
              label: 'Set Password',
              isLoading: _loading,
              enabled: _canSubmit,
              onTap: _handleReset,
            ),
          ],
        ),
      ),
    );
  }
}
