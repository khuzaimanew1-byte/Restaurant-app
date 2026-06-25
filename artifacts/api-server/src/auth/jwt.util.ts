import jwt from "jsonwebtoken";
import type { JwtPayload as LibPay, SignOptions } from "jsonwebtoken";

type TokKind = "access" | "refresh" | "reset_verified";

export interface JwtPay {
  sub: string;
  email: string;
  purpose: TokKind;
}

function sec(): string {
  const val = process.env["JWT_SESSION"];
  if (!val) throw new Error("JWT_SESSION env var not set");
  return val;
}

function sign(payload: JwtPay, expiresIn: SignOptions["expiresIn"]): string {
  return jwt.sign(payload, sec(), { expiresIn });
}

function read(token: string): JwtPay {
  const raw = jwt.verify(token, sec());
  if (typeof raw === "string") throw new Error("Invalid token");
  const pay = raw as LibPay;
  if (
    typeof pay.sub !== "string"
    || typeof pay.email !== "string"
    || (pay.purpose !== "access" && pay.purpose !== "refresh" && pay.purpose !== "reset_verified")
  ) {
    throw new Error("Invalid token");
  }
  return {
    sub: pay.sub,
    email: pay.email,
    purpose: pay.purpose,
  };
}

function need(token: string, purpose: TokKind): JwtPay {
  const pay = read(token);
  if (pay.purpose !== purpose) throw new Error("Invalid token purpose");
  return pay;
}

export function accTok(payload: Pick<JwtPay, "sub" | "email">): string {
  return sign({ ...payload, purpose: "access" }, "15m");
}

export function refTok(payload: Pick<JwtPay, "sub" | "email">): string {
  return sign({ ...payload, purpose: "refresh" }, "7d");
}

export function rstTok(email: string): string {
  return sign({ sub: email, email, purpose: "reset_verified" }, "15m");
}

export function verAcc(token: string): JwtPay {
  return need(token, "access");
}

export function verRef(token: string): JwtPay {
  return need(token, "refresh");
}

export function verRst(token: string): JwtPay {
  return need(token, "reset_verified");
}

