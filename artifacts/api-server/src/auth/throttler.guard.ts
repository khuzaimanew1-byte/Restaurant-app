import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      {
        error:   "RATE_LIMITED",
        message: "Too many requests. Please try again in a few minutes.",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
