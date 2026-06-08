import { useState, useEffect } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SuccessPage } from "./components/SuccessPage";

type Screen = "onboarding" | "login" | "success";

interface AuthResult { email: string; role: string; }

function hashToScreen(): Screen {
  const h = window.location.hash;
  if (h === "#/login") return "login";
  if (h === "#/success") return "success";
  return "onboarding";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(hashToScreen);
  const [authResult, setAuth] = useState<AuthResult | null>(null);

  useEffect(() => {
    const onHash = () => setScreen(hashToScreen());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function goTo(s: Screen) {
    window.location.hash = s === "login" ? "/login" : s === "success" ? "/success" : "/";
    setScreen(s);
  }

  function handleSuccess(email: string, role: string) {
    setAuth({ email, role });
    goTo("success");
  }

  return (
    <>
      {screen === "onboarding" && <OnboardingFlow onGetStarted={() => goTo("login")} />}
      {screen === "login"      && <LoginPage onSuccess={handleSuccess} />}
      {screen === "success"    && <SuccessPage email={authResult?.email} role={authResult?.role} />}
    </>
  );
}
