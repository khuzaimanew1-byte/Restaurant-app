import { IsString, IsOptional, IsInt, IsIn, Min, Max, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ShiftDto {
  @IsOptional() @IsString()
  in?: string | null;

  @IsOptional() @IsString()
  out?: string | null;
}

export class UpdateStatusDto {
  @IsOptional() @IsIn(["leave", "unauth", "half", "late", null])
  sts?: "leave" | "unauth" | "half" | "late" | null;

  @IsOptional() @ValidateNested() @Type(() => ShiftDto)
  shift?: ShiftDto | null;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  att?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  perf?: number;
}
