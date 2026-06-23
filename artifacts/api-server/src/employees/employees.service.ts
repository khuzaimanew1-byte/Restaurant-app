import { Injectable, OnModuleInit, NotFoundException } from "@nestjs/common";
import { pool } from "@workspace/db";
import { EmployeesRepository } from "./employees.repository.js";
import { toEmployeeCard }       from "./employees.types.js";
import type { CreateEmployeeDto } from "./dto/create-employee.dto.js";
import type { UpdateStatusDto }   from "./dto/update-status.dto.js";
import type { EmployeeCard }      from "./employees.types.js";

/* Seed data imported directly — only used in onModuleInit seeder         */
const PROFILE_SEEDS = [
  { name: "Alex Rivera",       role: "Senior Developer",     cnic: "4210112345671", sal: 4500, gen: "Male",   img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1bgJ9ObEX7Vmu2iodeu7ANsiyGaq3QqIV4cWRXrFs7iNvfixN5Pi1Bd0quN2nwqIw47xRZYRE_WzrWhIpY95KrALTGanCnM79dPhYaNbEntw6yMmqhc9yPEQMeBjjQL83NbIEAJdYjx18JZ_I7VSjZ2Rocv6HMa4IZ4yZdzdiCaRFiW5bxwaFqVEJSHL1CiynOn7vyhIM7-bWKBHQ13pcg-OGh7iAVXOyZkHm8muL1o5y52Qi9RRVShyLSHtedEfxYYYqjvqGnHMJ", lang: ["English","Spanish"], task: ["Backend Development","Code Review"],       cap: ["System Design","API Development"],  spec: ["Node.js","TypeScript"] },
  { name: "Sarah Chen",        role: "UX Designer",          cnic: "4210298765432", sal: 5200, gen: "Female", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",  lang: ["English","Mandarin"],  task: ["UI Design","User Research"],            cap: ["Prototyping","Figma"],              spec: ["Mobile UX","Design Systems"] },
  { name: "James Wilson",      role: "Product Manager",      cnic: "4210354321098", sal: 8000, gen: "Male",   img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGR-7KzB18GmbpFkcXIIJMyEUWFY775MUOd3in9mdiC64fEbW2izZElN0zMWzbAIMH_NbyLfMBMSbHw9m2538zMnueCnlKR0jPgxCp1uo9XxImLja5La8-39M4tkLlG4qH0R_wKpN1p-GDAFAugZCssgOZi2wTYqSfw3feLrw21TKm4rFZPPGWzQRyt6qt6cHUcnXNo5WvVJdiov02YET-3LvBWRQzTe3eu4wG-XzRXj1rfZ6xxMjaoyVN_XrVjQVLTPfhNp7ovBw6",  lang: ["English"],             task: ["Roadmap Planning","Stakeholder Mgmt"],  cap: ["Strategic Thinking","Agile"],       spec: ["Product Strategy"] },
  { name: "Elena Rodriguez",   role: "Data Analyst",         cnic: "4210476543210", sal: 3300, gen: "Female", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVk__1uWGE-_CAuEpIOAUKhi20HsF9WuN6Qx7TL9YYdcJVifaE1Jc_jTe-zfvjWK6DYPwnbK17Wikld6ZBfkESaJ_7FS3OQdmeM-mQgsmySemoJrnvtmCU7jz-XIdRCCIiPVRUvxEwVOP6MFN8q1Z26T5LgcEa8cl24Y48c7cblxVTXtI651wkF7h6ePBkaFDUdtMgDNPdPOc3IM4_3p9rLjIKyoyt6Tgz1_G49HYO9UwrDN9QJkykxr26tYr4Z7HtBles9yVUY4x", lang: ["English","Spanish"],   task: ["Data Analysis","Report Generation"],   cap: ["SQL","Python"],                    spec: ["Business Intelligence"] },
  { name: "Michael Chang",     role: "Sous Chef",            cnic: "4210565432109", sal: 4800, gen: "Male",   img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLTNppDitBL-LUEeaxBCqc0mH7i9QNK5oXjv0WIk341piN1t1jbHb_IiDU04tNJlovS2b8M761eF09xTFFthfLHinU7eKP65ofovLvikYSEaSPFseO02sWYQYARhRoo15vG0yN0jewg5gcaa4fxf_-cBnElNRwmC-4YfqjKa4FVucFFkp18q_EIMojqUWDtPykXs7ZeaGL_RSlhAx2Jywp_otPpLFm3B-H1sXV4W6-Cc3RxMQQeW07COmY1OMZQf-BYyLCBrNKo",  lang: ["English","Cantonese"], task: ["Meal Preparation","Inventory Mgmt"],   cap: ["Culinary Arts","Kitchen Mgmt"],     spec: ["Asian Cuisine"] },
  { name: "Olivia Smith",      role: "Restaurant Manager",   cnic: "4210687654321", sal: 6000, gen: "Female", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",  lang: ["English","French"],    task: ["Staff Management","Customer Service"], cap: ["Leadership","Operations"],          spec: ["Hospitality Management"] },
] as const;

const STATUS_SEEDS = [
  { att: 80,  perf: 60, sts: null,     sin: "09:15 AM", sout: null       },
  { att: 80,  perf: 80, sts: null,     sin: "07:50 AM", sout: "04:30 PM" },
  { att: 80,  perf: 60, sts: null,     sin: "07:55 AM", sout: "06:20 PM" },
  { att: 90,  perf: 80, sts: "leave",  sin: null,       sout: null       },
  { att: 95,  perf: 85, sts: "unauth", sin: null,       sout: null       },
  { att: 100, perf: 90, sts: null,     sin: "07:30 AM", sout: "06:30 PM" },
] as const;

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(private readonly repo: EmployeesRepository) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────
  async onModuleInit() {
    await this.initTables();
    await this.seedIfEmpty();
  }

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
          id         SERIAL PRIMARY KEY,
          eid        INTEGER NOT NULL REFERENCES employee_profile(id) ON DELETE CASCADE,
          att        INTEGER NOT NULL DEFAULT 100,
          perf       INTEGER NOT NULL DEFAULT 100,
          sts        VARCHAR(10),
          sin        VARCHAR(20),
          sout       VARCHAR(20),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_emp_status_eid ON employee_status(eid)`,
      );
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
        sin: s.sin as string | null, sout: s.sout as string | null,
      });
    }
  }

  // ── Business logic ────────────────────────────────────────────────────
  async getAll(): Promise<EmployeeCard[]> {
    const rows = await this.repo.findAll();
    return rows.map(r => toEmployeeCard({
      id:   r.id,
      name: r.name,
      role: r.role,
      sal:  r.sal ?? null,
      img:  r.img ?? null,
      att:  r.att ?? null,
      perf: r.perf ?? null,
      sts:  r.sts ?? null,
      sin:  r.sin ?? null,
      sout: r.sout ?? null,
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
      sts: row.sts ?? null, sin: row.sin ?? null, sout: row.sout ?? null,
    });
  }

  async updateStatus(eid: number, dto: UpdateStatusDto): Promise<EmployeeCard> {
    const rows  = await this.repo.findAll();
    const exists = rows.find(r => r.id === eid);
    if (!exists) throw new NotFoundException(`Employee #${eid} not found`);

    const patch: Record<string, unknown> = {};
    if ("sts"  in dto) patch["sts"]  = dto.sts  ?? null;
    if ("sin"  in dto) patch["sin"]  = dto.sin  ?? null;
    if ("sout" in dto) patch["sout"] = dto.sout ?? null;
    if ("att"  in dto) patch["att"]  = dto.att;
    if ("perf" in dto) patch["perf"] = dto.perf;

    await this.repo.patchStatus(eid, patch as Parameters<EmployeesRepository["patchStatus"]>[1]);

    const updated = await this.repo.findAll();
    const row     = updated.find(r => r.id === eid)!;
    return toEmployeeCard({
      id: row.id, name: row.name, role: row.role,
      sal: row.sal ?? null, img: row.img ?? null,
      att: row.att ?? null, perf: row.perf ?? null,
      sts: row.sts ?? null, sin: row.sin ?? null, sout: row.sout ?? null,
    });
  }
}
