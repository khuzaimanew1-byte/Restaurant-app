import { useState, useEffect, useRef } from "react";

interface Props {
  onBack?: () => void;
}

/* ── OTP Modal ───────────────────────────────────────────────────────── */
function OtpModal({
  email, dark, onClose, accent, accentBtn, btnShadow, resend, setResend,
}: {
  email: string; dark: boolean; onClose: () => void;
  accent: string; accentBtn: string; btnShadow: string;
  resend: number; setResend: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [otp, setOtp]           = useState(["","","","","",""]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [verified, setVerified] = useState(false);
  const [dragY, setDragY]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY                  = useRef(0);
  const inputRefs               = useRef<(HTMLInputElement | null)[]>([]);
  const sheetRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setSheetVisible(true), 20);
    return () => clearTimeout(id);
  }, []);

  /* ── Touch drag to close ── */
  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    setDragY(dy);
  }
  function onTouchEnd() {
    setDragging(false);
    if (dragY > 90) {
      dismiss();
    } else {
      setDragY(0);
    }
  }

  function dismiss() {
    setSheetVisible(false);
    setDragY(0);
    setTimeout(() => onClose(), 380);
  }

  /* ── OTP input helpers ── */
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
    setTimeout(() => dismiss(), 1400);
  }

  const filled = otp.join("").length === 6;
  const mins   = Math.floor(resend / 60);
  const secs   = resend % 60;

  /* Colors */
  const cardBg    = dark ? "rgba(12,10,35,0.97)"  : "rgba(255,255,255,0.98)";
  const headClr   = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.52)"  : "rgba(13,11,30,0.46)";
  const boxBorder = dark ? "rgba(255,255,255,0.11)" : "rgba(13,11,30,0.12)";
  const boxBg     = dark ? "rgba(255,255,255,0.04)" : "rgba(249,248,255,0.7)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.14)" : "rgba(79,70,229,0.06)";
  const boxTxt    = dark ? "rgba(242,241,255,0.96)" : "#09071E";
  const resendClr = dark ? "#A78BFA"                 : "#7C3AED";
  const mutedClr  = dark ? "rgba(200,197,245,0.36)"  : "rgba(13,11,30,0.30)";
  const handleClr = dark ? "rgba(255,255,255,0.14)"  : "rgba(13,11,30,0.12)";

  const translateY = sheetVisible ? dragY : (sheetVisible === false ? "100%" : "100%");

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom,0)",
        background: dark ? "rgba(0,0,0,0)" : "rgba(0,0,0,0)",
        opacity: sheetVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
      onClick={e => e.target === e.currentTarget && dismiss()}
    >
      {/* Backdrop blur layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.72)" : "rgba(13,11,30,0.46)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        opacity: sheetVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }} onClick={dismiss}/>

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 440,
          background: cardBg,
          borderRadius: "26px 26px 0 0",
          padding: "0 clamp(24px,6vw,36px) clamp(36px,9vw,52px)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.07)"}`,
          borderBottom: "none",
          boxShadow: dark
            ? "0 -20px 80px rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.06)"
            : "0 -20px 80px rgba(13,11,30,0.14), 0 -1px 0 rgba(255,255,255,0.9)",
          transform: `translateY(${typeof translateY === "number" ? translateY + "px" : translateY})`,
          transition: dragging
            ? "none"
            : `transform 0.46s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease`,
          boxSizing: "border-box",
          willChange: "transform",
        }}
      >
        {/* Drag handle area — touchable */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            padding: "14px 0 22px",
            display: "flex", justifyContent: "center",
            cursor: "grab", userSelect: "none",
            margin: "0 -36px",
            touchAction: "none",
          }}
        >
          <div style={{
            width: 36, height: 4.5, borderRadius: 100,
            background: handleClr,
            transition: "background 0.2s",
          }}/>
        </div>

        {verified ? (
          /* ── Success ── */
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `linear-gradient(135deg,${accent},#6366F1)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: btnShadow,
              animation: "scaleIn 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: 24, fontWeight: 800, color: headClr, margin: "0 0 8px",
              letterSpacing: "-0.04em",
            }}>Verified!</h3>
            <p style={{ fontSize: 14.5, color: subClr, margin: 0, letterSpacing: "-0.01em" }}>
              Account created successfully
            </p>
          </div>
        ) : (
          <>
            {/* Email icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: dark ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.08)",
              border: `1px solid ${dark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.14)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke={accent} strokeWidth="1.7"/>
                <path d="M2 8l8.586 5.707a2 2 0 002.828 0L22 8" stroke={accent} strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </div>

            <h3 style={{
              fontSize: "clamp(22px,5.5vw,27px)", fontWeight: 800, color: headClr,
              margin: "0 0 6px", letterSpacing: "-0.04em",
            }}>Check your email</h3>
            <p style={{
              fontSize: 14.5, color: subClr, margin: "0 0 30px",
              letterSpacing: "-0.01em", lineHeight: 1.55,
            }}>
              We sent a 6-digit code to{" "}
              <span style={{ color: headClr, fontWeight: 600 }}>{email || "your email"}</span>
            </p>

            {/* OTP boxes */}
            <div
              style={{
                display: "flex", gap: "clamp(7px,2.2vw,10px)",
                marginBottom: 26, justifyContent: "center",
              }}
              onPaste={handlePaste}
            >
              {otp.map((val, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onFocus={e => e.target.select()}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  style={{
                    width: "clamp(44px,13vw,52px)",
                    height: "clamp(54px,15vw,62px)",
                    borderRadius: 14,
                    border: `1.5px solid ${val ? accent : boxBorder}`,
                    background: val ? boxFocBg : boxBg,
                    fontSize: 22, fontWeight: 700, textAlign: "center",
                    color: boxTxt,
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 0.2s cubic-bezier(0.22,1,0.36,1), background 0.2s ease, transform 0.15s cubic-bezier(0.22,1,0.36,1)",
                    boxSizing: "border-box",
                    caretColor: "transparent",
                    transform: val ? "scale(1.04)" : "scale(1)",
                    boxShadow: val
                      ? dark ? `0 0 0 3px rgba(167,139,250,0.15)` : `0 0 0 3px rgba(124,58,237,0.1)`
                      : "none",
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
                width: "100%", height: 54, borderRadius: 16, border: "none",
                cursor: filled && !loading ? "pointer" : "default",
                background: filled ? accentBtn : dark ? "rgba(255,255,255,0.06)" : "rgba(13,11,30,0.06)",
                color: filled ? "#fff" : mutedClr,
                fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: filled && !loading ? btnShadow : "none",
                transition: "background 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, color 0.22s ease, transform 0.15s cubic-bezier(0.22,1,0.36,1)",
                fontFamily: "inherit",
                marginBottom: 18,
                transform: "scale(1)",
              }}
              onPointerDown={e => { if (filled) (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
              onPointerUp={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              onPointerLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              {loading ? <OtpSpinner /> : "Verify & Continue"}
            </button>

            {/* Resend */}
            <div style={{ textAlign: "center" }}>
              {resend > 0 ? (
                <span style={{ fontSize: 13, color: mutedClr, letterSpacing: "-0.01em" }}>
                  Resend code in{" "}
                  <strong style={{
                    color: subClr,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {mins}:{String(secs).padStart(2, "0")}
                  </strong>
                </span>
              ) : (
                <button
                  onClick={() => setResend(300)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: resendClr, fontWeight: 600,
                    fontFamily: "inherit", letterSpacing: "-0.01em",
                    padding: "4px 0",
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
      border: "2.5px solid rgba(255,255,255,0.28)",
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
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; pw?: string; agreed?: string }>({});
  const [showOtp, setShowOtp] = useState(false);
  const [btnScale, setBS]   = useState(1);
  const [loading, setLoading] = useState(false);

  /* OTP resend timer — lives HERE so it survives modal open/close */
  const [resend, setResend]     = useState(0);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);

  useEffect(() => { const id = setTimeout(() => setMnt(true), 40); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h  = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h); return () => mq.removeEventListener("change", h);
  }, []);

  /* Countdown tick */
  useEffect(() => {
    if (resend <= 0) return;
    const id = setInterval(() => setResend(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resend]);

  /* Stagger */
  function rise(i: number): React.CSSProperties {
    const d = `${i * 0.075}s`;
    return {
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0px)" : "translateY(20px)",
      transition: `opacity 0.72s cubic-bezier(0.22,1,0.36,1) ${d}, transform 0.72s cubic-bezier(0.22,1,0.36,1) ${d}`,
    };
  }

  function validate() {
    const e: typeof errors = {};
    if (!name.trim())              e.name  = "Nickname is required";
    if (!email.trim())             e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Enter a valid email";
    if (!pw)                       e.pw    = "Password is required";
    else if (pw.length < 6)        e.pw    = "At least 6 characters";
    if (!agreed)                   e.agreed = "Please agree to continue";
    setErrors(e);
    return !e.name && !e.email && !e.pw && !e.agreed;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);

    /* Only start the 5-min cooldown if not already running */
    if (resend === 0) {
      setResend(300);
      setOtpSentAt(Date.now());
    }

    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setShowOtp(true);
  }

  /* When user closes modal and clicks "Create account" again,
     just reopen the sheet — do NOT send a new OTP */
  function handleReopenOtp() {
    if (otpSentAt !== null) {
      /* OTP was already sent — just reopen modal, timer continues */
      setShowOtp(true);
      return;
    }
    handleCreate();
  }

  /* Tokens */
  const nameActive  = nameF  || !!name;
  const emailActive = emailF || !!email;
  const pwActive    = pwF    || !!pw;

  const lightBg   = "linear-gradient(155deg,#FFFFFF 0%,#F5F3FF 20%,#EDE9FE 40%,#DDD6FE 62%,#C4B5FD 82%,#A78BFA 100%)";
  const darkBg    = "linear-gradient(155deg,#03021A 0%,#060424 50%,#0B083E 100%)";

  const o1 = dark ? "rgba(139,92,246,0.35)"  : "rgba(167,139,250,0.42)";
  const o2 = dark ? "rgba(79,70,229,0.25)"   : "rgba(109,40,217,0.20)";
  const o3 = dark ? "rgba(124,58,237,0.16)"  : "rgba(196,181,253,0.55)";

  const headClr   = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.48)"  : "rgba(13,11,30,0.48)";
  const accent    = dark ? "#A78BFA"                  : "#7C3AED";
  const accentBtn = dark ? "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)"
                         : "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)";
  const btnShadow = dark ? "0 12px 40px rgba(139,92,246,0.52),0 4px 12px rgba(139,92,246,0.28)"
                         : "0 8px 30px rgba(109,40,217,0.36),0 2px 8px rgba(109,40,217,0.18)";
  const baseLine  = dark ? "rgba(255,255,255,0.09)"   : "rgba(13,11,30,0.13)";
  const idleLbl   = dark ? "rgba(200,197,245,0.36)"  : "rgba(13,11,30,0.36)";
  const activeLbl = dark ? "rgba(200,197,245,0.60)"  : "rgba(13,11,30,0.52)";
  const inputTxt  = dark ? "rgba(242,241,255,0.94)"  : "#09071E";
  const phClr     = dark ? "rgba(200,197,245,0.16)"  : "rgba(13,11,30,0.18)";
  const errClr    = dark ? "#F87171"                   : "#DC2626";
  const tglBorder = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.13)";
  const tglBg     = dark ? "rgba(255,255,255,0.05)"  : "rgba(255,255,255,0.55)";
  const linkClr   = dark ? "#A78BFA"                  : "#7C3AED";
  const divClr    = dark ? "rgba(255,255,255,0.07)"  : "rgba(13,11,30,0.09)";
  const divTxt    = dark ? "rgba(200,197,245,0.26)"  : "rgba(13,11,30,0.30)";

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

      {/* Orbs */}
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
        display: "flex", justifyContent: "flex-end",
        padding: "clamp(16px,4vw,22px) clamp(20px,5vw,28px)",
        ...rise(0),
      }}>
        <button onClick={() => setDark(v => !v)} style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${tglBorder}`, background: tglBg,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.22s",
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

          <div style={{ marginBottom: 8, ...rise(1) }}>
            <h1 style={{
              fontSize: "clamp(33px,8.5vw,42px)", fontWeight: 800,
              letterSpacing: "-0.05em", lineHeight: 1.04,
              color: headClr, margin: 0,
            }}>Create account</h1>
          </div>
          <div style={{ marginBottom: "clamp(32px,8vw,46px)", ...rise(2) }}>
            <p style={{ fontSize: 15, color: subClr, lineHeight: 1.5, margin: 0, letterSpacing: "-0.01em" }}>
              Start tracking attendance in minutes
            </p>
          </div>

          {/* Nickname */}
          <div style={{ marginBottom: "clamp(16px,4vw,22px)", ...rise(3) }}>
            <div style={{ position: "relative", height: FIELD_H }}>
              <label style={labelStyle(nameActive, nameF, !!errors.name)}>Nickname</label>
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
          <div style={{ marginBottom: "clamp(16px,4vw,22px)", ...rise(4) }}>
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
          <div style={{ ...rise(5) }}>
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

          {/* Terms checkbox */}
          <div style={{ margin: "20px 0 clamp(22px,5vw,28px)", ...rise(6) }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
              <div
                onClick={() => { setAgreed(v => !v); setErrors(e => ({ ...e, agreed: undefined })); }}
                style={{
                  flexShrink: 0,
                  width: 20, height: 20, borderRadius: 6, marginTop: 1,
                  border: `2px solid ${errors.agreed ? errClr : agreed ? accent : dark ? "rgba(255,255,255,0.2)" : "rgba(13,11,30,0.2)"}`,
                  background: agreed ? accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.22s cubic-bezier(0.22,1,0.36,1), border-color 0.22s ease, transform 0.15s cubic-bezier(0.22,1,0.36,1)",
                  transform: agreed ? "scale(1.06)" : "scale(1)",
                }}>
                {agreed && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13.5, color: subClr, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
                I agree to the{" "}
                <span style={{ color: linkClr, fontWeight: 600, cursor: "pointer" }}>Terms of Service</span>
                {" "}and{" "}
                <span style={{ color: linkClr, fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>
              </span>
            </label>
            {errors.agreed && <p style={{ margin: "6px 0 0 32px", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{errors.agreed}</p>}
          </div>

          {/* Create Account */}
          <div style={{ ...rise(7) }}>
            <button
              type="button"
              onPointerDown={() => setBS(0.967)}
              onPointerUp={() => { setBS(1); handleReopenOtp(); }}
              onPointerLeave={() => setBS(1)}
              disabled={loading}
              style={{
                width: "100%", height: 54, borderRadius: 16, border: "none",
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
              {loading ? <CreateSpinner /> : "Create Account"}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "22px 0 18px", ...rise(8),
          }}>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
            <span style={{ fontSize: 12, color: divTxt, fontWeight: 500, letterSpacing: "0.04em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
          </div>

          {/* Login */}
          <div style={{ textAlign: "center", ...rise(8) }}>
            <span style={{ fontSize: 14.5, color: subClr, letterSpacing: "-0.01em" }}>
              Already have an account?{" "}
            </span>
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
          resend={resend}
          setResend={setResend}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        input::placeholder { color: ${phClr}; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

function CreateSpinner() {
  return (
    <span style={{
      width: 19, height: 19, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.28)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }}/>
  );
}
