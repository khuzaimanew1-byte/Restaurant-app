import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/otp_repository.dart';

// ── State ─────────────────────────────────────────────────────────────

class OtpState {
  final bool isSending;
  final bool isSent;
  final String? error;
  final int countdownSeconds;

  const OtpState({
    this.isSending = false,
    this.isSent    = false,
    this.error,
    this.countdownSeconds = 0,
  });

  bool get canResend => !isSending && countdownSeconds == 0;

  OtpState copyWith({
    bool?   isSending,
    bool?   isSent,
    String? error,
    int?    countdownSeconds,
    bool    clearError = false,
  }) {
    return OtpState(
      isSending:        isSending        ?? this.isSending,
      isSent:           isSent           ?? this.isSent,
      error:            clearError ? null : error ?? this.error,
      countdownSeconds: countdownSeconds ?? this.countdownSeconds,
    );
  }
}

// ── Notifier ──────────────────────────────────────────────────────────

class OtpNotifier extends StateNotifier<OtpState> {
  final OtpRepository _repo;
  Timer? _timer;

  OtpNotifier(this._repo) : super(const OtpState());

  /// Initialise the countdown from a server-provided [expiresAtMs] timestamp.
  /// Called after the server sends an OTP (login / signup response).
  void initCountdown(int expiresAtMs) {
    _timer?.cancel();
    final remaining =
        ((expiresAtMs - DateTime.now().millisecondsSinceEpoch) / 1000)
            .round()
            .clamp(0, 600);
    state = state.copyWith(
      isSent: true,
      countdownSeconds: remaining,
      clearError: true,
    );
    _startCountdown();
  }

  /// Resend OTP by calling POST /api/auth/resend-otp.
  /// Reused by the "Resend OTP" button in the OTP modal.
  Future<void> sendOtp(String email) async {
    state = state.copyWith(isSending: true, clearError: true);
    try {
      final expiresAt = await _repo.resendOtp(email);
      initCountdown(expiresAt);
      state = state.copyWith(isSending: false, isSent: true);
    } catch (e) {
      state = state.copyWith(isSending: false, error: e.toString());
    }
  }

  void _startCountdown() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      final remaining = state.countdownSeconds - 1;
      if (remaining <= 0) {
        t.cancel();
        state = state.copyWith(countdownSeconds: 0);
      } else {
        state = state.copyWith(countdownSeconds: remaining);
      }
    });
  }

  void clearError() => state = state.copyWith(clearError: true);

  void reset() {
    _timer?.cancel();
    state = const OtpState();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

// ── Provider ──────────────────────────────────────────────────────────

final otpRepositoryProvider = Provider((_) => OtpRepository());

final otpProvider = StateNotifierProvider.autoDispose<OtpNotifier, OtpState>(
  (ref) => OtpNotifier(ref.watch(otpRepositoryProvider)),
);
