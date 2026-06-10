class EmailUtils {
  EmailUtils._();

  static String maskEmail(String email) {
    final at = email.indexOf('@');
    if (at < 0) return email;
    final local  = email.substring(0, at);
    final domain = email.substring(at);
    if (local.length <= 2) return '$local***$domain';
    return '${local.substring(0, 2)}***$domain';
  }
}
