import { Injectable, OnModuleInit } from "@nestjs/common";
import { pool } from "@workspace/db";
import { profSeeds, stSeeds } from "../emp/seeds.js";

@Injectable()
export class DbBoot implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_config (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS otp_sessions (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp_hash TEXT NOT NULL,
          purpose VARCHAR(20) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS employee_profile (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          role VARCHAR(100) NOT NULL,
          cnic VARCHAR(15) NOT NULL,
          lang TEXT[] NOT NULL DEFAULT '{}',
          hire VARCHAR(20),
          exp JSONB,
          task TEXT[] NOT NULL DEFAULT '{}',
          cap TEXT[] NOT NULL DEFAULT '{}',
          spec TEXT[] NOT NULL DEFAULT '{}',
          gen VARCHAR(20),
          email VARCHAR(255),
          dob VARCHAR(20),
          ph VARCHAR(30),
          addr TEXT,
          sal INTEGER,
          img TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS employee_status (
          id SERIAL PRIMARY KEY,
          eid INTEGER NOT NULL REFERENCES employee_profile(id) ON DELETE CASCADE,
          att INTEGER NOT NULL DEFAULT 100,
          perf INTEGER NOT NULL DEFAULT 100,
          sts VARCHAR(10),
          shift JSONB
        )
      `);
      await client.query("CREATE INDEX IF NOT EXISTS idx_emp_status_eid ON employee_status(eid)");
      await client.query("CREATE INDEX IF NOT EXISTS idx_emp_profile_cnic ON employee_profile(cnic)");
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_otp_live
        ON otp_sessions(email, purpose, expires_at DESC)
      `);
      await client.query("CREATE INDEX IF NOT EXISTS idx_otp_gc ON otp_sessions(expires_at, used_at)");
      await client.query("ALTER TABLE employee_status ADD COLUMN IF NOT EXISTS shift JSONB");
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
      await client.query("ALTER TABLE employee_status DROP COLUMN IF EXISTS sin");
      await client.query("ALTER TABLE employee_status DROP COLUMN IF EXISTS sout");
      await client.query("ALTER TABLE employee_status DROP COLUMN IF EXISTS created_at");
      await client.query("ALTER TABLE employee_status DROP COLUMN IF EXISTS updated_at");

      const adm = process.env["ADMIN_GMAIL"]?.trim().toLowerCase();
      if (adm) {
        await client.query(
          "INSERT INTO admin_config (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
          [adm],
        );
      }

      const count = await client.query<{ n: number }>("SELECT count(*)::int AS n FROM employee_profile");
      if ((count.rows[0]?.n ?? 0) > 0) return;

      for (let i = 0; i < profSeeds.length; i++) {
        const prof = profSeeds[i]!;
        const st = stSeeds[i]!;
        const row = await client.query<{ id: number }>(
          `
            INSERT INTO employee_profile
              (name, role, cnic, sal, gen, img, lang, task, cap, spec)
            VALUES
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
          `,
          [
            prof.name,
            prof.role,
            prof.cnic,
            prof.sal,
            prof.gen,
            prof.img,
            prof.lang,
            prof.task,
            prof.cap,
            prof.spec,
          ],
        );
        await client.query(
          `
            INSERT INTO employee_status (eid, att, perf, sts, shift)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [row.rows[0]!.id, st.att, st.perf, st.sts, st.shift],
        );
      }
    } finally {
      client.release();
    }
  }
}
