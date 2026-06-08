import { useState, useEffect } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SuccessPage } from "./components/SuccessPage";
import { validateSession, logoutSession } from "./lib/api";
import { useDarkMode } from "./lib/shared";

type Screen = "onboarding" | "signin" | "success";
interface AuthResult { email: string; role: string; }

const TOKEN_KEY = "att_tok";
const getToken  = (): string | null => localStorage.getItem(TOKEN_KEY);
const setToken  = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function parsePath(): { screen: Screen; slide: number } {
  const p = window.location.pathname;
  if (p === "/signin")  return { screen: "signin",  slide: 0 };
  if (p === "/success") return { screen: "success", slide: 0 };
  const m = p.match(/^\/onboarding\/(\d+)$/);
  if (m) {
    const slide = parseInt(m[1]);
    return { screen: "onboarding", slide: Math.max(0, Math.min(slide, 2)) };
  }
  return { screen: "onboarding", slide: 0 };
}

function nav(path: string, replace = false) {
  replace
    ? history.replaceState(null, "", path)
    : history.pushState(null, "", path);
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const [screen,   setScreen]   = useState<Screen>("onboarding");
  const [slide,    setSlide]    = useState(0);
  const [auth,     setAuth]     = useState<AuthResult | null>(null);
  const [checking, setChecking] = useState(() => !!getToken());

  useEffect(() => {
    async function boot() {
      const token = getToken();
      if (!token) {
        const r = parsePath();
        if (r.screen === "success") { nav("/onboarding/0", true); setScreen("onboarding"); setSlide(0); }
        else { setScreen(r.screen); setSlide(r.slide); }
        setChecking(false);
        return;
      }
      try {
        const s = await validateSession(token);
        setAuth({ email: s.email, role: s.role });
        nav("/success", true);
        setScreen("success");
      } catch {
        clearToken();
        const r = parsePath();
        setScreen(r.screen === "success" ? "onboarding" : r.screen);
        setSlide(r.slide);
      } finally {
        setChecking(false);
      }
    }
    boot();

    const onPop = () => {
      if (getToken()) { nav("/success", true); setScreen("success"); return; }
      const r = parsePath();
      setScreen(r.screen === "success" ? "onboarding" : r.screen);
      setSlide(r.slide);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function goSignin() {
    nav("/signin");
    setScreen("signin");
  }

  function handleSuccess(email: string, role: string, sessionToken: string) {
    setToken(sessionToken);
    setAuth({ email, role });
    nav("/success");
    setScreen("success");
  }

  async function handleLogout() {
    const token = getToken();
    clearToken();
    setAuth(null);
    nav("/onboarding/0");
    setScreen("onboarding");
    setSlide(0);
    if (token) logoutSession(token);
  }

  if (checking) return <CheckingScreen />;

  return (
    <>
      {screen === "onboarding" && (
        <OnboardingFlow
          initialSlide={slide}
          onSlideChange={n => setSlide(n)}
          onGetStarted={goSignin}
        />
      )}
      {screen === "signin"  && <LoginPage onSuccess={handleSuccess} />}
      {screen === "success" && <SuccessPage email={auth?.email} role={auth?.role} onLogout={handleLogout} />}
    </>
  );
}
