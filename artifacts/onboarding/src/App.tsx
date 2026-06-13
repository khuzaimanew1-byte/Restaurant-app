import { useState } from "react";
import { OnboardingFlow }    from "./components/OnboardingFlow";
import { LoginFlow }         from "./components/LoginFlow";
import { ResetPasswordScreen } from "./components/LoginFlow";

type View = "onboarding" | "login" | "success" | "new-password";

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

const SESSION_KEY = "reset_token";

function getInitialView(): View {
  const path = window.location.pathname;
  if (localStorage.getItem("auth_token")) {
    window.history.replaceState({}, "", "/success");
    return "success";
  }
  if (path === "/login") return "login";
  if (path === "/success") {
    window.history.replaceState({}, "", "/login");
    return "login";
  }
  if (path === "/new-password") {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      window.history.replaceState({}, "", "/login");
      return "login";
    }
    return "new-password";
  }
  return "onboarding";
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
}

export default function App() {
  const [view, setView] = useState<View>(getInitialView);
  const [slide, setSlide] = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    return m ? Math.max(0, Math.min(parseInt(m[1]!), 2)) : 0;
  });

  const token       = localStorage.getItem("auth_token");
  const guardedView: View = token
    ? "success"
    : view === "success" ? "login" : view;

  const goTo = (v: View) => {
    const paths: Record<View, string> = {
      onboarding: "/",
      login:      "/login",
      success:    "/success",
      "new-password": "/new-password",
    };
    navigate(paths[v]);
    setView(v);
  };

  const handleResetVerified = (resetToken: string) => {
    sessionStorage.setItem(SESSION_KEY, resetToken);
    goTo("new-password");
  };

  const leaveNewPassword = () => {
    sessionStorage.removeItem(SESSION_KEY);
    goTo("login");
  };

  if (guardedView === "success") return (
    <div className="view-enter">
      <SuccessScreen onLogout={() => { localStorage.removeItem("auth_token"); goTo("login"); }} />
    </div>
  );

  if (guardedView === "new-password") {
    const resetToken = sessionStorage.getItem(SESSION_KEY);
    if (!resetToken) { goTo("login"); return null; }
    return (
      <div className="view-enter">
        <div className="login">
          <div className="ob__bg-glow" />
          <div className="login__inner">
            <ResetPasswordScreen
              resetToken={resetToken}
              enterDir="fwd"
              onBack={leaveNewPassword}
              onDone={leaveNewPassword}
            />
          </div>
        </div>
      </div>
    );
  }

  if (guardedView === "login") return (
    <div className="view-enter">
      <LoginFlow
        onLoggedIn={() => goTo("success")}
        onResetVerified={handleResetVerified}
      />
    </div>
  );

  return (
    <OnboardingFlow
      initialSlide={slide}
      onSlideChange={n => setSlide(n)}
      onGetStarted={() => goTo("login")}
    />
  );
}
