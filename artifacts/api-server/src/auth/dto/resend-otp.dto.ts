import { IsEmail, IsIn } from "class-validator";

export class ResendOtpDto {
  @IsEmail()
  email!: string;

  @IsIn(["login", "reset"])
  purpose!: "login" | "reset";
}
