import { useState } from "react";
import { OnboardingFlow }    from "./components/OnboardingFlow";
import { LoginFlow }         from "./components/LoginFlow";
import { ResetPasswordScreen } from "./components/LoginFlow";
import { AdminDashboard }    from "./components/AdminDashboard";

type View = "onboarding" | "login" | "admin-dashboard" | "new-password";

const SESSION_KEY = "reset_token";

function getInitialView(): View {
  const path = window.location.pathname;
  if (localStorage.getItem("auth_token")) {
    window.history.replaceState({}, "", "/admin/dashboard");
    return "admin-dashboard";
  }
  if (path === "/login") return "login";
  if (path === "/admin/dashboard") {
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
  const [view, setView]       = useState<View>(getInitialView);
  const [viewDir, setViewDir] = useState<"fwd" | "back">("fwd");
  const [slide, setSlide]     = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    return m ? Math.max(0, Math.min(parseInt(m[1]!), 2)) : 0;
  });

  const token        = localStorage.getItem("auth_token");
  const guardedView: View = token
    ? "admin-dashboard"
    : view === "admin-dashboard" ? "login" : view;

  const goTo = (v: View, dir: "fwd" | "back" = "fwd") => {
    const paths: Record<View, string> = {
      onboarding:        "/",
      login:             "/login",
      "admin-dashboard": "/admin/dashboard",
      "new-password":    "/new-password",
    };
    navigate(paths[v]);
    setViewDir(dir);
    setView(v);
  };

  const handleResetVerified = (resetToken: string) => {
    sessionStorage.setItem(SESSION_KEY, resetToken);
    goTo("new-password", "fwd");
  };

  const leaveNewPassword = () => {
    sessionStorage.removeItem(SESSION_KEY);
    goTo("login", "back");
  };

  const viewClass = `view-${viewDir}`;

  if (guardedView === "admin-dashboard") return (
    <div className={viewClass}>
      <AdminDashboard
        onLogout={() => {
          localStorage.removeItem("auth_token");
          goTo("login", "back");
        }}
      />
    </div>
  );

  if (guardedView === "new-password") {
    const resetToken = sessionStorage.getItem(SESSION_KEY);
    if (!resetToken) { goTo("login", "back"); return null; }
    return (
      <div className={viewClass}>
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
    <div className={viewClass}>
      <LoginFlow
        onLoggedIn={() => goTo("admin-dashboard", "fwd")}
        onResetVerified={handleResetVerified}
      />
    </div>
  );

  return (
    <OnboardingFlow
      initialSlide={slide}
      onSlideChange={n => setSlide(n)}
      onGetStarted={() => goTo("login", "fwd")}
    />
  );
}
