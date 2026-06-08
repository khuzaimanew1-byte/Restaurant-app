import { Injectable } from "@nestjs/common";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

export const OTP_TTL_SECONDS = 300;

@Injectable()
export class OtpService {
  generateOtp(): string {
    return String(randomInt(100_000, 1_000_000));
  }

  async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  async verifyOtp(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
