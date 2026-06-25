import {
  Body, Controller, Delete, Get, Post, Req, UseGuards,
} from "@nestjs/common";
import { AuthSvc } from "./auth.service.js";
import { AuthGuard } from "./auth.guard.js";
import { MailDto, PurpDto, RefDto, RstDto, SignDto, VerDto } from "./dto.js";
import type { JwtPay } from "./jwt.util.js";

interface AuthReq { admin: JwtPay; }

@Controller("api/auth")
export class AuthController {
  constructor(private readonly auth: AuthSvc) {}

  @Post("check")
  check(@Body() dto: MailDto) {
    return this.auth.check(dto.email);
  }

  @Post("send-otp")
  sendOtp(@Body() dto: PurpDto) {
    return this.auth.sendOtp(dto.email, dto.purpose);
  }

  @Post("sign-in")
  signIn(@Body() dto: SignDto) {
    return this.auth.signIn(dto.email, dto.password);
  }

  @Post("verify-otp")
  verifyOtp(@Body() dto: VerDto) {
    return this.auth.verifyOtp(dto.email, dto.otp, dto.purpose, dto.password);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: RstDto) {
    return this.auth.resetPassword(dto.resetToken, dto.password, dto.confirmPassword);
  }

  @Post("refresh")
  refresh(@Body() dto: RefDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("resend-otp")
  resendOtp(@Body() dto: PurpDto) {
    return this.auth.resendOtp(dto.email, dto.purpose);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() req: AuthReq) {
    return { email: req.admin.email };
  }

  @Delete("session")
  @UseGuards(AuthGuard)
  logout() {
    return { success: true };
  }
}
