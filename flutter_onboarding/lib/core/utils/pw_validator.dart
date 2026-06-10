class PwValidator {
  PwValidator._();

  static final hasNum     = RegExp(r'[0-9]');
  static final hasUpper   = RegExp(r'[A-Z]');
  static final hasSpecial = RegExp(r'[!@#$%^&*()\-_=+\[\]{};\':"\\|,.<>/?]');

  static String? validate(String? v) {
    if (v == null || v.isEmpty) return 'Password is required.';
    if (v.length < 8)            return 'Password must be at least 8 characters.';
    if (!hasUpper.hasMatch(v))   return 'Password must contain at least one uppercase letter.';
    if (!hasNum.hasMatch(v))     return 'Password must contain at least one number.';
    if (!hasSpecial.hasMatch(v)) return 'Password must contain at least one special character.';
    return null;
  }

  static bool isValid(String v) => validate(v) == null;
}
