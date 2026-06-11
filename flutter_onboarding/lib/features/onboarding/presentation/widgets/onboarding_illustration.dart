import 'package:flutter/material.dart';
import '../../data/onboarding_data.dart';
import 'illustrations/attendance_illustration.dart';
import 'illustrations/leave_illustration.dart';
import 'illustrations/analytics_illustration.dart';

class OnboardingIllustration extends StatelessWidget {
  final IllustrationType type;

  const OnboardingIllustration({super.key, required this.type});

  @override
  Widget build(BuildContext context) {
    return switch (type) {
      IllustrationType.attendance => const AttendanceIllustration(),
      IllustrationType.leave      => const LeaveIllustration(),
      IllustrationType.analytics  => const AnalyticsIllustration(),
    };
  }
}
