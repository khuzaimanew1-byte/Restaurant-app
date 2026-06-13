import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  static const _base = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080/api',
  );

  static Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body,
  ) async {
    final res = await http.post(
      Uri.parse('$_base$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      final msg = data['message'];
      throw Exception(
        msg is List ? (msg as List).join(', ') : msg ?? 'Something went wrong',
      );
    }
    return data;
  }

  static Future<String> check(String email) async {
    final data = await _post('/auth/check', {'email': email});
    return data['scene'] as String;
  }

  static Future<void> sendOtp(String email, String purpose) async {
    await _post('/auth/send-otp', {'email': email, 'purpose': purpose});
  }

  static Future<String> signIn(String email, String password) async {
    final data = await _post('/auth/sign-in', {'email': email, 'password': password});
    return data['token'] as String;
  }

  static Future<String?> verifyOtp(
    String email,
    String otp,
    String purpose, {
    String? password,
  }) async {
    final body = <String, dynamic>{'email': email, 'otp': otp, 'purpose': purpose};
    if (password != null) body['password'] = password;
    final data = await _post('/auth/verify-otp', body);
    return data['token'] as String?;
  }

  static Future<void> resendOtp(String email, String purpose) async {
    await _post('/auth/resend-otp', {'email': email, 'purpose': purpose});
  }

  static Future<String> resetPassword(
    String email,
    String password,
    String confirmPassword,
  ) async {
    final data = await _post('/auth/reset-password', {
      'email': email,
      'password': password,
      'confirmPassword': confirmPassword,
    });
    return data['token'] as String;
  }
}
