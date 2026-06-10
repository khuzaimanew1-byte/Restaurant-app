import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordRequest, resetPassword, AppError } from "../lib/api";
import { Spinner, validatePwComplexity, PW_NUM, PW_UPPER, PW_SPECIAL, PwRequirements, FieldError, BottomSheet, AlertBox, PasswordToggle, formField, useFormColors } from "../lib/shared";
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
  externalVisible?: boolean;
}


export function ForgotPasswordModal({
  email, initialExpiresAt, dark, accent, accentBtn, btnShadow, onClose, onPasswordReset, onNewExpiry,
  externalVisible,
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

  useEffect(() => {
    if (externalVisible === false) setStep1Vis(false);
  }, [externalVisible]);

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

  const { headClr, subClr, successClr }                                          = useFormColors(dark);
  const { errClr, FIELD_H, inputBase, labelStyle, sweepLine, underlineStyle } = formField(dark, accent);

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
        externalVisible={externalVisible}
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
    <BottomSheet dark={dark} visible={step1Visible && externalVisible !== false} zIndex={200}>
      <div style={{ padding: "6px clamp(24px,6vw,36px) clamp(32px,8vw,48px)" }}>
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

              {pwErrors.general && <AlertBox message={pwErrors.general} dark={dark} mb={20} />}

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
                  <PasswordToggle shown={showNewPw} onToggle={() => setShowNewPw(s => !s)} dark={dark} />
                  <div style={underlineStyle(!!pwErrors.newPw)}/>
                  <div style={sweepLine(newPwF, !!pwErrors.newPw)}/>
                </div>
                <PwRequirements pw={newPw} dark={dark} />
                <FieldError message={pwErrors.newPw} dark={dark} />
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
                  <PasswordToggle shown={showConfPw} onToggle={() => setShowConfPw(s => !s)} dark={dark} />
                  <div style={underlineStyle(!!pwErrors.confirmPw)}/>
                  <div style={sweepLine(confPwF, !!pwErrors.confirmPw)}/>
                </div>
                <FieldError message={pwErrors.confirmPw} dark={dark} />
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
    </BottomSheet>
  );
}
