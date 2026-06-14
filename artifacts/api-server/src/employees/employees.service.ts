import { Injectable, OnModuleInit } from "@nestjs/common";
import { pool } from "@workspace/db";
import type pg from "pg";

const WORK_START_HOUR   = 9;
const WORK_START_MINUTE = 30;

@Injectable()
export class EmployeesService implements OnModuleInit {
  async onModuleInit() {
    const client = await (pool as pg.Pool).connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS employees (
          id                SERIAL PRIMARY KEY,
          name              VARCHAR(255) NOT NULL,
          email             VARCHAR(255) NOT NULL UNIQUE,
          role              VARCHAR(100) NOT NULL DEFAULT 'Staff',
          salary            INTEGER      NOT NULL DEFAULT 0,
          profile_photo     TEXT,
          performance_score INTEGER      NOT NULL DEFAULT 0,
          created_at        TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id            SERIAL  PRIMARY KEY,
          employee_id   INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          date          DATE    NOT NULL,
          check_in_at   TIMESTAMP,
          check_out_at  TIMESTAMP,
          status        VARCHAR(20) NOT NULL DEFAULT 'present'
                        CHECK (status IN ('present','absent','leave')),
          created_at    TIMESTAMP DEFAULT NOW() NOT NULL,
          UNIQUE (employee_id, date)
        )
      `);
    } finally {
      client.release();
    }
  }

  async findAllWithToday() {
    const client = await (pool as pg.Pool).connect();
    try {
      const todayStr = new Date().toISOString().slice(0, 10);

      const { rows } = await client.query<{
        id: number; name: string; email: string; role: string;
        salary: number; profile_photo: string | null;
        performance_score: number; today_status: string | null;
        check_in_at: Date | null; check_out_at: Date | null;
        attendance_percent: string;
      }>(`
        SELECT
          e.id, e.name, e.email, e.role, e.salary,
          e.profile_photo, e.performance_score,
          a.status       AS today_status,
          a.check_in_at,
          a.check_out_at,
          COALESCE(ROUND(
            (SELECT COUNT(*) FILTER (WHERE a2.status = 'present')
               FROM attendance a2
              WHERE a2.employee_id = e.id
                AND a2.date >= CURRENT_DATE - INTERVAL '30 days') * 100.0
            / NULLIF(
              (SELECT COUNT(*) FROM attendance a3
                WHERE a3.employee_id = e.id
                  AND a3.date >= CURRENT_DATE - INTERVAL '30 days'), 0)
          ), 0) AS attendance_percent
        FROM employees e
        LEFT JOIN attendance a
          ON a.employee_id = e.id AND a.date = $1
        ORDER BY e.name ASC
      `, [todayStr]);

      const now = new Date();
      const nowPastStart =
        now.getHours() > WORK_START_HOUR ||
        (now.getHours() === WORK_START_HOUR && now.getMinutes() >= WORK_START_MINUTE);

      return rows.map(r => {
        let effectiveStatus: string;
        let isLate = false;

        if (!r.today_status) {
          effectiveStatus = nowPastStart ? "late" : "not_in";
          isLate = nowPastStart;
        } else if (r.today_status === "present") {
          if (r.check_in_at) {
            const ci = new Date(r.check_in_at);
            isLate =
              ci.getHours() > WORK_START_HOUR ||
              (ci.getHours() === WORK_START_HOUR && ci.getMinutes() >= WORK_START_MINUTE);
          }
          effectiveStatus =
            r.check_in_at && r.check_out_at ? "present_done"
            : r.check_in_at                 ? "present_working"
            : "not_in";
        } else {
          effectiveStatus = r.today_status;
        }

        return {
          id:               r.id,
          name:             r.name,
          email:            r.email,
          role:             r.role,
          salary:           r.salary,
          profilePhoto:     r.profile_photo,
          performanceScore: r.performance_score,
          attendancePercent: Number(r.attendance_percent),
          today: {
            effectiveStatus,
            checkInAt:  r.check_in_at  ? r.check_in_at.toISOString()  : null,
            checkOutAt: r.check_out_at ? r.check_out_at.toISOString() : null,
            isLate,
          },
        };
      });
    } finally {
      client.release();
    }
  }
}
