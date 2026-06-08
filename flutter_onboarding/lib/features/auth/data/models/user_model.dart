/// Represents an authenticated user session returned from the NestJS API.
class UserModel {
  final String email;
  final String role;
  final String sessionToken;
  final int sessionExpiresAt;

  const UserModel({
    required this.email,
    required this.role,
    required this.sessionToken,
    required this.sessionExpiresAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        email:            json['email'] as String,
        role:             json['role'] as String,
        sessionToken:     json['sessionToken'] as String,
        sessionExpiresAt: json['sessionExpiresAt'] as int,
      );

  bool get isAdmin => role == 'ADMIN';
}
