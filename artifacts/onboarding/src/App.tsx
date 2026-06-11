import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";

export default function App() {
  const [slide, setSlide] = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    if (m) return Math.max(0, Math.min(parseInt(m[1]), 2));
    return 0;
  });

  return (
    <OnboardingFlow
      initialSlide={slide}
      onSlideChange={n => setSlide(n)}
    />
  );
}
