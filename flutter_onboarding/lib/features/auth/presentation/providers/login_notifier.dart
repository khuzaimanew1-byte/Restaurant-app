import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Screen routing state for LoginPage — replaces _Screen enum + setState.
/// Auto-disposed when LoginPage is popped from the navigation stack.
enum LoginScreen { signIn, otp, resetPassword }

class LoginState {
  final LoginScreen screen;
  final String email;
  final String pendingPw;
  final String otpPurpose;
  final int screenKey;

  const LoginState({
    this.screen     = LoginScreen.signIn,
    this.email      = '',
    this.pendingPw  = '',
    this.otpPurpose = 'login',
    this.screenKey  = 0,
  });

  LoginState copyWith({
    LoginScreen? screen,
    String? email,
    String? pendingPw,
    String? otpPurpose,
    int? screenKey,
  }) => LoginState(
    screen:     screen     ?? this.screen,
    email:      email      ?? this.email,
    pendingPw:  pendingPw  ?? this.pendingPw,
    otpPurpose: otpPurpose ?? this.otpPurpose,
    screenKey:  screenKey  ?? this.screenKey,
  );
}

class LoginNotifier extends StateNotifier<LoginState> {
  LoginNotifier() : super(const LoginState());

  void goTo(LoginScreen s) => state = state.copyWith(
    screen: s, screenKey: state.screenKey + 1,
  );

  /// Called when first-login OTP is required after signup check.
  void handleOtpNeeded(String email, String pw) => state = state.copyWith(
    email: email, pendingPw: pw, otpPurpose: 'login',
    screen: LoginScreen.otp, screenKey: state.screenKey + 1,
  );

  /// Called when user requests a password reset.
  void handleForgot(String email) => state = state.copyWith(
    email: email, otpPurpose: 'reset',
    screen: LoginScreen.otp, screenKey: state.screenKey + 1,
  );
}

/// Auto-dispose so state resets each time the login route is entered.
final loginProvider = StateNotifierProvider.autoDispose<LoginNotifier, LoginState>(
  (ref) => LoginNotifier(),
);
