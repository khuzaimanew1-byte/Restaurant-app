import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/onboarding/data/onboarding_repository.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/init',
    routes: [
      GoRoute(
        path:    '/init',
        builder: (_, __) => const _InitGate(),
      ),
      GoRoute(
        path: '/onboarding',
        pageBuilder: (_, state) => CustomTransitionPage(
          key:                state.pageKey,
          child:              const OnboardingPage(),
          transitionsBuilder: _fadeTransition,
        ),
      ),
    ],
  );
});

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
    await OnboardingRepository().hasCompletedOnboarding();
    if (mounted) context.go('/onboarding');
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Center(
        child: CircularProgressIndicator(
          color:       dark ? Colors.white38 : Colors.black26,
          strokeWidth: 2,
        ),
      ),
    );
  }
}

Widget _fadeTransition(_, Animation<double> animation,
    Animation<double> secondary, Widget child) {
  return FadeTransition(
    opacity: CurvedAnimation(parent: animation, curve: Curves.easeOut),
    child:   child,
  );
}
