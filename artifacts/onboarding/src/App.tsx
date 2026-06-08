import { useState, useEffect } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SuccessPage } from "./components/SuccessPage";
import { validateSession, logoutSession } from "./lib/api";
import { useDarkMode } from "./lib/shared";

type Screen = "onboarding" | "login" | "success";
interface AuthResult { email: string; role: string; }

const TOKEN_KEY = "att_tok";
function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
function setToken(t: string)       { localStorage.setItem(TOKEN_KEY, t); }
function clearToken()              { localStorage.removeItem(TOKEN_KEY); }

function parseHash(): Screen {
  const h = window.location.hash;
  if (h.startsWith("#/login"))   return "login";
  if (h.startsWith("#/success")) return "success";
  return "onboarding";
}

function push(screen: Screen) {
  const hash =
    screen === "login"   ? "#/login"   :
    screen === "success" ? "#/success" :
    "#/onboarding/1";
  history.pushState(null, "", hash);
}

function CheckingScreen() {
  const [dark] = useDarkMode();
  return (
    <div style={{
      width: "100vw", height: "100dvh",
      background: dark ? "#03021A" : "#F4F3FF",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: `3px solid ${dark ? "rgba(167,139,250,0.15)" : "rgba(79,70,229,0.12)"}`,
        borderTopColor: dark ? "#8078F2" : "#4F46E5",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const [screen,   setScreen]   = useState<Screen>("onboarding");
  const [auth,     setAuth]     = useState<AuthResult | null>(null);
  const [checking, setChecking] = useState(() => !!getToken());

  useEffect(() => {
    /* ── Session check on boot ── */
    async function boot() {
      const token = getToken();
      if (!token) {
        const s = parseHash();
        history.replaceState(null, "", s === "onboarding" ? "#/onboarding/1" : window.location.hash);
        setScreen(s);
        setChecking(false);
        return;
      }
      try {
        const s = await validateSession(token);
        setAuth({ email: s.email, role: s.role });
        history.replaceState(null, "", "#/success");
        setScreen("success");
      } catch {
        clearToken();
        const s = parseHash();
        setScreen(s === "success" ? "onboarding" : s);
      } finally {
        setChecking(false);
      }
    }
    boot();

    /* ── Back / Forward (popstate) — the ONLY navigation listener ── */
    const onPop = () => {
      if (getToken()) {
        history.replaceState(null, "", "#/success");
        setScreen("success");
        return;
      }
      const s = parseHash();
      setScreen(s === "success" ? "onboarding" : s);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function goTo(s: Screen) {
    push(s);
    setScreen(s);
  }

  function handleSuccess(email: string, role: string, sessionToken: string) {
    setToken(sessionToken);
    setAuth({ email, role });
    push("success");
    setScreen("success");
  }

  async function handleLogout() {
    const token = getToken();
    clearToken();
    setAuth(null);
    history.pushState(null, "", "#/onboarding/1");
    setScreen("onboarding");
    if (token) logoutSession(token);
  }

  if (checking) return <CheckingScreen />;

  return (
    <>
      {screen === "onboarding" && <OnboardingFlow onGetStarted={() => goTo("login")} />}
      {screen === "login"      && <LoginPage onSuccess={handleSuccess} />}
      {screen === "success"    && <SuccessPage email={auth?.email} role={auth?.role} onLogout={handleLogout} />}
    </>
  );
}
