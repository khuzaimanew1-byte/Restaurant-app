import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { arr, trim } from "../../core/dto.js";

export class ExpDto {
  @IsOptional() @IsInt() @Min(0) @Max(99) y?: number;
  @IsOptional() @IsInt() @Min(0) @Max(12) m?: number;
}

export class NewEmpDto {
  @trim @IsString() @IsNotEmpty() @Length(1, 200) name!: string;
  @trim @IsString() @IsNotEmpty() @Length(1, 100) role!: string;
  @trim @IsString() @IsNotEmpty() @Length(13, 15) cnic!: string;
  @IsOptional() @IsInt() @Min(0) sal?: number;
  @trim @IsOptional() @IsString() @Length(0, 20) gen?: string;
  @trim @IsOptional() @IsEmail() email?: string;
  @trim @IsOptional() @IsString() @Length(0, 20) dob?: string;
  @trim @IsOptional() @IsString() @Length(0, 30) ph?: string;
  @trim @IsOptional() @IsString() @Length(0, 20) hire?: string;
  @trim @IsOptional() @IsString() addr?: string;
  @trim @IsOptional() @IsString() img?: string;
  @arr @IsOptional() @IsArray() @IsString({ each: true }) lang?: string[];
  @arr @IsOptional() @IsArray() @IsString({ each: true }) task?: string[];
  @arr @IsOptional() @IsArray() @IsString({ each: true }) cap?: string[];
  @arr @IsOptional() @IsArray() @IsString({ each: true }) spec?: string[];
  @IsOptional() @ValidateNested() @Type(() => ExpDto) exp?: ExpDto;
  @trim @IsOptional() @IsString() shiftIn?: string;
  @trim @IsOptional() @IsString() shiftOut?: string;
}

export class UpdProfDto {
  @trim @IsOptional() @IsString() @IsNotEmpty() @Length(1, 200) name?: string;
  @trim @IsOptional() @IsString() @IsNotEmpty() @Length(1, 100) role?: string;
  @trim @IsOptional() @IsString() @IsNotEmpty() @Length(13, 15) cnic?: string;
  @IsOptional() @IsInt() @Min(0) sal?: number;
  @trim @IsOptional() @IsString() @Length(0, 20) gen?: string;
  @trim @IsOptional() @IsEmail() email?: string;
  @trim @IsOptional() @IsString() @Length(0, 20) dob?: string;
  @trim @IsOptional() @IsString() @Length(0, 30) ph?: string;
  @trim @IsOptional() @IsString() @Length(0, 20) hire?: string;
  @trim @IsOptional() @IsString() addr?: string;
  @trim @IsOptional() @IsString() img?: string;
  @arr @IsOptional() @IsArray() @IsString({ each: true }) lang?: string[];
  @arr @IsOptional() @IsArray() @IsString({ each: true }) task?: string[];
  @arr @IsOptional() @IsArray() @IsString({ each: true }) cap?: string[];
  @arr @IsOptional() @IsArray() @IsString({ each: true }) spec?: string[];
  @IsOptional() @ValidateNested() @Type(() => ExpDto) exp?: ExpDto;
}

class ShiftDto {
  @trim @IsOptional() @IsString() in?: string | null;
  @trim @IsOptional() @IsString() out?: string | null;
}

export class UpdStDto {
  @IsOptional() @IsIn(["leave", "unauth", "half", "late", null]) sts?: "leave" | "unauth" | "half" | "late" | null;
  @IsOptional() @ValidateNested() @Type(() => ShiftDto) shift?: ShiftDto | null;
  @IsOptional() @IsInt() @Min(0) @Max(100) att?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) perf?: number;
}
