import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../../../core/env/env.dart';

class OtpRepository {
  static String get _base => Env.apiBaseUrl;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };

  /// Calls POST /api/auth/resend-otp.
  /// Returns the new [expiresAt] timestamp (ms) on success,
  /// or throws [OtpException] on failure.
  Future<int> resendOtp(String email) async {
    final res = await http.post(
      Uri.parse('$_base/auth/resend-otp'),
      headers: _headers,
      body: jsonEncode({'email': email.toLowerCase().trim()}),
    );

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return body['expiresAt'] as int? ??
          DateTime.now().add(const Duration(minutes: 5)).millisecondsSinceEpoch;
    }

    final msg = (body['message'] as String?) ??
        (body['error'] as String?) ??
        'Failed to resend OTP.';
    throw OtpException(msg);
  }
}

class OtpException implements Exception {
  final String message;
  const OtpException(this.message);
  @override
  String toString() => message;
}
