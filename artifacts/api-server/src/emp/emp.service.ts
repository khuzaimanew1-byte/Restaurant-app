import { Injectable, NotFoundException } from "@nestjs/common";
import { EmpRepo } from "./emp.repo.js";
import { empCard, fullProf } from "./emp.vm.js";
import type { StPatch } from "./emp.repo.js";
import type { NewEmpDto, UpdStDto, UpdProfDto } from "./dto/emp.dto.js";
import type { EmpCard, EmpProf, Shift } from "./emp.vm.js";

function shf(val: UpdStDto["shift"]): Shift {
  if (!val) return null;
  const out: Exclude<Shift, null> = {};
  if (val.in) out.in = val.in;
  if (val.out) out.out = val.out;
  return Object.keys(out).length ? out : null;
}

@Injectable()
export class EmpSvc {
  constructor(private readonly repo: EmpRepo) {}

  async getAll(page = 1, size = 20): Promise<EmpCard[]> {
    const pg = Math.max(1, page);
    const sz = Math.min(100, Math.max(1, size));
    const rows = await this.repo.page(pg, sz);
    return rows.map(empCard);
  }

  async getOne(id: number): Promise<EmpProf> {
    const row = await this.repo.fullById(id);
    if (!row) throw new NotFoundException(`Employee #${id} not found`);
    return fullProf(row);
  }

  async create(dto: NewEmpDto): Promise<EmpCard> {
    const prof = await this.repo.insProf(dto);
    const shiftPatch: StPatch = {};
    if (dto.shiftIn || dto.shiftOut) {
      shiftPatch.shift = {
        ...(dto.shiftIn  ? { in:  dto.shiftIn  } : {}),
        ...(dto.shiftOut ? { out: dto.shiftOut } : {}),
      };
    }
    await this.repo.insSt(prof.id, shiftPatch);
    const row = await this.repo.byId(prof.id);
    if (!row) throw new NotFoundException("Created employee not found");
    return empCard(row);
  }

  async updateStatus(eid: number, dto: UpdStDto): Promise<EmpCard> {
    const old = await this.repo.byId(eid);
    if (!old) throw new NotFoundException(`Employee #${eid} not found`);
    const patch: StPatch = {};
    if ("sts"   in dto) patch.sts   = dto.sts  ?? null;
    if ("shift" in dto) patch.shift = shf(dto.shift);
    if ("att"   in dto) patch.att   = dto.att;
    if ("perf"  in dto) patch.perf  = dto.perf;
    const ok = await this.repo.updSt(eid, patch);
    if (!ok) await this.repo.insSt(eid, patch);
    const row = await this.repo.byId(eid);
    if (!row) throw new NotFoundException(`Employee #${eid} not found`);
    return empCard(row);
  }

  async updateProfile(id: number, dto: UpdProfDto): Promise<EmpProf> {
    const exists = await this.repo.byId(id);
    if (!exists) throw new NotFoundException(`Employee #${id} not found`);
    await this.repo.updProf(id, dto);
    const row = await this.repo.fullById(id);
    if (!row) throw new NotFoundException(`Employee #${id} not found`);
    return fullProf(row);
  }
}
