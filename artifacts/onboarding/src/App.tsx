import { useState } from "react";
import { OnboardingFlow }  from "./components/OnboardingFlow";
import { LoginFlow }       from "./components/LoginFlow";
import { ResetPasswordScreen } from "./components/LoginFlow";
import { AdminDashboard }  from "./components/AdminDashboard";

type View = "onboarding" | "login" | "admin" | "new-password" | "add-employee";

const SESSION_KEY = "reset_token";

function getInitialView(): View {
  const path = window.location.pathname;
  if (localStorage.getItem("auth_token")) {
    window.history.replaceState({}, "", "/admin/dashboard");
    return "admin";
  }
  if (path === "/login") return "login";
  if (path.startsWith("/admin")) {
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

function AddEmployeePlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div className="admin">
      <header className="admin-bar">
        <button className="admin-bar__back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back</span>
        </button>
        <span className="admin-bar__title">Add Employee</span>
      </header>
      <main className="admin-content admin-content--center">
        <p className="admin-feedback__head">Coming soon</p>
        <p className="admin-feedback__sub">Employee creation form will be here</p>
      </main>
    </div>
  );
}

export default function App() {
  const [view,    setView]    = useState<View>(getInitialView);
  const [viewDir, setViewDir] = useState<"fwd" | "back">("fwd");
  const [slide,   setSlide]   = useState(() => {
    const m = window.location.pathname.match(/^\/onboarding\/(\d+)$/);
    return m ? Math.max(0, Math.min(parseInt(m[1]!), 2)) : 0;
  });

  const token       = localStorage.getItem("auth_token");
  const guardedView: View = token
    ? (view === "add-employee" ? "add-employee" : "admin")
    : (["admin", "add-employee"].includes(view) ? "login" : view);

  const goTo = (v: View, dir: "fwd" | "back" = "fwd") => {
    const paths: Record<View, string> = {
      onboarding:      "/",
      login:           "/login",
      admin:           "/admin/dashboard",
      "new-password":  "/new-password",
      "add-employee":  "/admin/employees/new",
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

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    goTo("login", "back");
  };

  const viewClass = `view-${viewDir}`;

  if (guardedView === "admin") return (
    <div className={viewClass}>
      <AdminDashboard
        onLogout={handleLogout}
        onAddEmployee={() => goTo("add-employee", "fwd")}
      />
    </div>
  );

  if (guardedView === "add-employee") return (
    <div className={viewClass}>
      <AddEmployeePlaceholder onBack={() => goTo("admin", "back")} />
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
        onLoggedIn={() => goTo("admin", "fwd")}
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
