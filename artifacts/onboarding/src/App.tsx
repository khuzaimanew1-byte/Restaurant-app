import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SuccessPage } from "./components/SuccessPage";

type Screen = "onboarding" | "login" | "success";

interface AuthResult {
  email: string;
  role: string;
}

export default function App() {
  const [screen, setScreen]   = useState<Screen>("onboarding");
  const [authResult, setAuth] = useState<AuthResult | null>(null);

  function handleSuccess(email: string, role: string) {
    setAuth({ email, role });
    setScreen("success");
  }

  return (
    <>
      {screen === "onboarding" && (
        <OnboardingFlow onGetStarted={() => setScreen("login")} />
      )}
      {screen === "login" && (
        <LoginPage onSuccess={handleSuccess} />
      )}
      {screen === "success" && (
        <SuccessPage email={authResult?.email} role={authResult?.role} />
      )}
    </>
  );
}
