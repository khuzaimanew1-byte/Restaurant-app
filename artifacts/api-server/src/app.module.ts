import "reflect-metadata";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { HealthModule }     from "./health/health.module.js";
import { AuthModule }       from "./auth/auth.module.js";
import { EmployeesModule }  from "./employees/employees.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
        transport: process.env["NODE_ENV"] !== "production"
          ? {
              target:  "pino-pretty",
              options: { colorize: true, singleLine: true, ignore: "pid,hostname" },
            }
          : undefined,
        autoLogging: true,
        redact:      ["req.headers.authorization"],
      },
    }),

    ThrottlerModule.forRoot([
      { name: "default", ttl: 15 * 60 * 1000, limit: 10 },
    ]),

    HealthModule,
    AuthModule,
    EmployeesModule,
  ],
})
export class AppModule {}
