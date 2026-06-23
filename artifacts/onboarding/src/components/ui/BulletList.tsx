import { memo } from "react";

/* ── Inline SVG atoms — used only in BulletList ── */
const TrashSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const CheckSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/** Multi-value bullet list used in AddEmployeePage for tasks, caps, specs, langs. */
export const BulletList = memo(function BulletList({
  label, items, input, onInputChange, onAdd, onDelete, placeholder,
}: {
  label:         string;
  items:         string[];
  input:         string;
  onInputChange: (v: string) => void;
  onAdd:         () => void;
  onDelete:      (i: number) => void;
  placeholder:   string;
}) {
  return (
    <div>
      <div className="ae-pro-hdr">{label}</div>
      <div className="ae-bul-list">
        {items.map((t, i) => (
          <div key={t} className="ae-bul-item">
            <div className="ae-bul-dot" />
            <span className="ae-bul-txt">{t}</span>
            <span
              className="ae-bul-del"
              onMouseDown={e => { e.preventDefault(); onDelete(i); }}
            >
              <TrashSVG />
            </span>
          </div>
        ))}
      </div>
      <div className="ae-bul-inp-row">
        <input
          className="ae-bul-inp"
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        />
        <span className="ae-bul-add" onClick={onAdd}><CheckSVG /></span>
      </div>
    </div>
  );
});
