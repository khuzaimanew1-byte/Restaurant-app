import { IsString, MinLength, Matches } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  resetToken!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[0-9]/, { message: "Password must contain at least one number" })
  @Matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, { message: "Password must contain at least one special character" })
  password!: string;

  @IsString()
  confirmPassword!: string;
}
