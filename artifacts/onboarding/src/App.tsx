import { useState, useEffect } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SuccessPage } from "./components/SuccessPage";

type Screen = "onboarding" | "login" | "success";

interface AuthResult { email: string; role: string; }

const SESSION_KEY = "att_session";

function loadSession(): AuthResult | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null"); }
  catch { return null; }
}

function saveSession(r: AuthResult) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(r));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function hashToScreen(): Screen {
  const h = window.location.hash;
  if (h === "#/login") return "login";
  if (h === "#/success") return "success";
  return "onboarding";
}

export default function App() {
  const existingSession = loadSession();

  const [screen, setScreen]   = useState<Screen>(existingSession ? "success" : hashToScreen);
  const [authResult, setAuth] = useState<AuthResult | null>(existingSession);

  useEffect(() => {
    if (loadSession()) {
      history.replaceState(null, "", "#/success");
    }

    const onHash = () => {
      if (loadSession()) {
        history.replaceState(null, "", "#/success");
        setScreen("success");
        return;
      }
      setScreen(hashToScreen());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function goTo(s: Screen) {
    window.location.hash = s === "login" ? "/login" : s === "success" ? "/success" : "/";
    setScreen(s);
  }

  function handleSuccess(email: string, role: string) {
    const r = { email, role };
    saveSession(r);
    setAuth(r);
    goTo("success");
  }

  function handleLogout() {
    clearSession();
    setAuth(null);
    window.location.hash = "/onboarding/1";
    setScreen("onboarding");
  }

  return (
    <>
      {screen === "onboarding" && <OnboardingFlow onGetStarted={() => goTo("login")} />}
      {screen === "login"      && <LoginPage onSuccess={handleSuccess} />}
      {screen === "success"    && <SuccessPage email={authResult?.email} role={authResult?.role} onLogout={handleLogout} />}
    </>
  );
}
