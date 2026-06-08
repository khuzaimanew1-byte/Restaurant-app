import { Controller, Get } from "@nestjs/common";
import { SkipThrottle }   from "@nestjs/throttler";
import { HealthCheckResponse } from "@workspace/api-zod";

@Controller("api")
@SkipThrottle()
export class HealthController {
  @Get("healthz")
  healthz() {
    return HealthCheckResponse.parse({ status: "ok" });
  }
}
