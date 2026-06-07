import { useState, useEffect, useRef } from "react";
import { verifyOtp, resendOtp, AppError } from "../lib/api";

interface Props {
  email: string;
  password: string;
  dark: boolean;
  accent: string;
  accentBtn: string;
  btnShadow: string;
  expiresAt: number;
  onSuccess: (email: string, role: string) => void;
  onClose: () => void;
  onNewExpiry: (expiresAt: number) => void;
}

export function OtpModal({
  email, password, dark, accent, accentBtn, btnShadow,
  expiresAt, onSuccess, onClose, onNewExpiry,
}: Props) {
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [sheetVisible, setSheet] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [resending, setResend]  = useState(false);
  const [error, setError]       = useState("");
  const [remainingMs, setMs]    = useState(() => Math.max(0, expiresAt - Date.now()));
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY]       = useState(0);
  const startY                  = useRef(0);
  const inputRefs               = useRef<(HTMLInputElement | null)[]>([]);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Mount animation */
  useEffect(() => {
    const id = setTimeout(() => setSheet(true), 20);
    return () => clearTimeout(id);
  }, []);

  /* Sync expiresAt when it changes (e.g. after resend) */
  useEffect(() => {
    setMs(Math.max(0, expiresAt - Date.now()));
  }, [expiresAt]);

  /* Live countdown — display only, backend is source of truth */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now());
      setMs(left);
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expiresAt]);

  /* Auto-focus first box */
  useEffect(() => {
    if (sheetVisible) setTimeout(() => inputRefs.current[0]?.focus(), 320);
  }, [sheetVisible]);

  /* ── Touch drag to close ── */
  function onTouchStart(e: React.TouchEvent) { startY.current = e.touches[0].clientY; setDragging(true); }
  function onTouchMove(e: React.TouchEvent) { setDragY(Math.max(0, e.touches[0].clientY - startY.current)); }
  function onTouchEnd() {
    setDragging(false);
    if (dragY > 90) dismiss();
    else setDragY(0);
  }

  function dismiss() {
    setSheet(false);
    setDragY(0);
    setTimeout(() => onClose(), 400);
  }

  /* ── OTP input ── */
  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[i]) { const n = [...otp]; n[i] = ""; setOtp(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerify();
    }
  }
  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = digit; setOtp(n);
    if (digit && i < 5) setTimeout(() => inputRefs.current[i + 1]?.focus(), 0);
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const n = [...otp]; digits.forEach((d, i) => { n[i] = d; }); setOtp(n);
    const last = Math.min(digits.length, 5);
    setTimeout(() => inputRefs.current[last]?.focus(), 0);
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the full 6-digit code."); return; }
    if (remainingMs <= 0) { setError("OTP expired. Request a new OTP to continue."); return; }

    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(email, code, password);
      setSheet(false);
      setTimeout(() => onSuccess(result.email, result.role), 400);
    } catch (err) {
      const e = err as AppError;
      setError(e.message ?? "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResend(true);
    setError("");
    try {
      const result = await resendOtp(email);
      onNewExpiry(result.expiresAt);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const e = err as AppError;
      setError(e.message ?? "Failed to resend. Please try again.");
    } finally {
      setResend(false);
    }
  }

  const filled      = otp.join("").length === 6;
  const totalSecs   = Math.ceil(remainingMs / 1000);
  const mins        = Math.floor(totalSecs / 60);
  const secs        = totalSecs % 60;
  const expired     = remainingMs <= 0;
  const timerStr    = `${mins}:${String(secs).padStart(2, "0")}`;
  const urgentTimer = totalSecs <= 60 && !expired;

  /* Colors */
  const cardBg    = dark ? "rgba(12,10,35,0.97)"    : "rgba(255,255,255,0.98)";
  const headClr   = dark ? "rgba(242,241,255,0.97)"  : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.52)"  : "rgba(13,11,30,0.46)";
  const boxBorder = dark ? "rgba(255,255,255,0.11)"  : "rgba(13,11,30,0.12)";
  const boxBg     = dark ? "rgba(255,255,255,0.04)"  : "rgba(249,248,255,0.7)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.14)"  : "rgba(79,70,229,0.06)";
  const boxTxt    = dark ? "rgba(242,241,255,0.96)"  : "#09071E";
  const mutedClr  = dark ? "rgba(200,197,245,0.36)"  : "rgba(13,11,30,0.30)";
  const handleClr = dark ? "rgba(255,255,255,0.14)"  : "rgba(13,11,30,0.12)";
  const timerClr  = urgentTimer ? (dark ? "#F87171" : "#DC2626") : (dark ? "#A78BFA" : "#7C3AED");
  const errClr    = dark ? "#F87171" : "#DC2626";

  const translateY = sheetVisible ? `${dragY}px` : "100%";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom,0)",
      }}
      onClick={e => e.target === e.currentTarget && dismiss()}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.76)" : "rgba(13,11,30,0.50)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: sheetVisible ? 1 : 0,
        transition: "opacity 0.36s ease",
      }} onClick={dismiss}/>

      {/* Sheet */}
      <div
        style={{
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
          transition: dragging ? "none" : "transform 0.46s cubic-bezier(0.22,1,0.36,1)",
          boxSizing: "border-box",
          willChange: "transform",
          padding: "0 clamp(24px,6vw,36px) clamp(36px,9vw,52px)",
        }}
      >
        {/* Drag handle */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            padding: "16px 0 20px",
            display: "flex", justifyContent: "center",
            cursor: "grab", userSelect: "none",
            margin: "0 -36px", touchAction: "none",
          }}
        >
          <div style={{ width: 38, height: 5, borderRadius: 100, background: handleClr }}/>
        </div>

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
          fontSize: 14.5, color: subClr, margin: "0 0 28px",
          letterSpacing: "-0.01em", lineHeight: 1.55,
        }}>
          We sent a 6-digit code to{" "}
          <span style={{ color: headClr, fontWeight: 600 }}>{email}</span>
        </p>

        {/* OTP boxes */}
        <div
          style={{ display: "flex", gap: "clamp(7px,2.2vw,10px)", marginBottom: 20, justifyContent: "center" }}
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
                border: `1.5px solid ${error && !val ? errClr : val ? accent : boxBorder}`,
                background: val ? boxFocBg : boxBg,
                fontSize: 22, fontWeight: 700, textAlign: "center",
                color: boxTxt, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                caretColor: "transparent",
                transform: val ? "scale(1.05)" : "scale(1)",
                boxShadow: val
                  ? dark ? "0 0 0 3px rgba(167,139,250,0.15)" : "0 0 0 3px rgba(124,58,237,0.1)"
                  : "none",
                transition: "border-color 0.2s ease, background 0.2s ease, transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <div style={{
          textAlign: "center", marginBottom: 20,
          fontSize: 13, color: mutedClr, letterSpacing: "-0.01em",
        }}>
          {expired ? (
            <span style={{ color: errClr }}>OTP expired. Request a new OTP to continue.</span>
          ) : (
            <>
              OTP expires in{" "}
              <strong style={{
                color: timerClr,
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
                transition: "color 0.3s ease",
              }}>
                {timerStr}
              </strong>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: dark ? "rgba(248,113,113,0.1)" : "rgba(220,38,38,0.07)",
            border: `1px solid ${dark ? "rgba(248,113,113,0.22)" : "rgba(220,38,38,0.18)"}`,
            borderRadius: 12, padding: "10px 14px",
            marginBottom: 16,
            fontSize: 13, color: errClr, lineHeight: 1.5,
            whiteSpace: "pre-line",
          }}>
            {error}
          </div>
        )}

        {/* Verify button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={!filled || loading || expired}
          onPointerDown={e => { if (filled && !expired) (e.currentTarget).style.transform = "scale(0.97)"; }}
          onPointerUp={e => { (e.currentTarget).style.transform = "scale(1)"; }}
          onPointerLeave={e => { (e.currentTarget).style.transform = "scale(1)"; }}
          style={{
            width: "100%", height: 54, borderRadius: 16, border: "none",
            cursor: filled && !loading && !expired ? "pointer" : "default",
            background: filled && !expired ? accentBtn : dark ? "rgba(255,255,255,0.06)" : "rgba(13,11,30,0.06)",
            color: filled && !expired ? "#fff" : mutedClr,
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: filled && !loading && !expired ? btnShadow : "none",
            transition: "background 0.28s ease, box-shadow 0.25s ease, color 0.22s ease",
            fontFamily: "inherit", marginBottom: 16,
          }}
        >
          {loading ? <Spinner /> : "Verify & Continue"}
        </button>

        {/* Resend */}
        <div style={{ textAlign: "center" }}>
          {expired ? (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none", border: "none", cursor: resending ? "default" : "pointer",
                fontSize: 13, color: accent, fontWeight: 600,
                fontFamily: "inherit", letterSpacing: "-0.01em", padding: "4px 0",
                opacity: resending ? 0.6 : 1,
              }}>
              {resending ? "Sending…" : "Resend code"}
            </button>
          ) : (
            <span style={{
              fontSize: 13, color: mutedClr, letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
            }}>
              Resend in <strong style={{ color: subClr }}>{timerStr}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.28)",
      borderTopColor: "#fff", display: "inline-block",
      animation: "spin 0.72s linear infinite",
    }}/>
  );
}
