enum IllustrationType { attendance, leave, analytics }

class OnboardingPageData {
  final String headline;
  final String description;
  final IllustrationType illustrationType;

  const OnboardingPageData({
    required this.headline,
    required this.description,
    required this.illustrationType,
  });
}

const List<OnboardingPageData> onboardingPages = [
  OnboardingPageData(
    headline: 'Attendance,\nSimplified',
    description:
        'Track attendance securely through office Wi-Fi with offline support and automatic synchronization.',
    illustrationType: IllustrationType.attendance,
  ),
  OnboardingPageData(
    headline: 'Manage Leave\nEffortlessly',
    description:
        'Apply for leave, track requests, and receive approvals through a professional digital workflow.',
    illustrationType: IllustrationType.leave,
  ),
  OnboardingPageData(
    headline: 'Know Your\nProgress',
    description:
        'Monitor attendance score, punctuality, working hours, and performance trends in one place.',
    illustrationType: IllustrationType.analytics,
  ),
];
