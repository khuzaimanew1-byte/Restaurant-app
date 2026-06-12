import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { verifyToken } from "./jwt.util.js";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string>; admin?: unknown }>();
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) throw new UnauthorizedException("Missing token");
    try {
      req.admin = verifyToken(auth.slice(7));
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
