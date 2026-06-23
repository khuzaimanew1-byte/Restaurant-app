import {
  Controller, Get, Post, Patch, Param, Body, ParseIntPipe,
  UseGuards, ValidationPipe,
} from "@nestjs/common";
import { AuthGuard }       from "../auth/auth.guard.js";
import { EmployeesService } from "./employees.service.js";
import { CreateEmployeeDto } from "./dto/create-employee.dto.js";
import { UpdateStatusDto }   from "./dto/update-status.dto.js";

@Controller("api/employees")
@UseGuards(AuthGuard)
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  /** GET /api/employees — list all employees as view-model cards */
  @Get()
  async getAll() {
    return this.svc.getAll();
  }

  /** POST /api/employees — create employee (profile + status row) */
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateEmployeeDto,
  ) {
    return this.svc.create(dto);
  }

  /** PATCH /api/employees/:id/status — update attendance status / times */
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateStatusDto,
  ) {
    return this.svc.updateStatus(id, dto);
  }
}
