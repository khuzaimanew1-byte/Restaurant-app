import { IsEmail, IsIn, IsOptional, IsString, Length } from "class-validator";
import { purps, pwd, trim } from "../core/dto.js";
import type { Purp } from "../core/dto.js";

export class MailDto {
  @trim
  @IsEmail()
  email!: string;
}

export class PurpDto extends MailDto {
  @IsIn(purps)
  purpose!: Purp;
}

export class SignDto extends MailDto {
  @pwd
  password!: string;
}

export class VerDto extends PurpDto {
  @trim
  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsOptional()
  @pwd
  password?: string;
}

export class RstDto {
  @trim
  @IsString()
  resetToken!: string;

  @pwd
  password!: string;

  @pwd
  confirmPassword!: string;
}

export class RefDto {
  @trim
  @IsString()
  refreshToken!: string;
}

