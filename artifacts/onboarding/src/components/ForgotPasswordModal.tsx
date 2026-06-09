import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordRequest, resetPassword, AppError } from "../lib/api";
import { Spinner, formatCountdown } from "../lib/shared";

interface Props {
  email: string;
  initialExpiresAt: number;
  dark: boolean;
  accent: string;
  accentBtn: string;
  btnShadow: string;
  onClose: () => void;
  onPasswordReset: () => void;
  onNewExpiry?: (expiresAt: number) => void;
}

const PW_NUM     = /[0-9]/;
const PW_SPECIAL = /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/;

function validateNewPw(pw: string): string | null {
  if (!pw)             return "Password is required.";
  if (pw.length < 8)   return "Password must be at least 8 characters.";
  if (!PW_NUM.test(pw))     return "Password must contain at least one number.";
  if (!PW_SPECIAL.test(pw)) return "Password must contain at least one special character.";
  return null;
}

function maskEmail(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const local  = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 2) return `${local}***${domain}`;
  return `${local.slice(0, 2)}***${domain}`;
}

export function ForgotPasswordModal({
  email, initialExpiresAt, dark, accent, accentBtn, btnShadow, onClose, onPasswordReset, onNewExpiry,
}: Props) {
  const [sheetVisible, setSheet] = useState(false);

  // Step 0: OTP  |  Step 1: New password
  const [step, setStep]           = useState<0 | 1>(0);
  const [otpConfirmed, setOtpConf] = useState(false);

  // OTP
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [savedOtp, setSavedOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [shakeOtp, setShakeOtp] = useState(false);
  const [shakeResend, setShakeResend] = useState(false);
  const [remainingMs, setMs]   = useState(() => Math.max(0, initialExpiresAt - Date.now()));
  const [expiresAt, setExpiry] = useState(initialExpiresAt);
  const inputRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const otpShakeTimer   = useRef<ReturnType<typeof setTimeout>>();
  const resendShakeTimer = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyingRef = useRef(false);

  // New password
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [pwErrors, setPwErrors]   = useState<{ newPw?: string; confirmPw?: string; general?: string }>({});
  const [pwSuccess, setPwSuccess] = useState(false);
  const [newPwF, setNewPwF]   = useState(false);
  const [confPwF, setConfPwF] = useState(false);
  const newPwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSheet(true); }, 20);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (sheetVisible) setTimeout(() => inputRefs.current[0]?.focus(), 320);
  }, [sheetVisible]);

  // Timer
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const tick = () => setMs(Math.max(0, expiresAt - Date.now()));
    tick();
    intervalRef.current = setInterval(tick, 1_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expiresAt]);

  function triggerOtpShake() {
    setShakeOtp(false);
    clearTimeout(otpShakeTimer.current);
    requestAnimationFrame(() => {
      setShakeOtp(true);
      otpShakeTimer.current = setTimeout(() => setShakeOtp(false), 450);
    });
  }

  function triggerResendShake() {
    setShakeResend(false);
    clearTimeout(resendShakeTimer.current);
    requestAnimationFrame(() => {
      setShakeResend(true);
      resendShakeTimer.current = setTimeout(() => setShakeResend(false), 450);
    });
  }

  // OTP handlers
  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[i]) { const n = [...otp]; n[i] = ""; setOtp(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    }
  }
  function handleOtpChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = digit; setOtp(n);
    setOtpError("");
    if (digit && i < 5) setTimeout(() => inputRefs.current[i + 1]?.focus(), 0);
    if (digit && i === 5 && n.every(d => d !== "") && remainingMs > 0) {
      const code = n.join("");
      setSavedOtp(code);
      setTimeout(() => handleVerifyOtpWith(code), 60);
    }
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const n = [...otp]; digits.forEach((d, i) => { n[i] = d; }); setOtp(n);
    setTimeout(() => inputRefs.current[Math.min(digits.length, 5)]?.focus(), 0);
    if (digits.length === 6 && remainingMs > 0) {
      const code = digits.join("");
      setSavedOtp(code);
      setTimeout(() => handleVerifyOtpWith(code), 60);
    }
  }

  function handleVerifyOtpWith(code: string) {
    if (verifyingRef.current) return;
    if (code.length < 6) { setOtpError("Please enter the full 6-digit code."); triggerOtpShake(); return; }
    if (remainingMs <= 0) { setOtpError("OTP expired. Request a new code."); triggerOtpShake(); return; }
    verifyingRef.current = true;
    setSavedOtp(code);
    setOtpError("");
    setOtpConf(true);
    setStep(1);
    setTimeout(() => {
      newPwRef.current?.focus();
      verifyingRef.current = false;
    }, 500);
  }

  // Resend (calls forgot-password again)
  const resendMutation = useMutation({
    mutationFn: () => forgotPasswordRequest(email),
    onSuccess: (r) => {
      setExpiry(r.expiresAt);
      setMs(Math.max(0, r.expiresAt - Date.now()));
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      onNewExpiry?.(r.expiresAt);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: (err) => {
      const e = err as AppError;
      if (e.code === "SESSION_ACTIVE" && e.expiresAt) {
        setExpiry(e.expiresAt);
        setMs(Math.max(0, e.expiresAt - Date.now()));
        setOtpError("An OTP is already active. Please check your email.");
        triggerResendShake();
        return;
      }
      setOtpError(e.message ?? "Failed to resend. Please try again.");
    },
  });

  function handleResendClick() {
    if (remainingMs > 0) { triggerResendShake(); return; }
    resendMutation.mutate();
  }

  // Reset password mutation
  const resetMutation = useMutation({
    mutationFn: () => resetPassword(email, savedOtp, newPw, confirmPw),
    onSuccess: () => {
      setPwSuccess(true);
      setTimeout(() => {
        setSheet(false);
        setTimeout(() => { onPasswordReset(); onClose(); }, 400);
      }, 1_200);
    },
    onError: (err) => {
      const e = err as AppError;
      if (e.code === "OTP_INCORRECT" || e.code === "OTP_EXPIRED" || e.code === "OTP_USED" || e.code === "NO_SESSION") {
        setPwErrors({ general: e.message + " Please go back and request a new code." });
      } else if (e.field === "confirmPassword") {
        setPwErrors({ confirmPw: e.message });
      } else {
        setPwErrors({ general: e.message ?? "Something went wrong. Please try again." });
      }
    },
  });

  function handleSetPassword() {
    const e: typeof pwErrors = {};
    const newPwErr = validateNewPw(newPw);
    if (newPwErr) e.newPw = newPwErr;
    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (newPw !== confirmPw) e.confirmPw = "Passwords do not match.";
    setPwErrors(e);
    if (Object.keys(e).length > 0) return;
    resetMutation.mutate();
  }

  const expired = remainingMs <= 0;

  // Colours
  const cardBg    = dark ? "rgba(12,10,35,0.97)"   : "rgba(255,255,255,0.98)";
  const headClr   = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.52)" : "rgba(13,11,30,0.46)";
  const boxBorder = dark ? "rgba(255,255,255,0.11)" : "rgba(13,11,30,0.12)";
  const boxBg     = dark ? "rgba(255,255,255,0.04)" : "rgba(249,248,255,0.7)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.14)" : "rgba(79,70,229,0.06)";
  const boxTxt    = dark ? "rgba(242,241,255,0.96)" : "#09071E";
  const errClr    = dark ? "#F87171" : "#DC2626";
  const baseLine  = dark ? "rgba(255,255,255,0.09)" : "rgba(13,11,30,0.13)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)" : "#09071E";
  const idleLbl   = dark ? "rgba(200,197,245,0.36)" : "rgba(13,11,30,0.36)";
  const activeLbl = dark ? "rgba(200,197,245,0.60)" : "rgba(13,11,30,0.52)";
  const successClr = dark ? "#34D399" : "#059669";
  const changeClr  = dark ? "rgba(200,197,245,0.45)" : "rgba(13,11,30,0.38)";
  const timerClr  = dark ? "rgba(200,197,245,0.32)" : "rgba(13,11,30,0.28)";

  const translateY = sheetVisible ? "0px" : "100%";

  const FIELD_H  = 58;
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
      transition: "top 0.28s cubic-bezier(0.22,1,0.36,1), font-size 0.28s, color 0.22s, letter-spacing 0.28s",
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

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {/* Backdrop — non-closeable */}
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.76)" : "rgba(13,11,30,0.50)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: sheetVisible ? 1 : 0, transition: "opacity 0.36s ease",
      }}/>

      {/* Sheet */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 460,
        background: cardBg,
        borderRadius: "28px 28px 0 0",
        backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.06)"}`,
        borderBottom: "none",
        boxShadow: dark
          ? "0 -24px 80px rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.06)"
          : "0 -24px 80px rgba(13,11,30,0.14), 0 -1px 0 rgba(255,255,255,0.9)",
        transform: `translateY(${translateY})`,
        transition: "transform 0.46s cubic-bezier(0.22,1,0.36,1)",
        boxSizing: "border-box", willChange: "transform",
        overflow: "hidden",
      }}>
        <style>{`
          @keyframes fp-shake {
            0%,100%{transform:translateX(0)}
            15%,45%,75%{transform:translateX(-6px)}
            30%,60%{transform:translateX(6px)}
          }
          .fp-otp-shake { animation: fp-shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97); }
          .fp-resend-shake { animation: fp-shake 0.42s cubic-bezier(0.36,0.07,0.19,0.97); }
        `}</style>

        {/* Handle bar (decorative only — no dismiss) */}
        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 38, height: 5, borderRadius: 100,
            background: dark ? "rgba(255,255,255,0.14)" : "rgba(13,11,30,0.12)",
          }}/>
        </div>

        {/* Sliding panels */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            display: "flex",
            width: "200%",
            transform: step === 0 ? "translateX(0)" : "translateX(-50%)",
            transition: "transform 0.46s cubic-bezier(0.22,1,0.36,1)",
            alignItems: "flex-start",
          }}>

            {/* ── Panel 0: OTP ── */}
            <div style={{ width: "50%", boxSizing: "border-box", padding: "20px clamp(24px,6vw,36px) clamp(28px,7vw,40px)" }}>
              <h3 style={{
                fontSize: "clamp(20px,5vw,26px)", fontWeight: 800,
                color: headClr, margin: "0 0 6px", letterSpacing: "-0.04em", lineHeight: 1.1,
              }}>Reset Password</h3>
              <p style={{ fontSize: 14, color: subClr, margin: "0 0 16px", letterSpacing: "-0.01em", lineHeight: 1.6 }}>
                We sent a 6-digit code to{" "}
                <span style={{ color: headClr, fontWeight: 600 }}>{maskEmail(email)}</span>
              </p>


              {/* OTP boxes */}
              <div
                className={shakeOtp ? "fp-otp-shake" : ""}
                style={{ display: "flex", gap: "clamp(7px,2vw,9px)", marginBottom: 20, justifyContent: "center" }}
                onPaste={handlePaste}
              >
                {otp.map((val, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={val}
                    onFocus={e => e.target.select()}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    style={{
                      width: "clamp(42px,12vw,50px)", height: "clamp(50px,14vw,58px)",
                      borderRadius: 14,
                      border: `1.5px solid ${otpError && !val ? errClr : val ? accent : boxBorder}`,
                      background: val ? boxFocBg : boxBg,
                      fontSize: 22, fontWeight: 700, textAlign: "center",
                      color: boxTxt, fontFamily: "inherit", outline: "none",
                      boxSizing: "border-box", caretColor: accent,
                      transform: val ? "scale(1.06)" : "scale(1)",
                      boxShadow: val ? (dark ? "0 0 0 3px rgba(127,120,242,0.18)" : "0 0 0 3px rgba(79,70,229,0.12)") : "none",
                      transition: "border-color 0.2s, background 0.2s, transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s",
                    }}
                  />
                ))}
              </div>

              {/* Error */}
              {otpError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: dark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.06)",
                  border: `1px solid ${dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.14)"}`,
                  borderRadius: 12, padding: "9px 12px", marginBottom: 14,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                    <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 13, color: errClr, lineHeight: 1.5 }}>{otpError}</span>
                </div>
              )}

              {/* Timer / Resend — shakes if resend attempted too early */}
              <div
                className={shakeResend ? "fp-resend-shake" : ""}
                style={{ textAlign: "center", marginBottom: 16 }}
              >
                {expired ? (
                  <button
                    onClick={handleResendClick}
                    disabled={resendMutation.isPending}
                    style={{
                      background: "none", border: "none",
                      cursor: resendMutation.isPending ? "default" : "pointer",
                      fontSize: 13.5, fontWeight: 600, color: accent,
                      fontFamily: "inherit", letterSpacing: "-0.01em", padding: "4px 0",
                      opacity: resendMutation.isPending ? 0.6 : 1, transition: "opacity 0.18s",
                    }}
                  >
                    {resendMutation.isPending ? "Sending…" : "Resend OTP"}
                  </button>
                ) : (
                  <button
                    onClick={handleResendClick}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13, fontVariantNumeric: "tabular-nums",
                      color: timerClr, letterSpacing: "-0.01em",
                      fontFamily: "inherit", padding: "4px 0",
                    }}
                  >
                    Resend in{" "}
                    <strong style={{ fontWeight: 600 }}>{formatCountdown(remainingMs)}</strong>
                  </button>
                )}
              </div>

              {/* Change email — only way to close */}
              <button
                onClick={() => { setSheet(false); setTimeout(onClose, 400); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 7, marginTop: 8,
                  background: dark ? "rgba(255,255,255,0.04)" : "rgba(13,11,30,0.04)",
                  border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.08)"}`,
                  borderRadius: 12, cursor: "pointer",
                  padding: "11px 16px",
                  fontSize: 13.5, fontWeight: 500,
                  color: dark ? "rgba(200,197,245,0.55)" : "rgba(13,11,30,0.45)",
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  transition: "background 0.18s, border-color 0.18s, color 0.18s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(13,11,30,0.07)";
                  e.currentTarget.style.color = dark ? "rgba(200,197,245,0.80)" : "rgba(13,11,30,0.65)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(13,11,30,0.04)";
                  e.currentTarget.style.color = dark ? "rgba(200,197,245,0.55)" : "rgba(13,11,30,0.45)";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Change email address
              </button>
            </div>

            {/* ── Panel 1: New Password (only mounts after OTP confirmed) ── */}
            <div style={{ width: "50%", boxSizing: "border-box", padding: "20px clamp(24px,6vw,36px) clamp(28px,7vw,40px)" }}>
              {otpConfirmed && (
                <>
                  {pwSuccess ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 40px" }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: dark ? "rgba(52,211,153,0.12)" : "rgba(5,150,105,0.08)",
                        border: `1.5px solid ${dark ? "rgba(52,211,153,0.3)" : "rgba(5,150,105,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 20,
                      }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L20 7" stroke={successClr} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, color: headClr, margin: "0 0 8px", letterSpacing: "-0.04em" }}>
                        Password Updated!
                      </h3>
                      <p style={{ fontSize: 14, color: subClr, margin: 0, textAlign: "center", lineHeight: 1.6 }}>
                        Your password has been set. You can now sign in.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 style={{
                        fontSize: "clamp(20px,5vw,26px)", fontWeight: 800,
                        color: headClr, margin: "0 0 6px", letterSpacing: "-0.04em", lineHeight: 1.1,
                      }}>Set New Password</h3>
                      <p style={{ fontSize: 14, color: subClr, margin: "0 0 24px", letterSpacing: "-0.01em", lineHeight: 1.6 }}>
                        For <span style={{ color: headClr, fontWeight: 600 }}>{maskEmail(email)}</span> — must include a number and special character.
                      </p>

                      {pwErrors.general && (
                        <div style={{
                          display: "flex", alignItems: "flex-start", gap: 10,
                          background: dark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.06)",
                          border: `1px solid ${dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.14)"}`,
                          borderRadius: 12, padding: "11px 14px", marginBottom: 20,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                            <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
                          </svg>
                          <span style={{ fontSize: 13, color: errClr, lineHeight: 1.5 }}>{pwErrors.general}</span>
                        </div>
                      )}

                      {/* New password */}
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ position: "relative", height: FIELD_H }}>
                          <label style={labelStyle(!!(newPwF || newPw), newPwF, !!pwErrors.newPw)}>New Password</label>
                          <input
                            ref={newPwRef}
                            type={showNewPw ? "text" : "password"} value={newPw}
                            onChange={e => { setNewPw(e.target.value); setPwErrors(v => ({ ...v, newPw: undefined, general: undefined })); }}
                            onFocus={() => setNewPwF(true)}
                            onBlur={() => setNewPwF(false)}
                            onKeyDown={e => { if (e.key === "Enter") document.getElementById("fp-confirm-pw")?.focus(); }}
                            style={{ ...inputBase, right: 34 }}
                          />
                          <button type="button" onClick={() => setShowNewPw(s => !s)} style={{
                            position: "absolute", right: 0,
                            bottom: INPUT_PB + (INPUT_H - INPUT_PB) / 2 - 9,
                            width: 18, height: 18, background: "none", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: idleLbl, opacity: 0.55, padding: 0, transition: "opacity 0.18s",
                          }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}
                          >
                            {showNewPw
                              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/></svg>
                            }
                          </button>
                          <div style={{ ...underlineBase, background: pwErrors.newPw ? errClr : baseLine }}/>
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, height: 2, borderRadius: 2,
                            width: newPwF ? "100%" : "0%", background: pwErrors.newPw ? errClr : accent,
                            transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
                          }}/>
                        </div>
                        {pwErrors.newPw && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                              <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
                            </svg>
                            <p style={{ margin: 0, fontSize: 12, color: errClr }}>{pwErrors.newPw}</p>
                          </div>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ position: "relative", height: FIELD_H }}>
                          <label style={labelStyle(!!(confPwF || confirmPw), confPwF, !!pwErrors.confirmPw)}>Confirm Password</label>
                          <input
                            id="fp-confirm-pw"
                            type={showConfPw ? "text" : "password"} value={confirmPw}
                            onChange={e => { setConfirmPw(e.target.value); setPwErrors(v => ({ ...v, confirmPw: undefined })); }}
                            onFocus={() => setConfPwF(true)}
                            onBlur={() => setConfPwF(false)}
                            onKeyDown={e => { if (e.key === "Enter") handleSetPassword(); }}
                            style={{ ...inputBase, right: 34 }}
                          />
                          <button type="button" onClick={() => setShowConfPw(s => !s)} style={{
                            position: "absolute", right: 0,
                            bottom: INPUT_PB + (INPUT_H - INPUT_PB) / 2 - 9,
                            width: 18, height: 18, background: "none", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: idleLbl, opacity: 0.55, padding: 0, transition: "opacity 0.18s",
                          }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}
                          >
                            {showConfPw
                              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/></svg>
                            }
                          </button>
                          <div style={{ ...underlineBase, background: pwErrors.confirmPw ? errClr : baseLine }}/>
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, height: 2, borderRadius: 2,
                            width: confPwF ? "100%" : "0%", background: pwErrors.confirmPw ? errClr : accent,
                            transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
                          }}/>
                        </div>
                        {pwErrors.confirmPw && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
                              <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
                            </svg>
                            <p style={{ margin: 0, fontSize: 12, color: errClr }}>{pwErrors.confirmPw}</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button" onClick={handleSetPassword}
                        disabled={resetMutation.isPending}
                        onPointerDown={e => { e.currentTarget.style.transform = "scale(0.967)"; }}
                        onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                        onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                        style={{
                          width: "100%", height: 52, borderRadius: 16, border: "none",
                          cursor: resetMutation.isPending ? "default" : "pointer",
                          background: accentBtn, color: "#fff",
                          fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          boxShadow: btnShadow, fontFamily: "inherit",
                          opacity: resetMutation.isPending ? 0.75 : 1,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {resetMutation.isPending ? <Spinner size={18} /> : "Set Password"}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
