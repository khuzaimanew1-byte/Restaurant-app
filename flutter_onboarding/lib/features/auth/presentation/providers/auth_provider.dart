import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';

// ── State ─────────────────────────────────────────────────────────────

sealed class AuthState {
  const AuthState();
}

class AuthIdle extends AuthState {
  const AuthIdle();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthSuccess extends AuthState {
  final UserModel user;
  const AuthSuccess(this.user);
}

/// Server returned first-login; OTP has been sent. UI should show OTP modal.
class AuthOtpPending extends AuthState {
  final String email;
  final int expiresAt;
  final String pendingPassword;
  const AuthOtpPending({
    required this.email,
    required this.expiresAt,
    required this.pendingPassword,
  });
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

// ── Notifier ──────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthIdle());

  Future<void> login(String email, String password) async {
    state = const AuthLoading();
    try {
      final result = await _repo.login(email.trim(), password);
      if (result is LoginSession) {
        state = AuthSuccess(result.user);
      } else if (result is LoginOtpPending) {
        state = AuthOtpPending(
          email:           result.email,
          expiresAt:       result.expiresAt,
          pendingPassword: password,
        );
      }
    } on AuthException catch (e) {
      state = AuthError(e.message);
    } catch (_) {
      state = const AuthError('Something went wrong. Please try again.');
    }
  }

  Future<void> verifyOtp(String email, String otp, String password) async {
    state = const AuthLoading();
    try {
      final user = await _repo.verifyOtp(email, otp, password);
      state = AuthSuccess(user);
    } on AuthException catch (e) {
      state = AuthError(e.message);
    } catch (_) {
      state = const AuthError('Something went wrong. Please try again.');
    }
  }

  void reset() => state = const AuthIdle();
}

// ── Provider ──────────────────────────────────────────────────────────

final authRepositoryProvider = Provider((_) => AuthRepository());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.watch(authRepositoryProvider)),
);
