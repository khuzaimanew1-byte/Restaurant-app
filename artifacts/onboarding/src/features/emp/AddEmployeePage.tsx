import {
  useState, useRef, useCallback, useLayoutEffect,
  type Dispatch, type SetStateAction,
} from "react";
import { Button }     from "../../components/ui/Button/Button";
import { TextInput }  from "../../components/ui/Input/Input";
import { BulletList } from "../../components/ui/BulletList/BulletList";
import { useCreateEmployee } from "../../hooks/useCreateEmployee";
import type { CreateEmployeePayload } from "../../services/employee.service";
import "./add-bg.css";
import "./add-employee.css";

const DRAFT_KEY = "emp_draft_v1";

interface Draft {
  name: string; role: string; salary: string; gender: string;
  cnic: string; phone: string; email: string; dob: string;
  joiningDate: string; address: string; expYr: string; expMo: string;
  langs: string[]; tasks: string[]; caps: string[]; specs: string[];
}

function readDraft(): Partial<Draft> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch { return {}; }
}

const AVATAR_PALETTE = [
  "var(--av-p1)","var(--av-p2)","var(--av-p3)","var(--av-p4)",
  "var(--av-p5)","var(--av-p6)","var(--av-p7)","var(--av-p8)",
];

const GENDERS = ["Male", "Female", "Other"];

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
const ChevSVG = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="ae-che" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export function AddEmployeePage({
  onClose,
  isOpen = true,
}: {
  onClose: () => void;
  isOpen?: boolean;
}) {
  const createMutation = useCreateEmployee();

  const d = readDraft();

  const [name,        setName]        = useState(d.name        ?? "");
  const [role,        setRole]        = useState(d.role        ?? "");
  const [salary,      setSalary]      = useState(d.salary      ?? "");
  const [gender,      setGender]      = useState(d.gender      ?? "Male");
  const [genderOpen,  setGenderOpen]  = useState(false);
  const [cnic,        setCnic]        = useState(d.cnic        ?? "");
  const [phone,       setPhone]       = useState(d.phone       ?? "");
  const [email,       setEmail]       = useState(d.email       ?? "");
  const [dob,         setDob]         = useState(d.dob         ?? "");
  const [joiningDate, setJoiningDate] = useState(d.joiningDate ?? "");
  const [address,     setAddress]     = useState(d.address     ?? "");
  const [expYr,       setExpYr]       = useState(d.expYr       ?? "");
  const [expMo,       setExpMo]       = useState(d.expMo       ?? "");
  const [langs,       setLangs]       = useState<string[]>(d.langs  ?? []);
  const [langInput,   setLangInput]   = useState("");
  const [tasks,       setTasks]       = useState<string[]>(d.tasks  ?? []);
  const [taskInp,     setTaskInp]     = useState("");
  const [caps,        setCaps]        = useState<string[]>(d.caps   ?? []);
  const [capInp,      setCapInp]      = useState("");
  const [specs,       setSpecs]       = useState<string[]>(d.specs  ?? []);
  const [specInp,     setSpecInp]     = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [dragOver,  setDragOver]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dobRef        = useRef<HTMLInputElement>(null);
  const joiningRef    = useRef<HTMLInputElement>(null);
  const shiftStartRef = useRef<HTMLInputElement>(null);
  const shiftEndRef   = useRef<HTMLInputElement>(null);
  const expYrRef      = useRef<HTMLInputElement>(null);

  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd,   setShiftEnd]   = useState("");

  // Salary pill auto-resize
  const salInpRef   = useRef<HTMLInputElement>(null);
  const salSizerRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!salSizerRef.current || !salInpRef.current) return;
    salSizerRef.current.textContent = salary || "XX,XXX";
    const w = Math.max(52, salSizerRef.current.offsetWidth + 4);
    salInpRef.current.style.width = `${w}px`;
  }, [salary]);

  const draftRef = useRef<Draft>({ name, role, salary, gender, cnic, phone, email, dob, joiningDate, address, expYr, expMo, langs, tasks, caps, specs });
  draftRef.current = { name, role, salary, gender, cnic, phone, email, dob, joiningDate, address, expYr, expMo, langs, tasks, caps, specs };
  
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleDraftSave = useCallback(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draftRef.current)); } catch { /* quota exceeded */ }
    }, 400);
  }, []);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toast,     setToast]     = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    setToastShow(false);
    requestAnimationFrame(() => setToastShow(true));
    toastTimerRef.current = setTimeout(() => {
      setToastShow(false);
      setTimeout(() => setToast(""), 380); 
    }, 3200);
  }, []);

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
    if (t && !langs.includes(t)) { setLangs(p => [...p, t]); scheduleDraftSave(); }
    setLangInput("");
  }, [langInput, langs, scheduleDraftSave]);

  const addItem = useCallback((
    val: string,
    setter: Dispatch<SetStateAction<string[]>>,
    inputSetter: Dispatch<SetStateAction<string>>,
  ) => {
    const t = val.trim();
    if (t) { setter(p => [...p, t]); scheduleDraftSave(); }
    inputSetter("");
  }, [scheduleDraftSave]);

  const delItem = useCallback((i: number, setter: Dispatch<SetStateAction<string[]>>) => {
    setter(p => p.filter((_, idx) => idx !== i));
    scheduleDraftSave();
  }, [scheduleDraftSave]);

  const handleCnic = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    let out = digits;
    if (digits.length > 12) {
      out = digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12);
    } else if (digits.length > 5) {
      out = digits.slice(0, 5) + "-" + digits.slice(5);
    }
    setCnic(out);
    scheduleDraftSave();
  }, [scheduleDraftSave]);

  const handlePhone = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    const out = digits.length > 4 ? digits.slice(0, 4) + "-" + digits.slice(4) : digits;
    setPhone(out);
    scheduleDraftSave();
  }, [scheduleDraftSave]);

  const handleCancel = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  }, [onClose]);

  const handleSalaryInput = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setSalary(digits ? Number(digits).toLocaleString("en-PK") : "");
    scheduleDraftSave();
  }, [scheduleDraftSave]);

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleCreate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full Name is required";
    if (!role.trim()) errs.role = "Position / Role is required";
    if (!cnic.trim()) errs.cnic = "CNIC is required";
    else if (cnic.replace(/\D/g, "").length < 13) errs.cnic = "Enter complete 13-digit CNIC";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const expObj: { y?: number; m?: number } = {};
    const yr = parseInt(expYr || "0", 10);
    const mo = parseInt(expMo || "0", 10);
    if (yr > 0) expObj.y = Math.min(99, yr);
    if (mo > 0) expObj.m = Math.min(12, mo);

    const payload: CreateEmployeePayload = {
      name:  name.trim(),
      role:  role.trim(),
      cnic:  cnic.replace(/\D/g, ""),             
      sal:   salary ? parseInt(salary.replace(/,/g, ""), 10) : undefined,
      gen:   gender                || undefined,
      email: email.trim()          || undefined,
      dob:   dob                   || undefined,
      ph:    phone.trim()          || undefined,
      hire:  joiningDate           || undefined,
      addr:  address.trim()        || undefined,
      img:   avatarUrl             || undefined,
      lang:  langs.length  ? langs  : undefined,
      task:  tasks.length  ? tasks  : undefined,
      cap:   caps.length   ? caps   : undefined,
      spec:  specs.length  ? specs  : undefined,
      exp:   Object.keys(expObj).length ? expObj : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        
        localStorage.removeItem(DRAFT_KEY);
        onClose();
      },
      onError: (err) => {
        showToast(err.message || "Failed to create employee. Please try again.");
      },
    });
  }

  const isPending = createMutation.isPending;

  return (
    <div className="ae-roo">

      {}
      <header className="topbar">
        <button className="pg-ib" onClick={onClose} aria-label="Back" disabled={isPending}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h2 className="t-ttl">Add Employee</h2>
        <div className="t-sp" />
      </header>

      {}
      <div className="ae-scr">
        <div className="ae-con">

          {}
          <div className="ae-sec">

            {}
            <div className="ae-s1l">
              <div className="ae-avs">
                <div className="ae-avh">
                  <div
                    className={`ae-avr${avatarUrl ? " ae-has-img" : ""}${dragOver ? " ae-dra" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) applyImageFile(f); }}
                  >
                    {avatarUrl && <img className="ae-avi" src={avatarUrl} alt="" />}
                    {!avatarUrl && (
                      <div className="ae-av1"><CameraSVG /><span>Upload Photo</span></div>
                    )}
                    {avatarUrl && (
                      <div className="ae-avc"><CameraSmSVG /><span>Change</span></div>
                    )}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image}
            <div className="ae-s1r">

              <div className="ae-fie">
                <TextInput label="Full Name" value={name} onChange={v => { setName(v); scheduleDraftSave(); if (errors.name) setErrors(p => ({...p, name: ""})); }}
                  autoComplete="name" variant="compact" icon={<PersonSVG />} error={errors.name} />
              </div>

              <div className="ae-fie">
                <TextInput
                  label="Spoken Language" value={langInput} onChange={v => setLangInput(v)}
                  variant="compact" icon={<GlobeSVG />}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addLang(); }
                    else if (e.key === "Backspace" && !langInput && langs.length) { setLangs(p => p.slice(0, -1)); scheduleDraftSave(); }
                  }}
                />
                {langs.length > 0 && (
                  <div className="ae-la2">
                    {langs.map(l => (
                      <span key={l} className="ae-la1">
                        {l}
                        <span className="ae-lan"
                          onMouseDown={e => { e.preventDefault(); setLangs(p => p.filter(x => x !== l)); scheduleDraftSave(); }}
                          aria-label={`Remove ${l}`}>✕</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ae-fie">
                <TextInput label="Position / Role" value={role} onChange={v => { setRole(v); scheduleDraftSave(); if (errors.role) setErrors(p => ({...p, role: ""})); }}
                  variant="compact" icon={<BriefSVG />} error={errors.role} />
              </div>

              <div className="ae-fie">
                <div className="ae-fiw" onClick={() => { try { joiningRef.current?.showPicker?.(); } catch {  } }}>
                  <span className="ae-da2"><CalSVG /></span>
                  <div className={`ae-da3${!joiningDate ? " empty" : ""}`} data-ph="Joining Date">
                    <input ref={joiningRef}
                      className={`ae-fi ae-dat${!joiningDate ? " ae-da1" : ""}`}
                      type="date" value={joiningDate}
                      onChange={e => { setJoiningDate(e.target.value); scheduleDraftSave(); }} />
                  </div>
                </div>
              </div>

              {}
              <div className="ae-fie ae-s1-exp">
                <div className="ae-sh1">
                  <span className="ae-ex2">EXP</span>
                  <input ref={expYrRef}
                    className="ae-ex1" type="number" inputMode="numeric"
                    min="0" max="99" placeholder="0"
                    value={expYr}
                    onKeyDown={e => { if (!/[\d]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) e.preventDefault(); }}
                    onChange={e => { setExpYr(e.target.value.replace(/\D/g, "").slice(0, 2)); scheduleDraftSave(); }}
                  />
                  <span className="ae-ex3">Yrs</span>
                  <span className="ae-exp" aria-hidden>·</span>
                  <input
                    className="ae-ex1" type="number" inputMode="numeric"
                    min="0" max="12" placeholder="0"
                    value={expMo}
                    onKeyDown={e => { if (!/[\d]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) e.preventDefault(); }}
                    onChange={e => { setExpMo(e.target.value.replace(/\D/g, "").slice(0, 2)); scheduleDraftSave(); }}
                  />
                  <span className="ae-ex3">Mo</span>
                </div>
              </div>

              {}
              <div className="ae-fie ae-s1-sft">
                <div className="ae-sh1">
                  <span className="ae-shi">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                  </span>
                  <input ref={shiftStartRef} className="ae-sh2" type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
                  <span className="ae-shi">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 11 12 16 7"/><line x1="11" y1="12" x2="21" y2="12"/>
                    </svg>
                  </span>
                  <input ref={shiftEndRef} className="ae-sh2" type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
                </div>
              </div>

            </div>
          </div>

          <hr className="ae-div" />

          {}
          <div className="ae-se1">
            <div className="ae-s2l">
              <BulletList label="Assigned Tasks"  items={tasks} input={taskInp} onInputChange={setTaskInp} placeholder="Add a task…"
                onAdd={() => addItem(taskInp, setTasks, setTaskInp)} onDelete={i => delItem(i, setTasks)} />
              <BulletList label="Speciality"      items={specs} input={specInp} onInputChange={setSpecInp} placeholder="Add a speciality…"
                onAdd={() => addItem(specInp, setSpecs, setSpecInp)} onDelete={i => delItem(i, setSpecs)} />
            </div>
            <div className="ae-s2-rgt">
              <BulletList label="Work Capabilities" items={caps} input={capInp} onInputChange={setCapInp} placeholder="Add a capability…"
                onAdd={() => addItem(capInp, setCaps, setCapInp)} onDelete={i => delItem(i, setCaps)} />
            </div>
          </div>

          <hr className="ae-div" />

          {}
          <div className="ae-se2">

            {/* Gender */}
            <div className="ae-fie">
              <div className="ae-fiw ae-gen" onClick={() => setGenderOpen(o => !o)}>
                <span className="ae-da2"><UsersSVG /></span>
                <span className="ae-cs2">{gender}</span>
                <ChevSVG open={genderOpen} />
              </div>
              {genderOpen && (
                <div className="ae-cs1">
                  {GENDERS.map(g => (
                    <button key={g} className={`ae-cse${gender === g ? " ae-sel" : ""}`}
                      onClick={() => { setGender(g); setGenderOpen(false); scheduleDraftSave(); }}>
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CNIC */}
            <div className="ae-fie">
              <TextInput label="CNIC" value={cnic} onChange={handleCnic}
                variant="compact" icon={<CardSVG />} error={errors.cnic}
                placeholder="XXXXX-XXXXXXX-X" />
            </div>

            {/* Phone */}
            <div className="ae-fie">
              <TextInput label="Phone" value={phone} onChange={handlePhone}
                variant="compact" icon={<PhoneSVG />} />
            </div>

            {/* Email */}
            <div className="ae-fie">
              <TextInput label="Email" value={email} onChange={v => { setEmail(v); scheduleDraftSave(); }}
                autoComplete="email" variant="compact" icon={<MailSVG />} />
            </div>

            {/* Date of Birth */}
            <div className="ae-fie">
              <div className="ae-fiw" onClick={() => { try { dobRef.current?.showPicker?.(); } catch { /* noop */ } }}>
                <span className="ae-da2"><CalSVG /></span>
                <div className={`ae-da3${!dob ? " empty" : ""}`} data-ph="Date of Birth">
                  <input ref={dobRef}
                    className={`ae-fi ae-dat${!dob ? " ae-da1" : ""}`}
                    type="date" value={dob}
                    onChange={e => { setDob(e.target.value); scheduleDraftSave(); }} />
                </div>
              </div>
            </div>

            {}
            <div className="ae-fie ae-field-addr">
              <TextInput label="Street Address" value={address} onChange={v => { setAddress(v); scheduleDraftSave(); }}
                variant="compact" icon={<PinSVG />} />
            </div>

          </div>

          {/* ── Actions ── */}
          <div className="ae-act">
            <button className="ae-btn" onClick={handleCancel} aria-label="Cancel" disabled={isPending}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creating…" : "Create Employee"}
            </Button>
          </div>

        </div>
      </div>

      {}
      {toast && (
        <div className={`ae-toa${toastShow ? " ae-to1" : ""}`} role="alert">
          {toast}
        </div>
      )}

    </div>
  );
}

