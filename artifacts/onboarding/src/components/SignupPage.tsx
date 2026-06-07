import { useState, useEffect, useRef } from "react";

interface Props {
  onBack?: () => void;
}

/* ── OTP Modal ───────────────────────────────────────────────────────── */
function OtpModal({
  email, dark, onClose, accent, accentBtn, btnShadow,
}: {
  email: string; dark: boolean; onClose: () => void;
  accent: string; accentBtn: string; btnShadow: string;
}) {
  const [otp, setOtp]         = useState(["","","","","",""]);
  const [visible, setVisible] = useState(false);
  const [resend, setResend]   = useState(59);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs             = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setTimeout(() => setVisible(true), 20); }, []);

  /* countdown */
  useEffect(() => {
    if (resend === 0) return;
    const id = setInterval(() => setResend(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [resend]);

  const cardBg    = dark ? "rgba(14,12,38,0.96)"  : "rgba(255,255,255,0.96)";
  const headClr   = dark ? "rgba(238,237,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.5)"  : "rgba(13,11,30,0.46)";
  const boxBorder = dark ? "rgba(255,255,255,0.13)" : "rgba(13,11,30,0.14)";
  const boxBg     = dark ? "rgba(255,255,255,0.05)" : "rgba(249,248,255,0.8)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.12)" : "rgba(79,70,229,0.07)";
  const boxTxt    = dark ? "rgba(238,237,255,0.95)" : "#09071E";
  const resendClr = dark ? "#9992F5"                 : "#4F46E5";
  const mutedClr  = dark ? "rgba(200,197,245,0.38)"  : "rgba(13,11,30,0.32)";

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[i]) {
        const next = [...otp]; next[i] = ""; setOtp(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
      }
    }
  }

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < 5) setTimeout(() => inputRefs.current[i + 1]?.focus(), 0);
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next   = [...otp];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const lastFilled = Math.min(digits.length, 5);
    setTimeout(() => inputRefs.current[lastFilled]?.focus(), 0);
  }

  async function handleVerify() {
    if (otp.join("").length < 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setVerified(true);
    setTimeout(() => onClose(), 1200);
  }

  const filled = otp.join("").length === 6;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: "0 0 env(safe-area-inset-bottom,0)",
      background: dark ? "rgba(0,0,0,0.7)" : "rgba(13,11,30,0.5)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s ease",
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        width: "100%", maxWidth: 420,
        background: cardBg,
        borderRadius: "28px 28px 0 0",
        padding: "clamp(28px,6vw,36px) clamp(24px,6vw,36px) clamp(32px,8vw,44px)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${boxBorder}`,
        borderBottom: "none",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.42s cubic-bezier(0.22,1,0.36,1)",
        boxSizing: "border-box",
      }}>

        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: dark ? "rgba(255,255,255,0.18)" : "rgba(13,11,30,0.14)",
          margin: "0 auto 28px",
        }}/>

        {verified ? (
          /* ── Success state ── */
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: `linear-gradient(135deg,${accent},#6366F1)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: btnShadow,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: headClr, margin: "0 0 8px", letterSpacing: "-0.04em" }}>
              Verified!
            </h3>
            <p style={{ fontSize: 14, color: subClr, margin: 0, letterSpacing: "-0.01em" }}>
              Account created successfully
            </p>
          </div>
        ) : (
          <>
            {/* Heading */}
            <h3 style={{
              fontSize: "clamp(22px,5vw,26px)", fontWeight: 800, color: headClr,
              margin: "0 0 8px", letterSpacing: "-0.04em",
            }}>Check your email</h3>
            <p style={{ fontSize: 14, color: subClr, margin: "0 0 32px", letterSpacing: "-0.01em", lineHeight: 1.5 }}>
              We sent a 6-digit code to{" "}
              <span style={{ color: headClr, fontWeight: 600 }}>{email || "your email"}</span>
            </p>

            {/* OTP boxes */}
            <div style={{
              display: "flex", gap: "clamp(8px,2.5vw,12px)",
              marginBottom: 28, justifyContent: "center",
            }} onPaste={handlePaste}>
              {otp.map((val, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onFocus={e => { e.target.select(); }}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  style={{
                    width: "clamp(44px,13vw,52px)",
                    height: "clamp(52px,15vw,62px)",
                    borderRadius: 12,
                    border: `1.5px solid ${val ? accent : boxBorder}`,
                    background: val ? boxFocBg : boxBg,
                    fontSize: 22, fontWeight: 700, textAlign: "center",
                    color: boxTxt,
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 0.18s ease, background 0.18s ease",
                    boxSizing: "border-box",
                    caretColor: accent,
                  }}
                />
              ))}
            </div>

            {/* Verify btn */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={!filled || loading}
              style={{
                width: "100%", height: 52, borderRadius: 14, border: "none",
                cursor: filled && !loading ? "pointer" : "default",
                background: filled ? accentBtn : dark ? "rgba(255,255,255,0.07)" : "rgba(13,11,30,0.07)",
                color: filled ? "#fff" : mutedClr,
                fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: filled && !loading ? btnShadow : "none",
                transition: "background 0.25s ease, box-shadow 0.22s ease, color 0.2s ease",
                fontFamily: "inherit",
                marginBottom: 18,
              }}>
              {loading ? <OtpSpinner /> : "Verify & Continue"}
            </button>

            {/* Resend */}
            <div style={{ textAlign: "center" }}>
              {resend > 0 ? (
                <span style={{ fontSize: 13, color: mutedClr, letterSpacing: "-0.01em" }}>
                  Resend code in <strong style={{ color: subClr }}>0:{String(resend).padStart(2,"0")}</strong>
                </span>
              ) : (
                <button
                  onClick={() => setResend(59)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: resendClr, fontWeight: 600,
                    fontFamily: "inherit", letterSpacing: "-0.01em",
                  }}>
                  Resend code
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OtpSpinner() {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }}/>
  );
}

/* ── SignupPage ──────────────────────────────────────────────────────── */
export function SignupPage({ onBack }: Props) {
  const [dark, setDark]     = useState(() => window.matchMedia("(prefers-color-scheme:dark)").matches);
  const [mounted, setMnt]   = useState(false);
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [showPw, setShowPw] = useState(false);
  const [nameF, setNF]      = useState(false);
  const [emailF, setEF]     = useState(false);
  const [pwF, setPF]        = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; pw?: string }>({});
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => { const id = setTimeout(() => setMnt(true), 40); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h  = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h); return () => mq.removeEventListener("change", h);
  }, []);

  /* Stagger */
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
    if (!name.trim())              e.name  = "Name is required";
    if (!email.trim())             e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Enter a valid email";
    if (!pw)                       e.pw    = "Password is required";
    else if (pw.length < 6)        e.pw    = "At least 6 characters";
    setErrors(e);
    return !e.name && !e.email && !e.pw;
  }

  function handleCreate() { if (validate()) setShowOtp(true); }

  /* Tokens */
  const nameActive  = nameF  || !!name;
  const emailActive = emailF || !!email;
  const pwActive    = pwF    || !!pw;

  /* Signup-specific gradient: fresh, expansive — light travels bottom-left → top-right */
  const lightBg   = "linear-gradient(155deg,#FFFFFF 0%,#F5F3FF 20%,#EDE9FE 40%,#DDD6FE 62%,#C4B5FD 82%,#A78BFA 100%)";
  const darkBg    = "linear-gradient(155deg,#04031A 0%,#07062A 45%,#0C0942 100%)";

  const o1 = dark ? "rgba(139,92,246,0.38)"  : "rgba(167,139,250,0.45)";
  const o2 = dark ? "rgba(79,70,229,0.28)"   : "rgba(109,40,217,0.22)";
  const o3 = dark ? "rgba(124,58,237,0.18)"  : "rgba(196,181,253,0.6)";

  const headClr   = dark ? "rgba(238,237,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.46)"  : "rgba(13,11,30,0.5)";
  const accent    = dark ? "#A78BFA"                  : "#7C3AED";
  const accentBtn = dark ? "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)"
                         : "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)";
  const btnShadow = dark ? "0 12px 40px rgba(139,92,246,0.55),0 4px 12px rgba(139,92,246,0.3)"
                         : "0 8px 30px rgba(109,40,217,0.38),0 2px 8px rgba(109,40,217,0.2)";
  const baseLine  = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.14)";
  const idleLbl   = dark ? "rgba(200,197,245,0.38)"  : "rgba(13,11,30,0.38)";
  const activeLbl = dark ? "rgba(200,197,245,0.62)"  : "rgba(13,11,30,0.55)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)"  : "#09071E";
  const phClr     = dark ? "rgba(200,197,245,0.18)"  : "rgba(13,11,30,0.2)";
  const errClr    = dark ? "#F87171"                   : "#DC2626";
  const tglBorder = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.14)";
  const tglBg     = dark ? "rgba(255,255,255,0.05)"  : "rgba(255,255,255,0.55)";
  const linkClr   = dark ? "#A78BFA"                  : "#7C3AED";
  const divClr    = dark ? "rgba(255,255,255,0.08)"  : "rgba(13,11,30,0.1)";
  const divTxt    = dark ? "rgba(200,197,245,0.28)"  : "rgba(13,11,30,0.32)";

  const FIELD_H  = 64;
  const INPUT_H  = 34;
  const INPUT_PB = 10;
  const IDLE_TOP = FIELD_H - (INPUT_H / 2) - (INPUT_PB / 2) - 8;

  function labelStyle(active: boolean, focused: boolean, err: boolean): React.CSSProperties {
    return {
      position: "absolute", left: 0,
      top: active ? 2 : IDLE_TOP,
      fontSize:      active ? 10.5 : 15.5,
      fontWeight:    active ? 700 : 400,
      letterSpacing: active ? "0.09em" : "-0.015em",
      textTransform: active ? "uppercase" : "none" as const,
      lineHeight: 1, whiteSpace: "nowrap" as const, pointerEvents: "none" as const,
      color: err ? errClr : focused ? accent : active ? activeLbl : idleLbl,
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
      position: "absolute", bottom: 0, left: 0,
      height: 2, borderRadius: 2,
      width: focused ? "100%" : "0%",
      background: err ? errClr : accent,
      transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
    };
  }

  const inputBase: React.CSSProperties = {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: INPUT_H,
    background: "none", border: "none", outline: "none", borderRadius: 0,
    fontSize: 15.5, color: inputTxt, paddingBottom: INPUT_PB,
    fontFamily: "inherit", letterSpacing: "-0.015em",
    WebkitAppearance: "none", boxSizing: "border-box",
  };

  const underlineBase: React.CSSProperties = {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
    transition: "background 0.22s ease",
  };

  return (
    <div style={{
      width: "100vw", height: "100dvh", overflow: "hidden",
      background: dark ? darkBg : lightBg,
      position: "relative",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* Orbs — placed at top-right and bottom-left to mirror login but feel "opening" */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="auth-orb-a" style={{
          position: "absolute",
          width: "90vw", height: "90vw", maxWidth: 620, maxHeight: 620,
          bottom: "-25%", right: "-22%", borderRadius: "50%",
          background: `radial-gradient(circle,${o1} 0%,transparent 65%)`,
        }}/>
        <div className="auth-orb-b" style={{
          position: "absolute",
          width: "70vw", height: "70vw", maxWidth: 460, maxHeight: 460,
          top: "-18%", left: "-18%", borderRadius: "50%",
          background: `radial-gradient(circle,${o2} 0%,transparent 65%)`,
        }}/>
        <div className="auth-orb-c" style={{
          position: "absolute",
          width: "60vw", height: "60vw", maxWidth: 380, maxHeight: 380,
          top: "28%", right: "10%", borderRadius: "50%",
          background: `radial-gradient(circle,${o3} 0%,transparent 65%)`,
        }}/>
      </div>

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10, flexShrink: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "clamp(16px,4vw,22px) clamp(20px,5vw,28px)",
        ...rise(0),
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${tglBorder}`, background: tglBg,
          backdropFilter: "blur(8px)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={idleLbl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button onClick={() => setDark(v => !v)} style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${tglBorder}`, background: tglBg,
          backdropFilter: "blur(8px)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
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
        position: "relative", zIndex: 1, overflowY: "auto",
        padding: "0 clamp(28px,8vw,48px) clamp(16px,4vw,32px)",
      }}>
        <div style={{ width: "100%", maxWidth: 340 }}>

          {/* Badge */}
          <div style={{ marginBottom: 14, ...rise(1) }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px 5px 8px", borderRadius: 20,
              background: dark ? "rgba(139,92,246,0.14)" : "rgba(109,40,217,0.1)",
              border: `1px solid ${dark ? "rgba(139,92,246,0.22)" : "rgba(109,40,217,0.18)"}`,
              fontSize: 12, fontWeight: 600, color: accent, letterSpacing: "0.01em",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: accent,
                boxShadow: `0 0 6px ${accent}`,
              }}/>
              New account
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 8, ...rise(2) }}>
            <h1 style={{
              fontSize: "clamp(33px,8.5vw,42px)", fontWeight: 800,
              letterSpacing: "-0.05em", lineHeight: 1.04,
              color: headClr, margin: 0,
            }}>Create account</h1>
          </div>
          <div style={{ marginBottom: "clamp(32px,8vw,46px)", ...rise(3) }}>
            <p style={{ fontSize: 15, color: subClr, lineHeight: 1.5, margin: 0, letterSpacing: "-0.01em" }}>
              Start tracking attendance in minutes
            </p>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "clamp(16px,4vw,22px)", ...rise(4) }}>
            <div style={{ position: "relative", height: FIELD_H }}>
              <label style={labelStyle(nameActive, nameF, !!errors.name)}>Full name</label>
              <input
                type="text" value={name} autoComplete="name"
                onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: undefined })); }}
                onFocus={() => setNF(true)} onBlur={() => setNF(false)}
                style={inputBase}
              />
              <div style={{ ...underlineBase, background: errors.name ? errClr : baseLine }}/>
              <div style={sweepLine(nameF, !!errors.name)}/>
            </div>
            {errors.name && <p style={{ margin: "5px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "clamp(16px,4vw,22px)", ...rise(5) }}>
            <div style={{ position: "relative", height: FIELD_H }}>
              <label style={labelStyle(emailActive, emailF, !!errors.email)}>Email</label>
              <input
                type="email" value={email} autoComplete="email"
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                onFocus={() => setEF(true)} onBlur={() => setEF(false)}
                style={inputBase}
              />
              <div style={{ ...underlineBase, background: errors.email ? errClr : baseLine }}/>
              <div style={sweepLine(emailF, !!errors.email)}/>
            </div>
            {errors.email && <p style={{ margin: "5px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{ ...rise(6) }}>
            <div style={{ position: "relative", height: FIELD_H }}>
              <label style={labelStyle(pwActive, pwF, !!errors.pw)}>Password</label>
              <input
                type={showPw ? "text" : "password"} value={pw} autoComplete="new-password"
                onChange={e => { setPw(e.target.value); setErrors(v => ({ ...v, pw: undefined })); }}
                onFocus={() => setPF(true)} onBlur={() => setPF(false)}
                style={{ ...inputBase, right: 34 }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{
                position: "absolute", right: 0,
                bottom: INPUT_PB + (INPUT_H - INPUT_PB) / 2 - 9,
                width: 18, height: 18,
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: idleLbl, opacity: 0.55,
                transition: "color 0.22s ease, opacity 0.18s ease", padding: 0,
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
              <div style={{ ...underlineBase, background: errors.pw ? errClr : baseLine }}/>
              <div style={sweepLine(pwF, !!errors.pw)}/>
            </div>
            {errors.pw && <p style={{ margin: "5px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{errors.pw}</p>}
          </div>

          {/* Terms */}
          <p style={{ fontSize: 12.5, color: dark ? "rgba(200,197,245,0.32)" : "rgba(13,11,30,0.32)",
            margin: "18px 0 clamp(24px,6vw,32px)", lineHeight: 1.5, letterSpacing: "-0.01em",
            ...rise(7),
          }}>
            By creating an account you agree to our{" "}
            <span style={{ color: accent, cursor: "pointer", fontWeight: 500 }}>Terms</span>{" "}and{" "}
            <span style={{ color: accent, cursor: "pointer", fontWeight: 500 }}>Privacy Policy</span>
          </p>

          {/* Create button */}
          <div style={{ ...rise(7) }}>
            <button
              type="button"
              onClick={handleCreate}
              style={{
                width: "100%", height: 52, borderRadius: 14, border: "none",
                cursor: "pointer",
                background: accentBtn, color: "#fff",
                fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: btnShadow,
                fontFamily: "inherit",
                transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease",
              }}
              onPointerDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.967)"; }}
              onPointerUp={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              onPointerLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              Create account
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px", ...rise(8) }}>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
            <span style={{ fontSize: 12, color: divTxt, fontWeight: 500, letterSpacing: "0.04em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
          </div>

          {/* Sign in */}
          <div style={{ textAlign: "center", ...rise(8) }}>
            <span style={{ fontSize: 14.5, color: subClr, letterSpacing: "-0.01em" }}>Already have an account?{" "}</span>
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14.5, color: linkClr, fontWeight: 600,
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0,
            }}>Sign In</button>
          </div>

        </div>
      </div>

      {/* OTP Modal */}
      {showOtp && (
        <OtpModal
          email={email}
          dark={dark}
          onClose={() => setShowOtp(false)}
          accent={accent}
          accentBtn={accentBtn}
          btnShadow={btnShadow}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${phClr}; }
      `}</style>
    </div>
  );
}
