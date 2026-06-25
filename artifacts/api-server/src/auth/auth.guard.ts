import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { verAcc } from "./jwt.util.js";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      admin?: unknown;
    }>();
    const raw = req.headers["authorization"];
    const auth = Array.isArray(raw) ? raw[0] : raw;
    const pre = "Bearer ";
    if (!auth?.startsWith(pre)) throw new UnauthorizedException("Missing token");
    try {
      req.admin = verAcc(auth.slice(pre.length));
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
