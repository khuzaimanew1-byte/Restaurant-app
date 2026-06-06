import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";

type Screen = "onboarding" | "login";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  return (
    <>
      {screen === "onboarding" && (
        <OnboardingFlow onGetStarted={() => setScreen("login")} />
      )}
      {screen === "login" && (
        <LoginPage onBack={() => setScreen("onboarding")} />
      )}
    </>
  );
}
