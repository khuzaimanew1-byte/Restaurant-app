import { Module } from "@nestjs/common";
import { EmpCtl } from "./emp.controller.js";
import { EmpRepo } from "./emp.repo.js";
import { EmpSvc } from "./emp.service.js";

@Module({
  controllers: [EmpCtl],
  providers: [EmpSvc, EmpRepo],
  exports: [EmpSvc],
})
export class EmpMod {}
