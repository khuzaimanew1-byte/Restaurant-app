/// Environment variables — pass at build/run time via --dart-define.
///
/// Example:
///   flutter run --dart-define=API_BASE_URL=https://your-domain/api
class Env {
  Env._();

  /// Base URL for the NestJS API (no trailing slash).
  /// Includes the /api prefix, e.g. "https://abc.replit.app/api"
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  /// The email address that holds the ADMIN role.
  static const adminGmail = String.fromEnvironment(
    'ADMIN_GMAIL',
    defaultValue: '',
  );
}
