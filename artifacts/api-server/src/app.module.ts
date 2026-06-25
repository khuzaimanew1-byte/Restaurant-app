import "reflect-metadata";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { HlthMod } from "./hlth/hlth.module.js";
import { AuthMod } from "./auth/auth.module.js";
import { EmpMod } from "./emp/emp.module.js";
import { DbBoot } from "./db/boot.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
        transport: process.env["NODE_ENV"] !== "production"
          ? {
              target: "pino-pretty",
              options: { colorize: true, singleLine: true, ignore: "pid,hostname" },
            }
          : undefined,
        autoLogging: true,
        redact: [
          "req.headers.authorization",
          "req.body.password",
          "req.body.confirmPassword",
          "req.body.otp",
          "req.body.resetToken",
          "req.body.refreshToken",
        ],
      },
    }),

    ThrottlerModule.forRoot([
      { name: "default", ttl: 15 * 60 * 1000, limit: 120 },
    ]),

    HlthMod,
    AuthMod,
    EmpMod,
  ],
  providers: [
    DbBoot,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
