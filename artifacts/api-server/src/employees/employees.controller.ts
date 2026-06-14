import { Controller, Get, UseGuards } from "@nestjs/common";
import { EmployeesService } from "./employees.service.js";
import { AuthGuard } from "../auth/auth.guard.js";

@Controller("api/employees")
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.svc.findAllWithToday();
  }
}
