import { useState, useEffect, useRef } from "react";

/**
 * Smart hybrid mount/unmount for modals and overlays.
 *
 * Lifecycle:
 *   First trigger  → mount immediately
 *   Close          → start 60 s countdown before unmount
 *   Reopen         → cancel countdown, keep mounted (no re-mount cost)
 *   Countdown ends → unmount
 *
 * Usage:
 *   const shouldRender = useDelayedUnmount(isOpen);
 *   return shouldRender ? <Modal /> : null;
 */
export function useDelayedUnmount(isOpen: boolean, delayMs = 60_000): boolean {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      setShouldRender(true);
    } else if (shouldRender) {
      timerRef.current = setTimeout(() => setShouldRender(false), delayMs);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOpen, delayMs, shouldRender]);

  return shouldRender;
}
