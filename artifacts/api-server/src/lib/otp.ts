import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

export const OTP_TTL_SECONDS = 300;

export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
