import { IsString, IsOptional, IsInt, IsIn, Min, Max } from "class-validator";

const VALID_STS = ["leave", "unauth", "half", null] as const;

export class UpdateStatusDto {
  @IsOptional() @IsIn(["leave", "unauth", "half", null])
  sts?: "leave" | "unauth" | "half" | null;

  @IsOptional() @IsString()
  sin?: string | null;

  @IsOptional() @IsString()
  sout?: string | null;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  att?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  perf?: number;
}
