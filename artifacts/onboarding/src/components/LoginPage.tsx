import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, getOtpStatus, forgotPasswordRequest, AppError } from "../lib/api";
import { OtpModal } from "./OtpModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { OtpBanner } from "./OtpBanner";
import { useDarkMode, Spinner } from "../lib/shared";

interface Props {
  onSuccess: (email: string, role: string, sessionToken: string) => void;
}

const PW_NUM     = /[0-9]/;
const PW_SPECIAL = /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/;

function validatePwComplexity(pw: string): string | null {
  if (!pw)              return "Password is required.";
  if (pw.length < 8)    return "Password must be at least 8 characters.";
  if (!PW_NUM.test(pw))     return "Password must contain at least one number.";
  if (!PW_SPECIAL.test(pw)) return "Password must contain at least one special character.";
  return null;
}

export function LoginPage({ onSuccess }: Props) {
  const [dark, setDark]     = useDarkMode();
  const [mounted, setMnt]   = useState(false);
  const [email, setEmail]   = useState("");
  const [password, setPw]   = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [emailF, setEF]     = useState(false);
  const [pwF, setPwF]       = useState(false);
  const [btnScale, setBS]   = useState(1);
  const [showOtp, setShowOtp]         = useState(false);
  const [showForgot, setShowForgot]   = useState(false);
  const [forgotExpiresAt, setForgotExpiry] = useState<number>(0);
  const [otpExpiresAt, setOtpExpiry]  = useState<number | null>(null);
  const [remainingMs, setRemMs]       = useState(0);
  const [shakeEmail, setShakeEmail]   = useState(false);
  const [forgotBannerMs, setFBannerMs]     = useState(0);
  const [forgotBannerShake, setFBShake]    = useState(false);
  const [otpBannerShake, setOtpBannerShake] = useState(false);

  const shakeTimer             = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timerRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const forgotBannerTimer      = useRef<ReturnType<typeof setInterval> | null>(null);
  const forgotBannerShakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const otpBannerShakeTimer    = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [errors, setErrors] = useState<{
    email?: string; password?: string; agreed?: string; general?: string;
  }>({});

  useEffect(() => { const id = setTimeout(() => setMnt(true), 40); return () => clearTimeout(id); }, []);

  useEffect(() => {
    if (forgotBannerTimer.current) clearInterval(forgotBannerTimer.current);
    if (!forgotExpiresAt || showForgot) { setFBannerMs(0); return; }
    const tick = () => setFBannerMs(Math.max(0, forgotExpiresAt - Date.now()));
    tick();
    forgotBannerTimer.current = setInterval(tick, 1_000);
    return () => { if (forgotBannerTimer.current) clearInterval(forgotBannerTimer.current); };
  }, [forgotExpiresAt, showForgot]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!otpExpiresAt) { setRemMs(0); return; }
    const tick = () => setRemMs(Math.max(0, otpExpiresAt - Date.now()));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [otpExpiresAt]);

  const lastCheckedEmail = useRef("");
  const otpStatusMutation = useMutation({
    mutationFn: (em: string) => getOtpStatus(em),
    onSuccess: (status) => {
      if (status.active && status.expiresAt) setOtpExpiry(status.expiresAt);
    },
  });

  function checkOtpSession(em: string) {
    if (!em || lastCheckedEmail.current === em) return;
    lastCheckedEmail.current = em;
    otpStatusMutation.mutate(em);
  }

  const loginMutation = useMutation({
    mutationFn: ({ em, pw }: { em: string; pw: string }) => login(em, pw),
    onSuccess: (result) => {
      if (result.scenario === "login" && result.success) {
        onSuccess(result.email ?? email, result.role ?? "USER", result.sessionToken ?? "");
      } else if (result.scenario === "first-login") {
        setOtpExpiry(result.expiresAt ?? Date.now() + 300_000);
        setShowOtp(true);
      }
    },
    onError: (err) => {
      const e = err as AppError;
      if (e.field === "email")    setErrors({ email: e.message });
      else if (e.field === "password") setErrors({ password: e.message });
      else setErrors({ general: e.message });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: () => forgotPasswordRequest(email.trim()),
    onSuccess: (r) => {
      setForgotExpiry(r.expiresAt);
      setShowForgot(true);
    },
    onError: (err) => {
      const e = err as AppError;
      if (e.code === "SESSION_ACTIVE" && e.expiresAt) {
        setForgotExpiry(e.expiresAt);
        setShowForgot(true);
        return;
      }
      const msg = e.code === "EMAIL_NOT_REGISTERED"
        ? "Your email isn't registered."
        : e.code === "NO_PASSWORD_SET"
          ? "This account has no password set. Use your email OTP to sign in."
          : (e.message ?? "Unable to send OTP. Please try again.");
      setErrors(v => ({ ...v, email: msg }));
      triggerEmailShake();
    },
  });

  function validateFields(): boolean {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    const pwErr = validatePwComplexity(password);
    if (pwErr) e.password = pwErr;
    if (!agreed) e.agreed = "You must agree to the Terms of Service to continue.";
    setErrors(e);
    return !e.email && !e.password && !e.agreed;
  }

  const sessionActive = remainingMs > 0;
  const loading       = loginMutation.isPending;
  const emailValid    = !!(email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
  const pwValid       = !!(password.length >= 8 && PW_NUM.test(password) && PW_SPECIAL.test(password));
  const formValid     = !!(emailValid && pwValid && agreed);

  const forgotBannerActive = !showForgot && forgotExpiresAt > 0 && forgotBannerMs > 0;
  const anyOtpActive       = sessionActive || forgotBannerActive;

  function triggerEmailShake() {
    setShakeEmail(false);
    clearTimeout(shakeTimer.current);
    requestAnimationFrame(() => {
      setShakeEmail(true);
      shakeTimer.current = setTimeout(() => setShakeEmail(false), 500);
    });
  }

  function triggerBannerShake() {
    setFBShake(false);
    clearTimeout(forgotBannerShakeTimer.current);
    requestAnimationFrame(() => {
      setFBShake(true);
      forgotBannerShakeTimer.current = setTimeout(() => setFBShake(false), 500);
    });
  }

  function triggerOtpBannerShake() {
    setOtpBannerShake(false);
    clearTimeout(otpBannerShakeTimer.current);
    requestAnimationFrame(() => {
      setOtpBannerShake(true);
      otpBannerShakeTimer.current = setTimeout(() => setOtpBannerShake(false), 500);
    });
  }

  function handleSignIn() {
    // Security guard: check React state — blocks even if disabled attr was removed via DevTools
    if (forgotBannerActive) { triggerBannerShake(); return; }
    if (sessionActive)      { triggerOtpBannerShake(); return; }
    if (!validateFields()) return;
    setErrors({});
    loginMutation.mutate({ em: email.trim(), pw: password });
  }

  function handleForgotPassword() {
    // Security guard: check React state — blocks even if disabled attr was removed via DevTools
    if (forgotBannerActive) { triggerBannerShake(); return; }
    if (sessionActive)      { triggerOtpBannerShake(); return; }
    if (!email.trim()) {
      setErrors(v => ({ ...v, email: "Enter your email address first." }));
      triggerEmailShake();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors(v => ({ ...v, email: "Enter a valid email address." }));
      triggerEmailShake();
      return;
    }
    setErrors({});
    forgotMutation.mutate();
  }

  const pwRef    = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const lightBg   = "linear-gradient(145deg,#C8C3FF 0%,#D9D5FF 12%,#E5E2FF 28%,#EDEAFF 45%,#F4F3FF 62%,#F9F9FF 80%,#FFFFFF 100%)";
  const darkBg    = "linear-gradient(155deg,#03021A 0%,#060424 50%,#0B083E 100%)";
  const o1        = dark ? "rgba(79,70,229,0.38)"  : "rgba(79,70,229,0.28)";
  const o2        = dark ? "rgba(107,99,240,0.24)" : "rgba(107,99,240,0.20)";
  const o3        = dark ? "rgba(55,48,163,0.18)"  : "rgba(55,48,163,0.12)";
  const headClr   = dark ? "rgba(238,237,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.46)" : "rgba(13,11,30,0.46)";
  const accent    = dark ? "#8078F2" : "#4F46E5";
  const accentBtn = dark ? "linear-gradient(135deg,#6E67F0 0%,#4B44C5 100%)"
                         : "linear-gradient(135deg,#635CEE 0%,#3E37BE 100%)";
  const btnShadow = dark ? "0 12px 40px rgba(79,70,229,0.58),0 4px 12px rgba(79,70,229,0.32)"
                         : "0 8px 30px rgba(79,70,229,0.40),0 2px 8px rgba(79,70,229,0.20)";
  const baseLine  = dark ? "rgba(255,255,255,0.09)"  : "rgba(13,11,30,0.13)";
  const idleLbl   = dark ? "rgba(200,197,245,0.36)"  : "rgba(13,11,30,0.36)";
  const activeLbl = dark ? "rgba(200,197,245,0.60)"  : "rgba(13,11,30,0.52)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)"  : "#09071E";
  const errClr    = dark ? "#F87171" : "#DC2626";
  const tglBorder = dark ? "rgba(255,255,255,0.1)"   : "rgba(13,11,30,0.13)";
  const tglBg     = dark ? "rgba(255,255,255,0.05)"  : "rgba(255,255,255,0.6)";
  const linkClr   = dark ? "#9992F5" : "#4F46E5";
  const divClr    = dark ? "rgba(255,255,255,0.07)"  : "rgba(13,11,30,0.09)";
  const divTxt    = dark ? "rgba(200,197,245,0.26)"  : "rgba(13,11,30,0.30)";

  const FIELD_H  = 58;
  const INPUT_H  = 34;
  const INPUT_PB = 10;
  const IDLE_TOP = FIELD_H - (INPUT_H / 2) - (INPUT_PB / 2) - 8;

  function rise(i: number): React.CSSProperties {
    return {
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0px)" : "translateY(20px)",
      transition: `opacity 0.72s cubic-bezier(0.22,1,0.36,1) ${i * 0.075}s, transform 0.72s cubic-bezier(0.22,1,0.36,1) ${i * 0.075}s`,
    };
  }

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
      transition: "top 0.28s cubic-bezier(0.22,1,0.36,1), font-size 0.28s cubic-bezier(0.22,1,0.36,1), color 0.22s ease, letter-spacing 0.28s cubic-bezier(0.22,1,0.36,1)",
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
    position: "absolute", bottom: 0, left: 0, right: 0, height: INPUT_H,
    background: "none", border: "none", outline: "none", borderRadius: 0,
    fontSize: 15.5, color: inputTxt, paddingBottom: INPUT_PB,
    fontFamily: "inherit", letterSpacing: "-0.015em",
    WebkitAppearance: "none", boxSizing: "border-box",
  };

  const underlineBase: React.CSSProperties = {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
    transition: "background 0.22s ease",
  };

  const bannerCount = (forgotBannerActive ? 1 : 0) + (sessionActive && !showOtp ? 1 : 0);
  const headerMt    = bannerCount * 38;

  return (
    <div style={{
      width: "100vw", height: "100dvh", overflow: "hidden",
      background: dark ? darkBg : lightBg,
      position: "relative", display: "flex", flexDirection: "column",
      fontFamily: "'Inter',-apple-system,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @keyframes email-shake {
          0%,100%{transform:translateX(0)}
          15%,45%,75%{transform:translateX(-7px)}
          30%,60%{transform:translateX(7px)}
        }
        .email-shake  { animation: email-shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
        .otp-shake    { animation: email-shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97); }
        .banner-shake { animation: email-shake 0.48s cubic-bezier(0.36,0.07,0.19,0.97); }
      `}</style>

      {/* ── Forgot-Password OTP Active Banner ── */}
      {forgotBannerActive && (
        <OtpBanner
          dark={dark}
          label="Reset OTP active"
          remainingMs={forgotBannerMs}
          actionLabel="Enter Code →"
          onAction={() => setShowForgot(true)}
          shake={forgotBannerShake}
          top={0}
          zIndex={310}
        />
      )}

      {/* ── Login OTP Session Banner ── */}
      {sessionActive && !showOtp && (
        <OtpBanner
          dark={dark}
          label="OTP session active"
          remainingMs={remainingMs}
          actionLabel="Verify OTP"
          onAction={() => {
            if (!emailValid) { setErrors({ email: "Enter your registered email to continue." }); triggerEmailShake(); return; }
            setShowOtp(true);
          }}
          shake={otpBannerShake}
          top={forgotBannerActive ? 38 : 0}
          zIndex={300}
        />
      )}

      {/* Orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[
          { w: "85vw", m: 580, t: "-22%", r: "-20%", g: o1 },
          { w: "70vw", m: 440, b: "-18%", l: "-20%", g: o2 },
          { w: "55vw", m: 360, t: "35%",  l: "22%",  g: o3 },
        ].map((orb, i) => (
          <div key={i} style={{
            position: "absolute",
            width: orb.w, height: orb.w, maxWidth: orb.m, maxHeight: orb.m,
            top: (orb as {t?:string}).t, bottom: (orb as {b?:string}).b,
            left: (orb as {l?:string}).l, right: (orb as {r?:string}).r,
            borderRadius: "50%",
            background: `radial-gradient(circle,${orb.g} 0%,transparent 65%)`,
          }}/>
        ))}
      </div>

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10, flexShrink: 0,
        display: "flex", justifyContent: "flex-end",
        padding: "clamp(16px,4vw,22px) clamp(20px,5vw,28px)",
        marginTop: headerMt,
        transition: "margin-top 0.3s ease",
        ...rise(0),
      }}>
        <button onClick={() => setDark(v => !v)} style={{
          width: "auto", height: "auto", borderRadius: 0,
          border: "none", background: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          padding: 6,
          opacity: 0.6, transition: "opacity 0.18s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
        >
          {dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill={idleLbl}/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={idleLbl} strokeWidth="2" strokeLinecap="round"/>
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
              fontSize: "clamp(36px,9vw,44px)", fontWeight: 800,
              letterSpacing: "-0.05em", lineHeight: 1.04,
              color: headClr, margin: 0,
            }}>Sign In</h1>
          </div>
          <div style={{ marginBottom: "clamp(36px,9vw,50px)", ...rise(2) }}>
            <p style={{ fontSize: 15, color: subClr, lineHeight: 1.5, margin: 0, letterSpacing: "-0.01em" }}>
              Enter your credentials to continue
            </p>
          </div>

          {errors.general && (
            <div style={{
              ...rise(2),
              display: "flex", alignItems: "flex-start", gap: 10,
              background: dark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.06)",
              border: `1px solid ${dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.15)"}`,
              borderRadius: 12, padding: "11px 14px", marginBottom: 22,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, color: errClr, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
                {errors.general}
              </span>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "clamp(18px,4.5vw,24px)", ...rise(3) }}>
            <div
              className={shakeEmail ? "email-shake" : ""}
              style={{ position: "relative", height: FIELD_H }}
            >
              <label style={labelStyle(!!(emailF || email), emailF, !!errors.email)}>Email</label>
              <input
                ref={emailRef} type="email" value={email} autoComplete="email"
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined, general: undefined })); }}
                onBlur={() => { setEF(false); checkOtpSession(email.trim()); }}
                onFocus={() => setEF(true)}
                onKeyDown={e => { if (e.key === "Enter") pwRef.current?.focus(); }}
                style={inputBase}
              />
              <div style={{ ...underlineBase, background: errors.email ? errClr : baseLine }}/>
              <div style={sweepLine(emailF, !!errors.email)}/>
            </div>
            {errors.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                  <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
                <p style={{ margin: 0, fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{errors.email}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ ...rise(4) }}>
            <div style={{ position: "relative", height: FIELD_H }}>
              <label style={labelStyle(!!(pwF || password), pwF, !!errors.password)}>Password</label>
              <input
                ref={pwRef} type={showPw ? "text" : "password"} value={password} autoComplete="current-password"
                onChange={e => { setPw(e.target.value); setErrors(v => ({ ...v, password: undefined, general: undefined })); }}
                onFocus={() => setPwF(true)}
                onBlur={() => setPwF(false)}
                onKeyDown={e => { if (e.key === "Enter") handleSignIn(); }}
                style={{ ...inputBase, right: 34 }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{
                position: "absolute", right: 0,
                bottom: INPUT_PB + (INPUT_H - INPUT_PB) / 2 - 9,
                width: 18, height: 18,
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: idleLbl, opacity: 0.55, padding: 0, transition: "color 0.22s, opacity 0.18s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}
              >
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/></svg>
                }
              </button>
              <div style={{ ...underlineBase, background: errors.password ? errClr : baseLine }}/>
              <div style={sweepLine(pwF, !!errors.password)}/>
            </div>
            {password && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginTop: 8 }}>
                {[
                  { met: password.length >= 8,    label: "8+ characters" },
                  { met: PW_NUM.test(password),    label: "One number" },
                  { met: PW_SPECIAL.test(password), label: "One special character" },
                ].map(({ met, label }) => (
                  <span key={label} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11.5, fontWeight: 500,
                    color: met ? (dark ? "#34D399" : "#059669") : errClr,
                    transition: "color 0.2s ease",
                  }}>
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{met ? "✓" : "✗"}</span>
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Forgot password link — disabled when any OTP active */}
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={anyOtpActive || forgotMutation.isPending}
                style={{
                  background: "none", border: "none",
                  cursor: (anyOtpActive || forgotMutation.isPending) ? "default" : "pointer",
                  fontSize: 12.5, fontWeight: 600, color: linkClr,
                  fontFamily: "inherit", padding: "2px 0",
                  letterSpacing: "-0.01em",
                  opacity: anyOtpActive ? 0.35 : forgotMutation.isPending ? 0.6 : 0.85,
                  transition: "opacity 0.18s",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
                onMouseEnter={e => { if (!anyOtpActive && !forgotMutation.isPending) e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={e => { if (!anyOtpActive && !forgotMutation.isPending) e.currentTarget.style.opacity = "0.85"; }}
              >
                {forgotMutation.isPending
                  ? <><Spinner size={10} /> Sending OTP…</>
                  : "Forgot password?"
                }
              </button>
            </div>
          </div>

          {/* Terms */}
          <div style={{ margin: "20px 0 clamp(20px,5vw,26px)", ...rise(5) }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
              <div
                onClick={() => { setAgreed(v => !v); setErrors(e => ({ ...e, agreed: undefined })); }}
                style={{
                  flexShrink: 0, width: 20, height: 20, borderRadius: 6, marginTop: 1,
                  border: `2px solid ${errors.agreed ? errClr : agreed ? accent : dark ? "rgba(255,255,255,0.2)" : "rgba(13,11,30,0.2)"}`,
                  background: agreed ? accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.22s cubic-bezier(0.22,1,0.36,1), border-color 0.22s, transform 0.15s cubic-bezier(0.22,1,0.36,1)",
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
              </span>
            </label>
            {errors.agreed && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 0 32px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                  <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
                <p style={{ margin: 0, fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{errors.agreed}</p>
              </div>
            )}
          </div>

          {/* Sign In button — disabled when any OTP active */}
          <div style={{ ...rise(6) }}>
            <button
              type="button"
              disabled={loading || anyOtpActive}
              onClick={() => { setBS(1); handleSignIn(); }}
              onPointerDown={() => { if (!anyOtpActive && !loading) setBS(0.967); }}
              onPointerLeave={() => setBS(1)}
              style={{
                width: "100%", height: 52, borderRadius: 16, border: "none",
                cursor: (loading || anyOtpActive) ? "default" : "pointer",
                background: anyOtpActive
                  ? dark ? "rgba(99,92,238,0.14)" : "rgba(79,70,229,0.10)"
                  : formValid
                    ? accentBtn
                    : dark ? "rgba(99,92,238,0.22)" : "rgba(79,70,229,0.14)",
                color: anyOtpActive
                  ? dark ? "rgba(200,197,245,0.25)" : "rgba(79,70,229,0.28)"
                  : formValid
                    ? "#fff"
                    : dark ? "rgba(200,197,245,0.38)" : "rgba(79,70,229,0.38)",
                fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: (!anyOtpActive && formValid) ? btnShadow : "none",
                transition: "background 0.28s, box-shadow 0.25s, color 0.22s",
                fontFamily: "inherit",
                transform: `scale(${btnScale})`,
                opacity: anyOtpActive ? 0.55 : 1,
              }}
            >
              {loading ? <Spinner /> : "Sign In"}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 16px", ...rise(7) }}>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
            <span style={{ fontSize: 12, color: divTxt, fontWeight: 500, letterSpacing: "0.04em" }}>secured</span>
            <div style={{ flex: 1, height: 1, background: divClr }}/>
          </div>

          <div style={{ textAlign: "center", ...rise(7) }}>
            <span style={{ fontSize: 13, color: subClr, letterSpacing: "-0.01em" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: 4 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              End-to-end encrypted connection
            </span>
          </div>

        </div>
      </div>

      {showOtp && otpExpiresAt && (
        <OtpModal
          email={email} password={password} dark={dark}
          accent={accent} accentBtn={accentBtn} btnShadow={btnShadow}
          expiresAt={otpExpiresAt} onSuccess={onSuccess}
          onClose={() => setShowOtp(false)}
          onNewExpiry={setOtpExpiry}
        />
      )}

      {showForgot && forgotExpiresAt > 0 && (
        <ForgotPasswordModal
          email={email.trim()}
          initialExpiresAt={forgotExpiresAt}
          dark={dark}
          accent={accent} accentBtn={accentBtn} btnShadow={btnShadow}
          onClose={() => setShowForgot(false)}
          onNewExpiry={(exp) => setForgotExpiry(exp)}
          onPasswordReset={() => {
            setShowForgot(false);
            setForgotExpiry(0);
            setPw("");
            setErrors({});
          }}
        />
      )}
    </div>
  );
}
