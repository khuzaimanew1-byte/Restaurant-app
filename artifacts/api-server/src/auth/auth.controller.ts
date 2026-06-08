import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { AuthService }         from "./auth.service.js";
import { AuthGuard, type AuthenticatedRequest } from "./auth.guard.js";
import { CustomThrottlerGuard } from "./throttler.guard.js";
import { LoginDto }             from "./dto/login.dto.js";
import { VerifyOtpDto }         from "./dto/verify-otp.dto.js";
import { ResendOtpDto }         from "./dto/resend-otp.dto.js";

@Controller("api/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  /* ── POST /api/auth/login ─────────────────────────────── */
  @Post("login")
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  /* ── POST /api/auth/verify-otp ────────────────────────── */
  @Post("verify-otp")
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.email, dto.otp, dto.password);
  }

  /* ── POST /api/auth/resend-otp ────────────────────────── */
  @Post("resend-otp")
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendOtp(dto.email);
  }

  /* ── GET /api/auth/otp-status ──────────────────────────── */
  @Get("otp-status")
  @SkipThrottle()
  otpStatus(@Query("email") email: string) {
    return this.auth.getOtpStatus(email ?? "");
  }

  /* ── GET /api/auth/session ─────────────────────────────── */
  @Get("session")
  @UseGuards(AuthGuard)
  @SkipThrottle()
  getSession(@Req() req: AuthenticatedRequest) {
    return this.auth.getSession(req.userSession);
  }

  /* ── DELETE /api/auth/session ──────────────────────────── */
  @Delete("session")
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  deleteSession(@Req() req: Request) {
    const token = String(req.headers["authorization"] ?? "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    return this.auth.deleteSession(token).then(() => ({ success: true }));
  }
}
