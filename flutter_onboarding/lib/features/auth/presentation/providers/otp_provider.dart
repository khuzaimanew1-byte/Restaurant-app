import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/otp_repository.dart';

// ── State ─────────────────────────────────────────────────────────────

class OtpState {
  final bool isSending;
  final bool isSent;
  final bool isVerifying;
  final String? error;
  final int countdownSeconds;
  final bool verified;

  const OtpState({
    this.isSending = false,
    this.isSent = false,
    this.isVerifying = false,
    this.error,
    this.countdownSeconds = 0,
    this.verified = false,
  });

  bool get canResend => !isSending && countdownSeconds == 0;

  OtpState copyWith({
    bool? isSending,
    bool? isSent,
    bool? isVerifying,
    String? error,
    int? countdownSeconds,
    bool? verified,
    bool clearError = false,
  }) {
    return OtpState(
      isSending: isSending ?? this.isSending,
      isSent: isSent ?? this.isSent,
      isVerifying: isVerifying ?? this.isVerifying,
      error: clearError ? null : error ?? this.error,
      countdownSeconds: countdownSeconds ?? this.countdownSeconds,
      verified: verified ?? this.verified,
    );
  }
}

// ── Notifier ──────────────────────────────────────────────────────────

class OtpNotifier extends StateNotifier<OtpState> {
  final OtpRepository _repo;
  Timer? _timer;
  static const _ttlSeconds = 300; // 5 minutes

  OtpNotifier(this._repo) : super(const OtpState());

  Future<void> sendOtp(String email) async {
    state = state.copyWith(isSending: true, clearError: true);
    final error = await _repo.generateAndSend(email);
    if (error != null) {
      state = state.copyWith(isSending: false, error: error);
      return;
    }
    _startCountdown();
    state = state.copyWith(isSending: false, isSent: true);
  }

  Future<String?> verifyOtp(String email, String otp) async {
    state = state.copyWith(isVerifying: true, clearError: true);
    final error = await _repo.verifyOtp(email, otp);
    if (error != null) {
      state = state.copyWith(isVerifying: false, error: error);
      return error;
    }
    state = state.copyWith(isVerifying: false, verified: true);
    return null;
  }

  void _startCountdown() {
    _timer?.cancel();
    state = state.copyWith(countdownSeconds: _ttlSeconds);
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
