export type DbSt = "leave" | "unauth" | "half" | "late" | null;
export type UiSt = "leave" | "unauthorized-leave" | "half-day" | "late" | null;
export type Shift = { in?: string; out?: string } | null;

export interface EmpCard {
  id: number; name: string; role: string; salary: string;
  checkIn: string; checkOut: string; leaveStatus: UiSt;
  att: number; perf: number; avatar: string; initials: string; color: string;
}

export interface EmpRow {
  id: number; name: string; role: string;
  sal: number | null; img: string | null;
  att: number | null; perf: number | null;
  sts: string | null; shift: Shift;
}

export interface EmpProfRow {
  id: number; name: string; role: string; cnic: string;
  lang: string[]; hire: string | null;
  exp: { y?: number; m?: number } | null;
  task: string[]; cap: string[]; spec: string[];
  gen: string | null; email: string | null; dob: string | null;
  ph: string | null; addr: string | null; sal: number | null; img: string | null;
  att: number | null; perf: number | null; sts: string | null; shift: Shift;
}

export interface EmpProf {
  id: number; name: string; role: string; cnic: string;
  lang: string[]; hire: string | null;
  exp: { y?: number; m?: number } | null;
  task: string[]; cap: string[]; spec: string[];
  gen: string | null; email: string | null; dob: string | null;
  ph: string | null; addr: string | null; sal: number | null; img: string | null;
  att: number; perf: number; sts: DbSt;
  shift: { in: string | null; out: string | null } | null;
  initials: string; color: string;
}

const avCss = [
  "var(--av-p1)", "var(--av-p2)", "var(--av-p3)", "var(--av-p4)",
  "var(--av-p5)", "var(--av-p6)", "var(--av-p7)", "var(--av-p8)",
];

function mkInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

function mkColor(name: string): string {
  return avCss[name.charCodeAt(0) % avCss.length]!;
}

export function dbUi(st: DbSt): UiSt {
  if (st === "unauth") return "unauthorized-leave";
  if (st === "half") return "half-day";
  return st as UiSt;
}

export function empCard(row: EmpRow): EmpCard {
  const salary = row.sal === null ? "" : `PKR ${row.sal.toLocaleString("en-PK")}`;
  return {
    id: row.id, name: row.name, role: row.role, salary,
    checkIn: row.shift?.in ?? "", checkOut: row.shift?.out ?? "",
    leaveStatus: dbUi(row.sts as DbSt),
    att: row.att ?? 100, perf: row.perf ?? 100,
    avatar: row.img ?? "", initials: mkInitials(row.name), color: mkColor(row.name),
  };
}

export function fullProf(row: EmpProfRow): EmpProf {
  return {
    id: row.id, name: row.name, role: row.role, cnic: row.cnic,
    lang: row.lang, hire: row.hire ?? null, exp: row.exp ?? null,
    task: row.task, cap: row.cap, spec: row.spec,
    gen: row.gen ?? null, email: row.email ?? null, dob: row.dob ?? null,
    ph: row.ph ?? null, addr: row.addr ?? null, sal: row.sal ?? null, img: row.img ?? null,
    att: row.att ?? 100, perf: row.perf ?? 100, sts: (row.sts as DbSt) ?? null,
    shift: row.shift ? { in: row.shift.in ?? null, out: row.shift.out ?? null } : null,
    initials: mkInitials(row.name), color: mkColor(row.name),
  };
}
