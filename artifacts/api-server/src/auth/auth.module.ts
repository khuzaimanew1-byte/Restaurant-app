import { Module } from "@nestjs/common";
import { AuthController }    from "./auth.controller.js";
import { AuthService }       from "./auth.service.js";
import { AuthGuard }         from "./auth.guard.js";
import { CustomThrottlerGuard } from "./throttler.guard.js";
import { UsersModule }       from "../users/users.module.js";
import { OtpModule }         from "../otp/otp.module.js";
import { EmailModule }       from "../email/email.module.js";

@Module({
  imports:     [UsersModule, OtpModule, EmailModule],
  controllers: [AuthController],
  providers:   [AuthService, AuthGuard, CustomThrottlerGuard],
  exports:     [AuthService],
})
export class AuthModule {}
