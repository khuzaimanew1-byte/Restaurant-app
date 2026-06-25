import { memo } from "react";
import { type UiStatus } from "../../../services/employee.service";

const LABEL: Record<NonNullable<UiStatus>, string> = {
  "leave":              "On Leave",
  "unauthorized-leave": "Unauthorized Leave",
  "half-day":           "Half Day",
  "late":               "Late",
};

export const StatusTag = memo(function StatusTag({ status }: { status: UiStatus }) {
  if (!status) return null;
  return (
    <div className={`ad-st2 adm-status--${status}`}>
      {LABEL[status]}
    </div>
  );
});

