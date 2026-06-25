import { Injectable, NotFoundException } from "@nestjs/common";
import { EmpRepo } from "./emp.repo.js";
import { empCard } from "./emp.vm.js";
import type { StPatch } from "./emp.repo.js";
import type { NewEmpDto, UpdStDto } from "./dto/emp.dto.js";
import type { EmpCard, Shift } from "./emp.vm.js";

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

  async create(dto: NewEmpDto): Promise<EmpCard> {
    const prof = await this.repo.insProf(dto);
    await this.repo.insSt(prof.id);
    const row = await this.repo.byId(prof.id);
    if (!row) throw new NotFoundException("Created employee not found");
    return empCard(row);
  }

  async updateStatus(eid: number, dto: UpdStDto): Promise<EmpCard> {
    const old = await this.repo.byId(eid);
    if (!old) throw new NotFoundException(`Employee #${eid} not found`);

    const patch: StPatch = {};
    if ("sts" in dto) patch.sts = dto.sts ?? null;
    if ("shift" in dto) patch.shift = shf(dto.shift);
    if ("att" in dto) patch.att = dto.att;
    if ("perf" in dto) patch.perf = dto.perf;

    const ok = await this.repo.updSt(eid, patch);
    if (!ok) await this.repo.insSt(eid, patch);

    const row = await this.repo.byId(eid);
    if (!row) throw new NotFoundException(`Employee #${eid} not found`);
    return empCard(row);
  }
}
