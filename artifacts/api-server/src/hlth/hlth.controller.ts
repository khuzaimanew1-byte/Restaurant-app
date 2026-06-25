import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { HlthRes } from "@workspace/api-zod";

@Controller("api")
@SkipThrottle()
export class HlthCtl {
  @Get("healthz")
  healthz() {
    return HlthRes.parse({ status: "ok" });
  }
}
