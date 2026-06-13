import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_colors.dart';
import '../../features/auth/data/auth_storage.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/success_page.dart';
import '../../features/onboarding/data/onboarding_repository.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/init',
    routes: [
      GoRoute(path: '/init', builder: (_, __) => const _InitGate()),
      GoRoute(
        path: '/onboarding',
        pageBuilder: (_, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const OnboardingPage(),
          transitionsBuilder: _fadeSlide,
        ),
      ),
      GoRoute(
        path: '/login',
        pageBuilder: (_, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginPage(),
          transitionsBuilder: _fadeSlide,
        ),
      ),
      GoRoute(
        path: '/success',
        pageBuilder: (_, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SuccessPage(),
          transitionsBuilder: _fadeSlide,
        ),
      ),
    ],
  );
});

// ── Init gate — routes based on auth + onboarding state ──────────────────────

class _InitGate extends StatefulWidget {
  const _InitGate();
  @override
  State<_InitGate> createState() => _InitGateState();
}

class _InitGateState extends State<_InitGate> {
  @override
  void initState() {
    super.initState();
    _route();
  }

  Future<void> _route() async {
    final token = await AuthStorage.getToken();
    if (token != null) {
      if (mounted) context.go('/success');
      return;
    }
    final done = await OnboardingRepository().hasCompletedOnboarding();
    if (mounted) context.go(done ? '/login' : '/onboarding');
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.bg,
    body: Center(
      child: CircularProgressIndicator(color: AppColors.accentLt, strokeWidth: 2),
    ),
  );
}

// ── Shared page transition ────────────────────────────────────────────────────

Widget _fadeSlide(
  BuildContext _,
  Animation<double> animation,
  Animation<double> secondary,
  Widget child,
) {
  return FadeTransition(
    opacity: CurvedAnimation(parent: animation, curve: Curves.easeOut),
    child: SlideTransition(
      position: Tween<Offset>(begin: const Offset(0.03, 0), end: Offset.zero)
          .animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
      child: child,
    ),
  );
}
