import { Injectable, OnModuleInit, NotFoundException } from "@nestjs/common";
import { pool } from "@workspace/db";
import { EmployeesRepository } from "./employees.repository.js";
import { toEmployeeCard }       from "./employees.types.js";
import type { CreateEmployeeDto } from "./dto/create-employee.dto.js";
import type { UpdateStatusDto }   from "./dto/update-status.dto.js";
import type { EmployeeCard }      from "./employees.types.js";
/* SSOT: seed data lives in ./seeds/index.ts — never inline here */
import { PROFILE_SEEDS, STATUS_SEEDS } from "./seeds/index.js";

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(private readonly repo: EmployeesRepository) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────
  async onModuleInit() {
    await this.initTables();
    await this.seedIfEmpty();
  }

  /* Safety-net: CREATE TABLE IF NOT EXISTS so the server boots on a fresh DB.
     Also runs idempotent ALTER TABLE migrations to keep existing DBs in sync.
     Drizzle schema in lib/db is the canonical definition.                      */
  private async initTables() {
    const client = await (pool as import("pg").Pool).connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS employee_profile (
          id         SERIAL PRIMARY KEY,
          name       VARCHAR(200) NOT NULL,
          role       VARCHAR(100) NOT NULL,
          cnic       VARCHAR(15)  NOT NULL,
          lang       TEXT[]       NOT NULL DEFAULT '{}',
          hire       VARCHAR(20),
          exp        JSONB,
          task       TEXT[]       NOT NULL DEFAULT '{}',
          cap        TEXT[]       NOT NULL DEFAULT '{}',
          spec       TEXT[]       NOT NULL DEFAULT '{}',
          gen        VARCHAR(20),
          email      VARCHAR(255),
          dob        VARCHAR(20),
          ph         VARCHAR(30),
          addr       TEXT,
          sal        INTEGER,
          img        TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS employee_status (
          id    SERIAL PRIMARY KEY,
          eid   INTEGER NOT NULL REFERENCES employee_profile(id) ON DELETE CASCADE,
          att   INTEGER NOT NULL DEFAULT 100,
          perf  INTEGER NOT NULL DEFAULT 100,
          sts   VARCHAR(10),
          shift JSONB
        )
      `);
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_emp_status_eid ON employee_status(eid)`,
      );

      /* ── Idempotent migrations — run on every boot, safe to repeat ── */

      /* Add shift column if old DB still lacks it */
      await client.query(`
        ALTER TABLE employee_status ADD COLUMN IF NOT EXISTS shift JSONB
      `);

      /* Migrate existing sin/sout data into shift JSONB */
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'employee_status' AND column_name = 'sin'
          ) THEN
            UPDATE employee_status
            SET shift = jsonb_strip_nulls(jsonb_build_object('in', sin, 'out', sout))
            WHERE shift IS NULL AND (sin IS NOT NULL OR sout IS NOT NULL);
          END IF;
        END $$
      `);

      /* Drop legacy columns if they still exist */
      await client.query(`ALTER TABLE employee_status DROP COLUMN IF EXISTS sin`);
      await client.query(`ALTER TABLE employee_status DROP COLUMN IF EXISTS sout`);
      await client.query(`ALTER TABLE employee_status DROP COLUMN IF EXISTS created_at`);
      await client.query(`ALTER TABLE employee_status DROP COLUMN IF EXISTS updated_at`);

    } finally {
      client.release();
    }
  }

  private async seedIfEmpty() {
    const count = await this.repo.countProfiles();
    if (count > 0) return;

    for (let i = 0; i < PROFILE_SEEDS.length; i++) {
      const p = PROFILE_SEEDS[i]!;
      const s = STATUS_SEEDS[i]!;
      const profile = await this.repo.rawInsertProfile({
        name: p.name, role: p.role, cnic: p.cnic, sal: p.sal,
        gen: p.gen, img: p.img,
        lang: [...p.lang], task: [...p.task], cap: [...p.cap], spec: [...p.spec],
      });
      await this.repo.insertStatus(profile.id, {
        att: s.att, perf: s.perf, sts: s.sts as string | null,
        shift: s.shift ?? null,
      });
    }
  }

  // ── Business logic ────────────────────────────────────────────────────
  async getAll(): Promise<EmployeeCard[]> {
    const rows = await this.repo.findAll();
    return rows.map(r => toEmployeeCard({
      id:    r.id,
      name:  r.name,
      role:  r.role,
      sal:   r.sal   ?? null,
      img:   r.img   ?? null,
      att:   r.att   ?? null,
      perf:  r.perf  ?? null,
      sts:   r.sts   ?? null,
      shift: (r.shift as { in?: string; out?: string } | null) ?? null,
    }));
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeCard> {
    const profile = await this.repo.insertProfile(dto);
    await this.repo.insertStatus(profile.id);
    /* Re-fetch via getAll so the join always produces the same shape */
    const rows = await this.repo.findAll();
    const row  = rows.find(r => r.id === profile.id);
    if (!row) throw new NotFoundException("Created employee not found");
    return toEmployeeCard({
      id: row.id, name: row.name, role: row.role,
      sal: row.sal ?? null, img: row.img ?? null,
      att: row.att ?? null, perf: row.perf ?? null,
      sts: row.sts ?? null,
      shift: (row.shift as { in?: string; out?: string } | null) ?? null,
    });
  }

  async updateStatus(eid: number, dto: UpdateStatusDto): Promise<EmployeeCard> {
    const rows  = await this.repo.findAll();
    const exists = rows.find(r => r.id === eid);
    if (!exists) throw new NotFoundException(`Employee #${eid} not found`);

    const patch: Record<string, unknown> = {};
    if ("sts"   in dto) patch["sts"]   = dto.sts   ?? null;
    if ("shift" in dto) patch["shift"] = dto.shift  ?? null;
    if ("att"   in dto) patch["att"]   = dto.att;
    if ("perf"  in dto) patch["perf"]  = dto.perf;

    await this.repo.patchStatus(eid, patch as Parameters<EmployeesRepository["patchStatus"]>[1]);

    const updated = await this.repo.findAll();
    const row     = updated.find(r => r.id === eid)!;
    return toEmployeeCard({
      id: row.id, name: row.name, role: row.role,
      sal: row.sal ?? null, img: row.img ?? null,
      att: row.att ?? null, perf: row.perf ?? null,
      sts: row.sts ?? null,
      shift: (row.shift as { in?: string; out?: string } | null) ?? null,
    });
  }
}
