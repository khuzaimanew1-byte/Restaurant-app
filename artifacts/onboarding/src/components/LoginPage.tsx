import { useState, useEffect } from "react";

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
  const [entered, setEntered] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 30);
    return () => clearTimeout(t);
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
    else if (!email.includes("@")) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
  }

  const d = {
    bg: dark
      ? "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1040 0%, #0a0a14 60%, #060610 100%)"
      : "radial-gradient(ellipse 80% 60% at 50% 0%, #e8e0ff 0%, #f0f4ff 50%, #f5f5fa 100%)",
    glass: dark
      ? "rgba(255,255,255,0.04)"
      : "rgba(255,255,255,0.72)",
    glassBorder: dark
      ? "rgba(255,255,255,0.09)"
      : "rgba(255,255,255,0.9)",
    inputBg: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    inputBgFocus: dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)",
    text: dark ? "#f5f5f7" : "#1d1d1f",
    subtext: dark ? "rgba(245,245,247,0.5)" : "rgba(29,29,31,0.45)",
    icon: dark ? "rgba(245,245,247,0.35)" : "rgba(29,29,31,0.3)",
    border: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    borderFocus: "#5856D6",
    error: "#FF3B30",
    btnBg: dark
      ? "linear-gradient(145deg, #7c7aff 0%, #5856D6 100%)"
      : "linear-gradient(145deg, #7c7aff 0%, #5856D6 100%)",
    btnSecBg: "transparent",
    btnSecBorder: dark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.11)",
    btnSecText: "#5856D6",
    shadow: dark
      ? "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
      : "0 24px 60px rgba(88,86,214,0.12), 0 0 0 1px rgba(255,255,255,0.9)",
    glow: dark
      ? "0 0 80px rgba(88,86,214,0.25)"
      : "0 0 60px rgba(88,86,214,0.08)",
    iconBg: dark
      ? "linear-gradient(145deg, #2d2b5e, #1e1c40)"
      : "linear-gradient(145deg, #7c7aff, #5856D6)",
  };

  return (
    <div style={{
      width: "100vw",
      height: "100dvh",
      background: d.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Ambient orbs */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400,
          background: dark
            ? "radial-gradient(ellipse, rgba(88,86,214,0.25) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(88,86,214,0.12) 0%, transparent 70%)",
          filter: "blur(1px)",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "10%",
          width: 300, height: 300,
          background: dark
            ? "radial-gradient(ellipse, rgba(124,122,255,0.12) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(124,122,255,0.07) 0%, transparent 70%)",
        }} />
      </div>

      {/* Top row — back + toggle */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px",
      }}>
        <IconBtn onClick={onBack} dark={dark} icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke={d.subtext} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        } />
        <IconBtn onClick={() => setDark(v => !v)} dark={dark} icon={
          dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4.5" fill={d.subtext} />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={d.subtext} strokeWidth="2" strokeLinecap="round" />
              </svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={d.subtext} />
              </svg>
        } />
      </div>

      {/* Card */}
      <div style={{
        width: "min(420px, calc(100vw - 32px))",
        background: d.glass,
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: `1px solid ${d.glassBorder}`,
        borderRadius: 28,
        padding: "36px 32px 32px",
        boxShadow: `${d.shadow}, ${d.glow}`,
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
        transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Logo — centered */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: d.iconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: dark
              ? "0 8px 32px rgba(88,86,214,0.4), inset 0 1px 0 rgba(255,255,255,0.12)"
              : "0 8px 24px rgba(88,86,214,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" />
              <path d="M12 6.5v5.5l3.5 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          textAlign: "center",
          fontSize: 26, fontWeight: 700,
          letterSpacing: "-0.035em", lineHeight: 1.1,
          color: d.text, margin: "0 0 6px",
        }}>Welcome back</h1>
        <p style={{
          textAlign: "center",
          fontSize: 14, color: d.subtext,
          lineHeight: 1.5, margin: "0 0 30px",
          letterSpacing: "-0.01em",
        }}>Sign in to your account to continue</p>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
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
                padding: "15px 16px 15px 46px",
                background: emailFocused ? d.inputBgFocus : d.inputBg,
                border: `1.5px solid ${errors.email ? d.error : emailFocused ? d.borderFocus : "transparent"}`,
                borderRadius: 14, fontSize: 15,
                color: d.text,
                outline: "none",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
                transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                WebkitAppearance: "none",
              }}
            />
            <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "opacity 0.2s" }}
              width="17" height="17" viewBox="0 0 24 24" fill="none" opacity={emailFocused ? 0.7 : 0.35}>
              <rect x="2" y="4" width="20" height="16" rx="3" stroke={d.text} strokeWidth="1.7" />
              <path d="M2 8l10 7 10-7" stroke={d.text} strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          {errors.email && (
            <p style={{ margin: "6px 4px 0", fontSize: 12, color: d.error, letterSpacing: "-0.01em" }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 26 }}>
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
                padding: "15px 48px 15px 46px",
                background: passwordFocused ? d.inputBgFocus : d.inputBg,
                border: `1.5px solid ${errors.password ? d.error : passwordFocused ? d.borderFocus : "transparent"}`,
                borderRadius: 14, fontSize: 15,
                color: d.text,
                outline: "none",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
                transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                WebkitAppearance: "none",
              }}
            />
            <svg style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "opacity 0.2s" }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" opacity={passwordFocused ? 0.7 : 0.35}>
              <rect x="5" y="11" width="14" height="10" rx="2.5" stroke={d.text} strokeWidth="1.7" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke={d.text} strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              style={{
                position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.35, transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.65")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.35")}
            >
              {showPw
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke={d.text} strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke={d.text} strokeWidth="1.7" />
                    <circle cx="12" cy="12" r="3" stroke={d.text} strokeWidth="1.7" />
                  </svg>
              }
            </button>
          </div>
          {errors.password && (
            <p style={{ margin: "6px 4px 0", fontSize: 12, color: d.error, letterSpacing: "-0.01em" }}>{errors.password}</p>
          )}
        </div>

        {/* Log In button */}
        <button
          type="button"
          onPointerDown={() => setBtnPressed(true)}
          onPointerUp={() => { setBtnPressed(false); handleLogin(); }}
          onPointerLeave={() => setBtnPressed(false)}
          disabled={loading}
          style={{
            width: "100%", height: 52,
            borderRadius: 14, border: "none",
            cursor: loading ? "default" : "pointer",
            background: d.btnBg,
            color: "#fff",
            fontSize: 16, fontWeight: 600,
            letterSpacing: "-0.02em",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: btnPressed ? "scale(0.968)" : "scale(1)",
            transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), opacity 0.15s",
            opacity: loading ? 0.75 : 1,
            boxShadow: "0 4px 24px rgba(88,86,214,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            fontFamily: "inherit",
          }}>
          {loading
            ? <Spinner />
            : "Sign In"
          }
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: d.border }} />
          <span style={{ fontSize: 12, color: d.subtext, letterSpacing: "0.03em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: d.border }} />
        </div>

        {/* Create account button */}
        <button
          type="button"
          style={{
            width: "100%", height: 52,
            borderRadius: 14,
            border: `1.5px solid ${d.btnSecBorder}`,
            background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
            cursor: "pointer",
            color: d.btnSecText,
            fontSize: 16, fontWeight: 600,
            letterSpacing: "-0.02em",
            fontFamily: "inherit",
            transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.95)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)";
          }}
        >
          Create an Account
        </button>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${dark ? "rgba(245,245,247,0.28)" : "rgba(29,29,31,0.28)"}; }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 19, height: 19, borderRadius: "50%",
      border: "2.2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function IconBtn({ onClick, dark, icon }: { onClick?: () => void; dark: boolean; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: "50%", border: "none",
        cursor: "pointer",
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      }}
    >
      {icon}
    </button>
  );
}
