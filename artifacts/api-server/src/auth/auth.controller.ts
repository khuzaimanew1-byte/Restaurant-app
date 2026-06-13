import {
  Body, Controller, Delete, Get, Inject, Post, Req, UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { AuthService }    from "./auth.service.js";
import { AuthGuard }      from "./auth.guard.js";
import { CheckDto }         from "./dto/check.dto.js";
import { SendOtpDto }       from "./dto/send-otp.dto.js";
import { SignInDto }        from "./dto/sign-in.dto.js";
import { VerifyOtpDto }     from "./dto/verify-otp.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { ResendOtpDto }     from "./dto/resend-otp.dto.js";
import type { JwtPayload }  from "./jwt.util.js";

interface AuthReq { admin: JwtPayload; }

@Controller("api/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("check")
  check(@Body() dto: CheckDto) {
    return this.auth.check(dto.email);
  }

  @Post("send-otp")
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.email, dto.purpose);
  }

  @Post("sign-in")
  signIn(@Body() dto: SignInDto) {
    return this.auth.signIn(dto.email, dto.password);
  }

  @Post("verify-otp")
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.email, dto.otp, dto.purpose, dto.password);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.resetToken, dto.password);
  }

  @Post("resend-otp")
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendOtp(dto.email, dto.purpose);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @SkipThrottle()
  me(@Req() req: AuthReq) {
    return { email: req.admin.email };
  }

  @Delete("session")
  @UseGuards(AuthGuard)
  @SkipThrottle()
  logout() {
    return { success: true };
  }
}
