import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';

import '../../../../core/env/env.dart';
import '../models/employee_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  static const _salt = 'attendance_app_2025';

  // ── Password hashing ──────────────────────────────────────────────

  String hashPassword(String password) {
    final bytes = utf8.encode(password + _salt);
    return sha256.convert(bytes).toString();
  }

  // ── Employee queries ──────────────────────────────────────────────

  /// Returns the Employee record for [email], or null if not found.
  Future<EmployeeModel?> findEmployee(String email) async {
    final query = QueryBuilder<ParseObject>(ParseObject('Employee'))
      ..whereEqualTo('email', email.toLowerCase().trim())
      ..setLimit(1);
    final result = await query.query();
    if (!result.success || result.results == null || result.results!.isEmpty) {
      return null;
    }
    return EmployeeModel.fromParse(result.results!.first as ParseObject);
  }

  // ── AppUser queries ───────────────────────────────────────────────

  /// Returns the AppUser record for [email], or null if not found.
  Future<UserModel?> findUser(String email) async {
    final query = QueryBuilder<ParseObject>(ParseObject('AppUser'))
      ..whereEqualTo('email', email.toLowerCase().trim())
      ..setLimit(1);
    final result = await query.query();
    if (!result.success || result.results == null || result.results!.isEmpty) {
      return null;
    }
    return UserModel.fromParse(result.results!.first as ParseObject);
  }

  // ── Login ─────────────────────────────────────────────────────────

  /// Returns [UserModel] on success, or throws [AuthException].
  Future<UserModel> login(String email, String password) async {
    final user = await findUser(email);
    if (user == null) throw AuthException('Account not found.');

    final hash = hashPassword(password);
    if (user.passwordHash != hash) throw AuthException('Incorrect password.');

    return user;
  }

  // ── Signup ────────────────────────────────────────────────────────

  /// Validates the employee, then creates an AppUser record.
  /// Returns [UserModel] on success, or throws [AuthException].
  Future<UserModel> signup(String email, String password) async {
    final normalEmail = email.toLowerCase().trim();

    // 1. Employee must exist.
    final employee = await findEmployee(normalEmail);
    if (employee == null) {
      throw AuthException(
          'Your email has not been registered by the administrator.');
    }

    // 2. Must not already be activated.
    if (employee.isActivated) {
      throw AuthException('Account already exists.');
    }

    // 3. Create AppUser.
    final role = normalEmail == Env.adminGmail.toLowerCase() ? 'ADMIN' : 'EMPLOYEE';
    final newUser = UserModel(
      objectId: '',
      email: normalEmail,
      passwordHash: hashPassword(password),
      role: role,
      employeeId: employee.employeeId,
      createdAt: DateTime.now(),
    );

    final saveResult = await newUser.toParse().save();
    if (!saveResult.success) {
      throw AuthException(saveResult.error?.message ?? 'Signup failed.');
    }

    // 4. Mark employee as activated.
    await _activateEmployee(employee.objectId);

    return UserModel.fromParse(saveResult.result as ParseObject);
  }

  Future<void> _activateEmployee(String objectId) async {
    final obj = ParseObject('Employee')..objectId = objectId;
    obj.set('isActivated', true);
    await obj.save();
  }

  // ── Admin bootstrap ───────────────────────────────────────────────

  /// Called on every cold start. Creates the ADMIN Employee record if absent.
  Future<void> ensureAdminEmployee() async {
    final adminEmail = Env.adminGmail.toLowerCase().trim();
    if (adminEmail.isEmpty) return;

    final existing = await findEmployee(adminEmail);
    if (existing != null) return;

    final admin = EmployeeModel(
      objectId: '',
      employeeId: 'ADMIN-001',
      fullName: 'Administrator',
      email: adminEmail,
      role: 'ADMIN',
      isActivated: false,
      createdAt: DateTime.now(),
    );

    await admin.toParse().save();
  }
}

class AuthException implements Exception {
  final String message;
  const AuthException(this.message);
  @override
  String toString() => message;
}
