import { formatCountdown } from "../lib/shared";

interface OtpBannerProps {
  dark: boolean;
  label: string;
  remainingMs: number;
  actionLabel: string;
  onAction: () => void;
  onDismiss?: () => void;
  shake?: boolean;
  top?: number;
  zIndex?: number;
}

export function OtpBanner({
  dark, label, remainingMs, actionLabel, onAction, onDismiss,
  shake = false, top = 0, zIndex = 300,
}: OtpBannerProps) {
  const bg      = dark ? "rgba(22,18,68,0.94)"   : "rgba(237,233,255,0.96)";
  const border  = dark ? "rgba(127,120,242,0.26)" : "rgba(79,70,229,0.18)";
  const txtClr  = dark ? "rgba(200,197,245,0.88)" : "#3730A3";
  const actClr  = dark ? "#9992F5"                : "#4F46E5";
  const iconClr = dark ? "#9992F5"                : "#4F46E5";
  const dimClr  = dark ? "rgba(200,197,245,0.30)" : "rgba(79,70,229,0.28)";

  return (
    <div
      className={shake ? "banner-shake" : ""}
      style={{
        position: "fixed", top, left: 0, right: 0, zIndex,
        background: bg,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 20px", fontFamily: "inherit",
        minHeight: 38, boxSizing: "border-box",
        transition: "top 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" stroke={iconClr} strokeWidth="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke={iconClr} strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontSize: 12.5, fontWeight: 600,
          color: txtClr,
          letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
        }}>
          {label} · <strong style={{ fontWeight: 700 }}>{formatCountdown(remainingMs)}</strong>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onAction}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: actClr, fontWeight: 700,
            fontFamily: "inherit", fontSize: 12.5, padding: "2px 0",
            letterSpacing: "-0.01em",
          }}
        >
          {actionLabel}
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            title="Dismiss"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: dimClr, fontFamily: "inherit", fontSize: 14,
              padding: "2px 4px", lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
