import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, resendOtp, AppError } from "../lib/api";
import { OtpSheet } from "./OtpSheet";

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

export function OtpModal({
  email, password, dark, accent, accentBtn, btnShadow,
  expiresAt, onSuccess, onClose, onNewExpiry,
}: Props) {
  const [error, setError] = useState("");

  const verifyMutation = useMutation({
    mutationFn: ({ code }: { code: string }) => verifyOtp(email, code, password),
    onSuccess: (result) => {
      onSuccess(result.email, result.role, result.sessionToken);
    },
    onError: (err) => {
      const e = err as AppError;
      setError(e.message ?? "Verification failed. Please try again.");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOtp(email),
    onSuccess: (result) => {
      onNewExpiry(result.expiresAt);
      setError("");
    },
    onError: (err) => {
      setError((err as AppError).message ?? "Failed to resend. Please try again.");
    },
  });

  function handleVerify(code: string) {
    setError("");
    verifyMutation.mutate({ code });
  }

  return (
    <OtpSheet
      email={email}
      dark={dark}
      accent={accent}
      accentBtn={accentBtn}
      btnShadow={btnShadow}
      expiresAt={expiresAt}
      title="Check your email"
      verifyLabel="Verify & Continue"
      verifying={verifyMutation.isPending}
      resending={resendMutation.isPending}
      error={error}
      onVerify={handleVerify}
      onResend={() => resendMutation.mutate()}
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
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
