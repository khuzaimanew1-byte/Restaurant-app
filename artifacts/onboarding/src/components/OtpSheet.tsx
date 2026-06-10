import { useState, useEffect, useRef } from "react";
import { Spinner, formatCountdown, useCountdown, useShake, AlertBox, BottomSheet, useFormColors } from "../lib/shared";

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
  const [otp, setOtp]            = useState(["", "", "", "", "", ""]);
  const [sheetVisible, setSheet] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const remainingMs           = useCountdown(expiresAt);
  const [shake, triggerShake] = useShake();
  const { headClr, subClr }   = useFormColors(dark);

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
    if (digit && i === 5 && n.every(d => d !== "") && remainingMs > 0) onVerify(n.join(""));
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

  const boxBorder = dark ? "rgba(255,255,255,0.11)" : "rgba(13,11,30,0.12)";
  const boxBg     = dark ? "rgba(255,255,255,0.04)" : "rgba(249,248,255,0.7)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.14)" : "rgba(79,70,229,0.06)";
  const boxTxt    = dark ? "rgba(242,241,255,0.96)" : "#09071E";

  const verifyBg = canVerify
    ? accentBtn
    : filled && expired
      ? dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.12)"
      : dark ? "rgba(99,92,238,0.22)" : "rgba(79,70,229,0.14)";
  const verifyClr = canVerify ? "#fff"
    : filled && expired
      ? dark ? "#F87171" : "#DC2626"
      : dark ? "rgba(200,197,245,0.38)" : "rgba(79,70,229,0.38)";

  return (
    <BottomSheet dark={dark} visible={sheetVisible} zIndex={200}>
      <div style={{ padding: "0 clamp(24px,6vw,36px) clamp(28px,7vw,44px)", position: "relative" }}>

        {verifying && (
          <div style={{ position: "absolute", top: -4, right: "clamp(24px,6vw,36px)", display: "flex", alignItems: "center", gap: 6 }}>
            <Spinner size={14} />
            <span style={{ fontSize: 12, color: subClr }}>Verifying…</span>
          </div>
        )}

        <h3 style={{
          fontSize: "clamp(24px,6vw,30px)", fontWeight: 800,
          color: headClr, margin: "0 0 8px", letterSpacing: "-0.045em", lineHeight: 1.1,
        }}>
          {title}
        </h3>
        <p style={{ fontSize: 14.5, color: subClr, margin: "0 0 28px", letterSpacing: "-0.01em", lineHeight: 1.6 }}>
          We sent a 6-digit code to{" "}
          <span style={{ color: headClr, fontWeight: 600 }}>{maskEmail(email)}</span>
        </p>

        <div
          className={shake ? "otp-shake" : ""}
          style={{ display: "flex", gap: "clamp(7px,2.2vw,10px)", marginBottom: 24, justifyContent: "center" }}
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
                border: `1.5px solid ${error && !val ? (dark ? "#F87171" : "#DC2626") : val ? accent : boxBorder}`,
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

        {(error || expired) && (
          <AlertBox
            message={error || "OTP expired. Request a new code to continue."}
            dark={dark}
            mb={14}
          />
        )}

        {verifying ? (
          <div style={{
            width: "100%", height: 54, borderRadius: 16, marginBottom: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: dark ? "rgba(99,92,238,0.22)" : "rgba(79,70,229,0.14)",
          }}>
            <Spinner size={18} />
            <span style={{ fontSize: 15, fontWeight: 600, color: dark ? "rgba(200,197,245,0.6)" : "rgba(79,70,229,0.6)" }}>Verifying…</span>
          </div>
        ) : (
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

        <div style={{ textAlign: "center", marginBottom: footer ? 14 : 4 }}>
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
    </BottomSheet>
  );
}
