import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, resendOtp, AppError } from "../lib/api";
import { Spinner, formatCountdown } from "../lib/shared";

interface Props {
  email: string;
  password: string;
  dark: boolean;
  accent: string;
  accentBtn: string;
  btnShadow: string;
  expiresAt: number;
  onSuccess: (email: string, role: string, sessionToken: string) => void;
  onClose: () => void;
  onNewExpiry: (expiresAt: number) => void;
}

function maskEmail(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const local  = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 2) return `${local}***${domain}`;
  return `${local.slice(0, 2)}***${domain}`;
}

export function OtpModal({
  email, password, dark, accent, accentBtn, btnShadow,
  expiresAt, onSuccess, onClose, onNewExpiry,
}: Props) {
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [sheetVisible, setSheet] = useState(false);
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);
  const [remainingMs, setMs]    = useState(() => Math.max(0, expiresAt - Date.now()));
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY]       = useState(0);
  const startY     = useRef(0);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>();
  const inputRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function triggerShake() {
    setShake(false);
    clearTimeout(shakeTimer.current);
    requestAnimationFrame(() => {
      setShake(true);
      shakeTimer.current = setTimeout(() => setShake(false), 450);
    });
  }

  useEffect(() => { const id = setTimeout(() => setSheet(true), 20); return () => clearTimeout(id); }, []);
  useEffect(() => { setMs(Math.max(0, expiresAt - Date.now())); }, [expiresAt]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setMs(Math.max(0, expiresAt - Date.now())), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expiresAt]);

  useEffect(() => {
    if (sheetVisible) setTimeout(() => inputRefs.current[0]?.focus(), 320);
  }, [sheetVisible]);

  function onTouchStart(e: React.TouchEvent) { startY.current = e.touches[0].clientY; setDragging(true); }
  function onTouchMove(e: React.TouchEvent)  { setDragY(Math.max(0, e.touches[0].clientY - startY.current)); }
  function onTouchEnd() {
    setDragging(false);
    if (dragY > 90) dismiss(); else setDragY(0);
  }

  function dismiss() { setSheet(false); setDragY(0); setTimeout(() => onClose(), 400); }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[i]) { const n = [...otp]; n[i] = ""; setOtp(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    }
  }
  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = digit; setOtp(n);
    if (digit && i < 5) {
      setTimeout(() => inputRefs.current[i + 1]?.focus(), 0);
    }
    if (digit && i === 5 && n.every(d => d !== "")) {
      const code = n.join("");
      if (remainingMs > 0) {
        setError("");
        setTimeout(() => verifyMutation.mutate({ code }), 60);
      }
    }
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const n = [...otp]; digits.forEach((d, i) => { n[i] = d; }); setOtp(n);
    setTimeout(() => inputRefs.current[Math.min(digits.length, 5)]?.focus(), 0);
    if (digits.length === 6 && remainingMs > 0) {
      const code = digits.join("");
      setError("");
      setTimeout(() => verifyMutation.mutate({ code }), 60);
    }
  }

  const verifyMutation = useMutation({
    mutationFn: ({ code }: { code: string }) => verifyOtp(email, code, password),
    onSuccess: (result) => {
      setSheet(false);
      setTimeout(() => onSuccess(result.email, result.role, result.sessionToken), 400);
    },
    onError: (err) => {
      const e = err as AppError;
      setError(e.message ?? "Verification failed. Please try again.");
      triggerShake();
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOtp(email),
    onSuccess: (result) => {
      onNewExpiry(result.expiresAt);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: (err) => {
      setError((err as AppError).message ?? "Failed to resend. Please try again.");
    },
  });

  const loading  = verifyMutation.isPending;
  const resending = resendMutation.isPending;
  const filled   = otp.join("").length === 6;
  const expired  = remainingMs <= 0;

  const cardBg    = dark ? "rgba(12,10,35,0.97)"   : "rgba(255,255,255,0.98)";
  const headClr   = dark ? "rgba(242,241,255,0.97)" : "#09071E";
  const subClr    = dark ? "rgba(200,197,245,0.52)" : "rgba(13,11,30,0.46)";
  const boxBorder = dark ? "rgba(255,255,255,0.11)" : "rgba(13,11,30,0.12)";
  const boxBg     = dark ? "rgba(255,255,255,0.04)" : "rgba(249,248,255,0.7)";
  const boxFocBg  = dark ? "rgba(127,120,242,0.14)" : "rgba(79,70,229,0.06)";
  const boxTxt    = dark ? "rgba(242,241,255,0.96)" : "#09071E";
  const handleClr = dark ? "rgba(255,255,255,0.14)" : "rgba(13,11,30,0.12)";
  const errClr    = dark ? "#F87171" : "#DC2626";
  const translateY = sheetVisible ? `${dragY}px` : "100%";

  const canVerify  = filled && !loading && !expired;
  const verifyBg   = canVerify
    ? accentBtn
    : filled && expired
      ? dark ? "rgba(248,113,113,0.2)" : "rgba(220,38,38,0.12)"
      : dark ? "rgba(99,92,238,0.22)" : "rgba(79,70,229,0.14)";
  const verifyClr  = canVerify
    ? "#fff"
    : filled && expired
      ? errClr
      : dark ? "rgba(200,197,245,0.38)" : "rgba(79,70,229,0.38)";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom,0)",
      }}
      onClick={e => e.target === e.currentTarget && dismiss()}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(4,3,20,0.76)" : "rgba(13,11,30,0.50)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: sheetVisible ? 1 : 0,
        transition: "opacity 0.36s ease",
      }} onClick={dismiss}/>

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
        transition: dragging ? "none" : "transform 0.46s cubic-bezier(0.22,1,0.36,1)",
        boxSizing: "border-box", willChange: "transform",
        padding: "0 clamp(24px,6vw,36px) clamp(32px,8vw,48px)",
      }}>

        <div
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{
            padding: "16px 0 24px", display: "flex", justifyContent: "center",
            cursor: "grab", userSelect: "none", margin: "0 -36px", touchAction: "none",
          }}
        >
          <div style={{ width: 38, height: 5, borderRadius: 100, background: handleClr }}/>
        </div>

        {!expired && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: dark ? "rgba(79,70,229,0.10)" : "rgba(79,70,229,0.06)",
            border: `1px solid ${dark ? "rgba(127,120,242,0.28)" : "rgba(79,70,229,0.18)"}`,
            borderRadius: 12, padding: "9px 13px", marginBottom: 20,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" stroke={dark ? "#9992F5" : "#4F46E5"} strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke={dark ? "#9992F5" : "#4F46E5"} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontSize: 12.5, fontWeight: 600, flex: 1,
              color: dark ? "rgba(200,197,245,0.88)" : "#3730A3",
              letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
            }}>
              OTP active · expires in{" "}
              <strong style={{ fontWeight: 700 }}>{formatCountdown(remainingMs)}</strong>
            </span>
          </div>
        )}

        <h3 style={{
          fontSize: "clamp(24px,6vw,30px)", fontWeight: 800,
          color: headClr, margin: "0 0 8px", letterSpacing: "-0.045em", lineHeight: 1.1,
        }}>
          Check your email
        </h3>
        <p style={{
          fontSize: 14.5, color: subClr, margin: "0 0 32px",
          letterSpacing: "-0.01em", lineHeight: 1.6,
        }}>
          We sent a 6-digit code to{" "}
          <span style={{ color: headClr, fontWeight: 600 }}>{maskEmail(email)}</span>
        </p>

        {loading && (
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

        <button
          type="button"
          disabled={!filled || loading}
          onPointerDown={e => { if (canVerify) e.currentTarget.style.transform = "scale(0.97)"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onClick={() => {
            const code = otp.join("");
            if (!filled || remainingMs <= 0) return;
            verifyMutation.mutate({ code });
          }}
          style={{
            width: "100%", height: 54, borderRadius: 16, border: "none",
            cursor: canVerify ? "pointer" : "default",
            background: verifyBg,
            color: verifyClr,
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: canVerify ? btnShadow : "none",
            transition: "background 0.28s ease, box-shadow 0.25s ease, color 0.22s ease",
            fontFamily: "inherit", marginBottom: 14,
          }}
        >
          {loading ? <Spinner size={18} /> : "Verify & Continue"}
        </button>

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

        <div style={{ textAlign: "center" }}>
          {expired ? (
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resending}
              style={{
                background: "none", border: "none",
                cursor: resending ? "default" : "pointer",
                fontSize: 13.5, fontWeight: 600,
                color: accent,
                fontFamily: "inherit", letterSpacing: "-0.01em", padding: "4px 0",
                opacity: resending ? 0.6 : 1,
                transition: "opacity 0.18s ease",
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
              <strong style={{ fontWeight: 600 }}>
                {formatCountdown(remainingMs)}
              </strong>
            </span>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            type="button"
            onClick={dismiss}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              color: dark ? "rgba(200,197,245,0.42)" : "rgba(13,11,30,0.38)",
              fontFamily: "inherit", letterSpacing: "-0.01em", padding: "4px 0",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}
          >
            ← Change email address
          </button>
        </div>
      </div>
    </div>
  );
}
