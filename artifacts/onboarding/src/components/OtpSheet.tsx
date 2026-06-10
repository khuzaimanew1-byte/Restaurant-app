import { useState, useEffect, useRef } from "react";
import { Spinner, formatCountdown, useCountdown, useShake } from "../lib/shared";

export function maskEmail(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const local  = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 2) return `${local}***${domain}`;
  return `${local.slice(0, 2)}***${domain}`;
}

interface OtpSheetProps {
  email: string;
  dark: boolean;
  accent: string;
  accentBtn: string;
  btnShadow: string;
  expiresAt: number;
  title: string;
  verifyLabel?: string;
  verifying?: boolean;
  resending?: boolean;
  error?: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onClose: () => void;
  footer?: React.ReactNode;
}

export function OtpSheet({
  email, dark, accent, accentBtn, btnShadow,
  expiresAt, title, verifyLabel = "Verify & Continue",
  verifying = false, resending = false, error = "",
  onVerify, onResend, onClose,
  footer,
}: OtpSheetProps) {
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [sheetVisible, setSheet] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const remainingMs         = useCountdown(expiresAt);
  const [shake, triggerShake] = useShake();

  useEffect(() => { const id = setTimeout(() => setSheet(true), 20); return () => clearTimeout(id); }, []);
  useEffect(() => {
    if (sheetVisible) setTimeout(() => inputRefs.current[0]?.focus(), 320);
  }, [sheetVisible]);
  useEffect(() => {
    if (error) triggerShake();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[i]) { const n = [...otp]; n[i] = ""; setOtp(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    }
  }
  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = digit; setOtp(n);
    if (digit && i < 5) setTimeout(() => inputRefs.current[i + 1]?.focus(), 0);
    if (digit && i === 5 && n.every(d => d !== "") && remainingMs > 0) {
      onVerify(n.join(""));
    }
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const n = [...otp]; digits.forEach((d, i) => { n[i] = d; }); setOtp(n);
    setTimeout(() => inputRefs.current[Math.min(digits.length, 5)]?.focus(), 0);
    if (digits.length === 6 && remainingMs > 0) onVerify(digits.join(""));
  }
  function handleVerifyClick() {
    const code = otp.join("");
    if (code.length < 6 || remainingMs <= 0) return;
    onVerify(code);
  }

  const expired   = remainingMs <= 0;
  const filled    = otp.join("").length === 6;
  const canVerify = filled && !verifying && !expired;

  const cardBg    = dark ? "rgba(12,10,35,0.97)"   : "rgba(255,255,255,0.98)";
  const headClr   = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.52)" : "rgba(13,11,30,0.46)";
  const boxBorder = dark ? "rgba(255,255,255,0.11)" : "rgba(13,11,30,0.12)";
  const boxBg     = dark ? "rgba(255,255,255,0.04)" : "rgba(249,248,255,0.7)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.14)" : "rgba(79,70,229,0.06)";
  const boxTxt    = dark ? "rgba(242,241,255,0.96)" : "#09071E";
  const handleClr = dark ? "rgba(255,255,255,0.14)" : "rgba(13,11,30,0.12)";
  const errClr    = dark ? "#F87171" : "#DC2626";

  const verifyBg = canVerify
    ? accentBtn
    : filled && expired
      ? dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.12)"
      : dark ? "rgba(99,92,238,0.22)" : "rgba(79,70,229,0.14)";
  const verifyClr = canVerify
    ? "#fff"
    : filled && expired
      ? errClr
      : dark ? "rgba(200,197,245,0.38)" : "rgba(79,70,229,0.38)";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom,0)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.76)" : "rgba(13,11,30,0.50)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: sheetVisible ? 1 : 0,
        transition: "opacity 0.36s ease",
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
        transform: sheetVisible ? "translateY(0px)" : "translateY(100%)",
        transition: "transform 0.46s cubic-bezier(0.22,1,0.36,1)",
        boxSizing: "border-box", willChange: "transform",
        padding: "0 clamp(24px,6vw,36px) clamp(32px,8vw,48px)",
      }}>

        <div style={{
          padding: "16px 0 24px", display: "flex", justifyContent: "center",
          cursor: "default", userSelect: "none", margin: "0 -36px",
        }}>
          <div style={{ width: 38, height: 5, borderRadius: 100, background: handleClr }}/>
        </div>

        <h3 style={{
          fontSize: "clamp(24px,6vw,30px)", fontWeight: 800,
          color: headClr, margin: "0 0 8px", letterSpacing: "-0.045em", lineHeight: 1.1,
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 14.5, color: subClr, margin: "0 0 32px",
          letterSpacing: "-0.01em", lineHeight: 1.6,
        }}>
          We sent a 6-digit code to{" "}
          <span style={{ color: headClr, fontWeight: 600 }}>{maskEmail(email)}</span>
        </p>

        {verifying && (
          <div style={{
            position: "absolute", top: 20, right: 24,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Spinner size={14} />
            <span style={{ fontSize: 12, color: subClr }}>Verifying…</span>
          </div>
        )}

        <div
          className={shake ? "otp-shake" : ""}
          style={{ display: "flex", gap: "clamp(7px,2.2vw,10px)", marginBottom: 28, justifyContent: "center" }}
          onPaste={handlePaste}
        >
          {otp.map((val, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={val}
              onFocus={e => e.target.select()}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={{
                width: "clamp(44px,13vw,52px)", height: "clamp(56px,16vw,64px)",
                borderRadius: 16,
                border: `1.5px solid ${error && !val ? errClr : val ? accent : boxBorder}`,
                background: val ? boxFocBg : boxBg,
                fontSize: 24, fontWeight: 700, textAlign: "center",
                color: boxTxt, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", caretColor: accent,
                transform: val ? "scale(1.06)" : "scale(1)",
                boxShadow: val ? (dark ? "0 0 0 3px rgba(127,120,242,0.18)" : "0 0 0 3px rgba(79,70,229,0.12)") : "none",
                transition: "border-color 0.2s ease, background 0.2s ease, transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease",
              }}
            />
          ))}
        </div>

        {verifying && (
          <div style={{
            width: "100%", height: 54, borderRadius: 16, marginBottom: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: dark ? "rgba(99,92,238,0.22)" : "rgba(79,70,229,0.14)",
          }}>
            <Spinner size={18} />
            <span style={{ fontSize: 15, fontWeight: 600, color: dark ? "rgba(200,197,245,0.6)" : "rgba(79,70,229,0.6)" }}>Verifying…</span>
          </div>
        )}

        {(error || expired) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: dark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.06)",
            border: `1px solid ${dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.14)"}`,
            borderRadius: 12, padding: "10px 14px", marginBottom: 14,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9" stroke={errClr} strokeWidth="2"/>
              <path d="M12 8v5M12 16v.5" stroke={errClr} strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 13, color: errClr, lineHeight: 1.5 }}>
              {error || "OTP expired. Request a new code to continue."}
            </span>
          </div>
        )}

        {!verifying && (
          <button
            onClick={handleVerifyClick}
            disabled={!canVerify}
            style={{
              width: "100%", height: 54, borderRadius: 16, border: "none",
              cursor: canVerify ? "pointer" : "default",
              background: verifyBg, color: verifyClr,
              fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: canVerify ? btnShadow : "none",
              transition: "background 0.25s, box-shadow 0.2s, color 0.22s",
              fontFamily: "inherit", marginBottom: 14,
            }}
          >
            {verifyLabel}
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: footer ? 16 : 0 }}>
          {expired ? (
            <button
              onClick={onResend}
              disabled={resending}
              style={{
                background: "none", border: "none",
                cursor: resending ? "default" : "pointer",
                fontSize: 13.5, fontWeight: 600, color: accent,
                fontFamily: "inherit", letterSpacing: "-0.01em", padding: "4px 0",
                opacity: resending ? 0.6 : 1, transition: "opacity 0.18s ease",
              }}
            >
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          ) : (
            <span style={{
              fontSize: 13, fontVariantNumeric: "tabular-nums",
              color: dark ? "rgba(200,197,245,0.32)" : "rgba(13,11,30,0.28)",
              letterSpacing: "-0.01em",
            }}>
              Resend in{" "}
              <strong style={{ fontWeight: 600 }}>{formatCountdown(remainingMs)}</strong>
            </span>
          )}
        </div>

        {footer}
      </div>
    </div>
  );
}
