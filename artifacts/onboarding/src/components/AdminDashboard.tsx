import { useState, useEffect } from "react";

interface EmployeeToday {
  effectiveStatus: string;
  checkInAt:  string | null;
  checkOutAt: string | null;
  isLate: boolean;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  salary: number;
  profilePhoto: string | null;
  performanceScore: number;
  attendancePercent: number;
  today: EmployeeToday;
}

function decodeJwt(token: string): { sub: string } {
  try {
    const payload = token.split(".")[1] ?? "";
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { sub: string };
  } catch {
    return { sub: "" };
  }
}

function getInitial(str: string) {
  return (str.trim().charAt(0) || "A").toUpperCase();
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).replace(" am", " AM").replace(" pm", " PM");
}

function fmtSalary(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)   return `₹${Math.round(n / 1_000)}K`;
  return `₹${n}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function statCls(pct: number) {
  if (pct >= 80) return "emp-stat-val--high";
  if (pct >= 60) return "emp-stat-val--mid";
  return "emp-stat-val--low";
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  present_working: { label: "Working",     cls: "emp-chip--working" },
  present_done:    { label: "Checked Out", cls: "emp-chip--done"    },
  leave:           { label: "On Leave",    cls: "emp-chip--leave"   },
  absent:          { label: "Absent",      cls: "emp-chip--absent"  },
  late:            { label: "Late",        cls: "emp-chip--late"    },
  not_in:          { label: "Not In",      cls: "emp-chip--not-in"  },
};

function StatusChip({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status] ?? STATUS_MAP["not_in"]!;
  return (
    <span className={`emp-chip ${cls}`}>
      <span className="emp-chip__dot" />
      {label}
    </span>
  );
}

function EmployeeBar({ emp }: { emp: Employee }) {
  const init = getInitial(emp.name);
  const { checkInAt, checkOutAt, effectiveStatus } = emp.today;
  const noTimes = effectiveStatus === "leave" || effectiveStatus === "absent";
  const hasIn   = !!checkInAt && !noTimes;
  const hasOut  = !!checkOutAt && !noTimes;

  return (
    <div className="emp-bar">
      <div className="emp-avatar">
        {emp.profilePhoto
          ? <img src={emp.profilePhoto} alt={emp.name} />
          : init}
      </div>

      <div className="emp-identity">
        <div className="emp-name">{emp.name}</div>
        <div className="emp-role-salary">
          <span className="emp-role">{emp.role}</span>
          <span className="emp-salary-dot">·</span>
          <span className="emp-salary">{fmtSalary(emp.salary)}</span>
        </div>
      </div>

      <div className="emp-times">
        <div className="emp-time-col">
          <div className="emp-time-label">In</div>
          <div className={`emp-time-value ${noTimes ? "emp-time-value--none" : hasIn ? "emp-time-value--in" : "emp-time-value--none"}`}>
            {noTimes ? "—" : fmtTime(checkInAt)}
          </div>
        </div>
        <div className="emp-time-col">
          <div className="emp-time-label">Out</div>
          <div className={`emp-time-value ${hasOut ? "emp-time-value--out" : "emp-time-value--none"}`}>
            {noTimes ? "—" : fmtTime(checkOutAt)}
          </div>
        </div>
      </div>

      <div className="emp-status">
        <StatusChip status={effectiveStatus} />
      </div>

      <div className="emp-stats">
        <div className="emp-stat">
          <div className={`emp-stat-val ${statCls(emp.performanceScore)}`}>{emp.performanceScore}%</div>
          <div className="emp-stat-lbl">Perf</div>
        </div>
        <div className="emp-stat">
          <div className={`emp-stat-val ${statCls(emp.attendancePercent)}`}>{emp.attendancePercent}%</div>
          <div className="emp-stat-lbl">Att</div>
        </div>
      </div>

      <button className="emp-info-btn" aria-label="View details">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 6.5v3.5M7 4h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="emp-bar emp-bar--skel">
      <div className="skel skel-avatar" />
      <div className="skel-body">
        <div className="skel skel-line skel-line--name" />
        <div className="skel skel-line skel-line--sub" />
      </div>
    </div>
  );
}

export function AdminDashboard({
  onLogout,
  onAddEmployee,
}: {
  onLogout: () => void;
  onAddEmployee: () => void;
}) {
  const token      = localStorage.getItem("auth_token") ?? "";
  const decoded    = decodeJwt(token);
  const adminEmail = decoded.sub;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/employees", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Employee[]>;
      })
      .then(data => { if (!cancelled) { setEmployees(data); setLoading(false); } })
      .catch((e: Error) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="admin">
      <header className="admin-bar">
        <span className="admin-bar__brand">MyRestaurant</span>
        <div className="admin-bar__actions">
          <button className="admin-logout-btn" onClick={onLogout} title="Log out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="admin-bar__avatar" title={adminEmail}>
            {getInitial(adminEmail || "A")}
          </div>
        </div>
      </header>

      <main className="admin-content">
        <div className="admin-section-head">
          Staff &nbsp;·&nbsp; {fmtDate(new Date())}
        </div>

        {loading && (
          <div className="emp-list">
            {[0, 1, 2, 3].map(i => <SkeletonBar key={i} />)}
          </div>
        )}

        {error && (
          <div className="admin-feedback admin-feedback--error">
            Could not load employees ({error})
          </div>
        )}

        {!loading && !error && employees.length === 0 && (
          <div className="admin-feedback">
            <p className="admin-feedback__head">No employees yet</p>
            <p className="admin-feedback__sub">Tap + to add your first staff member</p>
          </div>
        )}

        {!loading && !error && employees.length > 0 && (
          <div className="emp-list">
            {employees.map(emp => <EmployeeBar key={emp.id} emp={emp} />)}
          </div>
        )}
      </main>

      <button className="admin-fab" onClick={onAddEmployee} aria-label="Add employee">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
