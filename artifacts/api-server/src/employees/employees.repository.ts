import { Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { db, employeeProfile, employeeStatus } from "@workspace/db";
import type { CreateEmployeeDto } from "./dto/create-employee.dto.js";

@Injectable()
export class EmployeesRepository {

  /** Full join: profile + status for every employee */
  async findAll() {
    return db
      .select({
        id:    employeeProfile.id,
        name:  employeeProfile.name,
        role:  employeeProfile.role,
        sal:   employeeProfile.sal,
        img:   employeeProfile.img,
        att:   employeeStatus.att,
        perf:  employeeStatus.perf,
        sts:   employeeStatus.sts,
        shift: employeeStatus.shift,
      })
      .from(employeeProfile)
      .leftJoin(employeeStatus, eq(employeeStatus.eid, employeeProfile.id));
  }

  async insertProfile(dto: CreateEmployeeDto) {
    const [row] = await db.insert(employeeProfile).values({
      name:  dto.name,
      role:  dto.role,
      cnic:  dto.cnic,
      sal:   dto.sal   ?? null,
      gen:   dto.gen   ?? null,
      email: dto.email ?? null,
      dob:   dto.dob   ?? null,
      ph:    dto.ph    ?? null,
      hire:  dto.hire  ?? null,
      addr:  dto.addr  ?? null,
      img:   dto.img   ?? null,
      lang:  dto.lang  ?? [],
      task:  dto.task  ?? [],
      cap:   dto.cap   ?? [],
      spec:  dto.spec  ?? [],
      exp:   dto.exp   ?? null,
    }).returning();
    return row!;
  }

  async insertStatus(eid: number, data: {
    att?: number; perf?: number;
    sts?: string | null; shift?: { in?: string; out?: string } | null;
  } = {}) {
    const [row] = await db.insert(employeeStatus).values({
      eid,
      att:   data.att   ?? 100,
      perf:  data.perf  ?? 100,
      sts:   (data.sts  ?? null) as string | null,
      shift: data.shift ?? null,
    }).returning();
    return row!;
  }

  async patchStatus(eid: number, patch: {
    sts?: string | null; shift?: { in?: string; out?: string } | null;
    att?: number; perf?: number;
  }) {
    /* Build set object explicitly — any is unavoidable for dynamic patch */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    if ("sts"   in patch) update["sts"]   = patch.sts   ?? null;
    if ("shift" in patch) update["shift"] = patch.shift ?? null;
    if ("att"   in patch) update["att"]   = patch.att;
    if ("perf"  in patch) update["perf"]  = patch.perf;

    const [row] = await db
      .update(employeeStatus)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(update as any)
      .where(eq(employeeStatus.eid, eid))
      .returning();
    return row;
  }

  async countProfiles(): Promise<number> {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(employeeProfile);
    return row?.n ?? 0;
  }

  /** Raw insert used only by seeder — bypasses DTO */
  async rawInsertProfile(data: typeof employeeProfile.$inferInsert) {
    const [row] = await db.insert(employeeProfile).values(data).returning();
    return row!;
  }
}
