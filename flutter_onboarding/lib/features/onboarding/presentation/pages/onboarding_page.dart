import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../widgets/onboarding_illustration.dart';
import '../widgets/page_indicator.dart';
import '../../data/onboarding_data.dart';
import '../../data/onboarding_repository.dart';
import '../../../../core/constants/app_colors.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  bool _isAnimating = false;

  late final AnimationController _illustrationController;
  late final AnimationController _textController;
  late final AnimationController _buttonController;

  late final Animation<double> _illustrationScale;
  late final Animation<double> _illustrationOpacity;
  late final Animation<Offset> _textSlide;
  late final Animation<double> _textOpacity;
  late final Animation<double> _buttonScale;

  @override
  void initState() {
    super.initState();

    _illustrationController = AnimationController(
      duration: const Duration(milliseconds: 480),
      vsync: this,
    );
    _textController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _buttonController = AnimationController(
      duration: const Duration(milliseconds: 120),
      vsync: this,
    );

    _illustrationScale = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(
          parent: _illustrationController, curve: Curves.easeOutCubic),
    );
    _illustrationOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _illustrationController, curve: Curves.easeOut),
    );
    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.18),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _textController, curve: Curves.easeOutCubic),
    );
    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _textController, curve: Curves.easeOut),
    );
    _buttonScale = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _buttonController, curve: Curves.easeInOut),
    );

    _illustrationController.forward();
    Future.delayed(const Duration(milliseconds: 80), () {
      if (mounted) _textController.forward();
    });
  }

  @override
  void dispose() {
    _illustrationController.dispose();
    _textController.dispose();
    _buttonController.dispose();
    super.dispose();
  }

  void _goToNext() {
    if (_isAnimating) return;
    HapticFeedback.lightImpact();
    if (_currentIndex < onboardingPages.length - 1) {
      _animateToPage(_currentIndex + 1);
    } else {
      _handleGetStarted();
    }
  }

  void _goToPage(int index) {
    if (_isAnimating || index == _currentIndex) return;
    HapticFeedback.selectionClick();
    _animateToPage(index);
  }

  void _animateToPage(int index) {
    setState(() => _isAnimating = true);

    _illustrationController.reverse();
    _textController.reverse().then((_) {
      if (!mounted) return;
      setState(() => _currentIndex = index);
      _illustrationController.forward();
      Future.delayed(const Duration(milliseconds: 60), () {
        if (!mounted) return;
        _textController.forward().then((_) {
          if (mounted) setState(() => _isAnimating = false);
        });
      });
    });
  }

  Future<void> _handleGetStarted() async {
    HapticFeedback.mediumImpact();
    await OnboardingRepository().markOnboardingComplete();
  }

  void _handleSkip() {
    HapticFeedback.selectionClick();
    _animateToPage(onboardingPages.length - 1);
  }

  @override
  Widget build(BuildContext context) {
    final page   = onboardingPages[_currentIndex];
    final isLast = _currentIndex == onboardingPages.length - 1;

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle.light,
        child: SafeArea(
          child: Stack(
            children: [
              // Main content column
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: AnimatedBuilder(
                        animation: _illustrationController,
                        builder: (context, child) => Opacity(
                          opacity: _illustrationOpacity.value,
                          child: Transform.scale(
                            scale: _illustrationScale.value,
                            child: OnboardingIllustration(
                              type: page.illustrationType,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  _buildBottomContent(isLast),
                ],
              ),

              // Floating skip — top-right, no header
              if (!isLast)
                Positioned(
                  top: 12,
                  right: 24,
                  child: GestureDetector(
                    onTap: _handleSkip,
                    behavior: HitTestBehavior.opaque,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 8),
                      child: Text(
                        'Skip',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w400,
                          letterSpacing: -0.2,
                          color: AppColors.darkSecondary
                              .withValues(alpha: 0.45),
                        ),
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

  Widget _buildBottomContent(bool isLast) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        28,
        0,
        28,
        MediaQuery.paddingOf(context).bottom + 32,
      ),
      child: AnimatedBuilder(
        animation: _textController,
        builder: (context, child) => Opacity(
          opacity: _textOpacity.value,
          child: SlideTransition(position: _textSlide, child: child),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              onboardingPages[_currentIndex].headline,
              style: const TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.w800,
                letterSpacing: -1.0,
                height: 1.10,
                color: AppColors.darkPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              onboardingPages[_currentIndex].description,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w400,
                letterSpacing: -0.1,
                height: 1.55,
                color: AppColors.darkSecondary.withValues(alpha: 0.72),
              ),
            ),
            const SizedBox(height: 28),
            PageIndicator(
              count: onboardingPages.length,
              current: _currentIndex,
              onTap: _goToPage,
            ),
            const SizedBox(height: 28),
            _buildButton(isLast),
          ],
        ),
      ),
    );
  }

  Widget _buildButton(bool isLast) {
    return GestureDetector(
      onTapDown: (_) => _buttonController.forward(),
      onTapUp: (_) {
        _buttonController.reverse();
        _goToNext();
      },
      onTapCancel: () => _buttonController.reverse(),
      child: AnimatedBuilder(
        animation: _buttonController,
        builder: (context, child) =>
            Transform.scale(scale: _buttonScale.value, child: child),
        child: Container(
          height: 58,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.accent, AppColors.accentEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: AppColors.accentGlow,
                blurRadius: 24,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                isLast ? 'Get Started' : 'Continue',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                  color: AppColors.accentFg,
                ),
              ),
              if (!isLast) ...[
                const SizedBox(width: 8),
                const Icon(
                  Icons.arrow_forward_rounded,
                  size: 18,
                  color: AppColors.accentFg,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
