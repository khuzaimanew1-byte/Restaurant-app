import { useState, useEffect } from "react";

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
  const [btnScale, setBS]     = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 40);
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
    const d = `${i * 0.08}s`;
    return {
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0px)" : "translateY(18px)",
      transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${d}, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${d}`,
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

  /* ── Tokens ── */
  const emailActive = emailF || !!email;
  const pwActive    = pwF    || !!password;

  const lightBg   = "linear-gradient(145deg,#C8C3FF 0%,#D9D5FF 12%,#E5E2FF 28%,#EDEAFF 45%,#F4F3FF 62%,#F9F9FF 80%,#FFFFFF 100%)";
  const o1        = dark ? "rgba(79,70,229,0.42)"  : "rgba(79,70,229,0.30)";
  const o2        = dark ? "rgba(107,99,240,0.26)" : "rgba(107,99,240,0.22)";
  const o3        = dark ? "rgba(55,48,163,0.20)"  : "rgba(55,48,163,0.14)";
  const headClr   = dark ? "rgba(238,237,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.46)" : "rgba(13,11,30,0.46)";
  const accent    = dark ? "#8078F2"                 : "#4F46E5";
  const accentBtn = dark ? "linear-gradient(135deg,#6E67F0 0%,#4B44C5 100%)"
                         : "linear-gradient(135deg,#635CEE 0%,#3E37BE 100%)";
  const btnShadow = dark ? "0 12px 40px rgba(79,70,229,0.6),0 4px 12px rgba(79,70,229,0.35)"
                         : "0 8px 30px rgba(79,70,229,0.42),0 2px 8px rgba(79,70,229,0.22)";
  const baseLine  = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.14)";
  const idleLbl   = dark ? "rgba(200,197,245,0.38)"  : "rgba(13,11,30,0.38)";
  const activeLbl = dark ? "rgba(200,197,245,0.62)"  : "rgba(13,11,30,0.55)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)"  : "#09071E";
  const phClr     = dark ? "rgba(200,197,245,0.18)"  : "rgba(13,11,30,0.2)";
  const errClr    = dark ? "#F87171"                  : "#DC2626";
  const forgotClr = dark ? "#9992F5"                  : "#4F46E5";
  const divClr    = dark ? "rgba(255,255,255,0.08)"  : "rgba(13,11,30,0.1)";
  const divTxt    = dark ? "rgba(200,197,245,0.28)"  : "rgba(13,11,30,0.32)";
  const tglBorder = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.14)";
  const tglBg     = dark ? "rgba(255,255,255,0.05)"  : "rgba(255,255,255,0.6)";
  const linkClr   = dark ? "#9992F5"                  : "#4F46E5";

  /*
   * Field layout (64px tall, no icon):
   *
   *  ┌──────────────────────────────────┐  0px
   *  │  EMAIL ADDRESS  ← 10px, top: 2  │  (active)
   *  │                                  │
   *  │  Email address  ← 15.5px        │  (idle, top: 32 = center of input)
   *  │  [input text                 ]  │  input: bottom 0, h=34, pb=10
   *  │  ──────────────────────────────  │  underline
   *  └──────────────────────────────────┘  64px
   *
   *  Idle label center = 64 - 34/2 - 10/2 = 64 - 22 = 42px from top
   *  → top = 42 - fontSize/2 = 42 - 7.75 ≈ 34
   */
  const FIELD_H     = 64;
  const INPUT_H     = 34;
  const INPUT_PB    = 10;
  const IDLE_TOP    = FIELD_H - (INPUT_H / 2) - (INPUT_PB / 2) - 8; // ≈ 33

  function labelStyle(active: boolean, focused: boolean, err: boolean): React.CSSProperties {
    return {
      position:      "absolute",
      left:          0,
      top:           active ? 2 : IDLE_TOP,
      fontSize:      active ? 10.5 : 15.5,
      fontWeight:    active ? 700 : 400,
      letterSpacing: active ? "0.09em" : "-0.015em",
      textTransform: active ? "uppercase" : "none" as const,
      lineHeight:    1,
      whiteSpace:    "nowrap" as const,
      pointerEvents: "none" as const,
      color:         err ? errClr : focused ? accent : active ? activeLbl : idleLbl,
      /* each property transitions independently → no snapping */
      transition: [
        "top 0.28s cubic-bezier(0.22,1,0.36,1)",
        "font-size 0.28s cubic-bezier(0.22,1,0.36,1)",
        "font-weight 0.22s ease",
        "letter-spacing 0.28s cubic-bezier(0.22,1,0.36,1)",
        "color 0.22s ease",
      ].join(", "),
    };
  }

  function sweepLine(focused: boolean, err: boolean): React.CSSProperties {
    return {
      position:   "absolute",
      bottom:     0, left: 0,
      height:     2, borderRadius: 2,
      width:      focused ? "100%" : "0%",
      background: err ? errClr : accent,
      transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
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

      {/* Orbs */}
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

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10, flexShrink: 0,
        display: "flex", justifyContent: "flex-end",
        padding: "clamp(16px,4vw,22px) clamp(20px,5vw,28px)",
        ...rise(0),
      }}>
        <button onClick={() => setDark(v => !v)} style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${tglBorder}`, background: tglBg,
          backdropFilter: "blur(8px)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>
          {dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill={idleLbl}/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke={idleLbl} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={idleLbl}/>
              </svg>
          }
        </button>
      </header>

      {/* Form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        padding: "0 clamp(28px,8vw,48px) clamp(16px,4vw,32px)",
      }}>
        <div style={{ width: "100%", maxWidth: 340 }}>

          {/* Heading */}
          <div style={{ marginBottom: 8, ...rise(1) }}>
            <h1 style={{
              fontSize: "clamp(36px,9vw,44px)", fontWeight: 800,
              letterSpacing: "-0.05em", lineHeight: 1.04,
              color: headClr, margin: 0,
            }}>Login</h1>
          </div>
          <div style={{ marginBottom: "clamp(40px,10vw,54px)", ...rise(2) }}>
            <p style={{
              fontSize: 15, color: subClr, lineHeight: 1.5,
              margin: 0, letterSpacing: "-0.01em",
            }}>Enter your credentials to continue</p>
          </div>

          {/* ── Email ── */}
          <div style={{ marginBottom: "clamp(20px,5vw,28px)", ...rise(3) }}>
            <div style={{ position: "relative", height: FIELD_H }}>

              <label style={labelStyle(emailActive, emailF, !!errors.email)}>
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                onFocus={() => setEF(true)}
                onBlur={()  => setEF(false)}
                autoComplete="email"
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: INPUT_H,
                  background: "none", border: "none", outline: "none", borderRadius: 0,
                  fontSize: 15.5, color: inputTxt, paddingBottom: INPUT_PB,
                  fontFamily: "inherit", letterSpacing: "-0.015em",
                  WebkitAppearance: "none", boxSizing: "border-box",
                }}
              />

              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
                background: errors.email ? errClr : baseLine,
                transition: "background 0.22s ease",
              }}/>
              <div style={sweepLine(emailF, !!errors.email)}/>
            </div>
            {errors.email && (
              <p style={{ margin: "5px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div style={{ ...rise(4) }}>
            <div style={{ position: "relative", height: FIELD_H }}>

              <label style={labelStyle(pwActive, pwF, !!errors.pw)}>
                Password
              </label>

              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPw(e.target.value); setErrors(v => ({ ...v, pw: undefined })); }}
                onFocus={() => setPwF(true)}
                onBlur={()  => setPwF(false)}
                autoComplete="current-password"
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 34,
                  height: INPUT_H,
                  background: "none", border: "none", outline: "none", borderRadius: 0,
                  fontSize: 15.5, color: inputTxt, paddingBottom: INPUT_PB,
                  fontFamily: "inherit", letterSpacing: "-0.015em",
                  WebkitAppearance: "none", boxSizing: "border-box",
                }}
              />

              {/* Show / Hide toggle */}
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{
                  position: "absolute", right: 0,
                  bottom: INPUT_PB + (INPUT_H - INPUT_PB) / 2 - 9,
                  width: 18, height: 18,
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: pwF ? accent : idleLbl,
                  opacity: 0.55,
                  transition: "color 0.22s ease, opacity 0.18s ease",
                  padding: 0,
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
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.7"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/>
                    </svg>
                }
              </button>

              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
                background: errors.pw ? errClr : baseLine,
                transition: "background 0.22s ease",
              }}/>
              <div style={sweepLine(pwF, !!errors.pw)}/>
            </div>
            {errors.pw && (
              <p style={{ margin: "5px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>
                {errors.pw}
              </p>
            )}
          </div>

          {/* Forgot */}
          <div style={{
            display: "flex", justifyContent: "flex-end",
            margin: "14px 0 clamp(28px,7vw,38px)",
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
              onPointerDown={() => setBS(0.967)}
              onPointerUp={() => { setBS(1); handleLogin(); }}
              onPointerLeave={() => setBS(1)}
              disabled={loading}
              style={{
                width: "100%", height: 52, borderRadius: 14, border: "none",
                cursor: loading ? "default" : "pointer",
                background: accentBtn, color: "#fff",
                fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${btnScale})`,
                transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, opacity 0.15s",
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
            margin: "22px 0 18px",
            ...rise(6),
          }}>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
            <span style={{ fontSize: 12, color: divTxt, fontWeight: 500, letterSpacing: "0.04em" }}>or</span>
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
        input::placeholder { color: ${phClr}; }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }}/>
  );
}
