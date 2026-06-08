import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import type { Request } from "express";
import { UsersRepository } from "../users/users.repository.js";
import type { UserSession } from "@workspace/db";

export interface AuthenticatedRequest extends Request {
  userSession: UserSession;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(UsersRepository) private readonly users: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req   = context.switchToHttp().getRequest<Request>();
    const token = String(req.headers["authorization"] ?? "")
      .replace(/^Bearer\s+/i, "")
      .trim();

    if (!token) {
      throw new HttpException(
        { error: "UNAUTHORIZED", message: "No session token provided." },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session = await this.users.findUserSession(token);
    if (!session) {
      throw new HttpException(
        { error: "SESSION_INVALID", message: "Session expired or invalid. Please sign in again." },
        HttpStatus.UNAUTHORIZED,
      );
    }

    (req as AuthenticatedRequest).userSession = session;
    return true;
  }
}
