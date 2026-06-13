import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginFlow }      from "./components/LoginFlow";

type View = "onboarding" | "login" | "success";

function SuccessScreen({ onLogout }: { onLogout: () => void }) {
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
        <button className="success-logout" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}

function getInitialView(): View {
  if (localStorage.getItem("auth_token")) return "success";
  if (window.location.pathname === "/login" || window.location.hash === "#login") return "login";
  const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
  return m ? "onboarding" : "onboarding";
}

export default function App() {
  const [view, setView] = useState<View>(getInitialView);

  const [slide, setSlide] = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    if (m) return Math.max(0, Math.min(parseInt(m[1]), 2));
    return 0;
  });

  const token = localStorage.getItem("auth_token");

  // Route guards — derive the effective view from auth state
  // Logged in  → only success is accessible
  // Logged out → success is not accessible
  const guardedView: View = token
    ? "success"
    : view === "success" ? "login" : view;

  const handleLoggedIn = () => {
    setView("success");
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setView("login");
  };

  if (guardedView === "success") {
    return (
      <div style={{ animation: "view-enter 0.48s cubic-bezier(.16,1,.3,1) both" }}>
        <SuccessScreen onLogout={handleLogout} />
      </div>
    );
  }

  if (guardedView === "login") {
    return (
      <div style={{ animation: "view-enter 0.48s cubic-bezier(.16,1,.3,1) both" }}>
        <LoginFlow onLoggedIn={handleLoggedIn} />
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
