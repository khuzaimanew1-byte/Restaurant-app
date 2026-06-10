import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordRequest, resetPassword, AppError } from "../lib/api";
import { Spinner, validatePwComplexity, PW_NUM, PW_UPPER, PW_SPECIAL, PwRequirements } from "../lib/shared";
import { OtpSheet, maskEmail } from "./OtpSheet";

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


export function ForgotPasswordModal({
  email, initialExpiresAt, dark, accent, accentBtn, btnShadow, onClose, onPasswordReset, onNewExpiry,
}: Props) {
  const [step, setStep]             = useState<0 | 1>(0);
  const [savedOtp, setSavedOtp]     = useState("");
  const [expiresAt, setExpiry]      = useState(initialExpiresAt);
  const [otpError, setOtpError]     = useState("");
  const [resending, setResending]   = useState(false);

  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showNewPw, setShowNewPw]   = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [pwErrors, setPwErrors]     = useState<{ newPw?: string; confirmPw?: string; general?: string }>({});
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [newPwF, setNewPwF]         = useState(false);
  const [confPwF, setConfPwF]       = useState(false);
  const [step1Visible, setStep1Vis] = useState(false);
  const newPwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) {
      const id = setTimeout(() => { setStep1Vis(true); newPwRef.current?.focus(); }, 80);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [step]);

  const resendMutation = useMutation({
    mutationFn: () => forgotPasswordRequest(email),
    onSuccess: (r) => {
      setExpiry(r.expiresAt);
      setOtpError("");
      onNewExpiry?.(r.expiresAt);
      setResending(false);
    },
    onError: (err) => {
      const e = err as AppError;
      if (e.code === "SESSION_ACTIVE" && e.expiresAt) {
        setExpiry(e.expiresAt);
        setOtpError("An OTP is already active. Please check your email.");
      } else {
        setOtpError(e.message ?? "Failed to resend. Please try again.");
      }
      setResending(false);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetPassword(email, savedOtp, newPw, confirmPw),
    onSuccess: () => {
      setPwSuccess(true);
      setTimeout(() => { onPasswordReset(); onClose(); }, 1_500);
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

  function handleVerify(code: string) {
    if (code.length < 6) { setOtpError("Please enter the full 6-digit code."); return; }
    setSavedOtp(code);
    setOtpError("");
    setStep(1);
  }

  function handleResend() {
    setResending(true);
    resendMutation.mutate();
  }

  function handleSetPassword() {
    const e: typeof pwErrors = {};
    const newPwErr = validatePwComplexity(newPw);
    if (newPwErr) e.newPw = newPwErr;
    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (newPw !== confirmPw) e.confirmPw = "Passwords do not match.";
    setPwErrors(e);
    if (Object.keys(e).length > 0) return;
    resetMutation.mutate();
  }

  const cardBg    = dark ? "rgba(12,10,35,0.97)"   : "rgba(255,255,255,0.98)";
  const headClr   = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.52)" : "rgba(13,11,30,0.46)";
  const errClr    = dark ? "#F87171" : "#DC2626";
  const baseLine  = dark ? "rgba(255,255,255,0.09)" : "rgba(13,11,30,0.13)";
  const inputTxt  = dark ? "rgba(238,237,255,0.93)" : "#09071E";
  const idleLbl   = dark ? "rgba(200,197,245,0.36)" : "rgba(13,11,30,0.36)";
  const activeLbl = dark ? "rgba(200,197,245,0.60)" : "rgba(13,11,30,0.52)";
  const successClr = dark ? "#34D399" : "#059669";

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

  function sweepLine(focused: boolean, err: boolean): React.CSSProperties {
    return {
      position: "absolute", bottom: 0, left: 0,
      height: 2, borderRadius: 2,
      width: focused ? "100%" : "0%",
      background: err ? errClr : accent,
      transition: "width 0.38s cubic-bezier(0.22,1,0.36,1)",
    };
  }

  if (step === 0) {
    return (
      <OtpSheet
        email={email}
        dark={dark}
        accent={accent}
        accentBtn={accentBtn}
        btnShadow={btnShadow}
        expiresAt={expiresAt}
        title="Reset Password"
        verifyLabel="Confirm & Continue"
        verifying={false}
        resending={resending}
        error={otpError}
        onVerify={handleVerify}
        onResend={handleResend}
        onClose={onClose}
        footer={
          <button
            onClick={() => { onClose(); }}
            style={{
              marginTop: 12,
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 7,
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
            Change email
          </button>
        }
      />
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.76)" : "rgba(13,11,30,0.50)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: step1Visible ? 1 : 0, transition: "opacity 0.36s ease",
      }}/>

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
        transform: step1Visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.46s cubic-bezier(0.22,1,0.36,1), opacity 0.36s ease",
        boxSizing: "border-box", willChange: "transform",
        overflow: "hidden",
      }}>
        <style>{`
          @keyframes fp-shake {
            0%,100%{transform:translateX(0)}
            15%,45%,75%{transform:translateX(-6px)}
            30%,60%{transform:translateX(6px)}
          }
        `}</style>

        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 5, borderRadius: 100, background: dark ? "rgba(255,255,255,0.14)" : "rgba(13,11,30,0.12)" }}/>
        </div>

        <div style={{ padding: "20px clamp(24px,6vw,36px) clamp(32px,8vw,48px)" }}>
          {pwSuccess ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 20px" }}>
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
                fontSize: "clamp(24px,6vw,30px)", fontWeight: 800,
                color: headClr, margin: "0 0 8px", letterSpacing: "-0.045em", lineHeight: 1.1,
              }}>Set New Password</h3>
              <p style={{ fontSize: 14.5, color: subClr, margin: "0 0 28px", letterSpacing: "-0.01em", lineHeight: 1.6 }}>
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
                    width: 18, height: 18,
                    background: "none", border: "none", cursor: "pointer",
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
                  <div style={sweepLine(newPwF, !!pwErrors.newPw)}/>
                </div>
                <PwRequirements pw={newPw} dark={dark} />
                {pwErrors.newPw && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{pwErrors.newPw}</p>
                )}
              </div>

              <div style={{ marginBottom: 28 }}>
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
                    width: 18, height: 18,
                    background: "none", border: "none", cursor: "pointer",
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
                  <div style={sweepLine(confPwF, !!pwErrors.confirmPw)}/>
                </div>
                {pwErrors.confirmPw && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: errClr, letterSpacing: "-0.01em" }}>{pwErrors.confirmPw}</p>
                )}
              </div>

              <button
                type="button"
                disabled={resetMutation.isPending}
                onClick={handleSetPassword}
                onPointerDown={e => { if (!resetMutation.isPending) e.currentTarget.style.transform = "scale(0.97)"; }}
                onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  width: "100%", height: 54, borderRadius: 16, border: "none",
                  cursor: resetMutation.isPending ? "default" : "pointer",
                  background: accentBtn, color: "#fff",
                  fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: btnShadow,
                  transition: "transform 0.12s ease, box-shadow 0.25s ease",
                  fontFamily: "inherit",
                  opacity: resetMutation.isPending ? 0.8 : 1,
                }}
              >
                {resetMutation.isPending ? <Spinner size={18} /> : "Set Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
