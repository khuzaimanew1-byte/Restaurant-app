import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsArray, Min, Max,
  IsEmail, ValidateNested, Length,
} from "class-validator";
import { Type } from "class-transformer";

export class ExpDto {
  @IsOptional() @IsInt() @Min(0) @Max(99)
  y?: number;

  @IsOptional() @IsInt() @Min(0) @Max(12)
  m?: number;
}

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() @Length(1, 200)
  name!: string;

  @IsString() @IsNotEmpty() @Length(1, 100)
  role!: string;

  @IsString() @IsNotEmpty() @Length(13, 15)
  cnic!: string;

  @IsOptional() @IsInt() @Min(0)
  sal?: number;

  @IsOptional() @IsString() @Length(0, 20)
  gen?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  dob?: string;

  @IsOptional() @IsString()
  ph?: string;

  @IsOptional() @IsString()
  hire?: string;

  @IsOptional() @IsString()
  addr?: string;

  @IsOptional() @IsString()
  img?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  lang?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  task?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  cap?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  spec?: string[];

  @IsOptional() @ValidateNested() @Type(() => ExpDto)
  exp?: ExpDto;
}
