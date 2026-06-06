/// Environment variables read at compile time via --dart-define.
///
/// Build / run command:
///   flutter run \
///     --dart-define=BACK4APP_APP_ID=your_app_id \
///     --dart-define=BACK4APP_JS_KEY=your_js_key \
///     --dart-define=ADMIN_GMAIL=admin@example.com
///
/// GMAIL and GMAIL_APP_PASSWORD are used only in Back4App Cloud Code
/// (back4app_cloud_code/main.js) — never embedded in the Flutter client.
class Env {
  Env._();

  static const back4appAppId =
      String.fromEnvironment('BACK4APP_APP_ID', defaultValue: '');

  static const back4appJsKey =
      String.fromEnvironment('BACK4APP_JS_KEY', defaultValue: '');

  /// The one email that may ever hold the ADMIN role.
  static const adminGmail =
      String.fromEnvironment('ADMIN_GMAIL', defaultValue: '');
}
