import type { ReactNode } from "react";
import { memo } from "react";

/** Global Pill — wraps the .stat-pill SSOT base class (index.css).
    Pass additional modifier classes via className (e.g. "em-pill em-pill-role"). */
export const Pill = memo(function Pill({
  children, className = "",
}: { children: ReactNode; className?: string }) {
  return (
    <span className={`stat-pill${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
});
