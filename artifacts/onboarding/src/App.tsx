import { useState, lazy, Suspense } from "react";

/* ── Route-level code splitting ─────────────────────────────────────────────
   Every top-level page is lazy-loaded so the initial JS bundle only contains
   the router shell. Chunks are loaded on first navigation to that route and
   then cached. Never import page components eagerly at the top of App.tsx.  */
const WelcomeFlow = lazy(() =>
  import("./components/WelcomeFlow").then(m => ({ default: m.WelcomeFlow }))
);
const LoginFlow = lazy(() =>
  import("./components/LoginFlow").then(m => ({ default: m.LoginFlow }))
);
const ResetPasswordScreen = lazy(() =>
  import("./components/LoginFlow").then(m => ({ default: m.ResetPasswordScreen }))
);
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard }))
);

type View = "onboarding" | "login" | "admin-dashboard" | "new-password";

const SESSION_KEY = "reset_token";
const AUTH_KEY    = "auth_token";

function getValidToken(): string | null {
  const token = localStorage.getItem(AUTH_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!)) as { exp?: number };
    if (payload.exp && Date.now() / 1000 >= payload.exp) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

function getInitialView(): View {
  const path = window.location.pathname;
  if (getValidToken()) {
    if (!path.startsWith("/admin/")) {
      window.history.replaceState({}, "", "/admin/dashboard");
    }
    return "admin-dashboard";
  }
  if (path === "/login") return "login";
  if (path.startsWith("/admin/")) {
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

  const token        = getValidToken();
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

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    goTo("login", "back");
  };

  const viewClass = `view-${viewDir}`;

  if (guardedView === "admin-dashboard") return (
    <div className={viewClass}>
      <Suspense fallback={<div className="adm-lazy-fallback" />}>
        <AdminDashboard onLogout={handleLogout} />
      </Suspense>
    </div>
  );

  if (guardedView === "new-password") {
    const resetToken = sessionStorage.getItem(SESSION_KEY);
    if (!resetToken) { goTo("login", "back"); return null; }
    return (
      <div className={viewClass}>
        <Suspense fallback={<div className="adm-lazy-fallback" />}>
          <ResetPasswordScreen
            resetToken={resetToken}
            enterDir="fwd"
            onBack={leaveNewPassword}
            onDone={leaveNewPassword}
          />
        </Suspense>
      </div>
    );
  }

  if (guardedView === "login") return (
    <div className={viewClass}>
      <Suspense fallback={<div className="adm-lazy-fallback" />}>
        <LoginFlow
          onLoggedIn={() => goTo("admin-dashboard", "fwd")}
          onResetVerified={handleResetVerified}
        />
      </Suspense>
    </div>
  );

  return (
    <Suspense fallback={<div className="adm-lazy-fallback" />}>
      <WelcomeFlow
        initialSlide={slide}
        onSlideChange={n => setSlide(n)}
        onGetStarted={() => goTo("login", "fwd")}
      />
    </Suspense>
  );
}
