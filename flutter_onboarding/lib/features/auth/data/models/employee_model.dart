/// Pure-Dart employee model (no longer tied to Back4App).
class EmployeeModel {
  final String employeeId;
  final String fullName;
  final String email;
  final String role;
  final bool isActivated;

  const EmployeeModel({
    required this.employeeId,
    required this.fullName,
    required this.email,
    required this.role,
    required this.isActivated,
  });

  factory EmployeeModel.fromJson(Map<String, dynamic> json) => EmployeeModel(
        employeeId:  json['employeeId'] as String? ?? '',
        fullName:    json['fullName']   as String? ?? '',
        email:       json['email']      as String? ?? '',
        role:        json['role']       as String? ?? 'EMPLOYEE',
        isActivated: json['isActivated'] as bool? ?? false,
      );
}
