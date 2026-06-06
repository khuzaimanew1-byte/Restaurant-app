import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';

/// Sends OTP emails via a Back4App Cloud Function.
///
/// The Cloud Code (back4app_cloud_code/main.js) uses nodemailer + Gmail SMTP
/// with GMAIL and GMAIL_APP_PASSWORD environment variables set in the
/// Back4App dashboard — credentials never leave the server.
class EmailService {
  /// Calls the Cloud Function "sendOtpEmail".
  /// Returns null on success, or an error message string on failure.
  Future<String?> sendOtp({
    required String toEmail,
    required String otp,
  }) async {
    try {
      final fn = ParseCloudFunction('sendOtpEmail');
      final response = await fn.execute(
        parameters: {
          'email': toEmail,
          'otp': otp,
        },
      );

      if (response.success) return null;
      return response.error?.message ?? 'Failed to send OTP.';
    } catch (e) {
      return e.toString();
    }
  }
}
