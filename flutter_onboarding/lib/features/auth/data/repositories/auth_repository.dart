import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../../../core/env/env.dart';
import '../models/user_model.dart';

// ── Result types ─────────────────────────────────────────────────────

sealed class LoginResult {}

class LoginSession extends LoginResult {
  final UserModel user;
  LoginSession(this.user);
}

class LoginOtpPending extends LoginResult {
  final String email;
  final int expiresAt;
  LoginOtpPending({required this.email, required this.expiresAt});
}

// ── Repository ───────────────────────────────────────────────────────

class AuthRepository {
  static String get _base => Env.apiBaseUrl;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };

  // ── Helpers ─────────────────────────────────────────────────────────

  Map<String, dynamic> _decodeBody(http.Response res) {
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 200 && res.statusCode < 300) return body;
    final msg = (body['message'] as String?) ??
        (body['error'] as String?) ??
        'Request failed (${res.statusCode}).';
    throw AuthException(msg);
  }

  // ── POST /api/auth/login ────────────────────────────────────────────

  Future<LoginResult> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$_base/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email.toLowerCase().trim(), 'password': password}),
    );
    final body = _decodeBody(res);

    if (body['scenario'] == 'first-login') {
      return LoginOtpPending(
        email:     body['email'] as String? ?? email.toLowerCase().trim(),
        expiresAt: body['expiresAt'] as int? ?? 0,
      );
    }

    return LoginSession(UserModel.fromJson(body));
  }

  // ── POST /api/auth/verify-otp ────────────────────────────────────────

  Future<UserModel> verifyOtp(String email, String otp, String password) async {
    final res = await http.post(
      Uri.parse('$_base/auth/verify-otp'),
      headers: _headers,
      body: jsonEncode({
        'email':    email.toLowerCase().trim(),
        'otp':      otp,
        'password': password,
      }),
    );
    final body = _decodeBody(res);
    return UserModel.fromJson(body);
  }

  // ── POST /api/auth/forgot-password ────────────────────────────────────

  Future<int> forgotPassword(String email) async {
    final res = await http.post(
      Uri.parse('$_base/auth/forgot-password'),
      headers: _headers,
      body: jsonEncode({'email': email.toLowerCase().trim()}),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      return body['expiresAt'] as int? ??
          DateTime.now().add(const Duration(minutes: 5)).millisecondsSinceEpoch;
    }
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final code      = body['code'] as String?;
    final expiresAt = body['expiresAt'] as int?;
    final msg = (body['message'] as String?) ??
        (body['error'] as String?) ??
        'Request failed (${res.statusCode}).';
    throw AuthException(msg, code: code, expiresAt: expiresAt);
  }

  // ── POST /api/auth/reset-password ─────────────────────────────────────

  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/auth/reset-password'),
      headers: _headers,
      body: jsonEncode({
        'email':           email.toLowerCase().trim(),
        'otp':             otp,
        'newPassword':     newPassword,
        'confirmPassword': confirmPassword,
      }),
    );
    _decodeBody(res);
  }

  // ── GET /api/auth/otp-status ─────────────────────────────────────────

  Future<OtpStatusResult> getOtpStatus(String email) async {
    try {
      final res = await http.get(
        Uri.parse('$_base/auth/otp-status?email=${Uri.encodeComponent(email.toLowerCase().trim())}'),
        headers: _headers,
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        return OtpStatusResult(
          active:    body['active']    as bool? ?? false,
          expiresAt: body['expiresAt'] as int?,
        );
      }
    } catch (_) {}
    return const OtpStatusResult(active: false);
  }

  // ── Admin bootstrap (no-op — server handles bootstrap) ───────────────

  Future<void> ensureAdminEmployee() async {}
}

class OtpStatusResult {
  final bool active;
  final int? expiresAt;
  const OtpStatusResult({required this.active, this.expiresAt});
}

class AuthException implements Exception {
  final String message;
  final String? code;
  final int? expiresAt;
  const AuthException(this.message, {this.code, this.expiresAt});
  @override
  String toString() => message;
}
