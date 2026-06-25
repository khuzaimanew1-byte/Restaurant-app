export type DbSt = "leave" | "unauth" | "half" | "late" | null;
export type UiSt = "leave" | "unauthorized-leave" | "half-day" | "late" | null;
export type Shift = { in?: string; out?: string } | null;

export interface EmpCard {
  id: number;
  name: string;
  role: string;
  salary: string;
  checkIn: string;
  checkOut: string;
  leaveStatus: UiSt;
  att: number;
  perf: number;
  avatar: string;
  initials: string;
  color: string;
}

export interface EmpRow {
  id: number;
  name: string;
  role: string;
  sal: number | null;
  img: string | null;
  att: number | null;
  perf: number | null;
  sts: string | null;
  shift: Shift;
}

const avCss = [
  "var(--av-p1)",
  "var(--av-p2)",
  "var(--av-p3)",
  "var(--av-p4)",
  "var(--av-p5)",
  "var(--av-p6)",
  "var(--av-p7)",
  "var(--av-p8)",
];

export function dbUi(st: DbSt): UiSt {
  if (st === "unauth") return "unauthorized-leave";
  if (st === "half") return "half-day";
  return st as UiSt;
}

export function empCard(row: EmpRow): EmpCard {
  const words = row.name.trim().split(/\s+/);
  const initials = words.map(word => word[0] ?? "").join("").slice(0, 2).toUpperCase();
  const color = avCss[row.name.charCodeAt(0) % avCss.length]!;
  const salary = row.sal === null ? "" : `PKR ${row.sal.toLocaleString("en-PK")}`;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    salary,
    checkIn: row.shift?.in ?? "",
    checkOut: row.shift?.out ?? "",
    leaveStatus: dbUi(row.sts as DbSt),
    att: row.att ?? 100,
    perf: row.perf ?? 100,
    avatar: row.img ?? "",
    initials,
    color,
  };
}

