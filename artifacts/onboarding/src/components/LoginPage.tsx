import { useState, useEffect } from "react";
import { getTokens } from "../lib/colors";

interface Props {
  onBack?: () => void;
}

export function LoginPage({ onBack: _onBack }: Props) {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme:dark)").matches
  );
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading]   = useState(false);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [btnScale, setBtnScale] = useState(1);
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(id);
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

  const c = getTokens(dark);

  /* ── Derived auth-specific tokens ── */
  const authBg       = dark ? "#06051A" : "#F6F5FF";
  const orbColor1    = dark ? "rgba(79,70,229,0.32)"  : "rgba(79,70,229,0.13)";
  const orbColor2    = dark ? "rgba(99,88,255,0.18)"  : "rgba(120,113,238,0.09)";
  const orbColor3    = dark ? "rgba(55,48,163,0.22)"  : "rgba(79,70,229,0.07)";
  const headingColor = dark ? "rgba(238,237,255,0.96)" : "#0D0B1E";
  const subColor     = dark ? "rgba(200,197,245,0.5)"  : "rgba(13,11,30,0.44)";
  const labelColor   = dark ? "rgba(200,197,245,0.38)" : "rgba(13,11,30,0.36)";
  const inputTextCol = dark ? "rgba(238,237,255,0.92)" : "#0D0B1E";
  const ulineDefault = dark ? "rgba(255,255,255,0.12)" : "rgba(13,11,30,0.14)";
  const ulineAccent  = dark ? "#7872F0" : "#4F46E5";
  const ulineError   = dark ? "#F87171" : "#DC2626";
  const iconMuted    = dark ? "rgba(200,197,245,0.3)"  : "rgba(13,11,30,0.28)";
  const iconActive   = dark ? "#7872F0" : "#4F46E5";
  const placeholderCol = dark ? "rgba(200,197,245,0.28)" : "rgba(13,11,30,0.28)";
  const forgotColor  = dark ? "#9D98F5" : "#4F46E5";
  const dividerColor = dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.1)";
  const dividerText  = dark ? "rgba(200,197,245,0.28)" : "rgba(13,11,30,0.3)";
  const signupText   = dark ? "rgba(200,197,245,0.45)" : "rgba(13,11,30,0.44)";

  const btnBg  = dark ? "linear-gradient(135deg,#5E57F0 0%,#4338CA 100%)"
                      : "linear-gradient(135deg,#6560EE 0%,#4338CA 100%)";
  const btnShadow = dark
    ? "0 8px 32px rgba(79,70,229,0.55), 0 2px 8px rgba(79,70,229,0.3)"
    : "0 6px 24px rgba(79,70,229,0.38), 0 2px 6px rgba(79,70,229,0.2)";

  return (
    <div style={{
      width: "100vw", height: "100dvh", overflow: "hidden",
      background: authBg, position: "relative",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* ── Atmospheric orbs ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Primary orb — top-center */}
        <div className="auth-orb-a" style={{
          position: "absolute",
          width: "70vw", height: "70vw",
          maxWidth: 520, maxHeight: 520,
          top: "-18%", left: "50%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle,${orbColor1} 0%,transparent 68%)`,
          filter: "blur(2px)",
        }} />
        {/* Secondary orb — bottom-left */}
        <div className="auth-orb-b" style={{
          position: "absolute",
          width: "55vw", height: "55vw",
          maxWidth: 380, maxHeight: 380,
          bottom: "-12%", left: "-15%",
          borderRadius: "50%",
          background: `radial-gradient(circle,${orbColor2} 0%,transparent 65%)`,
          filter: "blur(2px)",
        }} />
        {/* Tertiary orb — bottom-right */}
        <div className="auth-orb-c" style={{
          position: "absolute",
          width: "40vw", height: "40vw",
          maxWidth: 280, maxHeight: 280,
          bottom: "5%", right: "-8%",
          borderRadius: "50%",
          background: `radial-gradient(circle,${orbColor3} 0%,transparent 65%)`,
          filter: "blur(2px)",
        }} />
        {/* Noise grain overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
          opacity: dark ? 0.55 : 0.3,
          mixBlendMode: "overlay",
        }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "clamp(16px,4vw,24px) clamp(20px,5vw,32px)",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 15, fontWeight: 600, letterSpacing: "0.02em",
          color: dark ? "rgba(200,197,245,0.55)" : "rgba(13,11,30,0.4)",
          textTransform: "uppercase",
        }}>
          Login
        </span>
        <button
          onClick={() => setDark(v => !v)}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(13,11,30,0.1)"}`,
            background: dark ? "rgba(255,255,255,0.05)" : "rgba(13,11,30,0.04)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          {dark
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill={iconMuted} />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={iconMuted} strokeWidth="2" strokeLinecap="round" />
              </svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={iconMuted} />
              </svg>
          }
        </button>
      </header>

      {/* ── Centered form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        padding: "0 clamp(28px,8vw,40px)",
      }}>
        <div style={{
          width: "100%", maxWidth: 360,
          opacity: ready ? 1 : 0,
          transform: ready ? "none" : "translateY(16px)",
          transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}>

          {/* Title block */}
          <div className="auth-row" style={{ animationDelay: "0.05s", marginBottom: 8 }}>
            <h1 style={{
              fontSize: "clamp(28px,7vw,34px)", fontWeight: 800,
              letterSpacing: "-0.04em", lineHeight: 1.08,
              color: headingColor, margin: 0,
            }}>
              Welcome back
            </h1>
          </div>
          <div className="auth-row" style={{ animationDelay: "0.1s", marginBottom: "clamp(36px,8vw,48px)" }}>
            <p style={{
              fontSize: 15, color: subColor,
              lineHeight: 1.5, margin: 0,
              letterSpacing: "-0.01em",
            }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Email */}
          <div className="auth-row" style={{ animationDelay: "0.16s", marginBottom: "clamp(22px,5vw,30px)" }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: emailFocused ? ulineAccent : labelColor,
              marginBottom: 10,
              transition: "color 0.2s",
            }}>Email</label>
            <div className="uline-wrap" style={{
              position: "relative",
              "--uline-accent": errors.email ? ulineError : ulineAccent,
            } as React.CSSProperties}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg style={{ flexShrink: 0, marginRight: 12, transition: "opacity 0.2s" }}
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  opacity={emailFocused ? 1 : 0.45}>
                  <rect x="2" y="4" width="20" height="16" rx="3"
                    stroke={emailFocused ? ulineAccent : iconMuted} strokeWidth="1.8" />
                  <path d="M2 8l10 7 10-7"
                    stroke={emailFocused ? ulineAccent : iconMuted} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="uline-input"
                  style={{
                    "--uline-color": errors.email ? ulineError : emailFocused ? ulineAccent : ulineDefault,
                    "--uline-accent": errors.email ? ulineError : ulineAccent,
                    height: 44, fontSize: 16,
                    letterSpacing: "-0.01em",
                    color: inputTextCol,
                    paddingBottom: 8,
                  } as React.CSSProperties}
                />
              </div>
            </div>
            {errors.email && (
              <p style={{ marginTop: 6, fontSize: 12, color: ulineError, letterSpacing: "-0.01em" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="auth-row" style={{ animationDelay: "0.22s" }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: passwordFocused ? ulineAccent : labelColor,
              marginBottom: 10,
              transition: "color 0.2s",
            }}>Password</label>
            <div className="uline-wrap" style={{
              position: "relative",
              "--uline-accent": errors.password ? ulineError : ulineAccent,
            } as React.CSSProperties}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg style={{ flexShrink: 0, marginRight: 12, transition: "opacity 0.2s" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  opacity={passwordFocused ? 1 : 0.45}>
                  <rect x="5" y="11" width="14" height="10" rx="2.5"
                    stroke={passwordFocused ? ulineAccent : iconMuted} strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 018 0v4"
                    stroke={passwordFocused ? ulineAccent : iconMuted} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="uline-input"
                  style={{
                    "--uline-color": errors.password ? ulineError : passwordFocused ? ulineAccent : ulineDefault,
                    "--uline-accent": errors.password ? ulineError : ulineAccent,
                    height: 44, fontSize: 16,
                    letterSpacing: "-0.01em",
                    color: inputTextCol,
                    paddingBottom: 8, flex: 1,
                  } as React.CSSProperties}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0 0 8px 10px", display: "flex", alignItems: "center",
                  opacity: 0.35, transition: "opacity 0.15s", flexShrink: 0,
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.35")}
                >
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                          stroke={inputTextCol} strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
                          stroke={inputTextCol} strokeWidth="1.7" />
                        <circle cx="12" cy="12" r="3" stroke={inputTextCol} strokeWidth="1.7" />
                      </svg>
                  }
                </button>
              </div>
            </div>
            {errors.password && (
              <p style={{ marginTop: 6, fontSize: 12, color: ulineError, letterSpacing: "-0.01em" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div className="auth-row" style={{
            animationDelay: "0.26s",
            display: "flex", justifyContent: "flex-end",
            marginTop: 14, marginBottom: "clamp(28px,7vw,40px)",
          }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: forgotColor, fontWeight: 500,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
            }}>
              Forgot password?
            </button>
          </div>

          {/* Sign In CTA */}
          <div className="auth-row" style={{ animationDelay: "0.30s" }}>
            <button
              type="button"
              onPointerDown={() => setBtnScale(0.968)}
              onPointerUp={() => { setBtnScale(1); handleLogin(); }}
              onPointerLeave={() => setBtnScale(1)}
              disabled={loading}
              style={{
                width: "100%", height: 52,
                borderRadius: 14,
                border: "none",
                cursor: loading ? "default" : "pointer",
                background: btnBg,
                color: "#fff",
                fontSize: 16, fontWeight: 700,
                letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${btnScale})`,
                transition: "transform 0.14s cubic-bezier(0.22,1,0.36,1), opacity 0.14s, box-shadow 0.2s",
                opacity: loading ? 0.75 : 1,
                boxShadow: loading ? "none" : btnShadow,
                fontFamily: "inherit",
                WebkitAppearance: "none",
              }}>
              {loading ? <Spinner /> : "Sign In"}
            </button>
          </div>

          {/* Divider */}
          <div className="auth-row" style={{
            animationDelay: "0.34s",
            display: "flex", alignItems: "center", gap: 12,
            marginTop: 24, marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, background: dividerColor }} />
            <span style={{ fontSize: 12, color: dividerText, fontWeight: 500, letterSpacing: "0.04em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: dividerColor }} />
          </div>

          {/* Sign Up */}
          <div className="auth-row" style={{ animationDelay: "0.38s", textAlign: "center" }}>
            <span style={{ fontSize: 14.5, color: signupText, letterSpacing: "-0.01em" }}>
              Don't have an account?{" "}
            </span>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14.5, color: dark ? "#9D98F5" : "#4F46E5", fontWeight: 600,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
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
          color: ${placeholderCol};
        }
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
