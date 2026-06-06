import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';

/// Mirrors the Back4App "AppUser" class.
/// Kept separate from Parse's built-in _User to allow custom password hashing.
class UserModel {
  final String objectId;
  final String email;
  final String passwordHash;
  final String role; // 'ADMIN' | 'EMPLOYEE'
  final String employeeId;
  final DateTime createdAt;

  const UserModel({
    required this.objectId,
    required this.email,
    required this.passwordHash,
    required this.role,
    required this.employeeId,
    required this.createdAt,
  });

  factory UserModel.fromParse(ParseObject obj) => UserModel(
        objectId: obj.objectId ?? '',
        email: (obj.get<String>('email') ?? '').toLowerCase().trim(),
        passwordHash: obj.get<String>('passwordHash') ?? '',
        role: obj.get<String>('role') ?? 'EMPLOYEE',
        employeeId: obj.get<String>('employeeId') ?? '',
        createdAt: obj.createdAt ?? DateTime.now(),
      );

  ParseObject toParse() {
    final obj = ParseObject('AppUser')
      ..set('email', email.toLowerCase().trim())
      ..set('passwordHash', passwordHash)
      ..set('role', role)
      ..set('employeeId', employeeId);
    return obj;
  }
}
