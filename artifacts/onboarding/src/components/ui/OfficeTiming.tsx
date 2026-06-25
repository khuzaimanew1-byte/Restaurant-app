import { useState } from "react";
import type { OfficeTiming } from "../../services/shift-timing";
import "../../styles/office-timing.css";

export function OfficeTimingHeader({ timing, onUpdate }: {
  timing: OfficeTiming;
  onUpdate: (t: OfficeTiming) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [start,   setStart]   = useState(timing.start);
  const [end,     setEnd]     = useState(timing.end);

  function save()   { onUpdate({ start, end }); setEditing(false); }
  function cancel() { setStart(timing.start); setEnd(timing.end); setEditing(false); }

  return (
    <div className="adm-office-timing">
      <span className="adm-office-timing-label">Office Timing</span>
      {editing ? (
        <div className="adm-timing-edit-row">
          <input className="adm-timing-input" value={start} onChange={e => setStart(e.target.value)} />
          <span className="adm-timing-dash">–</span>
          <input className="adm-timing-input" value={end}   onChange={e => setEnd(e.target.value)}   />
          <button className="adm-timing-save"   onClick={save}>Save</button>
          <button className="adm-timing-cancel" onClick={cancel}>✕</button>
        </div>
      ) : (
        <div className="adm-timing-display-row">
          <span className="adm-timing-value">{timing.start} – {timing.end}</span>
          <button className="adm-timing-edit-btn" onClick={() => setEditing(true)} aria-label="Edit timing">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
