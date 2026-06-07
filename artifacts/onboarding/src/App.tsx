import { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";

type Screen = "onboarding" | "login" | "signup";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  return (
    <>
      {screen === "onboarding" && (
        <OnboardingFlow onGetStarted={() => setScreen("login")} />
      )}
      {screen === "login" && (
        <LoginPage
          onBack={() => setScreen("onboarding")}
          onSignup={() => setScreen("signup")}
        />
      )}
      {screen === "signup" && (
        <SignupPage onBack={() => setScreen("login")} />
      )}
    </>
  );
}
