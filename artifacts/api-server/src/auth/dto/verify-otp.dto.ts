import { IsEmail, IsString, Length, MinLength } from "class-validator";

export class VerifyOtpDto {
  @IsEmail({}, { message: "Enter a valid email address." })
  email!: string;

  @IsString()
  @Length(6, 6, { message: "OTP must be exactly 6 digits." })
  otp!: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters." })
  password!: string;
}
