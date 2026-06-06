import { useState, useEffect, useRef } from "react";

interface Props {
  onBack?: () => void;
}

export function LoginPage({ onBack }: Props) {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme:dark)").matches
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "in">("idle");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [btnScale, setBtnScale] = useState(1);

  useEffect(() => {
    const t = requestAnimationFrame(() => setTimeout(() => setPhase("in"), 20));
    return () => cancelAnimationFrame(t as unknown as number);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
  }

  // Apple design tokens
  const t = {
    bg:           dark ? "#000000"                    : "#f5f5f7",
    text:         dark ? "#f5f5f7"                    : "#1d1d1f",
    textSub:      dark ? "rgba(235,235,245,0.45)"     : "rgba(60,60,67,0.45)",
    textTer:      dark ? "rgba(235,235,245,0.3)"      : "rgba(60,60,67,0.3)",
    fieldBg:      dark ? "rgba(255,255,255,0.08)"     : "rgba(0,0,0,0.055)",
    fieldBgFocus: dark ? "rgba(255,255,255,0.12)"     : "rgba(0,0,0,0.08)",
    fieldText:    dark ? "#f5f5f7"                    : "#1d1d1f",
    placeholder:  dark ? "rgba(235,235,245,0.28)"     : "rgba(60,60,67,0.3)",
    separator:    dark ? "rgba(255,255,255,0.1)"      : "rgba(0,0,0,0.1)",
    blue:         "#007AFF",
    btnFg:        "#ffffff",
    iconBg:       dark ? "#1c1c1e"                    : "#ffffff",
    iconShadow:   dark ? "0 2px 16px rgba(0,0,0,.6)" : "0 2px 20px rgba(0,0,0,.12)",
    errorFg:      dark ? "#FF453A"                    : "#FF3B30",
  };

  const entered = phase === "in";

  return (
    <div style={{
      width: "100vw",
      height: "100dvh",
      background: t.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Top controls */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 20px",
      }}>
        <PillBtn onClick={onBack} color={t.fieldBg}>
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
            <path d="M16 10H4M10 4l-6 6 6 6" stroke={t.textSub} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, color: t.textSub, fontWeight: 500, letterSpacing: "-.01em" }}>Back</span>
        </PillBtn>
        <button onClick={() => setDark(v => !v)} style={{
          background: t.fieldBg, border: "none", cursor: "pointer",
          width: 32, height: 32, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}>
          {dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4.5" fill={t.textSub} />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={t.textSub} strokeWidth="2" strokeLinecap="round" />
              </svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={t.textSub} />
              </svg>
          }
        </button>
      </div>

      {/* Main content — no card, just floating elements */}
      <div style={{
        width: "min(380px, calc(100vw - 48px))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* App icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: t.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: t.iconShadow,
          marginBottom: 22,
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.82)",
          transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1) 0.06s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.06s",
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.5" stroke={t.blue} strokeWidth="1.5" />
            <path d="M12 7v5.25l3.25 1.75" stroke={t.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 30, fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1.08,
          color: t.text, margin: "0 0 8px",
          textAlign: "center",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s",
        }}>
          Welcome Back
        </h1>
        <p style={{
          fontSize: 15, color: t.textSub,
          lineHeight: 1.45, margin: "0 0 34px",
          textAlign: "center",
          letterSpacing: "-0.015em",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1) 0.14s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.14s",
        }}>
          Sign in to your account to continue
        </p>

        {/* Fields */}
        <div style={{
          width: "100%",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s",
        }}>

          {/* Email field */}
          <div style={{ marginBottom: errors.email ? 6 : 10 }}>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="Email"
                autoComplete="email"
                style={{
                  width: "100%", boxSizing: "border-box",
                  height: 52,
                  padding: "0 16px 0 44px",
                  background: emailFocused ? t.fieldBgFocus : t.fieldBg,
                  border: `2px solid ${errors.email ? t.errorFg : emailFocused ? t.blue : "transparent"}`,
                  borderRadius: 13,
                  fontSize: 16, color: t.fieldText,
                  outline: "none",
                  fontFamily: "inherit",
                  letterSpacing: "-0.015em",
                  transition: "border-color 0.18s, background 0.18s",
                  WebkitAppearance: "none",
                }}
              />
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "opacity 0.18s" }}
                width="17" height="17" viewBox="0 0 24 24" fill="none"
                opacity={emailFocused ? 0.55 : 0.3}>
                <rect x="2" y="4" width="20" height="16" rx="3" stroke={t.text} strokeWidth="1.7" />
                <path d="M2 8l10 7 10-7" stroke={t.text} strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            {errors.email && (
              <p style={{ margin: "5px 4px 0", fontSize: 12.5, color: t.errorFg, letterSpacing: "-0.01em" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div style={{ marginBottom: errors.password ? 6 : 0 }}>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Password"
                autoComplete="current-password"
                style={{
                  width: "100%", boxSizing: "border-box",
                  height: 52,
                  padding: "0 48px 0 44px",
                  background: passwordFocused ? t.fieldBgFocus : t.fieldBg,
                  border: `2px solid ${errors.password ? t.errorFg : passwordFocused ? t.blue : "transparent"}`,
                  borderRadius: 13,
                  fontSize: 16, color: t.fieldText,
                  outline: "none",
                  fontFamily: "inherit",
                  letterSpacing: "-0.015em",
                  transition: "border-color 0.18s, background 0.18s",
                  WebkitAppearance: "none",
                }}
              />
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "opacity 0.18s" }}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                opacity={passwordFocused ? 0.55 : 0.3}>
                <rect x="5" y="11" width="14" height="10" rx="2.5" stroke={t.text} strokeWidth="1.7" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke={t.text} strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <button type="button" onClick={() => setShowPw(s => !s)} style={{
                position: "absolute", right: 0, top: 0, bottom: 0,
                width: 46, background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.32, transition: "opacity 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.32")}
              >
                {showPw
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke={t.text} strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke={t.text} strokeWidth="1.7" />
                      <circle cx="12" cy="12" r="3" stroke={t.text} strokeWidth="1.7" />
                    </svg>
                }
              </button>
            </div>
            {errors.password && (
              <p style={{ margin: "5px 4px 0", fontSize: 12.5, color: t.errorFg, letterSpacing: "-0.01em" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, marginBottom: 26 }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13.5, color: t.blue, fontWeight: 500,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: "2px 0",
            }}>
              Forgot Password?
            </button>
          </div>

          {/* Sign In button */}
          <button
            type="button"
            onPointerDown={() => setBtnScale(0.966)}
            onPointerUp={() => { setBtnScale(1); handleLogin(); }}
            onPointerLeave={() => setBtnScale(1)}
            disabled={loading}
            style={{
              width: "100%", height: 54,
              borderRadius: 14,
              border: "none",
              cursor: loading ? "default" : "pointer",
              background: t.blue,
              color: t.btnFg,
              fontSize: 17, fontWeight: 600,
              letterSpacing: "-0.025em",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${btnScale})`,
              transition: "transform 0.14s cubic-bezier(0.22,1,0.36,1), opacity 0.14s",
              opacity: loading ? 0.72 : 1,
              fontFamily: "inherit",
              WebkitAppearance: "none",
              marginBottom: 16,
            }}>
            {loading ? <Spinner /> : "Sign In"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: t.separator }} />
            <span style={{ fontSize: 12, color: t.textTer, letterSpacing: "0.02em", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: t.separator }} />
          </div>

          {/* Create account — text link only, Apple style */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 15, color: t.textSub, letterSpacing: "-0.015em" }}>
              Don't have an account?{" "}
            </span>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 15, color: t.blue, fontWeight: 600,
              fontFamily: "inherit", letterSpacing: "-0.015em",
              padding: 0, display: "inline",
            }}>
              Sign Up
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="email"]::placeholder,
        input[type="password"]::placeholder,
        input[type="text"]::placeholder {
          color: ${t.placeholder};
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.35)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }} />
  );
}

function PillBtn({ onClick, color, children }: { onClick?: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5,
      height: 32, padding: "0 12px 0 8px",
      background: color, border: "none",
      borderRadius: 999, cursor: "pointer",
    }}>
      {children}
    </button>
  );
}
