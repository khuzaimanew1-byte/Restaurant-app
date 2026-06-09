import { IsEmail, IsString, Length, MinLength, Matches } from "class-validator";

export class ResetPasswordDto {
  @IsEmail({}, { message: "Enter a valid email address." })
  email!: string;

  @IsString()
  @Length(6, 6, { message: "OTP must be exactly 6 digits." })
  otp!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @Matches(/[0-9]/, { message: "Password must contain at least one number." })
  @Matches(/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/, {
    message: "Password must contain at least one special character.",
  })
  newPassword!: string;

  @IsString()
  @MinLength(8, { message: "Confirm password must be at least 8 characters." })
  confirmPassword!: string;
}
