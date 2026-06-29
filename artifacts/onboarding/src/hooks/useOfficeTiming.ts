import { useState, useCallback } from "react";
import type { OfficeTiming } from "../services/shift-timing";

const KEY = "office_timing_v1";
const DEF: OfficeTiming = { start: "08:00 AM", end: "06:00 PM" };

function load(): OfficeTiming {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEF;
    const v = JSON.parse(raw) as OfficeTiming;
    return (v.start && v.end) ? v : DEF;
  } catch { return DEF; }
}

/** Persisted office timing — SSOT shared by dashboard, add/edit form, and modal. */
export function useOfficeTiming() {
  const [timing, setTiming] = useState<OfficeTiming>(load);
  const updateTiming = useCallback((t: OfficeTiming) => {
    setTiming(t);
    try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* quota */ }
  }, []);
  return { timing, updateTiming };
}
