import 'package:flutter/material.dart';
import '../../data/onboarding_data.dart';
import 'illustrations/attendance_illustration.dart';
import 'illustrations/leave_illustration.dart';
import 'illustrations/analytics_illustration.dart';

class OnboardingIllustration extends StatelessWidget {
  final IllustrationType type;
  final bool isDark;

  const OnboardingIllustration({
    super.key,
    required this.type,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return switch (type) {
      IllustrationType.attendance => AttendanceIllustration(isDark: isDark),
      IllustrationType.leave => LeaveIllustration(isDark: isDark),
      IllustrationType.analytics => AnalyticsIllustration(isDark: isDark),
    };
  }
}
