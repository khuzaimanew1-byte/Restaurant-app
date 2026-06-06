import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';

/// Mirrors the Back4App "Employee" class.
class EmployeeModel {
  final String objectId;
  final String employeeId;
  final String fullName;
  final String email;
  final String role; // 'ADMIN' | 'EMPLOYEE'
  final bool isActivated;
  final DateTime createdAt;

  const EmployeeModel({
    required this.objectId,
    required this.employeeId,
    required this.fullName,
    required this.email,
    required this.role,
    required this.isActivated,
    required this.createdAt,
  });

  factory EmployeeModel.fromParse(ParseObject obj) => EmployeeModel(
        objectId: obj.objectId ?? '',
        employeeId: obj.get<String>('employeeId') ?? '',
        fullName: obj.get<String>('fullName') ?? '',
        email: (obj.get<String>('email') ?? '').toLowerCase().trim(),
        role: obj.get<String>('role') ?? 'EMPLOYEE',
        isActivated: obj.get<bool>('isActivated') ?? false,
        createdAt: obj.createdAt ?? DateTime.now(),
      );

  ParseObject toParse() {
    final obj = ParseObject('Employee')
      ..set('employeeId', employeeId)
      ..set('fullName', fullName)
      ..set('email', email.toLowerCase().trim())
      ..set('role', role)
      ..set('isActivated', isActivated);
    return obj;
  }
}
