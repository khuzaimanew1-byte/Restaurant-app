import jwt from "jsonwebtoken";

const SECRET = process.env["JWT_SESSION"] ?? "";
const EXPIRY  = "7d";

export interface JwtPayload { sub: string; email: string; }

export function signToken(payload: JwtPayload): string {
  if (!SECRET) throw new Error("JWT_SESSION env var not set");
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  if (!SECRET) throw new Error("JWT_SESSION env var not set");
  return jwt.verify(token, SECRET) as JwtPayload;
}
