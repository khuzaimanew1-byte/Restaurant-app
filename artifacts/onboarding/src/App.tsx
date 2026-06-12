import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginFlow }      from "./components/LoginFlow";

type View = "onboarding" | "login";

export default function App() {
  const [view, setView] = useState<View>(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    return m ? "onboarding" : "onboarding";
  });

  const [slide, setSlide] = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    if (m) return Math.max(0, Math.min(parseInt(m[1]), 2));
    return 0;
  });

  if (view === "login") {
    return <LoginFlow onLoggedIn={() => { /* dashboard navigation will go here */ }} />;
  }

  return (
    <OnboardingFlow
      initialSlide={slide}
      onSlideChange={n => setSlide(n)}
      onGetStarted={() => setView("login")}
    />
  );
}
