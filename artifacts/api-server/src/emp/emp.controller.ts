import {
  Body, Controller, DefaultValuePipe, Get, Param,
  ParseIntPipe, Patch, Post, Query, UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { EmpSvc } from "./emp.service.js";
import { NewEmpDto, UpdStDto, UpdProfDto } from "./dto/emp.dto.js";

@Controller("api/employees")
@UseGuards(AuthGuard)
export class EmpCtl {
  constructor(private readonly svc: EmpSvc) {}

  @Get()
  async getAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("size", new DefaultValuePipe(20), ParseIntPipe) size: number,
  ) {
    return this.svc.getAll(page, size);
  }

  @Post()
  async create(@Body() dto: NewEmpDto) {
    return this.svc.create(dto);
  }

  /* /:id/status must be registered before /:id to avoid routing conflicts */
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdStDto,
  ) {
    return this.svc.updateStatus(id, dto);
  }

  @Get(":id")
  async getOne(@Param("id", ParseIntPipe) id: number) {
    return this.svc.getOne(id);
  }

  @Patch(":id")
  async updateProfile(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdProfDto,
  ) {
    return this.svc.updateProfile(id, dto);
  }
}
