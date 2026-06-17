import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  static const _key = 'auth_token';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_key);
    if (token == null) return null;
    if (!_isTokenValid(token)) {
      await prefs.remove(_key);
      return null;
    }
    return token;
  }

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }

  static bool _isTokenValid(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return false;
      final payload = jsonDecode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
      ) as Map<String, dynamic>;
      final exp = payload['exp'];
      if (exp == null) return true;
      final expiry = DateTime.fromMillisecondsSinceEpoch((exp as int) * 1000);
      return DateTime.now().isBefore(expiry);
    } catch (_) {
      return false;
    }
  }
}
