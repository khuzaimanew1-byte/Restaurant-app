import { ReactNode } from "react";

export type AttendanceStatus =
  | "present" | "late" | "leave" | "unauthorized-leave"
  | "half-day" | "early";

/** Status badge — wraps .adm-status-label + .adm-status--* CSS.
 *  Colors come from --clr-* vars in :root (index.css SSOT).
 *  Import and use everywhere an attendance status is displayed. */
export function StatusTag({
  status, children,
}: {
  status?: AttendanceStatus;
  children: ReactNode;
}) {
  const mod = status ? ` adm-status--${status}` : "";
  return <span className={`adm-status-label${mod}`}>{children}</span>;
}

/** Removable chip tag — wraps .ae-lang-tag CSS (index.css).
 *  Pass onRemove to show the × dismiss button.
 *  Import and use for any removable pill/chip across the app. */
export function Tag({
  children, onRemove,
}: {
  children: ReactNode;
  onRemove?: () => void;
}) {
  return (
    <span className="ae-lang-tag">
      {children}
      {onRemove && (
        <span
          className="ae-lang-del"
          onMouseDown={e => { e.preventDefault(); onRemove(); }}
        >
          ✕
        </span>
      )}
    </span>
  );
}
