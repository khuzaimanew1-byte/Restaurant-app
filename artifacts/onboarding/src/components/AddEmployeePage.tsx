import { useState, useRef, useCallback, useLayoutEffect, memo } from "react";
import { Button } from "./ui/Button";
import { TextInput } from "./ui/Input";
import "../styles/add-bg.css";
import "../styles/add-employee.css";

// ── Palette for avatar fallback colours ───────────────────────────────────
/* Avatar palette — hex SSOT lives in index.css :root as --av-p1…--av-p8 */
const AVATAR_PALETTE = [
  "var(--av-p1)","var(--av-p2)","var(--av-p3)","var(--av-p4)",
  "var(--av-p5)","var(--av-p6)","var(--av-p7)","var(--av-p8)",
];

export interface NewEmployeeData {
  name: string; role: string; salary: string;
  avatar: string; initials: string; color: string;
}

// ── Inline SVG atoms ──────────────────────────────────────────────────────
const PersonSVG   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
const CardSVG     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const PhoneSVG    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const MailSVG     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const GlobeSVG    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const BriefSVG    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const PinSVG      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const UsersSVG    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/></svg>;
const CalSVG      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const CameraSVG   = () => <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const CameraSmSVG = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const CheckSVG    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashSVG    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const ChevSVG = ({ open }: { open: boolean }) => (
  /* ae-chev-svg defines transition: transform .2s in CSS — only rotation is dynamic */
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="ae-chev-svg"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" } as React.CSSProperties}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const GENDERS = ["Male", "Female", "Other"];

// ── BulletList sub-component ──────────────────────────────────────────────
const BulletList = memo(function BulletList({
  label, items, input, onInputChange, onAdd, onDelete, placeholder,
}: {
  label: string; items: string[]; input: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onDelete: (i: number) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="ae-pro-hdr">{label}</div>
      <div className="ae-bul-list">
        {items.map((t, i) => (
          <div key={t} className="ae-bul-item">
            <div className="ae-bul-dot" />
            <span className="ae-bul-txt">{t}</span>
            <span className="ae-bul-del" onMouseDown={e => { e.preventDefault(); onDelete(i); }}><TrashSVG /></span>
          </div>
        ))}
      </div>
      <div className="ae-bul-inp-row">
        <input
          className="ae-bul-inp" type="text" placeholder={placeholder}
          value={input} onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        />
        <span className="ae-bul-add" onClick={onAdd}><CheckSVG /></span>
      </div>
    </div>
  );
});

// ── Main component ────────────────────────────────────────────────────────
export function AddEmployeePage({
  onClose,
  onSave,
  isOpen = true,
}: {
  onClose: () => void;
  onSave: (data: NewEmployeeData) => void;
  isOpen?: boolean;
}) {
  // Avatar
  const [avatarUrl,   setAvatarUrl]   = useState("");
  const [dragOver,    setDragOver]    = useState(false);
  const fileRef     = useRef<HTMLInputElement>(null);

  // Salary auto-resize refs (effect runs after salary state below)
  const salInpRef   = useRef<HTMLInputElement>(null);
  const salSizerRef = useRef<HTMLSpanElement>(null);

  // Date input refs — for programmatic showPicker() via icon click
  const dobRef        = useRef<HTMLInputElement>(null);
  const joiningRef    = useRef<HTMLInputElement>(null);
  const shiftStartRef = useRef<HTMLInputElement>(null);
  const shiftEndRef   = useRef<HTMLInputElement>(null);

  // Core fields
  const [name,        setName]        = useState("");
  const [role,        setRole]        = useState("");
  const [salary,      setSalary]      = useState("");
  const [gender,      setGender]      = useState("Male");
  const [genderOpen,  setGenderOpen]  = useState(false);
  const [cnic,        setCnic]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [dob,         setDob]         = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [address,     setAddress]     = useState("");
  const [shiftStart,  setShiftStart]  = useState("");
  const [shiftEnd,    setShiftEnd]    = useState("");

  // Salary pill auto-resize — runs after salary state is declared
  useLayoutEffect(() => {
    if (!salSizerRef.current || !salInpRef.current) return;
    salSizerRef.current.textContent = salary || "XX,XXX";
    const w = Math.max(52, salSizerRef.current.offsetWidth + 4);
    salInpRef.current.style.width = `${w}px`;
  }, [salary]);

  // Language tags
  const [langInput,   setLangInput]   = useState("");
  const [langs,       setLangs]       = useState<string[]>([]);

  // Pro lists
  const [taskInp,  setTaskInp]  = useState("");
  const [tasks,    setTasks]    = useState<string[]>([]);
  const [capInp,   setCapInp]   = useState("");
  const [caps,     setCaps]     = useState<string[]>([]);
  const [specInp,  setSpecInp]  = useState("");
  const [specs,    setSpecs]    = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState("");
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }, []);

  // Image processing — resize to ≤160px height, WebP 82%
  const applyImageFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 160 / img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      setAvatarUrl(canvas.toDataURL("image/webp", 0.82));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const addLang = useCallback(() => {
    const t = langInput.trim();
    if (t && !langs.includes(t)) setLangs(p => [...p, t]);
    setLangInput("");
  }, [langInput, langs]);

  const addItem = useCallback((val: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    const t = val.trim();
    if (t) setter(p => [...p, t]);
    inputSetter("");
  }, []);

  const delItem = useCallback((i: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(p => p.filter((_, idx) => idx !== i));
  }, []);

  // CNIC formatter — inserts dashes at positions 5 and 13
  const handleCnic = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    let out = digits;
    if (digits.length > 5)  out = digits.slice(0, 5)  + "-" + digits.slice(5);
    if (digits.length > 12) out = out.slice(0, 14) + "-" + out.slice(14);
    setCnic(out);
  }, []);

  // Salary input — digits only, comma-separated thousands
  const handleSalaryInput = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setSalary(digits ? Number(digits).toLocaleString("en-PK") : "");
  }, []);

  function handleCreate() {
    if (!name.trim()) { showToast("Full Name is required"); return; }
    if (!role.trim()) { showToast("Position / Role is required"); return; }
    const initials = name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const color    = AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
    const salaryStr = salary ? `PKR ${salary}` : "";
    onSave({ name: name.trim(), role: role.trim(), salary: salaryStr, avatar: avatarUrl, initials, color });
    showToast(`Employee "${name.trim()}" created!`);
    setTimeout(onClose, 900);
  }

  return (
    <div className={`ae-root${!isOpen ? " ae-root--closing" : ""}`}>

      {/* ── Top bar — global .topbar chrome from index.css ── */}
      <header className="topbar">
        <button className="pg-icon-btn" onClick={onClose} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h2 className="t-ttl">Add Employee</h2>
        <div className="t-sp" />
      </header>

      {/* ── Scrollable body ── */}
      <div className="ae-scroll">
        <div className="ae-content">

          {/* ════════════════════════════════════════════════════
              SECTION 1 — Top
              Desktop: [Photo+Salary col] | [Name] | [DOB]
                                           [Role]  | [Joining]
                                           [Shift Timing ←→]
              Mobile: Photo → Salary → 2-col fields below
          ════════════════════════════════════════════════════ */}
          <div className="ae-sec1">

            {/* Left sticky column: Photo (top) + Salary (bottom) */}
            <div className="ae-s1-lft">
              <div className="ae-av-sec">
                <div className="ae-av-halo">
                  <div
                    className={`ae-av-ring${avatarUrl ? " ae-has-img" : ""}${dragOver ? " ae-drag-over" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) applyImageFile(f); }}
                  >
                    {avatarUrl && <img className="ae-av-img" src={avatarUrl} alt="" />}
                    {!avatarUrl && (
                      <div className="ae-av-inner">
                        <CameraSVG />
                        <span>Upload Photo</span>
                      </div>
                    )}
                    {avatarUrl && (
                      <div className="ae-av-chg">
                        <CameraSmSVG />
                        <span>Change</span>
                      </div>
                    )}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="ae-av-file"
                  onChange={e => { if (e.target.files?.[0]) applyImageFile(e.target.files[0]); }} />
              </div>

              <div className="ae-sal-sec">
                <div className="ae-sal-pill">
                  <span ref={salSizerRef} className="ae-sal-sizer" aria-hidden />
                  <span className="ae-sal-cur">PKR</span>
                  <div className="ae-sal-sep" />
                  <input
                    ref={salInpRef}
                    className="ae-sal-inp"
                    type="text" inputMode="numeric" autoComplete="off"
                    placeholder="XX,XXX"
                    value={salary}
                    onKeyDown={e => {
                      if (e.ctrlKey || e.metaKey || e.altKey) return;
                      const allowed = /^\d$/.test(e.key) || ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"].includes(e.key);
                      if (!allowed) e.preventDefault();
                    }}
                    onChange={e => handleSalaryInput(e.target.value)}
                  />
                  <span className="ae-sal-mo">/ mo</span>
                </div>
              </div>
            </div>

            {/* Row 1: Full Name */}
            <div className="ae-field">
              <TextInput label="Full Name" value={name} onChange={v => setName(v)} autoComplete="name" variant="compact" icon={<PersonSVG />} />
            </div>

            {/* Row 1: Date of Birth */}
            <div className="ae-field">
              <div className="ae-fi-wrap">
                <span className="ae-date-ico" onClick={() => dobRef.current?.showPicker?.()}>
                  <CalSVG />
                </span>
                <div className={`ae-date-wrap${!dob ? " empty" : ""}`} data-ph="Date of Birth">
                  <input ref={dobRef}
                    className={`ae-fi ae-date${!dob ? " ae-date-empty" : ""}`}
                    type="date" value={dob} onChange={e => setDob(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 2: Position / Role */}
            <div className="ae-field">
              <TextInput label="Position / Role" value={role} onChange={v => setRole(v)} variant="compact" icon={<BriefSVG />} />
            </div>

            {/* Row 2: Joining Date */}
            <div className="ae-field">
              <div className="ae-fi-wrap">
                <span className="ae-date-ico" onClick={() => joiningRef.current?.showPicker?.()}>
                  <CalSVG />
                </span>
                <div className={`ae-date-wrap${!joiningDate ? " empty" : ""}`} data-ph="Joining Date">
                  <input ref={joiningRef}
                    className={`ae-fi ae-date${!joiningDate ? " ae-date-empty" : ""}`}
                    type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 3: Shift Timing — spans both field columns on desktop */}
            <div className="ae-field ae-s1-sft">
              <div className="ae-shift-row">
                <span className="ae-shift-ico">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                </span>
                <input
                  ref={shiftStartRef}
                  className="ae-shift-time-inp"
                  type="time" value={shiftStart}
                  onChange={e => setShiftStart(e.target.value)}
                />
                <span className="ae-shift-ico">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 11 12 16 7"/><line x1="11" y1="12" x2="21" y2="12"/>
                  </svg>
                </span>
                <input
                  ref={shiftEndRef}
                  className="ae-shift-time-inp"
                  type="time" value={shiftEnd}
                  onChange={e => setShiftEnd(e.target.value)}
                />
              </div>
            </div>

          </div>

          <hr className="ae-divider" />

          {/* ════════════════════════════════════════════════════
              SECTION 2 — Middle
              Desktop: [Assigned Tasks   ] | [Work Capabilities]
                       [Speciality       ] |
              Mobile:  Assigned Tasks → Work Capabilities → Speciality
          ════════════════════════════════════════════════════ */}
          <div className="ae-sec2">
            <div className="ae-s2-lft">
              <BulletList label="Assigned Tasks"  items={tasks} input={taskInp} onInputChange={setTaskInp} placeholder="Add a task…"       onAdd={() => addItem(taskInp, setTasks, setTaskInp)} onDelete={(i: number) => delItem(i, setTasks)} />
              <BulletList label="Speciality"      items={specs} input={specInp} onInputChange={setSpecInp} placeholder="Add a speciality…"  onAdd={() => addItem(specInp, setSpecs, setSpecInp)} onDelete={(i: number) => delItem(i, setSpecs)} />
            </div>
            <div className="ae-s2-rgt">
              <BulletList label="Work Capabilities" items={caps} input={capInp} onInputChange={setCapInp} placeholder="Add a capability…" onAdd={() => addItem(capInp, setCaps, setCapInp)} onDelete={(i: number) => delItem(i, setCaps)} />
            </div>
          </div>

          <hr className="ae-divider" />

          {/* ════════════════════════════════════════════════════
              SECTION 3 — Bottom personal fields
              Desktop (3-col):
                Row 1: Gender | CNIC | Languages
                Row 2: Phone  | Email
                Row 3: Street Address (full width)
              Mobile (2-col, reordered via CSS order):
                Row 1: Gender   | Languages
                Row 2: CNIC     | Phone
                Row 3: Email    (full width)
                Row 4: Street   (full width)
          ════════════════════════════════════════════════════ */}
          <div className="ae-sec3">

            {/* Gender */}
            <div className="ae-field ae-field-rel ae-s3-gdr">
              <div className={`ae-fi-wrap${genderOpen ? " ae-focused" : ""}`}>
                <UsersSVG />
                <div
                  className={`ae-csel${genderOpen ? " ae-open" : ""}`}
                  tabIndex={0}
                  onBlur={() => setTimeout(() => setGenderOpen(false), 120)}
                >
                  <div className="ae-csel-face"
                    onClick={e => { e.stopPropagation(); setGenderOpen(v => !v); }}>
                    <span>{gender}</span>
                    <ChevSVG open={genderOpen} />
                  </div>
                  {genderOpen && (
                    <div className="ae-csel-opts">
                      {GENDERS.map(g => (
                        <div key={g}
                          className={`ae-csel-opt${gender === g ? " ae-selected" : ""}`}
                          onMouseDown={e => { e.preventDefault(); setGender(g); setGenderOpen(false); }}
                        >{g}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CNIC */}
            <div className="ae-field ae-s3-cni">
              <TextInput label="CNIC" value={cnic} onChange={v => handleCnic(v)} maxLength={15} variant="compact" icon={<CardSVG />} />
            </div>

            {/* Spoken Language */}
            <div className="ae-field ae-s3-lng">
              <TextInput
                label="Spoken Language" value={langInput} onChange={v => setLangInput(v)}
                variant="compact" icon={<GlobeSVG />}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addLang(); }
                  else if (e.key === "Backspace" && !langInput && langs.length) setLangs(p => p.slice(0, -1));
                }}
              />
              {langs.length > 0 && (
                <div className="ae-lang-tags">
                  {langs.map(l => (
                    <span key={l} className="ae-lang-tag">
                      {l}
                      <span
                        className="ae-lang-del"
                        onMouseDown={e => { e.preventDefault(); setLangs(p => p.filter(x => x !== l)); }}
                        aria-label={`Remove ${l}`}>✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="ae-field ae-s3-phn">
              <TextInput label="Phone" value={phone} onChange={v => setPhone(v)} type="tel" variant="compact" icon={<PhoneSVG />} />
            </div>

            {/* Email */}
            <div className="ae-field ae-s3-eml">
              <TextInput label="Email" value={email} onChange={v => setEmail(v)} type="email" autoComplete="email" variant="compact" icon={<MailSVG />} />
            </div>

            {/* Street Address — always full width */}
            <div className="ae-field ae-s3-adr ae-span-full">
              <TextInput label="Street Address" value={address} onChange={v => setAddress(v)} variant="compact" icon={<PinSVG />} />
            </div>

          </div>

          {/* ── Actions — right-aligned ── */}
          <div className="ae-act">
            <button className="ae-btn-cancel" onClick={onClose} title="Discard">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <Button onClick={handleCreate}>Create Employee</Button>
          </div>

        </div>
      </div>

      {/* ── Toast ── */}
      <div className={`ae-toast${toast ? " ae-toast-show" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
        {toast}
      </div>

    </div>
  );
}
