import { useState, useEffect } from "react";

interface Props {
  onBack?: () => void;
}

export function LoginPage({ onBack: _onBack }: Props) {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme:dark)").matches
  );
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [emailFocused, setEF]     = useState(false);
  const [passwordFocused, setPF]  = useState(false);
  const [errors, setErrors]       = useState<{ email?: string; pw?: string }>({});
  const [loading, setLoading]     = useState(false);
  const [btnScale, setBtnScale]   = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h  = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!email.trim())       e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Enter a valid email";
    if (!password)           e.pw = "Password is required";
    else if (password.length < 6) e.pw = "At least 6 characters";
    setErrors(e);
    return !e.email && !e.pw;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
  }

  /* ── Tokens ── */
  const emailActive    = emailFocused    || !!email;
  const passwordActive = passwordFocused || !!password;

  const bg = dark
    ? "#06051C"
    : "linear-gradient(145deg,#EBEBFF 0%,#F2F1FF 22%,#F8F8FF 52%,#FEFEFF 100%)";

  const orb1 = dark ? "rgba(79,70,229,0.38)"  : "rgba(79,70,229,0.15)";
  const orb2 = dark ? "rgba(107,99,240,0.22)" : "rgba(107,99,240,0.11)";
  const orb3 = dark ? "rgba(55,48,163,0.18)"  : "rgba(79,70,229,0.08)";

  const headClr = dark ? "rgba(238,237,255,0.97)" : "#0C0A1E";
  const subClr  = dark ? "rgba(200,197,245,0.48)" : "rgba(13,11,30,0.42)";

  const accent      = dark ? "#8078F2" : "#4F46E5";
  const accentBtn   = dark
    ? "linear-gradient(135deg,#6A62EE 0%,#4C44C8 100%)"
    : "linear-gradient(135deg,#5F58EE 0%,#3E37C0 100%)";
  const accentShadow = dark
    ? "0 10px 36px rgba(79,70,229,0.55), 0 3px 10px rgba(79,70,229,0.3)"
    : "0 8px 28px rgba(79,70,229,0.38), 0 2px 8px rgba(79,70,229,0.18)";

  const idleLabelClr = dark ? "rgba(200,197,245,0.38)" : "rgba(13,11,30,0.36)";
  const inputTextClr = dark ? "rgba(238,237,255,0.92)" : "#0C0A1E";
  const baseLine     = dark ? "rgba(255,255,255,0.1)"  : "rgba(13,11,30,0.12)";
  const iconIdleClr  = dark ? "rgba(200,197,245,0.32)" : "rgba(13,11,30,0.28)";
  const errorClr     = dark ? "#F87171" : "#DC2626";
  const placeholderC = dark ? "rgba(200,197,245,0.2)"  : "rgba(13,11,30,0.22)";
  const forgotClr    = dark ? "#9992F5" : "#4F46E5";
  const divClr       = dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.1)";
  const divTxtClr    = dark ? "rgba(200,197,245,0.28)" : "rgba(13,11,30,0.3)";
  const toggleBorder = dark ? "rgba(255,255,255,0.1)"  : "rgba(13,11,30,0.12)";
  const toggleBg     = dark ? "rgba(255,255,255,0.05)" : "rgba(13,11,30,0.04)";
  const signupLinkClr = dark ? "#9992F5" : "#4F46E5";

  function labelStyle(active: boolean, focused: boolean, hasError: boolean): React.CSSProperties {
    return {
      position: "absolute",
      left: 0,
      top: active ? 0 : 24,
      fontSize: active ? 10 : 15.5,
      fontWeight: active ? 700 : 400,
      letterSpacing: active ? "0.09em" : "-0.01em",
      textTransform: active ? "uppercase" : "none",
      color: hasError ? errorClr : focused ? accent : active ? (dark ? "rgba(200,197,245,0.55)" : "rgba(13,11,30,0.5)") : idleLabelClr,
      transition: "top 0.24s cubic-bezier(0.22,1,0.36,1), font-size 0.24s cubic-bezier(0.22,1,0.36,1), color 0.2s, letter-spacing 0.24s, font-weight 0.2s",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    };
  }

  function sweepStyle(focused: boolean, hasError: boolean): React.CSSProperties {
    return {
      position: "absolute",
      bottom: 0, left: 0,
      height: 2, borderRadius: 2,
      width: focused ? "100%" : "0%",
      background: hasError ? errorClr : accent,
      transition: "width 0.34s cubic-bezier(0.22,1,0.36,1)",
    };
  }

  function iconColor(active: boolean, focused: boolean, hasError: boolean) {
    if (hasError) return errorClr;
    if (focused)  return accent;
    if (active)   return dark ? "rgba(200,197,245,0.55)" : "rgba(13,11,30,0.5)";
    return iconIdleClr;
  }

  return (
    <div style={{
      width: "100vw", height: "100dvh", overflow: "hidden",
      background: bg, position: "relative",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* ── Atmospheric orbs ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Top-right glow */}
        <div className="auth-orb-a" style={{
          position: "absolute",
          width: "80vw", height: "80vw", maxWidth: 560, maxHeight: 560,
          top: "-24%", right: "-18%",
          borderRadius: "50%",
          background: `radial-gradient(circle,${orb1} 0%,transparent 66%)`,
          filter: "blur(1px)",
        }} />
        {/* Bottom-left glow */}
        <div className="auth-orb-b" style={{
          position: "absolute",
          width: "65vw", height: "65vw", maxWidth: 420, maxHeight: 420,
          bottom: "-16%", left: "-18%",
          borderRadius: "50%",
          background: `radial-gradient(circle,${orb2} 0%,transparent 65%)`,
          filter: "blur(1px)",
        }} />
        {/* Center subtle glow */}
        <div className="auth-orb-c" style={{
          position: "absolute",
          width: "50vw", height: "50vw", maxWidth: 340, maxHeight: 340,
          top: "30%", left: "30%",
          borderRadius: "50%",
          background: `radial-gradient(circle,${orb3} 0%,transparent 65%)`,
        }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "flex-end",
        padding: "clamp(16px,4vw,22px) clamp(20px,5vw,28px)",
        flexShrink: 0,
      }}>
        <button
          onClick={() => setDark(v => !v)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: `1px solid ${toggleBorder}`,
            background: toggleBg,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          {dark
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill={iconIdleClr} />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={iconIdleClr} strokeWidth="2" strokeLinecap="round" />
              </svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={iconIdleClr} />
              </svg>
          }
        </button>
      </header>

      {/* ── Centered form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        padding: "0 clamp(28px,8vw,44px) clamp(20px,5vw,40px)",
      }}>
        <div style={{ width: "100%", maxWidth: 348 }}>

          {/* Heading */}
          <div className="auth-item auth-d0">
            <h1 style={{
              fontSize: "clamp(34px,8vw,42px)", fontWeight: 800,
              letterSpacing: "-0.045em", lineHeight: 1.05,
              color: headClr, margin: "0 0 10px",
            }}>Login</h1>
          </div>
          <div className="auth-item auth-d1" style={{ marginBottom: "clamp(36px,9vw,52px)" }}>
            <p style={{
              fontSize: 15, color: subClr,
              lineHeight: 1.5, margin: 0,
              letterSpacing: "-0.01em",
            }}>Enter your credentials to continue</p>
          </div>

          {/* ── Email field ── */}
          <div className="auth-item auth-d2" style={{ marginBottom: "clamp(28px,6vw,38px)" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              {/* Icon */}
              <div style={{
                paddingBottom: 12, flexShrink: 0,
                transition: "color 0.22s",
                color: iconColor(emailActive, emailFocused, !!errors.email),
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              {/* Label + input + line */}
              <div style={{ flex: 1, position: "relative", paddingTop: 22 }}>
                <label style={labelStyle(emailActive, emailFocused, !!errors.email)}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                  onFocus={() => setEF(true)}
                  onBlur={() => setEF(false)}
                  autoComplete="email"
                  style={{
                    display: "block", width: "100%", boxSizing: "border-box",
                    background: "none", border: "none",
                    borderBottom: `1.5px solid ${errors.email ? errorClr : baseLine}`,
                    outline: "none", borderRadius: 0,
                    fontSize: 15.5, color: inputTextClr,
                    paddingBottom: 10, fontFamily: "inherit",
                    letterSpacing: "-0.01em",
                    WebkitAppearance: "none",
                    transition: "border-color 0.22s",
                  }}
                />
                <div style={sweepStyle(emailFocused, !!errors.email)} />
              </div>
            </div>
            {errors.email && (
              <p style={{ margin: "6px 0 0 30px", fontSize: 12, color: errorClr, letterSpacing: "-0.01em" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* ── Password field ── */}
          <div className="auth-item auth-d3">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              {/* Icon */}
              <div style={{
                paddingBottom: 12, flexShrink: 0,
                transition: "color 0.22s",
                color: iconColor(passwordActive, passwordFocused, !!errors.pw),
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              {/* Label + input + line */}
              <div style={{ flex: 1, position: "relative", paddingTop: 22 }}>
                <label style={labelStyle(passwordActive, passwordFocused, !!errors.pw)}>
                  Password
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, pw: undefined })); }}
                    onFocus={() => setPF(true)}
                    onBlur={() => setPF(false)}
                    autoComplete="current-password"
                    style={{
                      flex: 1, minWidth: 0,
                      background: "none", border: "none",
                      outline: "none", borderRadius: 0,
                      fontSize: 15.5, color: inputTextClr,
                      paddingBottom: 10, fontFamily: "inherit",
                      letterSpacing: "-0.01em",
                      WebkitAppearance: "none",
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    paddingBottom: 10, paddingLeft: 8,
                    display: "flex", alignItems: "center",
                    color: iconIdleClr,
                    opacity: 0.5, transition: "opacity 0.15s",
                    flexShrink: 0,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
                  >
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
                            stroke="currentColor" strokeWidth="1.7" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                    }
                  </button>
                </div>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "1.5px",
                  background: errors.pw ? errorClr : baseLine,
                  transition: "background 0.22s",
                }} />
                <div style={sweepStyle(passwordFocused, !!errors.pw)} />
              </div>
            </div>
            {errors.pw && (
              <p style={{ margin: "6px 0 0 30px", fontSize: 12, color: errorClr, letterSpacing: "-0.01em" }}>
                {errors.pw}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div className="auth-item auth-d4" style={{
            display: "flex", justifyContent: "flex-end",
            margin: "16px 0 clamp(28px,7vw,40px)",
          }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: forgotClr, fontWeight: 500,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
            }}>
              Forgot password?
            </button>
          </div>

          {/* Sign In button */}
          <div className="auth-item auth-d4">
            <button
              type="button"
              onPointerDown={() => setBtnScale(0.968)}
              onPointerUp={() => { setBtnScale(1); handleLogin(); }}
              onPointerLeave={() => setBtnScale(1)}
              disabled={loading}
              style={{
                width: "100%", height: 52,
                borderRadius: 14, border: "none",
                cursor: loading ? "default" : "pointer",
                background: accentBtn,
                color: "#fff",
                fontSize: 16, fontWeight: 700,
                letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${btnScale})`,
                transition: "transform 0.14s cubic-bezier(0.22,1,0.36,1), opacity 0.14s, box-shadow 0.22s",
                opacity: loading ? 0.72 : 1,
                boxShadow: loading ? "none" : accentShadow,
                fontFamily: "inherit",
                WebkitAppearance: "none",
              }}>
              {loading ? <Spinner /> : "Sign In"}
            </button>
          </div>

          {/* Divider */}
          <div className="auth-item auth-d5" style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "24px 0 20px",
          }}>
            <div style={{ flex: 1, height: 1, background: divClr }} />
            <span style={{ fontSize: 12, color: divTxtClr, fontWeight: 500, letterSpacing: "0.04em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: divClr }} />
          </div>

          {/* Sign Up */}
          <div className="auth-item auth-d6" style={{ textAlign: "center" }}>
            <span style={{ fontSize: 14.5, color: subClr, letterSpacing: "-0.01em" }}>
              Don't have an account?{" "}
            </span>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14.5, color: signupLinkClr, fontWeight: 600,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
            }}>
              Sign Up
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${placeholderC}; }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }} />
  );
}
