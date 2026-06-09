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
      closeable={true}
      onVerify={handleVerify}
      onResend={() => resendMutation.mutate()}
      onClose={onClose}
    />
  );
}
