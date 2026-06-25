import { Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { db, employeeProfile, employeeStatus } from "@workspace/db";
import type { NewEmpDto } from "./dto/emp.dto.js";
import type { EmpRow, Shift } from "./emp.vm.js";

export interface StPatch {
  sts?: string | null;
  shift?: Shift;
  att?: number;
  perf?: number;
}

const cols = {
  id: employeeProfile.id,
  name: employeeProfile.name,
  role: employeeProfile.role,
  sal: employeeProfile.sal,
  img: employeeProfile.img,
  att: employeeStatus.att,
  perf: employeeStatus.perf,
  sts: employeeStatus.sts,
  shift: employeeStatus.shift,
};

@Injectable()
export class EmpRepo {
  async page(page: number, size: number): Promise<EmpRow[]> {
    return db
      .select(cols)
      .from(employeeProfile)
      .leftJoin(employeeStatus, eq(employeeStatus.eid, employeeProfile.id))
      .orderBy(employeeProfile.id)
      .limit(size)
      .offset((page - 1) * size);
  }

  async byId(id: number): Promise<EmpRow | undefined> {
    const [row] = await db
      .select(cols)
      .from(employeeProfile)
      .leftJoin(employeeStatus, eq(employeeStatus.eid, employeeProfile.id))
      .where(eq(employeeProfile.id, id))
      .limit(1);
    return row;
  }

  async insProf(dto: NewEmpDto): Promise<{ id: number }> {
    const [row] = await db.insert(employeeProfile).values({
      name: dto.name,
      role: dto.role,
      cnic: dto.cnic,
      sal: dto.sal ?? null,
      gen: dto.gen ?? null,
      email: dto.email ?? null,
      dob: dto.dob ?? null,
      ph: dto.ph ?? null,
      hire: dto.hire ?? null,
      addr: dto.addr ?? null,
      img: dto.img ?? null,
      lang: dto.lang ?? [],
      task: dto.task ?? [],
      cap: dto.cap ?? [],
      spec: dto.spec ?? [],
      exp: dto.exp ?? null,
    }).returning({ id: employeeProfile.id });
    return row!;
  }

  async insSt(eid: number, data: StPatch = {}): Promise<void> {
    await db.insert(employeeStatus).values({
      eid,
      att: data.att ?? 100,
      perf: data.perf ?? 100,
      sts: data.sts ?? null,
      shift: data.shift ?? null,
    });
  }

  async updSt(eid: number, patch: StPatch): Promise<boolean> {
    const set: Partial<typeof employeeStatus.$inferInsert> = {};
    if ("sts" in patch) set.sts = patch.sts ?? null;
    if ("shift" in patch) set.shift = patch.shift ?? null;
    if ("att" in patch) set.att = patch.att;
    if ("perf" in patch) set.perf = patch.perf;
    if (!Object.keys(set).length) return true;

    const rows = await db
      .update(employeeStatus)
      .set(set)
      .where(eq(employeeStatus.eid, eid))
      .returning({ id: employeeStatus.id });
    return rows.length > 0;
  }

  async cnt(): Promise<number> {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(employeeProfile);
    return row?.n ?? 0;
  }
}

