import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginFlow }      from "./components/LoginFlow";

type View = "onboarding" | "login" | "success";

function SuccessScreen() {
  return (
    <div className="success-screen">
      <div className="ob__bg-glow" />
      <div className="success-inner">
        <div className="success-icon">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="25" stroke="var(--accent)" strokeWidth="1.8" />
            <path d="M15 26.5l8 8 14-16"
              stroke="var(--accent)" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="success-head">Admin Successfully Verified</h1>
      </div>
    </div>
  );
}

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

  if (view === "success") {
    return (
      <div style={{ animation: "view-enter 0.48s cubic-bezier(.16,1,.3,1) both" }}>
        <SuccessScreen />
      </div>
    );
  }

  if (view === "login") {
    return (
      <div style={{ animation: "view-enter 0.48s cubic-bezier(.16,1,.3,1) both" }}>
        <LoginFlow onLoggedIn={() => setView("success")} />
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
