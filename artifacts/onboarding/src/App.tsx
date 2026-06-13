import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginFlow }      from "./components/LoginFlow";

type View = "onboarding" | "login";

export default function App() {
  const [view, setView] = useState<View>(() => {
    if (window.location.pathname === "/login" || window.location.hash === "#login") return "login";
    if (localStorage.getItem("auth_token")) return "login";
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    return m ? "onboarding" : "onboarding";
  });

  const [slide, setSlide] = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    if (m) return Math.max(0, Math.min(parseInt(m[1]), 2));
    return 0;
  });

  if (view === "login") {
    return (
      <div style={{ animation: "view-enter 0.48s cubic-bezier(.16,1,.3,1) both" }}>
        <LoginFlow onLoggedIn={() => { /* dashboard navigation will go here */ }} />
      </div>
    );
  }

  return (
    <OnboardingFlow
      initialSlide={slide}
      onSlideChange={n => setSlide(n)}
      onGetStarted={() => {
        window.history.pushState({}, "", "/login");
        setView("login");
      }}
    />
  );
}
