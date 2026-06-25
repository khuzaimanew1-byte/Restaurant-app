import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthRepo } from "./auth.repo.js";
import { MailSvc } from "./email.service.js";
import { accTok, refTok, rstTok, verRef, verRst } from "./jwt.util.js";
import type { Purp } from "../core/dto.js";

interface TryRec {
  count: number;
  lock: number | null;
}

interface TokRes {
  token: string;
  refreshToken: string;
}

@Injectable()
export class AuthSvc {
  private readonly trys = new Map<string, TryRec>();

  constructor(
    private readonly mail: MailSvc,
    private readonly repo: AuthRepo,
  ) {}

  private norm(email: string): string {
    return email.trim().toLowerCase();
  }

  private need(email: string): string {
    const got = this.norm(email);
    const adm = process.env["ADMIN_GMAIL"]?.trim().toLowerCase();
    if (!adm || got !== adm) {
      throw new HttpException("Email not registered", HttpStatus.NOT_FOUND);
    }
    return got;
  }

  private cool(email: string): void {
    const rec = this.trys.get(email);
    if (!rec?.lock || Date.now() >= rec.lock) return;
    const mins = Math.ceil((rec.lock - Date.now()) / 60000);
    throw new HttpException(`Too many attempts. Try again in ${mins} min`, HttpStatus.TOO_MANY_REQUESTS);
  }

  private fail(email: string): void {
    const rec = this.trys.get(email) ?? { count: 0, lock: null };
    rec.count += 1;
    if (rec.count >= 5) {
      rec.lock = Date.now() + 30 * 60000;
      rec.count = 0;
    }
    this.trys.set(email, rec);
  }

  private clear(email: string): void {
    this.trys.delete(email);
  }

  private toks(id: number, email: string): TokRes {
    const sub = String(id);
    return {
      token: accTok({ sub, email }),
      refreshToken: refTok({ sub, email }),
    };
  }

  async check(email: string): Promise<{ scene: "first-login" | "existing" }> {
    const adm = await this.repo.adm(this.need(email));
    return { scene: adm?.pwd ? "existing" : "first-login" };
  }

  async sendOtp(email: string, purp: Purp): Promise<{ success: true; expiresAt: number }> {
    const admEmail = this.need(email);
    this.cool(admEmail);

    const now = new Date();
    const active = await this.repo.live(admEmail, purp, now);
    if (active) {
      const left = Math.ceil((active.expiresAt.getTime() - Date.now()) / 1000);
      const mins = Math.floor(left / 60);
      const secs = left % 60;
      const wait = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      throw new HttpException(
        `An OTP was already sent. Please wait ${wait} before requesting a new one.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const adm = await this.repo.adm(admEmail);
    if (purp === "reset" && !adm?.pwd) {
      throw new HttpException(
        "No password set yet. Complete your account setup first.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const otp = String(randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await this.repo.gcOtp(now);
    const id = await this.repo.addOtp(admEmail, otpHash, purp, expiresAt);
    try {
      await this.mail.sendOtp(admEmail, otp, purp);
    } catch (err) {
      await this.repo.delOtp(id);
      throw err;
    }
    return { success: true, expiresAt: expiresAt.getTime() };
  }

  async signIn(email: string, password: string): Promise<TokRes> {
    const admEmail = this.need(email);
    this.cool(admEmail);

    const adm = await this.repo.adm(admEmail);
    if (!adm?.pwd) {
      throw new HttpException(
        "Account setup incomplete. Sign in to complete setup first.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const match = await bcrypt.compare(password, adm.pwd);
    if (!match) {
      this.fail(admEmail);
      throw new UnauthorizedException("Incorrect password");
    }

    this.clear(admEmail);
    return this.toks(adm.id, adm.email);
  }

  async verifyOtp(
    email: string,
    otp: string,
    purp: Purp,
    password?: string,
  ): Promise<{ token?: string; refreshToken?: string; resetToken?: string; success: boolean }> {
    const admEmail = this.need(email);
    this.cool(admEmail);

    const now = new Date();
    const ses = await this.repo.live(admEmail, purp, now);
    if (!ses) {
      this.fail(admEmail);
      throw new UnauthorizedException("Invalid or expired code. Please request a new one.");
    }

    const claim = await this.repo.clmOtp(ses.id, now);
    if (!claim) {
      this.fail(admEmail);
      throw new UnauthorizedException("Invalid or expired code. Please request a new one.");
    }

    const match = await bcrypt.compare(otp, ses.otpHash);
    if (!match) {
      await this.repo.relOtp(ses.id);
      this.fail(admEmail);
      throw new UnauthorizedException("Incorrect code. Check your email and try again.");
    }

    this.clear(admEmail);
    await this.repo.delOtp(ses.id);

    if (purp === "login" && password) {
      const hash = await bcrypt.hash(password, 12);
      const adm = await this.repo.setPwd(admEmail, hash);
      if (!adm) throw new UnauthorizedException("Email not registered");
      return { success: true, ...this.toks(adm.id, adm.email) };
    }

    return { success: true, resetToken: rstTok(admEmail) };
  }

  async resetPassword(
    resetToken: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ success: true }> {
    if (password !== confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    let email: string;
    try {
      email = verRst(resetToken).email;
    } catch {
      throw new UnauthorizedException("Reset session expired. Please start over.");
    }

    const admEmail = this.need(email);
    const hash = await bcrypt.hash(password, 12);
    await this.repo.setPwd(admEmail, hash);
    return { success: true };
  }

  async refresh(refreshToken: string): Promise<TokRes> {
    try {
      const pay = verRef(refreshToken);
      const adm = await this.repo.adm(pay.email);
      if (!adm || String(adm.id) !== pay.sub) throw new Error("Invalid refresh");
      return this.toks(adm.id, adm.email);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async resendOtp(email: string, purp: Purp): Promise<{ success: true; expiresAt: number }> {
    this.need(email);
    return this.sendOtp(email, purp);
  }
}

