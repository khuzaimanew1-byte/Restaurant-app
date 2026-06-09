import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SuccessPage } from "./components/SuccessPage";
import { validateSession, logoutSession } from "./lib/api";
import { useDarkMode } from "./lib/shared";

type Screen = "onboarding" | "signin" | "success";
interface AuthResult { email: string; role: string; }

const TOKEN_KEY  = "att_tok";
const getToken   = (): string | null => localStorage.getItem(TOKEN_KEY);
const setToken   = (t: string) => localStorage.setItem(TOKEN_KEY, t);
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
  const [screen, setScreen] = useState<Screen>(() => {
    if (getToken()) return "onboarding"; // checking state — session query will resolve
    const r = parsePath();
    return r.screen === "success" ? "onboarding" : r.screen;
  });
  const [slide,  setSlide]  = useState(() => parsePath().slide);
  const [auth,   setAuth]   = useState<AuthResult | null>(null);
  const queryClient = useQueryClient();

  // ── Session validation query ──────────────────────────────────────
  const token = getToken();

  const sessionQuery = useQuery({
    queryKey:  ["auth-session", token],
    queryFn:   () => validateSession(token!),
    enabled:   !!token,
    retry:     false,
    staleTime: 5 * 60 * 1_000,
    gcTime:    10 * 60 * 1_000,
  });

  // Derive checking state — show spinner while token is being validated
  const checking = !!token && sessionQuery.isPending;

  // React to session query outcome
  useEffect(() => {
    if (!token) {
      const r = parsePath();
      if (r.screen === "success") {
        nav("/onboarding/0", true);
        setScreen("onboarding");
        setSlide(0);
      } else {
        setScreen(r.screen);
        setSlide(r.slide);
      }
      return;
    }
    if (sessionQuery.isPending) return;

    if (sessionQuery.isSuccess) {
      setAuth({ email: sessionQuery.data.email, role: sessionQuery.data.role });
      nav("/success", true);
      setScreen("success");
    } else if (sessionQuery.isError) {
      clearToken();
      queryClient.removeQueries({ queryKey: ["auth-session"] });
      const r = parsePath();
      setScreen(r.screen === "success" ? "onboarding" : r.screen);
      setSlide(r.slide);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sessionQuery.isPending, sessionQuery.isSuccess, sessionQuery.isError]);

  // Browser back/forward
  useEffect(() => {
    const onPop = () => {
      if (getToken()) { nav("/success", true); setScreen("success"); return; }
      const r = parsePath();
      setScreen(r.screen === "success" ? "onboarding" : r.screen);
      setSlide(r.slide);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── Logout mutation ──────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: (t: string) => logoutSession(t),
  });

  function goSignin() {
    nav("/signin");
    setScreen("signin");
  }

  function handleSuccess(email: string, role: string, sessionToken: string) {
    setToken(sessionToken);
    setAuth({ email, role });
    queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    nav("/success");
    setScreen("success");
  }

  function handleLogout() {
    const t = getToken();
    clearToken();
    setAuth(null);
    queryClient.removeQueries({ queryKey: ["auth-session"] });
    nav("/signin");
    setScreen("signin");
    if (t) logoutMutation.mutate(t);
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
