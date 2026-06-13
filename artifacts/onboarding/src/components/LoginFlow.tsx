import { useState, useRef, useCallback, useEffect, KeyboardEvent, ClipboardEvent } from "react";

// ── Types ──────────────────────────────────────────────────────────────
type Screen     = "signin" | "otp" | "reset-password";
type OtpPurpose = "login"  | "reset";
type EnterDir   = "fwd"    | "back";

// ── Password validation ────────────────────────────────────────────────
const RULES = [
  { key: "len"    , label: "8+ chars"    , test: (p: string) => p.length >= 8 },
  { key: "number" , label: "Number"      , test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "Special char", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p) },
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

// ── Shared: parse "OTP already sent" error → seconds remaining ─────────
function parseAlreadySent(msg: string): number | null {
  const lower = msg.toLowerCase();
  if (!lower.includes("otp already sent") && !lower.includes("already sent")) return null;
  const m = msg.match(/Wait (\d+) seconds/i);
  return m ? parseInt(m[1]!, 10) : 10 * 60;
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M2 7.5l10 6.5 10-6.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="12" rx="3"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0110 0v4"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.4" fill="currentColor" />
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
      <input type="checkbox" id={id} className="cb-input" checked={checked}
        onChange={e => onChange(e.target.checked)} />
      <span className="cb-box" onClick={() => onChange(!checked)} aria-hidden="true">
        <svg className="cb-check" viewBox="0 0 11 9" fill="none" aria-hidden="true">
          <path className="cb-path" d="M1 4.5l3 3 6-6"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
}

// ── PasswordRules ──────────────────────────────────────────────────────
function PasswordRules({ password }: { password: string }) {
  return (
    <div className="pw-rules">
      {RULES.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <div key={key} className={`pw-rule${met ? " pw-rule--met" : ""}`}>
            <span className="pw-dot" aria-hidden="true" />
            <span className="pw-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── TextInput ──────────────────────────────────────────────────────────
function TextInput({ label, value, onChange, error, type = "text", autoComplete, onEnter, inputRef }: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; type?: string; autoComplete?: string;
  onEnter?: () => void; inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="inp-wrap">
      <div className="inp-field">
        <input ref={inputRef} type={type}
          className={`inp${error ? " inp--error" : ""}`}
          value={value} placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onEnter?.(); }}
          autoComplete={autoComplete} />
        <span className="inp-line" aria-hidden="true" />
      </div>
      <label className="inp-label">{label}</label>
      {error && <div className="err-text">{error}</div>}
    </div>
  );
}

// ── PasswordInput ──────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, error, autoComplete = "current-password", onEnter, inputRef }: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; autoComplete?: string; onEnter?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="inp-wrap">
      <div className="inp-field">
        <input ref={inputRef} type={show ? "text" : "password"}
          className={`inp inp--pw${error ? " inp--error" : ""}`}
          value={value} placeholder=" "
          onChange={e => onChange(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onEnter?.(); }}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false} />
        <span className="inp-line" aria-hidden="true" />
        <button type="button" tabIndex={-1} className="inp-eye"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"}>
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
    const next = [...digits]; next[i] = ch;
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
        <input key={i} ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          className={`otp-box${digit ? " otp-box--filled" : ""}${shaking ? " otp-box--error" : ""}`}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code" />
      ))}
    </div>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────
function Countdown({ seconds, onResend }: { seconds: number; onResend: () => void }) {
  if (seconds > 0) {
    const label = seconds >= 60 ? `${Math.floor(seconds / 60)}m` : `${seconds}s`;
    return (
      <p className="countdown">
        Resend in <span className="countdown__time">{label}</span>
      </p>
    );
  }
  return (
    <p className="countdown">
      Didn't receive it?{" "}
      <button type="button" className="countdown__link" onClick={onResend}>Resend code</button>
    </p>
  );
}

// ── SignInScreen ───────────────────────────────────────────────────────
function SignInScreen({ onOtpNeeded, onLoggedIn, onForgot, enterDir, defaultEmail = "" }: {
  onOtpNeeded: (email: string, pw: string, initialCountdown?: number) => void;
  onLoggedIn:  (token: string) => void;
  onForgot:    (email: string, initialCountdown?: number) => void;
  enterDir:    EnterDir;
  defaultEmail?: string;
}) {
  const [email,      setEmail]      = useState(defaultEmail);
  const [password,   setPassword]   = useState("");
  const [agreed,     setAgreed]     = useState(false);
  const [emailErr,   setEmailErr]   = useState("");
  const [pwErr,      setPwErr]      = useState("");
  const [generalErr, setGeneralErr] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [triedSubmit,  setTriedSubmit]  = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef    = useRef<HTMLInputElement>(null);

  const showRules = triedSubmit && !isPwValid(password);
  const canSubmit = email.trim().length > 0 && password.length > 0 && agreed && !loading;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setEmailErr(""); setPwErr(""); setGeneralErr(""); setLoading(true);
    try {
      const { scene } = await apiPost<{ scene: string }>("/check", { email });
      if (scene === "first-login") {
        if (!isPwValid(password)) {
          setTriedSubmit(true);
          setPwErr("Password must meet all requirements below");
          return;
        }
        await apiPost("/send-otp", { email, purpose: "login" });
        onOtpNeeded(email, password);
      } else {
        const { token } = await apiPost<{ token: string }>("/sign-in", { email, password });
        onLoggedIn(token);
      }
    } catch (e: unknown) {
      const msg   = e instanceof Error ? e.message : "Something went wrong";
      const lower = msg.toLowerCase();
      const alreadySent = parseAlreadySent(msg);
      if (alreadySent !== null) { onOtpNeeded(email, password, alreadySent); return; }
      if (lower.includes("not registered") || lower.includes("not authorized") || lower.includes("not found")) {
        setEmailErr("Email not registered");
      } else if (lower.includes("too many") || lower.includes("locked")) {
        setEmailErr(msg);
      } else if (lower.includes("incorrect password") || lower.includes("invalid credentials")) {
        setPwErr("Incorrect password");
      } else if (lower.includes("setup incomplete") || lower.includes("setup first")) {
        setGeneralErr("Account setup incomplete — sign in to finish setup.");
      } else if (lower.includes("gmail") || lower.includes("email sending") || lower.includes("credentials are invalid") || lower.includes("service_unavailable") || lower.includes("unavailable")) {
        setGeneralErr("Could not send verification email. Please try again.");
      } else {
        setGeneralErr(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [canSubmit, email, password, onOtpNeeded, onLoggedIn]);

  const handleForgot = useCallback(async () => {
    if (!email.trim()) { setEmailErr("Enter your email first"); emailRef.current?.focus(); return; }
    setEmailErr(""); setLoading(true);
    try {
      const { scene } = await apiPost<{ scene: string }>("/check", { email });
      if (scene === "first-login") {
        setEmailErr("No password set yet — complete your account setup first");
        return;
      }
      await apiPost("/send-otp", { email, purpose: "reset" });
      onForgot(email);
    } catch (e: unknown) {
      const msg   = e instanceof Error ? e.message : "Something went wrong";
      const lower = msg.toLowerCase();
      const alreadySent = parseAlreadySent(msg);
      if (alreadySent !== null) { onForgot(email, alreadySent); return; }
      if (lower.includes("not registered") || lower.includes("not authorized") || lower.includes("not found")) {
        setEmailErr("Email not registered");
      } else if (lower.includes("no password") || lower.includes("setup first") || lower.includes("set yet")) {
        setEmailErr("No password set yet — complete your account setup first");
      } else {
        setEmailErr(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [email, onForgot]);

  const dir = enterDir === "fwd" ? "screen-fwd" : "screen-back";

  return (
    <div className={`login__screen ${dir}`}>
      <h1 className="login__head si-s1">Welcome back</h1>
      <p className="login__sub-head si-s2">Sign in to your account</p>

      <div className="si-s3">
        <TextInput
          label="Email address" value={email} type="email"
          autoComplete="email" inputRef={emailRef}
          onChange={v => { setEmail(v); setEmailErr(""); setGeneralErr(""); }}
          error={emailErr}
          onEnter={() => pwRef.current?.focus()}
        />
      </div>

      <div className="si-s4">
        <PasswordInput
          label="Password" value={password} inputRef={pwRef}
          onChange={v => { setPassword(v); setPwErr(""); setGeneralErr(""); }}
          error={pwErr} onEnter={handleSubmit}
        />
        {showRules && <PasswordRules password={password} />}
      </div>

      <div className="terms-row si-s5">
        <CustomCheckbox id="terms" checked={agreed} onChange={setAgreed} />
        <label className="terms-text" htmlFor="terms">
          I agree to the{" "}
          <span className="terms-link">Terms of Service</span>
          {" "}and{" "}
          <span className="terms-link">Privacy Policy</span>
        </label>
      </div>
      {generalErr && <div className="err-text general-err si-s5b">{generalErr}</div>}

      <div className="si-s6">
        <button className="cta-btn" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? <Spinner /> : "Sign In"}
        </button>
      </div>

      <button type="button" className="login__forgot si-s7"
        onClick={handleForgot} disabled={loading}>
        Forgot password?
      </button>
    </div>
  );
}

// ── OtpScreen ──────────────────────────────────────────────────────────
function OtpScreen({ email, purpose, pendingPw, onBack, onChangeEmail, onLoggedIn, onResetReady, enterDir, initialCountdown = 10 * 60, notSent = false }: {
  email: string; purpose: OtpPurpose; pendingPw: string;
  onBack: () => void; onChangeEmail: () => void; onLoggedIn: (token: string) => void;
  onResetReady: () => void; enterDir: EnterDir; initialCountdown?: number; notSent?: boolean;
}) {
  const [digits,       setDigits]       = useState(Array<string>(6).fill(""));
  const [shaking,      setShaking]      = useState(false);
  const [otpErr,       setOtpErr]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [countdown,    setCountdown]    = useState(initialCountdown);
  const [emailNotSent, setEmailNotSent] = useState(notSent);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleVerify = useCallback(async (completedDigits: string[]) => {
    const code = completedDigits.join("");
    if (code.length < 6 || loading) return;
    setLoading(true); setOtpErr("");
    try {
      const body = purpose === "login"
        ? { email, otp: code, password: pendingPw, purpose }
        : { email, otp: code, purpose };
      const res = await apiPost<{ token?: string }>("/verify-otp", body);
      if (purpose === "login") onLoggedIn(res.token!);
      else                     onResetReady();
    } catch (e: unknown) {
      const msg   = e instanceof Error ? e.message : "Invalid or expired code";
      const lower = msg.toLowerCase();
      triggerShake();
      setDigits(Array(6).fill(""));
      if (lower.includes("expired") || lower.includes("request a new")) {
        setOtpErr("Code expired. Request a new one below.");
      } else if (lower.includes("incorrect code") || lower.includes("check your email")) {
        setOtpErr("Incorrect code. Check your email and try again.");
      } else if (lower.includes("too many") || lower.includes("locked")) {
        setOtpErr(msg);
      } else {
        setOtpErr("Invalid code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [loading, purpose, pendingPw, email, onLoggedIn, onResetReady]);

  const handleResend = async () => {
    setDigits(Array(6).fill("")); setShaking(false); setOtpErr("");
    try {
      await apiPost("/resend-otp", { email, purpose });
      setCountdown(10 * 60);
      setEmailNotSent(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to resend code";
      const m   = msg.match(/Wait (\d+) seconds/i);
      if (m) { setCountdown(parseInt(m[1]!, 10)); return; }
      const lo = msg.toLowerCase();
      setOtpErr(lo.includes("too many") || lo.includes("locked") ? msg : "Failed to send code. Please try again.");
    }
  };

  const dir     = enterDir === "fwd" ? "screen-fwd" : "screen-back";
  const isLogin = purpose === "login";

  return (
    <div className={`login__screen ${dir}`}>
      <div className="otp-icon-wrap otp-s1">
        <div className="otp-icon">
          {isLogin ? <MailIcon /> : <LockIcon />}
        </div>
      </div>

      <h1 className="login__head otp-s2">
        {isLogin ? "Check your inbox" : "Password reset"}
      </h1>
      <p className="login__sub otp-s3">
        {isLogin ? "We sent a 6-digit code to" : "Enter the reset code sent to"}
      </p>

      <div className="otp-email-chip otp-s4">
        <span className="otp-email-dot" />
        {maskEmail(email)}
        <button type="button" className="otp-change-email" onClick={onChangeEmail}>
          Change
        </button>
      </div>

      <div className="otp-s5">
        <OtpRow
          digits={digits}
          onChange={v => { setDigits(v); setShaking(false); setOtpErr(""); }}
          shaking={shaking}
          onComplete={handleVerify}
        />
        {loading && <div className="otp-spinner"><Spinner /></div>}
        {otpErr && <div className="err-text otp-err">{otpErr}</div>}
        {!otpErr && emailNotSent && countdown > 0 && (
          <p className="otp-not-sent">OTP already sent. Please wait to resend otp.</p>
        )}
      </div>

      <div className="otp-s6">
        <Countdown seconds={countdown} onResend={handleResend} />
        {isLogin && countdown > 0 && (
          <p className="otp-spam-hint">Check spam/junk if not received.</p>
        )}
      </div>
    </div>
  );
}

// ── ResetPasswordScreen ────────────────────────────────────────────────
function ResetPasswordScreen({ email, onBack, onLoggedIn, enterDir }: {
  email: string; onBack: () => void;
  onLoggedIn: (token: string) => void; enterDir: EnterDir;
}) {
  const [newPw,   setNewPw]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [newErr,  setNewErr]  = useState("");
  const [confErr, setConfErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [triedReset, setTriedReset] = useState(false);

  const confirmRef = useRef<HTMLInputElement>(null);
  const canSubmit  = newPw.length > 0 && confirm.length > 0 && !loading;

  const handleReset = useCallback(async () => {
    if (!canSubmit) return;
    setNewErr(""); setConfErr(""); setTriedReset(true);
    if (!isPwValid(newPw)) { setNewErr("Password must meet all requirements below"); return; }
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

  const dir = enterDir === "fwd" ? "screen-fwd" : "screen-back";

  return (
    <div className={`login__screen ${dir}`}>
      <button className="login__back otp-back" onClick={onBack} aria-label="Back">
        <BackIcon /><span>Back</span>
      </button>

      <div className="otp-icon-wrap rp-s1">
        <div className="otp-icon"><LockIcon /></div>
      </div>

      <h1 className="login__head rp-s2">New password</h1>
      <p className="login__sub rp-s3">Create a strong password for your account</p>

      <div className="rp-s4">
        <PasswordInput
          label="New password" value={newPw}
          autoComplete="new-password"
          onChange={v => { setNewPw(v); setNewErr(""); }}
          error={newErr}
          onEnter={() => confirmRef.current?.focus()}
        />
        {triedReset && !isPwValid(newPw) && <PasswordRules password={newPw} />}
      </div>

      <div className="rp-s5">
        <PasswordInput
          label="Confirm password" value={confirm} inputRef={confirmRef}
          autoComplete="new-password"
          onChange={v => { setConfirm(v); setConfErr(""); }}
          error={confErr} onEnter={handleReset}
        />
      </div>

      <div className="rp-s6">
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
  const [screen,              setScreen]             = useState<Screen>("signin");
  const [screenKey,           setScreenKey]          = useState(0);
  const [enterDir,            setEnterDir]           = useState<EnterDir>("fwd");
  const [otpPurpose,          setOtpPurpose]         = useState<OtpPurpose>("login");
  const [email,               setEmail]              = useState("");
  const [pendingPw,           setPendingPw]          = useState("");
  const [otpInitialCountdown, setOtpInitialCountdown] = useState(10 * 60);
  const [otpNotSent,          setOtpNotSent]          = useState(false);

  const goTo = useCallback((s: Screen, dir: EnterDir = "fwd") => {
    setEnterDir(dir);
    setScreen(s);
    setScreenKey(k => k + 1);
  }, []);

  const handleLoggedIn = (token: string) => {
    localStorage.setItem("auth_token", token);
    onLoggedIn?.(token);
  };

  const handleOtpNeeded = (e: string, pw: string, countdown?: number) => {
    setEmail(e); setPendingPw(pw); setOtpPurpose("login");
    setOtpInitialCountdown(countdown ?? 10 * 60);
    setOtpNotSent(countdown !== undefined);
    goTo("otp", "fwd");
  };

  const handleForgot = (e: string, countdown?: number) => {
    setEmail(e); setOtpPurpose("reset");
    setOtpInitialCountdown(countdown ?? 10 * 60);
    setOtpNotSent(countdown !== undefined);
    goTo("otp", "fwd");
  };

  return (
    <div className="login">
      <div className="ob__bg-glow" />
      <div className="login__inner">
        {screen === "signin" && (
          <SignInScreen
            key={screenKey}
            enterDir={enterDir}
            defaultEmail={email}
            onOtpNeeded={handleOtpNeeded}
            onLoggedIn={handleLoggedIn}
            onForgot={handleForgot}
          />
        )}
        {screen === "otp" && (
          <OtpScreen
            key={screenKey}
            enterDir={enterDir}
            email={email}
            purpose={otpPurpose}
            pendingPw={pendingPw}
            initialCountdown={otpInitialCountdown}
            notSent={otpNotSent}
            onBack={() => goTo("signin", "back")}
            onChangeEmail={() => goTo("signin", "back")}
            onLoggedIn={handleLoggedIn}
            onResetReady={() => goTo("reset-password", "fwd")}
          />
        )}
        {screen === "reset-password" && (
          <ResetPasswordScreen
            key={screenKey}
            enterDir={enterDir}
            email={email}
            onBack={() => goTo("otp", "back")}
            onLoggedIn={handleLoggedIn}
          />
        )}
      </div>
    </div>
  );
}
