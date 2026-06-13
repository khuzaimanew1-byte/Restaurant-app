import jwt from "jsonwebtoken";

const SECRET = process.env["JWT_SESSION"] ?? "";

export interface JwtPayload { sub: string; email: string; purpose?: string; }

export function signToken(payload: JwtPayload, expiresIn: string = "7d"): string {
  if (!SECRET) throw new Error("JWT_SESSION env var not set");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, SECRET, { expiresIn: expiresIn as any });
}

export function signResetToken(email: string): string {
  return signToken({ sub: email, email, purpose: "reset_verified" }, "15m");
}

export function verifyToken(token: string): JwtPayload {
  if (!SECRET) throw new Error("JWT_SESSION env var not set");
  return jwt.verify(token, SECRET) as JwtPayload;
}
