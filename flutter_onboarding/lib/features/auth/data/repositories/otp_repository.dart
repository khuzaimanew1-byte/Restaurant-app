import 'dart:math';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';

import '../services/email_service.dart';

class OtpRepository {
  final _emailService = EmailService();
  static const _otpTtlMinutes = 5;

  /// Generates a 6-digit OTP, stores it in Back4App, and emails it.
  /// Returns an error string on failure, null on success.
  Future<String?> generateAndSend(String email) async {
    final otp = _generateOtp();
    final expiresAt = DateTime.now().add(
      const Duration(minutes: _otpTtlMinutes),
    );

    // Delete any existing OTPs for this email first.
    await _deleteExisting(email);

    // Store in Back4App.
    final obj = ParseObject('OTP')
      ..set('email', email.toLowerCase().trim())
      ..set('otp', otp)
      ..set('expiresAt', expiresAt);

    final saveResult = await obj.save();
    if (!saveResult.success) {
      return saveResult.error?.message ?? 'Failed to store OTP.';
    }

    // Send via Cloud Function → Gmail SMTP.
    return _emailService.sendOtp(toEmail: email, otp: otp);
  }

  /// Returns null if OTP is valid, or an error message.
  Future<String?> verifyOtp(String email, String inputOtp) async {
    final query = QueryBuilder<ParseObject>(ParseObject('OTP'))
      ..whereEqualTo('email', email.toLowerCase().trim())
      ..whereEqualTo('otp', inputOtp)
      ..orderByDescending('createdAt')
      ..setLimit(1);

    final result = await query.query();
    if (!result.success || result.results == null || result.results!.isEmpty) {
      return 'Invalid OTP. Please try again.';
    }

    final record = result.results!.first as ParseObject;
    final expiresAt = record.get<DateTime>('expiresAt');
    if (expiresAt == null || DateTime.now().isAfter(expiresAt)) {
      await record.delete();
      return 'OTP has expired. Please request a new one.';
    }

    // Valid — clean up.
    await record.delete();
    return null;
  }

  Future<void> _deleteExisting(String email) async {
    final query = QueryBuilder<ParseObject>(ParseObject('OTP'))
      ..whereEqualTo('email', email.toLowerCase().trim());
    final result = await query.query();
    if (result.success && result.results != null) {
      for (final obj in result.results!) {
        await (obj as ParseObject).delete();
      }
    }
  }

  String _generateOtp() {
    final rng = Random.secure();
    return List.generate(6, (_) => rng.nextInt(10)).join();
  }
}
