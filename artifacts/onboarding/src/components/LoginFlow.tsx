import { useState, useRef, useCallback, useEffect, KeyboardEvent, ClipboardEvent } from "react";

// ── Types ──────────────────────────────────────────────────────────────
type Screen     = "signin" | "otp" | "reset-password";
type OtpPurpose = "login"  | "reset";

// ── Password validation ────────────────────────────────────────────────
const RULES = [
  { key: "len"    , label: "10+ chars"     , test: (p: string) => p.length >= 10 },
  { key: "lower"  , label: "1 lowercase"   , test: (p: string) => /[a-z]/.test(p) },
  { key: "upper"  , label: "1 uppercase"   , test: (p: string) => /[A-Z]/.test(p) },
  { key: "number" , label: "1 number"      , test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "1 special char", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p) },
] as const;

function isPwValid(pw: string) { return RULES.every(r => r.test(pw)); }

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 3)}***@${domain}`;
}

// ── API ────────────────────────────────────────────────────────────────
async function apiPost<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/auth${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? "Something went wrong");
  return data as T;
}

// ── Icons ──────────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M2 7l10 7 10-7"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="3"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0110 0v4"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="spin-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray="28 56" />
    </svg>
  );
}

// ── CustomCheckbox ─────────────────────────────────────────────────────
function CustomCheckbox({ id, checked, onChange }: {
  id: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <>
      <input
        type="checkbox" id={id}
        className="cb-input"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="cb-box" onClick={() => onChange(!checked)} aria-hidden="true">
        <svg className="cb-check" viewBox="0 0 11 9" fill="none" aria-hidden="true">
          <path className="cb-path"
            d="M1 4.5l3 3 6-6"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  );
}

// ── PasswordRules ──────────────────────────────────────────────────────
function PasswordRules({ password }: { password: string }) {
  return (
    <div className="pw-rules">
      {RULES.map(({ key, label, test }) => (
        <span key={key} className={`pw-rule${test(password) ? " pw-rule--met" : ""}`}>
          {test(password) ? "●" : "○"} {label}
        </span>
      ))}
    </div>
  );
}

// ── TextInput ──────────────────────────────────────────────────────────
function TextInput({ label, value, onChange, error, type = "text", autoComplete, onEnter, inputRef }: {
  label: string; value: string;
  onChange: (v: string) => void;
  error?: string; type?: string;
  autoComplete?: string; onEnter?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="inp-wrap">
      <div className="inp-field">
        <input
          ref={inputRef}
          type={type}
          className={`inp${error ? " inp--error" : ""}`}
          value={value}
          placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onEnter?.(); }}
          autoComplete={autoComplete}
        />
        <span className="inp-line" aria-hidden="true" />
      </div>
      <label className="inp-label">{label}</label>
      {error && <div className="err-text">{error}</div>}
    </div>
  );
}

// ── PasswordInput ──────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, error, autoComplete = "current-password", onEnter, inputRef }: {
  label: string; value: string;
  onChange: (v: string) => void;
  error?: string; autoComplete?: string;
  onEnter?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="inp-wrap">
      <div className="inp-field">
        <input
          ref={inputRef}
          type={show ? "text" : "password"}
          className={`inp inp--pw${error ? " inp--error" : ""}`}
          value={value}
          placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onEnter?.(); }}
          autoComplete={autoComplete}
        />
        <span className="inp-line" aria-hidden="true" />
        <button
          type="button" tabIndex={-1}
          className="inp-eye"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <label className="inp-label">{label}</label>
      {error && <div className="err-text">{error}</div>}
    </div>
  );
}

// ── OtpRow ─────────────────────────────────────────────────────────────
function OtpRow({ digits, onChange, shaking, onComplete }: {
  digits: string[]; onChange: (v: string[]) => void;
  shaking: boolean; onComplete: (completed: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    onChange(next);
    if (ch && i < 5) focus(i + 1);
    if (ch && i === 5 && next.every(Boolean)) onComplete(next);
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) { next[i] = ""; onChange(next); }
      else if (i > 0) { next[i - 1] = ""; onChange(next); focus(i - 1); }
    }
    if (e.key === "ArrowLeft"  && i > 0) focus(i - 1);
    if (e.key === "ArrowRight" && i < 5) focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!raw) return;
    const next = Array(6).fill("") as string[];
    [...raw].forEach((d, i) => { next[i] = d; });
    onChange(next);
    focus(Math.min(raw.length - 1, 5));
    if (raw.length === 6) onComplete(next);
  };

  return (
    <div className={`otp-row${shaking ? " otp-row--shake" : ""}`}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          className={`otp-box${digit ? " otp-box--filled" : ""}${shaking ? " otp-box--error" : ""}`}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────
function Countdown({ seconds, onResend }: { seconds: number; onResend: () => void }) {
  if (seconds > 0) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (
      <p className="countdown">
        Resend in{" "}
        <span className="countdown__time">{m > 0 ? `${m}m ` : ""}{String(s).padStart(2, "0")}s</span>
      </p>
    );
  }
  return (
    <p className="countdown">
      Didn't receive it?{" "}
      <button type="button" className="countdown__link" onClick={onResend}>
        Resend code
      </button>
    </p>
  );
}

// ── SignInScreen ───────────────────────────────────────────────────────
function SignInScreen({ onOtpNeeded, onLoggedIn, onForgot }: {
  onOtpNeeded: (email: string, pw: string) => void;
  onLoggedIn:  (token: string) => void;
  onForgot:    (email: string) => void;
}) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [agreed,   setAgreed]   = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [pwErr,    setPwErr]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef    = useRef<HTMLInputElement>(null);

  const showRules = password.length > 0;
  const pwValid   = isPwValid(password);
  const canSubmit = email.length > 0 && password.length > 0 && agreed && !loading && pwValid;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setEmailErr(""); setPwErr(""); setLoading(true);
    try {
      const { scene } = await apiPost<{ scene: string }>("/check", { email });
      if (scene === "first-login") {
        await apiPost("/send-otp", { email, purpose: "login" });
        onOtpNeeded(email, password);
      } else {
        const { token } = await apiPost<{ token: string }>("/sign-in", { email, password });
        onLoggedIn(token);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      const lower = msg.toLowerCase();
      if (lower.includes("not authorized") || lower.includes("not registered") || lower.includes("email") || lower.includes("locked")) {
        setEmailErr(lower.includes("not authorized") ? "Email not registered" : msg);
      } else {
        setPwErr(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [canSubmit, email, password, onOtpNeeded, onLoggedIn]);

  const handleForgot = useCallback(async () => {
    if (!email) { setEmailErr("Enter your email first"); emailRef.current?.focus(); return; }
    setEmailErr(""); setLoading(true);
    try {
      const { scene } = await apiPost<{ scene: string }>("/check", { email });
      if (scene === "first-login") {
        setEmailErr("No password set for this account");
        return;
      }
      onForgot(email);
    } catch {
      setEmailErr("Email not registered");
    } finally {
      setLoading(false);
    }
  }, [email, onForgot]);

  return (
    <div className="login__screen screen-enter">
      <div className="login__brand stagger-load stagger-load-1">
        <span className="login__brand-dot" />
        Staff Attendance
      </div>

      <h1 className="login__head stagger-load stagger-load-2">Welcome back</h1>
      <p className="login__sub-head stagger-load stagger-load-2">Sign in to your account</p>

      <div className="stagger-load stagger-load-3">
        <TextInput
          label="Email address" value={email} type="email"
          autoComplete="email" inputRef={emailRef}
          onChange={v => { setEmail(v); setEmailErr(""); }}
          error={emailErr}
          onEnter={() => pwRef.current?.focus()}
        />
      </div>

      <div className="stagger-load stagger-load-4">
        <PasswordInput
          label="Password" value={password}
          inputRef={pwRef}
          onChange={v => { setPassword(v); setPwErr(""); }}
          error={pwErr}
          onEnter={handleSubmit}
        />
        {showRules && <PasswordRules password={password} />}
      </div>

      <div className="terms-row stagger-load stagger-load-5">
        <CustomCheckbox id="terms" checked={agreed} onChange={setAgreed} />
        <label className="terms-text" htmlFor="terms">
          I agree to the{" "}
          <span className="terms-link">Terms of Service</span>
          {" "}and{" "}
          <span className="terms-link">Privacy Policy</span>
        </label>
      </div>

      <div className="stagger-load stagger-load-6">
        <button className="cta-btn" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? <Spinner /> : "Sign In"}
        </button>
      </div>

      <button type="button" className="login__forgot" onClick={handleForgot} disabled={loading}>
        Forgot password?
      </button>
    </div>
  );
}

// ── OtpScreen ──────────────────────────────────────────────────────────
function OtpScreen({ email, purpose, pendingPw, onBack, onLoggedIn, onResetReady }: {
  email: string; purpose: OtpPurpose; pendingPw: string;
  onBack: () => void; onLoggedIn: (token: string) => void; onResetReady: () => void;
}) {
  const [digits,    setDigits]    = useState(Array<string>(6).fill(""));
  const [shaking,   setShaking]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(8 * 60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const handleVerify = useCallback(async (completedDigits: string[]) => {
    const code = completedDigits.join("");
    if (code.length < 6 || loading) return;
    setLoading(true);
    try {
      const body = purpose === "login"
        ? { email, otp: code, password: pendingPw, purpose }
        : { email, otp: code, purpose };
      const res = await apiPost<{ token?: string }>("/verify-otp", body);
      if (purpose === "login") onLoggedIn(res.token!);
      else                     onResetReady();
    } catch {
      triggerShake();
      setDigits(Array(6).fill(""));
    } finally {
      setLoading(false);
    }
  }, [loading, purpose, pendingPw, email, onLoggedIn, onResetReady]);

  const handleResend = async () => {
    setDigits(Array(6).fill("")); setShaking(false); setCountdown(8 * 60);
    try { await apiPost("/resend-otp", { email, purpose }); } catch { /* silent */ }
  };

  const isLogin = purpose === "login";

  return (
    <div className="login__screen screen-enter">
      <button className="login__back" onClick={onBack} aria-label="Back">
        <BackIcon />
        <span>Back</span>
      </button>

      <div className="otp-icon-wrap stagger-load stagger-load-1">
        <div className="otp-icon">
          {isLogin ? <MailIcon /> : <LockIcon />}
        </div>
      </div>

      <h1 className="login__head stagger-load stagger-load-2">
        {isLogin ? "Check your inbox" : "Reset password"}
      </h1>
      <p className="login__sub stagger-load stagger-load-2">
        {isLogin ? "We sent a 6-digit code to" : "Enter the code sent to"}
      </p>

      <div className="otp-email-chip stagger-load stagger-load-3">
        <span className="otp-email-dot" />
        {maskEmail(email)}
      </div>

      <div className="stagger-load stagger-load-4">
        <OtpRow
          digits={digits}
          onChange={v => { setDigits(v); setShaking(false); }}
          shaking={shaking}
          onComplete={handleVerify}
        />
      </div>

      {loading && <div className="otp-spinner"><Spinner /></div>}

      <div className="stagger-load stagger-load-5">
        <Countdown seconds={countdown} onResend={handleResend} />
      </div>
    </div>
  );
}

// ── ResetPasswordScreen ────────────────────────────────────────────────
function ResetPasswordScreen({ email, onBack, onLoggedIn }: {
  email: string; onBack: () => void; onLoggedIn: (token: string) => void;
}) {
  const [newPw,   setNewPw]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [newErr,  setNewErr]  = useState("");
  const [confErr, setConfErr] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmRef = useRef<HTMLInputElement>(null);
  const canSubmit  = isPwValid(newPw) && confirm.length > 0 && !loading;

  const handleReset = useCallback(async () => {
    if (!canSubmit) return;
    setNewErr(""); setConfErr("");
    if (newPw !== confirm) { setConfErr("Passwords do not match"); return; }
    setLoading(true);
    try {
      const { token } = await apiPost<{ token: string }>("/reset-password", {
        email, password: newPw, confirmPassword: confirm,
      });
      onLoggedIn(token);
    } catch (e: unknown) {
      setNewErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [canSubmit, newPw, confirm, email, onLoggedIn]);

  return (
    <div className="login__screen screen-enter">
      <button className="login__back" onClick={onBack} aria-label="Back">
        <BackIcon />
        <span>Back</span>
      </button>

      <div className="otp-icon-wrap stagger-load stagger-load-1">
        <div className="otp-icon">
          <LockIcon />
        </div>
      </div>

      <h1 className="login__head stagger-load stagger-load-2">New password</h1>
      <p className="login__sub stagger-load stagger-load-2">Create a strong password for your account</p>

      <div className="stagger-load stagger-load-3">
        <PasswordInput
          label="New password" value={newPw}
          autoComplete="new-password"
          onChange={v => { setNewPw(v); setNewErr(""); }}
          error={newErr}
          onEnter={() => confirmRef.current?.focus()}
        />
        <PasswordRules password={newPw} />
      </div>

      <div className="stagger-load stagger-load-4">
        <PasswordInput
          label="Confirm password" value={confirm}
          inputRef={confirmRef}
          autoComplete="new-password"
          onChange={v => { setConfirm(v); setConfErr(""); }}
          error={confErr}
          onEnter={handleReset}
        />
      </div>

      <div className="stagger-load stagger-load-5">
        <button className="cta-btn" onClick={handleReset} disabled={!canSubmit}>
          {loading ? <Spinner /> : "Set Password"}
        </button>
      </div>
    </div>
  );
}

// ── LoginFlow ──────────────────────────────────────────────────────────
export interface LoginFlowProps {
  onLoggedIn?: (token: string) => void;
}

export function LoginFlow({ onLoggedIn }: LoginFlowProps) {
  const [screen,     setScreen]     = useState<Screen>("signin");
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("login");
  const [email,      setEmail]      = useState("");
  const [pendingPw,  setPendingPw]  = useState("");

  const handleLoggedIn = (token: string) => {
    localStorage.setItem("auth_token", token);
    onLoggedIn?.(token);
  };

  const handleOtpNeeded = (e: string, pw: string) => {
    setEmail(e); setPendingPw(pw); setOtpPurpose("login"); setScreen("otp");
  };

  const handleForgot = (e: string) => {
    setEmail(e); setOtpPurpose("reset"); setScreen("otp");
    apiPost("/send-otp", { email: e, purpose: "reset" }).catch(() => {});
  };

  return (
    <div className="login">
      <div className="ob__bg-glow" />
      <div className="login__inner">
        {screen === "signin" && (
          <SignInScreen
            onOtpNeeded={handleOtpNeeded}
            onLoggedIn={handleLoggedIn}
            onForgot={handleForgot}
          />
        )}
        {screen === "otp" && (
          <OtpScreen
            key="otp"
            email={email}
            purpose={otpPurpose}
            pendingPw={pendingPw}
            onBack={() => setScreen("signin")}
            onLoggedIn={handleLoggedIn}
            onResetReady={() => setScreen("reset-password")}
          />
        )}
        {screen === "reset-password" && (
          <ResetPasswordScreen
            email={email}
            onBack={() => setScreen("otp")}
            onLoggedIn={handleLoggedIn}
          />
        )}
      </div>
    </div>
  );
}
