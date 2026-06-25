import { Module } from "@nestjs/common";
import { HlthCtl } from "./hlth.controller.js";

@Module({
  controllers: [HlthCtl],
})
export class HlthMod {}
