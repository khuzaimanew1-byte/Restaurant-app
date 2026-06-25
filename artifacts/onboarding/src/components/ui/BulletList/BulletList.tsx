import { memo } from "react";

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
      <div className="ae-pro">{label}</div>
      <div className="ae-bu6">
        {items.map((t, i) => (
          <div key={t} className="ae-bu5">
            <div className="ae-bu2" />
            <span className="ae-bu7">{t}</span>
            <span
              className="ae-bu1"
              onMouseDown={e => { e.preventDefault(); onDelete(i); }}
            >
              <TrashSVG />
            </span>
          </div>
        ))}
      </div>
      <div className="ae-bu4">
        <input
          className="ae-bu3"
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        />
        <span className="ae-bul" onClick={onAdd}><CheckSVG /></span>
      </div>
    </div>
  );
});

