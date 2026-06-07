import { useState, useEffect, useRef } from "react";

interface Props {
  onBack?: () => void;
}

export function LoginPage({ onBack: _onBack }: Props) {
  const [dark, setDark]       = useState(() => window.matchMedia("(prefers-color-scheme:dark)").matches);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail]     = useState("");
  const [password, setPw]     = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [emailF, setEF]       = useState(false);
  const [pwF, setPwF]         = useState(false);
  const [errors, setErrors]   = useState<{ email?: string; pw?: string }>({});
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 35);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h  = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* ── Staggered entrance ── */
  function rise(i: number): React.CSSProperties {
    const d = `${i * 0.075}s`;
    return {
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${d},
                   transform 0.65s cubic-bezier(0.22,1,0.36,1) ${d}`,
    };
  }

  function validate() {
    const e: typeof errors = {};
    if (!email.trim())             e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Enter a valid email";
    if (!password)                 e.pw    = "Password is required";
    else if (password.length < 6)  e.pw    = "At least 6 characters";
    setErrors(e);
    return !e.email && !e.pw;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
  }

  /* ── Design tokens ── */
  const lightBg = "linear-gradient(145deg,#C8C3FF 0%,#D9D5FF 12%,#E5E2FF 28%,#EDEAFF 45%,#F4F3FF 62%,#F9F9FF 80%,#FFFFFF 100%)";
  const o1 = dark ? "rgba(79,70,229,0.45)"  : "rgba(79,70,229,0.32)";
  const o2 = dark ? "rgba(107,99,240,0.28)" : "rgba(107,99,240,0.24)";
  const o3 = dark ? "rgba(55,48,163,0.22)"  : "rgba(55,48,163,0.15)";

  const headClr   = dark ? "rgba(238,237,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.46)" : "rgba(13,11,30,0.44)";
  const accent    = dark ? "#7C74F0"                 : "#4F46E5";
  const accentBtn = dark ? "linear-gradient(135deg,#6E67F0,#4B44C5)"
                         : "linear-gradient(135deg,#635CEE,#3E37BE)";
  const btnShadow = dark ? "0 12px 40px rgba(79,70,229,0.55),0 2px 8px rgba(79,70,229,0.3)"
                         : "0 8px 28px rgba(79,70,229,0.40),0 2px 6px rgba(79,70,229,0.18)";
  const errClr    = dark ? "#F87171"                  : "#DC2626";
  const forgotClr = dark ? "#9992F5"                  : "#4F46E5";
  const divClr    = dark ? "rgba(255,255,255,0.08)"  : "rgba(13,11,30,0.1)";
  const divTxt    = dark ? "rgba(200,197,245,0.28)"  : "rgba(13,11,30,0.3)";
  const tglBorder = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.13)";
  const tglBg     = dark ? "rgba(255,255,255,0.05)"  : "rgba(255,255,255,0.65)";
  const linkClr   = dark ? "#9992F5"                  : "#4F46E5";
  const idleIcon  = dark ? "rgba(200,197,245,0.32)"  : "rgba(13,11,30,0.3)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)"  : "#09071E";

  /* Input box styles */
  function box(focused: boolean, hasErr: boolean): React.CSSProperties {
    const borderClr = hasErr
      ? errClr
      : focused
        ? accent
        : dark ? "rgba(255,255,255,0.09)" : "rgba(79,70,229,0.14)";

    const glow = hasErr
      ? (dark ? "0 0 0 3px rgba(248,113,113,0.22)" : "0 0 0 3px rgba(220,38,38,0.14)")
      : focused
        ? (dark ? "0 0 0 3px rgba(79,70,229,0.28)" : "0 0 0 3px rgba(79,70,229,0.14)")
        : "none";

    const bg = dark
      ? "rgba(255,255,255,0.07)"
      : "rgba(255,255,255,0.7)";

    return {
      display: "flex", alignItems: "center", gap: 10,
      height: 52, borderRadius: 13,
      background: bg,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1.5px solid ${borderClr}`,
      boxShadow: focused || hasErr
        ? `${glow}, 0 1px 3px rgba(0,0,0,0.06)`
        : `0 1px 2px rgba(0,0,0,0.04)`,
      padding: "0 14px",
      transition: "border-color 0.2s ease, box-shadow 0.22s ease, background 0.18s ease",
      cursor: "text",
    };
  }

  /* Label above input */
  function lbl(focused: boolean, hasErr: boolean): React.CSSProperties {
    return {
      display: "block",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.09em",
      textTransform: "uppercase",
      color: hasErr ? errClr : focused ? accent : idleIcon,
      marginBottom: 7,
      transition: "color 0.2s ease",
      lineHeight: 1,
    };
  }

  return (
    <div style={{
      width: "100vw", height: "100dvh", overflow: "hidden",
      background: dark ? "#06051C" : lightBg,
      position: "relative",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* ── Atmospheric orbs ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="auth-orb-a" style={{
          position: "absolute",
          width: "85vw", height: "85vw", maxWidth: 580, maxHeight: 580,
          top: "-22%", right: "-20%", borderRadius: "50%",
          background: `radial-gradient(circle,${o1} 0%,transparent 65%)`,
        }}/>
        <div className="auth-orb-b" style={{
          position: "absolute",
          width: "70vw", height: "70vw", maxWidth: 440, maxHeight: 440,
          bottom: "-18%", left: "-20%", borderRadius: "50%",
          background: `radial-gradient(circle,${o2} 0%,transparent 65%)`,
        }}/>
        <div className="auth-orb-c" style={{
          position: "absolute",
          width: "55vw", height: "55vw", maxWidth: 360, maxHeight: 360,
          top: "35%", left: "22%", borderRadius: "50%",
          background: `radial-gradient(circle,${o3} 0%,transparent 65%)`,
        }}/>
      </div>

      {/* ── Header ── */}
      <header style={{
        position: "relative", zIndex: 10, flexShrink: 0,
        display: "flex", justifyContent: "flex-end",
        padding: "clamp(16px,4vw,22px) clamp(20px,5vw,28px)",
        ...rise(0),
      }}>
        <button
          onClick={() => setDark(v => !v)}
          aria-label="Toggle theme"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: `1px solid ${tglBorder}`, background: tglBg,
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>
          {dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill={idleIcon}/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={idleIcon} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={idleIcon}/>
              </svg>
          }
        </button>
      </header>

      {/* ── Centered form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        padding: "0 clamp(28px,8vw,48px) clamp(12px,3vw,28px)",
      }}>
        <div style={{ width: "100%", maxWidth: 340 }}>

          {/* Heading */}
          <div style={{ marginBottom: 6, ...rise(1) }}>
            <h1 style={{
              fontSize: "clamp(36px,9vw,44px)", fontWeight: 800,
              letterSpacing: "-0.05em", lineHeight: 1.04,
              color: headClr, margin: 0,
            }}>Login</h1>
          </div>
          <div style={{ marginBottom: "clamp(32px,8vw,48px)", ...rise(2) }}>
            <p style={{
              fontSize: 15, color: subClr, lineHeight: 1.5,
              margin: 0, letterSpacing: "-0.01em",
            }}>Enter your credentials to continue</p>
          </div>

          {/* ══ Email ══ */}
          <div style={{ marginBottom: 18, ...rise(3) }}>
            <label
              htmlFor="email-input"
              style={lbl(emailF, !!errors.email)}
            >
              Email Address
            </label>
            <div
              style={box(emailF, !!errors.email)}
              onClick={() => emailRef.current?.focus()}
            >
              {/* Icon */}
              <span style={{
                flexShrink: 0, lineHeight: 0,
                color: emailF ? accent : errors.email ? errClr : idleIcon,
                transition: "color 0.2s ease",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3"
                    stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M2 8l10 7 10-7"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              {/* Input */}
              <input
                id="email-input"
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                onFocus={() => setEF(true)}
                onBlur={() => setEF(false)}
                placeholder="you@company.com"
                autoComplete="email"
                style={{
                  flex: 1, minWidth: 0,
                  background: "none", border: "none", outline: "none",
                  fontSize: 15, color: inputTxt,
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  WebkitAppearance: "none",
                }}
              />
            </div>
            {errors.email && (
              <p style={{ margin: "6px 0 0 2px", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* ══ Password ══ */}
          <div style={{ ...rise(4) }}>
            <label
              htmlFor="pw-input"
              style={lbl(pwF, !!errors.pw)}
            >
              Password
            </label>
            <div style={box(pwF, !!errors.pw)}>
              {/* Icon */}
              <span style={{
                flexShrink: 0, lineHeight: 0,
                color: pwF ? accent : errors.pw ? errClr : idleIcon,
                transition: "color 0.2s ease",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2.5"
                    stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M8 11V7a4 4 0 018 0v4"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              {/* Input */}
              <input
                id="pw-input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPw(e.target.value); setErrors(v => ({ ...v, pw: undefined })); }}
                onFocus={() => setPwF(true)}
                onBlur={() => setPwF(false)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  flex: 1, minWidth: 0,
                  background: "none", border: "none", outline: "none",
                  fontSize: 15, color: inputTxt,
                  fontFamily: "inherit", letterSpacing: showPw ? "-0.01em" : "0.12em",
                  WebkitAppearance: "none",
                }}
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{
                  flexShrink: 0, background: "none", border: "none",
                  cursor: "pointer", padding: 0, lineHeight: 0,
                  color: idleIcon, opacity: 0.55,
                  transition: "opacity 0.16s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}
              >
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
                        stroke="currentColor" strokeWidth="1.7"/>
                      <circle cx="12" cy="12" r="3"
                        stroke="currentColor" strokeWidth="1.7"/>
                    </svg>
                }
              </button>
            </div>
            {errors.pw && (
              <p style={{ margin: "6px 0 0 2px", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>
                {errors.pw}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div style={{
            display: "flex", justifyContent: "flex-end",
            margin: "12px 0 clamp(24px,6vw,36px)",
            ...rise(5),
          }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: forgotClr, fontWeight: 500,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
            }}>Forgot password?</button>
          </div>

          {/* Sign In */}
          <div style={{ ...rise(5) }}>
            <button
              type="button"
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => { setPressed(false); handleLogin(); }}
              onPointerLeave={() => setPressed(false)}
              disabled={loading}
              style={{
                width: "100%", height: 52,
                borderRadius: 13, border: "none",
                cursor: loading ? "default" : "pointer",
                background: accentBtn, color: "#fff",
                fontSize: 15.5, fontWeight: 700, letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: pressed ? "scale(0.968)" : "scale(1)",
                transition: "transform 0.14s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, opacity 0.14s",
                opacity: loading ? 0.72 : 1,
                boxShadow: loading ? "none" : btnShadow,
                fontFamily: "inherit",
              }}>
              {loading ? <Spinner /> : "Sign In"}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "20px 0 16px",
            ...rise(6),
          }}>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
            <span style={{ fontSize: 11.5, color: divTxt, fontWeight: 500, letterSpacing: "0.04em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
          </div>

          {/* Sign Up */}
          <div style={{ textAlign: "center", ...rise(6) }}>
            <span style={{ fontSize: 14.5, color: subClr, letterSpacing: "-0.01em" }}>
              Don't have an account?{" "}
            </span>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14.5, color: linkClr, fontWeight: 600,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
            }}>Sign Up</button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder {
          color: ${dark ? "rgba(200,197,245,0.22)" : "rgba(13,11,30,0.22)"};
          letter-spacing: normal;
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 19, height: 19, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.28)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }}/>
  );
}
