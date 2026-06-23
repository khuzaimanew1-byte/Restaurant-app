import { memo } from "react";
import type { UiStatus } from "../../services/employee.service";

/* SSOT: all attendance status badge rendering goes through this component.
   CSS lives in admin-dashboard.css — adm-status-label / adm-status--*     */
const LABEL: Record<NonNullable<UiStatus>, string> = {
  "leave":              "On Leave",
  "unauthorized-leave": "Unauthorized Leave",
  "half-day":           "Half Day",
  "late":               "Late",
};

export const StatusTag = memo(function StatusTag({ status }: { status: UiStatus }) {
  if (!status) return null;
  return (
    <div className={`adm-status-label adm-status--${status}`}>
      {LABEL[status]}
    </div>
  );
});
